// Orders Manager Page
// Display and manage orders with tabs

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import OrdersManagerClient from './OrdersManagerClient'

export default async function OrdersPage() {
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

  return <OrdersManagerClient />
}
