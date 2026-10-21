/* global document, window, setTimeout, clearInterval, setInterval */
import { ROUTES, REDUCED, EASE, animate, nextIndex } from './demo.js'

const routes = ROUTES.slice(1, 6)
const content = document.getElementById('m-content')
const tabs = document.getElementById('m-tabs')
const actions = document.querySelector('.m-actions')

let index = 0
let activeView = null
let pendingView = null
let animations = []
let autoTimer = null

function viewHTML(route) {
  return `<div class="m-view">
    <span class="m-kicker">MODULE / ${route.en}</span>
    <h1 class="m-title">${route.title}</h1>
    <p class="m-sub">${route.line}</p>
    <div class="m-cards">
      ${route.notes
        .map(
          ([tag, title, text]) => `<div class="m-card">
            <b>${tag}</b>
            <h3>${title}</h3>
            <p>${text}</p>
          </div>`,
        )
        .join('')}
    </div>
  </div>`
}

function mount(i) {
  const wrap = document.createElement('div')
  wrap.innerHTML = viewHTML(routes[i])
  const view = wrap.firstElementChild
  content.appendChild(view)
  view.scrollTop = 0
  return view
}

function renderTabs() {
  tabs.innerHTML = routes
    .map(
      (r, i) => `<button class="m-tab" type="button" role="tab" data-i="${i}" aria-selected="${i === 0}">
        <b>${r.idx}</b><span>${r.label}</span>
      </button>`,
    )
    .join('')
}

function activateTabs(i) {
  tabs.querySelectorAll('.m-tab').forEach((el, n) => {
    el.classList.toggle('active', n === i)
    el.setAttribute('aria-selected', String(n === i))
  })
}

function cancel() {
  animations.forEach((a) => {
    try { a.cancel() } catch { /* noop */ }
  })
  animations = []
  if (pendingView && pendingView !== activeView) pendingView.remove()
  pendingView = null
  if (activeView) activeView.style.opacity = '1'
}

function finish(newView) {
  if (pendingView !== newView) return
  pendingView = null
  animations.forEach((a) => {
    try { a.cancel() } catch { /* noop */ }
  })
  animations = []
  newView.style.removeProperty('opacity')
}

function play(next) {
  cancel()
  const oldView = activeView
  const newView = mount(next)
  index = next
  activateTabs(next)

  if (REDUCED) {
    oldView?.remove()
    activeView = newView
    return
  }

  newView.style.opacity = '0'
  pendingView = newView

  // 先让旧内容退干净，再淡入新内容：crossfade 会让两页文字短暂叠在一起。
  if (oldView) {
    animations.push(animate(oldView, [
      { opacity: 1, transform: 'scale(1)' },
      { opacity: 0, transform: 'scale(1.015)' },
    ], { duration: 100, easing: 'linear' }))

    setTimeout(() => {
      if (pendingView !== newView) return
      oldView.remove()
      activeView = newView
      const fadeIn = animate(newView, [
        { opacity: 0, transform: 'scale(0.985)' },
        { opacity: 1, transform: 'scale(1)' },
      ], { duration: 140, easing: EASE.standard })
      animations.push(fadeIn)
      setTimeout(() => finish(newView), 150)
    }, 100)
  } else {
    const fadeIn = animate(newView, [
      { opacity: 0, transform: 'scale(0.985)' },
      { opacity: 1, transform: 'scale(1)' },
    ], { duration: 140, easing: EASE.standard })
    animations.push(fadeIn)
    setTimeout(() => finish(newView), 150)
  }
}

function go(step) {
  play(nextIndex(index, step))
}

renderTabs()
activeView = mount(0)
activateTabs(0)

tabs.addEventListener('click', (event) => {
  const tab = event.target.closest('.m-tab')
  if (!tab) return
  const next = Number(tab.dataset.i)
  if (next !== index) play(next)
})

actions.querySelector('[data-act="prev"]').addEventListener('click', () => go(-1))
actions.querySelector('[data-act="next"]').addEventListener('click', () => go(1))
actions.querySelector('[data-act="replay"]').addEventListener('click', () => play(index))

const autoBtn = actions.querySelector('[data-act="auto"]')
let autoOn = false
autoBtn.addEventListener('click', () => {
  autoOn = !autoOn
  autoBtn.classList.toggle('on', autoOn)
  clearInterval(autoTimer)
  if (autoOn) autoTimer = setInterval(() => go(1), 1400)
})

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') go(-1)
  if (event.key === 'ArrowRight') go(1)
})
