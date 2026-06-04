import { expect, test } from '@playwright/test'

test('homepage renders configured content without placeholders', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text())
    }
  })

  await page.goto('/')
  await expect(page.locator('.intro-stage')).toBeHidden({ timeout: 4_000 })

  await expect(page).toHaveTitle('垣钰 | 个人主页')
  await expect(page.getByRole('heading', { name: '垣钰' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '探索我的世界' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '常用工具栈' })).toBeVisible()
  await expect(page.locator('#projects').getByRole('heading', { name: '项目作品' })).toBeVisible()
  await expect(page.getByText('React 官方文档')).toBeVisible()

  await expect(page.locator('body')).not.toContainText('example.com')
  await expect(page.locator('body')).not.toContainText('yourusername')

  const themeToggle = page.getByRole('button', { name: '切换主题' })
  await expect(themeToggle).toBeVisible()
  await themeToggle.click()
  await expect(page.locator('html')).not.toHaveClass(/dark/)

  const toolsSection = page.locator('#tools')
  await toolsSection.getByRole('button', { name: '云服务' }).click()
  await expect(toolsSection.getByText('Cloudflare Pages')).toBeVisible()
  await expect(toolsSection.getByText('React', { exact: true })).toHaveCount(0)

  await page.locator('#projects').getByRole('button', { name: '展开详情' }).click()
  await expect(page.getByText('产物为纯静态资源，适配 Cloudflare Pages。')).toBeVisible()

  await page.getByRole('button', { name: '联系我' }).click()
  await expect(page.getByRole('dialog', { name: '联系我' })).toBeVisible()
  await page.getByRole('button', { name: '关闭', exact: true }).click()
  await expect(page.getByRole('dialog', { name: '联系我' })).toBeHidden()

  expect(consoleErrors).toEqual([])
})
