// Admin Dashboard Client Component
// Stats, Activity Feed, Alerts

'use client'

import React, { useState, useEffect } from 'react'
import Card from '@/components/common/Card'
import StatCard from '@/components/dashboard/StatCard'
import StateBox from '@/components/common/StateBox'
import Skeleton from '@/components/common/Skeleton'
import { useToast } from '@/components/common/Toast'
import Link from 'next/link'

interface Stats {
  merchants: number
  profiles: number
  orders: number
  customers: number
  plugins: number
}

interface RecentActivity {
  orders: any[]
  merchants: any[]
}

export default function AdminDashboardClient() {
  const { showToast } = useToast()
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/stats')
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في جلب الإحصائيات')
      }

      setStats(data.data.stats)
      setRecentActivity(data.data.recentActivity)
    } catch (error: any) {
      console.error('Fetch error:', error)
      showToast('error', error.message || 'فشل في جلب الإحصائيات')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          لوحة التحكم
        </h1>
        <p className="text-gray-600">
          نظرة عامة على المنصة
        </p>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} height={120} rounded="lg" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="إجمالي التجار"
            value={stats.merchants}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            onClick={() => (window.location.href = '/admin/merchants')}
          />
          <StatCard
            label="إجمالي الملفات"
            value={stats.profiles}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            onClick={() => (window.location.href = '/admin/profiles')}
          />
          <StatCard
            label="إجمالي الطلبات"
            value={stats.orders}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            onClick={() => (window.location.href = '/admin/orders')}
          />
          <StatCard
            label="إجمالي العملاء"
            value={stats.customers}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            onClick={() => (window.location.href = '/admin/customers')}
          />
          <StatCard
            label="الإضافات النشطة"
            value={stats.plugins}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            }
            onClick={() => (window.location.href = '/admin/plugins')}
          />
        </div>
      ) : (
        <StateBox type="error" title="خطأ في التحميل" description="فشل في جلب الإحصائيات" />
      )}

      {/* Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">آخر الطلبات</h2>
            <Link href="/admin/orders" className="text-sm text-primary-600 hover:underline">
              عرض الكل
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={60} rounded="lg" />
              ))}
            </div>
          ) : recentActivity?.orders && recentActivity.orders.length > 0 ? (
            <div className="space-y-2">
              {recentActivity.orders.slice(0, 5).map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{order.client_name}</p>
                    <p className="text-sm text-gray-600">{order.business_name || 'غير معروف'}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat('ar-SA', {
                        style: 'currency',
                        currency: 'SAR',
                      }).format(Number(order.total_amount || 0))}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('ar-SA', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <StateBox type="empty" title="لا توجد طلبات" description="لم يتم استلام أي طلبات بعد" />
          )}
        </Card>

        {/* Recent Merchants */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">آخر التسجيلات</h2>
            <Link href="/admin/merchants" className="text-sm text-primary-600 hover:underline">
              عرض الكل
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={60} rounded="lg" />
              ))}
            </div>
          ) : recentActivity?.merchants && recentActivity.merchants.length > 0 ? (
            <div className="space-y-2">
              {recentActivity.merchants.map((merchant: any) => (
                <div
                  key={merchant.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{merchant.name}</p>
                    <p className="text-sm text-gray-600">{merchant.email}</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(merchant.created_at).toLocaleDateString('ar-SA', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <StateBox type="empty" title="لا توجد تسجيلات" description="لم يتم تسجيل أي تجار بعد" />
          )}
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">تنبيهات</h2>
        <div className="space-y-2">
          {stats && stats.orders > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                يوجد {stats.orders} طلب يحتاج مراجعة
              </p>
            </div>
          )}
          {stats && stats.profiles < stats.merchants && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                {stats.merchants - stats.profiles} تاجر لم ينشئ ملف تجاري بعد
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

