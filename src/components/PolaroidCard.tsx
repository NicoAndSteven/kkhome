interface Props {
  src?: string
  size?: number
  alt?: string
  className?: string
  rotating?: boolean
  hideLabel?: boolean
}

const PolaroidCard = ({ src = '/images/yuanyu.png', size = 160, alt = '', className = '', rotating = false, hideLabel = false }: Props) => {
  const imageSize = size
  const cardWidth = Math.round(imageSize * 1.12)
  const cardHeight = hideLabel ? Math.round(imageSize * 1.04) : Math.round(imageSize * 1.32)

  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{
        width: cardWidth,
        height: cardHeight,
        animation: rotating ? 'polaroid-float 3s ease-in-out infinite' : 'none',
      }}
      aria-hidden="true"
    >
      {/* 拍立得阴影 */}
      <div
        className="absolute inset-0"
        style={{
          borderRadius: 4,
          boxShadow: [
            `0 ${size * 0.08}px ${size * 0.3}px -${size * 0.06}px rgba(45,42,36,0.2)`,
            `0 ${size * 0.02}px ${size * 0.06}px rgba(45,42,36,0.06)`,
          ].join(','),
        }}
      />

      {/* 拍立得卡片 */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          borderRadius: 4,
          background: '#fffcf8',
          border: '1px solid rgba(45,42,36,0.06)',
        }}
      >
        {/* 照片区域 */}
        <div
          className="absolute overflow-hidden"
          style={{
            top: '6%',
            left: '5%',
            width: '90%',
            height: hideLabel ? '88%' : '72%',
            borderRadius: 2,
            boxShadow: 'inset 0 0 4px rgba(0,0,0,0.06)',
          }}
        >
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
            draggable={false}
          />

          {/* 照片高光 */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.03) 100%)',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* 底部留白区域 */}
        {!hideLabel && (
          <div
            className="absolute flex items-center justify-center"
            style={{
              bottom: 0,
              left: 0,
              right: 0,
              height: '22%',
              padding: '0 10%',
            }}
          >
            <span
              className="font-label-mono"
              style={{
                fontSize: Math.max(7, size * 0.045),
                lineHeight: 1.2,
                color: '#8a8279',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%',
              }}
            >
              {alt || '垣钰 · 2025'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default PolaroidCard
