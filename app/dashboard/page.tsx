// Dashboard Home Page
// Welcome, Profile Completion, Quick Actions, Stats, Tips

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import Link from 'next/link'
import DashboardHomeClient from './DashboardHomeClient'
import { queryOne, query } from '@/lib/db'
import type { BusinessProfile, Merchant, Order, Product } from '@/types/database'

async function getMerchantData(userId: string) {
  // Get merchant info
  const merchant = await queryOne<Merchant>(
    `SELECT * FROM merchants WHERE id = $1`,
    [userId]
  )

  if (!merchant) {
    return null
  }

  // Get business profile
  const profile = await queryOne<BusinessProfile>(
    `SELECT * FROM business_profiles WHERE merchant_id = $1`,
    [userId]
  )

  // Get stats
  let newOrdersCount = 0
  let productsCount = 0
  let completedOrdersCount = 0

  if (profile?.id) {
    const [newOrders, products, completedOrders] = await Promise.all([
      query<{ count: string }>(
        `SELECT COUNT(*)::text as count FROM orders 
         WHERE profile_id = $1 AND status = 'new'`,
        [profile.id]
      ),
      query<{ count: string }>(
        `SELECT COUNT(*)::text as count FROM products 
         WHERE profile_id = $1 AND status = 'active'`,
        [profile.id]
      ),
      query<{ count: string }>(
        `SELECT COUNT(*)::text as count FROM orders 
         WHERE profile_id = $1 AND status = 'completed' 
         AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`,
        [profile.id]
      ),
    ])

    newOrdersCount = Number(newOrders[0]?.count || 0)
    productsCount = Number(products[0]?.count || 0)
    completedOrdersCount = Number(completedOrders[0]?.count || 0)
  }

  return {
    merchant,
    profile,
    stats: {
      newOrders: newOrdersCount,
      products: productsCount,
      completedOrders: completedOrdersCount,
    },
  }
}

export default async function DashboardHomePage() {
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

  const data = await getMerchantData(user.userId)

  if (!data) {
    redirect('/login')
  }

  return (
    <DashboardHomeClient
      merchantName={data.merchant.name}
      profile={data.profile}
      stats={data.stats}
    />
  )
}
