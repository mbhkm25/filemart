// Card Component Demo

'use client'

import Card from '@/components/common/Card'

export default function CardDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Card Component</h1>
          <p className="text-gray-600">البطاقات مع تأثيرات Hover</p>
        </div>

        {/* Basic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <h3 className="text-lg font-semibold mb-2">بطاقة بسيطة</h3>
            <p className="text-gray-600">
              هذه بطاقة بسيطة مع ظل خفيف. جرب Hover لرؤية التأثير.
            </p>
          </Card>

          <Card shadow="md">
            <h3 className="text-lg font-semibold mb-2">بطاقة بظل متوسط</h3>
            <p className="text-gray-600">
              هذه البطاقة تستخدم shadow-md
            </p>
          </Card>
        </div>

        {/* Different Radius */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card radius="md">
            <h3 className="text-lg font-semibold mb-2">Radius Medium</h3>
            <p className="text-gray-600">rounded-md</p>
          </Card>

          <Card radius="lg">
            <h3 className="text-lg font-semibold mb-2">Radius Large</h3>
            <p className="text-gray-600">rounded-lg</p>
          </Card>
        </div>

        {/* With Content */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">بطاقة بمحتوى غني</h3>
          <div className="space-y-2">
            <p className="text-gray-600">
              يمكن استخدام البطاقات لعرض أي نوع من المحتوى.
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>نقاط مهمة</li>
              <li>معلومات إضافية</li>
              <li>تفاصيل إضافية</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  )
}

