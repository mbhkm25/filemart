// Merchant Orders API Route
// GET /api/merchant/orders

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireMerchant } from '@/lib/middleware'
import { queryOne, query } from '@/lib/db'
import type { BusinessProfile, Order, OrderItem } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const authResult = requireMerchant(request)
    if (!authResult.success) {
      return authResult.response
    }
    const user = authResult.user

    // Get merchant's profile
    const profile = await queryOne<BusinessProfile>(
      `SELECT id FROM business_profiles WHERE merchant_id = $1`,
      [user.userId]
    )

    if (!profile) {
      return error('الملف التجاري غير موجود', 404)
    }

    // Get filter params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let queryText = `SELECT * FROM orders WHERE profile_id = $1`
    const params: any[] = [profile.id]

    if (status && status !== 'all') {
      queryText += ` AND status = $2`
      params.push(status)
    }

    queryText += ` ORDER BY created_at DESC`

    const orders = await query<Order>(queryText, params)

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await query<OrderItem>(
          `SELECT * FROM order_items WHERE order_id = $1`,
          [order.id]
        )

        // Calculate total
        const total = items.reduce(
          (sum, item) => sum + Number(item.unit_price) * item.quantity,
          0
        )

        return {
          id: order.id,
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

    // Calculate stats
    const stats = {
      new: orders.filter((o) => o.status === 'new').length,
      processing: orders.filter((o) => o.status === 'processing').length,
      completed: orders.filter((o) => o.status === 'completed').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    }

    return success({
      orders: ordersWithItems,
      stats,
    })
  } catch (err: any) {
    console.error('Error fetching orders:', err)
    return error('فشل في جلب الطلبات', 500)
  }
}

