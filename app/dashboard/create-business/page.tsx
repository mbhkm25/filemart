// Create Business Page
// BIRM: Allows users to create a new business profile

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import StateBox from '@/components/common/StateBox'
import { useSetBusiness } from '@/contexts/BusinessContext'

export default function CreateBusinessPage() {
  const router = useRouter()
  const setCurrentBusinessId = useSetBusiness()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'store' as 'store' | 'service',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Auto-generate slug from name if not provided
      const slug = formData.slug || formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      const response = await fetch('/api/user/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          slug,
          type: formData.type,
          description: formData.description || null,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في إنشاء الملف التجاري')
      }

      // Set current business in context and redirect to business dashboard
      const created = data.data
      if (created?.id) {
        setCurrentBusinessId(created.id)
        router.push(`/dashboard/business/${created.id}`)
        return
      }

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'حدث خطأ')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">إنشاء ملف تجاري جديد</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="اسم الملف التجاري"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="مثال: متجر الأزياء"
            disabled={loading}
          />

          <Input
            label="المعرف (Slug)"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="سيتم توليده تلقائياً من الاسم"
            disabled={loading}
            helperText="سيتم استخدامه في رابط الملف التجاري"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع الملف التجاري
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="store"
                  checked={formData.type === 'store'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'store' | 'service' })}
                  className="mr-2"
                  disabled={loading}
                />
                <span>متجر (Store)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="service"
                  checked={formData.type === 'service'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'store' | 'service' })}
                  className="mr-2"
                  disabled={loading}
                />
                <span>خدمة (Service)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الوصف (اختياري)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
              placeholder="وصف مختصر عن الملف التجاري"
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading ? 'جاري الإنشاء...' : 'إنشاء'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

