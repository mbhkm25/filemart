// NavbarMobile Component
// Bottom navigation for mobile with RTL support

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

export interface NavbarMobileProps {
  items: NavItem[]
  className?: string
}

export default function NavbarMobile({ items, className }: NavbarMobileProps) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40',
        'bg-white border-t border-gray-200',
        'safe-area-inset-bottom', // For devices with home indicator
        className
      )}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center',
                'flex-1 h-full px-2',
                'transition-colors duration-150',
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <div
                className={cn(
                  'mb-1 transition-transform duration-150',
                  isActive && 'scale-110'
                )}
              >
                {item.icon}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

