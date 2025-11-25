// Performance Utilities Tests
// Test performance helper functions

import {
  debounce,
  throttle,
  isSlowDevice,
  prefetchResource,
  preloadResource,
} from '@/utils/performance'

describe('Performance Utilities', () => {
  describe('debounce', () => {
    jest.useFakeTimers()

    test('should debounce function calls', () => {
      const func = jest.fn()
      const debouncedFunc = debounce(func, 100)

      debouncedFunc()
      debouncedFunc()
      debouncedFunc()

      expect(func).not.toHaveBeenCalled()

      jest.advanceTimersByTime(100)

      expect(func).toHaveBeenCalledTimes(1)
    })

    test('should reset timer on new call', () => {
      const func = jest.fn()
      const debouncedFunc = debounce(func, 100)

      debouncedFunc()
      jest.advanceTimersByTime(50)
      debouncedFunc()
      jest.advanceTimersByTime(50)

      expect(func).not.toHaveBeenCalled()

      jest.advanceTimersByTime(50)

      expect(func).toHaveBeenCalledTimes(1)
    })

    afterEach(() => {
      jest.clearAllTimers()
    })
  })

  describe('throttle', () => {
    jest.useFakeTimers()

    test('should throttle function calls', () => {
      const func = jest.fn()
      const throttledFunc = throttle(func, 100)

      throttledFunc()
      throttledFunc()
      throttledFunc()

      expect(func).toHaveBeenCalledTimes(1)

      jest.advanceTimersByTime(100)

      throttledFunc()
      expect(func).toHaveBeenCalledTimes(2)
    })

    afterEach(() => {
      jest.clearAllTimers()
    })
  })

  describe('isSlowDevice', () => {
    test('should detect slow device', () => {
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        writable: true,
        value: 2,
      })

      expect(isSlowDevice()).toBe(true)
    })

    test('should detect fast device', () => {
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        writable: true,
        value: 8,
      })

      expect(isSlowDevice()).toBe(false)
    })

    test('should handle missing hardwareConcurrency', () => {
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        writable: true,
        value: undefined,
      })

      expect(isSlowDevice()).toBe(false)
    })
  })

  describe('prefetchResource', () => {
    test('should create prefetch link', () => {
      const appendChildSpy = jest.spyOn(document.head, 'appendChild')
      prefetchResource('/test.js', 'script')

      expect(appendChildSpy).toHaveBeenCalled()
      const link = appendChildSpy.mock.calls[0][0] as HTMLLinkElement
      expect(link.rel).toBe('prefetch')
      expect(link.href).toBe('/test.js')
      expect(link.as).toBe('script')

      appendChildSpy.mockRestore()
    })
  })

  describe('preloadResource', () => {
    test('should create preload link', () => {
      const appendChildSpy = jest.spyOn(document.head, 'appendChild')
      preloadResource('/test.css', 'style')

      expect(appendChildSpy).toHaveBeenCalled()
      const link = appendChildSpy.mock.calls[0][0] as HTMLLinkElement
      expect(link.rel).toBe('preload')
      expect(link.href).toBe('/test.css')
      expect(link.as).toBe('style')

      appendChildSpy.mockRestore()
    })
  })
})

