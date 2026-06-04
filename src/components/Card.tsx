import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  hover?: boolean
}

const Card = ({ children, className = '', hover = true }: Props) => {
  return (
    <div
      className={`
        glass rounded-lg p-lg relative overflow-hidden
        ${hover ? 'hover:translate-y-[-4px] hover:scale-[1.01] hover:border-[rgba(34,211,238,0.3)] hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5),0_0_20px_rgba(34,211,238,0.05)] cursor-pointer' : ''}
        transition-premium
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export default Card
