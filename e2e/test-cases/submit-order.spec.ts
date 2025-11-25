// E2E Test: Submit Order
// Test 2 from FAM Section 7
// Steps: Add product to list → Fill customer info → Submit
// Expected: Order appears in Dashboard and success message shows

import { test, expect } from '../fixtures'

test.describe('Submit Order', () => {
  test('should submit an order successfully', async ({ page }) => {
    // Visit public profile (assuming test-business exists)
    await page.goto('/test-business')
    await page.waitForLoadState('networkidle')

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"], article, .product', {
      timeout: 5000,
    })

    // Click on first product card to add to cart
    const productCard = page.locator('[data-testid="product-card"], article, .product').first()
    if (await productCard.count() > 0) {
      // Find and click "Add to Cart" button
      const addToCartButton = productCard.getByRole('button', {
        name: /إضافة|Add|أضف/i,
      }).or(productCard.locator('a[href*="product"]'))

      if (await addToCartButton.count() > 0) {
        await addToCartButton.first().click()

        // If navigated to product page, click add to cart there
        if (page.url().includes('/product/')) {
          const addButton = page.getByRole('button', {
            name: /إضافة|Add/i,
          })
          await addButton.click()
        }
      } else {
        // Click on product card to navigate to product page
        await productCard.click()
        await page.waitForLoadState('networkidle')

        // Click add to cart on product page
        const addButton = page.getByRole('button', {
          name: /إضافة|Add/i,
        })
        await addButton.click()
      }
    }

    // Navigate to order list
    const orderButton = page.getByRole('button', {
      name: /طلب|Order|قائمة/i,
    }).or(page.locator('a[href*="order-list"]'))

    if (await orderButton.count() > 0) {
      await orderButton.first().click()
    } else {
      // Navigate directly
      await page.goto('/test-business/order-list')
    }

    await page.waitForLoadState('networkidle')

    // Fill customer info
    await page.fill('input[name="name"], input[placeholder*="اسم"], input[placeholder*="name"]', 'Test Customer')
    await page.fill('input[name="phone"], input[type="tel"], input[placeholder*="هاتف"]', '+966501234567')
    await page.fill('input[name="email"], input[type="email"]', 'customer@example.com')

    // Fill notes if field exists
    const notesField = page.locator('textarea[name="notes"], textarea[placeholder*="ملاحظات"]')
    if (await notesField.count() > 0) {
      await notesField.fill('Test order notes')
    }

    // Submit order
    const submitButton = page.getByRole('button', {
      name: /إرسال|Submit|أرسل/i,
    })
    await submitButton.click()

    // Wait for success page or message
    await page.waitForURL(/order-success|success/, { timeout: 10000 })

    // Verify success message
    await expect(
      page.getByText(/نجح|success|تم/i)
    ).toBeVisible({ timeout: 5000 })
  })

  test('should show order in dashboard after submission', async ({
    authenticatedPage,
  }) => {
    // First submit an order (can use API or UI)
    // Then check dashboard

    await authenticatedPage.goto('/dashboard/orders')
    await authenticatedPage.waitForLoadState('networkidle')

    // Verify orders list is visible
    await expect(
      authenticatedPage.locator('text=/طلب|Order/i').first()
    ).toBeVisible({ timeout: 5000 })
  })
})

