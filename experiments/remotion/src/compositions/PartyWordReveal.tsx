/* eslint-disable react-refresh/only-export-components */

import React from 'react'
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { z } from 'zod'
import { PartyFrame } from './PartyFrame'

export const partyWordRevealSchema = z.object({
  nickname: z.string(),
  roleLabel: z.string(),
  privateWord: z.string(),
})

type Props = z.infer<typeof partyWordRevealSchema>

export const PartyWordReveal: React.FC<Props> = ({ nickname, roleLabel, privateWord }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const scale = spring({ frame, fps, config: { damping: 11 } })
  const glow = interpolate(frame, [0, 40], [0.2, 1], { extrapolateRight: 'clamp' })

  return (
    <PartyFrame accent={`rgba(244,211,94,${glow})`}>
      <div style={{ fontSize: 28, opacity: 0.6 }}>Private Reveal</div>
      <h1 style={{ margin: '22px 0 10px', fontSize: 92 }}>{nickname}</h1>
      <p style={{ margin: 0, fontSize: 30, opacity: 0.7 }}>{roleLabel}</p>

      <div
        style={{
          marginTop: 120,
          borderRadius: 44,
          padding: '88px 48px',
          background: '#f7f0d5',
          color: '#161a17',
          textAlign: 'center',
          transform: `scale(${0.86 + scale * 0.14})`,
        }}
      >
        <div style={{ fontSize: 26, opacity: 0.45 }}>你的词</div>
        <div style={{ fontSize: 122, fontWeight: 700, marginTop: 28 }}>{privateWord}</div>
      </div>
    </PartyFrame>
  )
}
