// Update Merchant Status API Route
// PUT /api/admin/merchants/:id/status

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireAdmin } from '@/lib/middleware'
import { queryOne, query } from '@/lib/db'
import type { Merchant } from '@/types/database'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = requireAdmin(request)
    if (!authResult.success) {
      return authResult.response
    }

    const { id } = await params

    // Get request body
    const body = await request.json()
    const { is_active } = body

    if (typeof is_active !== 'boolean') {
      return error('is_active يجب أن يكون boolean', 400)
    }

    // Check merchant exists
    const merchant = await queryOne<Merchant>(
      `SELECT * FROM merchants WHERE id = $1`,
      [id]
    )

    if (!merchant) {
      return error('التاجر غير موجود', 404)
    }

    // Update status
    await query(
      `UPDATE merchants SET is_active = $1, updated_at = NOW() WHERE id = $2`,
      [is_active, id]
    )

    // TODO: Log admin action

    return success({ is_active }, 'تم تحديث حالة التاجر بنجاح')
  } catch (err: any) {
    console.error('Error updating merchant status:', err)
    return error('فشل في تحديث حالة التاجر', 500)
  }
}

