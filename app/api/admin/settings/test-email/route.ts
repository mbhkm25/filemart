// Test Email API Route
// POST /api/admin/settings/test-email

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireAdmin } from '@/lib/middleware'
import { sendTestEmail } from '@/services/email-service'

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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return error('البريد الإلكتروني غير صحيح', 400)
    }

    // Send test email
    const sent = await sendTestEmail(to)

    if (!sent) {
      return error('فشل في إرسال البريد التجريبي. يرجى التحقق من إعدادات SMTP', 500)
    }

    return success(null, 'تم إرسال البريد التجريبي بنجاح')
  } catch (err: any) {
    console.error('Error sending test email:', err)
    return error('فشل في إرسال البريد التجريبي', 500)
  }
}

