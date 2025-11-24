// Merchant Details Client Component
// Display merchant info and actions

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Tag from '@/components/common/Tag'
import Modal from '@/components/common/Modal'
import StateBox from '@/components/common/StateBox'
import Skeleton from '@/components/common/Skeleton'
import { useToast } from '@/components/common/Toast'

interface MerchantData {
  merchant: {
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
  profile: {
    id: string
    slug: string
    name: string
    is_published: boolean
    completion_percentage: number
  } | null
  ordersCount: number
}

export default function MerchantDetailsClient({ merchantId }: { merchantId: string }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [data, setData] = useState<MerchantData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchMerchant()
  }, [merchantId])

  const fetchMerchant = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/merchants/${merchantId}`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في جلب بيانات التاجر')
      }

      setData(data.data)
    } catch (error: any) {
      console.error('Fetch error:', error)
      showToast('error', error.message || 'فشل في جلب بيانات التاجر')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuspend = async () => {
    if (!data) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/merchants/${merchantId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !data.merchant.is_active }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'فشل في تحديث حالة التاجر')
      }

      setData({
        ...data,
        merchant: { ...data.merchant, is_active: !data.merchant.is_active },
      })
      setShowSuspendModal(false)
      showToast('success', 'تم تحديث حالة التاجر بنجاح')
    } catch (error: any) {
      console.error('Update error:', error)
      showToast('error', error.message || 'فشل في تحديث حالة التاجر')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/merchants/${merchantId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'فشل في حذف التاجر')
      }

      showToast('success', 'تم حذف التاجر بنجاح')
      router.push('/admin/merchants')
    } catch (error: any) {
      console.error('Delete error:', error)
      showToast('error', error.message || 'فشل في حذف التاجر')
    } finally {
      setIsUpdating(false)
      setShowDeleteModal(false)
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
    return <StateBox type="error" title="خطأ" description="فشل في جلب بيانات التاجر" />
  }

  const { merchant, profile, ordersCount } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            تفاصيل التاجر
          </h1>
          <p className="text-gray-600">{merchant.name}</p>
        </div>
        <Link href="/admin/merchants">
          <Button variant="outline" size="sm">
            العودة
          </Button>
        </Link>
      </div>

      {/* Merchant Info */}
      <Card>
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">معلومات التاجر</h2>
            <Tag
              label={merchant.is_active ? 'نشط' : 'معطل'}
              variant={merchant.is_active ? 'success' : 'error'}
              size="md"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">الاسم</p>
              <p className="font-medium text-gray-900">{merchant.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">البريد الإلكتروني</p>
              <p className="font-medium text-gray-900">{merchant.email}</p>
              {merchant.email_verified && (
                <Tag label="موثق" variant="success" size="sm" className="mt-1" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">رقم الهاتف</p>
              <p className="font-medium text-gray-900">{merchant.phone || '-'}</p>
              {merchant.phone_verified && merchant.phone && (
                <Tag label="موثق" variant="success" size="sm" className="mt-1" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">تاريخ التسجيل</p>
              <p className="font-medium text-gray-900">
                {new Date(merchant.created_at).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Business Profile */}
      {profile ? (
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">الملف التجاري</h2>
              <Link href={`/admin/profiles/${profile.id}`}>
                <Button variant="outline" size="sm">
                  عرض التفاصيل
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">اسم الملف</p>
                <p className="font-medium text-gray-900">{profile.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">حالة النشر</p>
                <Tag
                  label={profile.is_published ? 'منشور' : 'غير منشور'}
                  variant={profile.is_published ? 'success' : 'default'}
                  size="sm"
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">نسبة الاكتمال</p>
                <p className="font-medium text-gray-900">{profile.completion_percentage}%</p>
              </div>
            </div>
            <div>
              <Link href={`/${profile.slug}`} target="_blank">
                <Button variant="outline" size="sm">
                  عرض الملف العام
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <StateBox
            type="empty"
            title="لا يوجد ملف تجاري"
            description="التاجر لم ينشئ ملف تجاري بعد"
          />
        </Card>
      )}

      {/* Stats */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">الإحصائيات</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">عدد الطلبات</p>
            <p className="text-2xl font-bold text-gray-900">{ordersCount}</p>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">الإجراءات</h2>
        <div className="flex gap-4">
          <Button
            variant={merchant.is_active ? 'danger' : 'primary'}
            onClick={() => setShowSuspendModal(true)}
          >
            {merchant.is_active ? 'تعطيل الحساب' : 'تفعيل الحساب'}
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            حذف الحساب
          </Button>
        </div>
      </Card>

      {/* Suspend Modal */}
      <Modal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        title={merchant.is_active ? 'تعطيل الحساب' : 'تفعيل الحساب'}
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            هل أنت متأكد من رغبتك في {merchant.is_active ? 'تعطيل' : 'تفعيل'} حساب التاجر{' '}
            <strong>{merchant.name}</strong>؟
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
              variant={merchant.is_active ? 'danger' : 'primary'}
              onClick={handleSuspend}
              disabled={isUpdating}
            >
              {isUpdating ? 'جاري التحديث...' : merchant.is_active ? 'تعطيل' : 'تفعيل'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="حذف الحساب"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            تحذير: حذف حساب التاجر <strong>{merchant.name}</strong> سيؤدي إلى تعطيل الحساب. لا
            يمكن التراجع عن هذه العملية.
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isUpdating}
            >
              إلغاء
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={isUpdating}>
              {isUpdating ? 'جاري الحذف...' : 'حذف'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

