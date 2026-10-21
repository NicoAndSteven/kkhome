import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const out = 'shots/tmp-transition'
mkdirSync(out, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
await page.goto('http://localhost:5173/#/ai-tools', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(2500)

// Freeze all CSS/JS-driven animation? No — sample the real transition.
await page.locator('.kk-nav-item', { hasText: '吃啥' }).click()

const times = [0, 60, 120, 200, 300, 420, 560, 700, 900, 1200]
let last = 0
for (const t of times) {
  await page.waitForTimeout(t - last)
  last = t
  await page.screenshot({ path: `${out}/t${String(t).padStart(4, '0')}.png` })
}

// Direction check: go back to a previous route
await page.waitForTimeout(800)
await page.locator('.kk-nav-item', { hasText: '看盘' }).click()
await page.waitForTimeout(180)
await page.screenshot({ path: `${out}/back-t0180.png` })
await page.waitForTimeout(900)

await browser.close()
console.log('captured', out)
