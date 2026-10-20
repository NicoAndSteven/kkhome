// 路由外壳的量化体检：不信肉眼，直接量。
//
// 检查项：
//   1. 指示条是否精确落在当前项中心（弹簧驱动，最容易被 padding/border 带偏）
//   2. 切路由时幕布是否真的从「盖满」擦到「收起」（采样 transform 矩阵的 scaleX）
//   3. 页头各元素是否在预期位置、有没有溢出
//   4. 控制台有没有报错（anime.js 用错 API 是静默失败，只能靠量最终值发现）
import { chromium } from '@playwright/test'

const BASE = process.env.SHOT_BASE ?? 'http://localhost:5173'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const errors = []
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 240)) })
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message.slice(0, 240)))

const scaleX = (m) => {
  if (!m || m === 'none') return null
  const nums = m.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi)
  return nums ? Number(nums[0]) : null
}

await page.goto(`${BASE}/#/ai-tools`, { waitUntil: 'domcontentloaded' })
await page.evaluate(() => window.dispatchEvent(new Event('intro-complete')))
await page.waitForTimeout(2600)

// ── 1. 指示条 vs 当前项 ──
const pip = await page.evaluate(() => {
  const list = document.querySelector('.kk-nav-list')
  const pipEl = document.querySelector('.kk-nav-pip')
  const active = list?.querySelector('.kk-nav-item[aria-current="page"]')
  if (!list || !pipEl || !active) return null
  const lr = list.getBoundingClientRect()
  const ar = active.getBoundingClientRect()
  const pr = pipEl.getBoundingClientRect()
  return {
    activeLabel: active.getAttribute('aria-label'),
    itemCenterFromListTop: Math.round(ar.top + ar.height / 2 - lr.top),
    pipCenterFromListTop: Math.round(pr.top + pr.height / 2 - lr.top),
    pipLeft: Math.round(pr.left - lr.left),
    itemTop: Math.round(ar.top - lr.top),
    itemHeight: Math.round(ar.height),
    pipHeight: Math.round(pr.height),
  }
})
console.log('pip:', JSON.stringify(pip))
if (pip) {
  const drift = Math.abs(pip.itemCenterFromListTop - pip.pipCenterFromListTop)
  console.log(drift <= 1 ? '  OK 指示条落在项中心' : `  FAIL 偏离 ${drift}px`)
}

// ── 2. 切镜幕布：采样 transform ──
await page.evaluate(() => {
  window.__samples = []
  const start = performance.now()
  const tick = () => {
    const c = document.querySelector('.kk-curtain')
    const cb = document.querySelector('.kk-curtain-b')
    const i = document.querySelector('.kk-curtain-idx')
    window.__samples.push({
      t: Math.round(performance.now() - start),
      accent: c ? getComputedStyle(c).transform : null,
      canvas: cb ? getComputedStyle(cb).transform : null,
      idx: i ? getComputedStyle(i).opacity : null,
    })
    if (window.__samples.length < 70) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
})

await page.click('.kk-nav-item[aria-label="吃啥"]')
await page.waitForTimeout(1400)
const samples = await page.evaluate(() => window.__samples)
const accentSeries = samples.map((s) => scaleX(s.accent)).filter((v) => v !== null)
const canvasSeries = samples.map((s) => scaleX(s.canvas)).filter((v) => v !== null)
console.log('curtain accent scaleX first/last:', accentSeries[0], '->', accentSeries.at(-1))
console.log('curtain canvas scaleX first/last:', canvasSeries[0], '->', canvasSeries.at(-1))
console.log('  accent min/max:', Math.min(...accentSeries).toFixed(3), Math.max(...accentSeries).toFixed(3))
console.log('  canvas min/max:', Math.min(...canvasSeries).toFixed(3), Math.max(...canvasSeries).toFixed(3))
// 采样是从点击那一刻起跑的，第一帧幕布**已经**是 1.0（初始态在 layout effect 里落下），
// 所以"盖满"只会被采到 1 帧。判定要看的是整条曲线是否走完 1 → 0：
// 峰值够高、谷值够低、中间有足够多的过渡帧。
const peak = Math.max(...accentSeries)
const trough = Math.min(...accentSeries)
const frames = accentSeries.filter((v) => v > 0.01 && v < 0.99).length
const ok = peak >= 0.99 && trough <= 0.01 && frames >= 5
console.log(ok ? `  OK 幕布确实擦过（1 → 0，过渡 ${frames} 帧）` : `  FAIL 幕布没有可观测的擦除（peak ${peak} / trough ${trough} / 过渡 ${frames} 帧）`)

// ── 3. 切完之后页头是否正确 ──
await page.waitForTimeout(900)
const head = await page.evaluate(() => {
  const t = document.querySelector('.kk-head-title')
  const idx = document.querySelector('.kk-head-idx')
  const rule = document.querySelector('.kk-head-rule')
  const meta = document.querySelector('.kk-head-meta')
  const view = document.querySelector('.route-view')
  return {
    title: t?.textContent,
    titleOpacity: t ? getComputedStyle(t).opacity : null,
    idxText: idx?.textContent,
    idxOpacity: idx ? getComputedStyle(idx).opacity : null,
    ruleTransform: rule ? getComputedStyle(rule).transform : null,
    metaOpacity: meta ? getComputedStyle(meta).opacity : null,
    viewWidth: Math.round(view?.getBoundingClientRect().width ?? 0),
    docScrollW: document.documentElement.scrollWidth,
    winW: window.innerWidth,
  }
})
console.log('head:', JSON.stringify(head))
console.log(head.docScrollW <= head.winW ? '  OK 无横向溢出' : `  FAIL 横向溢出 ${head.docScrollW} > ${head.winW}`)

console.log('\nconsole errors:', errors.length ? errors.join('\n') : 'none')
await browser.close()
process.exit(0)
