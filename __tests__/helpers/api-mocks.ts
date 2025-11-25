// API Route Mocks
// Mock implementations for API routes in tests

import type { NextRequest } from 'next/server'
import { mockBusinessProfile, mockProduct, mockOrder, mockPlugin } from './mock-data'

// Mock API response helper
export function createMockResponse(data: any, status = 200) {
  return Response.json(
    {
      success: status >= 200 && status < 300,
      data,
      error: status >= 400 ? 'Error message' : undefined,
    },
    { status }
  )
}

// Mock API routes
export const mockApiRoutes = {
  // Public API
  '/api/public/profile/test-business': createMockResponse({
    profile: mockBusinessProfile,
    products: [mockProduct],
    gallery: [],
    plugins: [],
  }),

  '/api/public/orders': createMockResponse(
    {
      id: 'order-1',
      message: 'تم إرسال الطلب بنجاح',
    },
    201
  ),

  // Merchant API
  '/api/merchant/profile': createMockResponse({
    profile: mockBusinessProfile,
  }),

  '/api/merchant/products': createMockResponse({
    products: [mockProduct],
  }),

  '/api/merchant/orders': createMockResponse({
    orders: [mockOrder],
  }),

  '/api/merchant/plugins': createMockResponse({
    available: [mockPlugin],
    installed: [],
  }),

  // Auth API
  '/api/auth/login': createMockResponse({
    token: 'mock-jwt-token',
    user: {
      id: 'merchant-1',
      email: 'merchant@example.com',
      name: 'Test Merchant',
      role: 'merchant',
    },
  }),
}

// Mock fetch for tests
export function mockFetch(url: string, options?: RequestInit) {
  const urlObj = new URL(url, 'http://localhost:3000')
  const path = urlObj.pathname

  // Find matching mock route
  const mockRoute = Object.keys(mockApiRoutes).find((route) =>
    path.startsWith(route)
  )

  if (mockRoute) {
    return Promise.resolve(mockApiRoutes[mockRoute as keyof typeof mockApiRoutes])
  }

  // Default 404
  return Promise.resolve(
    createMockResponse({ error: 'Not found' }, 404)
  )
}

