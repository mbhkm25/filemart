// Delete Gallery Image API Route
// DELETE /api/merchant/gallery/:id

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireMerchant } from '@/lib/middleware'
import { queryOne, query } from '@/lib/db'
import { createHash } from 'crypto'
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

    // Delete from Cloudinary if URL is from Cloudinary
    if (image.image_url && image.image_url.includes('cloudinary.com')) {
      try {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        if (cloudName) {
          // Extract public_id from URL
          const urlParts = image.image_url.split('/')
          const uploadIndex = urlParts.findIndex((part) => part === 'upload')
          if (uploadIndex > 0) {
            const publicIdParts = urlParts.slice(uploadIndex + 2) // Skip 'upload' and version
            const publicId = publicIdParts.join('/').replace(/\.[^/.]+$/, '') // Remove extension

            // Delete from Cloudinary
            const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET
            if (cloudinaryApiSecret) {
              const timestamp = Math.round(new Date().getTime() / 1000)
              const signature = createHash('sha1')
                .update(`public_id=${publicId}&timestamp=${timestamp}${cloudinaryApiSecret}`)
                .digest('hex')

              await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    public_id: publicId,
                    timestamp,
                    signature,
                  }),
                }
              )
            }
          }
        }
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError)
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }

    // Delete image from database
    await query(`DELETE FROM gallery_images WHERE id = $1`, [id])

    return success(null, 'تم حذف الصورة بنجاح')
  } catch (err: any) {
    console.error('Error deleting gallery image:', err)
    return error('فشل في حذف الصورة', 500)
  }
}

