// Gallery Manager Page
// Upload, delete, and manage gallery images

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import GalleryManagerClient from './GalleryManagerClient'
import { queryOne, query } from '@/lib/db'
import type { BusinessProfile, GalleryImage } from '@/types/database'

async function getGalleryData(userId: string) {
  const profile = await queryOne<BusinessProfile>(
    `SELECT id FROM business_profiles WHERE merchant_id = $1`,
    [userId]
  )

  if (!profile) {
    return null
  }

  const images = await query<GalleryImage>(
    `SELECT * FROM gallery_images WHERE profile_id = $1 ORDER BY display_order ASC, created_at DESC`,
    [profile.id]
  )

  return { profile, images }
}

export default async function GalleryPage() {
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

  const data = await getGalleryData(user.userId)

  if (!data) {
    redirect('/dashboard/profile')
  }

  return <GalleryManagerClient initialImages={data.images} profileId={data.profile.id} />
}
