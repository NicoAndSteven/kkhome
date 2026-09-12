import { ReactNode, useEffect } from 'react'

interface Props {
  children: ReactNode
  routeMode?: boolean
}

const Layout = ({ children, routeMode = false }: Props) => {
  // Action-Cut 路由域「暗到底」：进入路由强制 html.dark，回到首页恢复用户存储的主题
  useEffect(() => {
    const root = document.documentElement
    if (routeMode) {
      root.classList.add('dark')
      return
    }
    const saved = localStorage.getItem('theme')
    root.classList.toggle('dark', saved === 'dark')
  }, [routeMode])

  return (
    <div className={`min-h-screen bg-background text-on-background selection:bg-primary selection:text-on-primary ${routeMode ? 'route-mode' : ''}`}>
      <div className="interactive-bg fixed top-0 left-0 w-screen h-screen -z-10" />

      <div className="relative w-full">
        {children}
      </div>
    </div>
  )
}

export default Layout
