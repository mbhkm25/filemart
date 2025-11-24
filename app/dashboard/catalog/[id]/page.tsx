// Product Editor Page
// Create or edit product

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import ProductEditorClient from './ProductEditorClient'
import { queryOne } from '@/lib/db'
import type { BusinessProfile, Product } from '@/types/database'

async function getProduct(id: string, userId: string) {
  const profile = await queryOne<BusinessProfile>(
    `SELECT id FROM business_profiles WHERE merchant_id = $1`,
    [userId]
  )

  if (!profile) {
    return null
  }

  const product = await queryOne<Product>(
    `SELECT * FROM products WHERE id = $1 AND profile_id = $2`,
    [id, profile.id]
  )

  return product
}

export default async function ProductEditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Check authentication
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    redirect('/login')
  }

  const user = verifyToken(token)
  if (!user || (user.role !== 'merchant' && user.role !== 'admin')) {
    redirect('/login')
  }

  const { id } = await params
  const product = id !== 'new' ? await getProduct(id, user.userId) : null

  return <ProductEditorClient initialProduct={product} productId={id} />
}

