import { useEffect, useRef, useState } from 'react'
import { ACCENTS, applyAccent, readAccent } from '@core/accent'

interface Props {
  /**
   * rail   —— 导航轨底部的展开式（桌面路由域）。78px 的轨道塞不下四个圆点，
   *           所以收成一个按钮，点开浮出面板。
   * inline —— 直接横排圆点（移动端路由页头）。
   */
  variant?: 'rail' | 'inline'
}

/**
 * 强调色切换器。
 *
 * 为什么挂在**路由域**而不是首页首屏：
 * 强调色的取值来自 `:root.dark[data-accent='x']` 那套规则，而路由域是唯一的
 * 强制暗色域（Layout 的 routeMode 会加 html.dark）。放在首页首屏时，首页是
 * 浅色主题，取到的是浅色主题的暗色值 —— 画在黑底视频上几乎看不见。
 * 放进路由域，主题与强调色的组合天然自洽，不需要额外的「深色表面专用色」补丁。
 */
const AccentSwitcher = ({ variant = 'rail' }: Props) => {
  const [accent, setAccent] = useState(readAccent)
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    applyAccent(accent)
  }, [accent])

  // 展开态：点外部 / Esc 关闭。收起时不留监听。
  useEffect(() => {
    if (variant !== 'rail' || !open) return
    const onPointerDown = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [variant, open])

  if (variant === 'inline') {
    return (
      <div className="ac-acc-inline" role="group" aria-label="强调色">
        {ACCENTS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className="ac-acc-dot"
            style={{ background: preset.swatch }}
            aria-label={preset.label}
            aria-pressed={accent === preset.id}
            title={preset.label}
            onClick={() => setAccent(preset.id)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="ac-acc-rail" ref={wrapRef}>
      <button
        type="button"
        className="kk-nav-tool"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="强调色"
        title="强调色"
      >
        <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10 3.2a6.8 6.8 0 1 0 0 13.6c1.1 0 1.7-.8 1.7-1.6 0-1-.8-1.4-.8-2.1 0-.7.6-1.2 1.4-1.2h1.4a2.9 2.9 0 0 0 2.9-2.9c0-3.2-2.9-5.8-6.6-5.8z" />
          <circle cx="7.2" cy="8.4" r=".95" />
          <circle cx="11" cy="7" r=".95" />
          <circle cx="6.6" cy="12.2" r=".95" />
        </svg>
      </button>

      {open && (
        <div className="ac-acc-pop" role="group" aria-label="强调色">
          <span className="ac-acc-pop-title">ACCENT</span>
          {ACCENTS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="ac-acc-item"
              aria-pressed={accent === preset.id}
              onClick={() => setAccent(preset.id)}
            >
              <i style={{ background: preset.swatch }} aria-hidden="true" />
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default AccentSwitcher
