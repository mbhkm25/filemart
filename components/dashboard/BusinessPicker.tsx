// Business Picker Component
// BIRM: Allows user to select which business to manage

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import { useUserBusinesses } from '@/hooks/useUserBusinesses'
import { useSetBusiness } from '@/contexts/BusinessContext'
import Skeleton from '@/components/common/Skeleton'
import StateBox from '@/components/common/StateBox'
import Link from 'next/link'

export default function BusinessPicker() {
  const router = useRouter()
  const { businesses, loading, isEmpty } = useUserBusinesses()
  const setCurrentBusinessId = useSetBusiness()

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <Skeleton height={200} />
        </Card>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <StateBox
            type="empty"
            title="لا توجد ملفات تجارية"
            description="ابدأ بإنشاء ملف تجاري جديد لإدارة منتجاتك وطلباتك"
          />
          <div className="mt-6">
            <Link href="/dashboard/create-business">
              <Button>إنشاء ملف تجاري جديد</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  // If exactly one business, set context and redirect to it
  if (businesses.length === 1) {
    const business = businesses[0]
    setCurrentBusinessId(business.id)
    router.push(`/dashboard/business/${business.id}`)
    return null
  }

  // Multiple businesses: show picker
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">اختر ملف تجاري</h1>
        <p className="text-gray-600 mb-6">لديك عدة ملفات تجارية. اختر الملف الذي تريد إدارته</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {businesses.map((business) => (
            <Card
              key={business.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setCurrentBusinessId(business.id)
                router.push(`/dashboard/business/${business.id}`)
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{business.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {business.type === 'store' ? 'متجر' : 'خدمة'}
                  </p>
                  {business.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">{business.description}</p>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentBusinessId(business.id)
                    router.push(`/dashboard/business/${business.id}`)
                  }}
                >
                  فتح
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <Link href="/dashboard/create-business">
            <Button variant="outline">+ إنشاء ملف تجاري جديد</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

