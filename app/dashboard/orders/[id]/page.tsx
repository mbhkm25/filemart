// Order Details Page
// Full order information and status management

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import OrderDetailsClient from './OrderDetailsClient'
import { queryOne, query } from '@/lib/db'
import type { BusinessProfile, Order, OrderItem } from '@/types/database'

async function getOrder(orderId: string, userId: string) {
  const profile = await queryOne<BusinessProfile>(
    `SELECT id FROM business_profiles WHERE merchant_id = $1`,
    [userId]
  )

  if (!profile) {
    return null
  }

  const order = await queryOne<Order>(
    `SELECT * FROM orders WHERE id = $1 AND profile_id = $2`,
    [orderId, profile.id]
  )

  if (!order) {
    return null
  }

  const items = await query<OrderItem>(
    `SELECT * FROM order_items WHERE order_id = $1`,
    [orderId]
  )

  return { order, items }
}

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Check authentication
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    redirect('/login')
  }

  const user = verifyToken(token)
  if (!user || (user.role !== 'merchant' && user.role !== 'admin')) {
    redirect('/login')
  }

  const { id } = await params
  const data = await getOrder(id, user.userId)

  if (!data) {
    redirect('/dashboard/orders')
  }

  return <OrderDetailsClient order={data.order} items={data.items} />
}

