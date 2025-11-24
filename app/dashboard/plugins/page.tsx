// Plugins Marketplace Page
// Browse, install, and manage plugins

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import PluginsMarketplaceClient from './PluginsMarketplaceClient'

export default async function PluginsPage() {
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

  return <PluginsMarketplaceClient />
}
