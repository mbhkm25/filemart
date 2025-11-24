// Zod Validation Schemas

import { z } from 'zod'

// Business Profile Validation
export const businessProfileUpdateSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون على الأقل حرفين').max(255).optional(),
  description: z.string().max(2000).optional().nullable(),
  logo_url: z.string().url('رابط غير صحيح').optional().nullable(),
  cover_url: z.string().url('رابط غير صحيح').optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  working_hours: z.record(z.any()).optional(),
  contact_links: z.record(z.string().url('رابط غير صحيح')).optional(),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'يجب أن يكون اللون بصيغة hex').optional().nullable(),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'يجب أن يكون اللون بصيغة hex').optional().nullable(),
})

export type BusinessProfileUpdateInput = z.infer<typeof businessProfileUpdateSchema>

// Product Validation
export const productCreateSchema = z.object({
  name: z.string().min(1, 'اسم المنتج مطلوب').max(255),
  description: z.string().max(2000).optional().nullable(),
  price: z.number().min(0, 'السعر يجب أن يكون أكبر من أو يساوي صفر'),
  images: z.array(z.string().url('رابط الصورة غير صحيح')).max(10, 'الحد الأقصى 10 صور').optional(),
  category: z.string().max(100).optional().nullable(),
  status: z.enum(['active', 'inactive']).optional().default('active'),
})

export const productUpdateSchema = productCreateSchema.partial()

export type ProductCreateInput = z.infer<typeof productCreateSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>

// Order Validation
export const orderCreateSchema = z.object({
  profile_id: z.string().uuid('معرف الملف غير صحيح'),
  items: z.array(
    z.object({
      product_id: z.string().uuid('معرف المنتج غير صحيح'),
      quantity: z.number().int().min(1, 'الكمية يجب أن تكون على الأقل 1'),
    })
  ).min(1, 'يجب إضافة منتج واحد على الأقل'),
  client: z.object({
    name: z.string().min(2, 'اسم العميل مطلوب').max(255),
    phone: z.string().min(10, 'رقم الهاتف غير صحيح').max(20),
    email: z.string().email('البريد الإلكتروني غير صحيح').optional(),
  }),
  notes: z.string().max(1000).optional().nullable(),
})

export type OrderCreateInput = z.infer<typeof orderCreateSchema>

// Plugin Installation Validation
export const pluginInstallSchema = z.object({
  plugin_key: z.string().min(1, 'معرف الإضافة مطلوب').max(100),
})

export type PluginInstallInput = z.infer<typeof pluginInstallSchema>

// Login Validation
export const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون على الأقل 6 أحرف'),
})

export type LoginInput = z.infer<typeof loginSchema>

// Register Validation (for future use)
export const registerSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().min(10).max(20).optional(),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون على الأقل 6 أحرف'),
  name: z.string().min(2, 'الاسم يجب أن يكون على الأقل حرفين').max(255),
})

export type RegisterInput = z.infer<typeof registerSchema>

