// Cache Strategy Tests
// Test cache strategy selection and URL matching

import {
  getCacheStrategy,
  shouldCache,
  CACHE_STRATEGIES,
} from '@/utils/cache-strategy'

describe('Cache Strategy', () => {
  describe('getCacheStrategy', () => {
    test('should return static strategy for JS files', () => {
      const strategy = getCacheStrategy('https://example.com/app.js')
      expect(strategy.strategy).toBe('cache-first')
      expect(strategy.cacheName).toBe(CACHE_STRATEGIES.STATIC.cacheName)
    })

    test('should return static strategy for CSS files', () => {
      const strategy = getCacheStrategy('https://example.com/style.css')
      expect(strategy.strategy).toBe('cache-first')
    })

    test('should return static strategy for Next.js static files', () => {
      const strategy = getCacheStrategy('https://example.com/_next/static/chunk.js')
      expect(strategy.strategy).toBe('cache-first')
    })

    test('should return images strategy for image files', () => {
      const strategy = getCacheStrategy('https://example.com/image.jpg')
      expect(strategy.strategy).toBe('stale-while-revalidate')
      expect(strategy.cacheName).toBe(CACHE_STRATEGIES.IMAGES.cacheName)
    })

    test('should return images strategy for Cloudinary URLs', () => {
      const strategy = getCacheStrategy('https://res.cloudinary.com/image.jpg')
      expect(strategy.strategy).toBe('stale-while-revalidate')
    })

    test('should return API strategy for API routes', () => {
      const strategy = getCacheStrategy('https://example.com/api/products')
      expect(strategy.strategy).toBe('network-first')
      expect(strategy.cacheName).toBe(CACHE_STRATEGIES.API.cacheName)
    })

    test('should return HTML strategy for root path', () => {
      const strategy = getCacheStrategy('https://example.com/')
      expect(strategy.strategy).toBe('network-first')
    })

    test('should return network-only for unknown URLs', () => {
      const strategy = getCacheStrategy('https://example.com/unknown')
      expect(strategy.strategy).toBe('network-only')
    })
  })

  describe('shouldCache', () => {
    test('should return true for cacheable URLs', () => {
      expect(shouldCache('https://example.com/app.js')).toBe(true)
      expect(shouldCache('https://example.com/image.jpg')).toBe(true)
      expect(shouldCache('https://example.com/api/products')).toBe(true)
    })

    test('should return false for network-only URLs', () => {
      expect(shouldCache('https://example.com/unknown')).toBe(false)
    })
  })

  describe('CACHE_STRATEGIES', () => {
    test('should have correct static strategy config', () => {
      expect(CACHE_STRATEGIES.STATIC.strategy).toBe('cache-first')
      expect(CACHE_STRATEGIES.STATIC.maxAge).toBe(86400 * 30)
    })

    test('should have correct API strategy config', () => {
      expect(CACHE_STRATEGIES.API.strategy).toBe('network-first')
      expect(CACHE_STRATEGIES.API.maxAge).toBe(300)
    })

    test('should have correct images strategy config', () => {
      expect(CACHE_STRATEGIES.IMAGES.strategy).toBe('stale-while-revalidate')
      expect(CACHE_STRATEGIES.IMAGES.maxAge).toBe(86400 * 7)
    })

    test('should have correct HTML strategy config', () => {
      expect(CACHE_STRATEGIES.HTML.strategy).toBe('network-first')
      expect(CACHE_STRATEGIES.HTML.maxAge).toBe(3600)
    })
  })
})

