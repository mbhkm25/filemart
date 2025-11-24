// Profile Details Page
// Full profile information and admin actions

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import ProfileDetailsClient from './ProfileDetailsClient'

export default async function ProfileDetailsPage({
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

  return <ProfileDetailsClient profileId={id} />
}

