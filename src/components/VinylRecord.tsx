interface Props {
  isPlaying: boolean
  size?: number
  coverSrc?: string
  className?: string
}

const VinylRecord = ({ isPlaying, size = 160, coverSrc = '/images/yuanyu.png', className = '' }: Props) => {
  const coverSize = size * 0.52 // 封面占比 52%，头像清晰可见
  const holeSize = size * 0.06  // 中心小孔

  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* 唱片投影 */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: `0 ${size * 0.15}px ${size * 0.4}px -${size * 0.12}px rgba(0,0,0,0.45)`,
        }}
      />

      {/* 唱片盘体 */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: [
            `radial-gradient(circle at 35% 30%,
              rgba(50,50,60,0.5) 0%,
              rgba(15,15,22,0.95) 35%,
              rgba(8,8,12,1) 65%,
              rgba(3,3,6,1) 100%)`,
          ].join(''),
          boxShadow: [
            `inset 0 -${size * 0.04}px ${size * 0.1}px rgba(0,0,0,0.6)`,
            `inset 0 ${size * 0.03}px ${size * 0.06}px rgba(255,255,255,0.03)`,
          ].join(','),
          animation: isPlaying ? 'vinyl-spin 2s linear infinite' : 'none',
        }}
      >
        {/* 唱片纹路 — 从外到内 */}
        {[6, 13, 20, 27, 33].map((pct) => (
          <div
            key={pct}
            className="absolute inset-0 rounded-full"
            style={{
              margin: `${pct}%`,
              border: '1px solid rgba(255,255,255,0.025)',
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* 光晕 — 播放时更明显 */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: isPlaying
              ? 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.03) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 40%, transparent 70%, rgba(255,255,255,0.02) 100%)',
            animation: isPlaying ? 'vinyl-shine 4s ease-in-out infinite' : 'none',
            pointerEvents: 'none',
          }}
        />

        {/* 专辑封面区域 — 嵌入唱片刻蚀区 */}
        <div
          className="absolute left-1/2 top-1/2 overflow-hidden rounded-full"
          style={{
            width: coverSize,
            height: coverSize,
            marginLeft: -coverSize / 2,
            marginTop: -coverSize / 2,
            border: '1.5px solid rgba(255,255,255,0.06)',
            boxShadow: [
              'inset 0 0 20px rgba(0,0,0,0.5)',
              '0 0 30px rgba(0,0,0,0.3)',
            ].join(','),
          }}
        >
          <img
            src={coverSrc}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>

        {/* 中心小孔 */}
        <div
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: holeSize,
            height: holeSize,
            marginLeft: -holeSize / 2,
            marginTop: -holeSize / 2,
            background: 'radial-gradient(circle at 40% 35%, rgba(60,60,70,0.8), rgba(20,20,25,0.95) 60%, rgba(5,5,8,1) 100%)',
            border: '1px solid rgba(255,255,255,0.04)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)',
          }}
        />
      </div>
    </div>
  )
}

export default VinylRecord
