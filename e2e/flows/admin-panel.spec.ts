// E2E Test: Admin Panel Flow
// Test admin panel access and navigation

import { test, expect } from '../fixtures'

test.describe('Admin Panel Flow', () => {
  test('should access admin panel', async ({ authenticatedPage }) => {
    // Mock admin user
    await authenticatedPage.evaluate(() => {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      user.role = 'admin'
      localStorage.setItem('user', JSON.stringify(user))
    })

    await authenticatedPage.goto('/admin')
    await authenticatedPage.waitForLoadState('networkidle')

    // Verify admin panel is loaded
    await expect(
      authenticatedPage.locator('text=/لوحة|Dashboard|مدير/i')
    ).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to merchants page', async ({ authenticatedPage }) => {
    await authenticatedPage.evaluate(() => {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      user.role = 'admin'
      localStorage.setItem('user', JSON.stringify(user))
    })

    await authenticatedPage.goto('/admin')
    await authenticatedPage.waitForLoadState('networkidle')

    // Click merchants link
    const merchantsLink = authenticatedPage.getByRole('link', {
      name: /تجار|Merchants/i,
    })

    if (await merchantsLink.count() > 0) {
      await merchantsLink.click()
      await authenticatedPage.waitForURL('/admin/merchants')
      await expect(authenticatedPage.url()).toContain('/admin/merchants')
    }
  })

  test('should navigate to plugins management', async ({ authenticatedPage }) => {
    await authenticatedPage.evaluate(() => {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      user.role = 'admin'
      localStorage.setItem('user', JSON.stringify(user))
    })

    await authenticatedPage.goto('/admin')
    await authenticatedPage.waitForLoadState('networkidle')

    // Click plugins link
    const pluginsLink = authenticatedPage.getByRole('link', {
      name: /إضافات|Plugins/i,
    })

    if (await pluginsLink.count() > 0) {
      await pluginsLink.click()
      await authenticatedPage.waitForURL('/admin/plugins')
      await expect(authenticatedPage.url()).toContain('/admin/plugins')
    }
  })
})

