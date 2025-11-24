// GalleryGrid Component
// Fully implemented per FCI.md

'use client'

import { useState } from 'react'
import Image from 'next/image'
import Modal from '@/components/common/Modal'
import { cn } from '@/lib/utils'

export interface GalleryGridProps {
  images: Array<{
    id: string
    image_url: string
    thumbnail_url?: string | null
    alt_text?: string | null
  }>
  className?: string
}

export default function GalleryGrid({ images, className }: GalleryGridProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  if (images.length === 0) {
    return null
  }

  return (
    <>
      <div
        className={cn(
          'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4',
          className
        )}
      >
        {images.map((img) => (
          <button
            key={img.id}
            onClick={() => setSelectedImage(img.image_url)}
            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
          >
            <Image
              src={img.thumbnail_url || img.image_url}
              alt={img.alt_text || `Gallery image ${img.id}`}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      <Modal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        showCloseButton={true}
        className="max-w-4xl"
      >
        {selectedImage && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={selectedImage}
              alt="Gallery image"
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        )}
      </Modal>
    </>
  )
}
