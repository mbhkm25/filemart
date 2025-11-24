// Plugins Manager Client Component
// List, create, edit plugins

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminTable from '@/components/admin/AdminTable'
import Button from '@/components/common/Button'
import Tag from '@/components/common/Tag'
import { useToast } from '@/components/common/Toast'
import type { Column } from '@/components/admin/AdminTable'

interface Plugin {
  id: string
  plugin_key: string
  name: string
  description: string | null
  version: string
  is_premium: boolean
  price: number | null
  is_active: boolean
  install_count: number
  created_at: string
}

export default function PluginsManagerClient() {
  const router = useRouter()
  const { showToast } = useToast()
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPlugins()
  }, [])

  const fetchPlugins = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/plugins')
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في جلب الإضافات')
      }

      setPlugins(data.data || [])
    } catch (error: any) {
      console.error('Fetch error:', error)
      showToast('error', error.message || 'فشل في جلب الإضافات')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async (plugin: Plugin) => {
    try {
      const response = await fetch(`/api/admin/plugins/${plugin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !plugin.is_active }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في تحديث حالة الإضافة')
      }

      setPlugins(
        plugins.map((p) =>
          p.id === plugin.id ? { ...p, is_active: !p.is_active } : p
        )
      )
      showToast('success', 'تم تحديث حالة الإضافة')
    } catch (error: any) {
      console.error('Toggle error:', error)
      showToast('error', error.message || 'فشل في تحديث حالة الإضافة')
    }
  }

  const columns: Column<Plugin>[] = [
    {
      key: 'name',
      label: 'الاسم',
      sortable: true,
    },
    {
      key: 'plugin_key',
      label: 'المفتاح',
      render: (value) => (
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{value}</code>
      ),
    },
    {
      key: 'version',
      label: 'الإصدار',
    },
    {
      key: 'is_premium',
      label: 'النوع',
      render: (value) => (
        <Tag
          label={value ? 'مميز' : 'مجاني'}
          variant={value ? 'warning' : 'success'}
          size="sm"
        />
      ),
    },
    {
      key: 'install_count',
      label: 'عدد التثبيتات',
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'is_active',
      label: 'الحالة',
      render: (value) => (
        <Tag
          label={value ? 'نشط' : 'معطل'}
          variant={value ? 'success' : 'default'}
          size="sm"
        />
      ),
    },
    {
      key: 'created_at',
      label: 'تاريخ الإنشاء',
      render: (value) =>
        new Date(value).toLocaleDateString('ar-SA', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            إدارة الإضافات
          </h1>
          <p className="text-gray-600">
            عرض وإدارة جميع الإضافات المتاحة
          </p>
        </div>
        <Link href="/admin/plugins/new">
          <Button variant="primary">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              إضافة إضافة جديدة
            </span>
          </Button>
        </Link>
      </div>

      {/* Plugins Table */}
      <AdminTable
        data={plugins}
        columns={columns}
        searchable={true}
        searchPlaceholder="ابحث عن إضافة..."
        isLoading={isLoading}
        emptyMessage="لا توجد إضافات"
        onRowClick={(plugin) => router.push(`/admin/plugins/${plugin.id}`)}
      />
    </div>
  )
}

