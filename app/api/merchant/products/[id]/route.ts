// Merchant Product API Routes
// PUT /api/merchant/products/:id
// DELETE /api/merchant/products/:id

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { requireMerchant } from '@/lib/middleware'
import { queryOne, query } from '@/lib/db'
import { productUpdateSchema } from '@/lib/validations'
import type { BusinessProfile, Product } from '@/types/database'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = requireMerchant(request)
    if (!authResult.success) {
      return authResult.response
    }
    const user = authResult.user

    const { id } = await params

    // Get merchant's profile
    const profile = await queryOne<BusinessProfile>(
      `SELECT id FROM business_profiles WHERE merchant_id = $1`,
      [user.userId]
    )

    if (!profile) {
      return error('الملف التجاري غير موجود', 404)
    }

    // Check product exists and belongs to merchant
    const existingProduct = await queryOne<Product>(
      `SELECT * FROM products WHERE id = $1 AND profile_id = $2`,
      [id, profile.id]
    )

    if (!existingProduct) {
      return error('المنتج غير موجود', 404)
    }

    // Get request body
    const body = await request.json()

    // Validate input
    const validatedData = productUpdateSchema.parse(body)

    // Build update query
    const updateFields: string[] = []
    const updateValues: any[] = []
    let paramIndex = 1

    Object.entries(validatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`)
        updateValues.push(value)
        paramIndex++
      }
    })

    if (updateFields.length === 0) {
      return error('لا توجد بيانات للتحديث', 400)
    }

    updateFields.push(`updated_at = NOW()`)
    updateValues.push(id)

    const updateQuery = `
      UPDATE products 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const updatedProduct = await queryOne<Product>(updateQuery, updateValues)

    if (!updatedProduct) {
      return error('فشل في تحديث المنتج', 500)
    }

    return success(
      {
        id: updatedProduct.id,
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: Number(updatedProduct.price),
        images: updatedProduct.images,
        category: updatedProduct.category,
        status: updatedProduct.status,
        display_order: updatedProduct.display_order,
        updated_at: updatedProduct.updated_at,
      },
      'تم تحديث المنتج بنجاح'
    )
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return error('بيانات غير صحيحة', 400, err.errors)
    }
    console.error('Error updating product:', err)
    return error('فشل في تحديث المنتج', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = requireMerchant(request)
    if (!authResult.success) {
      return authResult.response
    }
    const user = authResult.user

    const { id } = await params

    // Get merchant's profile
    const profile = await queryOne<BusinessProfile>(
      `SELECT id FROM business_profiles WHERE merchant_id = $1`,
      [user.userId]
    )

    if (!profile) {
      return error('الملف التجاري غير موجود', 404)
    }

    // Check product exists and belongs to merchant
    const product = await queryOne<Product>(
      `SELECT * FROM products WHERE id = $1 AND profile_id = $2`,
      [id, profile.id]
    )

    if (!product) {
      return error('المنتج غير موجود', 404)
    }

    // Soft delete (set status to inactive)
    await query(
      `UPDATE products SET status = 'inactive', updated_at = NOW() WHERE id = $1`,
      [id]
    )

    return success(null, 'تم حذف المنتج بنجاح')
  } catch (err: any) {
    console.error('Error deleting product:', err)
    return error('فشل في حذف المنتج', 500)
  }
}

