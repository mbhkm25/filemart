// useCart Hook Tests
// Test add, remove, update, clear, LocalStorage persistence, profile switching

import { renderHook, act } from '@testing-library/react'
import { useCart } from '@/hooks/useCart'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useCart Hook', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  test('should initialize with empty cart', () => {
    const { result } = renderHook(() => useCart())

    expect(result.current.items).toEqual([])
    expect(result.current.total).toBe(0)
    expect(result.current.itemCount).toBe(0)
    expect(result.current.profileId).toBeNull()
  })

  test('should add item to cart', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem({
        productId: 'product-1',
        productName: 'Test Product',
        price: 100,
      })
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].productId).toBe('product-1')
    expect(result.current.items[0].quantity).toBe(1)
    expect(result.current.total).toBe(100)
    expect(result.current.itemCount).toBe(1)
  })

  test('should increase quantity when adding same product', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem({
        productId: 'product-1',
        productName: 'Test Product',
        price: 100,
      })
    })

    act(() => {
      result.current.addItem({
        productId: 'product-1',
        productName: 'Test Product',
        price: 100,
      })
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(2)
    expect(result.current.total).toBe(200)
    expect(result.current.itemCount).toBe(2)
  })

  test('should remove item from cart', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem({
        productId: 'product-1',
        productName: 'Test Product',
        price: 100,
      })
    })

    act(() => {
      result.current.removeItem('product-1')
    })

    expect(result.current.items).toHaveLength(0)
    expect(result.current.total).toBe(0)
    expect(result.current.itemCount).toBe(0)
  })

  test('should update item quantity', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem({
        productId: 'product-1',
        productName: 'Test Product',
        price: 100,
      })
    })

    act(() => {
      result.current.updateQuantity('product-1', 3)
    })

    expect(result.current.items[0].quantity).toBe(3)
    expect(result.current.total).toBe(300)
    expect(result.current.itemCount).toBe(3)
  })

  test('should remove item when quantity is 0', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem({
        productId: 'product-1',
        productName: 'Test Product',
        price: 100,
      })
    })

    act(() => {
      result.current.updateQuantity('product-1', 0)
    })

    expect(result.current.items).toHaveLength(0)
  })

  test('should clear cart', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem({
        productId: 'product-1',
        productName: 'Test Product',
        price: 100,
      })
    })

    act(() => {
      result.current.clearCart()
    })

    expect(result.current.items).toHaveLength(0)
    expect(result.current.total).toBe(0)
    expect(result.current.profileId).toBeNull()
  })

  test('should set profile ID', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.setProfileId('profile-1')
    })

    expect(result.current.profileId).toBe('profile-1')
  })

  test('should clear cart when switching to different profile', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.setProfileId('profile-1')
    })

    act(() => {
      result.current.addItem({
        productId: 'product-1',
        productName: 'Test Product',
        price: 100,
      })
    })

    act(() => {
      result.current.setProfileId('profile-2')
    })

    expect(result.current.items).toHaveLength(0)
    expect(result.current.profileId).toBe('profile-2')
  })

  test('should persist cart to localStorage', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.setProfileId('profile-1')
    })

    act(() => {
      result.current.addItem({
        productId: 'product-1',
        productName: 'Test Product',
        price: 100,
      })
    })

    // Wait for localStorage to be updated
    act(() => {
      // Force update
    })

    const stored = localStorageMock.getItem('filemart_cart')
    expect(stored).toBeTruthy()
    if (stored) {
      const parsed = JSON.parse(stored)
      expect(parsed.items).toHaveLength(1)
      expect(parsed.profileId).toBe('profile-1')
    }
  })

  test('should load cart from localStorage on mount', () => {
    const cartData = {
      items: [
        {
          productId: 'product-1',
          productName: 'Test Product',
          price: 100,
          quantity: 2,
        },
      ],
      profileId: 'profile-1',
    }

    localStorageMock.setItem('filemart_cart', JSON.stringify(cartData))

    const { result } = renderHook(() => useCart())

    // Wait for load
    act(() => {
      // Force update
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.profileId).toBe('profile-1')
  })
})

