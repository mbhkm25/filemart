// Admin Profile API Route
// GET /api/admin/profiles/:id
// PUT /api/admin/profiles/:id

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireAdmin } from '@/lib/middleware'
import { queryOne, query } from '@/lib/db'
import { businessProfileUpdateSchema } from '@/lib/validations'
import type { BusinessProfile } from '@/types/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = requireAdmin(request)
    if (!authResult.success) {
      return authResult.response
    }

    const { id } = await params

    const profile = await queryOne<BusinessProfile>(
      `SELECT * FROM business_profiles WHERE id = $1`,
      [id]
    )

    if (!profile) {
      return error('الملف التجاري غير موجود', 404)
    }

    return success(profile)
  } catch (err: any) {
    console.error('Error fetching profile:', err)
    return error('فشل في جلب الملف التجاري', 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = requireAdmin(request)
    if (!authResult.success) {
      return authResult.response
    }

    const { id } = await params

    const body = await request.json()
    const validatedData = businessProfileUpdateSchema.parse(body)

    // Build update query
    const updateFields: string[] = []
    const updateValues: any[] = []
    let paramIndex = 1

    Object.entries(validatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`)
        updateValues.push(value)
        paramIndex++
      }
    })

    if (updateFields.length === 0) {
      return error('لا توجد بيانات للتحديث', 400)
    }

    updateFields.push(`updated_at = NOW()`)
    updateValues.push(id)

    const updateQuery = `
      UPDATE business_profiles 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const updatedProfile = await queryOne<BusinessProfile>(updateQuery, updateValues)

    if (!updatedProfile) {
      return error('فشل في تحديث الملف التجاري', 500)
    }

    // TODO: Log admin action

    return success(updatedProfile, 'تم تحديث الملف التجاري بنجاح')
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return error('بيانات غير صحيحة', 400, err.errors)
    }
    console.error('Error updating profile:', err)
    return error('فشل في تحديث الملف التجاري', 500)
  }
}

