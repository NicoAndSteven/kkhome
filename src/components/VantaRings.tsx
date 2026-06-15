import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    VANTA: { RINGS: (opts: Record<string, unknown>) => { destroy: () => void } }
  }
}

const VantaRings = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const vantaRef = useRef<{ destroy: () => void } | null>(null)
  const [phase, setPhase] = useState<'starting' | 'active' | 'fading' | 'destroyed'>('starting')

  useEffect(() => {
    if (vantaRef.current || !window.VANTA?.RINGS) return

    const timer = setTimeout(() => {
      if (!containerRef.current) return
      vantaRef.current = window.VANTA.RINGS({
        el: containerRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        scale: 1,
        scaleMobile: 1,
        backgroundColor: 0xf5f9fc,
        color: 0x4dd0c8,
      })
      setPhase('active')
    }, 50)

    return () => clearTimeout(timer)
  }, [])

  // 监听 intro 完成 → 淡出
  useEffect(() => {
    const onIntroDone = () => setPhase('fading')
    window.addEventListener('intro-complete', onIntroDone)
    return () => window.removeEventListener('intro-complete', onIntroDone)
  }, [])

  // 淡出完成后销毁并通知
  useEffect(() => {
    if (phase !== 'fading') return
    const timer = setTimeout(() => {
      if (vantaRef.current) {
        try { vantaRef.current.destroy() } catch { /* ignore */ }
        vantaRef.current = null
      }
      setPhase('destroyed')
      window.dispatchEvent(new Event('rings-destroyed'))
    }, 1200)
    return () => clearTimeout(timer)
  }, [phase])

  if (phase === 'destroyed') return null

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        opacity: phase === 'fading' ? 0 : 1,
        transition: 'opacity 1200ms cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  )
}

export default VantaRings
