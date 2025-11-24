// System Settings Page
// SMTP, API Keys, Storage Limits, Maintenance Mode, Registration

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
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

  return <SettingsClient />
}
