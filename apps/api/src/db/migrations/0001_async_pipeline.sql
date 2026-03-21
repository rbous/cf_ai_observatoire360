-- =============================================================================
-- Migration 0001: Async Detection Pipeline
-- Adds notifications, scan_jobs tables and extends municipalities/alerts
-- =============================================================================

-- ---------------------------------------------------------------------------
-- New table: notifications
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    municipality_id TEXT NOT NULL REFERENCES municipalities(id),
    user_id TEXT REFERENCES users(id),
    alert_id TEXT REFERENCES alerts(id),
    type TEXT NOT NULL CHECK(type IN ('new_alert', 'status_change', 'inspection_due', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_municipality ON notifications(municipality_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_alert ON notifications(alert_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- ---------------------------------------------------------------------------
-- New table: scan_jobs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scan_jobs (
    id TEXT PRIMARY KEY,
    municipality_id TEXT NOT NULL REFERENCES municipalities(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'fetching', 'analyzing', 'completed', 'failed')),
    imagery_date TEXT,
    before_image_key TEXT,
    after_image_key TEXT,
    detections_count INTEGER DEFAULT 0,
    error TEXT,
    started_at INTEGER,
    completed_at INTEGER,
    created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_scan_jobs_municipality ON scan_jobs(municipality_id);
CREATE INDEX IF NOT EXISTS idx_scan_jobs_status ON scan_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scan_jobs_created_at ON scan_jobs(created_at);

-- ---------------------------------------------------------------------------
-- Extend municipalities with scan configuration
-- ---------------------------------------------------------------------------
ALTER TABLE municipalities ADD COLUMN scan_frequency TEXT NOT NULL DEFAULT 'daily';
ALTER TABLE municipalities ADD COLUMN scan_enabled INTEGER NOT NULL DEFAULT 1;
ALTER TABLE municipalities ADD COLUMN last_scan_at INTEGER;

-- ---------------------------------------------------------------------------
-- Extend alerts with detection source tracking
-- ---------------------------------------------------------------------------
ALTER TABLE alerts ADD COLUMN scan_job_id TEXT REFERENCES scan_jobs(id);
ALTER TABLE alerts ADD COLUMN before_image_key TEXT;
ALTER TABLE alerts ADD COLUMN after_image_key TEXT;
ALTER TABLE alerts ADD COLUMN confidence REAL;
