// Admin Merchants API Route
// GET /api/admin/merchants

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireAdmin } from '@/lib/middleware'
import { query } from '@/lib/db'
import type { Merchant } from '@/types/database'

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

    let queryText = `SELECT id, email, phone, name, role, is_active, email_verified, phone_verified, created_at, updated_at FROM merchants WHERE 1=1`
    const params: any[] = []
    let paramIndex = 1

    if (status) {
      queryText += ` AND is_active = $${paramIndex}`
      params.push(status === 'active')
      paramIndex++
    }

    if (search) {
      queryText += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    // Get total count
    const countResult = await query<{ count: string }>(
      queryText.replace(/SELECT.*FROM/, 'SELECT COUNT(*)::text as count FROM'),
      params
    )
    const total = Number(countResult[0]?.count || 0)

    // Get merchants with pagination
    queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const merchants = await query<Merchant>(queryText, params)

    return success({
      merchants: merchants.map((m) => ({
        id: m.id,
        email: m.email,
        phone: m.phone,
        name: m.name,
        role: m.role,
        is_active: m.is_active,
        email_verified: m.email_verified,
        phone_verified: m.phone_verified,
        created_at: m.created_at,
        updated_at: m.updated_at,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err: any) {
    console.error('Error fetching merchants:', err)
    return error('فشل في جلب التجار', 500)
  }
}

