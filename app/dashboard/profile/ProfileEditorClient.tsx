// Business Profile Editor Client Component
// Tab-based form with all sections

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import ImageUpload from '@/components/dashboard/ImageUpload'
import { useToast } from '@/components/common/Toast'
import { businessProfileUpdateSchema } from '@/lib/validations'
import { calculateProfileCompletion } from '@/lib/profile-completion'
import type { BusinessProfile } from '@/types/database'
import { cn } from '@/lib/utils'

interface ProfileEditorClientProps {
  initialProfile: BusinessProfile | null
}

type Tab = 'basic' | 'visual' | 'location' | 'hours' | 'contact'

const tabs: { id: Tab; label: string }[] = [
  { id: 'basic', label: 'معلومات أساسية' },
  { id: 'visual', label: 'هوية بصرية' },
  { id: 'location', label: 'الموقع' },
  { id: 'hours', label: 'أوقات العمل' },
  { id: 'contact', label: 'روابط التواصل' },
]

export default function ProfileEditorClient({
  initialProfile,
}: ProfileEditorClientProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<Tab>('basic')
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: initialProfile?.name || '',
    description: initialProfile?.description || '',
    category: initialProfile?.category || '',
    logo_url: initialProfile?.logo_url || '',
    cover_url: initialProfile?.cover_url || '',
    primary_color: initialProfile?.primary_color || '',
    secondary_color: initialProfile?.secondary_color || '',
    address: initialProfile?.address || '',
    city: initialProfile?.city || '',
    country: initialProfile?.country || 'SA',
    latitude: initialProfile?.latitude ? String(initialProfile.latitude) : '',
    longitude: initialProfile?.longitude ? String(initialProfile.longitude) : '',
    working_hours: initialProfile?.working_hours || {},
    contact_links: initialProfile?.contact_links || {},
  })

  const handleSave = async () => {
    setIsSaving(true)

    try {
      // Prepare data for validation
      const updateData: any = {
        name: formData.name || undefined,
        description: formData.description || undefined,
        category: formData.category || undefined,
        logo_url: formData.logo_url || undefined,
        cover_url: formData.cover_url || undefined,
        primary_color: formData.primary_color || undefined,
        secondary_color: formData.secondary_color || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        country: formData.country || undefined,
        latitude: formData.latitude ? Number(formData.latitude) : undefined,
        longitude: formData.longitude ? Number(formData.longitude) : undefined,
        working_hours: Object.keys(formData.working_hours).length > 0 ? formData.working_hours : undefined,
        contact_links: Object.keys(formData.contact_links).length > 0 ? formData.contact_links : undefined,
      }

      // Validate
      const validatedData = businessProfileUpdateSchema.parse(updateData)

      // Send to API
      const response = await fetch('/api/merchant/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في حفظ التغييرات')
      }

      showToast('success', 'تم حفظ التغييرات بنجاح')
      router.refresh()
    } catch (error: any) {
      console.error('Save error:', error)
      showToast('error', error.message || 'فشل في حفظ التغييرات')
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = async (url: string, type: 'logo' | 'cover') => {
    if (type === 'logo') {
      setFormData({ ...formData, logo_url: url })
    } else {
      setFormData({ ...formData, cover_url: url })
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            الملف التجاري
          </h1>
          <p className="text-gray-600">
            قم بتحديث معلومات ملفك التجاري
          </p>
        </div>

        {/* Tabs */}
        <Card>
          <div className="flex flex-wrap gap-2 border-b border-gray-200 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <Input
                  label="اسم النشاط التجاري"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    الوصف
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="اكتب وصفاً مختصراً عن نشاطك التجاري"
                  />
                </div>
                <Input
                  label="الفئة"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="مثال: مطعم، صالون، عيادة"
                />
              </div>
            )}

            {/* Visual Identity Tab */}
            {activeTab === 'visual' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الشعار (Logo)
                  </label>
                  {formData.logo_url ? (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 mb-2">
                      <img
                        src={formData.logo_url}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setFormData({ ...formData, logo_url: '' })}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <ImageUpload
                      onUpload={(url) => handleImageUpload(url, 'logo')}
                      maxSize={5}
                      currentImages={0}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    صورة الغلاف (Cover)
                  </label>
                  {formData.cover_url ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 mb-2">
                      <img
                        src={formData.cover_url}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setFormData({ ...formData, cover_url: '' })}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <ImageUpload
                      onUpload={(url) => handleImageUpload(url, 'cover')}
                      maxSize={5}
                      currentImages={0}
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="اللون الأساسي"
                    type="color"
                    value={formData.primary_color || '#3b82f6'}
                    onChange={(e) =>
                      setFormData({ ...formData, primary_color: e.target.value })
                    }
                  />
                  <Input
                    label="اللون الثانوي"
                    type="color"
                    value={formData.secondary_color || '#60a5fa'}
                    onChange={(e) =>
                      setFormData({ ...formData, secondary_color: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            {/* Location Tab */}
            {activeTab === 'location' && (
              <div className="space-y-4">
                <Input
                  label="العنوان"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="المدينة"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                  <Input
                    label="الدولة"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="خط العرض (Latitude)"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                  />
                  <Input
                    label="خط الطول (Longitude)"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            {/* Working Hours Tab */}
            {activeTab === 'hours' && (
              <WorkingHoursEditor
                workingHours={formData.working_hours}
                onChange={(hours) =>
                  setFormData({ ...formData, working_hours: hours })
                }
              />
            )}

            {/* Contact Links Tab */}
            {activeTab === 'contact' && (
              <ContactLinksEditor
                contactLinks={formData.contact_links}
                onChange={(links) =>
                  setFormData({ ...formData, contact_links: links })
                }
              />
            )}
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              إلغاء
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

// Working Hours Editor Component
function WorkingHoursEditor({
  workingHours,
  onChange,
}: {
  workingHours: Record<string, any>
  onChange: (hours: Record<string, any>) => void
}) {
  const days = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']

  const updateDay = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    const updated = { ...workingHours }
    if (!updated[day]) {
      updated[day] = { open: '09:00', close: '17:00', closed: false }
    }
    updated[day][field] = value
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      {days.map((day) => (
        <Card key={day}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">{day}</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={workingHours[day]?.closed || false}
                onChange={(e) => updateDay(day, 'closed', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600">مغلق</span>
            </label>
          </div>
          {!workingHours[day]?.closed && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="وقت الفتح"
                type="time"
                value={workingHours[day]?.open || '09:00'}
                onChange={(e) => updateDay(day, 'open', e.target.value)}
              />
              <Input
                label="وقت الإغلاق"
                type="time"
                value={workingHours[day]?.close || '17:00'}
                onChange={(e) => updateDay(day, 'close', e.target.value)}
              />
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}

// Contact Links Editor Component
function ContactLinksEditor({
  contactLinks,
  onChange,
}: {
  contactLinks: Record<string, any>
  onChange: (links: Record<string, any>) => void
}) {
  const commonLinks = ['whatsapp', 'instagram', 'twitter', 'phone', 'email']

  const updateLink = (key: string, value: string) => {
    const updated = { ...contactLinks }
    if (value.trim()) {
      updated[key] = value.trim()
    } else {
      delete updated[key]
    }
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      {commonLinks.map((link) => (
        <Input
          key={link}
          label={link.charAt(0).toUpperCase() + link.slice(1)}
          value={contactLinks[link] || ''}
          onChange={(e) => updateLink(link, e.target.value)}
          placeholder={`أدخل رابط ${link}`}
        />
      ))}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          روابط إضافية (JSON)
        </label>
        <textarea
          value={JSON.stringify(contactLinks, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value)
              onChange(parsed)
            } catch {
              // Invalid JSON, ignore
            }
          }}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
        />
      </div>
    </div>
  )
}

