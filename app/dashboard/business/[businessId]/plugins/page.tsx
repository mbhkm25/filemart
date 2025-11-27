// Business-scoped plugins page (client, uses BusinessContext)
'use client'

import { useBusiness } from '@/contexts/BusinessContext'
import PluginsMarketplaceClient from '../../../plugins/PluginsMarketplaceClient'

export default function BusinessPluginsPage() {
  const businessId = useBusiness()

  if (!businessId) {
    return null
  }

  return <PluginsMarketplaceClient />
}
