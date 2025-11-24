// Skeleton Component
// Fully implemented with pulse animation only (no shimmer) per FIS.md

import React from 'react'
import { cn } from '@/lib/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number
  height?: string | number
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ width, height, rounded = 'md', className, ...props }, ref) => {
    const roundedClasses = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      full: 'rounded-full',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'bg-gray-200 animate-pulse', // Pulse animation only, no shimmer
          roundedClasses[rounded],
          className
        )}
        style={{
          width: width || '100%',
          height: height || '20px',
        }}
        {...props}
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'

export default Skeleton

