// Plugin Manager Service
// Manages plugin lifecycle: install, activate, deactivate, uninstall

import { query, queryOne, transaction } from '@/lib/db'
import { pluginValidator } from './plugin-validator'
import { pluginRegistry } from '@/lib/plugin-registry'
import { pluginSandbox } from '@/lib/plugin-sandbox'
import type {
  Plugin,
  InstalledPlugin,
  PluginSettings,
  BusinessProfile,
} from '@/types/database'
import type {
  PluginManifest,
  PluginContext,
  InstalledPluginInfo,
} from '@/types/plugin'
import { sanitizePluginConfig } from '@/lib/plugin-utils'

/**
 * Plugin Manager
 * Handles plugin lifecycle operations
 */
export class PluginManager {
  /**
   * Install a plugin for a merchant
   * Follows DFD Section 6: Plugin Installation Flow
   */
  async installPlugin(
    pluginKey: string,
    merchantId: string
  ): Promise<InstalledPluginInfo> {
    return await transaction(async (client) => {
      // 1. Validate plugin exists and is active
      const plugin = await queryOne<Plugin>(
        `SELECT * FROM plugins WHERE plugin_key = $1 AND is_active = true`,
        [pluginKey]
      )

      if (!plugin) {
        throw new Error('الإضافة غير موجودة أو غير نشطة')
      }

      // 2. Get merchant's business profile
      const profile = await queryOne<BusinessProfile>(
        `SELECT id FROM business_profiles WHERE merchant_id = $1`,
        [merchantId]
      )

      if (!profile) {
        throw new Error('الملف التجاري غير موجود')
      }

      // 3. Check if already installed
      const existing = await queryOne<InstalledPlugin>(
        `SELECT * FROM installed_plugins 
         WHERE merchant_id = $1 AND plugin_id = $2`,
        [merchantId, plugin.id]
      )

      if (existing) {
        throw new Error('الإضافة مثبتة بالفعل')
      }

      // 4. Validate manifest
      const manifest = plugin.manifest as PluginManifest
      const validation = pluginValidator.validateManifest(manifest)

      if (!validation.valid) {
        throw new Error(`Manifest validation failed: ${validation.errors?.join(', ')}`)
      }

      // 5. Register plugin in registry
      pluginRegistry.registerPlugin(pluginKey, manifest)

      // 6. Create installation record
      const installed = await queryOne<InstalledPlugin>(
        `INSERT INTO installed_plugins 
         (merchant_id, plugin_id, is_active, installed_version)
         VALUES ($1, $2, true, $3)
         RETURNING *`,
        [merchantId, plugin.id, plugin.version]
      )

      if (!installed) {
        throw new Error('فشل في إنشاء سجل التثبيت')
      }

      // 7. Create default settings
      const defaultSettings = sanitizePluginConfig({})
      await query(
        `INSERT INTO plugin_settings (installed_plugin_id, settings_json)
         VALUES ($1, $2)`,
        [installed.id, JSON.stringify(defaultSettings)]
      )

      // 8. Run initialization hook if exists
      if (manifest.hooks?.onInit) {
        try {
          const context: PluginContext = {
            merchantId,
            businessId: installed.business_id || profile.id,
            profileId: profile.id,
            installationId: installed.id,
            pluginKey,
            config: defaultSettings,
          }

          await this.runLifecycleHook(pluginKey, 'onInit', context)
        } catch (error) {
          // Log error but don't fail installation
          console.error(`Plugin ${pluginKey} init hook failed:`, error)
        }
      }

      // 9. Run install hook if exists
      if (manifest.hooks?.onInstall) {
        try {
          const context: PluginContext = {
            merchantId,
            businessId: installed.business_id || profile.id,
            profileId: profile.id,
            installationId: installed.id,
            pluginKey,
            config: defaultSettings,
          }

          await this.runLifecycleHook(pluginKey, 'onInstall', context)
        } catch (error) {
          // Log error but don't fail installation
          console.error(`Plugin ${pluginKey} install hook failed:`, error)
        }
      }

      return {
        id: installed.id,
        merchantId: installed.merchant_id,
        businessId: installed.business_id || profile.id, // Use business_id if available, fallback to profile.id
        pluginId: installed.plugin_id,
        pluginKey,
        isActive: installed.is_active,
        installedVersion: installed.installed_version,
        installedAt: installed.installed_at,
        updatedAt: installed.updated_at,
        settings: defaultSettings,
      }
    })
  }

  /**
   * Uninstall a plugin
   */
  async uninstallPlugin(installationId: string, merchantId: string): Promise<void> {
    return await transaction(async (client) => {
      // 1. Get installation
      const installed = await queryOne<InstalledPlugin>(
        `SELECT ip.*, p.plugin_key, p.manifest
         FROM installed_plugins ip
         JOIN plugins p ON ip.plugin_id = p.id
         WHERE ip.id = $1 AND ip.merchant_id = $2`,
        [installationId, merchantId]
      )

      if (!installed) {
        throw new Error('الإضافة غير موجودة')
      }

      const plugin = await queryOne<Plugin>(
        `SELECT * FROM plugins WHERE id = $1`,
        [installed.plugin_id]
      )

      if (!plugin) {
        throw new Error('الإضافة غير موجودة')
      }

      const manifest = plugin.manifest as PluginManifest

      // 2. Run uninstall hook if exists
      if (manifest.hooks?.onUninstall) {
        try {
          const settings = await queryOne<PluginSettings>(
            `SELECT settings_json FROM plugin_settings 
             WHERE installed_plugin_id = $1`,
            [installationId]
          )

          // Get business_id from installation if available
          const businessId = installed.business_id || ''
          const context: PluginContext = {
            merchantId,
            businessId,
            profileId: businessId || '', // Will be set if needed
            installationId,
            pluginKey: plugin.plugin_key,
            config: (settings?.settings_json as Record<string, any>) || {},
          }

          await this.runLifecycleHook(plugin.plugin_key, 'onUninstall', context)
        } catch (error) {
          console.error(`Plugin ${plugin.plugin_key} uninstall hook failed:`, error)
        }
      }

      // 3. Delete settings
      await query(
        `DELETE FROM plugin_settings WHERE installed_plugin_id = $1`,
        [installationId]
      )

      // 4. Delete installation
      await query(
        `DELETE FROM installed_plugins WHERE id = $1`,
        [installationId]
      )

      // 5. Clear from registry
      pluginRegistry.clearCache(plugin.plugin_key)
    })
  }

  /**
   * Activate a plugin
   */
  async activatePlugin(installationId: string, merchantId: string): Promise<void> {
    return await transaction(async (client) => {
      // 1. Get installation
      const installed = await queryOne<InstalledPlugin>(
        `SELECT ip.*, p.plugin_key, p.manifest
         FROM installed_plugins ip
         JOIN plugins p ON ip.plugin_id = p.id
         WHERE ip.id = $1 AND ip.merchant_id = $2`,
        [installationId, merchantId]
      )

      if (!installed) {
        throw new Error('الإضافة غير موجودة')
      }

      if (installed.is_active) {
        return // Already active
      }

      // 2. Update status
      await query(
        `UPDATE installed_plugins 
         SET is_active = true, updated_at = NOW()
         WHERE id = $1`,
        [installationId]
      )

      // 3. Run activate hook if exists
      const plugin = await queryOne<Plugin>(
        `SELECT * FROM plugins WHERE id = $1`,
        [installed.plugin_id]
      )

      if (plugin) {
        const manifest = plugin.manifest as PluginManifest

        if (manifest.hooks?.onActivate) {
          try {
            const settings = await queryOne<PluginSettings>(
              `SELECT settings_json FROM plugin_settings 
               WHERE installed_plugin_id = $1`,
              [installationId]
            )

            const profile = await queryOne<BusinessProfile>(
              `SELECT id FROM business_profiles WHERE merchant_id = $1`,
              [merchantId]
            )

            const businessId = installed.business_id || profile?.id || ''
            const context: PluginContext = {
              merchantId,
              businessId,
              profileId: profile?.id || '',
              installationId,
              pluginKey: plugin.plugin_key,
              config: (settings?.settings_json as Record<string, any>) || {},
            }

            await this.runLifecycleHook(plugin.plugin_key, 'onActivate', context)
          } catch (error) {
            console.error(`Plugin ${plugin.plugin_key} activate hook failed:`, error)
          }
        }
      }
    })
  }

  /**
   * Deactivate a plugin
   */
  async deactivatePlugin(installationId: string, merchantId: string): Promise<void> {
    return await transaction(async (client) => {
      // 1. Get installation
      const installed = await queryOne<InstalledPlugin>(
        `SELECT ip.*, p.plugin_key, p.manifest
         FROM installed_plugins ip
         JOIN plugins p ON ip.plugin_id = p.id
         WHERE ip.id = $1 AND ip.merchant_id = $2`,
        [installationId, merchantId]
      )

      if (!installed) {
        throw new Error('الإضافة غير موجودة')
      }

      if (!installed.is_active) {
        return // Already inactive
      }

      // 2. Run deactivate hook if exists
      const plugin = await queryOne<Plugin>(
        `SELECT * FROM plugins WHERE id = $1`,
        [installed.plugin_id]
      )

      if (plugin) {
        const manifest = plugin.manifest as PluginManifest

        if (manifest.hooks?.onDeactivate) {
          try {
            const settings = await queryOne<PluginSettings>(
              `SELECT settings_json FROM plugin_settings 
               WHERE installed_plugin_id = $1`,
              [installationId]
            )

            const profile = await queryOne<BusinessProfile>(
              `SELECT id FROM business_profiles WHERE merchant_id = $1`,
              [merchantId]
            )

            const businessId = installed.business_id || profile?.id || ''
            const context: PluginContext = {
              merchantId,
              businessId,
              profileId: profile?.id || '',
              installationId,
              pluginKey: plugin.plugin_key,
              config: (settings?.settings_json as Record<string, any>) || {},
            }

            await this.runLifecycleHook(plugin.plugin_key, 'onDeactivate', context)
          } catch (error) {
            console.error(`Plugin ${plugin.plugin_key} deactivate hook failed:`, error)
          }
        }
      }

      // 3. Update status
      await query(
        `UPDATE installed_plugins 
         SET is_active = false, updated_at = NOW()
         WHERE id = $1`,
        [installationId]
      )
    })
  }

  /**
   * Run plugin lifecycle hook
   */
  private async runLifecycleHook(
    pluginKey: string,
    hookName: 'onInstall' | 'onUninstall' | 'onActivate' | 'onDeactivate' | 'onInit',
    context: PluginContext
  ): Promise<void> {
    const entry = pluginRegistry.getPlugin(pluginKey)
    if (!entry) {
      throw new Error(`Plugin ${pluginKey} not found in registry`)
    }

    const hookPath = entry.manifest.hooks?.[hookName]
    if (!hookPath) {
      return // Hook not defined
    }

    // In production, this would dynamically load and execute the hook
    // For now, we'll just validate that the hook path exists
    // The actual execution would be handled by the plugin loader

    // Create safe API client
    context.api = pluginSandbox.createSafeAPIClient(context)

    // Execute hook in sandbox
    await pluginSandbox.executeInSandbox(async () => {
      // Hook execution would happen here
      // This is a placeholder - actual implementation would load the hook module
      console.log(`Executing ${hookName} hook for plugin ${pluginKey}`)
    }, context)
  }

  /**
   * Get installed plugins for a merchant
   * @deprecated Use getInstalledPluginsForBusiness instead
   */
  async getInstalledPlugins(merchantId: string): Promise<InstalledPluginInfo[]> {
    const installed = await query<InstalledPlugin & { plugin_key: string; settings_json: any }>(
      `SELECT ip.*, p.plugin_key, ps.settings_json
       FROM installed_plugins ip
       JOIN plugins p ON ip.plugin_id = p.id
       LEFT JOIN plugin_settings ps ON ps.installed_plugin_id = ip.id
       WHERE ip.merchant_id = $1
       ORDER BY ip.installed_at DESC`,
      [merchantId]
    )

    return installed.map((ip) => ({
      id: ip.id,
      merchantId: ip.merchant_id,
      businessId: ip.business_id || '', // Fallback for backward compatibility
      pluginId: ip.plugin_id,
      pluginKey: ip.plugin_key,
      isActive: ip.is_active,
      installedVersion: ip.installed_version,
      installedAt: ip.installed_at,
      updatedAt: ip.updated_at,
      settings: (ip.settings_json as Record<string, any>) || {},
    }))
  }

  /**
   * Get installed plugins for a business
   */
  async getInstalledPluginsForBusiness(businessId: string): Promise<InstalledPluginInfo[]> {
    const installed = await query<InstalledPlugin & { plugin_key: string; settings_json: any }>(
      `SELECT ip.*, p.plugin_key, ps.settings_json
       FROM installed_plugins ip
       JOIN plugins p ON ip.plugin_id = p.id
       LEFT JOIN plugin_settings ps ON ps.installed_plugin_id = ip.id
       WHERE ip.business_id = $1
       ORDER BY ip.installed_at DESC`,
      [businessId]
    )

    return installed.map((ip) => ({
      id: ip.id,
      merchantId: ip.merchant_id,
      businessId: businessId,
      pluginId: ip.plugin_id,
      pluginKey: ip.plugin_key,
      isActive: ip.is_active,
      installedVersion: ip.installed_version,
      installedAt: ip.installed_at,
      updatedAt: ip.updated_at,
      settings: (ip.settings_json as Record<string, any>) || {},
    }))
  }

  /**
   * Install plugin for a business
   */
  async installPluginForBusiness(
    pluginKey: string,
    businessId: string,
    userId: string
  ): Promise<InstalledPluginInfo> {
    return await transaction(async (client) => {
      // 1. Validate plugin exists
      const plugin = await queryOne<Plugin>(
        `SELECT * FROM plugins WHERE plugin_key = $1 AND is_active = true`,
        [pluginKey]
      )

      if (!plugin) {
        throw new Error('الإضافة غير موجودة أو غير نشطة')
      }

      // 2. Verify business exists and user owns it
      const business = await queryOne<BusinessProfile>(
        `SELECT id, merchant_id FROM business_profiles WHERE id = $1 AND merchant_id = $2`,
        [businessId, userId]
      )

      if (!business) {
        throw new Error('الملف التجاري غير موجود أو ليس لديك الصلاحية')
      }

      // 3. Check if already installed for this business
      const existing = await queryOne<InstalledPlugin>(
        `SELECT * FROM installed_plugins 
         WHERE business_id = $1 AND plugin_id = $2`,
        [businessId, plugin.id]
      )

      if (existing) {
        throw new Error('الإضافة مثبتة بالفعل')
      }

      // 4. Validate manifest
      const manifest = plugin.manifest as PluginManifest
      const validation = pluginValidator.validateManifest(manifest)

      if (!validation.valid) {
        throw new Error(`Manifest validation failed: ${validation.errors?.join(', ')}`)
      }

      // 5. Register plugin
      pluginRegistry.registerPlugin(pluginKey, manifest)

      // 6. Create installation record with business_id
      const installed = await queryOne<InstalledPlugin>(
        `INSERT INTO installed_plugins 
         (merchant_id, business_id, plugin_id, is_active, installed_version)
         VALUES ($1, $2, $3, true, $4)
         RETURNING *`,
        [userId, businessId, plugin.id, plugin.version]
      )

      if (!installed) {
        throw new Error('فشل في إنشاء سجل التثبيت')
      }

      // 7. Create default settings
      const defaultSettings = sanitizePluginConfig({})
      await query(
        `INSERT INTO plugin_settings (installed_plugin_id, settings_json)
         VALUES ($1, $2)`,
        [installed.id, JSON.stringify(defaultSettings)]
      )

      // 8. Run hooks
      if (manifest.hooks?.onInit) {
        try {
          const context: PluginContext = {
            merchantId: userId,
            businessId,
            profileId: businessId,
            installationId: installed.id,
            pluginKey,
            config: defaultSettings,
          }
          await this.runLifecycleHook(pluginKey, 'onInit', context)
        } catch (error) {
          console.error(`Plugin ${pluginKey} init hook failed:`, error)
        }
      }

      if (manifest.hooks?.onInstall) {
        try {
          const context: PluginContext = {
            merchantId: userId,
            businessId,
            profileId: businessId,
            installationId: installed.id,
            pluginKey,
            config: defaultSettings,
          }
          await this.runLifecycleHook(pluginKey, 'onInstall', context)
        } catch (error) {
          console.error(`Plugin ${pluginKey} install hook failed:`, error)
        }
      }

      return {
        id: installed.id,
        merchantId: userId,
        businessId,
        pluginId: installed.plugin_id,
        pluginKey,
        isActive: installed.is_active,
        installedVersion: installed.installed_version,
        installedAt: installed.installed_at,
        updatedAt: installed.updated_at,
        settings: defaultSettings,
      }
    })
  }

  /**
   * Uninstall plugin for a business
   */
  async uninstallPluginForBusiness(
    installationId: string,
    businessId: string,
    userId: string
  ): Promise<void> {
    return await transaction(async (client) => {
      const installed = await queryOne<InstalledPlugin & { plugin_key: string }>(
        `SELECT ip.*, p.plugin_key, p.manifest
         FROM installed_plugins ip
         JOIN plugins p ON ip.plugin_id = p.id
         WHERE ip.id = $1 AND ip.business_id = $2`,
        [installationId, businessId]
      )

      if (!installed) {
        throw new Error('الإضافة غير موجودة')
      }

      const plugin = await queryOne<Plugin>(
        `SELECT * FROM plugins WHERE id = $1`,
        [installed.plugin_id]
      )

      if (!plugin) {
        throw new Error('الإضافة غير موجودة')
      }

      const manifest = plugin.manifest as PluginManifest

      // Run uninstall hook
      if (manifest.hooks?.onUninstall) {
        try {
          const settings = await queryOne<PluginSettings>(
            `SELECT settings_json FROM plugin_settings 
             WHERE installed_plugin_id = $1`,
            [installationId]
          )

          const context: PluginContext = {
            merchantId: userId,
            businessId,
            profileId: businessId,
            installationId,
            pluginKey: plugin.plugin_key,
            config: (settings?.settings_json as Record<string, any>) || {},
          }

          await this.runLifecycleHook(plugin.plugin_key, 'onUninstall', context)
        } catch (error) {
          console.error(`Plugin ${plugin.plugin_key} uninstall hook failed:`, error)
        }
      }

      // Delete settings
      await query(
        `DELETE FROM plugin_settings WHERE installed_plugin_id = $1`,
        [installationId]
      )

      // Delete installation
      await query(
        `DELETE FROM installed_plugins WHERE id = $1`,
        [installationId]
      )

      // Clear from registry
      pluginRegistry.clearCache(plugin.plugin_key)
    })
  }

  /**
   * Activate plugin for a business
   */
  async activatePluginForBusiness(
    installationId: string,
    businessId: string,
    userId: string
  ): Promise<void> {
    return await transaction(async (client) => {
      const installed = await queryOne<InstalledPlugin & { plugin_key: string }>(
        `SELECT ip.*, p.plugin_key, p.manifest
         FROM installed_plugins ip
         JOIN plugins p ON ip.plugin_id = p.id
         WHERE ip.id = $1 AND ip.business_id = $2`,
        [installationId, businessId]
      )

      if (!installed) {
        throw new Error('الإضافة غير موجودة')
      }

      if (installed.is_active) {
        return // Already active
      }

      await query(
        `UPDATE installed_plugins 
         SET is_active = true, updated_at = NOW()
         WHERE id = $1`,
        [installationId]
      )

      const plugin = await queryOne<Plugin>(
        `SELECT * FROM plugins WHERE id = $1`,
        [installed.plugin_id]
      )

      if (plugin) {
        const manifest = plugin.manifest as PluginManifest

        if (manifest.hooks?.onActivate) {
          try {
            const settings = await queryOne<PluginSettings>(
              `SELECT settings_json FROM plugin_settings 
               WHERE installed_plugin_id = $1`,
              [installationId]
            )

            const context: PluginContext = {
              merchantId: userId,
              businessId,
              profileId: businessId,
              installationId,
              pluginKey: plugin.plugin_key,
              config: (settings?.settings_json as Record<string, any>) || {},
            }

            await this.runLifecycleHook(plugin.plugin_key, 'onActivate', context)
          } catch (error) {
            console.error(`Plugin ${plugin.plugin_key} activate hook failed:`, error)
          }
        }
      }
    })
  }

  /**
   * Deactivate plugin for a business
   */
  async deactivatePluginForBusiness(
    installationId: string,
    businessId: string,
    userId: string
  ): Promise<void> {
    return await transaction(async (client) => {
      const installed = await queryOne<InstalledPlugin & { plugin_key: string }>(
        `SELECT ip.*, p.plugin_key, p.manifest
         FROM installed_plugins ip
         JOIN plugins p ON ip.plugin_id = p.id
         WHERE ip.id = $1 AND ip.business_id = $2`,
        [installationId, businessId]
      )

      if (!installed) {
        throw new Error('الإضافة غير موجودة')
      }

      if (!installed.is_active) {
        return // Already inactive
      }

      const plugin = await queryOne<Plugin>(
        `SELECT * FROM plugins WHERE id = $1`,
        [installed.plugin_id]
      )

      if (plugin) {
        const manifest = plugin.manifest as PluginManifest

        if (manifest.hooks?.onDeactivate) {
          try {
            const settings = await queryOne<PluginSettings>(
              `SELECT settings_json FROM plugin_settings 
               WHERE installed_plugin_id = $1`,
              [installationId]
            )

            const context: PluginContext = {
              merchantId: userId,
              businessId,
              profileId: businessId,
              installationId,
              pluginKey: plugin.plugin_key,
              config: (settings?.settings_json as Record<string, any>) || {},
            }

            await this.runLifecycleHook(plugin.plugin_key, 'onDeactivate', context)
          } catch (error) {
            console.error(`Plugin ${plugin.plugin_key} deactivate hook failed:`, error)
          }
        }
      }

      await query(
        `UPDATE installed_plugins 
         SET is_active = false, updated_at = NOW()
         WHERE id = $1`,
        [installationId]
      )
    })
  }
}

// Singleton instance
export const pluginManager = new PluginManager()

