import {
  assignUndercoverRound,
  createInitialPartyRoomState,
  joinPartyRoomState,
} from '../functions/_shared/partyRoomState.js'

const wordPair = { civilianWord: '苹果', undercoverWord: '梨' }
const playerIds = ['host', 'guest-1', 'guest-2', 'guest-3']
const rounds = 1000
const trials = 2000
const CRITICAL = 11.34

let over = 0
let sumChi = 0
let maxChi = 0

for (let t = 0; t < trials; t++) {
  const counts = Object.fromEntries(playerIds.map((id) => [id, 0]))
  for (let i = 0; i < rounds; i++) {
    const room = createInitialPartyRoomState({
      code: 'TEST',
      nickname: '房主',
      settings: {
        mode: 'undercover',
        maxPlayers: 4,
        allowLateJoin: true,
        wordCategory: '生活',
        punishmentMode: 'truth',
      },
    })
    joinPartyRoomState(room, '玩家A')
    joinPartyRoomState(room, '玩家B')
    joinPartyRoomState(room, '玩家C')
    assignUndercoverRound(room, wordPair)
    const undercoverId = Object.entries(room.roles).find(([, role]) => role === 'undercover')?.[0]
    counts[undercoverId]++
  }
  const expected = rounds / playerIds.length
  let chi = 0
  for (const id of playerIds) chi += Math.pow(counts[id] - expected, 2) / expected
  sumChi += chi
  if (chi > maxChi) maxChi = chi
  if (chi > CRITICAL) over++
}

console.log(`trials            : ${trials} (每 trial ${rounds} 局)`)
console.log(`超过临界值 11.34  : ${over} 次`)
console.log(`实测失败率        : ${(over / trials * 100).toFixed(2)}%   (理论 α=1.00%)`)
console.log(`平均 χ²           : ${(sumChi / trials).toFixed(3)}   (均匀分布下 df=3 应为 3.000)`)
console.log(`最大 χ²           : ${maxChi.toFixed(2)}`)
