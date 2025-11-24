// Merchant Plugins API Route
// GET /api/merchant/plugins
// POST /api/merchant/plugins/install

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireMerchant } from '@/lib/middleware'
import { queryOne, query } from '@/lib/db'
import type { BusinessProfile, Plugin, InstalledPlugin } from '@/types/database'

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
    const installedPlugins = await query<InstalledPlugin>(
      `SELECT ip.*, p.name, p.description, p.version, p.is_premium, p.price
       FROM installed_plugins ip
       JOIN plugins p ON ip.plugin_key = p.plugin_key
       WHERE ip.profile_id = $1`,
      [profile.id]
    )

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
        plugin_key: ip.plugin_key,
        name: ip.name,
        description: ip.description,
        version: ip.version,
        is_premium: ip.is_premium,
        price: ip.price ? Number(ip.price) : null,
        is_active: ip.is_active,
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

    // Get merchant's profile
    const profile = await queryOne<BusinessProfile>(
      `SELECT id FROM business_profiles WHERE merchant_id = $1`,
      [user.userId]
    )

    if (!profile) {
      return error('الملف التجاري غير موجود', 404)
    }

    // Get request body
    const body = await request.json()
    const { plugin_key } = body

    if (!plugin_key) {
      return error('plugin_key مطلوب', 400)
    }

    // Check plugin exists
    const plugin = await queryOne<Plugin>(
      `SELECT * FROM plugins WHERE plugin_key = $1 AND is_active = true`,
      [plugin_key]
    )

    if (!plugin) {
      return error('الإضافة غير موجودة', 404)
    }

    // Check if already installed
    const existing = await queryOne<InstalledPlugin>(
      `SELECT * FROM installed_plugins WHERE profile_id = $1 AND plugin_key = $2`,
      [profile.id, plugin_key]
    )

    if (existing) {
      return error('الإضافة مثبتة بالفعل', 400)
    }

    // Install plugin
    const installed = await queryOne<InstalledPlugin>(
      `INSERT INTO installed_plugins (profile_id, plugin_key, is_active, settings)
       VALUES ($1, $2, true, '{}'::jsonb)
       RETURNING *`,
      [profile.id, plugin_key]
    )

    if (!installed) {
      return error('فشل في تثبيت الإضافة', 500)
    }

    return success(
      {
        id: installed.id,
        plugin_key: installed.plugin_key,
        is_active: installed.is_active,
      },
      'تم تثبيت الإضافة بنجاح'
    )
  } catch (err: any) {
    console.error('Error installing plugin:', err)
    return error('فشل في تثبيت الإضافة', 500)
  }
}

