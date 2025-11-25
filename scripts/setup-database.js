// Setup Database Schema Script
// Run: node scripts/setup-database.js

require('dotenv').config({ path: '.env.local' })
const { neon } = require('@neondatabase/serverless')
const { readFileSync } = require('fs')
const { join } = require('path')

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

    // Execute the entire schema as one transaction
    console.log('📦 Executing schema...\n')

    try {
      // Execute the entire schema
      await sql(schema)
      console.log('   ✓ Schema executed successfully!')
    } catch (error) {
      // If it fails, try executing statement by statement
      console.log('   ⚠ Full schema execution failed, trying statement by statement...\n')
      
      // Split by semicolons but keep dollar-quoted strings intact
      const statements = []
      let current = ''
      let inDollarQuote = false
      let dollarTag = ''
      
      for (let i = 0; i < schema.length; i++) {
        const char = schema[i]
        
        // Handle dollar quotes
        if (char === '$' && !inDollarQuote) {
          const match = schema.substring(i).match(/^\$([^$]*)\$/)
          if (match) {
            dollarTag = match[0]
            inDollarQuote = true
            current += dollarTag
            i += dollarTag.length - 1
            continue
          }
        }
        
        if (inDollarQuote && schema.substring(i).startsWith(dollarTag)) {
          current += dollarTag
          i += dollarTag.length - 1
          inDollarQuote = false
          dollarTag = ''
          continue
        }
        
        current += char
        
        if (char === ';' && !inDollarQuote) {
          const trimmed = current.trim()
          if (trimmed.length > 5 && !trimmed.startsWith('--')) {
            statements.push(trimmed)
          }
          current = ''
        }
      }
      
      if (current.trim().length > 5) {
        statements.push(current.trim())
      }

      console.log(`   Found ${statements.length} statements to execute\n`)

      let successCount = 0
      let errorCount = 0

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i]
        const preview = statement.substring(0, 50).replace(/\s+/g, ' ')

        try {
          await sql(statement)
          successCount++
          console.log(`   ✓ [${i + 1}/${statements.length}] ${preview}...`)
        } catch (error) {
          // Ignore "already exists" errors
          if (
            error.message?.includes('already exists') ||
            error.message?.includes('duplicate') ||
            error.message?.includes('already been created')
          ) {
            successCount++
            console.log(`   ⚠ [${i + 1}/${statements.length}] ${preview}... (already exists)`)
            continue
          }
          errorCount++
          console.error(`   ✗ [${i + 1}/${statements.length}] Error: ${error.message}`)
          console.error(`      Statement: ${preview}...`)
        }
      }

      console.log(`\n   ✓ Successfully executed: ${successCount} statements`)
      if (errorCount > 0) {
        console.log(`   ✗ Errors: ${errorCount} statements`)
      }
    }

    // Test connection
    console.log('\n🧪 Testing database connection...')
    const testResult = await sql('SELECT NOW() as current_time')
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
    console.log(`\n📊 Found ${tablesResult.length} tables:`)
    tablesResult.forEach((row) => {
      console.log(`   - ${row.table_name}`)
    })

    if (tablesResult.length === 0) {
      console.log('\n⚠️  No tables found. Please check the schema file and try again.')
      process.exit(1)
    } else if (tablesResult.length < 11) {
      console.log('\n⚠️  Some tables might be missing. Expected 11 tables.')
    } else {
      console.log('\n🎉 Database is ready to use!')
    }

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message)
    console.error(error)
    process.exit(1)
  }
}

setupDatabase()
