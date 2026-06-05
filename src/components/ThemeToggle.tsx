import { useEffect, useState } from 'react'
import { SiteConfig, Theme } from '@core/types'
import Icon from './Icon'

interface Props {
  initialTheme?: SiteConfig['theme']
}

const ThemeToggle = ({ initialTheme = 'dark' }: Props) => {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const resolvedTheme = resolveTheme(savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : initialTheme)
    setTheme(resolvedTheme)
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
  }, [initialTheme])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    localStorage.setItem('theme', nextTheme)
    document.documentElement.classList.toggle('dark', nextTheme === 'dark')
  }

  return (
    <button
      onClick={toggleTheme}
      className="rounded-[2px] p-2 text-on-surface transition-premium hover:bg-surface-card/70"
      aria-label="切换主题"
    >
      <Icon name={theme === 'dark' ? 'dark_mode' : 'light_mode'} className="text-xl" />
    </button>
  )
}

const resolveTheme = (theme: SiteConfig['theme']): Theme => {
  if (theme === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  return theme
}

export default ThemeToggle
