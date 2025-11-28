// Business Plugin Deactivate API
// POST /api/businesses/[businessId]/plugins/[id]/deactivate - Deactivate plugin

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

    await pluginManager.deactivatePluginForBusiness(id, businessId, userId)

    return success(null, 'تم إلغاء تفعيل الإضافة بنجاح')
  } catch (err: any) {
    if (err.message?.includes('غير موجودة')) {
      return notFound(err.message)
    }
    console.error('Error deactivating plugin:', err)
    return error(err.message || 'فشل في إلغاء تفعيل الإضافة', 500)
  }
}

