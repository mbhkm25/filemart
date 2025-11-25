// Merchant Notifications API Route
// PUT /api/merchant/notifications
// Update notification preferences

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireMerchant } from '@/lib/middleware'
import { query } from '@/lib/db'
import { z } from 'zod'

const notificationsUpdateSchema = z.object({
  email_notifications: z.boolean().optional(),
  push_notifications: z.boolean().optional(),
})

export async function PUT(request: NextRequest) {
  try {
    const authResult = requireMerchant(request)
    if (!authResult.success) {
      return authResult.response
    }
    const user = authResult.user

    const body = await request.json()
    const validatedData = notificationsUpdateSchema.parse(body)

    // Build update query
    const updateFields: string[] = []
    const updateValues: any[] = []
    let paramIndex = 1

    if (validatedData.email_notifications !== undefined) {
      updateFields.push(`email_notifications = $${paramIndex}`)
      updateValues.push(validatedData.email_notifications)
      paramIndex++
    }

    if (validatedData.push_notifications !== undefined) {
      updateFields.push(`push_notifications = $${paramIndex}`)
      updateValues.push(validatedData.push_notifications)
      paramIndex++
    }

    if (updateFields.length === 0) {
      return error('لا توجد بيانات للتحديث', 400)
    }

    updateFields.push(`updated_at = NOW()`)
    updateValues.push(user.userId)

    await query(
      `UPDATE merchants SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
      updateValues
    )

    return success(null, 'تم تحديث إعدادات الإشعارات بنجاح')
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return error('بيانات غير صحيحة', 400, err.errors)
    }
    console.error('Error updating notifications:', err)
    return error('فشل في تحديث الإشعارات', 500)
  }
}

