'use client'

// Features Section
// Displays platform features with icons

import Card from '@/components/common/Card'

interface Feature {
  title: string
  description: string
  icon: React.ReactNode
  gradient: string
}

const features: Feature[] = [
  {
    title: 'ملف تجاري احترافي',
    description: 'أنشئ ملفك التجاري بسهولة مع تصميم عصري وجذاب يعكس هويتك التجارية',
    gradient: 'from-blue-500 to-cyan-500',
    icon: (
      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    title: 'عرض المنتجات والخدمات',
    description: 'نظم منتجاتك وخدماتك في كاتلوج احترافي مع صور وأسعار ووصف تفصيلي',
    gradient: 'from-amber-500 to-orange-500',
    icon: (
      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    title: 'استقبال الطلبات',
    description: 'استقبل طلبات العملاء مباشرة من خلال واجهة سهلة ومنظمة',
    gradient: 'from-green-500 to-emerald-500',
    icon: (
      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: 'معرض صور تفاعلي',
    description: 'اعرض صور أعمالك ومنتجاتك في معرض صور احترافي وجذاب',
    gradient: 'from-purple-500 to-pink-500',
    icon: (
      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'نظام إضافات قابل للتوسع',
    description: 'وسع قدرات ملفك التجاري من خلال نظام إضافات قوي ومرن',
    gradient: 'from-indigo-500 to-blue-500',
    icon: (
      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
  },
  {
    title: 'واجهة متجاوبة (PWA)',
    description: 'واجهة متجاوبة تعمل على جميع الأجهزة مع دعم التثبيت كتطبيق',
    gradient: 'from-teal-500 to-cyan-500',
    icon: (
      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-white via-gray-50/50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            ميزات المنصة
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            كل ما تحتاجه لبناء حضورك الرقمي وإدارة أعمالك بسهولة
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="text-center p-6 md:p-8 hover:shadow-xl transition-all duration-300 border border-gray-100 group"
            >
              <div className={`flex justify-center mb-6 w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${feature.gradient} items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

