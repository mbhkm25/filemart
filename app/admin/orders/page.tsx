// Orders Monitor Page
// Global orders list with filters

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import OrdersMonitorClient from './OrdersMonitorClient'

export default async function OrdersPage() {
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

  return <OrdersMonitorClient />
}
