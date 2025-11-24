// Business Profile Editor
// Tab-based form editor

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import ProfileEditorClient from './ProfileEditorClient'
import { queryOne } from '@/lib/db'
import type { BusinessProfile } from '@/types/database'

async function getProfile(userId: string) {
  const profile = await queryOne<BusinessProfile>(
    `SELECT * FROM business_profiles WHERE merchant_id = $1`,
    [userId]
  )
  return profile
}

export default async function BusinessProfilePage() {
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

  const profile = await getProfile(user.userId)

  return <ProfileEditorClient initialProfile={profile} />
}
