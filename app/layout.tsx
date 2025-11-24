import type { Metadata } from 'next'
import { IBM_Plex_Sans_Arabic } from 'next/font/google'
import { ToastProvider } from '@/components/common/Toast'
import './globals.css'

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans-arabic',
})

export const metadata: Metadata = {
  title: 'FileMart',
  description: 'منصة إنشاء الملفات التجارية الاحترافية',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${ibmPlexSansArabic.variable} font-sans`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}

