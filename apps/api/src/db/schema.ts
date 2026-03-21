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
