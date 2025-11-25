// Merchant Account API Route
// PUT /api/merchant/account
// Update merchant account information

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireMerchant } from '@/lib/middleware'
import { queryOne, query } from '@/lib/db'
import { verifyPassword, hashPassword } from '@/lib/auth'
import { z } from 'zod'
import type { Merchant } from '@/types/database'

const accountUpdateSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح').optional(),
  phone: z.string().min(10).max(20).optional().nullable(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'كلمة المرور يجب أن تكون على الأقل 6 أحرف').optional(),
})

export async function PUT(request: NextRequest) {
  try {
    const authResult = requireMerchant(request)
    if (!authResult.success) {
      return authResult.response
    }
    const user = authResult.user

    const body = await request.json()
    const validatedData = accountUpdateSchema.parse(body)

    // Get current merchant
    const merchant = await queryOne<Merchant>(
      `SELECT * FROM merchants WHERE id = $1`,
      [user.userId]
    )

    if (!merchant) {
      return error('المستخدم غير موجود', 404)
    }

    // If changing password, verify current password
    if (validatedData.newPassword) {
      if (!validatedData.currentPassword) {
        return error('كلمة المرور الحالية مطلوبة', 400)
      }

      const isPasswordValid = await verifyPassword(
        validatedData.currentPassword,
        merchant.password_hash
      )

      if (!isPasswordValid) {
        return error('كلمة المرور الحالية غير صحيحة', 401)
      }
    }

    // Check if email is already taken (if changing)
    if (validatedData.email && validatedData.email !== merchant.email) {
      const existingMerchant = await queryOne<Merchant>(
        `SELECT id FROM merchants WHERE email = $1 AND id != $2`,
        [validatedData.email, user.userId]
      )

      if (existingMerchant) {
        return error('البريد الإلكتروني مستخدم بالفعل', 400)
      }
    }

    // Build update query
    const updateFields: string[] = []
    const updateValues: any[] = []
    let paramIndex = 1

    if (validatedData.email) {
      updateFields.push(`email = $${paramIndex}`)
      updateValues.push(validatedData.email)
      paramIndex++
    }

    if (validatedData.phone !== undefined) {
      updateFields.push(`phone = $${paramIndex}`)
      updateValues.push(validatedData.phone)
      paramIndex++
    }

    if (validatedData.newPassword) {
      const hashedPassword = await hashPassword(validatedData.newPassword)
      updateFields.push(`password_hash = $${paramIndex}`)
      updateValues.push(hashedPassword)
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

    return success(null, 'تم تحديث الحساب بنجاح')
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return error('بيانات غير صحيحة', 400, err.errors)
    }
    console.error('Error updating account:', err)
    return error('فشل في تحديث الحساب', 500)
  }
}

