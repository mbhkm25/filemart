// AdminTable Component
// Sortable, searchable, paginated table for admin

'use client'

import React, { useState, useMemo } from 'react'
import Card from '@/components/common/Card'
import SearchBar from '@/components/common/SearchBar'
import Pagination from '@/components/common/Pagination'
import Skeleton from '@/components/common/Skeleton'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
}

export interface AdminTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchable?: boolean
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  sortable?: boolean
  onSort?: (key: string, direction: 'asc' | 'desc') => void
  paginated?: boolean
  pageSize?: number
  onPageChange?: (page: number) => void
  currentPage?: number
  isLoading?: boolean
  emptyMessage?: string
  onRowClick?: (row: T) => void
  className?: string
}

export default function AdminTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = 'بحث...',
  onSearch,
  sortable = true,
  onSort,
  paginated = true,
  pageSize = 10,
  onPageChange,
  currentPage = 1,
  isLoading = false,
  emptyMessage = 'لا توجد بيانات',
  onRowClick,
  className,
}: AdminTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = (key: string) => {
    if (!sortable) return

    const newDirection =
      sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc'
    setSortKey(key)
    setSortDirection(newDirection)

    if (onSort) {
      onSort(key, newDirection)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (onSearch) {
      onSearch(query)
    }
  }

  const paginatedData = useMemo(() => {
    if (!paginated) return data
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return data.slice(start, end)
  }, [data, currentPage, pageSize, paginated])

  const totalPages = paginated ? Math.ceil(data.length / pageSize) : 1

  if (isLoading) {
    return (
      <Card className={className}>
        <div className="space-y-4">
          <Skeleton height={40} rounded="lg" />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} height={60} rounded="lg" />
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className={className}>
      {/* Search Bar */}
      {searchable && (
        <div className="mb-4">
          <SearchBar
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={handleSearch}
            onClear={() => handleSearch('')}
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    'px-4 py-3 text-right text-sm font-semibold text-gray-700',
                    sortable && column.sortable !== false && 'cursor-pointer hover:bg-gray-50'
                  )}
                  onClick={() =>
                    sortable && column.sortable !== false && handleSort(String(column.key))
                  }
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {sortable && column.sortable !== false && sortKey === String(column.key) && (
                      <span className="text-primary-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={index}
                  className={cn(
                    'border-b border-gray-100 hover:bg-gray-50 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((column) => (
                    <td key={String(column.key)} className="px-4 py-3 text-sm text-gray-700">
                      {column.render
                        ? column.render(row[column.key], row)
                        : String(row[column.key] || '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange || (() => {})}
          />
        </div>
      )}
    </Card>
  )
}
