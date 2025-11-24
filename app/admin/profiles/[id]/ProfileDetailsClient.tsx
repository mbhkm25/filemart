// Profile Details Client Component
// Display profile info and admin actions

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Tag from '@/components/common/Tag'
import { useToast } from '@/components/common/Toast'
import StateBox from '@/components/common/StateBox'
import Skeleton from '@/components/common/Skeleton'
import type { BusinessProfile } from '@/types/database'

export default function ProfileDetailsClient({ profileId }: { profileId: string }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [profile, setProfile] = useState<BusinessProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [profileId])

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/profiles/${profileId}`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في جلب الملف التجاري')
      }

      setProfile(data.data)
    } catch (error: any) {
      console.error('Fetch error:', error)
      showToast('error', error.message || 'فشل في جلب الملف التجاري')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublishToggle = async () => {
    if (!profile) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/profiles/${profileId}/publish`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_published: !profile.is_published }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في تحديث حالة النشر')
      }

      setProfile({ ...profile, is_published: !profile.is_published })
      showToast('success', 'تم تحديث حالة النشر بنجاح')
    } catch (error: any) {
      console.error('Update error:', error)
      showToast('error', error.message || 'فشل في تحديث حالة النشر')
    } finally {
      setIsUpdating(false)
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

  if (!profile) {
    return <StateBox type="error" title="خطأ" description="فشل في جلب الملف التجاري" />
  }

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${profile.slug}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            تفاصيل الملف التجاري
          </h1>
          <p className="text-gray-600">{profile.name}</p>
        </div>
        <Link href="/admin/profiles">
          <Button variant="outline" size="sm">
            العودة
          </Button>
        </Link>
      </div>

      {/* Profile Info */}
      <Card>
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">معلومات الملف</h2>
            <Tag
              label={profile.is_published ? 'منشور' : 'غير منشور'}
              variant={profile.is_published ? 'success' : 'default'}
              size="md"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">اسم الملف</p>
              <p className="font-medium text-gray-900">{profile.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">الرابط</p>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">{profile.slug}</code>
            </div>
            {profile.description && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-1">الوصف</p>
                <p className="text-gray-900">{profile.description}</p>
              </div>
            )}
            {profile.category && (
              <div>
                <p className="text-sm text-gray-600 mb-1">الفئة</p>
                <p className="font-medium text-gray-900">{profile.category}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600 mb-1">نسبة الاكتمال</p>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${profile.completion_percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">{profile.completion_percentage}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">الرابط العام</p>
              <Link href={publicUrl} target="_blank" className="text-primary-600 hover:underline">
                {publicUrl}
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">الإجراءات</h2>
        <div className="flex gap-4">
          <Button
            variant={profile.is_published ? 'outline' : 'primary'}
            onClick={handlePublishToggle}
            disabled={isUpdating}
          >
            {isUpdating
              ? 'جاري التحديث...'
              : profile.is_published
              ? 'إلغاء النشر'
              : 'نشر الملف'}
          </Button>
          <Link href={`/admin/merchants/${profile.merchant_id}`}>
            <Button variant="outline">عرض التاجر</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

