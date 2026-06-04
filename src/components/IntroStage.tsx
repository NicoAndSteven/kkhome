import { CSSProperties, useEffect, useState } from 'react'
import { MotionConfig, SiteConfig } from '@core/types'

interface Props {
  author: SiteConfig['author']
  enabled: MotionConfig['intro']
  duration: MotionConfig['introDuration']
  onComplete: () => void
}

const IntroStage = ({ author, enabled, duration, onComplete }: Props) => {
  const [visible, setVisible] = useState(enabled)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!enabled || reduceMotion) {
      setVisible(false)
      onComplete()
      return
    }

    const completeTimer = window.setTimeout(() => {
      setVisible(false)
      onComplete()
    }, duration)

    return () => window.clearTimeout(completeTimer)
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
          <span>{author.slice(0, 1).toUpperCase()}</span>
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
