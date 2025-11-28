// Plugin System Type Definitions
// Based on ESS, FDFD, and FAM specifications

import type { PluginType } from './database'

/**
 * Plugin Manifest Structure
 * Defines the metadata and structure of a plugin
 */
export interface PluginManifest {
  // Basic Information
  plugin_key: string
  name: string
  description?: string
  version: string
  author?: string
  
  // Plugin Type
  type: PluginType
  
  // Entry Points
  public_widget_path?: string
  dashboard_settings_path?: string
  backend_handler_path?: string
  
  // Configuration
  config_schema_json?: Record<string, any>
  
  // Lifecycle Hooks
  hooks?: {
    onInstall?: string
    onUninstall?: string
    onActivate?: string
    onDeactivate?: string
    onInit?: string
  }
  
  // Permissions & Requirements
  permissions?: string[]
  requirements?: {
    min_version?: string
    dependencies?: string[]
  }
  
  // Metadata
  is_premium?: boolean
  price?: number
  changelog?: string
}

/**
 * Plugin Configuration
 * User-defined settings for an installed plugin
 */
export interface PluginConfig {
  [key: string]: any
}

/**
 * Plugin Context
 * Context passed to plugin components and handlers
 */
export interface PluginContext {
  merchantId: string
  businessId: string // BIRM: business-scoped context
  profileId: string
  installationId: string
  pluginKey: string
  config: PluginConfig
  api?: {
    get: (url: string) => Promise<any>
    post: (url: string, data: any) => Promise<any>
    put: (url: string, data: any) => Promise<any>
    delete: (url: string) => Promise<any>
  }
}

/**
 * Plugin Lifecycle Hook
 * Function signature for lifecycle hooks
 */
export type PluginLifecycleHook = (context: PluginContext) => Promise<void> | void

/**
 * Plugin Component Props
 * Props passed to plugin UI components
 */
export interface PluginWidgetProps {
  config?: PluginConfig
  context?: PluginContext
}

export interface PluginSettingsProps {
  config: PluginConfig
  context: PluginContext
  onSave: (config: PluginConfig) => Promise<void>
}

import type { ComponentType } from 'react'

/**
 * Plugin Registry Entry
 * Cached plugin information
 */
export interface PluginRegistryEntry {
  pluginKey: string
  manifest: PluginManifest
  loaded: boolean
  component?: ComponentType<any>
  error?: Error
  lastLoaded?: Date
}

/**
 * Installed Plugin Info
 * Information about an installed plugin instance
 */
export interface InstalledPluginInfo {
  id: string
  merchantId: string
  businessId: string // BIRM: business-scoped installation
  pluginId: string
  pluginKey: string
  isActive: boolean
  installedVersion: string
  installedAt: Date
  updatedAt: Date
  settings: PluginConfig
}

/**
 * Plugin Loader Result
 * Result of loading a plugin component
 */
export interface PluginLoadResult {
  success: boolean
  component?: ComponentType<any>
  error?: Error
  cached?: boolean
}

