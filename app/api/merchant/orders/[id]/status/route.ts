// Update Order Status API Route
// PUT /api/merchant/orders/:id/status

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireMerchant } from '@/lib/middleware'
import { queryOne, query } from '@/lib/db'
import type { BusinessProfile, Order } from '@/types/database'

const validStatusTransitions: Record<string, string[]> = {
  new: ['processing', 'cancelled'],
  processing: ['completed', 'cancelled'],
  completed: [], // Cannot change from completed
  cancelled: [], // Cannot change from cancelled
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = requireMerchant(request)
    if (!authResult.success) {
      return authResult.response
    }
    const user = authResult.user

    const { id } = await params

    // Get merchant's profile
    const profile = await queryOne<BusinessProfile>(
      `SELECT id FROM business_profiles WHERE merchant_id = $1`,
      [user.userId]
    )

    if (!profile) {
      return error('الملف التجاري غير موجود', 404)
    }

    // Check order exists and belongs to merchant
    const order = await queryOne<Order>(
      `SELECT * FROM orders WHERE id = $1 AND profile_id = $2`,
      [id, profile.id]
    )

    if (!order) {
      return error('الطلب غير موجود', 404)
    }

    // Get new status from body
    const body = await request.json()
    const newStatus = body.status

    if (!newStatus || !['new', 'processing', 'completed', 'cancelled'].includes(newStatus)) {
      return error('حالة غير صالحة', 400)
    }

    // Validate status transition
    const allowedTransitions = validStatusTransitions[order.status]
    if (!allowedTransitions.includes(newStatus)) {
      return error(
        `لا يمكن تغيير الحالة من ${order.status} إلى ${newStatus}`,
        400
      )
    }

    // Update status
    await query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2`,
      [newStatus, id]
    )

    return success({ status: newStatus }, 'تم تحديث حالة الطلب بنجاح')
  } catch (err: any) {
    console.error('Error updating order status:', err)
    return error('فشل في تحديث حالة الطلب', 500)
  }
}

