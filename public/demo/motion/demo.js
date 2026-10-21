/* global document, window, matchMedia, performance, requestAnimationFrame */
export const EASE = {
  expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
  standard: 'cubic-bezier(0.22, 1, 0.36, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.2, 1)',
  outQuad: 'cubic-bezier(0.5, 1, 0.89, 1)',
}

export const REDUCED =
  typeof matchMedia !== 'undefined' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches

export const ROUTES = [
  {
    id: 'profile',
    label: '首页',
    en: 'HOME',
    idx: '01',
    title: '垣钰',
    line: '把个人主页做成一张会呼吸的编辑桌面。',
    desc: '这一页负责第一印象：大标题、留白、少量但明确的动效。切换回来时应该像回到桌面，而不是重新加载一个页面。',
    notes: [
      ['MOOD', '安静的起点', '首屏不抢戏，信息按阅读顺序落位。'],
      ['MOTION', '只动一次', '标题揭示 + 一条发丝线，不叠加第二套动作。'],
      ['NEXT', '进入模块', '从导航进入下级页面时，方向感要明确。'],
    ],
  },
  {
    id: 'ai-tools',
    label: '导向',
    en: 'TOOLS',
    idx: '02',
    title: '导向',
    line: '先选工具，再开始工作。',
    desc: '工具目录天然是列表页。列表之间的切换应该轻、快、可连续点击，避免每次都被一块幕布打断。',
    notes: [
      ['MOOD', '目录感', '编号、分类、搜索是主角，动效只负责衔接。'],
      ['MOTION', '共享轴', '列表和详情之间用同一方向的短位移建立空间关系。'],
      ['NEXT', '筛选', '筛选状态用局部过渡，不要触发整页转场。'],
    ],
  },
  {
    id: 'wish-wall',
    label: '许愿',
    en: 'WISH',
    idx: '03',
    title: '许愿',
    line: '把想要的功能写下来，让下一步有据可依。',
    desc: '这一页的核心是“提交—反馈”。动效应该围绕状态变化，而不是页面本身：新增、完成、空状态。',
    notes: [
      ['MOOD', '轻量输入', '输入框和卡片是视觉重心。'],
      ['MOTION', '局部反馈', '提交成功后只动新增的那一条，不重排整页。'],
      ['NEXT', '空状态', '空状态用淡入，不需要方向性运动。'],
    ],
  },
  {
    id: 'stock-watch',
    label: '看盘',
    en: 'STOCK',
    idx: '04',
    title: '看盘',
    line: '自选、走势、提醒，放在同一张桌面上。',
    desc: '数据页最怕“看起来很忙”。页面切换要克制，把运动预算留给数字变化和图表加载。',
    notes: [
      ['MOOD', '冷静', '低饱和背景，强调色只给关键数值。'],
      ['MOTION', '克制', '路由切换 200–240ms，不再叠加数字滚动。'],
      ['NEXT', '实时更新', '数据更新用局部脉冲，不触发页面转场。'],
    ],
  },
  {
    id: 'food',
    label: '吃啥',
    en: 'FOOD',
    idx: '05',
    title: '吃啥',
    line: '把随机推荐做成一块轻松的菜单海报。',
    desc: '转盘是这一页的主角。页面进入时应该把注意力交给转盘，而不是先用幕布演一遍过场。',
    notes: [
      ['MOOD', '轻松', '圆角、彩色扇区、稍微俏皮一点。'],
      ['MOTION', '主角优先', '路由转场让位给转盘旋转，避免两套动画抢戏。'],
      ['NEXT', '管理菜单', '抽屉的进出场单独设计，不跟路由共用一套。'],
    ],
  },
  {
    id: 'party-games',
    label: '游戏',
    en: 'GAME',
    idx: '06',
    title: '游戏',
    line: '创建房间，和朋友在同一套规则里玩。',
    desc: '游戏页有大量局部状态：房间、玩家、回合。路由转场要短，真正的动效预算留给游戏状态本身。',
    notes: [
      ['MOOD', '现场感', '头像、座位、倒计时构成画面。'],
      ['MOTION', '快进快出', '进入房间用 240ms，状态变化用弹簧。'],
      ['NEXT', '全屏层', '房间层是 fixed 元素，路由容器不能加 transform。'],
    ],
  },
]

export function renderNav() {
  const list = document.querySelector('.rail-list')
  if (!list) return
  list.innerHTML = ROUTES.map(
    (r) => `<button class="rail-item" type="button" data-id="${r.id}" aria-label="${r.label}">
      <b>${r.idx}</b><span>${r.label}</span>
    </button>`,
  ).join('')
}

export function activateNav(id) {
  document.querySelectorAll('.rail-item').forEach((el) => {
    const on = el.dataset.id === id
    el.classList.toggle('active', on)
    if (on) el.setAttribute('aria-current', 'page')
    else el.removeAttribute('aria-current')
  })
}

/** 返回被点击的导航按钮，便于共享元素转场取起点。 */
export function bindRail(onSelect) {
  const list = document.querySelector('.rail-list')
  if (!list) return
  list.addEventListener('click', (event) => {
    const btn = event.target.closest('.rail-item')
    if (!btn) return
    const index = ROUTES.findIndex((r) => r.id === btn.dataset.id)
    if (index >= 0) onSelect(index, btn)
  })
}

export function renderView(route) {
  const total = String(ROUTES.length).padStart(2, '0')
  return `
  <div class="view" data-route="${route.id}">
    <header class="head">
      <div class="head-lead">
        <span class="kicker">MODULE / ${route.en}</span>
        <div class="mask"><h1 class="title">${route.title}</h1></div>
      </div>
      <div class="head-idx" aria-hidden="true">${route.idx}</div>
      <span class="rule" aria-hidden="true"></span>
      <div class="head-meta">
        <span><b>CUT</b> ${route.idx} / ${total}</span>
        <span><b>ID</b> ${route.id}</span>
        <span><b>PLUGIN</b> ${route.en.toLowerCase()}</span>
      </div>
    </header>
    <section class="body">
      <div class="lede">
        <span class="label">01 / ${route.en}</span>
        <h2>${route.line}</h2>
        <p>${route.desc}</p>
      </div>
      <div class="grid">
        ${route.notes
          .map(
            ([tag, title, text], i) => `<article class="card">
              <span class="card-tag">0${i + 1} / ${tag}</span>
              <h3>${title}</h3>
              <p>${text}</p>
              <span class="card-foot">${route.en} / 0${i + 1}</span>
            </article>`,
          )
          .join('')}
      </div>
      <div class="strip">
        <span>MOTION LAB / ${route.id.toUpperCase()}</span>
        <span>CLICK THE RAIL TO CHANGE</span>
      </div>
      <div class="ghost-space"></div>
    </section>
  </div>`
}

export function setupHUD({ label, onPrev, onNext, onReplay, onAuto }) {
  const hud = document.createElement('div')
  hud.className = 'hud'
  hud.innerHTML = `
    <span class="hud-label">${label}</span>
    <button type="button" data-act="prev">← 后退</button>
    <button type="button" data-act="replay">重播</button>
    <button type="button" data-act="next">前进 →</button>
    <button type="button" data-act="auto">AUTO</button>`
  document.body.appendChild(hud)

  hud.querySelector('[data-act="prev"]').addEventListener('click', onPrev)
  hud.querySelector('[data-act="next"]').addEventListener('click', onNext)
  hud.querySelector('[data-act="replay"]').addEventListener('click', onReplay)

  const autoBtn = hud.querySelector('[data-act="auto"]')
  let autoOn = false
  autoBtn.addEventListener('click', () => {
    autoOn = !autoOn
    autoBtn.classList.toggle('on', autoOn)
    onAuto?.(autoOn)
  })

  return hud
}

export function bindArrows(onPrev, onNext) {
  window.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') onPrev()
    if (event.key === 'ArrowRight') onNext()
  })
}

export function animate(el, keyframes, options) {
  return el.animate(keyframes, { fill: 'both', ...options })
}

export function prime(el, { opacity = 0, rise = 0, x = 0, y = 0 } = {}) {
  if (!el) return
  el.style.opacity = String(opacity)
  el.style.translate = `${x}px ${y || rise}px`
}

export function clearPrime(root) {
  if (!root) return
  root.style.removeProperty('opacity')
  root.style.removeProperty('translate')
  root.querySelectorAll('[style*="opacity"], [style*="translate"]').forEach((el) => {
    el.style.removeProperty('opacity')
    el.style.removeProperty('translate')
  })
  root.querySelectorAll('.rule').forEach((el) => el.style.removeProperty('transform'))
}

export function countUp(el, target, duration, delay) {
  if (!el) return
  const start = performance.now() + delay
  const tick = (now) => {
    const t = Math.min(1, Math.max(0, (now - start) / duration))
    const eased = 1 - Math.pow(1 - t, 3)
    el.textContent = String(Math.round(target * eased)).padStart(2, '0')
    if (t < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

export function nextIndex(index, step) {
  return (index + step + ROUTES.length) % ROUTES.length
}
