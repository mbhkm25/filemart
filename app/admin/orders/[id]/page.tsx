// Order Details Page
// Full order information

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import OrderDetailsClient from './OrderDetailsClient'

export default async function OrderDetailsPage({
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

  return <OrderDetailsClient orderId={id} />
}

