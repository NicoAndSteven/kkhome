// 动效取证：逐帧采样，证明"确实动了"，而不是靠看截图猜。
//
// 为什么必须量：anime.js 用错 API 是**静默失败**（不报错、不进控制台），
// 而"没动"和"动得太快/太弱"在静态截图上长得一模一样。
//
// 三个必须避开的测量陷阱（第一版全踩了，结果 0/6 全红，全是假阴性）：
//
// 1. **动画属性不一定是 opacity。** 页头横线和切镜幕布动的是 `scaleX`，
//    量 opacity 会永远读到 1.00，看起来像"没动"。所以每个目标要声明量什么。
// 2. **采样要锚定到新路由。** 采样器在导航**之前**就装好了，头几帧采到的
//    是上一条路由的 DOM（opacity 已是 1）。所以每帧连路由标题一起记，
//    事后只保留标题匹配的帧。
// 3. **不能只看首末帧。** 判据是曲线形状：起点接近 0/1、有明显中间帧、终值落定。
import { chromium } from '@playwright/test'

const BASE = process.env.SHOT_BASE ?? 'http://localhost:5173'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const errors = []
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)) })
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message.slice(0, 200)))

await page.goto(`${BASE}/#/home`, { waitUntil: 'domcontentloaded' })
await page.evaluate(() => window.dispatchEvent(new Event('intro-complete')))
await page.waitForTimeout(3000)

/** [标签, 选择器, 量的属性, 起点期望, 终点期望] */
const TARGETS = [
  ['页头 kicker', '.kk-head-kicker', 'opacity', 0, 1],
  ['页头 标题', '.kk-head-title', 'opacity', 0, 1],
  ['页头 序号', '.kk-head-idx', 'opacity', 0, 1],
  ['页头 横线', '.kk-head-rule', 'scaleX', 0, 1],
  ['页头 meta', '.kk-head-meta', 'opacity', 0, 1],
  ['内容首块', '.kk-body > * > *', 'opacity', 0, 1],
  ['切镜幕布', '.kk-curtain', 'scaleX', 1, 0],
]

const CASES = [
  ['ai-tools', '导向'],
  ['wish-wall', '许愿'],
  ['stock-watch', '看盘'],
  ['food', '吃啥'],
  ['party-games', '游戏'],
  ['local-music', '音乐'],
]

// ── 预热 ──
// 插件是懒加载的：第一次进入某条路由时，分片要现下载 + 解析，主线程被占住
// 150ms 左右，rAF 停摆，动画的前几帧会被整个跳过。
// 实测表现：只有"冷启动"那一条路由（本用例里是第一条 ai-tools）会读到
// 首帧 0.20 / 幕布 0.84，其余五条都是干净的 0.00 / 1.00。
// 这是冷启动现象，不是动效本身的问题 —— 先把每条路由走一遍把分片加载好，
// 再开始测量"正常切路由"这个真实场景。
console.log('预热插件分片…')
for (const [route] of CASES) {
  await page.evaluate((r) => { window.location.hash = `#/${r}` }, route)
  await page.waitForTimeout(700)
}
await page.evaluate(() => { window.location.hash = '#/home' })
await page.waitForTimeout(1200)

const results = []
for (const [route, expectedTitle] of CASES) {
  await page.evaluate((targets) => {
    window.__probe = []
    const read = (el, metric) => {
      const cs = getComputedStyle(el)
      if (metric === 'opacity') return Number(cs.opacity)
      // scaleX 要从 transform 矩阵里取第一项；`none` 视为 1
      if (cs.transform === 'none') return 1
      const m = cs.transform.match(/matrix\(([^)]+)\)/)
      return m ? Number(m[1].split(',')[0]) : 1
    }
    const tick = () => {
      const title = document.querySelector('.kk-head-title')?.textContent ?? ''
      const row = { title }
      for (const [name, sel, metric] of targets) {
        const el = document.querySelector(sel)
        row[name] = el ? read(el, metric) : null
      }
      window.__probe.push(row)
      if (window.__probe.length < 400) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, TARGETS)

  await page.evaluate((r) => { window.location.hash = `#/${r}` }, route)
  // 采样窗口要够长：懒加载的插件分片在解析时主线程会忙，rAF 被推迟，
  // 窗口太短会采不到动画的开头（第一版 1.7s 就在 ai-tools 上采到了 0.19）。
  await page.waitForTimeout(2800)
  const raw = await page.evaluate(() => window.__probe)
  // 只保留"已经切到目标路由"之后采到的帧
  const samples = raw.filter((s) => s.title === expectedTitle)

  const lines = []
  let allOk = true
  if (samples.length < 8) {
    lines.push(`    采样不足（${samples.length} 帧），无法判定`)
    allOk = false
  } else {
    for (const [name, , , from, to] of TARGETS) {
      const series = samples.map((s) => s[name]).filter((v) => v !== null)
      if (series.length === 0) { lines.push(`    FAIL ${name.padEnd(10)} 未找到元素`); allOk = false; continue }
      const first = series[0]
      const last = series.at(-1)
      const lo = Math.min(from, to)
      const hi = Math.max(from, to)
      const mids = series.filter((v) => v > lo + 0.02 && v < hi - 0.02).length
      const startOk = Math.abs(first - from) < 0.12
      const endOk = Math.abs(last - to) < 0.05
      const ok = startOk && endOk && mids >= 3
      if (!ok) allOk = false
      lines.push(
        `    ${ok ? 'OK  ' : 'FAIL'} ${name.padEnd(10)} ${from}→${to}｜首帧 ${first.toFixed(2)} 末帧 ${last.toFixed(2)} 过渡 ${mids} 帧`,
      )
    }
  }
  results.push({ route, allOk })
  console.log(`\n${route}  ${allOk ? '✅' : '❌'}  （${samples.length} 帧）`)
  console.log(lines.join('\n'))
}

const failed = results.filter((r) => !r.allOk)
console.log(`\n=== ${results.length - failed.length}/${results.length} 条路由的动效全部可观测 ===`)
if (failed.length) console.log('未通过：', failed.map((f) => f.route).join(', '))
console.log('console errors:', errors.length ? errors.join('\n') : 'none')

await browser.close()
process.exit(failed.length ? 1 : 0)
