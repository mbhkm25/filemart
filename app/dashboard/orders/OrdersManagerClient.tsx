// Orders Manager Client Component
// Tabs, order list, status management

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/common/Card'
import OrderRow from '@/components/dashboard/OrderRow'
import StateBox from '@/components/common/StateBox'
import Skeleton from '@/components/common/Skeleton'
import { useToast } from '@/components/common/Toast'
import { cn } from '@/lib/utils'
import { useBusiness } from '@/contexts/BusinessContext'

type OrderStatus = 'all' | 'new' | 'processing' | 'completed' | 'cancelled'

interface Order {
  id: string
  client_name: string
  client_phone: string
  status: 'new' | 'processing' | 'completed' | 'cancelled'
  total_amount: number
  items_count: number
  created_at: string
  notes?: string | null
}

interface OrdersStats {
  new: number
  processing: number
  completed: number
  cancelled: number
}

export default function OrdersManagerClient() {
  const router = useRouter()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<OrderStatus>('all')
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<OrdersStats>({
    new: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const businessId = useBusiness()

  if (!businessId) {
    return null
  }

  useEffect(() => {
    fetchOrders()
    // Poll for new orders every 10 seconds
    const interval = setInterval(fetchOrders, 10000)
    return () => clearInterval(interval)
  }, [activeTab])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeTab !== 'all') {
        params.append('status', activeTab)
      }

      const response = await fetch(
        `/api/businesses/${businessId}/orders?${params.toString()}`
      )
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في جلب الطلبات')
      }

      setOrders(data.data.orders || [])
      setStats(data.data.stats || stats)
    } catch (error: any) {
      console.error('Fetch error:', error)
      showToast('error', error.message || 'فشل في جلب الطلبات')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `/api/businesses/${businessId}/orders/${orderId}/status`,
        {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في تحديث حالة الطلب')
      }

      setOrders(
        orders.map((o) =>
          o.id === orderId ? { ...o, status: newStatus as any } : o
        )
      )
      showToast('success', 'تم تحديث حالة الطلب')
      fetchOrders() // Refresh stats
    } catch (error: any) {
      console.error('Status change error:', error)
      showToast('error', error.message || 'فشل في تحديث حالة الطلب')
    }
  }

  const tabs: { id: OrderStatus; label: string; badge?: number }[] = [
    { id: 'all', label: 'الكل' },
    { id: 'new', label: 'جديد', badge: stats.new },
    { id: 'processing', label: 'معالجة', badge: stats.processing },
    { id: 'completed', label: 'مكتمل', badge: stats.completed },
    { id: 'cancelled', label: 'ملغي', badge: stats.cancelled },
  ]

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            الطلبات
          </h1>
          <p className="text-gray-600">
            إدارة طلبات العملاء
          </p>
        </div>

        {/* Tabs */}
        <Card>
          <div className="flex flex-wrap gap-2 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-4 py-2 text-sm font-medium border-b-2 transition-colors relative',
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                )}
              >
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="mr-2 px-2 py-0.5 text-xs font-medium text-white bg-primary-600 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </Card>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={100} rounded="lg" />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                onClick={() => router.push(`/dashboard/orders/${order.id}`)}
              />
            ))}
          </div>
        ) : (
          <StateBox
            type="empty"
            title="لا توجد طلبات"
            description={
              activeTab === 'all'
                ? 'لم يتم استلام أي طلبات بعد'
                : `لا توجد طلبات بحالة "${tabs.find((t) => t.id === activeTab)?.label}"`
            }
          />
        )}
      </div>
    </div>
  )
}

