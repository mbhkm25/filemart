// Admin Stats API Route
// GET /api/admin/stats

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

    // Get stats
    const [merchantsCount, profilesCount, ordersCount, customersCount, pluginsCount] = await Promise.all([
      query<{ count: string }>(`SELECT COUNT(*)::text as count FROM merchants`).then((r) => Number(r[0]?.count || 0)),
      query<{ count: string }>(`SELECT COUNT(*)::text as count FROM business_profiles`).then((r) => Number(r[0]?.count || 0)),
      query<{ count: string }>(`SELECT COUNT(*)::text as count FROM orders`).then((r) => Number(r[0]?.count || 0)),
      query<{ count: string }>(`SELECT COUNT(DISTINCT client_phone)::text as count FROM orders WHERE client_phone IS NOT NULL`).then((r) => Number(r[0]?.count || 0)),
      query<{ count: string }>(`SELECT COUNT(*)::text as count FROM plugins WHERE is_active = true`).then((r) => Number(r[0]?.count || 0)),
    ])

    // Get recent activity
    const recentOrders = await query(
      `SELECT o.*, bp.name as business_name 
       FROM orders o
       LEFT JOIN business_profiles bp ON o.profile_id = bp.id
       ORDER BY o.created_at DESC
       LIMIT 10`
    )

    const recentMerchants = await query(
      `SELECT * FROM merchants ORDER BY created_at DESC LIMIT 5`
    )

    // Get monthly growth (last 6 months)
    const monthlyGrowth = await query(
      `SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*)::text as count
       FROM merchants
       WHERE created_at >= NOW() - INTERVAL '6 months'
       GROUP BY month
       ORDER BY month ASC`
    )

    return success({
      stats: {
        merchants: merchantsCount,
        profiles: profilesCount,
        orders: ordersCount,
        customers: customersCount,
        plugins: pluginsCount,
      },
      recentActivity: {
        orders: recentOrders,
        merchants: recentMerchants,
      },
      monthlyGrowth: monthlyGrowth.map((m: any) => ({
        month: m.month,
        count: Number(m.count),
      })),
    })
  } catch (err: any) {
    console.error('Error fetching admin stats:', err)
    return error('فشل في جلب الإحصائيات', 500)
  }
}

