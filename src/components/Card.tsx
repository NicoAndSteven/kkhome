import { ReactNode } from 'react'
import { useTilt } from '@/hooks/useTilt'

interface Props {
  children: ReactNode
  className?: string
  hover?: boolean
}

const Card = ({ children, className = '', hover = true }: Props) => {
  const tilt = useTilt({ maxTilt: 5, scale: 1.015 })

  return (
    <div
      className={[
        'surface-panel relative overflow-hidden rounded-2xl p-lg transition-premium',
        hover ? 'cursor-pointer hover:-translate-y-1 hover:border-primary/30 hover:bg-white/6' : '',
        className,
      ].join(' ')}
      {...tilt}
    >
      {children}
    </div>
  )
}

export default Card
