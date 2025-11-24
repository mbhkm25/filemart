// Orders Monitor Client Component
// Global orders with filters

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminTable from '@/components/admin/AdminTable'
import Tag from '@/components/common/Tag'
import { useToast } from '@/components/common/Toast'
import type { Column } from '@/components/admin/AdminTable'

interface Order {
  id: string
  profile_id: string
  business_name: string
  business_slug: string
  merchant_name: string
  client_name: string
  client_phone: string
  status: 'new' | 'processing' | 'completed' | 'cancelled'
  total_amount: number
  items_count: number
  created_at: string
}

const statusConfig = {
  new: { label: 'جديد', variant: 'info' as const },
  processing: { label: 'معالجة', variant: 'warning' as const },
  completed: { label: 'مكتمل', variant: 'success' as const },
  cancelled: { label: 'ملغي', variant: 'error' as const },
}

export default function OrdersMonitorClient() {
  const router = useRouter()
  const { showToast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchOrders()
  }, [currentPage, statusFilter])

  const fetchOrders = async (search?: string) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', String(currentPage))
      params.append('limit', '20')
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      if (search) {
        params.append('search', search)
      }

      const response = await fetch(`/api/admin/orders?${params.toString()}`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في جلب الطلبات')
      }

      setOrders(data.data.orders || [])
      setTotalPages(data.data.pagination?.totalPages || 1)
    } catch (error: any) {
      console.error('Fetch error:', error)
      showToast('error', error.message || 'فشل في جلب الطلبات')
    } finally {
      setIsLoading(false)
    }
  }

  const columns: Column<Order>[] = [
    {
      key: 'client_name',
      label: 'اسم العميل',
      sortable: true,
    },
    {
      key: 'client_phone',
      label: 'رقم الهاتف',
    },
    {
      key: 'business_name',
      label: 'الملف التجاري',
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{row.merchant_name}</p>
        </div>
      ),
    },
    {
      key: 'total_amount',
      label: 'المبلغ',
      render: (value) =>
        new Intl.NumberFormat('ar-SA', {
          style: 'currency',
          currency: 'SAR',
        }).format(Number(value)),
    },
    {
      key: 'status',
      label: 'الحالة',
      render: (value) => {
        const status = statusConfig[value as keyof typeof statusConfig]
        return <Tag label={status.label} variant={status.variant} size="sm" />
      },
    },
    {
      key: 'created_at',
      label: 'التاريخ',
      render: (value) =>
        new Date(value).toLocaleDateString('ar-SA', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          مراقبة الطلبات
        </h1>
        <p className="text-gray-600">
          عرض جميع الطلبات من جميع التجار
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          الكل
        </button>
        {Object.entries(statusConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === key
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <AdminTable
        data={orders}
        columns={columns}
        searchable={true}
        searchPlaceholder="ابحث عن طلب..."
        onSearch={(query) => {
          setCurrentPage(1)
          fetchOrders(query)
        }}
        paginated={true}
        currentPage={currentPage}
        onPageChange={(page) => {
          setCurrentPage(page)
          fetchOrders()
        }}
        isLoading={isLoading}
        emptyMessage="لا توجد طلبات"
        onRowClick={(order) => router.push(`/admin/orders/${order.id}`)}
      />
    </div>
  )
}

