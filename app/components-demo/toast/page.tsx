// Toast Component Demo

'use client'

import { ToastProvider, useToast } from '@/components/common/Toast'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'

function ToastDemoContent() {
  const { showToast } = useToast()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Toast Component</h1>
          <p className="text-gray-600">نظام الرسائل والتنبيهات</p>
        </div>

        {/* Toast Types */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">أنواع الرسائل</h2>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => showToast('success', 'تم الحفظ بنجاح!')}
              variant="primary"
            >
              Success
            </Button>
            <Button
              onClick={() => showToast('error', 'حدث خطأ أثناء المعالجة')}
              variant="danger"
            >
              Error
            </Button>
            <Button
              onClick={() => showToast('warning', 'تحذير: يرجى التحقق من البيانات')}
              variant="outline"
            >
              Warning
            </Button>
            <Button
              onClick={() => showToast('info', 'معلومة: تم تحديث البيانات')}
            >
              Info
            </Button>
          </div>
        </Card>

        {/* Custom Duration */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">مدة مخصصة</h2>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => showToast('success', 'رسالة تختفي بعد ثانية واحدة', 1000)}
            >
              1 ثانية
            </Button>
            <Button
              onClick={() => showToast('info', 'رسالة تختفي بعد 5 ثوان', 5000)}
            >
              5 ثوان
            </Button>
          </div>
        </Card>

        {/* Multiple Toasts */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">عدة رسائل</h2>
          <Button
            onClick={() => {
              showToast('success', 'رسالة 1')
              setTimeout(() => showToast('info', 'رسالة 2'), 500)
              setTimeout(() => showToast('warning', 'رسالة 3'), 1000)
            }}
          >
            إظهار 3 رسائل
          </Button>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-2">المميزات</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>تظهر في أعلى الشاشة</li>
            <li>تختفي تلقائياً بعد 3 ثوان (قابلة للتخصيص)</li>
            <li>يمكن إغلاقها يدوياً</li>
            <li>4 أنواع: Success, Error, Warning, Info</li>
            <li>دعم RTL كامل</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}

export default function ToastDemoPage() {
  return (
    <ToastProvider>
      <ToastDemoContent />
    </ToastProvider>
  )
}

