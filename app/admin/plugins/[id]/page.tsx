// Edit Plugin Page
// Form to edit existing plugin

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import PluginEditorClient from '../PluginEditorClient'
import { queryOne } from '@/lib/db'
import type { Plugin } from '@/types/database'

async function getPlugin(id: string) {
  const plugin = await queryOne<Plugin>(
    `SELECT * FROM plugins WHERE id = $1`,
    [id]
  )
  return plugin
}

export default async function EditPluginPage({
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
  const plugin = await getPlugin(id)

  if (!plugin) {
    redirect('/admin/plugins')
  }

  return <PluginEditorClient initialPlugin={plugin} pluginId={id} />
}

