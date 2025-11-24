// Merchant Products API Routes
// GET /api/merchant/products
// POST /api/merchant/products

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireMerchant } from '@/lib/middleware'
import { queryOne, query } from '@/lib/db'
import { productCreateSchema } from '@/lib/validations'
import type { BusinessProfile, Product } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const authResult = requireMerchant(request)
    if (!authResult.success) {
      return authResult.response
    }
    const user = authResult.user

    // Get merchant's profile
    const profile = await queryOne<BusinessProfile>(
      `SELECT id FROM business_profiles WHERE merchant_id = $1`,
      [user.userId]
    )

    if (!profile) {
      return error('الملف التجاري غير موجود', 404)
    }

    // Get search and filter params
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    let queryText = `SELECT * FROM products WHERE profile_id = $1`
    const params: any[] = [profile.id]
    let paramIndex = 2

    if (status) {
      queryText += ` AND status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    if (search) {
      queryText += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    queryText += ` ORDER BY display_order ASC, created_at DESC`

    const products = await query<Product>(queryText, params)

    return success(
      products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.price),
        images: p.images,
        category: p.category,
        status: p.status,
        display_order: p.display_order,
        created_at: p.created_at,
        updated_at: p.updated_at,
      }))
    )
  } catch (err: any) {
    console.error('Error fetching products:', err)
    return error('فشل في جلب المنتجات', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = requireMerchant(request)
    if (!authResult.success) {
      return authResult.response
    }
    const user = authResult.user

    // Get merchant's profile
    const profile = await queryOne<BusinessProfile>(
      `SELECT id FROM business_profiles WHERE merchant_id = $1`,
      [user.userId]
    )

    if (!profile) {
      return error('الملف التجاري غير موجود', 404)
    }

    // Get request body
    const body = await request.json()

    // Validate input
    const validatedData = productCreateSchema.parse(body)

    // Get max display_order
    const maxOrderResult = await query<{ max_order: number }>(
      `SELECT COALESCE(MAX(display_order), 0) as max_order FROM products WHERE profile_id = $1`,
      [profile.id]
    )
    const maxOrder = maxOrderResult[0]?.max_order || 0

    // Create product
    const product = await queryOne<Product>(
      `INSERT INTO products (
        profile_id, name, description, price, images, category, status, display_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        profile.id,
        validatedData.name,
        validatedData.description || null,
        validatedData.price,
        validatedData.images || [],
        validatedData.category || null,
        validatedData.status || 'active',
        maxOrder + 1,
      ]
    )

    if (!product) {
      return error('فشل في إنشاء المنتج', 500)
    }

    return success(
      {
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        images: product.images,
        category: product.category,
        status: product.status,
        display_order: product.display_order,
        created_at: product.created_at,
        updated_at: product.updated_at,
      },
      'تم إنشاء المنتج بنجاح'
    )
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return error('بيانات غير صحيحة', 400, err.errors)
    }
    console.error('Error creating product:', err)
    return error('فشل في إنشاء المنتج', 500)
  }
}
