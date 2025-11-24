// Plugin Settings API Route
// POST /api/merchant/plugins/:id/settings

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireMerchant } from '@/lib/middleware'
import { queryOne, query } from '@/lib/db'
import type { BusinessProfile, InstalledPlugin, Plugin } from '@/types/database'

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

    // Get merchant's profile
    const profile = await queryOne<BusinessProfile>(
      `SELECT id FROM business_profiles WHERE merchant_id = $1`,
      [user.userId]
    )

    if (!profile) {
      return error('الملف التجاري غير موجود', 404)
    }

    // Check installed plugin exists and belongs to merchant
    const installed = await queryOne<InstalledPlugin>(
      `SELECT * FROM installed_plugins WHERE id = $1 AND profile_id = $2`,
      [id, profile.id]
    )

    if (!installed) {
      return error('الإضافة غير موجودة', 404)
    }

    // Get plugin to validate settings schema
    const plugin = await queryOne<Plugin>(
      `SELECT * FROM plugins WHERE plugin_key = $1`,
      [installed.plugin_key]
    )

    if (!plugin) {
      return error('الإضافة غير موجودة', 404)
    }

    // Get settings from body
    const body = await request.json()
    const { settings, is_active } = body

    // TODO: Validate settings against config_schema_json if provided
    // For now, just save the settings

    // Update settings
    const updateFields: string[] = []
    const updateValues: any[] = []
    let paramIndex = 1

    if (settings !== undefined) {
      updateFields.push(`settings = $${paramIndex}`)
      updateValues.push(JSON.stringify(settings))
      paramIndex++
    }

    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramIndex}`)
      updateValues.push(is_active)
      paramIndex++
    }

    if (updateFields.length === 0) {
      return error('لا توجد بيانات للتحديث', 400)
    }

    updateFields.push(`updated_at = NOW()`)
    updateValues.push(id)

    const updateQuery = `
      UPDATE installed_plugins 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const updated = await queryOne<InstalledPlugin>(updateQuery, updateValues)

    if (!updated) {
      return error('فشل في تحديث إعدادات الإضافة', 500)
    }

    return success(
      {
        settings: updated.settings,
        is_active: updated.is_active,
      },
      'تم تحديث إعدادات الإضافة بنجاح'
    )
  } catch (err: any) {
    console.error('Error updating plugin settings:', err)
    return error('فشل في تحديث إعدادات الإضافة', 500)
  }
}

