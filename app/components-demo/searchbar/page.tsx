// SearchBar Component Demo

'use client'

import { useState } from 'react'
import SearchBar from '@/components/common/SearchBar'
import Card from '@/components/common/Card'

export default function SearchBarDemoPage() {
  const [search1, setSearch1] = useState('')
  const [search2, setSearch2] = useState('')

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SearchBar Component</h1>
          <p className="text-gray-600">مربع البحث الموحد</p>
        </div>

        {/* Basic Search */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">بحث أساسي</h2>
          <SearchBar
            placeholder="ابحث..."
            value={search1}
            onChange={setSearch1}
          />
          {search1 && (
            <p className="mt-2 text-sm text-gray-600">
              النتيجة: <span className="font-medium">{search1}</span>
            </p>
          )}
        </Card>

        {/* With Clear Button */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">مع زر المسح</h2>
          <SearchBar
            placeholder="ابحث عن منتج..."
            value={search2}
            onChange={setSearch2}
            onClear={() => setSearch2('')}
          />
        </Card>

        {/* Custom Placeholder */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">مع placeholder مخصص</h2>
          <SearchBar placeholder="ابحث في المنتجات..." />
        </Card>

        {/* Disabled */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">معطل</h2>
          <SearchBar placeholder="لا يمكن البحث" disabled />
        </Card>
      </div>
    </div>
  )
}

