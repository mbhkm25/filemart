// Business-scoped catalog page (client, uses BusinessContext)
'use client'

import { useBusiness } from '@/contexts/BusinessContext'
import CatalogManagerClient from '../../../catalog/CatalogManagerClient'

export default function BusinessCatalogPage() {
  const businessId = useBusiness()

  if (!businessId) {
    return null
  }

  return <CatalogManagerClient />
}
