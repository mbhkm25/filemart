// Delete Gallery Image API Route
// DELETE /api/merchant/gallery/:id

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireMerchant } from '@/lib/middleware'
import { queryOne, query } from '@/lib/db'
import type { BusinessProfile, GalleryImage } from '@/types/database'

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

    // Check image exists and belongs to merchant
    const image = await queryOne<GalleryImage>(
      `SELECT * FROM gallery_images WHERE id = $1 AND profile_id = $2`,
      [id, profile.id]
    )

    if (!image) {
      return error('الصورة غير موجودة', 404)
    }

    // TODO: Delete from Cloudinary if needed
    // For now, just delete from database

    // Delete image
    await query(`DELETE FROM gallery_images WHERE id = $1`, [id])

    return success(null, 'تم حذف الصورة بنجاح')
  } catch (err: any) {
    console.error('Error deleting gallery image:', err)
    return error('فشل في حذف الصورة', 500)
  }
}

