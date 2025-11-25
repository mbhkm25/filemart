// Performance Utilities
// Helper functions for performance optimization

import React from 'react'

/**
 * Lazy load a component
 */
export function lazyLoadComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(importFn)
}

/**
 * Prefetch a resource
 */
export function prefetchResource(url: string, as?: 'script' | 'style' | 'image' | 'fetch'): void {
  if (typeof window === 'undefined') {
    return
  }

  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = url
  if (as) {
    link.as = as
  }
  document.head.appendChild(link)
}

/**
 * Preload a critical resource
 */
export function preloadResource(url: string, as: 'script' | 'style' | 'image' | 'font'): void {
  if (typeof window === 'undefined') {
    return
  }

  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = url
  link.as = as
  document.head.appendChild(link)
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Measure performance
 */
export function measurePerformance(name: string, fn: () => void): void {
  if (typeof window === 'undefined' || !('performance' in window)) {
    fn()
    return
  }

  const start = performance.now()
  fn()
  const end = performance.now()
  console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`)
}

/**
 * Check if device is slow (based on hardware concurrency)
 */
export function isSlowDevice(): boolean {
  if (typeof window === 'undefined' || !('navigator' in window)) {
    return false
  }

  const cores = (navigator as any).hardwareConcurrency || 4
  return cores < 4
}

