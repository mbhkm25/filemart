// Merchant Gallery API Route
// GET /api/merchant/gallery
// POST /api/merchant/gallery

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireMerchant } from '@/lib/middleware'
import { queryOne, query } from '@/lib/db'
import type { BusinessProfile, GalleryImage } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const authResult = requireMerchant(request)
    if (!authResult.success) {
      return authResult.response
    }
    const user = authResult.user

    // Get merchant's profile
    const profile = await queryOne<BusinessProfile>(
      `SELECT id FROM business_profiles WHERE merchant_id = $1`,
      [user.userId]
    )

    if (!profile) {
      return error('الملف التجاري غير موجود', 404)
    }

    // Get gallery images
    const images = await query<GalleryImage>(
      `SELECT * FROM gallery_images WHERE profile_id = $1 ORDER BY display_order ASC, created_at DESC`,
      [profile.id]
    )

    return success(images)
  } catch (err: any) {
    console.error('Error fetching gallery:', err)
    return error('فشل في جلب الصور', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = requireMerchant(request)
    if (!authResult.success) {
      return authResult.response
    }
    const user = authResult.user

    // Get merchant's profile
    const profile = await queryOne<BusinessProfile>(
      `SELECT id FROM business_profiles WHERE merchant_id = $1`,
      [user.userId]
    )

    if (!profile) {
      return error('الملف التجاري غير موجود', 404)
    }

    // Check image count limit (50)
    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM gallery_images WHERE profile_id = $1`,
      [profile.id]
    )
    const currentCount = Number(countResult[0]?.count || 0)

    if (currentCount >= 50) {
      return error('الحد الأقصى 50 صورة', 400)
    }

    // Get request body
    const body = await request.json()
    const { image_url, alt_text } = body

    if (!image_url) {
      return error('image_url مطلوب', 400)
    }

    // Get max display_order
    const maxOrderResult = await query<{ max_order: number }>(
      `SELECT COALESCE(MAX(display_order), 0) as max_order FROM gallery_images WHERE profile_id = $1`,
      [profile.id]
    )
    const maxOrder = maxOrderResult[0]?.max_order || 0

    // Create gallery image
    const image = await queryOne<GalleryImage>(
      `INSERT INTO gallery_images (profile_id, image_url, alt_text, display_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [profile.id, image_url, alt_text || null, maxOrder + 1]
    )

    if (!image) {
      return error('فشل في إضافة الصورة', 500)
    }

    return success(image, 'تم إضافة الصورة بنجاح')
  } catch (err: any) {
    console.error('Error creating gallery image:', err)
    return error('فشل في إضافة الصورة', 500)
  }
}

