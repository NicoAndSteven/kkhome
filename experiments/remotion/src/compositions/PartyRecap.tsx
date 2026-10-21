/* eslint-disable react-refresh/only-export-components */

import React from 'react'
import { interpolate, useCurrentFrame } from 'remotion'
import { z } from 'zod'
import { PartyFrame } from './PartyFrame'

export const partyRecapSchema = z.object({
  winnerLabel: z.string(),
  eliminatedName: z.string(),
  eliminatedRole: z.string(),
  nextAction: z.string(),
})

type Props = z.infer<typeof partyRecapSchema>

export const PartyRecap: React.FC<Props> = ({ winnerLabel, eliminatedName, eliminatedRole, nextAction }) => {
  const frame = useCurrentFrame()
  const lineWidth = interpolate(frame, [0, 45], [0, 280], { extrapolateRight: 'clamp' })

  return (
    <PartyFrame>
      <div style={{ fontSize: 28, opacity: 0.6 }}>Round Recap</div>
      <h1 style={{ margin: '24px 0 12px', fontSize: 112, lineHeight: 0.92 }}>{winnerLabel}</h1>
      <div style={{ width: lineWidth, height: 4, borderRadius: 999, background: '#f4d35e' }} />

      <div
        style={{
          marginTop: 96,
          display: 'grid',
          gap: 20,
          padding: 40,
          borderRadius: 36,
          background: 'rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ fontSize: 24, opacity: 0.5 }}>出局玩家</div>
        <div style={{ fontSize: 58, fontWeight: 700 }}>{eliminatedName}</div>
        <div style={{ fontSize: 30, opacity: 0.75 }}>身份：{eliminatedRole}</div>
        <div style={{ marginTop: 16, fontSize: 26, opacity: 0.62 }}>下一步：{nextAction}</div>
      </div>
    </PartyFrame>
  )
}
