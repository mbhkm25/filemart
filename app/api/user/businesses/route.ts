// User Businesses API Route
// GET /api/user/businesses - Get all businesses owned by the current user
// POST /api/user/businesses - Create a new business for the current user

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireUser } from '@/lib/middleware'
import { query, queryOne } from '@/lib/db'
import { businessCreateSchema } from '@/lib/validations'
import type { BusinessProfile } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const authResult = requireUser(request)
    if (!authResult.success) {
      return authResult.response
    }

    const businesses = await query<BusinessProfile & { type?: string }>(
      `SELECT id, name, description, COALESCE(type, 'store') as type, slug, created_at
       FROM business_profiles
       WHERE merchant_id = $1
       ORDER BY created_at DESC`,
      [authResult.user.userId]
    )

    return success({
      businesses: businesses.map((b) => ({
        id: b.id,
        name: b.name,
        description: b.description,
        type: (b.type || 'store') as 'store' | 'service',
        slug: b.slug,
        created_at: b.created_at,
      })),
    })
  } catch (err: any) {
    console.error('Error fetching user businesses:', err)
    return error('فشل في جلب الملفات التجارية', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = requireUser(request)
    if (!authResult.success) {
      return authResult.response
    }

    const body = await request.json()
    const validatedData = businessCreateSchema.parse(body)

    // Generate slug from name if not provided
    let slug = validatedData.slug || validatedData.name.toLowerCase().replace(/\s+/g, '-')
    
    // Ensure slug is unique
    let slugExists = true
    let slugCounter = 1
    let finalSlug = slug
    
    while (slugExists) {
      const existing = await queryOne<{ id: string }>(
        `SELECT id FROM business_profiles WHERE slug = $1`,
        [finalSlug]
      )
      
      if (!existing) {
        slugExists = false
      } else {
        finalSlug = `${slug}-${slugCounter}`
        slugCounter++
      }
    }

    // Create business profile
    // Try to insert with type, fallback to without type if column doesn't exist
    let business: (BusinessProfile & { type?: string }) | null = null
    
    try {
      business = await queryOne<BusinessProfile & { type?: string }>(
        `INSERT INTO business_profiles (merchant_id, name, description, type, slug, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING id, name, description, COALESCE(type, 'store') as type, slug, created_at`,
        [
          authResult.user.userId,
          validatedData.name,
          validatedData.description || null,
          validatedData.type,
          finalSlug,
        ]
      )
    } catch (err: any) {
      // If type column doesn't exist, insert without it
      if (err.message?.includes('column') && err.message?.includes('type')) {
        business = await queryOne<BusinessProfile & { type?: string }>(
          `INSERT INTO business_profiles (merchant_id, name, description, slug, created_at, updated_at)
           VALUES ($1, $2, $3, $4, NOW(), NOW())
           RETURNING id, name, description, 'store' as type, slug, created_at`,
          [
            authResult.user.userId,
            validatedData.name,
            validatedData.description || null,
            finalSlug,
          ]
        )
      } else {
        throw err
      }
    }

    if (!business) {
      return error('فشل في إنشاء الملف التجاري', 500)
    }

    return success(
      {
        id: business.id,
        name: business.name,
        description: business.description,
        type: business.type,
        slug: business.slug,
        created_at: business.created_at,
      },
      'تم إنشاء الملف التجاري بنجاح'
    )
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return error('بيانات غير صحيحة', 400, err.errors)
    }
    console.error('Error creating business:', err)
    return error('فشل في إنشاء الملف التجاري', 500)
  }
}

