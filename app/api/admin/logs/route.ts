// Admin Logs API Route
// GET /api/admin/logs

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireAdmin } from '@/lib/middleware'
import { query } from '@/lib/db'
import type { SystemLog } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAdmin(request)
    if (!authResult.success) {
      return authResult.response
    }

    // Get filter params
    const { searchParams } = new URL(request.url)
    const logType = searchParams.get('type')
    const userId = searchParams.get('user_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    let queryText = `SELECT * FROM system_logs WHERE 1=1`
    const params: any[] = []
    let paramIndex = 1

    if (logType) {
      queryText += ` AND log_type = $${paramIndex}`
      params.push(logType)
      paramIndex++
    }

    if (userId) {
      queryText += ` AND user_id = $${paramIndex}`
      params.push(userId)
      paramIndex++
    }

    if (startDate) {
      queryText += ` AND created_at >= $${paramIndex}`
      params.push(startDate)
      paramIndex++
    }

    if (endDate) {
      queryText += ` AND created_at <= $${paramIndex}`
      params.push(endDate)
      paramIndex++
    }

    // Get total count
    const countResult = await query<{ count: string }>(
      queryText.replace(/SELECT.*FROM/, 'SELECT COUNT(*)::text as count FROM'),
      params
    )
    const total = Number(countResult[0]?.count || 0)

    // Get logs with pagination
    queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const logs = await query<SystemLog>(queryText, params)

    return success({
      logs: logs.map((log) => ({
        id: log.id,
        log_type: log.log_type,
        user_id: log.user_id,
        user_role: log.user_role,
        action: log.action,
        resource_type: log.resource_type,
        resource_id: log.resource_id,
        details: log.details,
        ip_address: log.ip_address,
        user_agent: log.user_agent,
        created_at: log.created_at,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err: any) {
    console.error('Error fetching logs:', err)
    return error('فشل في جلب السجلات', 500)
  }
}

