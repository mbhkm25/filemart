// Tag Component Demo

'use client'

import Tag from '@/components/common/Tag'
import Card from '@/components/common/Card'

export default function TagDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tag Component</h1>
          <p className="text-gray-600">الشارات والأوسمة</p>
        </div>

        {/* Variants */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">الأنواع (Variants)</h2>
          <div className="flex flex-wrap gap-2">
            <Tag label="افتراضي" variant="default" />
            <Tag label="نجاح" variant="success" />
            <Tag label="تحذير" variant="warning" />
            <Tag label="خطأ" variant="error" />
            <Tag label="معلومات" variant="info" />
          </div>
        </Card>

        {/* Sizes */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">الأحجام (Sizes)</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Tag label="صغير" size="sm" />
            <Tag label="متوسط" size="md" />
          </div>
        </Card>

        {/* Usage Examples */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">أمثلة الاستخدام</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-gray-700">الحالة:</span>
              <Tag label="نشط" variant="success" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-700">الحالة:</span>
              <Tag label="معطل" variant="error" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-700">الفئة:</span>
              <Tag label="منتج" variant="info" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-700">الأولوية:</span>
              <Tag label="عالي" variant="warning" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

