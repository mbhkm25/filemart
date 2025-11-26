// Product Editor Client Component
// Create or edit product form

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import ImageUpload from '@/components/dashboard/ImageUpload'
import { useToast } from '@/components/common/Toast'
import { productCreateSchema, productUpdateSchema } from '@/lib/validations'
import type { Product } from '@/types/database'

interface ProductEditorClientProps {
  initialProduct: Product | null
  productId: string
}

export default function ProductEditorClient({
  initialProduct,
  productId,
}: ProductEditorClientProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const isNew = productId === 'new'
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: initialProduct?.name || '',
    description: initialProduct?.description || '',
    price: initialProduct ? String(initialProduct.price) : '',
    images: initialProduct?.images || [],
    category: initialProduct?.category || '',
    status: initialProduct?.status || 'active',
  })

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const productData = {
        name: formData.name,
        description: formData.description || undefined,
        price: Number(formData.price),
        images: formData.images.length > 0 ? formData.images : undefined,
        category: formData.category || undefined,
        status: formData.status as 'active' | 'inactive',
      }

      // Validate
      const schema = isNew ? productCreateSchema : productUpdateSchema
      const validatedData = schema.parse(productData)

      // Send to API
      const url = isNew
        ? '/api/merchant/products'
        : `/api/merchant/products/${productId}`
      const method = isNew ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || `فشل في ${isNew ? 'إنشاء' : 'تحديث'} المنتج`)
      }

      showToast('success', `تم ${isNew ? 'إنشاء' : 'تحديث'} المنتج بنجاح`)
      router.push('/dashboard/catalog')
    } catch (error: any) {
      console.error('Save error:', error)
      showToast('error', error.message || `فشل في ${isNew ? 'إنشاء' : 'تحديث'} المنتج`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = async (url: string): Promise<void> => {
    setFormData({
      ...formData,
      images: [...formData.images, url],
    })
  }

  const handleImageRemove = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {isNew ? 'إضافة منتج جديد' : 'تعديل المنتج'}
          </h1>
          <Link href="/dashboard/catalog">
            <Button variant="outline" size="sm">
              العودة
            </Button>
          </Link>
        </div>

        <Card>
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <Input
                label="اسم المنتج"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  الوصف
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="اكتب وصفاً للمنتج"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="السعر (ريال)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
                <Input
                  label="الفئة"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                صور المنتج ({formData.images.length}/10)
              </label>
              {formData.images.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                      <Image
                        src={image}
                        alt={`Product ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 25vw, 20vw"
                      />
                      <button
                        onClick={() => handleImageRemove(index)}
                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center"
                      >
                        <div className="opacity-0 group-hover:opacity-100 p-2 bg-red-500 text-white rounded">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {formData.images.length < 10 && (
                <ImageUpload
                  onUpload={handleImageUpload}
                  maxSize={5}
                  maxImages={10}
                  currentImages={formData.images.length}
                />
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحالة
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={formData.status === 'active'}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })
                    }
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span>نشط</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={formData.status === 'inactive'}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })
                    }
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span>معطل</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
              <Link href="/dashboard/catalog">
                <Button variant="outline">إلغاء</Button>
              </Link>
              <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

