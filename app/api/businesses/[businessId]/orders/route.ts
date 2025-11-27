// Business Orders API
// GET /api/businesses/[businessId]/orders
// BIRM: business-scoped orders listing
import { NextRequest } from 'next/server'
import { success, serverError } from '@/lib/api-response'
import { requireBusinessOwnership } from '@/lib/middleware'
import { query } from '@/lib/db'
import type { Order } from '@/types/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params

    const ownershipResult = await requireBusinessOwnership(request, businessId)
    if (!ownershipResult.success) {
      return ownershipResult.response
    }

    // TODO(BIRM Phase F): add explicit business_id column to orders and use it directly
    const orders = await query<Order>(
      `SELECT id, client_name, client_phone, client_email, total_amount, status, created_at
       FROM orders
       WHERE profile_id = $1
       ORDER BY created_at DESC`,
      [businessId]
    )

    return success(
      orders.map((o) => ({
        id: o.id,
        client_name: o.client_name,
        client_phone: o.client_phone,
        client_email: o.client_email,
        total: o.total_amount,
        status: o.status,
        created_at: o.created_at,
      }))
    )
  } catch (err: any) {
    console.error('Error fetching business orders:', err)
    return serverError('فشل في جلب الطلبات')
  }
}


