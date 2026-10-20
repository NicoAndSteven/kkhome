// 路由界面巡检：逐条路由截图 + 记录页内 DOM 规模、动效痕迹、控制台报错
//
// 用法：
//   node scripts/shot-routes.mjs [outDir] [route1,route2,...]
//
// 动效痕迹的口径：`inline` 统计带内联 transform/opacity 的元素（anime.js 的痕迹），
// `cssAnim` 统计 CSS @keyframes 驱动的元素，`trans` 统计有 transition 的元素。
// 这三个数只用来判断"这一页到底动没动"，不追求精确。
import { chromium } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'

const BASE = process.env.SHOT_BASE ?? 'http://localhost:5173'
const outDir = process.argv[2] ?? 'shots/routes-audit'
const only = process.argv[3] ? process.argv[3].split(',').map((s) => s.trim()) : null
mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })

const errors = []
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 240)) })
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message.slice(0, 240)))

await page.goto(`${BASE}/#/home`, { waitUntil: 'domcontentloaded' })
await page.evaluate(() => window.dispatchEvent(new Event('intro-complete')))
await page.waitForTimeout(3200)

const all = await page.evaluate(() => window.__hubAvailableRoutes ?? [])
const routes = only ? all.filter((r) => only.includes(r)) : all
console.log('routes:', routes.join(', '))

const report = []
for (const id of routes) {
  errors.length = 0
  await page.goto(`${BASE}/#/${id}`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2200)
  await page.screenshot({ path: `${outDir}/${id}.png`, fullPage: false })

  const info = await page.evaluate(() => {
    const main = document.querySelector('.route-main') ?? document.body
    const body = document.querySelector('.route-view') ?? main
    let inlineStyled = 0
    let cssAnimated = 0
    let transitions = 0
    for (const el of body.querySelectorAll('*')) {
      const s = el.getAttribute('style') ?? ''
      if (/transform|opacity|translate/.test(s)) inlineStyled++
      const cs = getComputedStyle(el)
      if (cs.animationName && cs.animationName !== 'none') cssAnimated++
      if (cs.transitionProperty && cs.transitionProperty !== 'none' && cs.transitionDuration !== '0s') transitions++
    }
    const legacy = {}
    for (const cls of ['glass', 'rounded-xl', 'rounded-2xl', 'surface-panel', 'surface-item', 'surface-control', 'kk-head', 'kk-nav', 'ac-tcard', 'ac-cell']) {
      legacy[cls] = body.querySelectorAll(`.${cls}`).length
    }
    return {
      nodes: body.querySelectorAll('*').length,
      height: Math.round(body.getBoundingClientRect().height),
      inlineStyled,
      cssAnimated,
      transitions,
      legacy,
      head: (document.querySelector('.kk-head-title')?.textContent ?? '').trim(),
      nav: document.querySelectorAll('.kk-nav-item').length,
    }
  })
  report.push({ id, ...info, errors: [...errors] })
  console.log(
    id.padEnd(14),
    'nodes', String(info.nodes).padStart(4),
    'h', String(info.height).padStart(5),
    'inline', String(info.inlineStyled).padStart(3),
    'cssAnim', String(info.cssAnimated).padStart(3),
    'nav', String(info.nav).padStart(2),
    'head', JSON.stringify(info.head),
    errors.length ? `ERRORS(${errors.length}): ${errors[0]}` : '',
  )
}

writeFileSync(`${outDir}/audit.json`, JSON.stringify(report, null, 2))
await browser.close()
// Playwright 在本机环境下 close() 之后进程不退出（句柄没释放干净），
// 不显式退出会让调用方一直挂着等。
process.exit(0)
console.log('\nwrote', `${outDir}/audit.json`)
