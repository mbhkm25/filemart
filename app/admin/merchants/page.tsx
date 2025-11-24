// Merchants Management Page
// List, search, filter, and manage merchants

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import MerchantsManagerClient from './MerchantsManagerClient'

export default async function MerchantsPage() {
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

  return <MerchantsManagerClient />
}
