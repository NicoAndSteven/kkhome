import { expect, test } from '@playwright/test'

/**
 * The menu drawer writes through `/api/food/*`, which plain `vite dev` does not serve.
 * The plugin is expected to fall back to localStorage on those responses, so this flow
 * is both a UI regression test and a check that dev/offline editing still works.
 */
test('food menu adds and deletes items when the API is unavailable', async ({ page }) => {
  // 固定在北京时间 10:00。`getCurrentPeriod()` 以 13:00 为午/晚分界，
  // 而这条用例全程在「中午」tab 里增删 —— 下午或晚上跑，轮盘会显示晚餐菜单，
  // 中午项自然找不到。之前它只在上午跑得通，属于时间依赖型假绿。
  await page.clock.setFixedTime(new Date('2026-10-21T02:00:00Z'))
  await page.goto('/#/food', { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'domcontentloaded' })

  const plugin = page.locator('#food-plugin')
  await expect(plugin.getByRole('button', { name: /管理菜单/ }).first()).toBeVisible()

  await plugin.getByRole('button', { name: /管理菜单/ }).first().click()
  const dialog = plugin.getByRole('dialog', { name: '管理菜单' })
  await expect(dialog).toBeVisible()

  // ── Noon: add two, delete one ──
  const noonInput = dialog.getByPlaceholder(/添加餐厅或菜品/)
  await noonInput.fill('测试牛肉面')
  await dialog.getByRole('button', { name: '添加', exact: true }).click()
  await expect(dialog.getByRole('button', { name: '删除测试牛肉面' })).toBeVisible()

  await noonInput.fill('测试黄焖鸡')
  await dialog.getByRole('button', { name: '添加', exact: true }).click()
  await expect(dialog.getByRole('button', { name: '删除测试黄焖鸡' })).toBeVisible()

  await dialog.getByRole('button', { name: '删除测试牛肉面' }).click()
  await expect(dialog.getByRole('button', { name: '删除测试牛肉面' })).toHaveCount(0)
  await expect(dialog.getByRole('button', { name: '删除测试黄焖鸡' })).toBeVisible()

  // ── Evening: add and delete a custom dish ──
  await dialog.getByRole('button', { name: /晚上菜谱/ }).click()
  const eveningInput = dialog.getByPlaceholder(/添加自定义菜名/)
  await eveningInput.fill('测试咖喱饭')
  await dialog.getByRole('button', { name: '添加', exact: true }).click()
  const eveningDelete = dialog.getByRole('button', { name: '删除测试咖喱饭' })
  await expect(eveningDelete).toBeVisible()
  await eveningDelete.click()
  await expect(dialog.getByRole('button', { name: '删除测试咖喱饭' })).toHaveCount(0)

  // ── Closing with X (not the save button) must still refresh the wheel ──
  await dialog.getByRole('button', { name: '关闭', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await expect(plugin.getByText('测试黄焖鸡')).toBeVisible()
  await expect(plugin.getByText('测试牛肉面')).toHaveCount(0)

  // ── Local fallback survives a reload ──
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.locator('#food-plugin').getByText('测试黄焖鸡')).toBeVisible()
})
