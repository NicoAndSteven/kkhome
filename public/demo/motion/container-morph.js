/* global document, setTimeout, clearInterval, setInterval */
import {
  ROUTES,
  REDUCED,
  EASE,
  renderNav,
  activateNav,
  bindRail,
  renderView,
  setupHUD,
  bindArrows,
  animate,
  clearPrime,
  nextIndex,
} from './demo.js'

const stage = document.getElementById('stage')
let index = 0
let activeView = null
let pendingView = null
let ghost = null
let animations = []
let autoTimer = null

renderNav()
activeView = mount(0)
activateNav(ROUTES[0].id)

function mount(i) {
  const wrap = document.createElement('div')
  wrap.innerHTML = renderView(ROUTES[i])
  const view = wrap.firstElementChild
  stage.appendChild(view)
  view.scrollTop = 0
  return view
}

function cleanupGhost() {
  ghost?.remove()
  ghost = null
}

function cancel() {
  animations.forEach((a) => {
    try { a.cancel() } catch { /* noop */ }
  })
  animations = []
  cleanupGhost()
  if (pendingView && pendingView !== activeView) pendingView.remove()
  pendingView = null
  if (activeView) {
    activeView.style.opacity = '1'
    activeView.style.translate = '0 0px'
    clearPrime(activeView)
  }
}

function sourceRect(fallbackEl) {
  const el = fallbackEl || document.querySelector('.rail-item.active')
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { left: r.left, top: r.top + 9, width: 2, height: Math.max(12, r.height - 18) }
}

function play(next, dir, sourceEl) {
  cancel()
  const route = ROUTES[next]
  const sign = dir === 'back' ? -1 : 1
  const oldView = activeView
  const from = sourceRect(sourceEl)

  const newView = mount(next)
  activateNav(route.id)
  index = next

  if (REDUCED) {
    oldView?.remove()
    activeView = newView
    return
  }

  newView.style.opacity = '0'
  newView.style.translate = '0 0px'
  newView.style.background = 'var(--canvas)'

  const kicker = newView.querySelector('.kicker')
  const title = newView.querySelector('.title')
  const idx = newView.querySelector('.head-idx')
  const rule = newView.querySelector('.rule')
  const meta = newView.querySelector('.head-meta')
  const blocks = Array.from(newView.querySelectorAll('.body > *'))

  kicker.style.opacity = '0'
  title.style.opacity = '1'
  title.style.translate = '0 100%'
  idx.style.opacity = '0'
  idx.style.translate = '0 10px'
  meta.style.opacity = '0'
  meta.style.translate = '0 6px'
  rule.style.transform = 'scaleX(0)'
  rule.style.transformOrigin = sign > 0 ? 'left center' : 'right center'
  blocks.forEach((el) => {
    el.style.opacity = '0'
    el.style.translate = '0 10px'
  })

  if (oldView) {
    animations.push(animate(oldView, [
      { opacity: 1, translate: '0 0px' },
      { opacity: 0, translate: `${-12 * sign}px 0` },
    ], { duration: 140, easing: EASE.sharp }))
  }

  animations.push(animate(newView, [
    { opacity: 0 },
    { opacity: 1 },
  ], { duration: 200, easing: EASE.standard }))

  animations.push(animate(title, [
    { translate: '0 100%' },
    { translate: '0 0%' },
  ], { duration: 320, delay: 80, easing: EASE.standard }))

  animations.push(animate(idx, [
    { opacity: 0, translate: '0 10px' },
    { opacity: 1, translate: '0 0px' },
  ], { duration: 220, delay: 120, easing: EASE.standard }))

  animations.push(animate(rule, [
    { transform: 'scaleX(0)' },
    { transform: 'scaleX(1)' },
  ], { duration: 320, delay: 220, easing: EASE.standard }))

  animations.push(animate(meta, [
    { opacity: 0, translate: '0 6px' },
    { opacity: 1, translate: '0 0px' },
  ], { duration: 220, delay: 180, easing: EASE.standard }))

  blocks.forEach((el, i) => {
    animations.push(animate(el, [
      { opacity: 0, translate: '0 10px' },
      { opacity: 1, translate: '0 0px' },
    ], { duration: 220, delay: 140 + Math.min(i * 24, 72), easing: EASE.standard }))
  })

  // ── 共享元素：导航轨的高亮竖条 → 页头 kicker 的强调横线 ──
  if (from) {
    const kickerRect = kicker.getBoundingClientRect()
    const to = {
      left: kickerRect.left,
      top: kickerRect.top + (kickerRect.height - 2) / 2,
      width: 22,
      height: 2,
    }
    ghost = document.createElement('div')
    ghost.className = 'morph-bar'
    ghost.style.left = `${from.left}px`
    ghost.style.top = `${from.top}px`
    ghost.style.width = `${from.width}px`
    ghost.style.height = `${from.height}px`
    document.body.appendChild(ghost)

    const dx = to.left - from.left
    const dy = to.top - from.top
    const sx = to.width / from.width
    const sy = to.height / from.height

    animations.push(animate(ghost, [
      { transform: 'translate(0px, 0px) scale(1, 1)' },
      { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
    ], { duration: 320, easing: EASE.standard }))

    setTimeout(() => {
      if (!ghost) return
      const current = ghost
      // 保持 morph 动画的最终 transform，只淡出；元素此刻正好落在目标位置。
      animate(current, [{ opacity: 1 }, { opacity: 0 }], { duration: 100, easing: 'linear' }).finished
        .then(() => current.remove())
        .catch(() => current.remove())
      ghost = null
    }, 320)

    animations.push(animate(kicker, [
      { opacity: 0 },
      { opacity: 1 },
    ], { duration: 160, delay: 320, easing: EASE.standard }))
  } else {
    animations.push(animate(kicker, [
      { opacity: 0, translate: '0 6px' },
      { opacity: 1, translate: '0 0px' },
    ], { duration: 220, delay: 80, easing: EASE.standard }))
  }

  pendingView = newView

  setTimeout(() => {
    if (pendingView !== newView) return
    oldView?.remove()
    activeView = newView
    pendingView = null
    animations.forEach((a) => {
      try { a.cancel() } catch { /* noop */ }
    })
    animations = []
    clearPrime(newView)
    newView.style.removeProperty('background')
  }, 560)
}

function go(step) {
  play(nextIndex(index, step), step > 0 ? 'fwd' : 'back', null)
}

bindRail((next, el) => {
  if (next === index) return
  play(next, next > index ? 'fwd' : 'back', el)
})

bindArrows(() => go(-1), () => go(1))

setupHUD({
  label: 'CONTAINER MORPH / 320ms',
  onPrev: () => go(-1),
  onNext: () => go(1),
  onReplay: () => play(index, 'fwd', null),
  onAuto: (on) => {
    clearInterval(autoTimer)
    if (on) autoTimer = setInterval(() => go(1), 1600)
  },
})
