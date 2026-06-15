import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    VANTA: { BIRDS: (opts: Record<string, unknown>) => { destroy: () => void } }
  }
}

const VantaBirds = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const vantaRef = useRef<{ destroy: () => void } | null>(null)
  const [visible, setVisible] = useState(false)

  // Rings 销毁后启动 Birds
  useEffect(() => {
    const onRingsDone = () => {
      // 先标记可见（触发淡入）
      setVisible(true)
      // 再初始化 Vanta
      setTimeout(() => {
        if (!containerRef.current || vantaRef.current || !window.VANTA?.BIRDS) return
        vantaRef.current = window.VANTA.BIRDS({
          el: containerRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          scale: 1,
          scaleMobile: 1,
          color1: 0x904487,
          color2: 0x32a1a6,
          birdSize: 1.2,
          speedLimit: 7,
          backgroundColor: 0xf5f9fc,
        })
      }, 100)
    }

    window.addEventListener('rings-destroyed', onRingsDone)
    return () => window.removeEventListener('rings-destroyed', onRingsDone)
  }, [])

  useEffect(() => {
    return () => {
      if (vantaRef.current) {
        try { vantaRef.current.destroy() } catch { /* ignore */ }
        vantaRef.current = null
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
        opacity: visible ? 1 : 0,
        transition: 'opacity 1200ms cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  )
}

export default VantaBirds
