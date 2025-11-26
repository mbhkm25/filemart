// Order Details Client Component
// Display full order info

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
import type { OrderItem } from '@/types/database'

interface OrderData {
  order: {
    id: string
    profile_id: string
    business_name: string
    business_slug: string
    merchant_name: string
    client_name: string
    client_phone: string
    status: 'new' | 'processing' | 'completed' | 'cancelled'
    notes: string | null
    created_at: string
  }
  items: OrderItem[]
  total: number
}

const statusConfig = {
  new: { label: 'جديد', variant: 'info' as const },
  processing: { label: 'معالجة', variant: 'warning' as const },
  completed: { label: 'مكتمل', variant: 'success' as const },
  cancelled: { label: 'ملغي', variant: 'error' as const },
}

export default function OrderDetailsClient({ orderId }: { orderId: string }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [data, setData] = useState<OrderData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`)
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'فشل في جلب تفاصيل الطلب')
      }

      setData(result.data)
    } catch (error: any) {
      console.error('Fetch error:', error)
      showToast('error', error.message || 'فشل في جلب تفاصيل الطلب')
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
    return <StateBox type="error" title="خطأ" description="فشل في جلب تفاصيل الطلب" />
  }

  const { order, items, total } = data
  const status = statusConfig[order.status]

  const formattedDate = new Date(order.created_at).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            تفاصيل الطلب
          </h1>
          <p className="text-gray-600">طلب #{order.id.slice(0, 8)}</p>
        </div>
        <Link href="/admin/orders">
          <Button variant="outline" size="sm">
            العودة
          </Button>
        </Link>
      </div>

      {/* Order Info */}
      <Card>
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">معلومات الطلب</h2>
            <Tag label={status.label} variant={status.variant} size="md" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">اسم العميل</p>
              <p className="font-medium text-gray-900">{order.client_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">رقم الهاتف</p>
              <a
                href={`tel:${order.client_phone}`}
                className="font-medium text-primary-600 hover:underline"
              >
                {order.client_phone}
              </a>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">الملف التجاري</p>
              <Link
                href={`/admin/profiles/${order.profile_id}`}
                className="font-medium text-primary-600 hover:underline"
              >
                {order.business_name}
              </Link>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">التاجر</p>
              <Link
                href={`/admin/merchants/${order.profile_id}`}
                className="font-medium text-primary-600 hover:underline"
              >
                {order.merchant_name}
              </Link>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">تاريخ الطلب</p>
              <p className="font-medium text-gray-900">{formattedDate}</p>
            </div>
          </div>

          {order.notes && (
            <div>
              <p className="text-sm text-gray-600 mb-1">ملاحظات</p>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{order.notes}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Order Items */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">المنتجات</h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.product_name}</p>
                <p className="text-sm text-gray-600">
                  {item.quantity} ×{' '}
                  {new Intl.NumberFormat('ar-SA', {
                    style: 'currency',
                    currency: 'SAR',
                  }).format(Number(item.unit_price))}
                </p>
              </div>
              <p className="font-semibold text-gray-900">
                {new Intl.NumberFormat('ar-SA', {
                  style: 'currency',
                  currency: 'SAR',
                }).format(Number(item.unit_price) * item.quantity)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-gray-900">الإجمالي</p>
            <p className="text-2xl font-bold text-primary-600">
              {new Intl.NumberFormat('ar-SA', {
                style: 'currency',
                currency: 'SAR',
              }).format(total)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

