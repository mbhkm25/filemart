// Admin Order Details API Route
// GET /api/admin/orders/:id

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireAdmin } from '@/lib/middleware'
import { queryOne, query } from '@/lib/db'
import type { Order, OrderItem } from '@/types/database'

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

    const order = await queryOne<Order>(
      `SELECT o.*, bp.name as business_name, bp.slug as business_slug, m.name as merchant_name
       FROM orders o
       LEFT JOIN business_profiles bp ON o.profile_id = bp.id
       LEFT JOIN merchants m ON bp.merchant_id = m.id
       WHERE o.id = $1`,
      [id]
    )

    if (!order) {
      return error('الطلب غير موجود', 404)
    }

    const items = await query<OrderItem>(
      `SELECT * FROM order_items WHERE order_id = $1`,
      [id]
    )

    const total = items.reduce(
      (sum, item) => sum + Number(item.price_at_order) * item.quantity,
      0
    )

    return success({
      order: {
        id: order.id,
        profile_id: order.profile_id,
        business_name: (order as any).business_name,
        business_slug: (order as any).business_slug,
        merchant_name: (order as any).merchant_name,
        client_name: order.client_name,
        client_phone: order.client_phone,
        status: order.status,
        notes: order.notes,
        created_at: order.created_at,
        updated_at: order.updated_at,
      },
      items,
      total,
    })
  } catch (err: any) {
    console.error('Error fetching order:', err)
    return error('فشل في جلب تفاصيل الطلب', 500)
  }
}

