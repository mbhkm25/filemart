// Business Settings API
// GET /api/businesses/[businessId]/settings
// PATCH /api/businesses/[businessId]/settings
// BIRM: business-scoped profile settings
import { NextRequest } from 'next/server'
import { success, error, serverError } from '@/lib/api-response'
import { requireBusinessOwnership } from '@/lib/middleware'
import { queryOne, query } from '@/lib/db'

interface BusinessSettings {
  id: string
  name: string
  type: string
  description: string | null
  phone?: string | null
  address: string | null
  logo_url: string | null
  cover_url: string | null
}

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

    const settings = await queryOne<BusinessSettings>(
      `SELECT id, name, type, description, address, logo_url, cover_url
       FROM business_profiles
       WHERE id = $1`,
      [businessId]
    )

    if (!settings) {
      return error('الملف التجاري غير موجود', 404)
    }

    return success(settings)
  } catch (err: any) {
    console.error('Error fetching business settings:', err)
    return serverError('فشل في جلب إعدادات الملف التجاري')
  }
}

export async function PATCH(
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
    const allowedFields: Array<keyof BusinessSettings> = [
      'name',
      'description',
      'address',
      'logo_url',
      'cover_url',
    ]

    const updateFields: string[] = []
    const values: any[] = []
    let idx = 1

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        updateFields.push(`${field} = $${idx}`)
        values.push(body[field])
        idx++
      }
    }

    if (updateFields.length === 0) {
      return error('لا توجد بيانات للتحديث', 400)
    }

    // TODO(BIRM Phase F): move dynamic update into a reusable helper/service
    const updateQuery = `
      UPDATE business_profiles
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${idx}
      RETURNING id, name, type, description, address, logo_url, cover_url
    `

    values.push(businessId)

    const updated = await queryOne<BusinessSettings>(updateQuery, values)

    if (!updated) {
      return serverError('فشل في تحديث إعدادات الملف التجاري')
    }

    return success(
      updated,
      'تم تحديث إعدادات الملف التجاري بنجاح'
    )
  } catch (err: any) {
    console.error('Error updating business settings:', err)
    return serverError('فشل في تحديث إعدادات الملف التجاري')
  }
}


