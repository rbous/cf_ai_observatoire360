import {
    sqliteTable,
    text,
    integer,
    real,
} from "drizzle-orm/sqlite-core";

// ---------------------------------------------------------------------------
// municipalities
// ---------------------------------------------------------------------------

export const municipalities = sqliteTable("municipalities", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    code: text("code").notNull().unique(),
    region: text("region"),
    /** JSON-encoded bounds object: { north, south, east, west } */
    bounds: text("bounds"),
    /** One of: daily | weekly | biweekly | monthly */
    scanFrequency: text("scan_frequency").notNull().default("daily"),
    scanEnabled: integer("scan_enabled", { mode: "boolean" }).notNull().default(true),
    lastScanAt: integer("last_scan_at"),
    createdAt: integer("created_at").notNull(),
});

// ---------------------------------------------------------------------------
// users
// ---------------------------------------------------------------------------

export const users = sqliteTable("users", {
    id: text("id").primaryKey(),
    municipalityId: text("municipality_id")
        .notNull()
        .references(() => municipalities.id),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    /** One of: inspector | analyst | manager | readonly */
    role: text("role").notNull().default("inspector"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
});

// ---------------------------------------------------------------------------
// refresh_tokens
// ---------------------------------------------------------------------------

export const refreshTokens = sqliteTable("refresh_tokens", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    /** SHA-256 hash of the raw token — never store plaintext */
    tokenHash: text("token_hash").notNull().unique(),
    /** Unix epoch seconds */
    expiresAt: integer("expires_at").notNull(),
    createdAt: integer("created_at").notNull(),
});

// ---------------------------------------------------------------------------
// alerts
// ---------------------------------------------------------------------------

export const alerts = sqliteTable("alerts", {
    id: text("id").primaryKey(),
    municipalityId: text("municipality_id")
        .notNull()
        .references(() => municipalities.id),
    latitude: real("latitude").notNull(),
    longitude: real("longitude").notNull(),
    /** One of: low | medium | high */
    riskLevel: text("risk_level").notNull(),
    /** 0–100 */
    riskScore: integer("risk_score").notNull().default(0),
    /** One of: a_analyser | a_inspecter | en_cours | infraction_confirmee | cloturee */
    status: text("status").notNull().default("a_analyser"),
    /** One of: construction | extension | annexe | piscine */
    type: text("type").notNull(),
    /** Detected surface area in m² */
    detectedArea: real("detected_area"),
    /** Authorized surface area in m² */
    authorizedArea: real("authorized_area"),
    zone: text("zone"),
    hasPermit: integer("has_permit", { mode: "boolean" }).notNull().default(false),
    address: text("address"),
    detectedAt: integer("detected_at").notNull(),
    /** JSON-encoded string[] of image URLs */
    images: text("images").notNull().default("[]"),
    /** Pipeline source tracking */
    scanJobId: text("scan_job_id").references(() => scanJobs.id),
    beforeImageKey: text("before_image_key"),
    afterImageKey: text("after_image_key"),
    /** AI confidence score 0-1 */
    confidence: real("confidence"),
    createdAt: integer("created_at").notNull(),
});

// ---------------------------------------------------------------------------
// inspections
// ---------------------------------------------------------------------------

export const inspections = sqliteTable("inspections", {
    id: text("id").primaryKey(),
    alertId: text("alert_id")
        .notNull()
        .references(() => alerts.id),
    inspectorId: text("inspector_id")
        .notNull()
        .references(() => users.id),
    /** YYYY-MM-DD string */
    scheduledDate: text("scheduled_date").notNull(),
    /** One of: planned | in_progress | completed | cancelled */
    status: text("status").notNull().default("planned"),
    notes: text("notes"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
});

// ---------------------------------------------------------------------------
// contact_submissions
// ---------------------------------------------------------------------------

export const contactSubmissions = sqliteTable("contact_submissions", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    position: text("position"),
    municipality: text("municipality"),
    email: text("email").notNull(),
    description: text("description"),
    createdAt: integer("created_at").notNull(),
});

// ---------------------------------------------------------------------------
// notifications
// ---------------------------------------------------------------------------

export const notifications = sqliteTable("notifications", {
    id: text("id").primaryKey(),
    municipalityId: text("municipality_id")
        .notNull()
        .references(() => municipalities.id),
    /** NULL = broadcast to all users in the municipality */
    userId: text("user_id").references(() => users.id),
    alertId: text("alert_id").references(() => alerts.id),
    /** One of: new_alert | status_change | inspection_due | system */
    type: text("type").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at").notNull(),
});

// ---------------------------------------------------------------------------
// scan_jobs
// ---------------------------------------------------------------------------

export const scanJobs = sqliteTable("scan_jobs", {
    id: text("id").primaryKey(),
    municipalityId: text("municipality_id")
        .notNull()
        .references(() => municipalities.id),
    /** One of: pending | fetching | analyzing | completed | failed */
    status: text("status").notNull().default("pending"),
    imageryDate: text("imagery_date"),
    beforeImageKey: text("before_image_key"),
    afterImageKey: text("after_image_key"),
    detectionsCount: integer("detections_count").default(0),
    error: text("error"),
    startedAt: integer("started_at"),
    completedAt: integer("completed_at"),
    /** Custom date range for manual analyses */
    startDate: text("start_date"),
    endDate: text("end_date"),
    /** Location for address-specific scans */
    latitude: real("latitude"),
    longitude: real("longitude"),
    address: text("address"),
    createdAt: integer("created_at").notNull(),
});

// ---------------------------------------------------------------------------
// Type exports (Drizzle inferred types)
// ---------------------------------------------------------------------------

export type MunicipalityRow = typeof municipalities.$inferSelect;
export type NewMunicipalityRow = typeof municipalities.$inferInsert;
export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
export type RefreshTokenRow = typeof refreshTokens.$inferSelect;
export type NewRefreshTokenRow = typeof refreshTokens.$inferInsert;
export type AlertRow = typeof alerts.$inferSelect;
export type NewAlertRow = typeof alerts.$inferInsert;
export type InspectionRow = typeof inspections.$inferSelect;
export type NewInspectionRow = typeof inspections.$inferInsert;
export type ContactSubmissionRow = typeof contactSubmissions.$inferSelect;
export type NewContactSubmissionRow = typeof contactSubmissions.$inferInsert;
export type NotificationRow = typeof notifications.$inferSelect;
export type NewNotificationRow = typeof notifications.$inferInsert;
export type ScanJobRow = typeof scanJobs.$inferSelect;
export type NewScanJobRow = typeof scanJobs.$inferInsert;
