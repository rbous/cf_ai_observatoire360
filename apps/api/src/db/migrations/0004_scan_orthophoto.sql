-- =============================================================================
-- Migration 0004: Add orthophoto image key to scan_jobs
-- =============================================================================

ALTER TABLE scan_jobs ADD COLUMN ortho_image_key TEXT;
