// Dashboard Home Client Component
// Client-side interactions for dashboard home

'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import StatCard from '@/components/dashboard/StatCard'
import { useToast } from '@/components/common/Toast'
import { calculateProfileCompletion, getCompletionTips } from '@/lib/profile-completion'
import type { BusinessProfile } from '@/types/database'

interface DashboardHomeClientProps {
  merchantName: string
  profile: BusinessProfile | null
  stats: {
    newOrders: number
    products: number
    completedOrders: number
  }
}

const quickActions = [
  {
    href: '/dashboard/profile',
    label: 'الملف التجاري',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/catalog',
    label: 'الكاتلوج',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    href: '/dashboard/orders',
    label: 'الطلبات',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    badge: 0,
  },
  {
    href: '/dashboard/plugins',
    label: 'الإضافات',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
  },
  {
    href: '/dashboard/gallery',
    label: 'الصور',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/settings',
    label: 'الإعدادات',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

export default function DashboardHomeClient({
  merchantName,
  profile,
  stats,
}: DashboardHomeClientProps) {
  const router = useRouter()
  const { showToast } = useToast()

  const completionPercentage = useMemo(() => {
    if (!profile) return 0
    return calculateProfileCompletion(profile)
  }, [profile])

  const tips = useMemo(() => {
    if (!profile) return []
    return getCompletionTips(profile)
  }, [profile])

  const publicUrl = profile
    ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${profile.slug}`
    : null

  const copyToClipboard = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl)
      showToast('success', 'تم نسخ الرابط')
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          مرحباً، {merchantName} 👋
        </h1>
        <p className="text-gray-600">
          هذه نظرة عامة على ملفك التجاري
        </p>
      </div>

      {/* Profile Completion Bar */}
      {profile && (
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              اكتمال الملف التجاري
            </h2>
            <span className="text-lg font-bold text-primary-600">
              {completionPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-primary-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          {tips.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700 mb-2">
                نصائح لتحسين ملفك:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {tips.slice(0, 3).map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
              {completionPercentage < 100 && (
                <Link href="/dashboard/profile">
                  <Button variant="outline" size="sm" className="mt-3">
                    إكمال الملف
                  </Button>
                </Link>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="طلبات جديدة"
          value={stats.newOrders}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          onClick={() => router.push('/dashboard/orders?status=new')}
        />
        <StatCard
          label="المنتجات"
          value={stats.products}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
          onClick={() => router.push('/dashboard/catalog')}
        />
        <StatCard
          label="طلبات مكتملة (هذا الشهر)"
          value={stats.completedOrders}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          onClick={() => router.push('/dashboard/orders?status=completed')}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="text-center p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="text-primary-600 mb-2 flex justify-center">
                  {action.icon}
                </div>
                <p className="text-sm font-medium text-gray-900">{action.label}</p>
                {action.badge !== undefined && stats.newOrders > 0 && action.href === '/dashboard/orders' && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium text-white bg-red-500 rounded-full">
                    {stats.newOrders}
                  </span>
                )}
              </Card>
            </Link>
          ))}
        </div>
      </Card>

      {/* Public Link Card */}
      {profile && publicUrl && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">الرابط العام</h2>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">رابط ملفك التجاري:</p>
              <p className="text-sm font-mono text-gray-900 break-all">{publicUrl}</p>
            </div>
            <Button variant="primary" onClick={copyToClipboard}>
              نسخ الرابط
            </Button>
          </div>
          <div className="mt-4">
            <Link href={publicUrl} target="_blank">
              <Button variant="outline" fullWidth>
                <span className="flex items-center gap-2 justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  عرض الملف العام
                </span>
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Tips Section */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">نصائح لتحسين ملفك</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-primary-600 mt-0.5">•</span>
            <span>أضف صوراً عالية الجودة لمعرض الصور</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600 mt-0.5">•</span>
            <span>اكتب وصفاً واضحاً ومختصراً عن نشاطك</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600 mt-0.5">•</span>
            <span>أضف منتجاتك مع صور وأسعار واضحة</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600 mt-0.5">•</span>
            <span>حدد أوقات العمل بدقة</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600 mt-0.5">•</span>
            <span>أضف روابط التواصل (واتساب، إنستغرام)</span>
          </li>
        </ul>
      </Card>
    </div>
  )
}

