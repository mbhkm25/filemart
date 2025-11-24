// Admin Plugins API Route
// GET /api/admin/plugins
// POST /api/admin/plugins

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireAdmin } from '@/lib/middleware'
import { query, queryOne } from '@/lib/db'
import type { Plugin } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAdmin(request)
    if (!authResult.success) {
      return authResult.response
    }

    const plugins = await query<Plugin>(
      `SELECT 
        p.*,
        COUNT(ip.id)::text as install_count
       FROM plugins p
       LEFT JOIN installed_plugins ip ON p.plugin_key = ip.plugin_key
       GROUP BY p.id
       ORDER BY p.name ASC`
    )

    return success(
      plugins.map((p: any) => ({
        id: p.id,
        plugin_key: p.plugin_key,
        name: p.name,
        description: p.description,
        version: p.version,
        is_premium: p.is_premium,
        price: p.price ? Number(p.price) : null,
        is_active: p.is_active,
        install_count: Number(p.install_count || 0),
        created_at: p.created_at,
        updated_at: p.updated_at,
      }))
    )
  } catch (err: any) {
    console.error('Error fetching plugins:', err)
    return error('فشل في جلب الإضافات', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = requireAdmin(request)
    if (!authResult.success) {
      return authResult.response
    }

    const body = await request.json()
    const { plugin_key, name, description, version, is_premium, price, config_schema_json, is_active } = body

    if (!plugin_key || !name || !version) {
      return error('plugin_key, name, و version مطلوبة', 400)
    }

    // Check if plugin_key already exists
    const existing = await queryOne<Plugin>(
      `SELECT * FROM plugins WHERE plugin_key = $1`,
      [plugin_key]
    )

    if (existing) {
      return error('plugin_key موجود بالفعل', 400)
    }

    // Create plugin
    const plugin = await queryOne<Plugin>(
      `INSERT INTO plugins (
        plugin_key, name, description, version, is_premium, price, config_schema_json, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        plugin_key,
        name,
        description || null,
        version,
        is_premium || false,
        price || null,
        config_schema_json ? JSON.stringify(config_schema_json) : null,
        is_active !== undefined ? is_active : true,
      ]
    )

    if (!plugin) {
      return error('فشل في إنشاء الإضافة', 500)
    }

    // TODO: Log admin action

    return success(plugin, 'تم إنشاء الإضافة بنجاح')
  } catch (err: any) {
    console.error('Error creating plugin:', err)
    return error('فشل في إنشاء الإضافة', 500)
  }
}

