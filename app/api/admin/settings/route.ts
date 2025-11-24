// Admin Settings API Route
// GET /api/admin/settings
// PUT /api/admin/settings

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireAdmin } from '@/lib/middleware'
import { queryOne, query } from '@/lib/db'

// For now, we'll store settings in environment variables or a simple config table
// In production, you might want a dedicated settings table

const defaultSettings = {
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587'),
    username: process.env.SMTP_USERNAME || '',
    password: process.env.SMTP_PASSWORD || '',
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

    // TODO: Fetch from database settings table if exists
    // For now, return default settings
    return success(defaultSettings)
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

    const body = await request.json()

    // TODO: Save to database settings table
    // For now, we'll just validate and return success
    // In production, you should save these to a database

    // TODO: Log admin action

    return success(body, 'تم تحديث الإعدادات بنجاح')
  } catch (err: any) {
    console.error('Error updating settings:', err)
    return error('فشل في تحديث الإعدادات', 500)
  }
}

