// Settings Client Component
// Account, notifications, business settings, delete account

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Modal from '@/components/common/Modal'
import { useToast } from '@/components/common/Toast'
import type { Merchant } from '@/types/database'

interface SettingsClientProps {
  merchant: Merchant
}

export default function SettingsClient({ merchant }: SettingsClientProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'business' | 'delete'>('account')
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Account settings
  const [accountData, setAccountData] = useState({
    email: merchant.email,
    phone: merchant.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Notifications settings
  const [notifications, setNotifications] = useState({
    email_notifications: merchant.email_notifications ?? true,
    push_notifications: merchant.push_notifications ?? true,
  })

  // Business settings
  const [businessSettings, setBusinessSettings] = useState({
    language: 'ar',
    timezone: 'Asia/Riyadh',
  })

  const handleSaveAccount = async () => {
    setIsSaving(true)
    try {
      // TODO: Implement account update API
      showToast('success', 'تم تحديث الحساب بنجاح')
    } catch (error: any) {
      showToast('error', error.message || 'فشل في تحديث الحساب')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    setIsSaving(true)
    try {
      // TODO: Implement notifications update API
      showToast('success', 'تم تحديث إعدادات الإشعارات')
    } catch (error: any) {
      showToast('error', error.message || 'فشل في تحديث الإشعارات')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveBusiness = async () => {
    setIsSaving(true)
    try {
      // TODO: Implement business settings update API
      showToast('success', 'تم تحديث إعدادات العمل')
    } catch (error: any) {
      showToast('error', error.message || 'فشل في تحديث الإعدادات')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      // TODO: Implement delete account API
      showToast('success', 'تم حذف الحساب بنجاح')
      router.push('/login')
    } catch (error: any) {
      showToast('error', error.message || 'فشل في حذف الحساب')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const tabs = [
    { id: 'account' as const, label: 'الحساب' },
    { id: 'notifications' as const, label: 'الإشعارات' },
    { id: 'business' as const, label: 'إعدادات العمل' },
    { id: 'delete' as const, label: 'حذف الحساب' },
  ]

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            الإعدادات
          </h1>
          <p className="text-gray-600">
            إدارة إعدادات حسابك وملفك التجاري
          </p>
        </div>

        <Card>
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-gray-200 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-4">
                <Input
                  label="البريد الإلكتروني"
                  type="email"
                  value={accountData.email}
                  onChange={(e) =>
                    setAccountData({ ...accountData, email: e.target.value })
                  }
                  disabled
                />
                <Input
                  label="رقم الهاتف"
                  value={accountData.phone}
                  onChange={(e) =>
                    setAccountData({ ...accountData, phone: e.target.value })
                  }
                />
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    تغيير كلمة المرور
                  </h3>
                  <div className="space-y-4">
                    <Input
                      label="كلمة المرور الحالية"
                      type="password"
                      value={accountData.currentPassword}
                      onChange={(e) =>
                        setAccountData({ ...accountData, currentPassword: e.target.value })
                      }
                    />
                    <Input
                      label="كلمة المرور الجديدة"
                      type="password"
                      value={accountData.newPassword}
                      onChange={(e) =>
                        setAccountData({ ...accountData, newPassword: e.target.value })
                      }
                    />
                    <Input
                      label="تأكيد كلمة المرور"
                      type="password"
                      value={accountData.confirmPassword}
                      onChange={(e) =>
                        setAccountData({ ...accountData, confirmPassword: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="primary" onClick={handleSaveAccount} disabled={isSaving}>
                    {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                  </Button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">الإشعارات عبر البريد</p>
                    <p className="text-sm text-gray-600">
                      استقبل إشعارات عبر البريد الإلكتروني
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.email_notifications}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        email_notifications: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">الإشعارات الفورية</p>
                    <p className="text-sm text-gray-600">
                      استقبل إشعارات فورية في المتصفح
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.push_notifications}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        push_notifications: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </label>
                <div className="flex justify-end">
                  <Button variant="primary" onClick={handleSaveNotifications} disabled={isSaving}>
                    {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                  </Button>
                </div>
              </div>
            )}

            {/* Business Tab */}
            {activeTab === 'business' && (
              <div className="space-y-4">
                <Input
                  label="اللغة"
                  value={businessSettings.language}
                  onChange={(e) =>
                    setBusinessSettings({ ...businessSettings, language: e.target.value })
                  }
                  disabled
                />
                <Input
                  label="المنطقة الزمنية"
                  value={businessSettings.timezone}
                  onChange={(e) =>
                    setBusinessSettings({ ...businessSettings, timezone: e.target.value })
                  }
                  disabled
                />
                <div className="flex justify-end">
                  <Button variant="primary" onClick={handleSaveBusiness} disabled={isSaving}>
                    {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                  </Button>
                </div>
              </div>
            )}

            {/* Delete Account Tab */}
            {activeTab === 'delete' && (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">
                    حذف الحساب
                  </h3>
                  <p className="text-sm text-red-700 mb-4">
                    تحذير: حذف حسابك سيؤدي إلى حذف جميع بياناتك بشكل نهائي ولا يمكن التراجع عن هذه العملية.
                  </p>
                  <Button
                    variant="danger"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    حذف الحساب
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="تأكيد حذف الحساب"
      >
        <p className="text-gray-600 mb-4">
          هل أنت متأكد من رغبتك في حذف حسابك؟ هذه العملية لا يمكن التراجع عنها.
        </p>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeleting}
          >
            إلغاء
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? 'جاري الحذف...' : 'حذف الحساب'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

