// Uninstall Plugin API Route
// DELETE /api/merchant/plugins/:id

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireMerchant } from '@/lib/middleware'
import { queryOne, query } from '@/lib/db'
import type { BusinessProfile, InstalledPlugin } from '@/types/database'

export async function DELETE(
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

    // Check installed plugin exists and belongs to merchant
    const installed = await queryOne<InstalledPlugin>(
      `SELECT * FROM installed_plugins WHERE id = $1 AND profile_id = $2`,
      [id, profile.id]
    )

    if (!installed) {
      return error('الإضافة غير موجودة', 404)
    }

    // Delete installation
    await query(`DELETE FROM installed_plugins WHERE id = $1`, [id])

    return success(null, 'تم إلغاء تثبيت الإضافة بنجاح')
  } catch (err: any) {
    console.error('Error uninstalling plugin:', err)
    return error('فشل في إلغاء تثبيت الإضافة', 500)
  }
}

