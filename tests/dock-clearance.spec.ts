import { expect, test } from '@playwright/test'

/**
 * dock 播放器（右下角常驻浮层）不得压住内容。
 *
 * 这条用例盯的是一次真实回归：播放器是 position:fixed 浮层，而内容区没有给它
 * 让位。实测 ai-tools 首屏右下角的卡片整块从它下面经过，滚到底最后一行也被压。
 * 修法是把内容区（含标题头）的右侧让出播放器的通道，见 index.css 里
 * `.route-mode:has(.ac-dock-player) .route-view` 那条规则。
 *
 * 为什么量「叶子节点 ∩ 播放器矩形」而不是元素总数：容器的矩形本来就会扫过
 * 播放器那一列（全宽包裹层），只有可见的文本和可交互元素被压才算真的被压。
 *
 * home 不在列表里 —— 它不走 route-mode 这套壳，桌面端也没有 dock。
 */
const ROUTES = ['ai-tools', 'wish-wall', 'stock-watch', 'food', 'party-games', 'local-music']

test.use({ viewport: { width: 1280, height: 720 } })

test('dock 播放器不遮挡任何桌面路由的内容', async ({ page }) => {
  await page.goto('/#/ai-tools', { waitUntil: 'domcontentloaded' })
  // dock 不存在的话后面的相交断言会空转通过，护栏就废了
  await expect(page.locator('.ac-dock-player')).toBeVisible()

  for (const route of ROUTES) {
    await page.goto(`/#/${route}`, { waitUntil: 'domcontentloaded' })
    await expect(page.locator('.kk-body > *').first()).toBeVisible()

    const overlapped = await page.evaluate(() => {
      const dock = document.querySelector('.ac-dock-player')
      if (!dock) return ['dock 播放器不存在']
      const d = dock.getBoundingClientRect()
      const main = document.querySelector('.route-main')
      const hits: string[] = []

      const scan = () => {
        const body = document.querySelector('.kk-body')
        if (!body) return
        for (const el of Array.from(body.querySelectorAll('*'))) {
          if (el.children.length > 0) continue
          const text = (el.textContent ?? '').trim()
          const interactive = ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)
          if (!text && !interactive) continue
          const r = el.getBoundingClientRect()
          if (r.width === 0 || r.height === 0) continue
          if (r.right > d.left && r.bottom > d.top && r.left < d.right && r.top < d.bottom) {
            hits.push(`${el.tagName}<${text.slice(0, 20) || el.className}>`)
          }
        }
      }

      if (main) {
        main.scrollTop = 0
        scan()
        main.scrollTop = main.scrollHeight
        scan()
      }
      return hits
    })

    expect(overlapped, `路由 ${route} 有内容被 dock 播放器压住`).toEqual([])
  }
})
