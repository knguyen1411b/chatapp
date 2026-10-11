import { expect, test } from '@playwright/test'

test.describe('E2E Full Authentication & Session Flow', () => {
    const timestamp = Date.now()
    const testUser = {
        username: `e2e_${timestamp}`,
        displayName: `E2E Tester ${timestamp}`,
        email: `e2e_${timestamp}@example.com`,
        password: 'password123'
    }

    test('User can register, stay logged in on /chat without kick-out, refresh page, and logout/login smoothly', async ({
        page
    }) => {
        // 1. Visit Register Page
        await page.goto('/register')
        await expect(page).toHaveTitle(/ChatApp/i)
        await expect(page.getByRole('heading', { name: /Tạo tài khoản mới/i })).toBeVisible()

        // 2. Fill Register Form
        await page.locator('input#username').fill(testUser.username)
        await page.locator('input#displayName').fill(testUser.displayName)
        await page.locator('input#email').fill(testUser.email)
        await page.locator('input#password').fill(testUser.password)

        // 3. Submit Registration
        await page.getByRole('button', { name: /Tạo tài khoản/i }).click()

        // 4. Verify successful redirect to /chat
        await expect(page).toHaveURL(/\/chat/, { timeout: 15000 })

        // 5. CRITICAL CHECK: Verify user stays on /chat and does NOT get kicked out to /login
        // We wait 3 seconds to ensure the bootstrap getMe() call and socket connection settle smoothly
        await page.waitForTimeout(3000)
        expect(page.url()).toContain('/chat')

        // 6. Verify user info is visible in the sidebar
        await expect(page.getByText(testUser.displayName)).toBeVisible()
        await expect(page.getByText(testUser.email)).toBeVisible()

        // 7. Verify session persistence after page reload (F5 / Refresh)
        await page.reload()
        await expect(page).toHaveURL(/\/chat/, { timeout: 10000 })
        await page.waitForTimeout(2000)
        expect(page.url()).toContain('/chat')
        await expect(page.getByText(testUser.displayName)).toBeVisible()

        // 8. Open Account Dropdown Menu and Logout
        const accountMenuButton = page.getByRole('button', { name: 'Mở menu tài khoản' })
        await expect(accountMenuButton).toBeVisible()
        await accountMenuButton.click()

        const logoutOption = page.locator('.ant-dropdown-menu-item', { hasText: 'Đăng xuất' })
        await expect(logoutOption).toBeVisible()
        await logoutOption.click()

        // 9. Verify redirection to /login
        await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
        await expect(page.getByRole('heading', { name: /Chào mừng trở lại!/i })).toBeVisible()

        // 10. Log in with the created credentials
        await page.locator('input#email').fill(testUser.email)
        await page.locator('input#password').fill(testUser.password)
        await page.getByRole('button', { name: /Đăng nhập/i }).click()

        // 11. Verify redirected back to /chat
        await expect(page).toHaveURL(/\/chat/, { timeout: 15000 })
        await page.waitForTimeout(2000)
        expect(page.url()).toContain('/chat')
        await expect(page.getByText(testUser.displayName)).toBeVisible()
    })

    test('Protected pages redirect unauthenticated visitors to /login', async ({ page }) => {
        // Clear any stored cookies or localStorage
        await page.goto('/login')
        await page.evaluate(() => localStorage.clear())

        // Attempt direct access to /chat
        await page.goto('/chat')
        await expect(page).toHaveURL(/\/login/, { timeout: 10000 })

        // Attempt direct access to /profile
        await page.goto('/profile')
        await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
    })
})
