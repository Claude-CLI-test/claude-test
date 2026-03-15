/**
 * 로그인 실패 시나리오 E2E 테스트 - 영문(EN) UI
 * 각 케이스마다 스크린샷을 test-results에 저장
 */
import { test, expect } from '@playwright/test'
import path from 'path'

const BASE_URL = 'http://localhost:5173'
const SCREENSHOTS_DIR = path.resolve('test-results/login-failure-en')

test.describe('로그인 실패 시나리오 (EN)', () => {

  test.beforeEach(async ({ page }) => {
    // 영문 locale 설정 후 로그인 페이지 이동
    await page.goto(`${BASE_URL}/login`)
    await page.evaluate(() => localStorage.setItem('locale', 'en'))
    await page.reload()
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
  })

  test('1. Empty email and password', async ({ page }) => {
    await page.getByRole('button', { name: 'Login' }).click()
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/01-empty-fields.png` })
    await expect(page).toHaveURL(`${BASE_URL}/login`)
  })

  test('2. Invalid email format (no @)', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).fill('notanemail')
    await page.getByRole('textbox', { name: 'Password' }).fill('Password1!')
    await page.getByRole('button', { name: 'Login' }).click()
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/02-invalid-email-format.png` })
    await expect(page).toHaveURL(`${BASE_URL}/login`)
  })

  test('3. Non-existent email', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).fill('notexist@test.com')
    await page.getByRole('textbox', { name: 'Password' }).fill('Password1!')
    const [res] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/auth/login')),
      page.getByRole('button', { name: 'Login' }).click(),
    ])
    expect(res.status()).toBe(401)
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/03-nonexistent-email.png` })
    await expect(page).toHaveURL(`${BASE_URL}/login`)
  })

  test('4. Correct email, wrong password', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).fill('alice@example.com')
    await page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword')
    const [res] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/auth/login')),
      page.getByRole('button', { name: 'Login' }).click(),
    ])
    expect(res.status()).toBe(401)
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/04-wrong-password.png` })
    await expect(page).toHaveURL(`${BASE_URL}/login`)
  })

  test('5. Email only, password empty', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).fill('alice@example.com')
    await page.getByRole('button', { name: 'Login' }).click()
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/05-missing-password.png` })
    await expect(page).toHaveURL(`${BASE_URL}/login`)
  })

  test('6. Password only, email empty', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Password' }).fill('Password1!')
    await page.getByRole('button', { name: 'Login' }).click()
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/06-missing-email.png` })
    await expect(page).toHaveURL(`${BASE_URL}/login`)
  })

  test('7. Whitespace-only password', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).fill('alice@example.com')
    await page.getByRole('textbox', { name: 'Password' }).fill('   ')
    const [res] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/auth/login')),
      page.getByRole('button', { name: 'Login' }).click(),
    ])
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/07-whitespace-password.png` })
    await expect(page).toHaveURL(`${BASE_URL}/login`)
  })

})
