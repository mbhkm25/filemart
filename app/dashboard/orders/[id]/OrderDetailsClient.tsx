// Order Details Client Component
// Display full order info and status management

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Tag from '@/components/common/Tag'
import { useToast } from '@/components/common/Toast'
import type { Order, OrderItem } from '@/types/database'

interface OrderDetailsClientProps {
  order: Order
  items: OrderItem[]
}

const statusConfig = {
  new: { label: 'جديد', variant: 'info' as const },
  processing: { label: 'معالجة', variant: 'warning' as const },
  completed: { label: 'مكتمل', variant: 'success' as const },
  cancelled: { label: 'ملغي', variant: 'error' as const },
}

const validTransitions: Record<string, string[]> = {
  new: ['processing', 'cancelled'],
  processing: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

export default function OrderDetailsClient({
  order,
  items,
}: OrderDetailsClientProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [currentStatus, setCurrentStatus] = useState(order.status)
  const [isUpdating, setIsUpdating] = useState(false)

  const total = items.reduce(
    (sum, item) => sum + Number(item.price_at_order) * item.quantity,
    0
  )

  const formattedDate = new Date(order.created_at).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const handleStatusChange = async (newStatus: string) => {
    if (!validTransitions[currentStatus].includes(newStatus)) {
      showToast('error', 'لا يمكن تغيير الحالة بهذه الطريقة')
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/merchant/orders/${order.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في تحديث حالة الطلب')
      }

      setCurrentStatus(newStatus as any)
      showToast('success', 'تم تحديث حالة الطلب بنجاح')
      router.refresh()
    } catch (error: any) {
      console.error('Status change error:', error)
      showToast('error', error.message || 'فشل في تحديث حالة الطلب')
    } finally {
      setIsUpdating(false)
    }
  }

  const status = statusConfig[currentStatus]
  const availableTransitions = validTransitions[currentStatus]

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              تفاصيل الطلب
            </h1>
            <p className="text-gray-600">طلب #{order.id.slice(0, 8)}</p>
          </div>
          <Link href="/dashboard/orders">
            <Button variant="outline" size="sm">
              العودة
            </Button>
          </Link>
        </div>

        {/* Order Info */}
        <Card>
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <p className="text-sm text-gray-600 mb-1">حالة الطلب</p>
                <Tag label={status.label} variant={status.variant} size="md" />
              </div>
              {availableTransitions.length > 0 && (
                <div className="flex gap-2">
                  {availableTransitions.map((transition) => {
                    const transitionConfig = statusConfig[transition as keyof typeof statusConfig]
                    return (
                      <Button
                        key={transition}
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(transition)}
                        disabled={isUpdating}
                      >
                        {transitionConfig.label}
                      </Button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Client Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">معلومات العميل</h2>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">الاسم</p>
                  <p className="font-medium text-gray-900">{order.client_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">رقم الهاتف</p>
                  <a
                    href={`tel:${order.client_phone}`}
                    className="font-medium text-primary-600 hover:underline"
                  >
                    {order.client_phone}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-gray-600">تاريخ الطلب</p>
                  <p className="font-medium text-gray-900">{formattedDate}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
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
                        }).format(Number(item.price_at_order))}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {new Intl.NumberFormat('ar-SA', {
                        style: 'currency',
                        currency: 'SAR',
                      }).format(Number(item.price_at_order) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">ملاحظات</h2>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{order.notes}</p>
              </div>
            )}

            {/* Total */}
            <div className="pt-4 border-t border-gray-200">
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
          </div>
        </Card>
      </div>
    </div>
  )
}

