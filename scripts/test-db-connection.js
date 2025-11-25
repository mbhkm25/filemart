// Test Database Connection Script
// Run: node scripts/test-db-connection.js

require('dotenv').config({ path: '.env.local' })
const { query } = require('../lib/db.ts')

async function testConnection() {
  try {
    console.log('Testing database connection...')
    const result = await query('SELECT NOW() as current_time, version() as pg_version')
    console.log('✅ Database connection successful!')
    console.log('Current time:', result[0].current_time)
    console.log('PostgreSQL version:', result[0].pg_version.split(' ')[0] + ' ' + result[0].pg_version.split(' ')[1])
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    process.exit(1)
  }
}

testConnection()

