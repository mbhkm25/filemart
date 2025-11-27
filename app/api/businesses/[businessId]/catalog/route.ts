// Business Catalog API
// GET /api/businesses/[businessId]/catalog
// POST /api/businesses/[businessId]/catalog
// BIRM: business-scoped products
import { NextRequest } from 'next/server'
import { success, error, serverError } from '@/lib/api-response'
import { requireBusinessOwnership } from '@/lib/middleware'
import { query, queryOne } from '@/lib/db'
import type { Product } from '@/types/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params

    const ownershipResult = await requireBusinessOwnership(request, businessId)
    if (!ownershipResult.success) {
      return ownershipResult.response
    }

    // TODO(BIRM Phase F): switch to explicit business_id column when available
    const products = await query<Product>(
      `SELECT id, name, price, images, created_at
       FROM products
       WHERE profile_id = $1
       ORDER BY created_at DESC`,
      [businessId]
    )

    return success(
      products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        images: p.images,
        created_at: p.created_at,
      }))
    )
  } catch (err: any) {
    console.error('Error fetching business catalog:', err)
    return serverError('فشل في جلب المنتجات')
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params

    const ownershipResult = await requireBusinessOwnership(request, businessId)
    if (!ownershipResult.success) {
      return ownershipResult.response
    }

    const body = await request.json()
    const { name, price, description, images, category, status } = body || {}

    if (!name || typeof price !== 'number') {
      return error('الاسم والسعر مطلوبان', 400)
    }

    // TODO(BIRM Phase F): move this into a dedicated catalog service
    const inserted = await queryOne<Product>(
      `INSERT INTO products (
         profile_id, name, description, price, images, category, status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, price, images, created_at`,
      [
        businessId,
        name,
        description || null,
        price,
        images || [],
        category || null,
        status || 'active',
      ]
    )

    if (!inserted) {
      return serverError('فشل في إنشاء المنتج')
    }

    return success(
      {
        id: inserted.id,
        name: inserted.name,
        price: inserted.price,
        images: inserted.images,
        created_at: inserted.created_at,
      },
      'تم إنشاء المنتج بنجاح'
    )
  } catch (err: any) {
    console.error('Error creating product for business:', err)
    return serverError('فشل في إنشاء المنتج')
  }
}


