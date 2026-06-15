import { useCallback, useEffect, useState } from 'react'

interface Quote {
  text: string
  author: string
  source: string
}

function getQuoteOfTheDay(quotes: Quote[]): Quote | null {
  if (quotes.length === 0) return null
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000)
  return quotes[dayOfYear % quotes.length]
}

const WelcomeScreen = () => {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    fetch('/config/quotes.json')
      .then((res) => res.json())
      .then((data: Quote[]) => setQuote(getQuoteOfTheDay(data)))
      .catch(() => {})
  }, [])

  // 入场动画延迟
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 400)
    return () => clearTimeout(timer)
  }, [])

  const handleEnter = useCallback(() => {
    window.location.hash = '#/ai-tools'
  }, [])

  return (
    <div className="welcome-screen">
      <div className={`welcome-content ${visible ? 'visible' : ''}`}>
        {/* 品牌标志 */}
        <div className="welcome-logo">
          <span className="welcome-logo-inner">K</span>
        </div>

        {/* 名字 */}
        <h1 className="welcome-title">垣钰</h1>

        {/* 每日一言 */}
        {quote && (
          <p className="welcome-quote">
            <span className="welcome-quote-text">"{quote.text}"</span>
            <span className="welcome-quote-author">
              — {quote.author}{quote.source ? ` · ${quote.source}` : ''}
            </span>
          </p>
        )}

        {/* 进入按钮 */}
        <button
          type="button"
          onClick={handleEnter}
          className="welcome-enter-btn"
        >
          开始使用
          <span className="welcome-enter-arrow">→</span>
        </button>
      </div>
    </div>
  )
}

export default WelcomeScreen
