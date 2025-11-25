// PWA Client Initialization
// Registers Service Worker on client side only

'use client'

import { useEffect } from 'react'
import { registerServiceWorker } from '@/lib/service-worker'

export default function PWAClientInit() {
  useEffect(() => {
    registerServiceWorker()
  }, [])

  return null
}

