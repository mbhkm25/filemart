// Admin Settings API Route
// GET /api/admin/settings
// PUT /api/admin/settings

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireAdmin } from '@/lib/middleware'
import { getAllSettings, setSetting } from '@/services/settings-service'
import { logAdminAction } from '@/services/logging-service'

// Default settings (used as fallback)
const defaultSettings = {
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587'),
    username: process.env.SMTP_USERNAME || '',
    password: process.env.SMTP_PASSWORD || '',
    from_email: process.env.SMTP_FROM_EMAIL || 'noreply@filemart.com',
    from_name: process.env.SMTP_FROM_NAME || 'FileMart',
  },
  api_keys: {
    cloudinary_cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
    cloudinary_upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '',
  },
  storage_limits: {
    max_images_per_merchant: 50,
    max_file_size_mb: 5,
  },
  maintenance_mode: {
    enabled: false,
    message: 'المنصة قيد الصيانة. نعتذر عن الإزعاج.',
  },
  registration: {
    enabled: true,
    approval_required: false,
  },
}

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAdmin(request)
    if (!authResult.success) {
      return authResult.response
    }

    // Fetch from database settings table
    try {
      const dbSettings = await getAllSettings()
      
      // Merge with defaults (database takes precedence)
      const settings = {
        smtp: { ...defaultSettings.smtp, ...(dbSettings.smtp || {}) },
        api_keys: { ...defaultSettings.api_keys, ...(dbSettings.api_keys || {}) },
        storage_limits: { ...defaultSettings.storage_limits, ...(dbSettings.storage_limits || {}) },
        maintenance_mode: { ...defaultSettings.maintenance_mode, ...(dbSettings.maintenance_mode || {}) },
        registration: { ...defaultSettings.registration, ...(dbSettings.registration || {}) },
      }

      return success(settings)
    } catch (dbError) {
      // If database error, return defaults
      console.warn('Error fetching from database, using defaults:', dbError)
      return success(defaultSettings)
    }
  } catch (err: any) {
    console.error('Error fetching settings:', err)
    return error('فشل في جلب الإعدادات', 500)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = requireAdmin(request)
    if (!authResult.success) {
      return authResult.response
    }
    const user = authResult.user

    const body = await request.json()

    // Validate and save each setting to database
    const settingsToSave: Record<string, any> = {
      smtp: body.smtp || defaultSettings.smtp,
      api_keys: body.api_keys || defaultSettings.api_keys,
      storage_limits: body.storage_limits || defaultSettings.storage_limits,
      maintenance_mode: body.maintenance_mode || defaultSettings.maintenance_mode,
      registration: body.registration || defaultSettings.registration,
    }

    // Save each setting
    for (const [key, value] of Object.entries(settingsToSave)) {
      await setSetting(key, value, undefined, user.userId)
    }

    // Log admin action
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null
    const userAgent = request.headers.get('user-agent') || null
    
    await logAdminAction({
      userId: user.userId,
      action: 'update_settings',
      resourceType: 'settings',
      resourceId: null,
      details: { settings: Object.keys(settingsToSave) },
      ipAddress: clientIp,
      userAgent,
    })

    return success(settingsToSave, 'تم تحديث الإعدادات بنجاح')
  } catch (err: any) {
    console.error('Error updating settings:', err)
    return error('فشل في تحديث الإعدادات', 500)
  }
}

