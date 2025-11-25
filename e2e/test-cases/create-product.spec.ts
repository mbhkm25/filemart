// E2E Test: Create Product
// Test 1 from FAM Section 7
// Steps: Go to Catalog → Add new product → Save
// Expected: Product appears in list and in public profile

import { test, expect } from '../fixtures'

test.describe('Create Product', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // Navigate to dashboard catalog
    await authenticatedPage.goto('/dashboard/catalog')
    await authenticatedPage.waitForLoadState('networkidle')
  })

  test('should create a new product and display it in catalog', async ({
    authenticatedPage,
  }) => {
    // Click "Add Product" button
    const addButton = authenticatedPage.getByRole('button', {
      name: /إضافة|جديد|Add/i,
    })
    await expect(addButton.first()).toBeVisible()
    await addButton.first().click()

    // Wait for product form to appear
    await authenticatedPage.waitForURL(/\/dashboard\/catalog\/.*/, {
      timeout: 5000,
    })

    // Fill product form
    await authenticatedPage.fill('input[name="name"]', 'Test Product E2E')
    await authenticatedPage.fill(
      'textarea[name="description"]',
      'Test product description for E2E testing'
    )
    await authenticatedPage.fill('input[name="price"]', '150')
    await authenticatedPage.fill('input[name="category"]', 'Test Category')

    // Save product
    const saveButton = authenticatedPage.getByRole('button', {
      name: /حفظ|Save/i,
    })
    await saveButton.click()

    // Wait for redirect to catalog list
    await authenticatedPage.waitForURL('/dashboard/catalog', {
      timeout: 5000,
    })

    // Verify product appears in list
    await expect(
      authenticatedPage.getByText('Test Product E2E')
    ).toBeVisible()
  })

  test('should display created product in public profile', async ({
    authenticatedPage,
  }) => {
    // Create product (same as above)
    const addButton = authenticatedPage.getByRole('button', {
      name: /إضافة|جديد|Add/i,
    })
    await addButton.first().click()

    await authenticatedPage.waitForURL(/\/dashboard\/catalog\/.*/, {
      timeout: 5000,
    })

    await authenticatedPage.fill('input[name="name"]', 'Public Test Product')
    await authenticatedPage.fill('input[name="price"]', '200')
    await authenticatedPage.fill('textarea[name="description"]', 'Public test')

    const saveButton = authenticatedPage.getByRole('button', {
      name: /حفظ|Save/i,
    })
    await saveButton.click()

    await authenticatedPage.waitForURL('/dashboard/catalog', {
      timeout: 5000,
    })

    // Get business slug from profile
    await authenticatedPage.goto('/dashboard/profile')
    const slug = await authenticatedPage
      .locator('text=/filemart\\/[a-z-]+/')
      .textContent()

    if (slug) {
      const businessSlug = slug.replace('filemart/', '').trim()

      // Visit public profile
      await authenticatedPage.goto(`/${businessSlug}`)
      await authenticatedPage.waitForLoadState('networkidle')

      // Verify product appears in public profile
      await expect(
        authenticatedPage.getByText('Public Test Product')
      ).toBeVisible()
    }
  })
})

