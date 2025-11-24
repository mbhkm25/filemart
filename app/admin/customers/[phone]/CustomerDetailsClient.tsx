// Customer Details Client Component
// Display customer info and orders history

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Tag from '@/components/common/Tag'
import StateBox from '@/components/common/StateBox'
import Skeleton from '@/components/common/Skeleton'
import { useToast } from '@/components/common/Toast'

interface CustomerData {
  customer: {
    phone: string
    name: string
    orders_count: number
    last_order_date: string
    total_spent: number
  }
  orders: Array<{
    id: string
    business_name: string
    status: string
    created_at: string
  }>
}

const statusConfig = {
  new: { label: 'جديد', variant: 'info' as const },
  processing: { label: 'معالجة', variant: 'warning' as const },
  completed: { label: 'مكتمل', variant: 'success' as const },
  cancelled: { label: 'ملغي', variant: 'error' as const },
}

export default function CustomerDetailsClient({ phone }: { phone: string }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [data, setData] = useState<CustomerData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCustomer()
  }, [phone])

  const fetchCustomer = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/customers/${encodeURIComponent(phone)}`)
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'فشل في جلب بيانات العميل')
      }

      setData(result.data)
    } catch (error: any) {
      console.error('Fetch error:', error)
      showToast('error', error.message || 'فشل في جلب بيانات العميل')
    } finally {
      setIsLoading(false)
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

  if (!data) {
    return <StateBox type="error" title="خطأ" description="فشل في جلب بيانات العميل" />
  }

  const { customer, orders } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            تفاصيل العميل
          </h1>
          <p className="text-gray-600">{customer.name}</p>
        </div>
        <Link href="/admin/customers">
          <Button variant="outline" size="sm">
            العودة
          </Button>
        </Link>
      </div>

      {/* Customer Info */}
      <Card>
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">معلومات العميل</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">الاسم</p>
              <p className="font-medium text-gray-900">{customer.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">رقم الهاتف</p>
              <a
                href={`tel:${customer.phone}`}
                className="font-medium text-primary-600 hover:underline"
              >
                {customer.phone}
              </a>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">عدد الطلبات</p>
              <p className="text-2xl font-bold text-gray-900">{customer.orders_count}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">إجمالي الإنفاق</p>
              <p className="text-2xl font-bold text-primary-600">
                {new Intl.NumberFormat('ar-SA', {
                  style: 'currency',
                  currency: 'SAR',
                }).format(customer.total_spent)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">آخر طلب</p>
              <p className="font-medium text-gray-900">
                {new Date(customer.last_order_date).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Orders History */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">سجل الطلبات</h2>
        {orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order) => {
              const status = statusConfig[order.status as keyof typeof statusConfig]
              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/orders/${order.id}`)}
                >
                  <div>
                    <p className="font-medium text-gray-900">{order.business_name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <Tag label={status.label} variant={status.variant} size="sm" />
                </div>
              )
            })}
          </div>
        ) : (
          <StateBox type="empty" title="لا توجد طلبات" description="العميل لم يقدم أي طلبات بعد" />
        )}
      </Card>
    </div>
  )
}

