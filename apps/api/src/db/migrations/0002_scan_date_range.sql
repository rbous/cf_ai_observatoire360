-- =============================================================================
-- Migration 0002: Add custom date range fields to scan_jobs
-- =============================================================================

ALTER TABLE scan_jobs ADD COLUMN start_date TEXT;
ALTER TABLE scan_jobs ADD COLUMN end_date TEXT;
