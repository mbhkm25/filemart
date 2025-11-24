// Add to Cart Button Component
// Client component for cart interaction

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/common/Button'
import { useCart } from '@/hooks/useCart'
import { useToast } from '@/components/common/Toast'
import type { CartItem } from '@/hooks/useCart'

interface AddToCartButtonProps {
  product: Omit<CartItem, 'quantity'>
  slug: string
}

export default function AddToCartButton({
  product,
  slug,
}: AddToCartButtonProps) {
  const router = useRouter()
  const { addItem, setProfileId, isLoaded } = useCart()
  const { showToast } = useToast()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async () => {
    if (!isLoaded) return

    setIsAdding(true)

    try {
      // Set profile ID to ensure cart is for this business
      setProfileId(slug)

      // Add item to cart
      addItem(product)

      showToast('success', 'تمت إضافة المنتج إلى السلة')
    } catch (error) {
      showToast('error', 'فشل في إضافة المنتج')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Button
      variant="primary"
      size="lg"
      fullWidth
      onClick={handleAddToCart}
      disabled={isAdding || !isLoaded}
    >
      {isAdding ? 'جاري الإضافة...' : 'إضافة إلى الطلب'}
    </Button>
  )
}

