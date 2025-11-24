// Customer Details Page
// Customer information and orders history

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import CustomerDetailsClient from './CustomerDetailsClient'

export default async function CustomerDetailsPage({
  params,
}: {
  params: Promise<{ phone: string }>
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

  const { phone } = await params

  return <CustomerDetailsClient phone={phone} />
}

