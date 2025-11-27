'use client'

import { useState, useEffect } from 'react'

export interface Business {
  id: string
  name: string
  description?: string
  type: 'store' | 'service'
  slug: string
  created_at: string
}

interface UseUserBusinessesResult {
  businesses: Business[]
  loading: boolean
  isEmpty: boolean
  error: string | null
}

export function useUserBusinesses(): UseUserBusinessesResult {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBusinesses() {
      try {
        setLoading(true)
        const res = await fetch('/api/user/businesses')
        
        if (!res.ok) {
          throw new Error('Failed to fetch businesses')
        }

        const data = await res.json()
        setBusinesses(data.businesses || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setBusinesses([])
      } finally {
        setLoading(false)
      }
    }

    fetchBusinesses()
  }, [])

  return {
    businesses,
    loading,
    isEmpty: !loading && businesses.length === 0,
    error,
  }
}

