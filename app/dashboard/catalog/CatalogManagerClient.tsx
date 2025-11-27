// Catalog Manager Client Component
// Products list with search, filter, and CRUD operations

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import SearchBar from '@/components/common/SearchBar'
import ProductRow from '@/components/dashboard/ProductRow'
import StateBox from '@/components/common/StateBox'
import Skeleton from '@/components/common/Skeleton'
import { useToast } from '@/components/common/Toast'
import type { Product } from '@/types/database'
import { useBusiness } from '@/contexts/BusinessContext'

export default function CatalogManagerClient() {
  const router = useRouter()
  const { showToast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const businessId = useBusiness()

  const fetchProducts = async () => {
    if (!businessId) return
    
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(
        `/api/businesses/${businessId}/catalog?${params.toString()}`
      )
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في جلب المنتجات')
      }

      setProducts(data.data || [])
    } catch (error: any) {
      console.error('Fetch error:', error)
      showToast('error', error.message || 'فشل في جلب المنتجات')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!businessId) return
    fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, businessId])

  useEffect(() => {
    if (!businessId) return
    const timeout = setTimeout(() => {
      fetchProducts()
    }, 500)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, businessId])

  if (!businessId) {
    return null
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleDelete = async (productId: string) => {
    try {
      const response = await fetch(
        `/api/businesses/${businessId}/catalog/${productId}`,
        {
        method: 'DELETE',
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في حذف المنتج')
      }

      setProducts(products.filter((p) => p.id !== productId))
      showToast('success', 'تم حذف المنتج بنجاح')
    } catch (error: any) {
      console.error('Delete error:', error)
      showToast('error', error.message || 'فشل في حذف المنتج')
    }
  }

  const handleStatusToggle = async (product: Product) => {
    try {
      const newStatus = product.status === 'active' ? 'inactive' : 'active'
      const response = await fetch(
        `/api/businesses/${businessId}/catalog/${product.id}`,
        {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'فشل في تحديث حالة المنتج')
      }

      setProducts(
        products.map((p) =>
          p.id === product.id ? { ...p, status: newStatus as 'active' | 'inactive' } : p
        )
      )
      showToast('success', 'تم تحديث حالة المنتج')
    } catch (error: any) {
      console.error('Toggle error:', error)
      showToast('error', error.message || 'فشل في تحديث حالة المنتج')
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              الكاتلوج
            </h1>
            <p className="text-gray-600">
              إدارة منتجاتك وخدماتك
            </p>
          </div>
          <Link href="/dashboard/catalog/new">
            <Button variant="primary">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                إضافة منتج
              </span>
            </Button>
          </Link>
        </div>

        {/* Search and Filter */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="ابحث عن منتج..."
                value={searchQuery}
                onChange={(value) => {
                  setSearchQuery(value)
                  const timeout = setTimeout(() => {
                    fetchProducts()
                  }, 500)
                  return () => clearTimeout(timeout)
                }}
                onClear={() => {
                  setSearchQuery('')
                  fetchProducts()
                }}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'active'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                نشط
              </button>
              <button
                onClick={() => setStatusFilter('inactive')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'inactive'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                معطل
              </button>
            </div>
          </div>
        </Card>

        {/* Products List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={100} rounded="lg" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="space-y-4">
            {products.map((product) => (
              <ProductRow
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  price: Number(product.price),
                  images: product.images,
                  status: product.status,
                  category: product.category,
                }}
                onEdit={() => router.push(`/dashboard/catalog/${product.id}`)}
                onDelete={() => handleDelete(product.id)}
                onStatusToggle={() => handleStatusToggle(product)}
              />
            ))}
          </div>
        ) : (
          <StateBox
            type="empty"
            title="لا توجد منتجات"
            description={
              searchQuery || statusFilter !== 'all'
                ? 'لم يتم العثور على منتجات تطابق البحث'
                : 'ابدأ بإضافة منتجك الأول'
            }
            actionLabel={!searchQuery && statusFilter === 'all' ? 'إضافة منتج' : undefined}
            onAction={
              !searchQuery && statusFilter === 'all'
                ? () => router.push('/dashboard/catalog/new')
                : undefined
            }
          />
        )}
      </div>
    </div>
  )
}

