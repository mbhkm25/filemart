// Settings Client Component
// System settings management

'use client'

import React, { useState, useEffect } from 'react'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { useToast } from '@/components/common/Toast'
import StateBox from '@/components/common/StateBox'
import Skeleton from '@/components/common/Skeleton'

interface Settings {
  smtp: {
    host: string
    port: number
    username: string
    password: string
  }
  api_keys: {
    cloudinary_cloud_name: string
    cloudinary_upload_preset: string
  }
  storage_limits: {
    max_images_per_merchant: number
    max_file_size_mb: number
  }
  maintenance_mode: {
    enabled: boolean
    message: string
  }
  registration: {
    enabled: boolean
    approval_required: boolean
  }
}

export default function SettingsClient() {
  const { showToast } = useToast()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTestingEmail, setIsTestingEmail] = useState(false)
  const [activeTab, setActiveTab] = useState<'smtp' | 'api' | 'storage' | 'maintenance' | 'registration'>('smtp')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/settings')
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في جلب الإعدادات')
      }

      setSettings(data.data)
    } catch (error: any) {
      console.error('Fetch error:', error)
      showToast('error', error.message || 'فشل في جلب الإعدادات')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في حفظ الإعدادات')
      }

      showToast('success', 'تم حفظ الإعدادات بنجاح')
    } catch (error: any) {
      console.error('Save error:', error)
      showToast('error', error.message || 'فشل في حفظ الإعدادات')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestEmail = async () => {
    if (!settings) return

    setIsTestingEmail(true)
    try {
      const response = await fetch('/api/admin/settings/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to: settings.smtp.username }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في إرسال البريد التجريبي')
      }

      showToast('success', 'تم إرسال البريد التجريبي بنجاح')
    } catch (error: any) {
      console.error('Test email error:', error)
      showToast('error', error.message || 'فشل في إرسال البريد التجريبي')
    } finally {
      setIsTestingEmail(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton height={200} rounded="lg" />
        <Skeleton height={300} rounded="lg" />
      </div>
    )
  }

  if (!settings) {
    return <StateBox type="error" title="خطأ" description="فشل في جلب الإعدادات" />
  }

  const tabs = [
    { id: 'smtp' as const, label: 'SMTP' },
    { id: 'api' as const, label: 'API Keys' },
    { id: 'storage' as const, label: 'قيود التخزين' },
    { id: 'maintenance' as const, label: 'وضع الصيانة' },
    { id: 'registration' as const, label: 'التسجيل' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          إعدادات النظام
        </h1>
        <p className="text-gray-600">
          إدارة إعدادات المنصة المتقدمة
        </p>
      </div>

      <Card>
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* SMTP Settings */}
          {activeTab === 'smtp' && (
            <div className="space-y-4">
              <Input
                label="SMTP Host"
                value={settings.smtp.host}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    smtp: { ...settings.smtp, host: e.target.value },
                  })
                }
              />
              <Input
                label="SMTP Port"
                type="number"
                value={String(settings.smtp.port)}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    smtp: { ...settings.smtp, port: parseInt(e.target.value) || 587 },
                  })
                }
              />
              <Input
                label="SMTP Username"
                value={settings.smtp.username}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    smtp: { ...settings.smtp, username: e.target.value },
                  })
                }
              />
              <Input
                label="SMTP Password"
                type="password"
                value={settings.smtp.password}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    smtp: { ...settings.smtp, password: e.target.value },
                  })
                }
              />
              <Button variant="outline" onClick={handleTestEmail} disabled={isTestingEmail}>
                {isTestingEmail ? 'جاري الإرسال...' : 'إرسال بريد تجريبي'}
              </Button>
            </div>
          )}

          {/* API Keys */}
          {activeTab === 'api' && (
            <div className="space-y-4">
              <Input
                label="Cloudinary Cloud Name"
                value={settings.api_keys.cloudinary_cloud_name}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    api_keys: {
                      ...settings.api_keys,
                      cloudinary_cloud_name: e.target.value,
                    },
                  })
                }
              />
              <Input
                label="Cloudinary Upload Preset"
                value={settings.api_keys.cloudinary_upload_preset}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    api_keys: {
                      ...settings.api_keys,
                      cloudinary_upload_preset: e.target.value,
                    },
                  })
                }
              />
            </div>
          )}

          {/* Storage Limits */}
          {activeTab === 'storage' && (
            <div className="space-y-4">
              <Input
                label="الحد الأقصى للصور لكل تاجر"
                type="number"
                value={String(settings.storage_limits.max_images_per_merchant)}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    storage_limits: {
                      ...settings.storage_limits,
                      max_images_per_merchant: parseInt(e.target.value) || 50,
                    },
                  })
                }
              />
              <Input
                label="الحد الأقصى لحجم الملف (MB)"
                type="number"
                value={String(settings.storage_limits.max_file_size_mb)}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    storage_limits: {
                      ...settings.storage_limits,
                      max_file_size_mb: parseInt(e.target.value) || 5,
                    },
                  })
                }
              />
            </div>
          )}

          {/* Maintenance Mode */}
          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.maintenance_mode.enabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maintenance_mode: {
                        ...settings.maintenance_mode,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">تفعيل وضع الصيانة</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  رسالة الصيانة
                </label>
                <textarea
                  value={settings.maintenance_mode.message}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maintenance_mode: {
                        ...settings.maintenance_mode,
                        message: e.target.value,
                      },
                    })
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          )}

          {/* Registration Settings */}
          {activeTab === 'registration' && (
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.registration.enabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      registration: {
                        ...settings.registration,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">تفعيل التسجيل</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.registration.approval_required}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      registration: {
                        ...settings.registration,
                        approval_required: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">يتطلب موافقة</span>
              </label>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end pt-4 border-t border-gray-200">
          <Button variant="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </Button>
        </div>
      </Card>
    </div>
  )
}

