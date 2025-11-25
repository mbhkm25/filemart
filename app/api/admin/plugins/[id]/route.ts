// Admin Plugin API Route
// PUT /api/admin/plugins/:id
// DELETE /api/admin/plugins/:id

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireAdmin } from '@/lib/middleware'
import { queryOne, query } from '@/lib/db'
import { logAdminAction, getClientIp } from '@/services/logging-service'
import type { Plugin } from '@/types/database'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = requireAdmin(request)
    if (!authResult.success) {
      return authResult.response
    }

    const { id } = await params

    const body = await request.json()
    const { name, description, version, is_premium, price, config_schema_json, is_active } = body

    // Build update query
    const updateFields: string[] = []
    const updateValues: any[] = []
    let paramIndex = 1

    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex}`)
      updateValues.push(name)
      paramIndex++
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex}`)
      updateValues.push(description)
      paramIndex++
    }
    if (version !== undefined) {
      updateFields.push(`version = $${paramIndex}`)
      updateValues.push(version)
      paramIndex++
    }
    if (is_premium !== undefined) {
      updateFields.push(`is_premium = $${paramIndex}`)
      updateValues.push(is_premium)
      paramIndex++
    }
    if (price !== undefined) {
      updateFields.push(`price = $${paramIndex}`)
      updateValues.push(price)
      paramIndex++
    }
    if (config_schema_json !== undefined) {
      updateFields.push(`config_schema_json = $${paramIndex}`)
      updateValues.push(JSON.stringify(config_schema_json))
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
      UPDATE plugins 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const updatedPlugin = await queryOne<Plugin>(updateQuery, updateValues)

    if (!updatedPlugin) {
      return error('فشل في تحديث الإضافة', 500)
    }

    // Log admin action
    const clientIp = getClientIp(request)
    const userAgent = request.headers.get('user-agent') || null
    
    await logAdminAction({
      userId: authResult.user.userId,
      action: 'update_plugin',
      resourceType: 'plugin',
      resourceId: id,
      details: { updated_fields: Object.keys(body) },
      ipAddress: clientIp,
      userAgent,
    })

    return success(updatedPlugin, 'تم تحديث الإضافة بنجاح')
  } catch (err: any) {
    console.error('Error updating plugin:', err)
    return error('فشل في تحديث الإضافة', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = requireAdmin(request)
    if (!authResult.success) {
      return authResult.response
    }

    const { id } = await params

    // Check if plugin has installations
    const installations = await query(
      `SELECT COUNT(*)::text as count FROM installed_plugins WHERE plugin_key = (SELECT plugin_key FROM plugins WHERE id = $1)`,
      [id]
    )

    const installCount = Number(installations[0]?.count || 0)
    if (installCount > 0) {
      return error(`لا يمكن حذف الإضافة لأنها مثبتة لدى ${installCount} تاجر`, 400)
    }

    // Get plugin info before deletion for logging
    const plugin = await queryOne<Plugin>(`SELECT plugin_key, name FROM plugins WHERE id = $1`, [id])

    // Delete plugin
    await query(`DELETE FROM plugins WHERE id = $1`, [id])

    // Log admin action
    const clientIp = getClientIp(request)
    const userAgent = request.headers.get('user-agent') || null
    
    await logAdminAction({
      userId: authResult.user.userId,
      action: 'delete_plugin',
      resourceType: 'plugin',
      resourceId: id,
      details: { plugin_key: plugin?.plugin_key, name: plugin?.name },
      ipAddress: clientIp,
      userAgent,
    })

    return success(null, 'تم حذف الإضافة بنجاح')
  } catch (err: any) {
    console.error('Error deleting plugin:', err)
    return error('فشل في حذف الإضافة', 500)
  }
}

