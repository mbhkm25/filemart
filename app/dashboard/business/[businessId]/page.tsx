// Business Dashboard Home
// BIRM: Entry point for managing a specific business (client-scoped with BusinessContext)
'use client'

import { useBusiness } from '@/contexts/BusinessContext'

export default function BusinessDashboardPage() {
  const businessId = useBusiness()

  if (!businessId) {
    return null
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          لوحة التحكم
        </h1>
        <p className="text-gray-600">
          يمكنك من هنا إدارة الكاتلوج، الطلبات، الإضافات، والإعدادات لهذا الملف التجاري.
        </p>
      </div>
    </div>
  )
}


