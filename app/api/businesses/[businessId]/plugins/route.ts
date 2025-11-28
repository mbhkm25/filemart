// Business Plugins API
// GET /api/businesses/[businessId]/plugins - List installed + available plugins
// POST /api/businesses/[businessId]/plugins - Install a plugin

import { NextRequest } from 'next/server'
import { success, error, serverError } from '@/lib/api-response'
import { requireBusinessOwnership } from '@/lib/middleware'
import { query } from '@/lib/db'
import { pluginManager } from '@/services/plugin-manager'
import type { Plugin, InstalledPlugin } from '@/types/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params

    const ownershipResult = await requireBusinessOwnership(request, businessId)
    if (!ownershipResult.success) {
      return ownershipResult.response
    }

    const userId = ownershipResult.user.userId

    // Get installed plugins for this business
    const installed = await query<
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
       WHERE ip.business_id = $1
       ORDER BY ip.installed_at DESC`,
      [businessId]
    )

    // Get all available plugins (marketplace)
    const available = await query<Plugin>(
      `SELECT * FROM plugins 
       WHERE is_active = true 
       AND id NOT IN (
         SELECT plugin_id FROM installed_plugins WHERE business_id = $1
       )
       ORDER BY name ASC`,
      [businessId]
    )

    return success({
      installed: installed.map((ip) => ({
        id: ip.id,
        pluginKey: ip.plugin_key,
        pluginName: ip.plugin_name,
        isActive: ip.is_active,
        installedVersion: ip.installed_version,
        installedAt: ip.installed_at,
        settings: (ip.settings_json as Record<string, any>) || {},
      })),
      available: available.map((p) => ({
        id: p.id,
        pluginKey: p.plugin_key,
        name: p.name,
        description: p.description,
        version: p.version,
        type: p.type,
        isPremium: p.is_premium,
        price: Number(p.price),
      })),
    })
  } catch (err: any) {
    console.error('Error fetching business plugins:', err)
    return serverError('فشل في جلب الإضافات')
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params

    const ownershipResult = await requireBusinessOwnership(request, businessId)
    if (!ownershipResult.success) {
      return ownershipResult.response
    }

    const userId = ownershipResult.user.userId
    const body = await request.json()
    const { pluginKey } = body

    if (!pluginKey) {
      return error('معرف الإضافة مطلوب', 400)
    }

    // Install plugin using businessId
    const installed = await pluginManager.installPluginForBusiness(pluginKey, businessId, userId)

    return success(installed, 'تم تثبيت الإضافة بنجاح')
  } catch (err: any) {
    if (err.message?.includes('مثبتة بالفعل')) {
      return error(err.message, 409)
    }
    console.error('Error installing plugin:', err)
    return error(err.message || 'فشل في تثبيت الإضافة', 500)
  }
}

