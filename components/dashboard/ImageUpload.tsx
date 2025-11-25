// ImageUpload Component
// Drag & drop, file validation, Cloudinary integration

'use client'

import React, { useCallback, useState } from 'react'
import Image from 'next/image'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import { useToast } from '@/components/common/Toast'
import { cn } from '@/lib/utils'

export interface ImageUploadProps {
  onUpload: (url: string) => Promise<void>
  maxSize?: number // in MB
  maxImages?: number
  currentImages?: number
  className?: string
}

export default function ImageUpload({
  onUpload,
  maxSize = 5,
  maxImages = 50,
  currentImages = 0,
  className,
}: ImageUploadProps) {
  const { showToast } = useToast()
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'الملف يجب أن يكون صورة'
    }

    // Check file size
    const sizeInMB = file.size / (1024 * 1024)
    if (sizeInMB > maxSize) {
      return `حجم الصورة يجب أن يكون أقل من ${maxSize}MB`
    }

    // Check max images
    if (currentImages >= maxImages) {
      return `الحد الأقصى ${maxImages} صورة`
    }

    return null
  }

  const uploadToCloudinary = async (file: File): Promise<string> => {
    // Use API route for upload instead of direct Cloudinary upload
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'فشل في رفع الصورة')
    }

    const data = await response.json()
    if (!data.success || !data.data?.url) {
      throw new Error(data.error || 'فشل في رفع الصورة')
    }

    return data.data.url
  }

  const handleFile = useCallback(
    async (file: File) => {
      const error = validateFile(file)
      if (error) {
        showToast('error', error)
        return
      }

      setIsUploading(true)
      setUploadProgress(0)

      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + 10
          })
        }, 100)

        const url = await uploadToCloudinary(file)
        clearInterval(progressInterval)
        setUploadProgress(100)

        await onUpload(url)
        showToast('success', 'تم رفع الصورة بنجاح')
      } catch (error: any) {
        console.error('Upload error:', error)
        showToast('error', error.message || 'فشل في رفع الصورة')
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
      }
    },
    [onUpload, showToast, maxSize, maxImages, currentImages]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFile(file)
      }
      // Reset input
      e.target.value = ''
    },
    [handleFile]
  )

  if (currentImages >= maxImages) {
    return (
      <Card className={cn('text-center py-8', className)}>
        <p className="text-gray-600">
          تم الوصول إلى الحد الأقصى من الصور ({maxImages})
        </p>
      </Card>
    )
  }

  return (
    <div className={className}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400',
          isUploading && 'opacity-50 pointer-events-none'
        )}
      >
        {isUploading ? (
          <div className="space-y-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">جاري رفع الصورة... {uploadProgress}%</p>
          </div>
        ) : (
          <>
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm text-gray-600 mb-2">
              اسحب الصورة هنا أو اضغط للاختيار
            </p>
            <p className="text-xs text-gray-500 mb-4">
              الحد الأقصى {maxSize}MB • {currentImages}/{maxImages} صورة
            </p>
            <label className="cursor-pointer inline-block">
              <span className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-lg border-2 border-primary-600 text-primary-600 bg-transparent hover:bg-primary-50 hover:shadow-sm active:bg-primary-100 active:scale-[0.98] transition-all duration-150">
                اختر صورة
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </>
        )}
      </div>
    </div>
  )
}

