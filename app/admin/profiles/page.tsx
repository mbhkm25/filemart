// Business Profiles Management Page
// List, search, filter, and manage profiles

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import ProfilesManagerClient from './ProfilesManagerClient'

export default async function ProfilesPage() {
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

  return <ProfilesManagerClient />
}
