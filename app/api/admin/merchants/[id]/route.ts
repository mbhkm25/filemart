// Admin Merchant API Route
// GET /api/admin/merchants/:id
// DELETE /api/admin/merchants/:id

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireAdmin } from '@/lib/middleware'
import { queryOne, query } from '@/lib/db'
import { logAdminAction, getClientIp } from '@/services/logging-service'
import type { Merchant, BusinessProfile, Order } from '@/types/database'

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

    // Get merchant
    const merchant = await queryOne<Merchant>(
      `SELECT id, email, phone, name, role, is_active, email_verified, phone_verified, created_at, updated_at 
       FROM merchants WHERE id = $1`,
      [id]
    )

    if (!merchant) {
      return error('التاجر غير موجود', 404)
    }

    // Get business profile
    const profile = await queryOne<BusinessProfile>(
      `SELECT * FROM business_profiles WHERE merchant_id = $1`,
      [id]
    )

    // Get orders count
    const ordersCount = await query<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM orders WHERE profile_id = $1`,
      [profile?.id || '']
    ).then((r) => Number(r[0]?.count || 0))

    return success({
      merchant: {
        id: merchant.id,
        email: merchant.email,
        phone: merchant.phone,
        name: merchant.name,
        role: merchant.role,
        is_active: merchant.is_active,
        email_verified: merchant.email_verified,
        phone_verified: merchant.phone_verified,
        created_at: merchant.created_at,
        updated_at: merchant.updated_at,
      },
      profile: profile
        ? {
            id: profile.id,
            slug: profile.slug,
            name: profile.name,
            is_published: profile.is_published,
            completion_percentage: profile.completion_percentage,
          }
        : null,
      ordersCount,
    })
  } catch (err: any) {
    console.error('Error fetching merchant:', err)
    return error('فشل في جلب بيانات التاجر', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = requireAdmin(request)
    if (!authResult.success) {
      return authResult.response
    }

    const { id } = await params

    // Get merchant info before deletion for logging
    const merchant = await queryOne<Merchant>(`SELECT name, email FROM merchants WHERE id = $1`, [id])

    // Soft delete (set is_active to false)
    await query(`UPDATE merchants SET is_active = false, updated_at = NOW() WHERE id = $1`, [id])

    // Log admin action
    const clientIp = getClientIp(request)
    const userAgent = request.headers.get('user-agent') || null
    
    await logAdminAction({
      userId: authResult.user.userId,
      action: 'delete_merchant',
      resourceType: 'merchant',
      resourceId: id,
      details: { name: merchant?.name, email: merchant?.email },
      ipAddress: clientIp,
      userAgent,
    })

    return success(null, 'تم حذف التاجر بنجاح')
  } catch (err: any) {
    console.error('Error deleting merchant:', err)
    return error('فشل في حذف التاجر', 500)
  }
}

