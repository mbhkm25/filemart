// Business Plugin Settings API
// POST /api/businesses/[businessId]/plugins/[id]/settings - Update plugin settings

import { NextRequest } from 'next/server'
import { success, error, serverError, notFound } from '@/lib/api-response'
import { requireBusinessOwnership } from '@/lib/middleware'
import { query, queryOne } from '@/lib/db'
import type { InstalledPlugin, PluginSettings } from '@/types/database'

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

    // Verify plugin belongs to this business
    const installed = await queryOne<InstalledPlugin>(
      `SELECT * FROM installed_plugins WHERE id = $1 AND business_id = $2`,
      [id, businessId]
    )

    if (!installed) {
      return notFound('الإضافة غير موجودة')
    }

    const body = await request.json()
    const { settings, is_active } = body

    // Update is_active if provided
    if (typeof is_active === 'boolean') {
      await query(
        `UPDATE installed_plugins 
         SET is_active = $1, updated_at = NOW()
         WHERE id = $2`,
        [is_active, id]
      )
    }

    // Update settings if provided
    if (settings) {
      const existing = await queryOne<PluginSettings>(
        `SELECT * FROM plugin_settings WHERE installed_plugin_id = $1`,
        [id]
      )

      if (existing) {
        await query(
          `UPDATE plugin_settings 
           SET settings_json = $1, updated_at = NOW()
           WHERE installed_plugin_id = $2`,
          [JSON.stringify(settings), id]
        )
      } else {
        await query(
          `INSERT INTO plugin_settings (installed_plugin_id, settings_json)
           VALUES ($1, $2)`,
          [id, JSON.stringify(settings)]
        )
      }
    }

    // Return updated plugin info
    const updated = await queryOne<
      InstalledPlugin & { plugin_key: string; settings_json: any }
    >(
      `SELECT 
        ip.*,
        p.plugin_key,
        ps.settings_json
       FROM installed_plugins ip
       JOIN plugins p ON ip.plugin_id = p.id
       LEFT JOIN plugin_settings ps ON ps.installed_plugin_id = ip.id
       WHERE ip.id = $1`,
      [id]
    )

    return success(
      {
        id: updated!.id,
        pluginKey: updated!.plugin_key,
        isActive: updated!.is_active,
        settings: (updated!.settings_json as Record<string, any>) || {},
      },
      'تم تحديث إعدادات الإضافة بنجاح'
    )
  } catch (err: any) {
    console.error('Error updating plugin settings:', err)
    return serverError('فشل في تحديث إعدادات الإضافة')
  }
}

