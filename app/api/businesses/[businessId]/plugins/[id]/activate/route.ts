// Business Plugin Activate API
// POST /api/businesses/[businessId]/plugins/[id]/activate - Activate plugin

import { NextRequest } from 'next/server'
import { success, error, serverError, notFound } from '@/lib/api-response'
import { requireBusinessOwnership } from '@/lib/middleware'
import { pluginManager } from '@/services/plugin-manager'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string; id: string }> }
) {
  try {
    const { businessId, id } = await params

    const ownershipResult = await requireBusinessOwnership(request, businessId)
    if (!ownershipResult.success) {
      return ownershipResult.response
    }

    const userId = ownershipResult.user.userId

    await pluginManager.activatePluginForBusiness(id, businessId, userId)

    return success(null, 'تم تفعيل الإضافة بنجاح')
  } catch (err: any) {
    if (err.message?.includes('غير موجودة')) {
      return notFound(err.message)
    }
    console.error('Error activating plugin:', err)
    return error(err.message || 'فشل في تفعيل الإضافة', 500)
  }
}

