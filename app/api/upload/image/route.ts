// Image Upload API Route
// POST /api/upload/image
// Handles image upload to Cloudinary

import { NextRequest } from 'next/server'
import { success, error, unauthorized } from '@/lib/api-response'
import { requireMerchant } from '@/lib/middleware'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = requireMerchant(request)
    if (!authResult.success) {
      return authResult.response
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return error('لم يتم اختيار ملف', 400)
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return error('الملف يجب أن يكون صورة', 400)
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return error('حجم الصورة يجب أن يكون أقل من 10MB', 400)
    }

    // Get Cloudinary credentials from environment
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

    if (!cloudName) {
      console.error('Cloudinary Cloud Name is not configured')
      return error('إعدادات Cloudinary غير متوفرة. يرجى إعداد CLOUDINARY_CLOUD_NAME في متغيرات البيئة', 500)
    }

    if (!uploadPreset) {
      console.error('Cloudinary Upload Preset is not configured')
      return error('إعدادات Cloudinary غير متوفرة. يرجى إعداد CLOUDINARY_UPLOAD_PRESET في متغيرات البيئة', 500)
    }

    // Upload to Cloudinary
    const cloudinaryFormData = new FormData()
    cloudinaryFormData.append('file', file)
    cloudinaryFormData.append('upload_preset', uploadPreset)

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    )

    if (!cloudinaryResponse.ok) {
      const cloudinaryError = await cloudinaryResponse.json().catch(() => ({}))
      console.error('Cloudinary upload error:', cloudinaryError)
      return error('فشل في رفع الصورة إلى Cloudinary', 500)
    }

    const cloudinaryData = await cloudinaryResponse.json()

    if (!cloudinaryData.secure_url) {
      return error('فشل في الحصول على رابط الصورة', 500)
    }

    return success({
      url: cloudinaryData.secure_url,
      publicId: cloudinaryData.public_id,
      width: cloudinaryData.width,
      height: cloudinaryData.height,
    })
  } catch (err: any) {
    console.error('Image upload error:', err)
    return error('فشل في رفع الصورة', 500)
  }
}

