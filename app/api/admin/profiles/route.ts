// Admin Profiles API Route
// GET /api/admin/profiles

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireAdmin } from '@/lib/middleware'
import { query } from '@/lib/db'
import type { BusinessProfile } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAdmin(request)
    if (!authResult.success) {
      return authResult.response
    }

    // Get filter params
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let queryText = `
      SELECT 
        bp.*,
        m.name as merchant_name,
        m.email as merchant_email
      FROM business_profiles bp
      LEFT JOIN merchants m ON bp.merchant_id = m.id
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (status === 'published') {
      queryText += ` AND bp.is_published = true`
    } else if (status === 'unpublished') {
      queryText += ` AND bp.is_published = false`
    }

    if (search) {
      queryText += ` AND (bp.name ILIKE $${paramIndex} OR bp.slug ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    // Get total count
    const countResult = await query<{ count: string }>(
      queryText.replace(/SELECT.*FROM/, 'SELECT COUNT(*)::text as count FROM'),
      params
    )
    const total = Number(countResult[0]?.count || 0)

    // Get profiles with pagination
    queryText += ` ORDER BY bp.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const profiles = await query<BusinessProfile & { merchant_name: string; merchant_email: string }>(
      queryText,
      params
    )

    return success({
      profiles: profiles.map((p) => ({
        id: p.id,
        merchant_id: p.merchant_id,
        merchant_name: p.merchant_name,
        merchant_email: p.merchant_email,
        slug: p.slug,
        name: p.name,
        description: p.description,
        category: p.category,
        is_published: p.is_published,
        completion_percentage: p.completion_percentage,
        created_at: p.created_at,
        updated_at: p.updated_at,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err: any) {
    console.error('Error fetching profiles:', err)
    return error('فشل في جلب الملفات التجارية', 500)
  }
}

