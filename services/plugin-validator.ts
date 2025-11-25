// Plugin Validator Service
// Validates plugin manifests, schemas, and structure

import { pluginManifestSchema } from '@/lib/validations'
import type { PluginManifest, PluginConfig } from '@/types/plugin'
import { isValidPluginKey } from '@/lib/plugin-utils'

/**
 * Plugin Validator
 * Validates plugin manifests, config schemas, and plugin structure
 */
export class PluginValidator {
  /**
   * Validate plugin manifest
   */
  validateManifest(manifest: unknown): {
    valid: boolean
    manifest?: PluginManifest
    errors?: string[]
  } {
    try {
      const result = pluginManifestSchema.safeParse(manifest)
      
      if (!result.success) {
        return {
          valid: false,
          errors: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
        }
      }

      // Additional validation
      const errors: string[] = []

      // Validate plugin key format
      if (!isValidPluginKey(result.data.plugin_key)) {
        errors.push('plugin_key must be lowercase alphanumeric with underscores/hyphens')
      }

      // Validate version format
      if (!/^\d+\.\d+\.\d+$/.test(result.data.version)) {
        errors.push('version must be in format x.y.z')
      }

      // Validate that at least one entry point exists
      const hasEntryPoint =
        result.data.public_widget_path ||
        result.data.dashboard_settings_path ||
        result.data.backend_handler_path

      if (!hasEntryPoint) {
        errors.push('Plugin must have at least one entry point (widget, settings, or handler)')
      }

      // Validate type matches entry points
      if (result.data.type === 'widget' && !result.data.public_widget_path) {
        errors.push('Widget type plugin must have public_widget_path')
      }

      if (result.data.type === 'dashboard_module' && !result.data.dashboard_settings_path) {
        errors.push('Dashboard module type plugin must have dashboard_settings_path')
      }

      if (result.data.type === 'backend_handler' && !result.data.backend_handler_path) {
        errors.push('Backend handler type plugin must have backend_handler_path')
      }

      if (errors.length > 0) {
        return {
          valid: false,
          errors,
        }
      }

      return {
        valid: true,
        manifest: result.data as PluginManifest,
      }
    } catch (error) {
      return {
        valid: false,
        errors: [`Validation error: ${(error as Error).message}`],
      }
    }
  }

  /**
   * Validate config against schema
   */
  validateConfigSchema(
    config: PluginConfig,
    schema: Record<string, any>
  ): {
    valid: boolean
    errors?: string[]
  } {
    if (!schema || !schema.properties) {
      // No schema defined, allow any config
      return { valid: true }
    }

    const errors: string[] = []

    // Basic validation against JSON Schema properties
    for (const [key, prop] of Object.entries(schema.properties)) {
      const value = config[key]
      const property = prop as any

      // Check required fields
      if (schema.required?.includes(key) && (value === undefined || value === null)) {
        errors.push(`Required field missing: ${key}`)
        continue
      }

      // Skip if value is not provided and not required
      if (value === undefined || value === null) {
        continue
      }

      // Type validation
      if (property.type) {
        const typeMatch = this.validateType(value, property.type, property)
        if (!typeMatch.valid) {
          errors.push(`${key}: ${typeMatch.error}`)
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    }
  }

  /**
   * Validate value type
   */
  private validateType(
    value: any,
    expectedType: string,
    property: any
  ): { valid: boolean; error?: string } {
    switch (expectedType) {
      case 'string':
        if (typeof value !== 'string') {
          return { valid: false, error: 'must be a string' }
        }
        if (property.minLength && value.length < property.minLength) {
          return { valid: false, error: `must be at least ${property.minLength} characters` }
        }
        if (property.maxLength && value.length > property.maxLength) {
          return { valid: false, error: `must be at most ${property.maxLength} characters` }
        }
        break

      case 'number':
        if (typeof value !== 'number') {
          return { valid: false, error: 'must be a number' }
        }
        if (property.minimum !== undefined && value < property.minimum) {
          return { valid: false, error: `must be at least ${property.minimum}` }
        }
        if (property.maximum !== undefined && value > property.maximum) {
          return { valid: false, error: `must be at most ${property.maximum}` }
        }
        break

      case 'boolean':
        if (typeof value !== 'boolean') {
          return { valid: false, error: 'must be a boolean' }
        }
        break

      case 'array':
        if (!Array.isArray(value)) {
          return { valid: false, error: 'must be an array' }
        }
        if (property.minItems && value.length < property.minItems) {
          return { valid: false, error: `must have at least ${property.minItems} items` }
        }
        if (property.maxItems && value.length > property.maxItems) {
          return { valid: false, error: `must have at most ${property.maxItems} items` }
        }
        break

      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          return { valid: false, error: 'must be an object' }
        }
        break

      default:
        return { valid: true }
    }

    return { valid: true }
  }

  /**
   * Validate plugin structure
   * Checks if plugin files exist (in production, this would check filesystem)
   */
  async validatePluginStructure(
    pluginKey: string,
    manifest: PluginManifest
  ): Promise<{
    valid: boolean
    errors?: string[]
  }> {
    const errors: string[] = []

    // Check required files based on type
    if (manifest.public_widget_path) {
      // In production, check if file exists
      // For now, we'll just validate the path format
      if (!manifest.public_widget_path.endsWith('.tsx') && !manifest.public_widget_path.endsWith('.ts')) {
        errors.push('public_widget_path must point to a .tsx or .ts file')
      }
    }

    if (manifest.dashboard_settings_path) {
      if (!manifest.dashboard_settings_path.endsWith('.tsx') && !manifest.dashboard_settings_path.endsWith('.ts')) {
        errors.push('dashboard_settings_path must point to a .tsx or .ts file')
      }
    }

    if (manifest.backend_handler_path) {
      if (!manifest.backend_handler_path.endsWith('.ts') && !manifest.backend_handler_path.endsWith('.js')) {
        errors.push('backend_handler_path must point to a .ts or .js file')
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    }
  }
}

// Singleton instance
export const pluginValidator = new PluginValidator()

