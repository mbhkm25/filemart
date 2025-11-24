// Product Detail Page
// Server-side rendering with image slider

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import Skeleton from '@/components/common/Skeleton'
import StateBox from '@/components/common/StateBox'
import AddToCartButton from './AddToCartButton'
import { queryOne } from '@/lib/db'
import type { Product, BusinessProfile } from '@/types/database'

interface PageProps {
  params: Promise<{ businessSlug: string; id: string }>
}

async function getProduct(id: string, profileId: string) {
  const product = await queryOne<Product>(
    `SELECT * FROM products WHERE id = $1 AND profile_id = $2 AND status = 'active'`,
    [id, profileId]
  )
  return product
}

async function getProfile(slug: string) {
  const profile = await queryOne<BusinessProfile>(
    `SELECT id, slug FROM business_profiles WHERE slug = $1 AND is_published = true`,
    [slug]
  )
  return profile
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { businessSlug, id } = await params
  const profile = await getProfile(businessSlug)

  if (!profile) {
    return { title: 'المنتج غير موجود' }
  }

  const product = await getProduct(id, profile.id)

  if (!product) {
    return { title: 'المنتج غير موجود' }
  }

  return {
    title: product.name,
    description: product.description || undefined,
    openGraph: {
      title: product.name,
      description: product.description || undefined,
      images: product.images.length > 0 ? [product.images[0]] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { businessSlug, id } = await params

  const profile = await getProfile(businessSlug)
  if (!profile) {
    notFound()
  }

  const product = await getProduct(id, profile.id)
  if (!product) {
    notFound()
  }

  const formattedPrice = new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
  }).format(Number(product.price))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        {/* Back Button */}
        <Link href={`/${businessSlug}`}>
          <Button variant="outline" size="sm" className="mb-6">
            <span className="flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              العودة
            </span>
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Image Slider */}
          <div className="space-y-2">
            {product.images.length > 0 ? (
              <>
                {/* Main Image */}
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                {/* Thumbnail Images */}
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.slice(1, 5).map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                      >
                        <Image
                          src={image}
                          alt={`${product.name} ${index + 2}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 25vw, 12.5vw"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                <svg
                  className="w-24 h-24 text-gray-400"
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
          <div className="space-y-4">
            {product.category && (
              <span className="inline-block px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-lg">
                {product.category}
              </span>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {product.name}
            </h1>

            <div className="text-3xl font-bold text-primary-600">
              {formattedPrice}
            </div>

            {product.description && (
              <div className="prose max-w-none">
                <p className="text-gray-600 whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            <div className="pt-4">
              <AddToCartButton
                product={{
                  productId: product.id,
                  productName: product.name,
                  productImage: product.images[0] || undefined,
                  price: Number(product.price),
                }}
                slug={businessSlug}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
