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
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className={`min-h-screen bg-background text-on-background selection:bg-primary selection:text-on-primary ${routeMode ? 'route-mode' : ''}`}>
      <div className="interactive-bg fixed top-0 left-0 w-screen h-screen -z-10" />
      
      <div className="w-full">
        {children}
      </div>
    </div>
  )
}

export default Layout
