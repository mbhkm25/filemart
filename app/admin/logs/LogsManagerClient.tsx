// Logs Manager Client Component
// Audit logs with filters and search

'use client'

import React, { useState, useEffect } from 'react'
import Card from '@/components/common/Card'
import SearchBar from '@/components/common/SearchBar'
import Pagination from '@/components/common/Pagination'
import AuditLogRow from '@/components/admin/AuditLogRow'
import Skeleton from '@/components/common/Skeleton'
import StateBox from '@/components/common/StateBox'
import { useToast } from '@/components/common/Toast'
import type { SystemLog } from '@/types/database'

const logTypes = [
  { value: 'all', label: 'الكل' },
  { value: 'create', label: 'إنشاء' },
  { value: 'update', label: 'تحديث' },
  { value: 'delete', label: 'حذف' },
  { value: 'login', label: 'تسجيل دخول' },
  { value: 'logout', label: 'تسجيل خروج' },
  { value: 'error', label: 'خطأ' },
]

export default function LogsManagerClient() {
  const { showToast } = useToast()
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [typeFilter, setTypeFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [currentPage, typeFilter, startDate, endDate])

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', String(currentPage))
      params.append('limit', '50')
      if (typeFilter !== 'all') {
        params.append('type', typeFilter)
      }
      if (startDate) {
        params.append('start_date', startDate)
      }
      if (endDate) {
        params.append('end_date', endDate)
      }

      const response = await fetch(`/api/admin/logs?${params.toString()}`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في جلب السجلات')
      }

      setLogs(data.data.logs || [])
      setTotalPages(data.data.pagination?.totalPages || 1)
    } catch (error: any) {
      console.error('Fetch error:', error)
      showToast('error', error.message || 'فشل في جلب السجلات')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          سجلات النظام
        </h1>
        <p className="text-gray-600">
          عرض جميع أحداث النظام والإجراءات
        </p>
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                نوع السجل
              </label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {logTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                من تاريخ
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                إلى تاريخ
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setTypeFilter('all')
                  setStartDate('')
                  setEndDate('')
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                إعادة تعيين
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Logs List */}
      <Card>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} height={80} rounded="lg" />
            ))}
          </div>
        ) : logs.length > 0 ? (
          <>
            <div className="space-y-2">
              {logs.map((log) => (
                <AuditLogRow key={log.id} log={log} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page)
                    fetchLogs()
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <StateBox type="empty" title="لا توجد سجلات" description="لم يتم العثور على سجلات تطابق الفلاتر" />
        )}
      </Card>
    </div>
  )
}

