// Service Worker Registration & Management
// Handles SW lifecycle and client communication

export interface ServiceWorkerMessage {
  type: 'SKIP_WAITING' | 'UPDATE_AVAILABLE' | 'UPDATE_ACCEPTED'
  payload?: any
}

/**
 * Register Service Worker
 */
export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration.scope)

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing

          if (!newWorker) {
            return
          }

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              notifyUpdateAvailable()
            }
          })
        })
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error)
      })
  })

  // Handle controller change (new SW activated)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload()
  })
}

/**
 * Notify client that update is available
 */
function notifyUpdateAvailable(): void {
  // Dispatch custom event for components to listen
  window.dispatchEvent(
    new CustomEvent('sw-update-available', {
      detail: { message: 'تحديث جديد متاح' },
    })
  )
}

/**
 * Skip waiting and activate new Service Worker
 */
export function skipWaiting(): void {
  if (typeof window === 'undefined' || !navigator.serviceWorker.controller) {
    return
  }

  navigator.serviceWorker.controller.postMessage({
    type: 'SKIP_WAITING',
  } as ServiceWorkerMessage)
}

/**
 * Check if Service Worker is supported
 */
export function isServiceWorkerSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator
}

/**
 * Unregister Service Worker (for development/testing)
 */
export function unregisterServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  navigator.serviceWorker.ready.then((registration) => {
    registration.unregister()
  })
}

