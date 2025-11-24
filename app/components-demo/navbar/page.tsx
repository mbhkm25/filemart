// Navigation Components Demo

'use client'

import { useState } from 'react'
import NavbarMobile from '@/components/common/NavbarMobile'
import NavbarDesktop from '@/components/common/NavbarDesktop'
import Card from '@/components/common/Card'

const navItems = [
  {
    href: '/components-demo',
    label: 'الرئيسية',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/components-demo/button',
    label: 'الأزرار',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
    ),
  },
  {
    href: '/components-demo/input',
    label: 'الحقول',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    href: '/components-demo/modal',
    label: 'النوافذ',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
    badge: 3,
  },
]

export default function NavbarDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Desktop Navbar */}
        <div className="hidden md:block">
          <NavbarDesktop
            items={navItems}
            logo={
              <div className="text-xl font-bold text-primary-600">FileMart</div>
            }
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-8 pb-24 md:pb-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Navigation Components</h1>
              <p className="text-gray-600">شريط التنقل للجوال والكمبيوتر</p>
            </div>

            <Card>
              <h2 className="text-xl font-semibold mb-4">NavbarDesktop</h2>
              <p className="text-gray-600 mb-4">
                شريط التنقل الجانبي للكمبيوتر. يظهر على اليسار في وضع RTL.
              </p>
              <p className="text-sm text-gray-500">
                (يظهر على اليسار في هذه الصفحة - جرب على شاشة كبيرة)
              </p>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold mb-4">NavbarMobile</h2>
              <p className="text-gray-600 mb-4">
                شريط التنقل السفلي للجوال. يظهر في الأسفل.
              </p>
              <p className="text-sm text-gray-500">
                (يظهر في الأسفل - جرب على شاشة صغيرة)
              </p>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold mb-2">المميزات</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>دعم كامل لـ RTL</li>
                <li>Active state highlighting</li>
                <li>Badge support للأشعارات</li>
                <li>Responsive design</li>
                <li>Simple transitions</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Navbar */}
      <div className="md:hidden">
        <NavbarMobile items={navItems} />
      </div>
    </div>
  )
}

