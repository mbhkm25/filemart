'use client'

// Businesses List Client Component
// Handles search, filtering, and pagination for businesses listing

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import BusinessCard from '@/components/public/BusinessCard'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import StateBox from '@/components/common/StateBox'
import Skeleton from '@/components/common/Skeleton'

interface Business {
  id: string
  slug: string
  name: string
  description: string | null
  logoUrl: string | null
  coverUrl: string | null
  category: string | null
  city: string | null
  country: string
  createdAt: Date
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface Filters {
  categories: string[]
  cities: string[]
}

export default function BusinessesListClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [filters, setFilters] = useState<Filters>({ categories: [], cities: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingFilters, setIsLoadingFilters] = useState(true)

  // Search and filter state
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'))

  // Fetch filters
  useEffect(() => {
    async function fetchFilters() {
      try {
        const res = await fetch('/api/public/businesses/filters')
        const data = await res.json()
        if (data.success) {
          setFilters({
            categories: data.data.categories,
            cities: data.data.cities,
          })
        }
      } catch (err) {
        console.error('Error fetching filters:', err)
      } finally {
        setIsLoadingFilters(false)
      }
    }
    fetchFilters()
  }, [])

  // Fetch businesses
  useEffect(() => {
    async function fetchBusinesses() {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (search) params.set('search', search)
        if (category) params.set('category', category)
        if (city) params.set('city', city)
        params.set('page', currentPage.toString())
        params.set('limit', '12')

        const res = await fetch(`/api/public/businesses?${params.toString()}`)
        const data = await res.json()

        if (data.success) {
          setBusinesses(data.data.businesses)
          setPagination(data.data.pagination)
          
          // Update URL
          const newParams = new URLSearchParams()
          if (search) newParams.set('search', search)
          if (category) newParams.set('category', category)
          if (city) newParams.set('city', city)
          if (currentPage > 1) newParams.set('page', currentPage.toString())
          router.replace(`/businesses?${newParams.toString()}`, { scroll: false })
        }
      } catch (err) {
        console.error('Error fetching businesses:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBusinesses()
  }, [search, category, city, currentPage, router])

  const handleSearch = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    setCurrentPage(1)
  }

  const handleCityChange = (value: string) => {
    setCity(value)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            تصفح الملفات التجارية
          </h1>
          <p className="text-gray-600">
            اكتشف الملفات التجارية المتاحة على المنصة
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8 p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <Input
              type="text"
              placeholder="ابحث عن ملف تجاري..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />

            {/* Category Filter */}
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-150"
            >
              <option value="">جميع الفئات</option>
              {filters.categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* City Filter */}
            <select
              value={city}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-150"
            >
              <option value="">جميع المدن</option>
              {filters.cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} height={300} rounded="lg" />
            ))}
          </div>
        ) : businesses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {businesses.map((business) => (
                <BusinessCard
                  key={business.id}
                  slug={business.slug}
                  name={business.name}
                  description={business.description}
                  logoUrl={business.logoUrl}
                  category={business.category}
                  city={business.city}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  السابق
                </Button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first, last, current, and pages around current
                    return (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                  })
                  .map((page, index, array) => {
                    // Add ellipsis
                    const prevPage = array[index - 1]
                    const showEllipsisBefore = prevPage && page - prevPage > 1

                    return (
                      <div key={page} className="flex items-center gap-2">
                        {showEllipsisBefore && <span className="text-gray-500">...</span>}
                        <Button
                          variant={currentPage === page ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      </div>
                    )
                  })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === pagination.totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  التالي
                </Button>
              </div>
            )}
          </>
        ) : (
          <StateBox
            type="empty"
            title="لا توجد ملفات تجارية"
            description={
              search || category || city
                ? 'لم يتم العثور على ملفات تجارية تطابق البحث'
                : 'لا توجد ملفات تجارية متاحة حالياً'
            }
          />
        )}
      </div>
    </div>
  )
}

