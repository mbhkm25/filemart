// Public Businesses API Route
// GET /api/public/businesses
// Returns all published business profiles with search, filter, and pagination

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { query } from '@/lib/db'
import type { BusinessProfile } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const city = searchParams.get('city') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    // Validate pagination
    if (page < 1) {
      return error('رقم الصفحة يجب أن يكون أكبر من صفر', 400)
    }
    if (limit < 1 || limit > 100) {
      return error('عدد النتائج يجب أن يكون بين 1 و 100', 400)
    }

    const offset = (page - 1) * limit

    // Build query
    let queryText = `
      SELECT 
        id,
        slug,
        name,
        description,
        logo_url,
        cover_url,
        category,
        city,
        country,
        created_at
      FROM business_profiles
      WHERE is_published = true
    `
    const params: any[] = []
    let paramIndex = 1

    // Add search filter
    if (search) {
      queryText += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    // Add category filter
    if (category) {
      queryText += ` AND category = $${paramIndex}`
      params.push(category)
      paramIndex++
    }

    // Add city filter
    if (city) {
      queryText += ` AND city = $${paramIndex}`
      params.push(city)
      paramIndex++
    }

    // Get total count
    const countQuery = queryText.replace(
      /SELECT[\s\S]*?FROM/,
      'SELECT COUNT(*)::text as count FROM'
    )
    const countResult = await query<{ count: string }>(countQuery, params)
    const total = Number(countResult[0]?.count || 0)

    // Add ordering and pagination
    queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    // Execute query
    const businesses = await query<BusinessProfile>(queryText, params)

    // Format response
    const formattedBusinesses = businesses.map((b) => ({
      id: b.id,
      slug: b.slug,
      name: b.name,
      description: b.description,
      logoUrl: b.logo_url,
      coverUrl: b.cover_url,
      category: b.category,
      city: b.city,
      country: b.country,
      createdAt: b.created_at,
    }))

    return success({
      businesses: formattedBusinesses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err: any) {
    console.error('Error fetching businesses:', err)
    return error('فشل في جلب الملفات التجارية', 500)
  }
}

