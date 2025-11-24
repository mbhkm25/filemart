// OrderRow Component
// Fully implemented per FCI.md and FIS.md

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Card from '@/components/common/Card'
import Tag from '@/components/common/Tag'
import { cn } from '@/lib/utils'
import type { Order } from '@/types/database'

export interface OrderRowProps {
  order: {
    id: string
    client_name: string
    client_phone: string
    total_amount: number
    status: 'new' | 'processing' | 'completed' | 'cancelled'
    created_at: Date | string
    items_count?: number
  }
  onClick?: () => void
  className?: string
}

const statusConfig = {
  new: { label: 'جديد', variant: 'info' as const },
  processing: { label: 'معالجة', variant: 'warning' as const },
  completed: { label: 'مكتمل', variant: 'success' as const },
  cancelled: { label: 'ملغي', variant: 'error' as const },
}

export default function OrderRow({
  order,
  onClick,
  className,
}: OrderRowProps) {
  const formattedDate = new Date(order.created_at).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const formattedTotal = new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
  }).format(Number(order.total_amount))

  const status = statusConfig[order.status]

  const content = (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:-translate-y-0.5',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 truncate">
              {order.client_name}
            </h3>
            <Tag label={status.label} variant={status.variant} size="sm" />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span>{order.client_phone}</span>
            <span>•</span>
            <span>{formattedTotal}</span>
            {order.items_count && (
              <>
                <span>•</span>
                <span>{order.items_count} منتج</span>
              </>
            )}
            <span>•</span>
            <span>{formattedDate}</span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </div>
      </div>
    </Card>
  )

  if (onClick) {
    return content
  }

  return (
    <Link href={`/dashboard/orders/${order.id}`}>
      {content}
    </Link>
  )
}
