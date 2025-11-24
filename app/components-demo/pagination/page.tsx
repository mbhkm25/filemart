// Pagination Component Demo

'use client'

import { useState } from 'react'
import Pagination from '@/components/common/Pagination'
import Card from '@/components/common/Card'

export default function PaginationDemoPage() {
  const [page1, setPage1] = useState(1)
  const [page2, setPage2] = useState(5)
  const [page3, setPage3] = useState(1)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pagination Component</h1>
          <p className="text-gray-600">التنقل بين الصفحات</p>
        </div>

        {/* Basic Pagination */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">تنقل أساسي (10 صفحات)</h2>
          <Pagination
            currentPage={page1}
            totalPages={10}
            onPageChange={setPage1}
          />
          <p className="mt-4 text-sm text-gray-600">
            الصفحة الحالية: {page1}
          </p>
        </Card>

        {/* Many Pages */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">تنقل مع صفحات كثيرة (50 صفحة)</h2>
          <Pagination
            currentPage={page2}
            totalPages={50}
            onPageChange={setPage2}
          />
          <p className="mt-4 text-sm text-gray-600">
            الصفحة الحالية: {page2}
          </p>
        </Card>

        {/* Without Page Numbers */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">بدون أرقام الصفحات</h2>
          <Pagination
            currentPage={page3}
            totalPages={5}
            onPageChange={setPage3}
            showPageNumbers={false}
          />
        </Card>

        {/* Single Page */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">صفحة واحدة</h2>
          <Pagination
            currentPage={1}
            totalPages={1}
            onPageChange={() => {}}
          />
        </Card>
      </div>
    </div>
  )
}

