'use client'

// Landing Hero Section
// Hero section for the landing page with title, description, and CTA buttons

import Link from 'next/link'
import Button from '@/components/common/Button'

export default function LandingHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 md:pt-24">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-amber-50/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] animate-gradient-pulse-1"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(251,191,36,0.1),transparent_50%)] animate-gradient-pulse-2"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.05),transparent_50%)] animate-gradient-pulse-3"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-primary-700 to-primary-600 bg-clip-text text-transparent leading-tight">
            منصة FileMart
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed">
            أنشئ ملفك التجاري الاحترافي بسهولة. عرض منتجاتك وخدماتك، واستقبل طلبات العملاء في مكان واحد.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Link href="/signup">
            <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow">
              أنشئ ملفك التجاري الآن
            </Button>
          </Link>
          <Link href="/businesses">
            <Button variant="outline" size="lg" className="w-full sm:w-auto border-2">
              تصفح الملفات التجارية
            </Button>
          </Link>
        </div>

        <div className="text-center">
          <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium text-lg transition-colors inline-flex items-center gap-2">
            <span>لديك حساب بالفعل؟</span>
            <span className="underline">تسجيل الدخول</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

