// Profile Completion Calculator
// Calculate completion percentage based on filled fields

import type { BusinessProfile } from '@/types/database'

export function calculateProfileCompletion(
  profile: Partial<BusinessProfile>
): number {
  const fields = [
    { key: 'name', weight: 15 },
    { key: 'description', weight: 10 },
    { key: 'logo_url', weight: 10 },
    { key: 'cover_url', weight: 5 },
    { key: 'category', weight: 5 },
    { key: 'address', weight: 10 },
    { key: 'city', weight: 5 },
    { key: 'working_hours', weight: 15 },
    { key: 'contact_links', weight: 15 },
    { key: 'primary_color', weight: 5 },
    { key: 'secondary_color', weight: 5 },
  ]

  let totalWeight = 0
  let filledWeight = 0

  fields.forEach((field) => {
    totalWeight += field.weight
    const value = profile[field.key as keyof BusinessProfile]

    if (value !== null && value !== undefined) {
      if (typeof value === 'object') {
        // For JSON fields (working_hours, contact_links)
        if (Object.keys(value).length > 0) {
          filledWeight += field.weight
        }
      } else if (typeof value === 'string' && value.trim() !== '') {
        filledWeight += field.weight
      } else if (typeof value === 'number') {
        filledWeight += field.weight
      }
    }
  })

  return Math.round((filledWeight / totalWeight) * 100)
}

export function getCompletionTips(
  profile: Partial<BusinessProfile>
): string[] {
  const tips: string[] = []

  if (!profile.name) {
    tips.push('أضف اسم نشاطك التجاري')
  }
  if (!profile.description) {
    tips.push('أضف وصفاً مختصراً عن نشاطك')
  }
  if (!profile.logo_url) {
    tips.push('أضف شعاراً لملفك التجاري')
  }
  if (!profile.cover_url) {
    tips.push('أضف صورة غلاف جذابة')
  }
  if (!profile.address) {
    tips.push('أضف عنوان موقعك')
  }
  if (
    !profile.working_hours ||
    Object.keys(profile.working_hours).length === 0
  ) {
    tips.push('حدد أوقات العمل')
  }
  if (
    !profile.contact_links ||
    Object.keys(profile.contact_links).length === 0
  ) {
    tips.push('أضف روابط التواصل (واتساب، إنستغرام، إلخ)')
  }

  return tips
}

