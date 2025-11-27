// Business-scoped orders page (client, uses BusinessContext)
'use client'

import { useBusiness } from '@/contexts/BusinessContext'
import OrdersManagerClient from '../../../orders/OrdersManagerClient'

export default function BusinessOrdersPage() {
  const businessId = useBusiness()

  if (!businessId) {
    return null
  }

  return <OrdersManagerClient />
}
