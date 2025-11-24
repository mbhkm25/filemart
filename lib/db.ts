// Neon DB Client with Connection Pooling

import { neon, neonConfig } from '@neondatabase/serverless'
import { Pool } from '@neondatabase/serverless'
import ws from 'ws'

// Configure WebSocket for Node.js environment
if (typeof globalThis.WebSocket === 'undefined') {
  neonConfig.webSocketConstructor = ws
}

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Create connection pool
export const pool = new Pool({
  connectionString: databaseUrl,
})

// SQL client for direct queries
export const sql = neon(databaseUrl)

// Helper function to execute queries with error handling
export async function query<T = any>(
  queryText: string,
  params?: any[]
): Promise<T[]> {
  try {
    const result = await pool.query(queryText, params)
    return result.rows as T[]
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// Helper function for single row queries
export async function queryOne<T = any>(
  queryText: string,
  params?: any[]
): Promise<T | null> {
  const results = await query<T>(queryText, params)
  return results[0] || null
}

// Transaction helper
export async function transaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// Close pool (for cleanup)
export async function closePool() {
  await pool.end()
}

