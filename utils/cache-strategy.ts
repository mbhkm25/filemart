// Cache Strategy Definitions
// Defines caching strategies for different resource types

export type CacheStrategy = 'cache-first' | 'network-first' | 'stale-while-revalidate' | 'network-only'

export interface CacheConfig {
  strategy: CacheStrategy
  cacheName: string
  maxAge?: number // in seconds
  maxEntries?: number
}

/**
 * Cache strategy configurations
 */
export const CACHE_STRATEGIES = {
  // Static assets (JS, CSS, fonts)
  STATIC: {
    strategy: 'cache-first' as CacheStrategy,
    cacheName: 'filemart-static-v1',
    maxAge: 86400 * 30, // 30 days
  },

  // API responses
  API: {
    strategy: 'network-first' as CacheStrategy,
    cacheName: 'filemart-api-v1',
    maxAge: 300, // 5 minutes
  },

  // Images
  IMAGES: {
    strategy: 'stale-while-revalidate' as CacheStrategy,
    cacheName: 'filemart-images-v1',
    maxAge: 86400 * 7, // 7 days
  },

  // HTML pages
  HTML: {
    strategy: 'network-first' as CacheStrategy,
    cacheName: 'filemart-static-v1',
    maxAge: 3600, // 1 hour
  },
} as const

/**
 * Get cache strategy for a URL
 */
export function getCacheStrategy(url: string): CacheConfig {
  const urlObj = new URL(url)

  // Static assets
  if (
    urlObj.pathname.endsWith('.js') ||
    urlObj.pathname.endsWith('.css') ||
    urlObj.pathname.endsWith('.woff') ||
    urlObj.pathname.endsWith('.woff2') ||
    urlObj.pathname.startsWith('/_next/static')
  ) {
    return CACHE_STRATEGIES.STATIC
  }

  // Images
  if (
    urlObj.pathname.endsWith('.jpg') ||
    urlObj.pathname.endsWith('.jpeg') ||
    urlObj.pathname.endsWith('.png') ||
    urlObj.pathname.endsWith('.webp') ||
    urlObj.pathname.endsWith('.avif') ||
    urlObj.hostname === 'res.cloudinary.com'
  ) {
    return CACHE_STRATEGIES.IMAGES
  }

  // API calls
  if (urlObj.pathname.startsWith('/api/')) {
    return CACHE_STRATEGIES.API
  }

  // HTML pages
  if (urlObj.pathname.endsWith('/') || urlObj.pathname.endsWith('.html')) {
    return CACHE_STRATEGIES.HTML
  }

  // Default: network only
  return {
    strategy: 'network-only',
    cacheName: '',
  }
}

/**
 * Check if URL should be cached
 */
export function shouldCache(url: string): boolean {
  const strategy = getCacheStrategy(url)
  return strategy.strategy !== 'network-only'
}

