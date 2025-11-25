// Delete Merchant Account API Route
// DELETE /api/merchant/delete-account
// Delete merchant account and all associated data

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireMerchant } from '@/lib/middleware'
import { query } from '@/lib/db'
import { z } from 'zod'

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
  confirm: z.literal(true, { errorMap: () => ({ message: 'يجب تأكيد حذف الحساب' }) }),
})

export async function DELETE(request: NextRequest) {
  try {
    const authResult = requireMerchant(request)
    if (!authResult.success) {
      return authResult.response
    }
    const user = authResult.user

    const body = await request.json()
    const validatedData = deleteAccountSchema.parse(body)

    // Verify password
    const merchant = await query(
      `SELECT password_hash FROM merchants WHERE id = $1`,
      [user.userId]
    )

    if (!merchant || merchant.length === 0) {
      return error('المستخدم غير موجود', 404)
    }

    const { verifyPassword } = await import('@/lib/auth')
    const isPasswordValid = await verifyPassword(
      validatedData.password,
      merchant[0].password_hash
    )

    if (!isPasswordValid) {
      return error('كلمة المرور غير صحيحة', 401)
    }

    // Delete merchant (CASCADE will delete all related data)
    await query(`DELETE FROM merchants WHERE id = $1`, [user.userId])

    return success(null, 'تم حذف الحساب بنجاح')
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return error('بيانات غير صحيحة', 400, err.errors)
    }
    console.error('Error deleting account:', err)
    return error('فشل في حذف الحساب', 500)
  }
}

