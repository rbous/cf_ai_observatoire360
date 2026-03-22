-- =============================================================================
-- Migration 0003: Add location fields to scan_jobs for address-specific scans
-- =============================================================================

ALTER TABLE scan_jobs ADD COLUMN latitude REAL;
ALTER TABLE scan_jobs ADD COLUMN longitude REAL;
ALTER TABLE scan_jobs ADD COLUMN address TEXT;
