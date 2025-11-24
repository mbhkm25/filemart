// Public Orders API Route
// POST /api/public/orders

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { queryOne, query, transaction } from '@/lib/db'
import { orderCreateSchema } from '@/lib/validations'
import type { BusinessProfile, Product, Order, OrderItem } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = orderCreateSchema.parse(body)

    // Check profile exists and is published
    const profile = await queryOne<BusinessProfile>(
      `SELECT id FROM business_profiles WHERE id = $1 AND is_published = true`,
      [validatedData.profile_id]
    )

    if (!profile) {
      return error('الملف التجاري غير موجود أو غير منشور', 404)
    }

    // Fetch and validate products
    const productIds = validatedData.items.map((item) => item.product_id)
    const products = await query<Product>(
      `SELECT id, name, price, status FROM products WHERE id = ANY($1::uuid[]) AND profile_id = $2`,
      [productIds, validatedData.profile_id]
    )

    if (products.length !== productIds.length) {
      return error('بعض المنتجات غير موجودة', 400)
    }

    // Check all products are active
    const inactiveProducts = products.filter((p) => p.status !== 'active')
    if (inactiveProducts.length > 0) {
      return error('بعض المنتجات غير متاحة', 400)
    }

    // Create product map for quick lookup
    const productMap = new Map(products.map((p) => [p.id, p]))

    // Calculate total and validate quantities
    let totalAmount = 0
    const orderItems: Array<{
      productId: string
      quantity: number
      unitPrice: number
      subtotal: number
    }> = []

    for (const item of validatedData.items) {
      const product = productMap.get(item.product_id)
      if (!product) {
        return error(`المنتج ${item.product_id} غير موجود`, 400)
      }

      const unitPrice = Number(product.price)
      const subtotal = unitPrice * item.quantity
      totalAmount += subtotal

      orderItems.push({
        productId: item.product_id,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      })
    }

    // Create order in transaction
    const orderId = await transaction(async (client) => {
      // Insert order
      const orderResult = await client.query<Order>(
        `INSERT INTO orders (
          profile_id, client_name, client_phone, client_email, notes, total_amount, status
        ) VALUES ($1, $2, $3, $4, $5, $6, 'new')
        RETURNING id`,
        [
          validatedData.profile_id,
          validatedData.client.name,
          validatedData.client.phone,
          validatedData.client.email || null,
          validatedData.notes || null,
          totalAmount,
        ]
      )

      const order = orderResult.rows[0]
      if (!order) {
        throw new Error('Failed to create order')
      }

      // Insert order items
      for (const item of orderItems) {
        await client.query<OrderItem>(
          `INSERT INTO order_items (
            order_id, product_id, quantity, unit_price, subtotal
          ) VALUES ($1, $2, $3, $4, $5)`,
          [order.id, item.productId, item.quantity, item.unitPrice, item.subtotal]
        )
      }

      return order.id
    })

    // TODO: Send notification to merchant (Email/Push)
    // await notifyMerchant(orderId, validatedData.profile_id)

    return success(
      {
        orderId,
        totalAmount,
      },
      'تم إرسال الطلب بنجاح'
    )
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return error('بيانات غير صحيحة', 400, err.errors)
    }
    console.error('Error creating order:', err)
    return error('فشل في إرسال الطلب', 500)
  }
}
