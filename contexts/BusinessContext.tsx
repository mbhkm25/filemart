'use client'

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from 'react'

interface BusinessContextValue {
  currentBusinessId: string | null
  setCurrentBusinessId: (id: string | null) => void
}

const BusinessContext = createContext<BusinessContextValue | undefined>(undefined)

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [currentBusinessId, setCurrentBusinessId] = useState<string | null>(null)

  const value = useMemo(
    () => ({
      currentBusinessId,
      setCurrentBusinessId,
    }),
    [currentBusinessId]
  )

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>
}

export function useBusiness() {
  const ctx = useContext(BusinessContext)
  if (!ctx) {
    throw new Error('useBusiness must be used within a BusinessProvider')
  }
  return ctx.currentBusinessId
}

export function useSetBusiness() {
  const ctx = useContext(BusinessContext)
  if (!ctx) {
    throw new Error('useSetBusiness must be used within a BusinessProvider')
  }
  return ctx.setCurrentBusinessId
}

export function useBusinessContext() {
  const ctx = useContext(BusinessContext)
  if (!ctx) {
    throw new Error('useBusinessContext must be used within a BusinessProvider')
  }
  return ctx
}

export type { BusinessContextValue }


