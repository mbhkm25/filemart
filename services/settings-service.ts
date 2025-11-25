// Settings Service
// Manages system settings stored in database

import { queryOne, query } from '@/lib/db'

export interface SystemSetting {
  id: string
  key: string
  value: Record<string, any>
  description: string | null
  updated_at: Date
  updated_by: string | null
}

// In-memory cache for settings
const settingsCache = new Map<string, { value: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Get a setting by key
 */
export async function getSetting(key: string): Promise<any> {
  // Check cache first
  const cached = settingsCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.value
  }

  // Fetch from database
  const setting = await queryOne<SystemSetting>(
    `SELECT * FROM system_settings WHERE key = $1`,
    [key]
  )

  if (!setting) {
    return null
  }

  // Update cache
  settingsCache.set(key, {
    value: setting.value,
    timestamp: Date.now(),
  })

  return setting.value
}

/**
 * Set a setting
 */
export async function setSetting(
  key: string,
  value: any,
  description?: string,
  updatedBy?: string
): Promise<void> {
  const setting = await queryOne<SystemSetting>(
    `SELECT id FROM system_settings WHERE key = $1`,
    [key]
  )

  if (setting) {
    // Update existing
    await query(
      `UPDATE system_settings 
       SET value = $1, description = COALESCE($2, description), updated_by = $3, updated_at = NOW()
       WHERE key = $4`,
      [JSON.stringify(value), description || null, updatedBy || null, key]
    )
  } else {
    // Insert new
    await query(
      `INSERT INTO system_settings (key, value, description, updated_by)
       VALUES ($1, $2, $3, $4)`,
      [key, JSON.stringify(value), description || null, updatedBy || null]
    )
  }

  // Invalidate cache
  settingsCache.delete(key)
}

/**
 * Get all settings
 */
export async function getAllSettings(): Promise<Record<string, any>> {
  const settings = await query<SystemSetting>(
    `SELECT * FROM system_settings ORDER BY key ASC`
  )

  const result: Record<string, any> = {}
  settings.forEach((setting) => {
    result[setting.key] = setting.value
    // Update cache
    settingsCache.set(setting.key, {
      value: setting.value,
      timestamp: Date.now(),
    })
  })

  return result
}

/**
 * Delete a setting
 */
export async function deleteSetting(key: string): Promise<void> {
  await query(`DELETE FROM system_settings WHERE key = $1`, [key])
  // Invalidate cache
  settingsCache.delete(key)
}

/**
 * Clear settings cache
 */
export function clearSettingsCache(): void {
  settingsCache.clear()
}

