// Cart Provider Component
// Sets profile ID when page loads

'use client'

import { useEffect } from 'react'
import { useCart } from '@/hooks/useCart'

interface CartProviderProps {
  profileId: string
  children: React.ReactNode
}

export default function CartProvider({ profileId, children }: CartProviderProps) {
  const { setProfileId } = useCart()

  useEffect(() => {
    setProfileId(profileId)
  }, [profileId, setProfileId])

  return <>{children}</>
}

