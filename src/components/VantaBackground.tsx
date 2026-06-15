import { useEffect, useRef } from 'react'

interface Props {
  effect?: 'waves' | 'clouds' | 'fog' | 'net'
  color?: string
  backgroundColor?: string
  mouseControls?: boolean
  touchControls?: boolean
  gyroControls?: boolean
  minHeight?: number
  minWidth?: number
  opacity?: number
}

/**
 * Vanta.js 动态背景组件（动态加载 three.js + Vanta CDN）
 * 只在组件挂载时加载，不增加主包体积
 */
const VantaBackground = ({
  effect = 'waves',
  color = '#4DD0C8',
  backgroundColor = '#F5F9FC',
  mouseControls = true,
  touchControls = true,
  gyroControls = false,
  minHeight = 200,
  minWidth = 200,
  opacity = 0.7,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const vantaRef = useRef<{ destroy: () => void } | null>(null)

  useEffect(() => {
    if (vantaRef.current) return
    let cancelled = false

    const initVanta = async () => {
      try {
        // 1. 动态加载 three.js
        const THREE = await import('three')

        // 2. 动态加载 Vanta.js 脚本（从 CDN）
        const effectScripts: Record<string, string> = {
          waves: 'vanta.waves.min.js',
          clouds: 'vanta.clouds.min.js',
          fog: 'vanta.fog.min.js',
          net: 'vanta.net.min.js',
        }

        const scriptName = effectScripts[effect] ?? effectScripts.waves
        await new Promise<void>((resolve, reject) => {
          const existing = document.querySelector(`script[src*="${scriptName}"]`)
          if (existing) { resolve(); return }

          const script = document.createElement('script')
          script.src = `https://cdn.jsdelivr.net/npm/vanta@latest/dist/${scriptName}`
          script.async = true
          script.onload = () => resolve()
          script.onerror = () => reject(new Error(`Failed to load Vanta/${scriptName}`))
          document.head.appendChild(script)
        })

        if (cancelled || !containerRef.current) return

        // 3. 挂载 THREE 到全局（Vanta 需要）
        ;(window as any).THREE = THREE

        // 4. 初始化 Vanta 效果
        const effectName = effect.charAt(0).toUpperCase() + effect.slice(1)
        const VantaCtor = (window as any).VANTA?.[effectName]
        if (!VantaCtor) {
          console.warn(`VANTA.${effectName} not available`)
          return
        }

        vantaRef.current = VantaCtor({
          el: containerRef.current,
          mouseControls,
          touchControls,
          gyroControls,
          minHeight,
          minWidth,
          scale: 1,
          scaleMobile: 1,
          color,
          backgroundColor,
          shininess: 30,
          waveHeight: 15,
          waveSpeed: 0.8,
          zoom: 0.8,
        })
      } catch (err) {
        console.warn('Vanta background init failed (non-critical):', err)
      }
    }

    initVanta()

    return () => {
      cancelled = true
      if (vantaRef.current) {
        try { vantaRef.current.destroy() } catch { /* ignore */ }
        vantaRef.current = null
      }
    }
  }, [effect, color, backgroundColor, mouseControls, touchControls, gyroControls, minHeight, minWidth])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        opacity,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  )
}

export default VantaBackground
