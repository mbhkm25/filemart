// Business Plugin Details API
// GET /api/businesses/[businessId]/plugins/[id] - Get plugin details
// DELETE /api/businesses/[businessId]/plugins/[id] - Uninstall plugin

import { NextRequest } from 'next/server'
import { success, error, serverError, notFound } from '@/lib/api-response'
import { requireBusinessOwnership } from '@/lib/middleware'
import { queryOne } from '@/lib/db'
import { pluginManager } from '@/services/plugin-manager'
import type { InstalledPlugin } from '@/types/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string; id: string }> }
) {
  try {
    const { businessId, id } = await params

    const ownershipResult = await requireBusinessOwnership(request, businessId)
    if (!ownershipResult.success) {
      return ownershipResult.response
    }

    const installed = await queryOne<
      InstalledPlugin & { plugin_key: string; plugin_name: string; settings_json: any }
    >(
      `SELECT 
        ip.*,
        p.plugin_key,
        p.name as plugin_name,
        ps.settings_json
       FROM installed_plugins ip
       JOIN plugins p ON ip.plugin_id = p.id
       LEFT JOIN plugin_settings ps ON ps.installed_plugin_id = ip.id
       WHERE ip.id = $1 AND ip.business_id = $2`,
      [id, businessId]
    )

    if (!installed) {
      return notFound('الإضافة غير موجودة')
    }

    return success({
      id: installed.id,
      pluginKey: installed.plugin_key,
      pluginName: installed.plugin_name,
      isActive: installed.is_active,
      installedVersion: installed.installed_version,
      installedAt: installed.installed_at,
      updatedAt: installed.updated_at,
      settings: (installed.settings_json as Record<string, any>) || {},
    })
  } catch (err: any) {
    console.error('Error fetching plugin details:', err)
    return serverError('فشل في جلب تفاصيل الإضافة')
  }
}

export async function DELETE(
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

    // Verify plugin belongs to this business
    const installed = await queryOne<InstalledPlugin>(
      `SELECT * FROM installed_plugins WHERE id = $1 AND business_id = $2`,
      [id, businessId]
    )

    if (!installed) {
      return notFound('الإضافة غير موجودة')
    }

    await pluginManager.uninstallPluginForBusiness(id, businessId, userId)

    return success(null, 'تم إلغاء تثبيت الإضافة بنجاح')
  } catch (err: any) {
    console.error('Error uninstalling plugin:', err)
    return error(err.message || 'فشل في إلغاء تثبيت الإضافة', 500)
  }
}

