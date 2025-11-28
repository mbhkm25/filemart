-- 001_birm_separate_user_business_down.sql
-- Rollback migration for BIRM separation

BEGIN;

-- Drop index
DROP INDEX IF EXISTS idx_installed_plugins_business_id;
DROP INDEX IF EXISTS idx_business_profiles_merchant_id;

-- Remove business_id column
ALTER TABLE installed_plugins DROP COLUMN IF EXISTS business_id;

-- Remove type column (optional - may want to keep for data)
-- ALTER TABLE business_profiles DROP COLUMN IF EXISTS type;

COMMIT;

