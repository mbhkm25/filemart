// Admin Customer Details API Route
// GET /api/admin/customers/:phone

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireAdmin } from '@/lib/middleware'
import { query } from '@/lib/db'
import type { Order } from '@/types/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  try {
    const authResult = requireAdmin(request)
    if (!authResult.success) {
      return authResult.response
    }

    const { phone } = await params
    const decodedPhone = decodeURIComponent(phone)

    // Get customer info
    const customerInfo = await query(
      `SELECT 
        client_phone,
        client_name,
        COUNT(*)::text as orders_count,
        MAX(created_at) as last_order_date,
        SUM((SELECT SUM(price_at_order * quantity) FROM order_items WHERE order_id = o.id))::text as total_spent
       FROM orders o
       WHERE client_phone = $1
       GROUP BY client_phone, client_name`,
      [decodedPhone]
    )

    if (customerInfo.length === 0) {
      return error('العميل غير موجود', 404)
    }

    const customer = customerInfo[0]

    // Get orders history
    const orders = await query<Order>(
      `SELECT o.*, bp.name as business_name
       FROM orders o
       LEFT JOIN business_profiles bp ON o.profile_id = bp.id
       WHERE o.client_phone = $1
       ORDER BY o.created_at DESC`,
      [decodedPhone]
    )

    return success({
      customer: {
        phone: customer.client_phone,
        name: customer.client_name,
        orders_count: Number(customer.orders_count || 0),
        last_order_date: customer.last_order_date,
        total_spent: Number(customer.total_spent || 0),
      },
      orders: orders.map((o: any) => ({
        id: o.id,
        business_name: o.business_name,
        status: o.status,
        total_amount: 0, // Will be calculated if needed
        created_at: o.created_at,
      })),
    })
  } catch (err: any) {
    console.error('Error fetching customer:', err)
    return error('فشل في جلب بيانات العميل', 500)
  }
}

