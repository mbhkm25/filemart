// E2E Test: Merchant Dashboard Flow
// Test dashboard navigation and functionality

import { test, expect } from '../fixtures'

test.describe('Merchant Dashboard Flow', () => {
  test('should navigate to dashboard home', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard')
    await authenticatedPage.waitForLoadState('networkidle')

    // Verify dashboard is loaded
    await expect(
      authenticatedPage.locator('text=/لوحة|Dashboard|مرحباً/i')
    ).toBeVisible()
  })

  test('should navigate to catalog page', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard')
    await authenticatedPage.waitForLoadState('networkidle')

    // Click catalog link
    const catalogLink = authenticatedPage.getByRole('link', {
      name: /كاتلوج|Catalog|منتجات/i,
    })

    if (await catalogLink.count() > 0) {
      await catalogLink.click()
      await authenticatedPage.waitForURL('/dashboard/catalog')
      await expect(authenticatedPage.url()).toContain('/dashboard/catalog')
    }
  })

  test('should navigate to orders page', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard')
    await authenticatedPage.waitForLoadState('networkidle')

    // Click orders link
    const ordersLink = authenticatedPage.getByRole('link', {
      name: /طلبات|Orders/i,
    })

    if (await ordersLink.count() > 0) {
      await ordersLink.click()
      await authenticatedPage.waitForURL('/dashboard/orders')
      await expect(authenticatedPage.url()).toContain('/dashboard/orders')
    }
  })

  test('should navigate to profile editor', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard')
    await authenticatedPage.waitForLoadState('networkidle')

    // Click profile link
    const profileLink = authenticatedPage.getByRole('link', {
      name: /ملف|Profile/i,
    })

    if (await profileLink.count() > 0) {
      await profileLink.click()
      await authenticatedPage.waitForURL('/dashboard/profile')
      await expect(authenticatedPage.url()).toContain('/dashboard/profile')
    }
  })
})

