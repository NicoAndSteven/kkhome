import React from 'react'
import { Composition } from 'remotion'
import { PartyInvite, partyInviteSchema } from './compositions/PartyInvite'
import { PartyWordReveal, partyWordRevealSchema } from './compositions/PartyWordReveal'
import { PartyPunishmentDraw, partyPunishmentSchema } from './compositions/PartyPunishmentDraw'
import { PartyRecap, partyRecapSchema } from './compositions/PartyRecap'

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PartyInvite"
        component={PartyInvite}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        schema={partyInviteSchema}
        defaultProps={{
          roomCode: 'ABCD',
          modeLabel: '谁是卧底',
          playerCount: '4 / 8',
        }}
      />
      <Composition
        id="PartyWordReveal"
        component={PartyWordReveal}
        durationInFrames={120}
        fps={30}
        width={1080}
        height={1920}
        schema={partyWordRevealSchema}
        defaultProps={{
          nickname: '玩家A',
          roleLabel: '平民',
          privateWord: '苹果',
        }}
      />
      <Composition
        id="PartyPunishmentDraw"
        component={PartyPunishmentDraw}
        durationInFrames={120}
        fps={30}
        width={1080}
        height={1920}
        schema={partyPunishmentSchema}
        defaultProps={{
          targetName: '玩家B',
          cardType: '大冒险',
          cardContent: '用主持人的语气宣布下一轮开始。',
        }}
      />
      <Composition
        id="PartyRecap"
        component={PartyRecap}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        schema={partyRecapSchema}
        defaultProps={{
          winnerLabel: '平民胜利',
          eliminatedName: '玩家C',
          eliminatedRole: '卧底',
          nextAction: '下一轮开始',
        }}
      />
    </>
  )
}
