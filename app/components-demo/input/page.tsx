// Input Component Demo

'use client'

import { useState } from 'react'
import Input from '@/components/common/Input'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'

export default function InputDemoPage() {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!value) {
      setError('هذا الحقل مطلوب')
    } else {
      setError('')
      alert(`القيمة: ${value}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Input Component</h1>
          <p className="text-gray-600">حقول الإدخال مع حالات Focus و Error</p>
        </div>

        {/* Basic Input */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">حقل أساسي</h2>
          <Input
            label="الاسم"
            placeholder="أدخل اسمك"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setError('')
            }}
          />
        </Card>

        {/* Input with Error */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">حقل مع خطأ</h2>
          <Input
            label="البريد الإلكتروني"
            type="email"
            placeholder="example@email.com"
            error={error}
          />
          <Button onClick={handleSubmit} className="mt-4">
            تحقق
          </Button>
        </Card>

        {/* Different Types */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">أنواع مختلفة</h2>
          <div className="space-y-4">
            <Input label="نص" type="text" placeholder="نص عادي" />
            <Input label="بريد إلكتروني" type="email" placeholder="email@example.com" />
            <Input label="رقم" type="number" placeholder="123" />
            <Input label="كلمة مرور" type="password" placeholder="••••••••" />
          </div>
        </Card>

        {/* Disabled */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">معطل</h2>
          <Input
            label="حقل معطل"
            placeholder="لا يمكن التعديل"
            disabled
            value="قيمة ثابتة"
          />
        </Card>
      </div>
    </div>
  )
}

