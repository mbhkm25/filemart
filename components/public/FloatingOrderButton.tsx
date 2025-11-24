// FloatingOrderButton Component
// Fixed position button with cart badge

'use client'

import Link from 'next/link'
import Button from '@/components/common/Button'
import { useCart } from '@/hooks/useCart'
import { cn } from '@/lib/utils'

export interface FloatingOrderButtonProps {
  slug: string
  className?: string
}

export default function FloatingOrderButton({
  slug,
  className,
}: FloatingOrderButtonProps) {
  const { itemCount, isLoaded } = useCart()

  // Don't show if cart is empty or not loaded
  if (!isLoaded || itemCount === 0) {
    return null
  }

  return (
    <Link href={`/${slug}/order-list`}>
      <div
        className={cn(
          'fixed bottom-6 left-6 z-50', // RTL: left instead of right
          'md:bottom-8 md:left-8',
          className
        )}
      >
        <Button
          variant="primary"
          size="lg"
          className="relative shadow-lg"
        >
          <span className="flex items-center gap-2">
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
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span>قائمة الطلب</span>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </span>
        </Button>
      </div>
    </Link>
  )
}

