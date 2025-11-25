// Create Admin Account Script
// Run: node scripts/create-admin.js

require('dotenv').config({ path: '.env.local' })
const { neon } = require('@neondatabase/serverless')
const bcrypt = require('bcryptjs')

async function createAdmin() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set')
    process.exit(1)
  }

  // Get admin details from command line or use defaults
  const args = process.argv.slice(2)
  const email = args[0] || 'admin@filemart.com'
  const password = args[1] || 'admin123'
  const name = args[2] || 'Admin User'

  try {
    console.log('🔌 Connecting to database...')
    const sql = neon(databaseUrl)

    // Check if admin already exists
    const existing = await sql(
      `SELECT id, email FROM merchants WHERE email = $1`,
      [email]
    )

    if (existing.length > 0) {
      console.log(`⚠️  User with email ${email} already exists!`)
      console.log(`   ID: ${existing[0].id}`)
      console.log(`   Email: ${existing[0].email}`)
      console.log('\n   To create a new admin, use a different email.')
      process.exit(0)
    }

    // Hash password
    console.log('🔐 Hashing password...')
    const passwordHash = await bcrypt.hash(password, 10)

    // Create merchant with admin role
    console.log('👤 Creating admin account...')
    const merchant = await sql(
      `INSERT INTO merchants (email, name, password_hash, role, is_active, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, name, role`,
      [email, name, passwordHash, 'admin', true, true]
    )

    if (merchant.length === 0) {
      throw new Error('Failed to create merchant')
    }

    const merchantId = merchant[0].id

    // Create admin record
    console.log('🔑 Creating admin permissions...')
    await sql(
      `INSERT INTO admins (merchant_id, permissions)
       VALUES ($1, $2)`,
      [merchantId, JSON.stringify({})]
    )

    console.log('\n✅ Admin account created successfully!')
    console.log('\n📋 Account Details:')
    console.log(`   ID: ${merchantId}`)
    console.log(`   Email: ${email}`)
    console.log(`   Name: ${name}`)
    console.log(`   Role: admin`)
    console.log(`   Password: ${password}`)
    console.log('\n⚠️  Please change the password after first login!')
    console.log('\n🔗 Login URL: http://localhost:3000/login')
    console.log('   (You may need to create a login page if it doesn\'t exist)')

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Failed to create admin account:', error.message)
    console.error(error)
    process.exit(1)
  }
}

createAdmin()





