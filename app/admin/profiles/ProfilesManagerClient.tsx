// Profiles Manager Client Component
// AdminTable with profiles list

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminTable from '@/components/admin/AdminTable'
import Tag from '@/components/common/Tag'
import Link from 'next/link'
import { useToast } from '@/components/common/Toast'
import type { Column } from '@/components/admin/AdminTable'

interface Profile {
  id: string
  merchant_id: string
  merchant_name: string
  merchant_email: string
  slug: string
  name: string
  description: string | null
  category: string | null
  is_published: boolean
  completion_percentage: number
  created_at: string
}

export default function ProfilesManagerClient() {
  const router = useRouter()
  const { showToast } = useToast()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchProfiles()
  }, [currentPage])

  const fetchProfiles = async (search?: string) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', String(currentPage))
      params.append('limit', '20')
      if (search) {
        params.append('search', search)
      }

      const response = await fetch(`/api/admin/profiles?${params.toString()}`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في جلب الملفات التجارية')
      }

      setProfiles(data.data.profiles || [])
      setTotalPages(data.data.pagination?.totalPages || 1)
    } catch (error: any) {
      console.error('Fetch error:', error)
      showToast('error', error.message || 'فشل في جلب الملفات التجارية')
    } finally {
      setIsLoading(false)
    }
  }

  const columns: Column<Profile>[] = [
    {
      key: 'name',
      label: 'اسم الملف',
      sortable: true,
    },
    {
      key: 'merchant_name',
      label: 'التاجر',
      render: (value, row) => (
        <Link
          href={`/admin/merchants/${row.merchant_id}`}
          className="text-primary-600 hover:underline"
        >
          {value}
        </Link>
      ),
    },
    {
      key: 'slug',
      label: 'الرابط',
      render: (value) => (
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{value}</code>
      ),
    },
    {
      key: 'is_published',
      label: 'الحالة',
      render: (value) => (
        <Tag
          label={value ? 'منشور' : 'غير منشور'}
          variant={value ? 'success' : 'default'}
          size="sm"
        />
      ),
    },
    {
      key: 'completion_percentage',
      label: 'الاكتمال',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full"
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-sm text-gray-600">{value}%</span>
        </div>
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
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          إدارة الملفات التجارية
        </h1>
        <p className="text-gray-600">
          عرض وإدارة جميع الملفات التجارية
        </p>
      </div>

      {/* Profiles Table */}
      <AdminTable
        data={profiles}
        columns={columns}
        searchable={true}
        searchPlaceholder="ابحث عن ملف تجاري..."
        onSearch={(query) => {
          setCurrentPage(1)
          fetchProfiles(query)
        }}
        paginated={true}
        currentPage={currentPage}
        onPageChange={(page) => {
          setCurrentPage(page)
          fetchProfiles()
        }}
        isLoading={isLoading}
        emptyMessage="لا توجد ملفات تجارية"
        onRowClick={(profile) => router.push(`/admin/profiles/${profile.id}`)}
      />
    </div>
  )
}

