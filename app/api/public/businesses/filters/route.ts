// Public Businesses Filters API Route
// GET /api/public/businesses/filters
// Returns available categories and cities for filtering

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get distinct categories
    const categories = await query<{ category: string }>(
      `SELECT DISTINCT category 
       FROM business_profiles 
       WHERE is_published = true AND category IS NOT NULL AND category != ''
       ORDER BY category ASC`
    )

    // Get distinct cities
    const cities = await query<{ city: string }>(
      `SELECT DISTINCT city 
       FROM business_profiles 
       WHERE is_published = true AND city IS NOT NULL AND city != ''
       ORDER BY city ASC`
    )

    return success({
      categories: categories.map((c) => c.category),
      cities: cities.map((c) => c.city),
    })
  } catch (err: any) {
    console.error('Error fetching filters:', err)
    return error('فشل في جلب خيارات الفلترة', 500)
  }
}

