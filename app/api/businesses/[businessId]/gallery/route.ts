// Business Gallery API
// GET /api/businesses/[businessId]/gallery
// POST /api/businesses/[businessId]/gallery
// BIRM: business-scoped gallery images
import { NextRequest } from 'next/server'
import { success, error, serverError } from '@/lib/api-response'
import { requireBusinessOwnership } from '@/lib/middleware'
import { query, queryOne } from '@/lib/db'
import type { GalleryImage } from '@/types/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params

    const ownershipResult = await requireBusinessOwnership(request, businessId)
    if (!ownershipResult.success) {
      return ownershipResult.response
    }

    // TODO(BIRM Phase F): switch to explicit business_id column when available
    const images = await query<GalleryImage>(
      `SELECT id, image_url, alt_text, created_at
       FROM gallery_images
       WHERE profile_id = $1
       ORDER BY display_order ASC, created_at DESC`,
      [businessId]
    )

    return success(
      images.map((img) => ({
        id: img.id,
        url: img.image_url,
        alt: img.alt_text,
        created_at: img.created_at,
      }))
    )
  } catch (err: any) {
    console.error('Error fetching business gallery:', err)
    return serverError('فشل في جلب الصور')
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params

    const ownershipResult = await requireBusinessOwnership(request, businessId)
    if (!ownershipResult.success) {
      return ownershipResult.response
    }

    const body = await request.json()
    const { url, alt } = body || {}

    if (!url || typeof url !== 'string') {
      return error('رابط الصورة مطلوب', 400)
    }

    // TODO(BIRM Phase F): move to dedicated gallery service and support upload API integration
    const inserted = await queryOne<GalleryImage>(
      `INSERT INTO gallery_images (profile_id, image_url, alt_text)
       VALUES ($1, $2, $3)
       RETURNING id, image_url, alt_text, created_at`,
      [businessId, url, alt || null]
    )

    if (!inserted) {
      return serverError('فشل في إضافة الصورة')
    }

    return success(
      {
        id: inserted.id,
        url: inserted.image_url,
        alt: inserted.alt_text,
        created_at: inserted.created_at,
      },
      'تم إضافة الصورة بنجاح'
    )
  } catch (err: any) {
    console.error('Error adding gallery image for business:', err)
    return serverError('فشل في إضافة الصورة')
  }
}


