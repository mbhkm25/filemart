// Plugin Editor Client Component
// Create or edit plugin form

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { useToast } from '@/components/common/Toast'
import type { Plugin } from '@/types/database'

interface PluginEditorClientProps {
  initialPlugin?: Plugin
  pluginId?: string
}

export default function PluginEditorClient({
  initialPlugin,
  pluginId,
}: PluginEditorClientProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const isNew = !initialPlugin
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    plugin_key: initialPlugin?.plugin_key || '',
    name: initialPlugin?.name || '',
    description: initialPlugin?.description || '',
    version: initialPlugin?.version || '1.0.0',
    is_premium: initialPlugin?.is_premium || false,
    price: initialPlugin?.price ? String(initialPlugin.price) : '',
    config_schema_json: initialPlugin?.config_schema_json
      ? typeof initialPlugin.config_schema_json === 'string'
        ? initialPlugin.config_schema_json
        : JSON.stringify(initialPlugin.config_schema_json, null, 2)
      : '',
    is_active: initialPlugin?.is_active !== undefined ? initialPlugin.is_active : true,
  })

  const handleSave = async () => {
    setIsSaving(true)

    try {
      let configSchema = null
      if (formData.config_schema_json.trim()) {
        try {
          configSchema = JSON.parse(formData.config_schema_json)
        } catch {
          throw new Error('config_schema_json يجب أن يكون JSON صحيح')
        }
      }

      const pluginData = {
        plugin_key: formData.plugin_key,
        name: formData.name,
        description: formData.description || undefined,
        version: formData.version,
        is_premium: formData.is_premium,
        price: formData.price ? Number(formData.price) : undefined,
        config_schema_json: configSchema,
        is_active: formData.is_active,
      }

      const url = isNew ? '/api/admin/plugins' : `/api/admin/plugins/${pluginId}`
      const method = isNew ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pluginData),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || `فشل في ${isNew ? 'إنشاء' : 'تحديث'} الإضافة`)
      }

      showToast('success', `تم ${isNew ? 'إنشاء' : 'تحديث'} الإضافة بنجاح`)
      router.push('/admin/plugins')
    } catch (error: any) {
      console.error('Save error:', error)
      showToast('error', error.message || `فشل في ${isNew ? 'إنشاء' : 'تحديث'} الإضافة`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {isNew ? 'إضافة إضافة جديدة' : 'تعديل الإضافة'}
        </h1>
        <Link href="/admin/plugins">
          <Button variant="outline" size="sm">
            العودة
          </Button>
        </Link>
      </div>

      <Card>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="المفتاح (plugin_key)"
              value={formData.plugin_key}
              onChange={(e) => setFormData({ ...formData, plugin_key: e.target.value })}
              required
              disabled={!isNew}
              placeholder="example-plugin"
            />
            <Input
              label="الاسم"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              الوصف
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="الإصدار"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              required
              placeholder="1.0.0"
            />
            <div>
              <label className="flex items-center gap-2 mb-1.5">
                <input
                  type="checkbox"
                  checked={formData.is_premium}
                  onChange={(e) =>
                    setFormData({ ...formData, is_premium: e.target.checked })
                  }
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">مميز</span>
              </label>
            </div>
            {formData.is_premium && (
              <Input
                label="السعر (ريال)"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Config Schema (JSON)
            </label>
            <textarea
              value={formData.config_schema_json}
              onChange={(e) =>
                setFormData({ ...formData, config_schema_json: e.target.value })
              }
              rows={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
              placeholder='{"properties": {"key": {"type": "string", "title": "Label"}}}'
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">نشط</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <Link href="/admin/plugins">
              <Button variant="outline">إلغاء</Button>
            </Link>
            <Button variant="primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

