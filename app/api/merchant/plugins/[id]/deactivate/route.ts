// Plugin Deactivation API Route
// POST /api/merchant/plugins/:id/deactivate

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireMerchant } from '@/lib/middleware'
import { pluginManager } from '@/services/plugin-manager'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = requireMerchant(request)
    if (!authResult.success) {
      return authResult.response
    }
    const user = authResult.user

    const { id } = await params

    // Deactivate plugin using plugin manager
    await pluginManager.deactivatePlugin(id, user.userId)

    return success(null, 'تم تعطيل الإضافة بنجاح')
  } catch (err: any) {
    console.error('Error deactivating plugin:', err)
    return error(err.message || 'فشل في تعطيل الإضافة', 500)
  }
}

