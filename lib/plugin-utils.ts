// Plugin Utility Functions
// Helper functions for plugin system

import type { PluginManifest, PluginConfig } from '@/types/plugin'
import type { PluginType } from '@/types/database'

/**
 * Get plugin file path based on type
 */
export function getPluginPath(
  pluginKey: string,
  type: 'widget' | 'settings' | 'handler',
  basePath?: string
): string {
  const base = basePath || 'plugins'
  
  switch (type) {
    case 'widget':
      return `${base}/${pluginKey}/publicWidget.tsx`
    case 'settings':
      return `${base}/${pluginKey}/dashboardSettings.tsx`
    case 'handler':
      return `${base}/${pluginKey}/backendHandler.ts`
    default:
      throw new Error(`Unknown plugin type: ${type}`)
  }
}

/**
 * Normalize plugin configuration
 * Merges defaults with user settings
 */
export function normalizePluginConfig(
  defaults: PluginConfig,
  user: PluginConfig
): PluginConfig {
  return {
    ...defaults,
    ...user,
  }
}

/**
 * Merge plugin settings
 * Deep merge of settings objects
 */
export function mergePluginSettings(
  existing: PluginConfig,
  updates: PluginConfig
): PluginConfig {
  const merged = { ...existing }
  
  for (const key in updates) {
    if (typeof updates[key] === 'object' && updates[key] !== null && !Array.isArray(updates[key])) {
      merged[key] = mergePluginSettings(
        (existing[key] as PluginConfig) || {},
        updates[key] as PluginConfig
      )
    } else {
      merged[key] = updates[key]
    }
  }
  
  return merged
}

/**
 * Validate plugin key format
 */
export function isValidPluginKey(key: string): boolean {
  // Plugin keys must be lowercase, alphanumeric with underscores/hyphens
  return /^[a-z0-9_-]+$/.test(key) && key.length >= 1 && key.length <= 100
}

/**
 * Get plugin type from manifest
 */
export function getPluginType(manifest: PluginManifest): PluginType {
  return manifest.type
}

/**
 * Check if plugin has public widget
 */
export function hasPublicWidget(manifest: PluginManifest): boolean {
  return (
    manifest.type === 'widget' ||
    manifest.type === 'mixed' ||
    !!manifest.public_widget_path
  )
}

/**
 * Check if plugin has dashboard settings
 */
export function hasDashboardSettings(manifest: PluginManifest): boolean {
  return (
    manifest.type === 'dashboard_module' ||
    manifest.type === 'mixed' ||
    !!manifest.dashboard_settings_path
  )
}

/**
 * Check if plugin has backend handler
 */
export function hasBackendHandler(manifest: PluginManifest): boolean {
  return (
    manifest.type === 'backend_handler' ||
    manifest.type === 'mixed' ||
    !!manifest.backend_handler_path
  )
}

/**
 * Sanitize plugin config for storage
 */
export function sanitizePluginConfig(config: PluginConfig): PluginConfig {
  // Remove any functions or non-serializable data
  const sanitized: PluginConfig = {}
  
  for (const key in config) {
    const value = config[key]
    if (
      value !== null &&
      value !== undefined &&
      typeof value !== 'function' &&
      typeof value !== 'symbol'
    ) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        sanitized[key] = sanitizePluginConfig(value as PluginConfig)
      } else {
        sanitized[key] = value
      }
    }
  }
  
  return sanitized
}

