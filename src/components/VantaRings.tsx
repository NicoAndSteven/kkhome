import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    VANTA: { RINGS: (opts: Record<string, unknown>) => { destroy: () => void } }
  }
}

const VantaRings = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const vantaRef = useRef<{ destroy: () => void } | null>(null)

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
    }, 100)

    return () => {
      clearTimeout(timer)
      if (vantaRef.current) {
        try { vantaRef.current.destroy() } catch { /* ignore */ }
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  )
}

export default VantaRings
