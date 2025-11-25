// Email Service
// Handles email sending using SMTP configuration from database

import { getSetting } from './settings-service'
import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

interface SMTPConfig {
  host: string
  port: number
  username: string
  password: string
  from_email: string
  from_name: string
}

let transporter: Transporter | null = null

/**
 * Get SMTP transporter (with caching)
 */
async function getTransporter(): Promise<Transporter | null> {
  try {
    // Get SMTP config from database
    const smtpConfig = (await getSetting('smtp')) as SMTPConfig | null

    // Fallback to environment variables
    const config: SMTPConfig = {
      host: smtpConfig?.host || process.env.SMTP_HOST || '',
      port: smtpConfig?.port || parseInt(process.env.SMTP_PORT || '587'),
      username: smtpConfig?.username || process.env.SMTP_USERNAME || '',
      password: smtpConfig?.password || process.env.SMTP_PASSWORD || '',
      from_email: smtpConfig?.from_email || process.env.SMTP_FROM_EMAIL || 'noreply@filemart.com',
      from_name: smtpConfig?.from_name || process.env.SMTP_FROM_NAME || 'FileMart',
    }

    // Validate config
    if (!config.host || !config.username || !config.password) {
      console.warn('SMTP configuration is incomplete. Email sending will be disabled.')
      return null
    }

    // Create transporter if not exists or config changed
    if (!transporter) {
      transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.port === 465, // true for 465, false for other ports
        auth: {
          user: config.username,
          pass: config.password,
        },
      })
    }

    return transporter
  } catch (error) {
    console.error('Error creating email transporter:', error)
    return null
  }
}

/**
 * Send email
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<boolean> {
  try {
    const emailTransporter = await getTransporter()
    if (!emailTransporter) {
      console.error('Email transporter not available')
      return false
    }

    const smtpConfig = (await getSetting('smtp')) as SMTPConfig | null
    const fromEmail = smtpConfig?.from_email || process.env.SMTP_FROM_EMAIL || 'noreply@filemart.com'
    const fromName = smtpConfig?.from_name || process.env.SMTP_FROM_NAME || 'FileMart'

    await emailTransporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML if no text provided
      html,
    })

    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

/**
 * Send test email
 */
export async function sendTestEmail(to: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">FileMart</h1>
      </div>
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1f2937; margin-top: 0;">بريد تجريبي</h2>
        <p>هذا بريد تجريبي من منصة FileMart.</p>
        <p>إذا تلقيت هذا البريد، فهذا يعني أن إعدادات البريد الإلكتروني تعمل بشكل صحيح.</p>
        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
          شكراً لاستخدامك FileMart
        </p>
      </div>
    </body>
    </html>
  `

  return sendEmail(to, 'بريد تجريبي - FileMart', html)
}

/**
 * Send order notification to merchant
 */
export async function sendOrderNotification(
  merchantEmail: string,
  order: {
    id: string
    total: number
    items: Array<{ name: string; quantity: number; price: number }>
    client: { name: string; phone: string; email?: string }
    notes?: string
  }
): Promise<boolean> {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: left;">${item.price.toFixed(2)} ر.س</td>
    </tr>
  `
    )
    .join('')

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">FileMart</h1>
      </div>
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1f2937; margin-top: 0;">طلب جديد</h2>
        <p>تم استلام طلب جديد على منصتك:</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #3b82f6;">معلومات الطلب</h3>
          <p><strong>رقم الطلب:</strong> ${order.id}</p>
          <p><strong>الإجمالي:</strong> ${order.total.toFixed(2)} ر.س</p>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #3b82f6;">المنتجات</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb;">المنتج</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e5e7eb;">الكمية</th>
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">السعر</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #3b82f6;">معلومات العميل</h3>
          <p><strong>الاسم:</strong> ${order.client.name}</p>
          <p><strong>الهاتف:</strong> ${order.client.phone}</p>
          ${order.client.email ? `<p><strong>البريد:</strong> ${order.client.email}</p>` : ''}
          ${order.notes ? `<p><strong>ملاحظات:</strong> ${order.notes}</p>` : ''}
        </div>

        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
          يرجى تسجيل الدخول إلى لوحة التحكم لمتابعة الطلب.
        </p>
      </div>
    </body>
    </html>
  `

  return sendEmail(merchantEmail, `طلب جديد #${order.id} - FileMart`, html)
}

