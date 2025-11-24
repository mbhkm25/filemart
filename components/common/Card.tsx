// Card Component
// Fully implemented with hover behavior per FIS.md

import React from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  shadow?: 'sm' | 'md'
  radius?: 'md' | 'lg'
  children: React.ReactNode
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ shadow = 'sm', radius = 'md', className, children, ...props }, ref) => {
    const shadowClass = shadow === 'sm' ? 'shadow-sm' : 'shadow-md'
    const radiusClass = radius === 'md' ? 'rounded-md' : 'rounded-lg'
    
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white p-4', // padding: 16px
          radiusClass, // radius: 12-16px
          shadowClass, // light shadow
          'transition-all duration-200',
          'hover:shadow-md hover:-translate-y-0.5', // Increase shadow + lift 2px on hover
          'active:shadow-sm', // Reduce shadow on active (no scale)
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card

