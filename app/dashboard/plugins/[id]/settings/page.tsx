// Plugin Settings Page
// Configure plugin settings dynamically

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import PluginSettingsClient from './PluginSettingsClient'
import { queryOne, query } from '@/lib/db'
import type { BusinessProfile, InstalledPlugin, Plugin } from '@/types/database'

async function getPluginSettings(installationId: string, userId: string) {
  const profile = await queryOne<BusinessProfile>(
    `SELECT id FROM business_profiles WHERE merchant_id = $1`,
    [userId]
  )

  if (!profile) {
    return null
  }

  const installed = await queryOne<InstalledPlugin & { plugin_key: string; settings: any }>(
    `SELECT ip.*, p.plugin_key, ps.settings_json as settings
     FROM installed_plugins ip
     JOIN plugins p ON ip.plugin_id = p.id
     LEFT JOIN plugin_settings ps ON ip.id = ps.installed_plugin_id
     WHERE ip.id = $1 AND ip.profile_id = $2`,
    [installationId, profile.id]
  )

  if (!installed) {
    return null
  }

  const plugin = await queryOne<Plugin>(
    `SELECT * FROM plugins WHERE plugin_key = $1`,
    [installed.plugin_key]
  )

  if (!plugin) {
    return null
  }

  return { installed, plugin }
}

export default async function PluginSettingsPage({
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
  if (!user || (user.role !== 'merchant' && user.role !== 'admin')) {
    redirect('/login')
  }

  const { id } = await params
  const data = await getPluginSettings(id, user.userId)

  if (!data) {
    redirect('/dashboard/plugins')
  }

  return (
    <PluginSettingsClient
      installationId={id}
      plugin={data.plugin}
      currentSettings={data.installed.settings}
    />
  )
}

