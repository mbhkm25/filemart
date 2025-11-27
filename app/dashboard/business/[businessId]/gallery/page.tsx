// Business-scoped gallery page (client, uses BusinessContext)
'use client'

import { useBusiness } from '@/contexts/BusinessContext'
import GalleryManagerClient from '../../../gallery/GalleryManagerClient'

export default function BusinessGalleryPage() {
  const businessId = useBusiness()

  if (!businessId) {
    return null
  }

  // Existing GalleryManagerClient still expects initialImages/profileId; for now render without props.
  return <GalleryManagerClient initialImages={[]} profileId={businessId} />
}
