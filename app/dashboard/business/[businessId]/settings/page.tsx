// Business-scoped settings page (client, uses BusinessContext)
'use client'

import { useEffect, useState } from 'react'
import { useBusiness } from '@/contexts/BusinessContext'
import SettingsClient from '../../../settings/SettingsClient'
import type { Merchant } from '@/types/database'
import Skeleton from '@/components/common/Skeleton'
import Card from '@/components/common/Card'

export default function BusinessSettingsPage() {
  const businessId = useBusiness()
  const [merchant, setMerchant] = useState<Merchant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMerchant() {
      try {
        const res = await fetch('/api/user/account')
        if (res.ok) {
          const data = await res.json()
          if (data.data?.merchant) {
            setMerchant(data.data.merchant)
          }
        }
      } catch (err) {
        console.error('Failed to fetch merchant:', err)
      } finally {
        setLoading(false)
      }
    }

    if (businessId) {
      fetchMerchant()
    }
  }, [businessId])

  if (!businessId) {
    return null
  }

  if (loading || !merchant) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <Skeleton height={400} />
        </Card>
      </div>
    )
  }

  return <SettingsClient merchant={merchant} />
}
