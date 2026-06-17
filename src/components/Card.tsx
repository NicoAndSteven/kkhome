import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  hover?: boolean
}

const Card = ({ children, className = '', hover = true }: Props) => {
  return (
    <div
      className={[
        'surface-panel relative overflow-hidden rounded-2xl p-lg transition-premium',
        hover ? 'cursor-pointer hover:-translate-y-1 hover:border-primary/30 hover:bg-white/6' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

export default Card
