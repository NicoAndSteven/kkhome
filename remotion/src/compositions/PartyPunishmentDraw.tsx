/* eslint-disable react-refresh/only-export-components */

import React from 'react'
import { interpolate, useCurrentFrame } from 'remotion'
import { z } from 'zod'
import { PartyFrame } from './PartyFrame'

export const partyPunishmentSchema = z.object({
  targetName: z.string(),
  cardType: z.string(),
  cardContent: z.string(),
})

type Props = z.infer<typeof partyPunishmentSchema>

export const PartyPunishmentDraw: React.FC<Props> = ({ targetName, cardType, cardContent }) => {
  const frame = useCurrentFrame()
  const rotate = interpolate(frame, [0, 36], [-6, 0], { extrapolateRight: 'clamp' })

  return (
    <PartyFrame accent="rgba(217,122,99,0.45)">
      <div style={{ fontSize: 28, opacity: 0.6 }}>Punishment Draw</div>
      <h1 style={{ margin: '22px 0 10px', fontSize: 92 }}>{targetName}</h1>
      <p style={{ margin: 0, fontSize: 30, opacity: 0.7 }}>接受惩罚</p>

      <div
        style={{
          marginTop: 120,
          borderRadius: 44,
          padding: '72px 48px',
          background: '#f7f0d5',
          color: '#161a17',
          transform: `rotate(${rotate}deg)`,
        }}
      >
        <div style={{ fontSize: 24, letterSpacing: 6, textTransform: 'uppercase', opacity: 0.5 }}>{cardType}</div>
        <div style={{ fontSize: 62, fontWeight: 700, marginTop: 28, lineHeight: 1.15 }}>{cardContent}</div>
      </div>
    </PartyFrame>
  )
}
