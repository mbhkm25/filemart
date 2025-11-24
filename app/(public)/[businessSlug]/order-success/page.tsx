// Order Success Page
// Clear cart and show success message

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import { useCart } from '@/hooks/useCart'

interface OrderSuccessPageProps {
  params: Promise<{ businessSlug: string }>
}

export default function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const [slug, setSlug] = useState<string>('')

  useEffect(() => {
    params.then((p) => setSlug(p.businessSlug))
  }, [params])

  // Clear cart on mount
  useEffect(() => {
    clearCart()
  }, [clearCart])

  const orderId = searchParams.get('orderId')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          تم إرسال الطلب بنجاح!
        </h1>
        <p className="text-gray-600 mb-4">
          شكراً لك! تم استلام طلبك وسيتم التواصل معك قريباً.
        </p>

        {orderId && (
          <p className="text-sm text-gray-500 mb-6">
            رقم الطلب: <span className="font-mono">{orderId}</span>
          </p>
        )}

        {/* Back Button */}
        <Link href={`/${slug}`}>
          <Button variant="primary" fullWidth>
            العودة إلى الملف التجاري
          </Button>
        </Link>
      </Card>
    </div>
  )
}
