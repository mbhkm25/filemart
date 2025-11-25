// Plugin Settings API Route
// POST /api/merchant/plugins/:id/settings
// Follows DFD Section 10: Dashboard Settings Flow

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireMerchant } from '@/lib/middleware'
import { queryOne, query } from '@/lib/db'
import { pluginValidator } from '@/services/plugin-validator'
import { sanitizePluginConfig } from '@/lib/plugin-utils'
import type { BusinessProfile, InstalledPlugin, Plugin, PluginSettings } from '@/types/database'

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

    // Check installed plugin exists and belongs to merchant
    const installed = await queryOne<InstalledPlugin>(
      `SELECT * FROM installed_plugins WHERE id = $1 AND merchant_id = $2`,
      [id, user.userId]
    )

    if (!installed) {
      return error('الإضافة غير موجودة', 404)
    }

    // Get plugin to validate settings schema
    const plugin = await queryOne<Plugin>(
      `SELECT * FROM plugins WHERE id = $1`,
      [installed.plugin_id]
    )

    if (!plugin) {
      return error('الإضافة غير موجودة', 404)
    }

    // Get settings from body
    const body = await request.json()
    const { settings, is_active } = body

    // Validate settings against config_schema_json if provided
    if (settings !== undefined && plugin.config_schema_json) {
      const schema = typeof plugin.config_schema_json === 'string'
        ? JSON.parse(plugin.config_schema_json)
        : plugin.config_schema_json

      const validation = pluginValidator.validateConfigSchema(settings, schema)

      if (!validation.valid) {
        return error(
          `إعدادات غير صحيحة: ${validation.errors?.join(', ')}`,
          400
        )
      }

      // Sanitize settings
      const sanitized = sanitizePluginConfig(settings)
      
      // Update plugin_settings table
      const existingSettings = await queryOne<PluginSettings>(
        `SELECT * FROM plugin_settings WHERE installed_plugin_id = $1`,
        [id]
      )

      if (existingSettings) {
        await query(
          `UPDATE plugin_settings 
           SET settings_json = $1, updated_at = NOW()
           WHERE installed_plugin_id = $2`,
          [JSON.stringify(sanitized), id]
        )
      } else {
        await query(
          `INSERT INTO plugin_settings (installed_plugin_id, settings_json)
           VALUES ($1, $2)`,
          [id, JSON.stringify(sanitized)]
        )
      }
    }

    // Update is_active if provided
    if (is_active !== undefined) {
      await query(
        `UPDATE installed_plugins 
         SET is_active = $1, updated_at = NOW()
         WHERE id = $2`,
        [is_active, id]
      )
    }

    // Get updated settings
    const updatedSettings = await queryOne<PluginSettings>(
      `SELECT settings_json FROM plugin_settings WHERE installed_plugin_id = $1`,
      [id]
    )

    const updated = await queryOne<InstalledPlugin>(
      `SELECT * FROM installed_plugins WHERE id = $1`,
      [id]
    )

    return success(
      {
        settings: updatedSettings?.settings_json || {},
        is_active: updated?.is_active,
      },
      'تم تحديث إعدادات الإضافة بنجاح'
    )
  } catch (err: any) {
    console.error('Error updating plugin settings:', err)
    return error('فشل في تحديث إعدادات الإضافة', 500)
  }
}

