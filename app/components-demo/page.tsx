// Components Demo - Main Page
// Overview of all available components

'use client'

import Link from 'next/link'
import Card from '@/components/common/Card'

const componentLinks = [
  { href: '/components-demo/button', label: 'Button', description: 'أزرار بجميع الأنواع والحالات' },
  { href: '/components-demo/input', label: 'Input', description: 'حقول الإدخال مع حالات Focus و Error' },
  { href: '/components-demo/card', label: 'Card', description: 'البطاقات مع تأثيرات Hover' },
  { href: '/components-demo/modal', label: 'Modal', description: 'النوافذ المنبثقة مع Animations' },
  { href: '/components-demo/navbar', label: 'Navigation', description: 'شريط التنقل للجوال والكمبيوتر' },
  { href: '/components-demo/skeleton', label: 'Skeleton', description: 'حالة التحميل مع Pulse' },
  { href: '/components-demo/statebox', label: 'StateBox', description: 'حالات Empty, Error, Offline' },
  { href: '/components-demo/tag', label: 'Tag', description: 'الشارات والأوسمة' },
  { href: '/components-demo/searchbar', label: 'SearchBar', description: 'مربع البحث الموحد' },
  { href: '/components-demo/pagination', label: 'Pagination', description: 'التنقل بين الصفحات' },
  { href: '/components-demo/toast', label: 'Toast', description: 'نظام الرسائل والتنبيهات' },
]

export default function ComponentsDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">مكتبة المكوّنات</h1>
        <p className="text-gray-600 mb-8">عرض جميع المكوّنات المشتركة في FileMart</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {componentLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{link.label}</h3>
                <p className="text-sm text-gray-600">{link.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

