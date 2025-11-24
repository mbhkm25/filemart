// AuditLogRow Component
// Log row with expandable details

'use client'

import React, { useState } from 'react'
import Tag from '@/components/common/Tag'
import { cn } from '@/lib/utils'
import type { SystemLog } from '@/types/database'

export interface AuditLogRowProps {
  log: SystemLog
  className?: string
}

const logTypeConfig: Record<string, { label: string; variant: 'info' | 'success' | 'warning' | 'error' | 'default' }> = {
  create: { label: 'إنشاء', variant: 'success' },
  update: { label: 'تحديث', variant: 'info' },
  delete: { label: 'حذف', variant: 'error' },
  login: { label: 'تسجيل دخول', variant: 'info' },
  logout: { label: 'تسجيل خروج', variant: 'default' },
  error: { label: 'خطأ', variant: 'error' },
}

export default function AuditLogRow({ log, className }: AuditLogRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formattedDate = new Date(log.created_at).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const logType = logTypeConfig[log.log_type] || {
    label: log.log_type,
    variant: 'default' as const,
  }

  const details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details

  return (
    <div className={cn('border-b border-gray-100 py-3', className)}>
      <div
        className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4 flex-1">
          <Tag label={logType.label} variant={logType.variant} size="sm" />
          <span className="text-sm text-gray-700">{log.user_id || 'نظام'}</span>
          <span className="text-sm text-gray-500">{formattedDate}</span>
          {log.description && (
            <span className="text-sm text-gray-600 flex-1 truncate">{log.description}</span>
          )}
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <svg
            className={cn('w-5 h-5 transition-transform', isExpanded && 'rotate-180')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="mt-2 p-4 bg-gray-50 rounded-lg">
          <pre className="text-xs text-gray-600 overflow-auto">
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
