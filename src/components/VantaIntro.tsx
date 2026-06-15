import { useEffect, useRef, useState } from 'react'

interface Props {
  /** introComplete 后延迟多久开始淡出 (ms) */
  fadeDelay?: number
  /** 淡出持续时间 (ms) */
  fadeDuration?: number
}

declare global {
  interface Window {
    VANTA: { RINGS: (opts: Record<string, unknown>) => { destroy: () => void } }
  }
}

const VantaIntro = ({ fadeDelay = 600, fadeDuration = 1500 }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const vantaRef = useRef<{ destroy: () => void } | null>(null)
  const [phase, setPhase] = useState<'loading' | 'active' | 'fading' | 'done'>('loading')

  // 初始化 Vanta
  useEffect(() => {
    if (vantaRef.current || !window.VANTA?.RINGS) return

    // 短暂延迟让 DOM 挂载
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
    }, 100)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  // 监听 introComplete
  useEffect(() => {
    const handleIntroDone = () => {
      setTimeout(() => setPhase('fading'), fadeDelay)
    }
    // 等待现有 intro 的 onComplete
    const check = () => {
      const shell = document.querySelector('.page-shell.page-ready')
      if (shell) {
        setTimeout(() => setPhase('fading'), fadeDelay)
        return
      }
      requestAnimationFrame(check)
    }
    // 如果 intro 已完成（如博客页面直接进入）
    const timer = setTimeout(check, 500)

    window.addEventListener('intro-complete', handleIntroDone)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('intro-complete', handleIntroDone)
    }
  }, [fadeDelay])

  // 淡出完成后销毁
  useEffect(() => {
    if (phase !== 'fading') return
    const timer = setTimeout(() => {
      setPhase('done')
      if (vantaRef.current) {
        try { vantaRef.current.destroy() } catch { /* ignore */ }
        vantaRef.current = null
      }
    }, fadeDuration)
    return () => clearTimeout(timer)
  }, [phase, fadeDuration])

  if (phase === 'done') return null

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: phase === 'active' ? 1 : phase === 'fading' ? 1 : 0,
        opacity: phase === 'fading' ? 0 : 1,
        transition: `opacity ${fadeDuration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  )
}

export default VantaIntro
