// scripts/migrations/migrate-birm-data.ts
// BIRM Data Migration: Link existing merchants to business profiles
// Run this AFTER applying 001_birm_separate_user_business.sql migration

import { neon } from '@neondatabase/serverless'
import crypto from 'crypto'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required')
  process.exit(1)
}

const sql = neon(DATABASE_URL)

async function migrateData() {
  try {
    console.log('Starting BIRM data migration...')

    // 1) Get all distinct merchants that have installed_plugins
    const merchantsWithPlugins = await sql`
      SELECT DISTINCT merchant_id 
      FROM installed_plugins 
      WHERE merchant_id IS NOT NULL
    `

    console.log(`Found ${merchantsWithPlugins.length} merchants with installed plugins`)

    // 2) For each merchant, create a default business if none exists
    for (const row of merchantsWithPlugins) {
      const merchantId = row.merchant_id as string

      // Check if business profile already exists
      const existing = await sql`
        SELECT id FROM business_profiles WHERE merchant_id = ${merchantId} LIMIT 1
      `

      let businessId: string

      if (existing.length === 0) {
        // Create default business profile
        const slug = 'default-' + crypto.randomBytes(4).toString('hex')
        const res = await sql`
          INSERT INTO business_profiles (merchant_id, name, type, slug, created_at, updated_at) 
          VALUES (${merchantId}, 'Default Business', 'store', ${slug}, NOW(), NOW()) 
          RETURNING id
        `
        businessId = res[0].id as string
        console.log(`Created business profile ${businessId} for merchant ${merchantId}`)
      } else {
        businessId = existing[0].id as string
        console.log(`Using existing business profile ${businessId} for merchant ${merchantId}`)
      }

      // 3) Link installed_plugins to business_id
      const updateResult = await sql`
        UPDATE installed_plugins 
        SET business_id = ${businessId} 
        WHERE merchant_id = ${merchantId} AND business_id IS NULL
      `
      console.log(`  Updated installed_plugins for business ${businessId}`)
    }

    // 4) Handle merchants with products/orders/gallery but no plugins
    const merchantsWithProducts = await sql`
      SELECT DISTINCT profile_id as merchant_id
      FROM products
      WHERE profile_id NOT IN (SELECT merchant_id FROM business_profiles)
      AND profile_id IS NOT NULL
    `

    for (const row of merchantsWithProducts) {
      const merchantId = row.merchant_id as string
      const slug = 'default-' + crypto.randomBytes(4).toString('hex')
      const res = await sql`
        INSERT INTO business_profiles (merchant_id, name, type, slug, created_at, updated_at) 
        VALUES (${merchantId}, 'Default Business', 'store', ${slug}, NOW(), NOW()) 
        RETURNING id
      `
      const businessId = res[0].id as string
      console.log(`Created business profile ${businessId} for merchant ${merchantId} (from products)`)
    }

    console.log('\n✅ Data migration complete!')
    console.log('\nNext steps:')
    console.log('1. Verify business_profiles were created correctly')
    console.log('2. Verify installed_plugins.business_id is populated')
    console.log('3. Run: ALTER TABLE installed_plugins ALTER COLUMN business_id SET NOT NULL; (after verification)')
  } catch (err) {
    console.error('Migration error:', err)
    throw err
  }
}

// Run migration
migrateData()
  .then(() => {
    console.log('Migration script completed successfully')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Migration script failed:', err)
    process.exit(1)
  })

