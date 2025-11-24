// Merchant Profile API Routes
// GET /api/merchant/profile
// PUT /api/merchant/profile

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireMerchant } from '@/lib/middleware'
import { queryOne, query } from '@/lib/db'
import { businessProfileUpdateSchema } from '@/lib/validations'
import type { BusinessProfile } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const authResult = requireMerchant(request)
    if (!authResult.success) {
      return authResult.response
    }
    const user = authResult.user

    // Fetch merchant's business profile
    const profile = await queryOne<BusinessProfile>(
      `SELECT * FROM business_profiles WHERE merchant_id = $1`,
      [user.userId]
    )

    if (!profile) {
      return error('الملف التجاري غير موجود', 404)
    }

    return success({
      id: profile.id,
      merchant_id: profile.merchant_id,
      slug: profile.slug,
      name: profile.name,
      description: profile.description,
      logo_url: profile.logo_url,
      cover_url: profile.cover_url,
      category: profile.category,
      address: profile.address,
      city: profile.city,
      country: profile.country,
      latitude: profile.latitude ? Number(profile.latitude) : null,
      longitude: profile.longitude ? Number(profile.longitude) : null,
      working_hours: profile.working_hours,
      contact_links: profile.contact_links,
      primary_color: profile.primary_color,
      secondary_color: profile.secondary_color,
      is_published: profile.is_published,
      completion_percentage: profile.completion_percentage,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    })
  } catch (err: any) {
    console.error('Error fetching merchant profile:', err)
    return error('فشل في جلب الملف التجاري', 500)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = requireMerchant(request)
    if (!authResult.success) {
      return authResult.response
    }
    const user = authResult.user

    // Get request body
    const body = await request.json()

    // Validate input
    const validatedData = businessProfileUpdateSchema.parse(body)

    // Fetch existing profile
    const existingProfile = await queryOne<BusinessProfile>(
      `SELECT * FROM business_profiles WHERE merchant_id = $1`,
      [user.userId]
    )

    if (!existingProfile) {
      return error('الملف التجاري غير موجود', 404)
    }

    // Build update query dynamically
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

    // Add updated_at
    updateFields.push(`updated_at = NOW()`)
    updateValues.push(existingProfile.id)

    // TODO: Calculate completion_percentage based on filled fields

    const updateQuery = `
      UPDATE business_profiles 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const updatedProfile = await queryOne<BusinessProfile>(
      updateQuery,
      updateValues
    )

    if (!updatedProfile) {
      return error('فشل في تحديث الملف التجاري', 500)
    }

    return success({
      id: updatedProfile.id,
      slug: updatedProfile.slug,
      name: updatedProfile.name,
      description: updatedProfile.description,
      logo_url: updatedProfile.logo_url,
      cover_url: updatedProfile.cover_url,
      category: updatedProfile.category,
      address: updatedProfile.address,
      city: updatedProfile.city,
      country: updatedProfile.country,
      latitude: updatedProfile.latitude ? Number(updatedProfile.latitude) : null,
      longitude: updatedProfile.longitude ? Number(updatedProfile.longitude) : null,
      working_hours: updatedProfile.working_hours,
      contact_links: updatedProfile.contact_links,
      primary_color: updatedProfile.primary_color,
      secondary_color: updatedProfile.secondary_color,
      is_published: updatedProfile.is_published,
      completion_percentage: updatedProfile.completion_percentage,
      updated_at: updatedProfile.updated_at,
    })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return error('بيانات غير صحيحة', 400, err.errors)
    }
    console.error('Error updating merchant profile:', err)
    return error('فشل في تحديث الملف التجاري', 500)
  }
}

