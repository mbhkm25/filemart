// E2E Test: Update Business Info
// Test 4 from FAM Section 7
// Steps: Edit profile name and description → Save
// Expected: Public profile updates immediately

import { test, expect } from '../fixtures'

test.describe('Update Business Info', () => {
  test('should update business profile and reflect in public profile', async ({
    authenticatedPage,
    page,
  }) => {
    // Navigate to profile editor
    await authenticatedPage.goto('/dashboard/profile')
    await authenticatedPage.waitForLoadState('networkidle')

    // Get current business slug
    const profileLink = authenticatedPage.locator('a[href*="/"]').first()
    const href = await profileLink.getAttribute('href')
    const businessSlug = href ? href.split('/').pop() || 'test-business' : 'test-business'

    // Update name
    const nameField = authenticatedPage.locator('input[name="name"], input[placeholder*="اسم"]').first()
    if (await nameField.count() > 0) {
      await nameField.clear()
      await nameField.fill('Updated Business Name E2E')
    }

    // Update description
    const descField = authenticatedPage.locator('textarea[name="description"], textarea[placeholder*="وصف"]').first()
    if (await descField.count() > 0) {
      await descField.clear()
      await descField.fill('Updated business description for E2E testing')
    }

    // Save changes
    const saveButton = authenticatedPage.getByRole('button', {
      name: /حفظ|Save/i,
    })
    await saveButton.click()

    // Wait for save to complete
    await authenticatedPage.waitForTimeout(2000)

    // Visit public profile
    await page.goto(`/${businessSlug}`)
    await page.waitForLoadState('networkidle')

    // Verify updated name appears
    await expect(
      page.getByText('Updated Business Name E2E')
    ).toBeVisible({ timeout: 5000 })

    // Verify updated description appears
    await expect(
      page.getByText('Updated business description for E2E testing')
    ).toBeVisible({ timeout: 5000 })
  })
})

