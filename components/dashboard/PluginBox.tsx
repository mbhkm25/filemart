// PluginBox Component
// Fully implemented per FCI.md

'use client'

import React from 'react'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Tag from '@/components/common/Tag'
import { cn } from '@/lib/utils'

export interface PluginBoxProps {
  plugin: {
    id: string
    plugin_key: string
    name: string
    description?: string | null
    version: string
    is_premium: boolean
    price: number
  }
  isInstalled: boolean
  isActive?: boolean
  onInstall?: () => void
  onUninstall?: () => void
  onSettings?: () => void
  onToggleActive?: () => void
  className?: string
}

export default function PluginBox({
  plugin,
  isInstalled,
  isActive = false,
  onInstall,
  onUninstall,
  onSettings,
  onToggleActive,
  className,
}: PluginBoxProps) {
  return (
    <Card className={cn('', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{plugin.name}</h3>
            {plugin.is_premium && (
              <Tag label="مميز" variant="warning" size="sm" />
            )}
            {isInstalled && (
              <Tag
                label={isActive ? 'نشط' : 'معطل'}
                variant={isActive ? 'success' : 'default'}
                size="sm"
              />
            )}
          </div>
          {plugin.description && (
            <p className="text-sm text-gray-600 mb-2">{plugin.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>الإصدار: {plugin.version}</span>
            {plugin.is_premium && (
              <span className="font-semibold text-primary-600">
                {new Intl.NumberFormat('ar-SA', {
                  style: 'currency',
                  currency: 'SAR',
                }).format(Number(plugin.price))}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isInstalled ? (
            <>
              {onToggleActive && (
                <button
                  onClick={onToggleActive}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {isActive ? 'تعطيل' : 'تفعيل'}
                </button>
              )}
              {onSettings && (
                <Button variant="outline" size="sm" onClick={onSettings}>
                  إعدادات
                </Button>
              )}
              {onUninstall && (
                <Button variant="danger" size="sm" onClick={onUninstall}>
                  إلغاء التثبيت
                </Button>
              )}
            </>
          ) : (
            onInstall && (
              <Button variant="primary" size="sm" onClick={onInstall}>
                {plugin.is_premium ? 'شراء وتثبيت' : 'تثبيت'}
              </Button>
            )
          )}
        </div>
      </div>
    </Card>
  )
}
