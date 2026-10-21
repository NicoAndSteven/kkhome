/* eslint-disable react-refresh/only-export-components */

import React from 'react'
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { z } from 'zod'
import { PartyFrame } from './PartyFrame'

export const partyInviteSchema = z.object({
  roomCode: z.string(),
  modeLabel: z.string(),
  playerCount: z.string(),
})

type Props = z.infer<typeof partyInviteSchema>

export const PartyInvite: React.FC<Props> = ({ roomCode, modeLabel, playerCount }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const enter = spring({ frame, fps, config: { damping: 14 } })
  const opacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <PartyFrame>
      <div style={{ opacity, transform: `translateY(${(1 - enter) * 40}px)` }}>
        <div style={{ fontSize: 28, letterSpacing: 8, textTransform: 'uppercase', opacity: 0.6 }}>Party Invite</div>
        <h1 style={{ margin: '24px 0 12px', fontSize: 128, lineHeight: 0.9 }}>{roomCode}</h1>
        <p style={{ margin: 0, fontSize: 38, opacity: 0.84 }}>{modeLabel}</p>
      </div>

      <div
        style={{
          marginTop: 'auto',
          display: 'grid',
          gap: 20,
          padding: 40,
          borderRadius: 36,
          background: 'rgba(247, 240, 213, 0.92)',
          color: '#171a18',
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.55 }}>当前人数</div>
        <div style={{ fontSize: 84, fontWeight: 700 }}>{playerCount}</div>
      </div>
    </PartyFrame>
  )
}
