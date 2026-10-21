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
  nextIndex,
} from './demo.js'

const stage = document.getElementById('stage')
let index = 0
let animations = []
let extras = []
let autoTimer = null

renderNav()
stage.innerHTML = renderView(ROUTES[0])
activateNav(ROUTES[0].id)

function cancel() {
  animations.forEach((a) => {
    try { a.cancel() } catch { /* noop */ }
  })
  animations = []
  extras.forEach((el) => el.remove())
  extras = []
}

function play(next, dir) {
  cancel()
  const route = ROUTES[next]
  const sign = dir === 'back' ? -1 : 1

  stage.innerHTML = renderView(route)
  activateNav(route.id)
  index = next
  stage.querySelector('.view').scrollTop = 0

  if (REDUCED) return

  const view = stage.querySelector('.view')
  const kicker = view.querySelector('.kicker')
  const title = view.querySelector('.title')
  const idx = view.querySelector('.head-idx')
  const rule = view.querySelector('.rule')
  const meta = view.querySelector('.head-meta')

  kicker.style.opacity = '0'
  kicker.style.translate = `0 ${8 * sign}px`
  title.style.opacity = '0'
  title.style.translate = `0 ${24 * sign}px`
  idx.style.opacity = '0'
  idx.style.translate = `0 ${10 * sign}px`
  meta.style.opacity = '0'
  meta.style.translate = `0 ${6 * sign}px`
  rule.style.transform = 'scaleX(0)'
  rule.style.transformOrigin = sign > 0 ? 'left center' : 'right center'
  view.querySelectorAll('.body > *').forEach((el) => {
    el.style.opacity = '0'
    el.style.translate = '0 8px'
  })

  const accent = document.createElement('div')
  accent.className = 'curtain accent'
  const canvas = document.createElement('div')
  canvas.className = 'curtain canvas'
  const big = document.createElement('div')
  big.className = 'curtain-idx'
  big.textContent = route.idx

  const origin = sign > 0 ? 'left center' : 'right center'
  accent.style.transformOrigin = origin
  canvas.style.transformOrigin = origin
  accent.style.transform = 'scaleX(1)'
  canvas.style.transform = 'scaleX(1)'
  big.style.opacity = '0.85'
  document.body.append(canvas, accent, big)
  extras.push(canvas, accent, big)

  animations.push(animate(accent, [
    { transform: 'scaleX(1)' },
    { transform: 'scaleX(0)' },
  ], { duration: 340, easing: EASE.expo }))

  animations.push(animate(canvas, [
    { transform: 'scaleX(1)' },
    { transform: 'scaleX(0)' },
  ], { duration: 380, delay: 40, easing: EASE.expo }))

  animations.push(animate(big, [
    { opacity: 0.85, transform: 'scale(1)' },
    { opacity: 0, transform: 'scale(1.1)' },
  ], { duration: 160, easing: EASE.sharp }))

  // 内容在幕布还没走完时就开始进场（80–160ms），而不是等幕布完全消失。
  animations.push(animate(kicker, [
    { opacity: 0, translate: `0 ${8 * sign}px` },
    { opacity: 1, translate: '0 0px' },
  ], { duration: 200, delay: 60, easing: EASE.standard }))

  animations.push(animate(title, [
    { opacity: 0, translate: `0 ${24 * sign}px` },
    { opacity: 1, translate: '0 0px' },
  ], { duration: 320, delay: 90, easing: EASE.standard }))

  animations.push(animate(idx, [
    { opacity: 0, translate: `0 ${10 * sign}px` },
    { opacity: 1, translate: '0 0px' },
  ], { duration: 200, delay: 100, easing: EASE.standard }))

  animations.push(animate(rule, [
    { transform: 'scaleX(0)' },
    { transform: 'scaleX(1)' },
  ], { duration: 360, delay: 120, easing: EASE.standard }))

  animations.push(animate(meta, [
    { opacity: 0, translate: `0 ${6 * sign}px` },
    { opacity: 1, translate: '0 0px' },
  ], { duration: 200, delay: 160, easing: EASE.standard }))

  view.querySelectorAll('.body > *').forEach((el, i) => {
    animations.push(animate(el, [
      { opacity: 0, translate: '0 8px' },
      { opacity: 1, translate: '0 0px' },
    ], { duration: 220, delay: 80 + Math.min(i * 24, 120), easing: EASE.standard }))
  })

  setTimeout(() => {
    accent.remove()
    canvas.remove()
    big.remove()
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
  label: 'SIGNATURE CUT / 400ms',
  onPrev: () => go(-1),
  onNext: () => go(1),
  onReplay: () => play(index, 'fwd'),
  onAuto: (on) => {
    clearInterval(autoTimer)
    if (on) autoTimer = setInterval(() => go(1), 1500)
  },
})
