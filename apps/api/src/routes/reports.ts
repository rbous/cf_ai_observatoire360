import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, and, sql } from "drizzle-orm";
import type { ReportStats } from "@observatoire360/shared";
import type { AlertType, RiskLevel } from "@observatoire360/shared";
import { alerts, inspections } from "../db/schema.js";
import type { Bindings } from "../types.js";
import type { AuthVariables } from "../middleware/auth.js";

type AppEnv = { Bindings: Bindings; Variables: AuthVariables };

const reportsRouter = new Hono<AppEnv>();

// ---------------------------------------------------------------------------
// GET /reports/stats
// ---------------------------------------------------------------------------

reportsRouter.get("/stats", async (c) => {
    const municipalityId = c.get("municipalityId");
    const db = drizzle(c.env.DB);

    // Total alerts for this municipality
    const [{ totalAlerts }] = await db
        .select({ totalAlerts: sql<number>`count(*)` })
        .from(alerts)
        .where(eq(alerts.municipalityId, municipalityId));

    // Confirmed infractions
    const [{ confirmedInfractions }] = await db
        .select({ confirmedInfractions: sql<number>`count(*)` })
        .from(alerts)
        .where(
            and(
                eq(alerts.municipalityId, municipalityId),
                eq(alerts.status, "infraction_confirmee"),
            ),
        );

    // Closed alerts (used for regularization rate)
    const [{ closedCount }] = await db
        .select({ closedCount: sql<number>`count(*)` })
        .from(alerts)
        .where(
            and(
                eq(alerts.municipalityId, municipalityId),
                eq(alerts.status, "cloturee"),
            ),
        );

    const regularizationRate =
        totalAlerts > 0
            ? Math.round((closedCount / totalAlerts) * 100)
            : 0;

    // Completed inspections scoped to this municipality
    const [{ inspectionsDone }] = await db
        .select({ inspectionsDone: sql<number>`count(*)` })
        .from(inspections)
        .innerJoin(alerts, eq(inspections.alertId, alerts.id))
        .where(
            and(
                eq(alerts.municipalityId, municipalityId),
                eq(inspections.status, "completed"),
            ),
        );

    // Alerts by month — last 12 months
    const alertsByMonthRows = await db
        .select({
            month: sql<string>`strftime('%Y-%m', datetime(${alerts.detectedAt}, 'unixepoch'))`,
            count: sql<number>`count(*)`,
        })
        .from(alerts)
        .where(
            and(
                eq(alerts.municipalityId, municipalityId),
                sql`${alerts.detectedAt} >= CAST(strftime('%s', date('now', '-12 months')) AS INTEGER)`,
            ),
        )
        .groupBy(sql`strftime('%Y-%m', datetime(${alerts.detectedAt}, 'unixepoch'))`)
        .orderBy(sql`strftime('%Y-%m', datetime(${alerts.detectedAt}, 'unixepoch')) ASC`);

    // Alerts by type
    const alertsByTypeRows = await db
        .select({
            type: alerts.type,
            count: sql<number>`count(*)`,
        })
        .from(alerts)
        .where(eq(alerts.municipalityId, municipalityId))
        .groupBy(alerts.type);

    // Alerts by risk level
    const alertsByRiskRows = await db
        .select({
            level: alerts.riskLevel,
            count: sql<number>`count(*)`,
        })
        .from(alerts)
        .where(eq(alerts.municipalityId, municipalityId))
        .groupBy(alerts.riskLevel);

    const stats: ReportStats = {
        totalAlerts,
        confirmedInfractions,
        regularizationRate,
        inspectionsDone,
        alertsByMonth: alertsByMonthRows.map((r) => ({
            month: r.month,
            count: r.count,
        })),
        alertsByType: alertsByTypeRows.map((r) => ({
            type: r.type as AlertType,
            count: r.count,
        })),
        alertsByRiskLevel: alertsByRiskRows.map((r) => ({
            level: r.level as RiskLevel,
            count: r.count,
        })),
    };

    return c.json(stats);
});

// ---------------------------------------------------------------------------
// GET /reports/detections — monthly detection counts for the last 12 months
// ---------------------------------------------------------------------------

reportsRouter.get("/detections", async (c) => {
    const municipalityId = c.get("municipalityId");
    const db = drizzle(c.env.DB);

    const rows = await db
        .select({
            month: sql<string>`strftime('%Y-%m', datetime(${alerts.detectedAt}, 'unixepoch'))`,
            count: sql<number>`count(*)`,
        })
        .from(alerts)
        .where(
            and(
                eq(alerts.municipalityId, municipalityId),
                sql`${alerts.detectedAt} >= CAST(strftime('%s', date('now', '-12 months')) AS INTEGER)`,
            ),
        )
        .groupBy(sql`strftime('%Y-%m', datetime(${alerts.detectedAt}, 'unixepoch'))`)
        .orderBy(sql`strftime('%Y-%m', datetime(${alerts.detectedAt}, 'unixepoch')) ASC`);

    return c.json(
        rows.map((r) => ({ month: r.month, count: r.count })),
    );
});

export default reportsRouter;
