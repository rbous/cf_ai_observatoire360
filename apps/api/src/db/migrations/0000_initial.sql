-- Migration: 0000_initial
-- Creates all tables and indexes for Observatoire 360.
-- Applied via: wrangler d1 migrations apply observatoire360-db

-- ---------------------------------------------------------------------------
-- municipalities
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS municipalities (
    id          TEXT    NOT NULL PRIMARY KEY,
    name        TEXT    NOT NULL,
    code        TEXT    NOT NULL UNIQUE,
    region      TEXT,
    -- JSON: { "north": float, "south": float, "east": float, "west": float }
    bounds      TEXT,
    created_at  INTEGER NOT NULL
);

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id              TEXT    NOT NULL PRIMARY KEY,
    municipality_id TEXT    NOT NULL REFERENCES municipalities(id),
    email           TEXT    NOT NULL UNIQUE,
    password_hash   TEXT    NOT NULL,
    name            TEXT    NOT NULL,
    role            TEXT    NOT NULL DEFAULT 'inspector'
                            CHECK (role IN ('inspector','analyst','manager','readonly')),
    is_active       INTEGER NOT NULL DEFAULT 1,
    created_at      INTEGER NOT NULL,
    updated_at      INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_municipality_id ON users(municipality_id);
CREATE INDEX IF NOT EXISTS idx_users_email            ON users(email);

-- ---------------------------------------------------------------------------
-- refresh_tokens
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          TEXT    NOT NULL PRIMARY KEY,
    user_id     TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  TEXT    NOT NULL UNIQUE,
    expires_at  INTEGER NOT NULL,
    created_at  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id    ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);

-- ---------------------------------------------------------------------------
-- alerts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alerts (
    id               TEXT    NOT NULL PRIMARY KEY,
    municipality_id  TEXT    NOT NULL REFERENCES municipalities(id),
    latitude         REAL    NOT NULL,
    longitude        REAL    NOT NULL,
    risk_level       TEXT    NOT NULL CHECK (risk_level IN ('low','medium','high')),
    risk_score       INTEGER NOT NULL DEFAULT 0,
    status           TEXT    NOT NULL DEFAULT 'a_analyser'
                             CHECK (status IN ('a_analyser','a_inspecter','en_cours','infraction_confirmee','cloturee')),
    type             TEXT    NOT NULL
                             CHECK (type IN ('construction','extension','annexe','piscine')),
    detected_area    REAL,
    authorized_area  REAL,
    zone             TEXT,
    has_permit       INTEGER NOT NULL DEFAULT 0,
    address          TEXT,
    detected_at      INTEGER NOT NULL,
    -- JSON: string[] of image URLs
    images           TEXT    NOT NULL DEFAULT '[]',
    created_at       INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_alerts_municipality_id ON alerts(municipality_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status          ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_risk_level      ON alerts(risk_level);
CREATE INDEX IF NOT EXISTS idx_alerts_type            ON alerts(type);
CREATE INDEX IF NOT EXISTS idx_alerts_detected_at     ON alerts(detected_at);

-- ---------------------------------------------------------------------------
-- inspections
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inspections (
    id              TEXT    NOT NULL PRIMARY KEY,
    alert_id        TEXT    NOT NULL REFERENCES alerts(id),
    inspector_id    TEXT    NOT NULL REFERENCES users(id),
    scheduled_date  TEXT    NOT NULL,
    status          TEXT    NOT NULL DEFAULT 'planned'
                            CHECK (status IN ('planned','in_progress','completed','cancelled')),
    notes           TEXT,
    created_at      INTEGER NOT NULL,
    updated_at      INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inspections_alert_id     ON inspections(alert_id);
CREATE INDEX IF NOT EXISTS idx_inspections_inspector_id ON inspections(inspector_id);
CREATE INDEX IF NOT EXISTS idx_inspections_status       ON inspections(status);

-- ---------------------------------------------------------------------------
-- contact_submissions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_submissions (
    id           TEXT    NOT NULL PRIMARY KEY,
    name         TEXT    NOT NULL,
    position     TEXT,
    municipality TEXT,
    email        TEXT    NOT NULL,
    description  TEXT,
    created_at   INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at);
