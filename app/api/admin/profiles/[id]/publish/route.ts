// Publish/Unpublish Profile API Route
// PUT /api/admin/profiles/:id/publish

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireAdmin } from '@/lib/middleware'
import { queryOne, query } from '@/lib/db'
import type { BusinessProfile } from '@/types/database'

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
    const { is_published } = body

    if (typeof is_published !== 'boolean') {
      return error('is_published يجب أن يكون boolean', 400)
    }

    const profile = await queryOne<BusinessProfile>(
      `SELECT * FROM business_profiles WHERE id = $1`,
      [id]
    )

    if (!profile) {
      return error('الملف التجاري غير موجود', 404)
    }

    await query(
      `UPDATE business_profiles SET is_published = $1, updated_at = NOW() WHERE id = $2`,
      [is_published, id]
    )

    // TODO: Log admin action

    return success({ is_published }, 'تم تحديث حالة النشر بنجاح')
  } catch (err: any) {
    console.error('Error updating publish status:', err)
    return error('فشل في تحديث حالة النشر', 500)
  }
}

