// Settings Page
// Account, notifications, business settings, delete account

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import SettingsClient from './SettingsClient'
import { queryOne } from '@/lib/db'
import type { Merchant } from '@/types/database'

async function getMerchant(userId: string) {
  const merchant = await queryOne<Merchant>(
    `SELECT * FROM merchants WHERE id = $1`,
    [userId]
  )
  return merchant
}

export default async function SettingsPage() {
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

  const merchant = await getMerchant(user.userId)

  if (!merchant) {
    redirect('/login')
  }

  return <SettingsClient merchant={merchant} />
}
