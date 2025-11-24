// NavbarDesktop Component
// Side navigation for desktop with RTL support

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export interface NavItem {
  href: string
  label: string
  icon?: React.ReactNode
  badge?: number
}

export interface NavbarDesktopProps {
  items: NavItem[]
  logo?: React.ReactNode
  className?: string
}

export default function NavbarDesktop({ items, logo, className }: NavbarDesktopProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'w-64 bg-white border-l border-gray-200', // RTL: border-l instead of border-r
        'h-screen sticky top-0',
        'flex flex-col',
        className
      )}
    >
      {/* Logo */}
      {logo && (
        <div className="p-4 border-b border-gray-200">
          {logo}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg',
                    'text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  {item.icon && (
                    <span className={cn(
                      'flex-shrink-0',
                      isActive ? 'text-primary-600' : 'text-gray-400'
                    )}>
                      {item.icon}
                    </span>
                  )}
                  <span className="flex-1">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-medium text-white bg-primary-600 rounded-full">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

