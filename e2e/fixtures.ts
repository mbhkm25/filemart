// Playwright Test Fixtures
// Shared test utilities and helpers

import { test as base } from '@playwright/test'
import type { Page } from '@playwright/test'

// Extend base test with custom fixtures
export const test = base.extend<{
  authenticatedPage: Page
}>({
  // Authenticated page fixture
  authenticatedPage: async ({ page, baseURL }, use) => {
    // Mock authentication by setting token in localStorage
    await page.goto(baseURL || 'http://localhost:3000')
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-jwt-token')
      localStorage.setItem('user', JSON.stringify({
        id: 'merchant-1',
        email: 'merchant@example.com',
        name: 'Test Merchant',
        role: 'merchant',
      }))
    })
    await use(page)
  },
})

export { expect } from '@playwright/test'

