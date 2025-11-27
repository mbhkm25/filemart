// User Account API Route
// GET /api/user/account - Get current authenticated user account data

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireUser } from '@/lib/middleware'
import { queryOne } from '@/lib/db'
import type { Merchant } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const authResult = requireUser(request)
    if (!authResult.success) {
      return authResult.response
    }

    const user = await queryOne<Merchant>(
      `SELECT * FROM merchants WHERE id = $1`,
      [authResult.user.userId]
    )

    if (!user) {
      return error('المستخدم غير موجود', 404)
    }

    return success({
      merchant: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
        is_active: user.is_active,
        email_verified: user.email_verified,
        phone_verified: user.phone_verified,
        email_notifications: user.email_notifications,
        push_notifications: user.push_notifications,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    })
  } catch (err: any) {
    console.error('Error fetching user account:', err)
    return error('فشل في جلب بيانات المستخدم', 500)
  }
}

