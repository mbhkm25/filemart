// Merchant Plugins API Route
// GET /api/merchant/plugins
// POST /api/merchant/plugins
// Follows DFD Section 6: Plugin Installation Flow

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireMerchant } from '@/lib/middleware'
import { queryOne, query } from '@/lib/db'
import { pluginManager } from '@/services/plugin-manager'
import { pluginInstallSchema } from '@/lib/validations'
import type { BusinessProfile, Plugin } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const authResult = requireMerchant(request)
    if (!authResult.success) {
      return authResult.response
    }
    const user = authResult.user

    // Get merchant's profile
    const profile = await queryOne<BusinessProfile>(
      `SELECT id FROM business_profiles WHERE merchant_id = $1`,
      [user.userId]
    )

    if (!profile) {
      return error('الملف التجاري غير موجود', 404)
    }

    // Get all available plugins
    const availablePlugins = await query<Plugin>(
      `SELECT * FROM plugins WHERE is_active = true ORDER BY name ASC`
    )

    // Get installed plugins for this merchant
    const installedPlugins = await pluginManager.getInstalledPlugins(user.userId)

    return success({
      available: availablePlugins.map((p) => ({
        id: p.id,
        plugin_key: p.plugin_key,
        name: p.name,
        description: p.description,
        version: p.version,
        is_premium: p.is_premium,
        price: p.price ? Number(p.price) : null,
      })),
      installed: installedPlugins.map((ip) => ({
        id: ip.id,
        plugin_key: ip.pluginKey,
        is_active: ip.isActive,
        installed_version: ip.installedVersion,
        installed_at: ip.installedAt,
        settings: ip.settings,
      })),
    })
  } catch (err: any) {
    console.error('Error fetching plugins:', err)
    return error('فشل في جلب الإضافات', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = requireMerchant(request)
    if (!authResult.success) {
      return authResult.response
    }
    const user = authResult.user

    // Get request body and validate
    const body = await request.json()
    const validation = pluginInstallSchema.safeParse(body)

    if (!validation.success) {
      return error(
        validation.error.errors.map((e) => e.message).join(', '),
        400
      )
    }

    const { plugin_key } = validation.data

    // Install plugin using plugin manager
    // This follows DFD Section 6: validate → load metadata → record in DB → run init → mark active
    const installed = await pluginManager.installPlugin(plugin_key, user.userId)

    return success(
      {
        id: installed.id,
        plugin_key: installed.pluginKey,
        is_active: installed.isActive,
      },
      'تم تثبيت الإضافة بنجاح'
    )
  } catch (err: any) {
    console.error('Error installing plugin:', err)
    return error(err.message || 'فشل في تثبيت الإضافة', 500)
  }
}

