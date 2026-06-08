import { CSSProperties, useLayoutEffect, useState } from 'react'
import { MotionConfig, SiteConfig } from '@core/types'

interface Props {
  author: SiteConfig['author']
  enabled: MotionConfig['intro']
  duration: MotionConfig['introDuration']
  onComplete: () => void
}

const IntroStage = ({ author, enabled, duration, onComplete }: Props) => {
  const [visible, setVisible] = useState(enabled)

  useLayoutEffect(() => {
    const scrollLockClass = 'intro-scroll-lock'
    const root = document.documentElement
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!enabled || reduceMotion) {
      root.classList.remove(scrollLockClass)
      setVisible(false)
      onComplete()
      return
    }

    root.classList.add(scrollLockClass)
    let unlockTimer: number | undefined
    const completeTimer = window.setTimeout(() => {
      setVisible(false)
      onComplete()
      unlockTimer = window.setTimeout(() => {
        root.classList.remove(scrollLockClass)
      }, 980)
    }, duration)

    return () => {
      window.clearTimeout(completeTimer)
      if (unlockTimer) {
        window.clearTimeout(unlockTimer)
      }
      root.classList.remove(scrollLockClass)
    }
  }, [duration, enabled, onComplete])

  if (!visible) {
    return null
  }

  return (
    <div
      className="intro-stage"
      aria-hidden="true"
      style={{ '--intro-duration': `${duration}ms` } as CSSProperties}
    >
      <div className="intro-grid" />
      <div className="intro-scanline" />
      <div className="intro-core">
        <div className="intro-ring intro-ring-outer" />
        <div className="intro-ring intro-ring-inner" />
        <div className="intro-mark">
          <span>可</span>
        </div>
      </div>
      <div className="intro-copy">
        <span className="intro-kicker">PERSONAL SYSTEM ONLINE</span>
        <span className="intro-name">{author}</span>
      </div>
    </div>
  )
}

export default IntroStage
