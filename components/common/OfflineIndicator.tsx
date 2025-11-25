// Offline Indicator Component
// Shows offline status per FIS Section 9.3

'use client'

import { useEffect, useState } from 'react'
import { useToast } from './Toast'

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    // Check initial online status
    setIsOffline(!navigator.onLine)

    const handleOnline = () => {
      setIsOffline(false)
      showToast('success', 'تم الاتصال بالإنترنت')
    }

    const handleOffline = () => {
      setIsOffline(true)
      showToast('warning', 'غير متصل بالإنترنت')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [showToast])

  if (!isOffline) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-400 text-yellow-900 px-4 py-2 text-center text-sm font-medium z-50">
      <div className="flex items-center justify-center gap-2">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span>غير متصل بالإنترنت</span>
      </div>
    </div>
  )
}

