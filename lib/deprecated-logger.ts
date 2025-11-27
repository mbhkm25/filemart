// Deprecated endpoints telemetry helper
// Safe to import during build (avoids throwing if DATABASE_URL unset)

import type { NextRequest } from 'next/server'
import { query } from '@/lib/db'

export async function logDeprecated(req: NextRequest | Request) {
  try {
    const method = (req as any).method || 'GET'
    const url = (req as any).url || ''
    const headers = (req as any).headers

    const path = (() => {
      try {
        return new URL(url).pathname
      } catch (e) {
        return String(url)
      }
    })()

    const ip = headers?.get?.('x-forwarded-for') || headers?.get?.('x-real-ip') || null
    const ua = headers?.get?.('user-agent') || null

    if (process.env.DATABASE_URL) {
      // Fire-and-forget, don't block or throw build-time errors
      query(
        `INSERT INTO deprecated_api_hits (path, method, ip_address, user_agent, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [path, method, ip, ua]
      ).catch(() => {
        // swallow errors
      })
    } else {
      // During local dev/build where DB not configured, just log
      console.warn('[deprecated-api] ', method, path, ip)
    }
  } catch (err) {
    // Never throw from logger
    console.error('logDeprecated error', err)
  }
}
