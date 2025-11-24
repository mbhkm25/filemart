// ProductCard Component
// Fully implemented per FCI.md and FIS.md

import Image from 'next/image'
import Link from 'next/link'
import Card from '@/components/common/Card'
import { cn } from '@/lib/utils'

export interface ProductCardProps {
  id: string
  name: string
  price: number
  image?: string | null
  category?: string | null
  slug: string
  className?: string
}

export default function ProductCard({
  id,
  name,
  price,
  image,
  category,
  slug,
  className,
}: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
  }).format(price)

  return (
    <Link href={`/${slug}/product/${id}`}>
      <Card
        className={cn(
          'cursor-pointer overflow-hidden',
          'hover:scale-[1.02] transition-transform duration-200', // Simple scale on hover
          className
        )}
      >
        {/* Product Image */}
        <div className="relative w-full aspect-square mb-3 rounded-lg overflow-hidden bg-gray-100">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {category && (
            <span className="text-xs text-gray-500 mb-1 block">{category}</span>
          )}
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
            {name}
          </h3>
          <p className="text-xl font-bold text-primary-600">{formattedPrice}</p>
        </div>
      </Card>
    </Link>
  )
}
