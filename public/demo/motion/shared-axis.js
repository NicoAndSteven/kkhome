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

function resetView(view) {
  if (!view) return
  view.style.opacity = '1'
  view.style.translate = '0 0px'
}

function cancel() {
  animations.forEach((a) => {
    try { a.cancel() } catch { /* noop */ }
  })
  animations = []
  if (pendingView && pendingView !== activeView) pendingView.remove()
  pendingView = null
  resetView(activeView)
  clearPrime(activeView)
}

function play(next, dir) {
  cancel()
  const route = ROUTES[next]
  const sign = dir === 'back' ? -1 : 1
  const oldView = activeView

  const newView = mount(next)
  activateNav(route.id)
  index = next

  if (REDUCED) {
    oldView?.remove()
    activeView = newView
    return
  }

  newView.style.opacity = '0'
  newView.style.translate = `${24 * sign}px 0`

  const kicker = newView.querySelector('.kicker')
  const title = newView.querySelector('.title')
  const idx = newView.querySelector('.head-idx')
  const rule = newView.querySelector('.rule')
  const meta = newView.querySelector('.head-meta')
  const blocks = Array.from(newView.querySelectorAll('.body > *'))

  for (const [el, rise] of [[kicker, 6], [title, 20], [idx, 10], [meta, 6]]) {
    el.style.opacity = '0'
    el.style.translate = `0 ${rise}px`
  }
  rule.style.transform = 'scaleX(0)'
  rule.style.transformOrigin = sign > 0 ? 'left center' : 'right center'
  blocks.forEach((el) => {
    el.style.opacity = '0'
    el.style.translate = '0 8px'
  })

  if (oldView) {
    animations.push(animate(oldView, [
      { opacity: 1, translate: '0 0px' },
      { opacity: 0, translate: `${-16 * sign}px 0` },
    ], { duration: 160, easing: EASE.sharp }))
  }

  animations.push(animate(newView, [
    { opacity: 0, translate: `${24 * sign}px 0` },
    { opacity: 1, translate: '0 0px' },
  ], { duration: 240, delay: 40, easing: EASE.standard }))

  animations.push(animate(title, [
    { opacity: 0, translate: '0 20px' },
    { opacity: 1, translate: '0 0px' },
  ], { duration: 280, delay: 80, easing: EASE.standard }))

  animations.push(animate(kicker, [
    { opacity: 0, translate: '0 6px' },
    { opacity: 1, translate: '0 0px' },
  ], { duration: 200, delay: 60, easing: EASE.standard }))

  animations.push(animate(idx, [
    { opacity: 0, translate: '0 10px' },
    { opacity: 1, translate: '0 0px' },
  ], { duration: 200, delay: 90, easing: EASE.standard }))

  animations.push(animate(rule, [
    { transform: 'scaleX(0)' },
    { transform: 'scaleX(1)' },
  ], { duration: 320, delay: 100, easing: EASE.standard }))

  animations.push(animate(meta, [
    { opacity: 0, translate: '0 6px' },
    { opacity: 1, translate: '0 0px' },
  ], { duration: 200, delay: 120, easing: EASE.standard }))

  blocks.forEach((el, i) => {
    animations.push(animate(el, [
      { opacity: 0, translate: '0 8px' },
      { opacity: 1, translate: '0 0px' },
    ], { duration: 200, delay: 100 + Math.min(i * 24, 72), easing: EASE.standard }))
  })

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
  }, 460)
}

function go(step) {
  play(nextIndex(index, step), step > 0 ? 'fwd' : 'back')
}

bindRail((next) => {
  if (next === index) return
  play(next, next > index ? 'fwd' : 'back')
})

bindArrows(() => go(-1), () => go(1))

setupHUD({
  label: 'SHARED AXIS / 240ms',
  onPrev: () => go(-1),
  onNext: () => go(1),
  onReplay: () => play(index, 'fwd'),
  onAuto: (on) => {
    clearInterval(autoTimer)
    if (on) autoTimer = setInterval(() => go(1), 1500)
  },
})
