// Merchant Business Settings API Route
// PUT /api/merchant/business-settings
// Update merchant business settings (language, timezone)

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireMerchant } from '@/lib/middleware'
import { query } from '@/lib/db'
import { z } from 'zod'

const businessSettingsSchema = z.object({
  language: z.enum(['ar', 'en']).optional(),
  timezone: z.string().optional(),
})

export async function PUT(request: NextRequest) {
  try {
    const authResult = requireMerchant(request)
    if (!authResult.success) {
      return authResult.response
    }
    const user = authResult.user

    const body = await request.json()
    const validatedData = businessSettingsSchema.parse(body)

    // Build update query
    const updateFields: string[] = []
    const updateValues: any[] = []
    let paramIndex = 1

    if (validatedData.language !== undefined) {
      updateFields.push(`language = $${paramIndex}`)
      updateValues.push(validatedData.language)
      paramIndex++
    }

    if (validatedData.timezone !== undefined) {
      updateFields.push(`timezone = $${paramIndex}`)
      updateValues.push(validatedData.timezone)
      paramIndex++
    }

    if (updateFields.length === 0) {
      return error('لا توجد بيانات للتحديث', 400)
    }

    // Add language and timezone columns if they don't exist
    // For simplicity, we'll add them directly to merchants table
    // First, try to add columns (will fail silently if they exist)
    try {
      await query(`ALTER TABLE merchants ADD COLUMN IF NOT EXISTS language VARCHAR(10)`)
      await query(`ALTER TABLE merchants ADD COLUMN IF NOT EXISTS timezone VARCHAR(50)`)
    } catch (e) {
      // Columns might already exist, continue
    }

    // Update merchant settings
    await query(
      `UPDATE merchants 
       SET ${updateFields.join(', ')}, updated_at = NOW() 
       WHERE id = $${paramIndex}`,
      [...updateValues, user.userId]
    )

    // Return updated settings
    const updatedMerchant = await query(
      `SELECT language, timezone FROM merchants WHERE id = $1`,
      [user.userId]
    )

    return success(
      {
        language: updatedMerchant[0]?.language || null,
        timezone: updatedMerchant[0]?.timezone || null,
      },
      'تم تحديث إعدادات العمل بنجاح'
    )
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return error('بيانات غير صحيحة', 400, err.errors)
    }
    console.error('Error updating business settings:', err)
    return error('فشل في تحديث إعدادات العمل', 500)
  }
}

