import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, and, sql } from "drizzle-orm";
import type { ScanJob, Municipality, PaginatedResponse } from "@observatoire360/shared";
import { SCAN_FREQUENCIES, SCAN_JOB_STATUSES } from "@observatoire360/shared";
import type { ScanFrequency, ScanJobStatus } from "@observatoire360/shared";
import { scanJobs, municipalities } from "../db/schema.js";
import type { Bindings } from "../types.js";
import type { AuthVariables } from "../middleware/auth.js";
import { ulid } from "../lib/ulid.js";

type AppEnv = { Bindings: Bindings; Variables: AuthVariables };

const scans = new Hono<AppEnv>();

// ---------------------------------------------------------------------------
// Row → domain type mappers
// ---------------------------------------------------------------------------

function rowToScanJob(row: typeof scanJobs.$inferSelect): ScanJob {
    return {
        id: row.id,
        municipalityId: row.municipalityId,
        status: row.status as ScanJobStatus,
        imageryDate: row.imageryDate ?? null,
        beforeImageKey: row.beforeImageKey ?? null,
        afterImageKey: row.afterImageKey ?? null,
        detectionsCount: row.detectionsCount ?? 0,
        error: row.error ?? null,
        startedAt: row.startedAt ?? null,
        completedAt: row.completedAt ?? null,
        startDate: row.startDate ?? null,
        endDate: row.endDate ?? null,
        latitude: row.latitude ?? null,
        longitude: row.longitude ?? null,
        address: row.address ?? null,
        createdAt: row.createdAt,
    };
}

function rowToMunicipality(row: typeof municipalities.$inferSelect): Municipality {
    return {
        id: row.id,
        name: row.name,
        code: row.code,
        region: row.region ?? null,
        bounds: row.bounds ? (JSON.parse(row.bounds) as Municipality["bounds"]) : null,
        scanFrequency: row.scanFrequency as ScanFrequency,
        scanEnabled: Boolean(row.scanEnabled),
        lastScanAt: row.lastScanAt ?? null,
        createdAt: row.createdAt,
    };
}

// ---------------------------------------------------------------------------
// GET / — List scan jobs for municipality
// ---------------------------------------------------------------------------

scans.get("/", async (c) => {
    const municipalityId = c.get("municipalityId");

    const pageRaw = parseInt(c.req.query("page") ?? "1", 10);
    const pageSizeRaw = parseInt(c.req.query("pageSize") ?? "20", 10);
    const page = isNaN(pageRaw) || pageRaw < 1 ? 1 : pageRaw;
    const pageSize = Math.min(isNaN(pageSizeRaw) || pageSizeRaw < 1 ? 20 : pageSizeRaw, 100);
    const statusFilter = c.req.query("status");

    if (statusFilter && !SCAN_JOB_STATUSES.includes(statusFilter as ScanJobStatus)) {
        return c.json(
            {
                error: "VALIDATION_ERROR",
                message: "Statut invalide.",
                statusCode: 422,
            },
            422,
        );
    }

    const db = drizzle(c.env.DB);

    const conditions = [eq(scanJobs.municipalityId, municipalityId)];
    if (statusFilter) {
        conditions.push(eq(scanJobs.status, statusFilter));
    }
    const where = and(...conditions);

    const [{ total }] = await db
        .select({ total: sql<number>`count(*)` })
        .from(scanJobs)
        .where(where);

    const rows = await db
        .select()
        .from(scanJobs)
        .where(where)
        .orderBy(sql`${scanJobs.createdAt} DESC`)
        .limit(pageSize)
        .offset((page - 1) * pageSize);

    return c.json<PaginatedResponse<ScanJob>>({
        data: rows.map(rowToScanJob),
        total,
        page,
        pageSize,
    });
});

// ---------------------------------------------------------------------------
// GET /:id — Single scan job details
// ---------------------------------------------------------------------------

scans.get("/:id", async (c) => {
    const municipalityId = c.get("municipalityId");
    const { id } = c.req.param();

    const db = drizzle(c.env.DB);

    const [row] = await db
        .select()
        .from(scanJobs)
        .where(and(eq(scanJobs.id, id), eq(scanJobs.municipalityId, municipalityId)))
        .limit(1);

    if (!row) {
        return c.json(
            {
                error: "NOT_FOUND",
                message: "Tâche de scan introuvable.",
                statusCode: 404,
            },
            404,
        );
    }

    return c.json<{ job: ScanJob }>({ job: rowToScanJob(row) });
});

// ---------------------------------------------------------------------------
// POST /trigger — Manually trigger a scan (manager only)
// ---------------------------------------------------------------------------

scans.post("/trigger", async (c) => {
    const role = c.get("role");
    if (role !== "manager") {
        return c.json(
            {
                error: "FORBIDDEN",
                message: "Accès refusé. Rôle gestionnaire requis.",
                statusCode: 403,
            },
            403,
        );
    }

    const municipalityId = c.get("municipalityId");
    const db = drizzle(c.env.DB);

    // Parse body — supports 3 modes:
    //   1. Municipality-wide: no lat/lng (uses municipality bounds)
    //   2. Address: address string + lat/lng (200m focused bbox)
    //   3. Coordinates: lat/lng only (200m focused bbox)
    const body = await c.req.json().catch(() => ({})) as {
        mode?: "municipality" | "address" | "coordinates";
        latitude?: number;
        longitude?: number;
        address?: string;
        startDate?: string;
        endDate?: string;
    };

    const mode = body.mode ?? (body.latitude ? "coordinates" : "municipality");
    const startDate = body.startDate ?? null;
    const endDate = body.endDate ?? null;
    const address = body.address ?? null;

    // Fetch municipality (needed for municipality-wide mode or as fallback)
    const [municipality] = await db
        .select()
        .from(municipalities)
        .where(eq(municipalities.id, municipalityId))
        .limit(1);

    if (!municipality) {
        return c.json(
            { error: "NOT_FOUND", message: "Municipalité introuvable.", statusCode: 404 },
            404,
        );
    }

    let bounds: Municipality["bounds"] | null;

    if (mode === "municipality") {
        // Use full municipality bounding box
        bounds = municipality.bounds
            ? (JSON.parse(municipality.bounds) as Municipality["bounds"])
            : null;
    } else {
        // Address or coordinates mode — requires lat/lng
        if (!body.latitude || !body.longitude) {
            return c.json(
                { error: "VALIDATION_ERROR", message: "Latitude et longitude sont requis.", statusCode: 422 },
                422,
            );
        }
        // Create a ~200m bounding box around the target point
        const RADIUS_M = 200;
        const latOffset = RADIUS_M / 111_000;
        const lngOffset = RADIUS_M / (111_000 * Math.cos(body.latitude * Math.PI / 180));
        bounds = {
            north: body.latitude + latOffset,
            south: body.latitude - latOffset,
            east: body.longitude + lngOffset,
            west: body.longitude - lngOffset,
        };
    }

    const jobId = ulid();
    const now = Date.now();

    const newJob: typeof scanJobs.$inferInsert = {
        id: jobId,
        municipalityId,
        status: "pending",
        startDate,
        endDate,
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
        address,
        createdAt: now,
    };

    await db.insert(scanJobs).values(newJob);

    // Enqueue to detection queue
    await c.env.DETECTION_QUEUE.send({
        jobId,
        municipalityId,
        bounds,
        startDate: startDate ?? undefined,
        endDate: endDate ?? undefined,
    });

    const [inserted] = await db
        .select()
        .from(scanJobs)
        .where(eq(scanJobs.id, jobId))
        .limit(1);

    return c.json<{ job: ScanJob }>({ job: rowToScanJob(inserted) }, 201);
});

// ---------------------------------------------------------------------------
// PUT /config — Update municipality scan config (manager only)
// ---------------------------------------------------------------------------

scans.put("/config", async (c) => {
    const role = c.get("role");
    if (role !== "manager") {
        return c.json(
            {
                error: "FORBIDDEN",
                message: "Accès refusé. Rôle gestionnaire requis.",
                statusCode: 403,
            },
            403,
        );
    }

    const municipalityId = c.get("municipalityId");

    const body = await c.req.json().catch(() => null);
    if (!body || typeof body !== "object") {
        return c.json(
            {
                error: "BAD_REQUEST",
                message: "Corps de la requête invalide.",
                statusCode: 400,
            },
            400,
        );
    }

    const { scanFrequency, scanEnabled } = body as {
        scanFrequency?: unknown;
        scanEnabled?: unknown;
    };

    if (
        scanFrequency !== undefined &&
        !SCAN_FREQUENCIES.includes(scanFrequency as ScanFrequency)
    ) {
        return c.json(
            {
                error: "VALIDATION_ERROR",
                message: `Fréquence invalide. Valeurs acceptées : ${SCAN_FREQUENCIES.join(", ")}.`,
                statusCode: 422,
            },
            422,
        );
    }

    if (scanEnabled !== undefined && typeof scanEnabled !== "boolean") {
        return c.json(
            {
                error: "VALIDATION_ERROR",
                message: "scanEnabled doit être un booléen.",
                statusCode: 422,
            },
            422,
        );
    }

    const updates: Partial<typeof municipalities.$inferInsert> = {};
    if (scanFrequency !== undefined) updates.scanFrequency = scanFrequency as string;
    if (scanEnabled !== undefined) updates.scanEnabled = scanEnabled as boolean;

    if (Object.keys(updates).length === 0) {
        return c.json(
            {
                error: "BAD_REQUEST",
                message: "Aucune modification fournie.",
                statusCode: 400,
            },
            400,
        );
    }

    const db = drizzle(c.env.DB);

    await db
        .update(municipalities)
        .set(updates)
        .where(eq(municipalities.id, municipalityId));

    const [updated] = await db
        .select()
        .from(municipalities)
        .where(eq(municipalities.id, municipalityId))
        .limit(1);

    if (!updated) {
        return c.json(
            {
                error: "NOT_FOUND",
                message: "Municipalité introuvable.",
                statusCode: 404,
            },
            404,
        );
    }

    return c.json<Municipality>(rowToMunicipality(updated));
});

export default scans;
