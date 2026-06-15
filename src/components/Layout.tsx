import { ReactNode, useEffect } from 'react'

interface Props {
  children: ReactNode
  routeMode?: boolean
}

const Layout = ({ children, routeMode = false }: Props) => {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100
      const y = (e.clientY / window.innerHeight) * 100
      document.documentElement.style.setProperty('--mouse-x', `${x}%`)
      document.documentElement.style.setProperty('--mouse-y', `${y}%`)

      // Subtle orb parallax based on mouse position
      const orbs = document.querySelectorAll('.orb-glow')
      orbs.forEach((orb) => {
        const el = orb as HTMLElement
        const speed = el.dataset.speed ? parseFloat(el.dataset.speed) : 0.02
        const dx = (x - 50) * speed
        const dy = (y - 50) * speed
        el.style.setProperty('--orb-x', `${dx}px`)
        el.style.setProperty('--orb-y', `${dy}px`)
        el.style.transform = `translate(calc(var(--orb-x, 0px) + 0px), calc(var(--orb-y, 0px) + 0px))`
      })
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className={`min-h-screen bg-background text-on-background selection:bg-primary selection:text-on-primary ${routeMode ? 'route-mode' : ''}`}>
      <div className="interactive-bg fixed top-0 left-0 w-screen h-screen -z-10" />
      <div className="orb-glow orb-primary" data-speed="0.025" aria-hidden="true" />
      <div className="orb-glow orb-secondary" data-speed="0.018" aria-hidden="true" />
      <div className="orb-glow orb-ambient" data-speed="0.015" aria-hidden="true" />

      <div className="w-full">
        {children}
      </div>
    </div>
  )
}

export default Layout
