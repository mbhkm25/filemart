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
      const defaultSettings = sanitizePluginConfig({}, {})
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

          const context: PluginContext = {
            merchantId,
            profileId: '', // Will be set if needed
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

            const context: PluginContext = {
              merchantId,
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

            const context: PluginContext = {
              merchantId,
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
      pluginId: ip.plugin_id,
      pluginKey: ip.plugin_key,
      isActive: ip.is_active,
      installedVersion: ip.installed_version,
      installedAt: ip.installed_at,
      updatedAt: ip.updated_at,
      settings: (ip.settings_json as Record<string, any>) || {},
    }))
  }
}

// Singleton instance
export const pluginManager = new PluginManager()

