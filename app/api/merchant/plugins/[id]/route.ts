// Plugin Installation Management API Route
// GET /api/merchant/plugins/:id
// DELETE /api/merchant/plugins/:id

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireMerchant } from '@/lib/middleware'
import { queryOne } from '@/lib/db'
import { pluginManager } from '@/services/plugin-manager'
import type { InstalledPlugin } from '@/types/database'

export async function GET(
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

    // Get installation details
    const installed = await queryOne<InstalledPlugin & { plugin_key: string; name: string; description: string | null }>(
      `SELECT ip.*, p.plugin_key, p.name, p.description
       FROM installed_plugins ip
       JOIN plugins p ON ip.plugin_id = p.id
       WHERE ip.id = $1 AND ip.merchant_id = $2`,
      [id, user.userId]
    )

    if (!installed) {
      return error('الإضافة غير موجودة', 404)
    }

    return success({
      id: installed.id,
      plugin_key: installed.plugin_key,
      name: installed.name,
      description: installed.description,
      is_active: installed.is_active,
      installed_version: installed.installed_version,
      installed_at: installed.installed_at,
      updated_at: installed.updated_at,
    })
  } catch (err: any) {
    console.error('Error fetching plugin:', err)
    return error('فشل في جلب الإضافة', 500)
  }
}

export async function DELETE(
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

    // Uninstall plugin using plugin manager
    await pluginManager.uninstallPlugin(id, user.userId)

    return success(null, 'تم إزالة الإضافة بنجاح')
  } catch (err: any) {
    console.error('Error uninstalling plugin:', err)
    return error(err.message || 'فشل في إزالة الإضافة', 500)
  }
}
