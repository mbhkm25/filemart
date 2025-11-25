// Setup Database Schema Script
// Run: npx tsx scripts/setup-database.ts

import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
import { join } from 'path'

async function setupDatabase() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set')
    console.error('Make sure .env.local file exists with DATABASE_URL')
    process.exit(1)
  }

  try {
    console.log('🔌 Connecting to database...')
    const sql = neon(databaseUrl)

    // Read schema file
    const schemaPath = join(process.cwd(), 'db', 'schema.sql')
    const schema = readFileSync(schemaPath, 'utf-8')

    console.log('📄 Reading schema file...')
    console.log(`   File: ${schemaPath}`)

    // Split schema into individual statements
    // Remove comments and split by semicolons
    const statements = schema
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'))

    console.log(`📦 Found ${statements.length} SQL statements to execute`)

    // Execute each statement
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.length < 10) continue // Skip very short statements

      try {
        await sql(statement)
        successCount++
        if ((i + 1) % 10 === 0) {
          console.log(`   ✓ Executed ${i + 1}/${statements.length} statements...`)
        }
      } catch (error: any) {
        // Ignore "already exists" errors
        if (
          error.message?.includes('already exists') ||
          error.message?.includes('duplicate')
        ) {
          successCount++
          continue
        }
        errorCount++
        console.error(`   ✗ Error in statement ${i + 1}:`, error.message)
        console.error(`   Statement: ${statement.substring(0, 100)}...`)
      }
    }

    console.log('\n✅ Database setup completed!')
    console.log(`   ✓ Successfully executed: ${successCount} statements`)
    if (errorCount > 0) {
      console.log(`   ✗ Errors: ${errorCount} statements`)
    }

    // Test connection
    console.log('\n🧪 Testing database connection...')
    const testResult = await sql('SELECT NOW() as current_time, version() as pg_version')
    console.log('   ✓ Connection successful!')
    console.log(`   Current time: ${testResult[0].current_time}`)

    // Check tables
    const tablesResult = await sql(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)
    console.log(`\n📊 Created ${tablesResult.length} tables:`)
    tablesResult.forEach((row: any) => {
      console.log(`   - ${row.table_name}`)
    })

    console.log('\n🎉 Database is ready to use!')
  } catch (error: any) {
    console.error('\n❌ Database setup failed:', error.message)
    console.error(error)
    process.exit(1)
  }
}

setupDatabase()

