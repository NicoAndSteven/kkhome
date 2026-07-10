// Type declarations for functions/_shared/partyRoomState.js
// Used by src/plugins/party-games/useLocalGame.ts (local engine thin wrapper)

interface PartyRoomStatePlayer {
  id: string
  nickname: string
  host: boolean
  status: 'online' | 'offline'
}

interface PartyRoomStateSettings {
  mode: 'undercover' | 'truth-or-dare'
  maxPlayers: number
  allowLateJoin: boolean
  wordCategory: string
  punishmentMode: 'off' | 'truth' | 'dare' | 'random'
}

interface PartyRoomStateResult {
  eliminatedId: string | null
  eliminatedRole: 'civilian' | 'undercover' | null
  gameEnded: boolean
  winner: 'civilians' | 'undercover' | null
}

interface PartyRoomStateCard {
  id: string
  type: 'truth' | 'dare'
  content: string
  category: string
  intensity: 'soft' | 'normal' | 'spicy'
}

interface PartyRoomStateWordPair {
  civilianWord: string
  undercoverWord: string
}

interface PartyRoomState {
  code: string
  settings: PartyRoomStateSettings
  phase: string
  players: PartyRoomStatePlayer[]
  roles: Record<string, 'civilian' | 'undercover'>
  words: Record<string, string>
  descriptions: Array<{ playerId: string; playerName: string; content: string; timestamp: number }>
  currentSpeakerIndex: number
  votes: Record<string, string>
  result: PartyRoomStateResult | null
  selectedCard: PartyRoomStateCard | null
  punishmentTargetId: string | null
  truthOrDareTurnIndex: number
}

export function createInitialPartyRoomState(opts: {
  code: string
  nickname: string
  settings: PartyRoomStateSettings
}): PartyRoomState

export function joinPartyRoomState(
  room: PartyRoomState,
  nickname: string,
): { room: PartyRoomState; player: PartyRoomStatePlayer }

export function startPartyGame(
  room: PartyRoomState,
  options?: { wordPair?: PartyRoomStateWordPair },
): PartyRoomState

export function advanceSpeaking(room: PartyRoomState): PartyRoomState

export function submitPartyDescription(
  room: PartyRoomState,
  playerId: string,
  playerName: string,
  content: string,
): PartyRoomState

export function submitPartyVote(
  room: PartyRoomState,
  voterId: string,
  suspectId: string,
): PartyRoomState

export function revealPartyVotingResult(room: PartyRoomState): PartyRoomState

export function moveToPunishment(room: PartyRoomState): PartyRoomState

export function drawPunishmentCard(
  room: PartyRoomState,
  card: PartyRoomStateCard,
): PartyRoomState

export function completePunishment(room: PartyRoomState): PartyRoomState

export function resetRoomToWaiting(room: PartyRoomState): PartyRoomState
