// 局部截图：给某个选择器单独拍一张，用来放大看细节。
// 用法：node scripts/shot-el.mjs <route> <selector> <outFile> [waitMs]
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const [route = 'ai-tools', selector = '.kk-nav', out = 'shots/kk/el.png', waitMs = '2200'] = process.argv.slice(2)
const BASE = process.env.SHOT_BASE ?? 'http://localhost:5173'
mkdirSync(dirname(out), { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
await page.goto(`${BASE}/#/${route}`, { waitUntil: 'domcontentloaded' })
await page.evaluate(() => window.dispatchEvent(new Event('intro-complete')))
await page.waitForTimeout(Number(waitMs))
const el = page.locator(selector).first()
await el.screenshot({ path: out })
const box = await el.boundingBox()
console.log('shot', selector, JSON.stringify(box), '->', out)
await browser.close()
// Playwright 在本机环境下 close() 之后进程不退出（句柄没释放干净），
// 不显式退出会让调用方一直挂着等。
process.exit(0)
