import { expect, test } from '@playwright/test'

test('desktop route transition morphs the nav indicator into the header kicker', async ({ page }) => {
  await page.goto('/#/ai-tools', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.kk-head-title')).toHaveText('导向')

  const nav = page.locator('.kk-nav-item[data-route-id="food"]')
  await expect(nav).toBeVisible()
  await nav.click()

  // 幽灵条在路由挂载后立即出现，落到 kicker 后自动移除。
  await expect(page.locator('.morph-bar')).toHaveCount(1, { timeout: 1_000 })
  await expect(page.locator('.kk-head-title')).toHaveText('吃啥')
  await expect(page.locator('.morph-bar')).toHaveCount(0, { timeout: 2_000 })
  await expect(page.locator('.kk-head-kicker')).toBeVisible()
})
