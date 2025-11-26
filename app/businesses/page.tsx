// Businesses Listing Page
// Public page to browse all published business profiles

import React, { Suspense } from 'react'
import BusinessesListClient from './BusinessesListClient'

export const metadata = {
  title: 'تصفح الملفات التجارية | FileMart',
  description: 'اكتشف الملفات التجارية المتاحة على منصة FileMart',
}

export default function BusinessesPage() {
  return (
    <Suspense fallback={<div />}> 
      <BusinessesListClient />
    </Suspense>
  )
}

