import { useCallback, useRef } from 'react'

interface TiltOptions {
  maxTilt?: number
  scale?: number
  perspective?: number
  speed?: number
}

export function useTilt<T extends HTMLElement = HTMLDivElement>(options: TiltOptions = {}) {
  const { maxTilt = 6, scale = 1.02, perspective = 800, speed = 300 } = options
  const ref = useRef<T>(null)

  const onMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      const el = ref.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      const rotateX = ((y - centerY) / centerY) * -maxTilt
      const rotateY = ((x - centerX) / centerX) * maxTilt

      el.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`

      // 阴影跟随光源方向
      const shadowX = ((x - centerX) / centerX) * 12
      const shadowY = ((y - centerY) / centerY) * 12
      el.style.boxShadow = `${shadowX}px ${shadowY}px 40px -20px rgba(8,145,178,0.2)`
    },
    [maxTilt, scale, perspective],
  )

  const onMouseLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
    el.style.boxShadow = ''
  }, [perspective])

  return {
    ref,
    onMouseMove,
    onMouseLeave,
    style: { transition: `transform ${speed}ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow ${speed}ms cubic-bezier(0.16, 1, 0.3, 1)` } as React.CSSProperties,
  }
}
