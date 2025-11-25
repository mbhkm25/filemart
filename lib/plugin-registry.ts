// Plugin Registry
// Manages plugin registration and caching

import type { ComponentType } from 'react'
import type {
  PluginManifest,
  PluginRegistryEntry,
} from '@/types/plugin'

/**
 * Plugin Registry
 * Singleton registry for managing plugin metadata and loaded components
 */
class PluginRegistry {
  private plugins: Map<string, PluginRegistryEntry> = new Map()
  private componentCache: Map<string, ComponentType<any>> = new Map()

  /**
   * Register a plugin in the registry
   */
  registerPlugin(pluginKey: string, manifest: PluginManifest): void {
    this.plugins.set(pluginKey, {
      pluginKey,
      manifest,
      loaded: false,
    })
  }

  /**
   * Get plugin from registry
   */
  getPlugin(pluginKey: string): PluginRegistryEntry | undefined {
    return this.plugins.get(pluginKey)
  }

  /**
   * Check if plugin is registered
   */
  isRegistered(pluginKey: string): boolean {
    return this.plugins.has(pluginKey)
  }

  /**
   * Cache a loaded component
   */
  cacheComponent(
    pluginKey: string,
    component: ComponentType<any>
  ): void {
    this.componentCache.set(pluginKey, component)
    
    const entry = this.plugins.get(pluginKey)
    if (entry) {
      entry.component = component
      entry.loaded = true
      entry.lastLoaded = new Date()
    }
  }

  /**
   * Get cached component
   */
  getCachedComponent(pluginKey: string): ComponentType<any> | undefined {
    return this.componentCache.get(pluginKey)
  }

  /**
   * Check if component is cached
   */
  isComponentCached(pluginKey: string): boolean {
    return this.componentCache.has(pluginKey)
  }

  /**
   * Mark plugin as having an error
   */
  markError(pluginKey: string, error: Error): void {
    const entry = this.plugins.get(pluginKey)
    if (entry) {
      entry.error = error
      entry.loaded = false
    }
  }

  /**
   * Clear plugin cache
   */
  clearCache(pluginKey?: string): void {
    if (pluginKey) {
      this.componentCache.delete(pluginKey)
      const entry = this.plugins.get(pluginKey)
      if (entry) {
        entry.component = undefined
        entry.loaded = false
        entry.error = undefined
      }
    } else {
      this.componentCache.clear()
      this.plugins.forEach((entry) => {
        entry.component = undefined
        entry.loaded = false
        entry.error = undefined
      })
    }
  }

  /**
   * Get all registered plugins
   */
  getAllPlugins(): PluginRegistryEntry[] {
    return Array.from(this.plugins.values())
  }

  /**
   * Remove plugin from registry
   */
  unregisterPlugin(pluginKey: string): void {
    this.plugins.delete(pluginKey)
    this.componentCache.delete(pluginKey)
  }
}

// Singleton instance
export const pluginRegistry = new PluginRegistry()

