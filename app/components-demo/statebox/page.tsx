// StateBox Component Demo

'use client'

import StateBox from '@/components/common/StateBox'
import Card from '@/components/common/Card'

export default function StateBoxDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">StateBox Component</h1>
          <p className="text-gray-600">حالات Empty, Error, Offline</p>
        </div>

        {/* Empty State */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Empty State</h2>
          <StateBox
            type="empty"
            title="لا توجد عناصر"
            description="لم يتم العثور على أي عناصر. ابدأ بإضافة عنصر جديد."
            actionLabel="إضافة عنصر"
            onAction={() => alert('إضافة عنصر جديد')}
          />
        </Card>

        {/* Error State */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Error State</h2>
          <StateBox
            type="error"
            title="حدث خطأ"
            description="فشل في تحميل البيانات. يرجى المحاولة مرة أخرى."
            actionLabel="إعادة المحاولة"
            onAction={() => alert('إعادة المحاولة')}
          />
        </Card>

        {/* Offline State */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Offline State</h2>
          <StateBox
            type="offline"
            title="لا يوجد اتصال بالإنترنت"
            description="يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى."
            actionLabel="إعادة المحاولة"
            onAction={() => alert('إعادة المحاولة')}
          />
        </Card>

        {/* Custom Icon */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">مع أيقونة مخصصة</h2>
          <StateBox
            type="empty"
            title="مخصص"
            description="يمكن تخصيص الأيقونة"
            icon={
              <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            }
          />
        </Card>

        {/* Without Action */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">بدون زر إجراء</h2>
          <StateBox
            type="empty"
            title="حالة بسيطة"
            description="يمكن عرض الحالة بدون زر إجراء"
          />
        </Card>
      </div>
    </div>
  )
}

