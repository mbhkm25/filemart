// Gallery Manager Client Component
// Upload, delete, and manage images

'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import ImageUpload from '@/components/dashboard/ImageUpload'
import Modal from '@/components/common/Modal'
import StateBox from '@/components/common/StateBox'
import { useToast } from '@/components/common/Toast'
import type { GalleryImage } from '@/types/database'

interface GalleryManagerClientProps {
  initialImages: GalleryImage[]
  profileId: string
}

export default function GalleryManagerClient({
  initialImages,
  profileId,
}: GalleryManagerClientProps) {
  const { showToast } = useToast()
  const [images, setImages] = useState(initialImages)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)

  const handleUpload = async (url: string) => {
    setIsUploading(true)

    try {
      const response = await fetch('/api/merchant/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile_id: profileId,
          image_url: url,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في رفع الصورة')
      }

      // Add new image to list
      setImages([...images, data.data])
      showToast('success', 'تم رفع الصورة بنجاح')
    } catch (error: any) {
      console.error('Upload error:', error)
      showToast('error', error.message || 'فشل في رفع الصورة')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (imageId: string) => {
    try {
      const response = await fetch(`/api/merchant/gallery/${imageId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في حذف الصورة')
      }

      setImages(images.filter((img) => img.id !== imageId))
      setSelectedImage(null)
      showToast('success', 'تم حذف الصورة بنجاح')
    } catch (error: any) {
      console.error('Delete error:', error)
      showToast('error', error.message || 'فشل في حذف الصورة')
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              معرض الصور
            </h1>
            <p className="text-gray-600">
              أضف صوراً لعرضها في ملفك التجاري ({images.length}/50)
            </p>
          </div>
        </div>

        {/* Upload Section */}
        {images.length < 50 && (
          <Card>
            <ImageUpload
              onUpload={handleUpload}
              maxSize={5}
              maxImages={50}
              currentImages={images.length}
            />
          </Card>
        )}

        {/* Images Grid */}
        {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <Card key={image.id} className="relative group overflow-hidden">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={image.image_url}
                    alt={image.alt_text || 'Gallery image'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setSelectedImage(image)}
                      className="opacity-0 group-hover:opacity-100 p-2 bg-white rounded-lg text-gray-900 hover:bg-gray-100 transition-opacity"
                      aria-label="عرض"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-opacity"
                      aria-label="حذف"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <StateBox
            type="empty"
            title="لا توجد صور"
            description="ابدأ بإضافة صور إلى معرضك"
          />
        )}

        {/* Image Preview Modal */}
        <Modal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          showCloseButton={true}
          className="max-w-4xl"
        >
          {selectedImage && (
            <div className="space-y-4">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={selectedImage.image_url}
                  alt={selectedImage.alt_text || 'Gallery image'}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="danger"
                  onClick={() => {
                    if (selectedImage) {
                      handleDelete(selectedImage.id)
                    }
                  }}
                >
                  حذف الصورة
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}

