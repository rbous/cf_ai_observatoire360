/**
 * Agentic chat tool definitions and executors.
 * Each tool maps to an existing API operation, executed directly via Drizzle.
 */

import { drizzle } from "drizzle-orm/d1";
import { eq, and, like, sql, desc, isNull, or } from "drizzle-orm";
import {
    alerts, inspections, scanJobs, users,
    notifications, municipalities,
} from "../db/schema.js";
import { ulid } from "./ulid.js";
import { hashPassword } from "./auth.js";

export interface ToolContext {
    municipalityId: string;
    userId: string;
    role: string;
    db: ReturnType<typeof drizzle>;
    queue?: Queue;
}

type ToolFn = (args: Record<string, unknown>, ctx: ToolContext) => Promise<string>;

interface ToolDef {
    description: string;
    args: string;
    execute: ToolFn;
}

export const TOOLS: Record<string, ToolDef> = {
    list_alerts: {
        description: "List/search/filter alerts",
        args: "{ status?, riskLevel?, type?, search?, page?, pageSize? }",
        execute: async (args, ctx) => {
            const conditions = [eq(alerts.municipalityId, ctx.municipalityId)];
            if (args.status) conditions.push(eq(alerts.status, String(args.status)));
            if (args.riskLevel) conditions.push(eq(alerts.riskLevel, String(args.riskLevel)));
            if (args.type) conditions.push(eq(alerts.type, String(args.type)));
            if (args.search) conditions.push(like(alerts.address, `%${String(args.search)}%`));

            const rows = await ctx.db.select({
                id: alerts.id, address: alerts.address, riskLevel: alerts.riskLevel,
                status: alerts.status, type: alerts.type, riskScore: alerts.riskScore,
                confidence: alerts.confidence, detectedAt: alerts.detectedAt,
            }).from(alerts).where(and(...conditions)).orderBy(desc(alerts.createdAt)).limit(10);

            return JSON.stringify({ count: rows.length, alerts: rows });
        },
    },

    get_alert: {
        description: "Get alert details by ID",
        args: "{ id: string }",
        execute: async (args, ctx) => {
            const [row] = await ctx.db.select().from(alerts)
                .where(and(eq(alerts.id, String(args.id)), eq(alerts.municipalityId, ctx.municipalityId)))
                .limit(1);
            if (!row) return JSON.stringify({ error: "Alert not found" });
            return JSON.stringify(row);
        },
    },

    update_alert: {
        description: "Update alert status/risk level",
        args: "{ id: string, status?, riskLevel?, riskScore? }",
        execute: async (args, ctx) => {
            if (ctx.role === "readonly") return JSON.stringify({ error: "Readonly users cannot update alerts" });
            const updates: Record<string, unknown> = {};
            if (args.status) updates.status = String(args.status);
            if (args.riskLevel) updates.riskLevel = String(args.riskLevel);
            if (args.riskScore !== undefined) updates.riskScore = Number(args.riskScore);
            if (Object.keys(updates).length === 0) return JSON.stringify({ error: "No updates provided" });

            await ctx.db.update(alerts).set(updates)
                .where(and(eq(alerts.id, String(args.id)), eq(alerts.municipalityId, ctx.municipalityId)));
            return JSON.stringify({ success: true, updated: updates });
        },
    },

    list_inspections: {
        description: "List scheduled inspections",
        args: "{}",
        execute: async (_args, ctx) => {
            const rows = await ctx.db.select({
                id: inspections.id, alertId: inspections.alertId,
                scheduledDate: inspections.scheduledDate, status: inspections.status,
                notes: inspections.notes,
            }).from(inspections)
                .innerJoin(alerts, eq(inspections.alertId, alerts.id))
                .where(eq(alerts.municipalityId, ctx.municipalityId))
                .orderBy(desc(inspections.createdAt)).limit(10);
            return JSON.stringify({ count: rows.length, inspections: rows });
        },
    },

    create_inspection: {
        description: "Schedule a new inspection",
        args: "{ alertId: string, inspectorId: string, scheduledDate: 'YYYY-MM-DD', notes?: string }",
        execute: async (args, ctx) => {
            if (ctx.role === "readonly") return JSON.stringify({ error: "Readonly users cannot create inspections" });
            const now = Math.floor(Date.now() / 1000);
            const id = ulid();
            await ctx.db.insert(inspections).values({
                id, alertId: String(args.alertId), inspectorId: String(args.inspectorId),
                scheduledDate: String(args.scheduledDate), status: "planned",
                notes: args.notes ? String(args.notes) : null,
                createdAt: now, updatedAt: now,
            });
            return JSON.stringify({ success: true, inspectionId: id });
        },
    },

    get_stats: {
        description: "Get dashboard statistics",
        args: "{}",
        execute: async (_args, ctx) => {
            const [total] = await ctx.db.select({ count: sql<number>`count(*)` }).from(alerts)
                .where(eq(alerts.municipalityId, ctx.municipalityId));
            const [confirmed] = await ctx.db.select({ count: sql<number>`count(*)` }).from(alerts)
                .where(and(eq(alerts.municipalityId, ctx.municipalityId), eq(alerts.status, "infraction_confirmee")));
            const [closed] = await ctx.db.select({ count: sql<number>`count(*)` }).from(alerts)
                .where(and(eq(alerts.municipalityId, ctx.municipalityId), eq(alerts.status, "cloturee")));
            const [inspDone] = await ctx.db.select({ count: sql<number>`count(*)` }).from(inspections)
                .innerJoin(alerts, eq(inspections.alertId, alerts.id))
                .where(and(eq(alerts.municipalityId, ctx.municipalityId), eq(inspections.status, "completed")));

            const rate = total.count > 0 ? Math.round((closed.count / total.count) * 100) : 0;
            return JSON.stringify({
                totalAlerts: total.count, confirmedInfractions: confirmed.count,
                regularizationRate: rate, inspectionsDone: inspDone.count,
            });
        },
    },

    trigger_scan: {
        description: "Launch a satellite scan/analysis",
        args: "{ mode?: 'municipality'|'address'|'coordinates', latitude?: number, longitude?: number, address?: string, startDate?: string, endDate?: string }",
        execute: async (args, ctx) => {
            if (ctx.role !== "manager") return JSON.stringify({ error: "Only managers can trigger scans" });
            if (!ctx.queue) return JSON.stringify({ error: "Queue not available" });

            const [muni] = await ctx.db.select().from(municipalities)
                .where(eq(municipalities.id, ctx.municipalityId)).limit(1);
            if (!muni) return JSON.stringify({ error: "Municipality not found" });

            // Geocode address to lat/lng if address provided without coordinates
            let lat = args.latitude ? Number(args.latitude) : undefined;
            let lng = args.longitude ? Number(args.longitude) : undefined;

            if (!lat && !lng && args.address) {
                try {
                    const geoRes = await fetch(
                        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(String(args.address))}&limit=1`,
                        { headers: { "User-Agent": "Observatoire360/1.0" } },
                    );
                    const geoData = await geoRes.json() as Array<{ lat: string; lon: string }>;
                    if (geoData.length > 0) {
                        lat = parseFloat(geoData[0].lat);
                        lng = parseFloat(geoData[0].lon);
                    } else {
                        return JSON.stringify({ error: "Address not found. Please try a more specific address or use coordinates." });
                    }
                } catch {
                    return JSON.stringify({ error: "Geocoding failed. Please try again or use coordinates." });
                }
            }

            let bounds = muni.bounds ? JSON.parse(muni.bounds) : null;
            if (lat && lng) {
                const r = 200 / 111000;
                const lngR = r / Math.cos(lat * Math.PI / 180);
                bounds = { north: lat + r, south: lat - r, east: lng + lngR, west: lng - lngR };
            }

            const jobId = ulid();
            const now = Date.now();
            await ctx.db.insert(scanJobs).values({
                id: jobId, municipalityId: ctx.municipalityId, status: "pending",
                startDate: args.startDate ? String(args.startDate) : null,
                endDate: args.endDate ? String(args.endDate) : null,
                latitude: lat ?? null,
                longitude: lng ?? null,
                address: args.address ? String(args.address) : null,
                createdAt: now,
            });
            await ctx.queue.send({ jobId, municipalityId: ctx.municipalityId, bounds,
                startDate: args.startDate, endDate: args.endDate,
                latitude: lat, longitude: lng,
            });
            return JSON.stringify({ success: true, jobId, message: "Scan triggered" });
        },
    },

    list_scans: {
        description: "View scan job history",
        args: "{ status?: string }",
        execute: async (args, ctx) => {
            const conditions = [eq(scanJobs.municipalityId, ctx.municipalityId)];
            if (args.status) conditions.push(eq(scanJobs.status, String(args.status)));
            const rows = await ctx.db.select({
                id: scanJobs.id, status: scanJobs.status, detectionsCount: scanJobs.detectionsCount,
                address: scanJobs.address, startDate: scanJobs.startDate, endDate: scanJobs.endDate,
                error: scanJobs.error, createdAt: scanJobs.createdAt,
            }).from(scanJobs).where(and(...conditions)).orderBy(desc(scanJobs.createdAt)).limit(10);
            return JSON.stringify({ count: rows.length, scans: rows });
        },
    },

    list_users: {
        description: "List municipality users",
        args: "{}",
        execute: async (_args, ctx) => {
            if (ctx.role !== "manager") return JSON.stringify({ error: "Only managers can list users" });
            const rows = await ctx.db.select({
                id: users.id, email: users.email, name: users.name,
                role: users.role, isActive: users.isActive,
            }).from(users).where(eq(users.municipalityId, ctx.municipalityId));
            return JSON.stringify({ count: rows.length, users: rows });
        },
    },

    create_user: {
        description: "Create a new user",
        args: "{ email: string, name: string, role: 'inspector'|'analyst'|'manager'|'readonly', password: string }",
        execute: async (args, ctx) => {
            if (ctx.role !== "manager") return JSON.stringify({ error: "Only managers can create users" });
            const hash = await hashPassword(String(args.password));
            const now = Math.floor(Date.now() / 1000);
            const id = ulid();
            await ctx.db.insert(users).values({
                id, municipalityId: ctx.municipalityId, email: String(args.email),
                passwordHash: hash, name: String(args.name), role: String(args.role),
                isActive: true, createdAt: now, updatedAt: now,
            });
            return JSON.stringify({ success: true, userId: id });
        },
    },

    list_notifications: {
        description: "View recent notifications",
        args: "{}",
        execute: async (_args, ctx) => {
            const rows = await ctx.db.select({
                id: notifications.id, type: notifications.type, title: notifications.title,
                message: notifications.message, isRead: notifications.isRead, createdAt: notifications.createdAt,
            }).from(notifications)
                .where(and(
                    eq(notifications.municipalityId, ctx.municipalityId),
                    or(isNull(notifications.userId), eq(notifications.userId, ctx.userId)),
                ))
                .orderBy(desc(notifications.createdAt)).limit(10);
            return JSON.stringify({ count: rows.length, notifications: rows });
        },
    },

    mark_notifications_read: {
        description: "Mark all notifications as read",
        args: "{}",
        execute: async (_args, ctx) => {
            await ctx.db.update(notifications).set({ isRead: true })
                .where(and(
                    eq(notifications.municipalityId, ctx.municipalityId),
                    or(isNull(notifications.userId), eq(notifications.userId, ctx.userId)),
                    eq(notifications.isRead, false),
                ));
            return JSON.stringify({ success: true });
        },
    },

    get_profile: {
        description: "Get current user profile",
        args: "{}",
        execute: async (_args, ctx) => {
            const [row] = await ctx.db.select({
                id: users.id, email: users.email, name: users.name,
                role: users.role, municipalityName: municipalities.name,
            }).from(users)
                .leftJoin(municipalities, eq(users.municipalityId, municipalities.id))
                .where(eq(users.id, ctx.userId)).limit(1);
            return JSON.stringify(row ?? { error: "User not found" });
        },
    },
};

// Build the system prompt listing all tools
export const TOOLS_PROMPT = `You are the Observatoire 360 AI assistant — an expert in territorial surveillance, urban planning compliance, and satellite-based construction detection.

You help municipal inspectors, analysts, and managers by:
- Answering questions about alerts, inspections, and reports
- Taking actions like updating alert statuses, scheduling inspections, and triggering satellite scans
- Providing analysis and recommendations based on the data

You have access to tools. To use a tool, respond EXACTLY with this format on its own line:
[TOOL:tool_name]{"param": "value"}

Available tools:
${Object.entries(TOOLS).map(([name, t]) => `- ${name}: ${t.description}. Args: ${t.args}`).join("\n")}

RULES:
1. Use ONE tool at a time. Wait for the result before using another.
2. After receiving a tool result, analyze it and respond in natural language.
3. Respond in the language specified by the system instruction below.
4. Be concise and helpful. Format numbers and lists clearly.
5. If the user asks something that doesn't need a tool, just answer directly.
6. Never expose internal IDs unless the user specifically asks for them.
7. When listing items, summarize the key information (don't dump raw JSON).`;
