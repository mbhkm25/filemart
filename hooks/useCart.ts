// Cart State Management Hook
// LocalStorage persistence for order items

'use client'

import { useState, useEffect, useCallback } from 'react'

export interface CartItem {
  productId: string
  productName: string
  productImage?: string
  price: number
  quantity: number
}

interface Cart {
  items: CartItem[]
  profileId: string | null
}

const CART_STORAGE_KEY = 'filemart_cart'

export function useCart() {
  const [cart, setCart] = useState<Cart>({ items: [], profileId: null })
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Cart
        setCart(parsed)
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
      } catch (error) {
        console.error('Error saving cart to localStorage:', error)
      }
    }
  }, [cart, isLoaded])

  // Set profile ID (when visiting a business profile)
  const setProfileId = useCallback((profileId: string) => {
    setCart((prev) => {
      // Clear cart if switching to different profile
      if (prev.profileId && prev.profileId !== profileId) {
        return { items: [], profileId }
      }
      return { ...prev, profileId }
    })
  }, [])

  // Add item to cart
  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setCart((prev) => {
      const existingItem = prev.items.find(
        (i) => i.productId === item.productId
      )

      if (existingItem) {
        // Increase quantity if item already exists
        return {
          ...prev,
          items: prev.items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        }
      } else {
        // Add new item
        return {
          ...prev,
          items: [...prev.items, { ...item, quantity: 1 }],
        }
      }
    })
  }, [])

  // Remove item from cart
  const removeItem = useCallback((productId: string) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.productId !== productId),
    }))
  }, [])

  // Update item quantity
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    setCart((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      ),
    }))
  }, [removeItem])

  // Clear cart
  const clearCart = useCallback(() => {
    setCart({ items: [], profileId: null })
    try {
      localStorage.removeItem(CART_STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing cart from localStorage:', error)
    }
  }, [])

  // Calculate total
  const total = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  // Get item count
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)

  return {
    cart,
    items: cart.items,
    profileId: cart.profileId,
    total,
    itemCount,
    isLoaded,
    setProfileId,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  }
}

