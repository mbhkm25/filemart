'use client'

// Business Card Component
// Card to display a business profile in the businesses listing

import Link from 'next/link'
import Card from '@/components/common/Card'
import Image from 'next/image'

export interface BusinessCardProps {
  slug: string
  name: string
  description: string | null
  logoUrl: string | null
  category: string | null
  city: string | null
}

export default function BusinessCard({
  slug,
  name,
  description,
  logoUrl,
  category,
  city,
}: BusinessCardProps) {
  return (
    <Link href={`/${slug}`}>
      <Card className="h-full hover:shadow-md transition-all duration-200 p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="w-full h-48 bg-gray-100 overflow-hidden flex items-center justify-center">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={name}
                width={200}
                height={200}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
              {name}
            </h3>
            {description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {description}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-auto">
              {category && (
                <span className="text-xs px-2 py-1 bg-primary-50 text-primary-700 rounded-full">
                  {category}
                </span>
              )}
              {city && (
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                  {city}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}

