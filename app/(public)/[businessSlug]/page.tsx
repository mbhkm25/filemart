// Main Public Business Profile Page
// Server-side rendering with dynamic metadata

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import BusinessHeader from '@/components/public/BusinessHeader'
import ProductCard from '@/components/public/ProductCard'
import GalleryGrid from '@/components/public/GalleryGrid'
import PluginWidget from '@/components/public/PluginWidget'
import FloatingOrderButton from '@/components/public/FloatingOrderButton'
import CartProvider from './CartProvider'
import StateBox from '@/components/common/StateBox'
import Skeleton from '@/components/common/Skeleton'
import { queryOne, query } from '@/lib/db'
import type { BusinessProfile, Product, GalleryImage } from '@/types/database'

interface PageProps {
  params: Promise<{ businessSlug: string }>
}

async function getBusinessProfile(slug: string) {
  const profile = await queryOne<BusinessProfile>(
    `SELECT * FROM business_profiles WHERE slug = $1 AND is_published = true`,
    [slug]
  )
  return profile
}

async function getProducts(profileId: string) {
  const products = await query<Product>(
    `SELECT * FROM products WHERE profile_id = $1 AND status = 'active' ORDER BY display_order ASC, created_at DESC`,
    [profileId]
  )
  return products
}

async function getGalleryImages(profileId: string) {
  const images = await query<GalleryImage>(
    `SELECT * FROM gallery_images WHERE profile_id = $1 ORDER BY display_order ASC, created_at DESC`,
    [profileId]
  )
  return images
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { businessSlug } = await params
  const profile = await getBusinessProfile(businessSlug)

  if (!profile) {
    return {
      title: 'الملف غير موجود',
    }
  }

  return {
    title: profile.name,
    description: profile.description || `${profile.name} - ملف تجاري على FileMart`,
    openGraph: {
      title: profile.name,
      description: profile.description || undefined,
      images: profile.cover_url ? [profile.cover_url] : profile.logo_url ? [profile.logo_url] : [],
    },
  }
}

export default async function PublicBusinessProfilePage({
  params,
}: PageProps) {
  const { businessSlug } = await params

  const profile = await getBusinessProfile(businessSlug)

  if (!profile) {
    notFound()
  }

  // Fetch all data in parallel
  const [products, galleryImages, installedPluginsData] = await Promise.all([
    getProducts(profile.id),
    getGalleryImages(profile.id),
    fetch(`/api/public/profile/${businessSlug}`)
      .then((res) => res.json())
      .then((data) => (data.success ? data.data.plugins : []))
      .catch(() => []),
  ])

  const installedPlugins = installedPluginsData || []

  return (
    <CartProvider profileId={profile.id}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Business Header */}
        <Suspense
          fallback={
            <div className="mb-6 md:mb-8">
              <Skeleton height={200} rounded="lg" />
            </div>
          }
        >
          <BusinessHeader
            name={profile.name}
            description={profile.description}
            logoUrl={profile.logo_url}
            coverUrl={profile.cover_url}
            contactLinks={profile.contact_links}
            primaryColor={profile.primary_color}
            className="mb-6 md:mb-8"
          />
        </Suspense>

        {/* Gallery Section */}
        {galleryImages.length > 0 && (
          <section className="mb-8 md:mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">معرض الصور</h2>
            <Suspense
              fallback={
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} height={200} rounded="lg" />
                  ))}
                </div>
              }
            >
              <GalleryGrid images={galleryImages} />
            </Suspense>
          </section>
        )}

        {/* Catalog Section */}
        <section className="mb-8 md:mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">المنتجات</h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={Number(product.price)}
                  image={product.images[0] || null}
                  category={product.category}
                  slug={businessSlug}
                />
              ))}
            </div>
          ) : (
            <StateBox
              type="empty"
              title="لا توجد منتجات"
              description="لم يتم إضافة أي منتجات بعد"
            />
          )}
        </section>

        {/* Plugin Widgets Section */}
        {installedPlugins.length > 0 && (
          <section className="mb-8 md:mb-12 space-y-6">
            {installedPlugins.map((plugin) => (
              <PluginWidget
                key={plugin.id}
                pluginKey={plugin.plugin_key}
                config={plugin.settings}
                installationId={plugin.id}
                merchantId={plugin.merchant_id}
                profileId={plugin.profile_id}
              />
            ))}
          </section>
        )}
      </div>

        {/* Floating Order Button */}
        <Suspense fallback={null}>
          <FloatingOrderButton slug={businessSlug} />
        </Suspense>
      </div>
    </CartProvider>
  )
}
