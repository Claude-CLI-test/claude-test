/**
 * 로그인 실패 시나리오 E2E 테스트
 * 각 케이스마다 스크린샷을 test-results에 저장
 */
import { test, expect } from '@playwright/test'
import path from 'path'

const BASE_URL = 'http://localhost:5173'
const SCREENSHOTS_DIR = path.resolve('test-results/login-failure')

test.describe('로그인 실패 시나리오', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
  })

  test('1. 이메일/비밀번호 모두 빈 값으로 로그인 시도', async ({ page }) => {
    await page.getByRole('button', { name: '로그인' }).click()
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/01-empty-fields.png` })
    await expect(page).toHaveURL(`${BASE_URL}/login`)
  })

  test('2. 이메일 형식 오류 (@ 없음)', async ({ page }) => {
    await page.getByRole('textbox', { name: '이메일' }).fill('notanemail')
    await page.getByRole('textbox', { name: '비밀번호' }).fill('Password1!')
    await page.getByRole('button', { name: '로그인' }).click()
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/02-invalid-email-format.png` })
    await expect(page).toHaveURL(`${BASE_URL}/login`)
  })

  test('3. 존재하지 않는 이메일로 로그인', async ({ page }) => {
    await page.getByRole('textbox', { name: '이메일' }).fill('notexist@test.com')
    await page.getByRole('textbox', { name: '비밀번호' }).fill('Password1!')
    const [res] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/auth/login')),
      page.getByRole('button', { name: '로그인' }).click(),
    ])
    expect(res.status()).toBe(401)
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/03-nonexistent-email.png` })
    await expect(page).toHaveURL(`${BASE_URL}/login`)
  })

  test('4. 이메일은 맞고 비밀번호가 틀린 경우', async ({ page }) => {
    await page.getByRole('textbox', { name: '이메일' }).fill('alice@example.com')
    await page.getByRole('textbox', { name: '비밀번호' }).fill('wrongpassword')
    const [res] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/auth/login')),
      page.getByRole('button', { name: '로그인' }).click(),
    ])
    expect(res.status()).toBe(401)
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/04-wrong-password.png` })
    await expect(page).toHaveURL(`${BASE_URL}/login`)
  })

  test('5. 이메일만 입력하고 비밀번호 비운 경우', async ({ page }) => {
    await page.getByRole('textbox', { name: '이메일' }).fill('alice@example.com')
    await page.getByRole('button', { name: '로그인' }).click()
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/05-missing-password.png` })
    await expect(page).toHaveURL(`${BASE_URL}/login`)
  })

  test('6. 비밀번호만 입력하고 이메일 비운 경우', async ({ page }) => {
    await page.getByRole('textbox', { name: '비밀번호' }).fill('Password1!')
    await page.getByRole('button', { name: '로그인' }).click()
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/06-missing-email.png` })
    await expect(page).toHaveURL(`${BASE_URL}/login`)
  })

  test('7. 비밀번호에 공백만 입력한 경우', async ({ page }) => {
    await page.getByRole('textbox', { name: '이메일' }).fill('alice@example.com')
    await page.getByRole('textbox', { name: '비밀번호' }).fill('   ')
    const [res] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/auth/login')),
      page.getByRole('button', { name: '로그인' }).click(),
    ])
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/07-whitespace-password.png` })
    await expect(page).toHaveURL(`${BASE_URL}/login`)
  })

})
