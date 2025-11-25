// Plugin Activation API Route
// POST /api/merchant/plugins/:id/activate

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

    // Activate plugin using plugin manager
    await pluginManager.activatePlugin(id, user.userId)

    return success(null, 'تم تفعيل الإضافة بنجاح')
  } catch (err: any) {
    console.error('Error activating plugin:', err)
    return error(err.message || 'فشل في تفعيل الإضافة', 500)
  }
}

