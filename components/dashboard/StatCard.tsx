// StatCard Component
// Fully implemented per FCI.md

import React from 'react'
import Card from '@/components/common/Card'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  onClick?: () => void
  className?: string
}

export default function StatCard({
  label,
  value,
  icon,
  onClick,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        'transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        {icon && (
          <div className="flex-shrink-0 text-primary-600">{icon}</div>
        )}
      </div>
    </Card>
  )
}
