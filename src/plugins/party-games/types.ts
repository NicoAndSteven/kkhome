export type PartyGameMode = 'undercover' | 'truth-or-dare'
export type PunishmentMode = 'off' | 'truth' | 'dare' | 'random'
export type PlayerStatus = 'online' | 'offline'
export type UndercoverPhase = 'waiting' | 'word' | 'speaking' | 'voting' | 'result' | 'punishment'
export type TruthOrDareType = 'truth' | 'dare'
export type CardIntensity = 'soft' | 'normal' | 'spicy'

export interface PartyPlayer {
  id: string
  nickname: string
  host: boolean
  status: PlayerStatus
}

export interface UndercoverWordPair {
  id: string
  civilianWord: string
  undercoverWord: string
  category: string
  difficulty: 'easy' | 'normal'
}

export interface TruthOrDareCard {
  id: string
  type: TruthOrDareType
  content: string
  category: string
  intensity: CardIntensity
}

export interface PartyResult {
  eliminatedId: string | null
  eliminatedRole: 'civilian' | 'undercover' | null
  gameEnded: boolean
  winner: 'civilians' | 'undercover' | null
}

export interface PartyRoomSettings {
  mode: PartyGameMode
  maxPlayers: number
  allowLateJoin: boolean
  wordCategory: string
  cardCategory: string
  cardIntensity: string
  punishmentMode: PunishmentMode
}

export interface LocalPartyRoom {
  code: string
  settings: PartyRoomSettings
  players: PartyPlayer[]
  phase: UndercoverPhase
  currentSpeakerIndex: number
  currentSpeakerId?: string | null
  // Fields required by shared state machine (partyRoomState.js)
  // In online mode these are DO-private; in local mode they live on the room object.
  roles: Record<string, 'civilian' | 'undercover'>
  words: Record<string, string>
  votes: Record<string, string>
  truthOrDareTurnIndex: number
  // UI-facing state
  selectedWordPair: UndercoverWordPair
  selectedCard: TruthOrDareCard | null
  privateWord?: string | null
  privateRole?: 'civilian' | 'undercover' | null
  result?: PartyResult | null
  punishmentTargetId?: string | null
  descriptions?: DescriptionEntry[]
}

export interface DescriptionEntry {
  playerId: string
  playerName: string
  content: string
  timestamp: number
}
