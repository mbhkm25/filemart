// Merchants Manager Client Component
// AdminTable with merchants list

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminTable from '@/components/admin/AdminTable'
import Tag from '@/components/common/Tag'
import Button from '@/components/common/Button'
import Modal from '@/components/common/Modal'
import { useToast } from '@/components/common/Toast'
import type { Column } from '@/components/admin/AdminTable'

interface Merchant {
  id: string
  email: string
  phone: string | null
  name: string
  role: string
  is_active: boolean
  email_verified: boolean
  phone_verified: boolean
  created_at: string
}

export default function MerchantsManagerClient() {
  const router = useRouter()
  const { showToast } = useToast()
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchMerchants()
  }, [currentPage])

  const fetchMerchants = async (search?: string) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', String(currentPage))
      params.append('limit', '20')
      if (search) {
        params.append('search', search)
      }

      const response = await fetch(`/api/admin/merchants?${params.toString()}`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في جلب التجار')
      }

      setMerchants(data.data.merchants || [])
      setTotalPages(data.data.pagination?.totalPages || 1)
    } catch (error: any) {
      console.error('Fetch error:', error)
      showToast('error', error.message || 'فشل في جلب التجار')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuspend = async (merchant: Merchant) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/merchants/${merchant.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !merchant.is_active }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في تحديث حالة التاجر')
      }

      setMerchants(
        merchants.map((m) =>
          m.id === merchant.id ? { ...m, is_active: !m.is_active } : m
        )
      )
      setShowSuspendModal(false)
      showToast('success', 'تم تحديث حالة التاجر بنجاح')
    } catch (error: any) {
      console.error('Update error:', error)
      showToast('error', error.message || 'فشل في تحديث حالة التاجر')
    } finally {
      setIsUpdating(false)
    }
  }

  const columns: Column<Merchant>[] = [
    {
      key: 'name',
      label: 'الاسم',
      sortable: true,
    },
    {
      key: 'email',
      label: 'البريد الإلكتروني',
      sortable: true,
    },
    {
      key: 'phone',
      label: 'الهاتف',
      render: (value) => value || '-',
    },
    {
      key: 'is_active',
      label: 'الحالة',
      render: (value) => (
        <Tag
          label={value ? 'نشط' : 'معطل'}
          variant={value ? 'success' : 'error'}
          size="sm"
        />
      ),
    },
    {
      key: 'created_at',
      label: 'تاريخ التسجيل',
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
            إدارة التجار
          </h1>
          <p className="text-gray-600">
            عرض وإدارة جميع التجار المسجلين
          </p>
        </div>
      </div>

      {/* Merchants Table */}
      <AdminTable
        data={merchants}
        columns={columns}
        searchable={true}
        searchPlaceholder="ابحث عن تاجر..."
        onSearch={(query) => {
          setCurrentPage(1)
          fetchMerchants(query)
        }}
        paginated={true}
        currentPage={currentPage}
        onPageChange={(page) => {
          setCurrentPage(page)
          fetchMerchants()
        }}
        isLoading={isLoading}
        emptyMessage="لا توجد تجار"
        onRowClick={(merchant) => router.push(`/admin/merchants/${merchant.id}`)}
      />

      {/* Suspend Modal */}
      <Modal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        title={selectedMerchant?.is_active ? 'تعطيل التاجر' : 'تفعيل التاجر'}
      >
        {selectedMerchant && (
          <div className="space-y-4">
            <p className="text-gray-600">
              هل أنت متأكد من رغبتك في {selectedMerchant.is_active ? 'تعطيل' : 'تفعيل'} التاجر{' '}
              <strong>{selectedMerchant.name}</strong>؟
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowSuspendModal(false)}
                disabled={isUpdating}
              >
                إلغاء
              </Button>
              <Button
                variant={selectedMerchant.is_active ? 'danger' : 'primary'}
                onClick={() => handleSuspend(selectedMerchant)}
                disabled={isUpdating}
              >
                {isUpdating ? 'جاري التحديث...' : selectedMerchant.is_active ? 'تعطيل' : 'تفعيل'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

