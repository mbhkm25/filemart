// Create Plugin Page
// Form to create new plugin

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import PluginEditorClient from '../PluginEditorClient'

export default async function CreatePluginPage() {
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

  return <PluginEditorClient />
}

