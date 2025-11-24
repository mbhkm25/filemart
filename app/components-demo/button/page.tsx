// Button Component Demo

'use client'

import Button from '@/components/common/Button'
import Card from '@/components/common/Card'

export default function ButtonDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Button Component</h1>
          <p className="text-gray-600">جميع أنواع الأزرار وحالاتها</p>
        </div>

        {/* Variants */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">الأنواع (Variants)</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="danger">Danger</Button>
          </div>
        </Card>

        {/* Sizes */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">الأحجام (Sizes)</h2>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </Card>

        {/* States */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">الحالات (States)</h2>
          <div className="flex flex-wrap gap-4">
            <Button>Normal</Button>
            <Button disabled>Disabled</Button>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            جرب Hover و Active على الأزرار أعلاه
          </p>
        </Card>

        {/* Full Width */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">عرض كامل (Full Width)</h2>
          <Button fullWidth>Full Width Button</Button>
        </Card>

        {/* With Click Handler */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">مع معالج الأحداث</h2>
          <Button
            onClick={() => alert('تم الضغط على الزر!')}
            variant="primary"
          >
            اضغط هنا
          </Button>
        </Card>
      </div>
    </div>
  )
}

