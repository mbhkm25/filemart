// Merchant Details Page
// Full merchant information and actions

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import MerchantDetailsClient from './MerchantDetailsClient'
import { queryOne } from '@/lib/db'
import type { Merchant } from '@/types/database'

async function getMerchant(id: string) {
  const merchant = await queryOne<Merchant>(
    `SELECT * FROM merchants WHERE id = $1`,
    [id]
  )
  return merchant
}

export default async function MerchantDetailsPage({
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
  if (!user || user.role !== 'admin') {
    redirect('/login')
  }

  const { id } = await params
  const merchant = await getMerchant(id)

  if (!merchant) {
    redirect('/admin/merchants')
  }

  return <MerchantDetailsClient merchantId={id} />
}

