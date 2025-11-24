// Plugin Settings Client Component
// Dynamic form based on config_schema_json

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { useToast } from '@/components/common/Toast'
import type { Plugin } from '@/types/database'

interface PluginSettingsClientProps {
  installationId: string
  plugin: Plugin
  currentSettings: Record<string, any>
}

export default function PluginSettingsClient({
  installationId,
  plugin,
  currentSettings,
}: PluginSettingsClientProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<Record<string, any>>(currentSettings || {})

  // Parse config schema if available
  const configSchema = plugin.config_schema_json
    ? typeof plugin.config_schema_json === 'string'
      ? JSON.parse(plugin.config_schema_json)
      : plugin.config_schema_json
    : null

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const response = await fetch(`/api/merchant/plugins/${installationId}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في حفظ الإعدادات')
      }

      showToast('success', 'تم حفظ الإعدادات بنجاح')
      router.push('/dashboard/plugins')
    } catch (error: any) {
      console.error('Save error:', error)
      showToast('error', error.message || 'فشل في حفظ الإعدادات')
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value })
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              إعدادات {plugin.name}
            </h1>
            <p className="text-gray-600">{plugin.description}</p>
          </div>
          <Link href="/dashboard/plugins">
            <Button variant="outline" size="sm">
              العودة
            </Button>
          </Link>
        </div>

        <Card>
          {configSchema && configSchema.properties ? (
            <div className="space-y-6">
              {Object.entries(configSchema.properties).map(([key, prop]: [string, any]) => (
                <div key={key}>
                  {prop.type === 'string' && (
                    <Input
                      label={prop.title || key}
                      value={settings[key] || ''}
                      onChange={(e) => updateSetting(key, e.target.value)}
                      placeholder={prop.description}
                    />
                  )}
                  {prop.type === 'number' && (
                    <Input
                      label={prop.title || key}
                      type="number"
                      value={settings[key] || ''}
                      onChange={(e) => updateSetting(key, Number(e.target.value))}
                      placeholder={prop.description}
                    />
                  )}
                  {prop.type === 'boolean' && (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings[key] || false}
                        onChange={(e) => updateSetting(key, e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {prop.title || key}
                      </span>
                    </label>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                لا توجد إعدادات قابلة للتخصيص لهذه الإضافة.
              </p>
              {Object.keys(settings).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الإعدادات الحالية (JSON)
                  </label>
                  <textarea
                    value={JSON.stringify(settings, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value)
                        setSettings(parsed)
                      } catch {
                        // Invalid JSON, ignore
                      }
                    }}
                    rows={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                  />
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-4 pt-4 border-t border-gray-200">
            <Link href="/dashboard/plugins">
              <Button variant="outline">إلغاء</Button>
            </Link>
            <Button variant="primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

