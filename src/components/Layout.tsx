import { ReactNode, useEffect } from 'react'

interface Props {
  children: ReactNode
}

const Layout = ({ children }: Props) => {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100
      const y = (e.clientY / window.innerHeight) * 100
      document.documentElement.style.setProperty('--mouse-x', `${x}%`)
      document.documentElement.style.setProperty('--mouse-y', `${y}%`)
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-background text-on-background selection:bg-primary selection:text-on-primary">
      <div 
        className="interactive-bg fixed top-0 left-0 w-screen h-screen -z-10"
        style={{
          background: `linear-gradient(115deg, rgba(216, 185, 120, 0.045), transparent 38%),
                       linear-gradient(180deg, rgba(255,255,255,0.035), transparent 16%),
                       radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(138, 221, 236, 0.055), transparent 24%),
                       #0d0d0c`,
          transition: 'background 0.3s ease'
        }}
      />
      
      <div className="w-full">
        {children}
      </div>
    </div>
  )
}

export default Layout
