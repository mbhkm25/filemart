// ProductRow Component
// Fully implemented per FCI.md

'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Tag from '@/components/common/Tag'
import Modal from '@/components/common/Modal'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/database'

export interface ProductRowProps {
  product: {
    id: string
    name: string
    price: number
    images: string[]
    status: 'active' | 'inactive'
    category?: string | null
  }
  onEdit?: () => void
  onDelete?: () => void
  onStatusToggle?: () => void
  className?: string
}

export default function ProductRow({
  product,
  onEdit,
  onDelete,
  onStatusToggle,
  className,
}: ProductRowProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const formattedPrice = new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
  }).format(Number(product.price))

  const handleDelete = async () => {
    if (!onDelete) return

    setIsDeleting(true)
    try {
      await onDelete()
      setShowDeleteModal(false)
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card className={cn('', className)}>
        <div className="flex items-center gap-4">
          {/* Product Image */}
          <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg
                  className="w-8 h-8"
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
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {product.name}
              </h3>
              <Tag
                label={product.status === 'active' ? 'نشط' : 'معطل'}
                variant={product.status === 'active' ? 'success' : 'default'}
                size="sm"
              />
            </div>
            {product.category && (
              <p className="text-sm text-gray-500 mb-1">{product.category}</p>
            )}
            <p className="text-lg font-bold text-primary-600">{formattedPrice}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {onStatusToggle && (
              <button
                onClick={onStatusToggle}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  product.status === 'active'
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {product.status === 'active' ? 'تعطيل' : 'تفعيل'}
              </button>
            )}
            {onEdit && (
              <Link href={`/dashboard/catalog/${product.id}`}>
                <Button variant="outline" size="sm">
                  تعديل
                </Button>
              </Link>
            )}
            {onDelete && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
              >
                حذف
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="تأكيد الحذف"
      >
        <p className="text-gray-600 mb-4">
          هل أنت متأكد من رغبتك في حذف المنتج &quot;{product.name}&quot;؟ لا يمكن التراجع عن هذه العملية.
        </p>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeleting}
          >
            إلغاء
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'جاري الحذف...' : 'حذف'}
          </Button>
        </div>
      </Modal>
    </>
  )
}
