// Admin Customers API Route
// GET /api/admin/customers

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireAdmin } from '@/lib/middleware'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAdmin(request)
    if (!authResult.success) {
      return authResult.response
    }

    // Get filter params
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let queryText = `
      SELECT 
        client_phone,
        client_name,
        COUNT(*)::text as orders_count,
        MAX(created_at) as last_order_date,
        SUM((SELECT SUM(unit_price * quantity) FROM order_items WHERE order_id = o.id))::text as total_spent
      FROM orders o
      WHERE client_phone IS NOT NULL
    `
    const params: any[] = []
    let paramIndex = 1

    if (search) {
      queryText += ` AND (client_name ILIKE $${paramIndex} OR client_phone ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    queryText += ` GROUP BY client_phone, client_name`

    // Get total count
    const countResult = await query<{ count: string }>(
      `SELECT COUNT(DISTINCT client_phone)::text as count FROM orders WHERE client_phone IS NOT NULL ${
        search ? `AND (client_name ILIKE $1 OR client_phone ILIKE $1)` : ''
      }`,
      search ? [`%${search}%`] : []
    )
    const total = Number(countResult[0]?.count || 0)

    // Get customers with pagination
    queryText += ` ORDER BY last_order_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const customers = await query(queryText, params)

    return success({
      customers: customers.map((c: any) => ({
        phone: c.client_phone,
        name: c.client_name,
        orders_count: Number(c.orders_count || 0),
        last_order_date: c.last_order_date,
        total_spent: Number(c.total_spent || 0),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err: any) {
    console.error('Error fetching customers:', err)
    return error('فشل في جلب العملاء', 500)
  }
}

