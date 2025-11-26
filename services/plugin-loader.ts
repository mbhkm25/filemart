// Plugin Loader Service
// Dynamically loads plugin components (widgets, settings, handlers)

import type { ComponentType } from 'react'
import { queryOne, query } from '@/lib/db'
import { pluginRegistry } from '@/lib/plugin-registry'
import { pluginSandbox } from '@/lib/plugin-sandbox'
import { getPluginPath, hasPublicWidget, hasDashboardSettings, hasBackendHandler } from '@/lib/plugin-utils'
import type { Plugin, InstalledPlugin, PluginSettings, BusinessProfile } from '@/types/database'
import type {
  PluginManifest,
  PluginContext,
  PluginConfig,
  PluginLoadResult,
} from '@/types/plugin'

/**
 * Plugin Loader
 * Handles dynamic loading of plugin components
 */
export class PluginLoader {
  /**
   * Load public widget component
   * Used in public profile pages
   */
  async loadPublicWidget(
    pluginKey: string,
    merchantId: string,
    profileId: string,
    installationId: string
  ): Promise<PluginLoadResult> {
    try {
      // 1. Check cache
      if (pluginRegistry.isComponentCached(pluginKey)) {
        const cached = pluginRegistry.getCachedComponent(pluginKey)
        if (cached) {
          return {
            success: true,
            component: cached,
            cached: true,
          }
        }
      }

      // 2. Get plugin from database
      const plugin = await queryOne<Plugin>(
        `SELECT * FROM plugins WHERE plugin_key = $1 AND is_active = true`,
        [pluginKey]
      )

      if (!plugin) {
        throw new Error(`Plugin ${pluginKey} not found`)
      }

      // 3. Check if plugin has public widget
      const manifest = plugin.manifest as PluginManifest
      if (!hasPublicWidget(manifest)) {
        throw new Error(`Plugin ${pluginKey} does not have a public widget`)
      }

      // 4. Get installation and settings
      const installed = await queryOne<InstalledPlugin>(
        `SELECT * FROM installed_plugins 
         WHERE id = $1 AND merchant_id = $2 AND is_active = true`,
        [installationId, merchantId]
      )

      if (!installed) {
        throw new Error('Plugin installation not found or inactive')
      }

      const settings = await queryOne<PluginSettings>(
        `SELECT settings_json FROM plugin_settings 
         WHERE installed_plugin_id = $1`,
        [installationId]
      )

      const config = (settings?.settings_json as PluginConfig) || {}

      // 5. Create context
      const context: PluginContext = {
        merchantId,
        profileId,
        installationId,
        pluginKey,
        config,
        api: pluginSandbox.createSafeAPIClient({
          merchantId,
          profileId,
          installationId,
          pluginKey,
          config,
        }),
      }

      // 6. Load component dynamically
      const component = await this.loadComponent(
        pluginKey,
        'widget',
        manifest.public_widget_path || getPluginPath(pluginKey, 'widget'),
        context
      )

      // 7. Cache component
      if (component) {
        pluginRegistry.cacheComponent(pluginKey, component)
      }

      return {
        success: true,
        component,
        cached: false,
      }
    } catch (error) {
      pluginRegistry.markError(pluginKey, error as Error)
      return {
        success: false,
        error: error as Error,
      }
    }
  }

  /**
   * Load dashboard settings component
   * Used in merchant dashboard plugin settings page
   */
  async loadDashboardSettings(
    pluginKey: string,
    merchantId: string,
    profileId: string,
    installationId: string
  ): Promise<PluginLoadResult> {
    try {
      // 1. Check cache
      const cacheKey = `${pluginKey}_settings`
      if (pluginRegistry.isComponentCached(cacheKey)) {
        const cached = pluginRegistry.getCachedComponent(cacheKey)
        if (cached) {
          return {
            success: true,
            component: cached,
            cached: true,
          }
        }
      }

      // 2. Get plugin from database
      const plugin = await queryOne<Plugin>(
        `SELECT * FROM plugins WHERE plugin_key = $1 AND is_active = true`,
        [pluginKey]
      )

      if (!plugin) {
        throw new Error(`Plugin ${pluginKey} not found`)
      }

      // 3. Check if plugin has dashboard settings
      const manifest = plugin.manifest as PluginManifest
      if (!hasDashboardSettings(manifest)) {
        throw new Error(`Plugin ${pluginKey} does not have dashboard settings`)
      }

      // 4. Get installation and settings
      const installed = await queryOne<InstalledPlugin>(
        `SELECT * FROM installed_plugins 
         WHERE id = $1 AND merchant_id = $2`,
        [installationId, merchantId]
      )

      if (!installed) {
        throw new Error('Plugin installation not found')
      }

      const settings = await queryOne<PluginSettings>(
        `SELECT settings_json FROM plugin_settings 
         WHERE installed_plugin_id = $1`,
        [installationId]
      )

      const config = (settings?.settings_json as PluginConfig) || {}

      // 5. Create context
      const context: PluginContext = {
        merchantId,
        profileId,
        installationId,
        pluginKey,
        config,
        api: pluginSandbox.createSafeAPIClient({
          merchantId,
          profileId,
          installationId,
          pluginKey,
          config,
        }),
      }

      // 6. Load component dynamically
      const component = await this.loadComponent(
        pluginKey,
        'settings',
        manifest.dashboard_settings_path || getPluginPath(pluginKey, 'settings'),
        context
      )

      // 7. Cache component
      if (component) {
        pluginRegistry.cacheComponent(cacheKey, component)
      }

      return {
        success: true,
        component,
        cached: false,
      }
    } catch (error) {
      pluginRegistry.markError(pluginKey, error as Error)
      return {
        success: false,
        error: error as Error,
      }
    }
  }

  /**
   * Load backend handler
   * Used for server-side plugin logic
   */
  async loadBackendHandler(
    pluginKey: string,
    context: PluginContext
  ): Promise<any> {
    try {
      // 1. Get plugin from database
      const plugin = await queryOne<Plugin>(
        `SELECT * FROM plugins WHERE plugin_key = $1 AND is_active = true`,
        [pluginKey]
      )

      if (!plugin) {
        throw new Error(`Plugin ${pluginKey} not found`)
      }

      // 2. Check if plugin has backend handler
      const manifest = plugin.manifest as PluginManifest
      if (!hasBackendHandler(manifest)) {
        throw new Error(`Plugin ${pluginKey} does not have a backend handler`)
      }

      // 3. Load handler dynamically
      const handler = await this.loadHandlerModule(
        pluginKey,
        manifest.backend_handler_path || getPluginPath(pluginKey, 'handler'),
        context
      )

      return handler
    } catch (error) {
      throw pluginSandbox.isolatePluginError(error as Error, pluginKey)
    }
  }

  /**
   * Load component module dynamically
   * In production, this would use dynamic import()
   */
  private async loadComponent(
    pluginKey: string,
    type: 'widget' | 'settings',
    path: string,
    context: PluginContext
  ): Promise<ComponentType<any> | undefined> {
    try {
      // In production, this would be:
      // const module = await import(path)
      // return module.default || module

      // For now, we'll return a placeholder component
      // The actual implementation would load from the plugins directory
      // This is a safe fallback that prevents errors
      
        return undefined // Will be implemented when plugins are available
    } catch (error) {
      throw new Error(`Failed to load ${type} component for plugin ${pluginKey}: ${(error as Error).message}`)
    }
  }

  /**
   * Load handler module dynamically
   */
  private async loadHandlerModule(
    pluginKey: string,
    path: string,
    context: PluginContext
  ): Promise<any> {
    try {
      // In production, this would be:
      // const module = await import(path)
      // return module.default || module

      // For now, return a placeholder
        return undefined
    } catch (error) {
      throw new Error(`Failed to load handler for plugin ${pluginKey}: ${(error as Error).message}`)
    }
  }

  /**
   * Get plugin config for a specific installation
   */
  async getPluginConfig(installationId: string): Promise<PluginConfig> {
    const settings = await queryOne<PluginSettings>(
      `SELECT settings_json FROM plugin_settings 
       WHERE installed_plugin_id = $1`,
      [installationId]
    )

    return (settings?.settings_json as PluginConfig) || {}
  }

  /**
   * Get active plugins for a profile
   */
  async getActivePluginsForProfile(profileId: string): Promise<Array<{
    pluginKey: string
    installationId: string
    config: PluginConfig
  }>> {
    const installed = await queryOne<InstalledPlugin & { plugin_key: string; settings_json: any }>(
      `SELECT ip.id, ip.is_active, p.plugin_key, ps.settings_json
       FROM installed_plugins ip
       JOIN plugins p ON ip.plugin_id = p.id
       LEFT JOIN plugin_settings ps ON ps.installed_plugin_id = ip.id
       JOIN business_profiles bp ON bp.merchant_id = ip.merchant_id
       WHERE bp.id = $1 AND ip.is_active = true AND p.is_active = true`,
      [profileId]
    )

    if (!installed) {
      return []
    }

    // Handle multiple installations (should be one, but handle array)
    const allInstalled = await query<InstalledPlugin & { plugin_key: string; settings_json: any }>(
      `SELECT ip.id, ip.is_active, p.plugin_key, ps.settings_json
       FROM installed_plugins ip
       JOIN plugins p ON ip.plugin_id = p.id
       LEFT JOIN plugin_settings ps ON ps.installed_plugin_id = ip.id
       JOIN business_profiles bp ON bp.merchant_id = ip.merchant_id
       WHERE bp.id = $1 AND ip.is_active = true AND p.is_active = true`,
      [profileId]
    )

    return allInstalled.map((ip) => ({
      pluginKey: ip.plugin_key,
      installationId: ip.id,
      config: (ip.settings_json as PluginConfig) || {},
    }))
  }
}

// Singleton instance
export const pluginLoader = new PluginLoader()

