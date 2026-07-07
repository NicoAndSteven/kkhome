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

export interface PartyRoomSettings {
  mode: PartyGameMode
  maxPlayers: number
  allowLateJoin: boolean
  wordCategory: string
  punishmentMode: PunishmentMode
}

export interface LocalPartyRoom {
  code: string
  settings: PartyRoomSettings
  players: PartyPlayer[]
  phase: UndercoverPhase
  currentSpeakerIndex: number
  selectedWordPair: UndercoverWordPair
  selectedCard: TruthOrDareCard | null
}
