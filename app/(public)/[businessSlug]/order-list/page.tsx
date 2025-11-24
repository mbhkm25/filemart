// Order List Page
// Client component for cart management and order submission

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Card from '@/components/common/Card'
import StateBox from '@/components/common/StateBox'
import { useCart } from '@/hooks/useCart'
import { useToast } from '@/components/common/Toast'
import { orderCreateSchema } from '@/lib/validations'
import type { OrderCreateInput } from '@/lib/validations'

interface OrderListPageProps {
  params: Promise<{ businessSlug: string }>
}

export default function OrderListPage({ params }: OrderListPageProps) {
  const router = useRouter()
  const { items, total, itemCount, profileId, updateQuantity, removeItem, isLoaded } = useCart()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Get params
  const [slug, setSlug] = useState<string>('')
  useEffect(() => {
    params.then((p) => setSlug(p.businessSlug))
  }, [params])

  // Redirect if cart is empty
  useEffect(() => {
    if (isLoaded && (itemCount === 0 || !profileId)) {
      router.push(`/${slug}`)
    }
  }, [isLoaded, itemCount, profileId, slug, router])

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity)
  }

  const handleRemove = (productId: string) => {
    removeItem(productId)
    showToast('info', 'تم حذف المنتج من السلة')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const validationResult = orderCreateSchema.safeParse({
      profile_id: profileId || '',
      items: items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
      })),
      client: {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
      },
      notes: formData.notes || undefined,
    })

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {}
      validationResult.error.errors.forEach((err) => {
        const path = err.path.join('.')
        fieldErrors[path] = err.message
      })
      setErrors(fieldErrors)
      showToast('error', 'يرجى التحقق من البيانات المدخلة')
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/public/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validationResult.data),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في إرسال الطلب')
      }

      // Redirect to success page
      router.push(`/${slug}/order-success?orderId=${data.data?.orderId || ''}`)
    } catch (error: any) {
      console.error('Order submission error:', error)
      showToast('error', error.message || 'فشل في إرسال الطلب')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (itemCount === 0 || !profileId) {
    return null // Will redirect
  }

  const formattedTotal = new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
  }).format(total)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <Link href={`/${slug}`}>
            <Button variant="outline" size="sm">
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                العودة
              </span>
            </Button>
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">قائمة الطلب</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.productId}>
                <div className="flex gap-4">
                  {/* Product Image */}
                  {item.productImage && (
                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">
                      {item.productName}
                    </h3>
                    <p className="text-lg font-bold text-primary-600 mb-2">
                      {new Intl.NumberFormat('ar-SA', {
                        style: 'currency',
                        currency: 'SAR',
                        minimumFractionDigits: 0,
                      }).format(item.price)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 12H4"
                          />
                        </svg>
                      </button>
                      <span className="text-lg font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="text-red-500 hover:text-red-700 p-2"
                    aria-label="حذف"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Form */}
          <div className="md:col-span-1">
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                بيانات العميل
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="الاسم"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  error={errors['client.name']}
                />

                <Input
                  label="رقم الهاتف"
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  error={errors['client.phone']}
                />

                <Input
                  label="البريد الإلكتروني (اختياري)"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  error={errors['client.email']}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    ملاحظات (اختياري)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-900">
                      الإجمالي:
                    </span>
                    <span className="text-2xl font-bold text-primary-600">
                      {formattedTotal}
                    </span>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
