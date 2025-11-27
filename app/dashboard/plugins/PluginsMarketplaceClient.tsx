// Plugins Marketplace Client Component
// Browse, install, uninstall, and manage plugins

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/common/Card'
import PluginBox from '@/components/dashboard/PluginBox'
import StateBox from '@/components/common/StateBox'
import Skeleton from '@/components/common/Skeleton'
import { useToast } from '@/components/common/Toast'
import { useBusiness } from '@/contexts/BusinessContext'

interface Plugin {
  id: string
  plugin_key: string
  name: string
  description?: string | null
  version: string
  is_premium: boolean
  price: number | null
}

interface InstalledPlugin extends Plugin {
  is_active: boolean
  settings: Record<string, any>
}

export default function PluginsMarketplaceClient() {
  const router = useRouter()
  const { showToast } = useToast()
  const [availablePlugins, setAvailablePlugins] = useState<Plugin[]>([])
  const [installedPlugins, setInstalledPlugins] = useState<InstalledPlugin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const businessId = useBusiness()

  if (!businessId) {
    return null
  }

  useEffect(() => {
    fetchPlugins()
  }, [])

  const fetchPlugins = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/businesses/${businessId}/plugins`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في جلب الإضافات')
      }

      setAvailablePlugins(data.data.available || [])
      setInstalledPlugins(data.data.installed || [])
    } catch (error: any) {
      console.error('Fetch error:', error)
      showToast('error', error.message || 'فشل في جلب الإضافات')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInstall = async (pluginKey: string) => {
    try {
      const response = await fetch(`/api/businesses/${businessId}/plugins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plugin_key: pluginKey }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في تثبيت الإضافة')
      }

      showToast('success', 'تم تثبيت الإضافة بنجاح')
      fetchPlugins()
    } catch (error: any) {
      console.error('Install error:', error)
      showToast('error', error.message || 'فشل في تثبيت الإضافة')
    }
  }

  const handleUninstall = async (installationId: string) => {
    try {
      const response = await fetch(
        `/api/businesses/${businessId}/plugins/${installationId}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في إلغاء تثبيت الإضافة')
      }

      showToast('success', 'تم إلغاء تثبيت الإضافة بنجاح')
      fetchPlugins()
    } catch (error: any) {
      console.error('Uninstall error:', error)
      showToast('error', error.message || 'فشل في إلغاء تثبيت الإضافة')
    }
  }

  const handleToggleActive = async (installationId: string, currentActive: boolean) => {
    try {
      const response = await fetch(
        `/api/businesses/${businessId}/plugins/${installationId}/settings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_active: !currentActive }),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في تحديث حالة الإضافة')
      }

      showToast('success', 'تم تحديث حالة الإضافة')
      fetchPlugins()
    } catch (error: any) {
      console.error('Toggle error:', error)
      showToast('error', error.message || 'فشل في تحديث حالة الإضافة')
    }
  }

  const installedPluginKeys = new Set(installedPlugins.map((p) => p.plugin_key))
  const uninstalledPlugins = availablePlugins.filter((p) => !installedPluginKeys.has(p.plugin_key))

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            الإضافات
          </h1>
          <p className="text-gray-600">
            تصفح وثبت الإضافات لتحسين ملفك التجاري
          </p>
        </div>

        {/* Installed Plugins */}
        {installedPlugins.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">الإضافات المثبتة</h2>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} height={120} rounded="lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {installedPlugins.map((plugin) => (
                  <PluginBox
                    key={plugin.id}
                    plugin={plugin}
                    isInstalled={true}
                    isActive={plugin.is_active}
                    onUninstall={() => handleUninstall(plugin.id)}
                    onToggleActive={() => handleToggleActive(plugin.id, plugin.is_active)}
                    onSettings={() => router.push(`/dashboard/plugins/${plugin.id}/settings`)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Available Plugins */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">الإضافات المتاحة</h2>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={120} rounded="lg" />
              ))}
            </div>
          ) : uninstalledPlugins.length > 0 ? (
            <div className="space-y-4">
              {uninstalledPlugins.map((plugin) => (
                <PluginBox
                  key={plugin.id}
                  plugin={plugin}
                  isInstalled={false}
                  onInstall={() => handleInstall(plugin.plugin_key)}
                />
              ))}
            </div>
          ) : (
            <StateBox
              type="empty"
              title="لا توجد إضافات متاحة"
              description="جميع الإضافات المتاحة مثبتة بالفعل"
            />
          )}
        </div>
      </div>
    </div>
  )
}

