// AdminRow Component
// Generic row for admin tables

'use client'

import React from 'react'
import Tag from '@/components/common/Tag'
import Button from '@/components/common/Button'
import { cn } from '@/lib/utils'

export interface AdminRowProps {
  data: Record<string, any>
  columns: Array<{
    key: string
    label: string
    render?: (value: any, row: Record<string, any>) => React.ReactNode
  }>
  actions?: Array<{
    label: string
    onClick: (row: Record<string, any>) => void
    variant?: 'primary' | 'secondary' | 'outline' | 'danger'
    icon?: React.ReactNode
  }>
  onClick?: () => void
  className?: string
}

export default function AdminRow({
  data,
  columns,
  actions,
  onClick,
  className,
}: AdminRowProps) {
  return (
    <tr
      className={cn(
        'border-b border-gray-100 hover:bg-gray-50 transition-colors',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {columns.map((column) => (
        <td key={column.key} className="px-4 py-3 text-sm text-gray-700">
          {column.render ? column.render(data[column.key], data) : String(data[column.key] || '')}
        </td>
      ))}
      {actions && actions.length > 0 && (
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  action.onClick(data)
                }}
              >
                {action.icon && <span className="ml-1">{action.icon}</span>}
                {action.label}
              </Button>
            ))}
          </div>
        </td>
      )}
    </tr>
  )
}
