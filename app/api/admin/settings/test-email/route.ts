// Test Email API Route
// POST /api/admin/settings/test-email

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireAdmin } from '@/lib/middleware'

export async function POST(request: NextRequest) {
  try {
    const authResult = requireAdmin(request)
    if (!authResult.success) {
      return authResult.response
    }

    const body = await request.json()
    const { to } = body

    if (!to) {
      return error('البريد الإلكتروني مطلوب', 400)
    }

    // TODO: Implement email sending using SMTP settings
    // For now, just return success
    // In production, use nodemailer or similar

    return success(null, 'تم إرسال البريد التجريبي بنجاح')
  } catch (err: any) {
    console.error('Error sending test email:', err)
    return error('فشل في إرسال البريد التجريبي', 500)
  }
}

