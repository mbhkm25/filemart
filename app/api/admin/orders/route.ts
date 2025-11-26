// Admin Orders API Route
// GET /api/admin/orders

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireAdmin } from '@/lib/middleware'
import { query } from '@/lib/db'
import type { Order } from '@/types/database'

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
    const merchantId = searchParams.get('merchant_id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let queryText = `
      SELECT 
        o.*,
        bp.name as business_name,
        bp.slug as business_slug,
        m.name as merchant_name
      FROM orders o
      LEFT JOIN business_profiles bp ON o.profile_id = bp.id
      LEFT JOIN merchants m ON bp.merchant_id = m.id
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (status) {
      queryText += ` AND o.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    if (merchantId) {
      queryText += ` AND bp.merchant_id = $${paramIndex}`
      params.push(merchantId)
      paramIndex++
    }

    if (search) {
      queryText += ` AND (o.client_name ILIKE $${paramIndex} OR o.client_phone ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    // Get total count
    const countResult = await query<{ count: string }>(
      queryText.replace(/SELECT.*FROM/, 'SELECT COUNT(*)::text as count FROM'),
      params
    )
    const total = Number(countResult[0]?.count || 0)

    // Get orders with pagination
    queryText += ` ORDER BY o.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const orders = await query<Order & { business_name: string; business_slug: string; merchant_name: string }>(
      queryText,
      params
    )

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await query(
          `SELECT * FROM order_items WHERE order_id = $1`,
          [order.id]
        )

        const total = items.reduce(
          (sum: number, item: any) => sum + Number(item.unit_price) * item.quantity,
          0
        )

        return {
          id: order.id,
          profile_id: order.profile_id,
          business_name: order.business_name,
          business_slug: order.business_slug,
          merchant_name: order.merchant_name,
          client_name: order.client_name,
          client_phone: order.client_phone,
          status: order.status,
          total_amount: total,
          items_count: items.length,
          created_at: order.created_at,
          updated_at: order.updated_at,
          notes: order.notes,
        }
      })
    )

    return success({
      orders: ordersWithItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err: any) {
    console.error('Error fetching orders:', err)
    return error('فشل في جلب الطلبات', 500)
  }
}

