// Public Profile API Route
// GET /api/public/profile/:slug

import { NextRequest } from 'next/server'
import { success, error, notFound } from '@/lib/api-response'
import { queryOne, query } from '@/lib/db'
import type { BusinessProfile, Product, GalleryImage, InstalledPlugin, Plugin } from '@/types/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Fetch business profile
    const profile = await queryOne<BusinessProfile>(
      `SELECT * FROM business_profiles WHERE slug = $1 AND is_published = true`,
      [slug]
    )

    if (!profile) {
      return notFound('الملف التجاري غير موجود')
    }

    // Fetch active products
    const products = await query<Product>(
      `SELECT * FROM products WHERE profile_id = $1 AND status = 'active' ORDER BY display_order ASC, created_at DESC`,
      [profile.id]
    )

    // Fetch gallery images
    const galleryImages = await query<GalleryImage>(
      `SELECT * FROM gallery_images WHERE profile_id = $1 ORDER BY display_order ASC, created_at DESC`,
      [profile.id]
    )

    // Fetch installed plugins with public widgets
    const installedPlugins = await query<
      InstalledPlugin & {
        plugin_key: string
        public_widget_path: string | null
        settings_json: any
      }
    >(
      `SELECT 
        ip.id,
        ip.merchant_id,
        ip.plugin_id,
        ip.is_active,
        p.plugin_key,
        p.public_widget_path,
        ps.settings_json
      FROM installed_plugins ip
      JOIN plugins p ON ip.plugin_id = p.id
      LEFT JOIN plugin_settings ps ON ip.id = ps.installed_plugin_id
      WHERE ip.merchant_id = $1 
        AND ip.is_active = true 
        AND p.is_active = true
        AND p.public_widget_path IS NOT NULL
        AND p.public_widget_path != ''
      ORDER BY ip.created_at ASC`,
      [profile.merchant_id]
    )

    return success({
      profile: {
        id: profile.id,
        slug: profile.slug,
        name: profile.name,
        description: profile.description,
        logo_url: profile.logo_url,
        cover_url: profile.cover_url,
        category: profile.category,
        address: profile.address,
        city: profile.city,
        country: profile.country,
        working_hours: profile.working_hours,
        contact_links: profile.contact_links,
        primary_color: profile.primary_color,
        secondary_color: profile.secondary_color,
      },
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.price),
        images: p.images,
        category: p.category,
      })),
      gallery: galleryImages.map((img) => ({
        id: img.id,
        image_url: img.image_url,
        thumbnail_url: img.thumbnail_url,
        alt_text: img.alt_text,
      })),
      plugins: installedPlugins.map((plugin) => ({
        id: plugin.id,
        plugin_key: plugin.plugin_key,
        installation_id: plugin.id,
        merchant_id: plugin.merchant_id,
        profile_id: profile.id,
        settings: plugin.settings_json || {},
      })),
    })
  } catch (err) {
    console.error('Error fetching public profile:', err)
    return error('فشل في جلب الملف التجاري', 500)
  }
}

