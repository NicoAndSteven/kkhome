import React, { PropsWithChildren } from 'react'
import { AbsoluteFill } from 'remotion'

export const PartyFrame: React.FC<PropsWithChildren<{ accent?: string }>> = ({ accent = '#f4d35e', children }) => {
  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(circle at top, rgba(244,211,94,0.14), transparent 28%), linear-gradient(180deg, #121514 0%, #181d1a 100%)',
        color: '#f6f2e8',
        fontFamily: '"Segoe UI", "PingFang SC", sans-serif',
        padding: '96px 72px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 40,
          borderRadius: 52,
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: `0 40px 120px -64px ${accent}`,
        }}
      />
      {children}
    </AbsoluteFill>
  )
}
