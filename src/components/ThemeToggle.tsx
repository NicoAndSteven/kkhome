import { useEffect, useState } from 'react'
import { SiteConfig, Theme } from '@core/types'
import Icon from './Icon'

interface Props {
  initialTheme?: SiteConfig['theme']
}

const ThemeToggle = ({ initialTheme = 'light' }: Props) => {
  const [theme, setTheme] = useState<Theme>('light')

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
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-white/80 text-on-surface transition-premium hover:border-primary/25 hover:bg-white"
      aria-label="切换明暗主题"
      title={theme === 'dark' ? '切换到浅色' : '切换到深色'}
    >
      <Icon name={theme === 'dark' ? 'dark_mode' : 'light_mode'} className="text-lg" />
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
