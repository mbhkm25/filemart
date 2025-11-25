// Logging Service
// Handles admin action logging

import { query } from '@/lib/db'

export interface LogActionParams {
  userId: string
  action: string
  resourceType: string | null
  resourceId: string | null
  details?: Record<string, any>
  ipAddress?: string | null
  userAgent?: string | null
}

/**
 * Log admin action
 */
export async function logAdminAction(params: LogActionParams): Promise<void> {
  try {
    // Get user role
    const user = await query(
      `SELECT role FROM merchants WHERE id = $1`,
      [params.userId]
    )

    const userRole = user[0]?.role || 'merchant'

    // Insert log (async, don't block)
    query(
      `INSERT INTO system_logs (
        log_type, user_id, user_role, action, resource_type, resource_id, details, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        'admin_action',
        params.userId,
        userRole,
        params.action,
        params.resourceType,
        params.resourceId,
        JSON.stringify(params.details || {}),
        params.ipAddress || null,
        params.userAgent || null,
      ]
    ).catch((err) => {
      // Log error but don't throw (logging should not break main flow)
      console.error('Error logging admin action:', err)
    })
  } catch (err) {
    // Log error but don't throw
    console.error('Error in logAdminAction:', err)
  }
}

/**
 * Get client IP from request
 */
export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || null
}

