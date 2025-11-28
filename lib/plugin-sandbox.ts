// Plugin Sandbox
// Provides isolation and security for plugin execution

import type { PluginContext, PluginConfig } from '@/types/plugin'

/**
 * Plugin Sandbox
 * Isolates plugin execution and prevents unauthorized access
 */
export class PluginSandbox {
  private allowedAPIs: Set<string> = new Set([
    'get',
    'post',
    'put',
    'delete',
  ])

  /**
   * Validate plugin access to a resource
   */
  validatePluginAccess(resource: string, context: PluginContext): boolean {
    // Check if resource is allowed
    // This is a basic implementation - can be extended with permissions system
    const allowedResources = [
      '/api/merchant/products',
      '/api/merchant/orders',
      '/api/merchant/profile',
    ]

    // Check if resource starts with any allowed path
    return allowedResources.some((allowed) => resource.startsWith(allowed))
  }

  /**
   * Execute code in sandbox
   * Note: In a production environment, this should use a proper sandboxing mechanism
   * For now, we rely on Next.js module isolation
   */
  async executeInSandbox<T>(
    code: () => Promise<T> | T,
    context: PluginContext
  ): Promise<T> {
    try {
      // Validate context
      if (!context.merchantId || !context.pluginKey) {
        throw new Error('Invalid plugin context')
      }

      // Execute with error isolation
      const result = await Promise.resolve(code())
      return result
    } catch (error) {
      // Isolate plugin errors
      throw this.isolatePluginError(error as Error, context.pluginKey)
    }
  }

  /**
   * Isolate plugin error
   * Prevents plugin errors from exposing system internals
   */
  isolatePluginError(error: Error, pluginKey: string): Error {
    // Create a sanitized error that doesn't expose system details
    const sanitized = new Error(
      `Plugin ${pluginKey} error: ${error.message}`
    )
    
    // Preserve error type if it's a known error
    if (error.name === 'ValidationError') {
      sanitized.name = 'ValidationError'
    }
    
    return sanitized
  }

  /**
   * Create safe API client for plugin
   */
  createSafeAPIClient(context: PluginContext | { merchantId: string; businessId?: string; profileId: string; installationId: string; pluginKey: string; config: any }) {
    // Ensure businessId is present (use profileId as fallback for backward compatibility)
    const fullContext: PluginContext = {
      merchantId: context.merchantId,
      businessId: (context as any).businessId || context.profileId,
      profileId: context.profileId,
      installationId: context.installationId,
      pluginKey: context.pluginKey,
      config: context.config,
    }
    
    return {
      get: async (url: string) => {
        if (!this.validatePluginAccess(url, fullContext)) {
          throw new Error(`Plugin not allowed to access: ${url}`)
        }
        // In production, this would make actual API calls
        // For now, return a promise that resolves
        return fetch(url).then((res) => res.json())
      },
      post: async (url: string, data: any) => {
        if (!this.validatePluginAccess(url, fullContext)) {
          throw new Error(`Plugin not allowed to access: ${url}`)
        }
        return fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).then((res) => res.json())
      },
      put: async (url: string, data: any) => {
        if (!this.validatePluginAccess(url, fullContext)) {
          throw new Error(`Plugin not allowed to access: ${url}`)
        }
        return fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).then((res) => res.json())
      },
      delete: async (url: string) => {
        if (!this.validatePluginAccess(url, fullContext)) {
          throw new Error(`Plugin not allowed to access: ${url}`)
        }
        return fetch(url, {
          method: 'DELETE',
        }).then((res) => res.json())
      },
    }
  }
}

// Singleton instance
export const pluginSandbox = new PluginSandbox()

