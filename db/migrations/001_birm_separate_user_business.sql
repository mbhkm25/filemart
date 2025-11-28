-- 001_birm_separate_user_business.sql
-- BIRM: Separate User from Business Profile
-- Adds business_id to installed_plugins and type to business_profiles

BEGIN;

-- 1) Add type column to business_profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_profiles' AND column_name = 'type'
  ) THEN
    ALTER TABLE business_profiles 
    ADD COLUMN type VARCHAR(20) DEFAULT 'store' 
    CHECK (type IN ('store', 'service'));
  END IF;
END $$;

-- 2) Add business_id to installed_plugins
ALTER TABLE installed_plugins
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE;

-- 3) Create index for business_id lookups
CREATE INDEX IF NOT EXISTS idx_installed_plugins_business_id 
ON installed_plugins(business_id);

-- 4) Add index for business_profiles.merchant_id if not exists (for ownership checks)
CREATE INDEX IF NOT EXISTS idx_business_profiles_merchant_id 
ON business_profiles(merchant_id);

COMMIT;

