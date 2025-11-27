// Business-scoped settings page (client, uses BusinessContext)
'use client'

import { useBusiness } from '@/contexts/BusinessContext'
import SettingsPage from '../../../settings/page'

export default function BusinessSettingsPage() {
  const businessId = useBusiness()

  if (!businessId) {
    return null
  }

  // Reuse existing settings page (account-level) within business context
  return <SettingsPage />
}
