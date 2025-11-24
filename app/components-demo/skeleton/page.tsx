// Skeleton Component Demo

'use client'

import Skeleton from '@/components/common/Skeleton'
import Card from '@/components/common/Card'

export default function SkeletonDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Skeleton Component</h1>
          <p className="text-gray-600">حالة التحميل مع Pulse Animation</p>
        </div>

        {/* Basic Skeletons */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">أشكال أساسية</h2>
          <div className="space-y-4">
            <Skeleton height={20} />
            <Skeleton height={40} />
            <Skeleton height={60} />
            <Skeleton width="50%" height={30} />
          </div>
        </Card>

        {/* Different Rounded */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">أنواع مختلفة من التدوير</h2>
          <div className="space-y-4">
            <Skeleton height={40} rounded="none" />
            <Skeleton height={40} rounded="sm" />
            <Skeleton height={40} rounded="md" />
            <Skeleton height={40} rounded="lg" />
            <Skeleton width={40} height={40} rounded="full" />
          </div>
        </Card>

        {/* Card Skeleton */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">مثال: بطاقة محملة</h2>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex gap-4">
              <Skeleton width={80} height={80} rounded="md" />
              <div className="flex-1 space-y-2">
                <Skeleton height={20} width="60%" />
                <Skeleton height={16} width="40%" />
                <Skeleton height={16} width="80%" />
              </div>
            </div>
          </div>
        </Card>

        {/* List Skeleton */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">مثال: قائمة محملة</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton width={40} height={40} rounded="full" />
                <div className="flex-1 space-y-2">
                  <Skeleton height={16} />
                  <Skeleton height={14} width="70%" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-2">ملاحظات</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>يستخدم Pulse animation فقط (لا shimmer)</li>
            <li>لون ثابت: bg-gray-200</li>
            <li>قابل للتخصيص بالحجم والشكل</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}

