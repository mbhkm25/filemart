// Button Component
// Fully implemented with all states per FIS.md

import React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      disabled = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2'
    
    const variantClasses = {
      primary: cn(
        'bg-primary-600 text-white',
        'hover:bg-primary-500 hover:shadow-sm', // Lighten 5% + subtle shadow
        'active:bg-primary-700 active:scale-[0.98]', // Darken 5% + scale
        'focus:ring-primary-500',
        disabled && 'opacity-40 cursor-not-allowed hover:bg-primary-600 hover:shadow-none active:scale-100'
      ),
      secondary: cn(
        'bg-gray-200 text-gray-900',
        'hover:bg-gray-100 hover:shadow-sm',
        'active:bg-gray-300 active:scale-[0.98]',
        'focus:ring-gray-500',
        disabled && 'opacity-40 cursor-not-allowed hover:bg-gray-200 hover:shadow-none active:scale-100'
      ),
      outline: cn(
        'border-2 border-primary-600 text-primary-600 bg-transparent',
        'hover:bg-primary-50 hover:shadow-sm',
        'active:bg-primary-100 active:scale-[0.98]',
        'focus:ring-primary-500',
        disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent hover:shadow-none active:scale-100'
      ),
      danger: cn(
        'bg-red-600 text-white',
        'hover:bg-red-500 hover:shadow-sm',
        'active:bg-red-700 active:scale-[0.98]',
        'focus:ring-red-500',
        disabled && 'opacity-40 cursor-not-allowed hover:bg-red-600 hover:shadow-none active:scale-100'
      ),
    }
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    }
    
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button

