// Public Plugin Widget API Route
// GET /api/public/plugins/:id/widget
// Loads plugin widget for public profile pages
// Follows DFD Section 10: Public Widget Rendering

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { queryOne } from '@/lib/db'
import { pluginLoader } from '@/services/plugin-loader'
import type { InstalledPlugin, BusinessProfile } from '@/types/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const businessId = searchParams.get('businessId') || searchParams.get('profileId') // Support both for backward compatibility

    if (!businessId) {
      return error('businessId query parameter is required', 400)
    }

    // Get installation - verify it belongs to this business
    const installed = await queryOne<InstalledPlugin & { plugin_key: string }>(
      `SELECT ip.*, p.plugin_key
       FROM installed_plugins ip
       JOIN plugins p ON ip.plugin_id = p.id
       WHERE ip.id = $1 AND ip.business_id = $2 AND ip.is_active = true`,
      [id, businessId]
    )

    if (!installed) {
      return error('Plugin installation not found or inactive', 404)
    }

    // Verify business profile exists
    const profile = await queryOne<BusinessProfile>(
      `SELECT id, merchant_id FROM business_profiles WHERE id = $1`,
      [businessId]
    )

    if (!profile) {
      return error('Business profile not found', 404)
    }

    // Load widget using plugin loader with businessId
    const result = await pluginLoader.loadPublicWidget(
      installed.plugin_key,
      businessId,
      id
    )

    if (!result.success) {
      return error(
        result.error?.message || 'Failed to load plugin widget',
        500
      )
    }

    // In production, this would return the component module or component data
    // For now, return success with metadata
    return success({
      pluginKey: installed.plugin_key,
      installationId: id,
      loaded: result.success,
      cached: result.cached,
    })
  } catch (err: any) {
    console.error('Error loading plugin widget:', err)
    return error('Failed to load plugin widget', 500)
  }
}

