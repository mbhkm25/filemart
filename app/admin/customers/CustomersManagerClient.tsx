// Customers Manager Client Component
// AdminTable with customers list

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminTable from '@/components/admin/AdminTable'
import { useToast } from '@/components/common/Toast'
import type { Column } from '@/components/admin/AdminTable'

interface Customer {
  phone: string
  name: string
  orders_count: number
  last_order_date: string
  total_spent: number
}

export default function CustomersManagerClient() {
  const router = useRouter()
  const { showToast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchCustomers()
  }, [currentPage])

  const fetchCustomers = async (search?: string) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', String(currentPage))
      params.append('limit', '20')
      if (search) {
        params.append('search', search)
      }

      const response = await fetch(`/api/admin/customers?${params.toString()}`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في جلب العملاء')
      }

      setCustomers(data.data.customers || [])
      setTotalPages(data.data.pagination?.totalPages || 1)
    } catch (error: any) {
      console.error('Fetch error:', error)
      showToast('error', error.message || 'فشل في جلب العملاء')
    } finally {
      setIsLoading(false)
    }
  }

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      label: 'الاسم',
      sortable: true,
    },
    {
      key: 'phone',
      label: 'رقم الهاتف',
      render: (value) => (
        <a href={`tel:${value}`} className="text-primary-600 hover:underline">
          {value}
        </a>
      ),
    },
    {
      key: 'orders_count',
      label: 'عدد الطلبات',
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'total_spent',
      label: 'إجمالي الإنفاق',
      render: (value) =>
        new Intl.NumberFormat('ar-SA', {
          style: 'currency',
          currency: 'SAR',
        }).format(Number(value)),
    },
    {
      key: 'last_order_date',
      label: 'آخر طلب',
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
          إدارة العملاء
        </h1>
        <p className="text-gray-600">
          عرض جميع العملاء وطلباتهم
        </p>
      </div>

      {/* Customers Table */}
      <AdminTable
        data={customers}
        columns={columns}
        searchable={true}
        searchPlaceholder="ابحث عن عميل..."
        onSearch={(query) => {
          setCurrentPage(1)
          fetchCustomers(query)
        }}
        paginated={true}
        currentPage={currentPage}
        onPageChange={(page) => {
          setCurrentPage(page)
          fetchCustomers()
        }}
        isLoading={isLoading}
        emptyMessage="لا يوجد عملاء"
        onRowClick={(customer) =>
          router.push(`/admin/customers/${encodeURIComponent(customer.phone)}`)
        }
      />
    </div>
  )
}

