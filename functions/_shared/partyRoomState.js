const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const normalizeMode = (value) => (value === 'truth-or-dare' ? 'truth-or-dare' : 'undercover')

const normalizePunishmentMode = (value) => (
  ['off', 'truth', 'dare', 'random'].includes(value) ? value : 'random'
)

export const createPartyPlayer = ({ id, nickname, host, status = 'online' }) => ({
  id,
  nickname,
  host: Boolean(host),
  status: status === 'offline' ? 'offline' : 'online',
})

export const createInitialPartyRoomState = ({ code, nickname, settings }) => ({
  code,
  settings: {
    mode: normalizeMode(settings.mode),
    maxPlayers: clamp(Number(settings.maxPlayers) || 6, 3, 12),
    allowLateJoin: settings.allowLateJoin !== false,
    wordCategory: String(settings.wordCategory || '生活'),
    punishmentMode: normalizePunishmentMode(settings.punishmentMode),
  },
  phase: 'waiting',
  players: [
    createPartyPlayer({
      id: 'host',
      nickname,
      host: true,
    }),
  ],
  roles: {},
  words: {},
  currentSpeakerIndex: 0,
  votes: {},
  result: null,
  selectedCard: null,
  punishmentTargetId: null,
  truthOrDareTurnIndex: 0,
})

export const joinPartyRoomState = (room, nickname) => {
  if (room.phase !== 'waiting' && !room.settings.allowLateJoin) {
    const error = new Error('late join disabled')
    error.status = 409
    throw error
  }
  if (room.players.length >= room.settings.maxPlayers) {
    const error = new Error('room is full')
    error.status = 409
    throw error
  }
  if (room.players.some((player) => player.nickname === nickname)) {
    const error = new Error('nickname already exists')
    error.status = 409
    throw error
  }

  const player = createPartyPlayer({
    id: `guest-${room.players.length}`,
    nickname,
    host: false,
  })
  room.players.push(player)
  return { room, player }
}

export const reconnectPartyPlayer = (room, playerId) => {
  const player = room.players.find((entry) => entry.id === playerId)
  if (!player) {
    const error = new Error('player not found')
    error.status = 404
    throw error
  }
  player.status = 'online'
  return player
}

export const disconnectPartyPlayer = (room, playerId) => {
  const player = room.players.find((entry) => entry.id === playerId)
  if (player) player.status = 'offline'
  return player
}

export const assignUndercoverRound = (room, wordPair) => {
  const activePlayers = room.players.filter((player) => player.status === 'online')
  if (activePlayers.length < 3) {
    const error = new Error('at least 3 online players required')
    error.status = 409
    throw error
  }

  room.phase = 'word'
  room.currentSpeakerIndex = 0
  room.votes = {}
  room.result = null
  room.selectedCard = null
  room.punishmentTargetId = null
  room.roles = {}
  room.words = {}

  activePlayers.forEach((player, index) => {
    const undercover = index === activePlayers.length - 1
    room.roles[player.id] = undercover ? 'undercover' : 'civilian'
    room.words[player.id] = undercover ? wordPair.undercoverWord : wordPair.civilianWord
  })

  return room
}

export const startPartyGame = (room, options = {}) => {
  if (room.phase !== 'waiting') {
    const error = new Error('game already started')
    error.status = 409
    throw error
  }

  if (room.settings.mode === 'truth-or-dare') {
    room.phase = 'punishment'
    room.truthOrDareTurnIndex = 0
    room.punishmentTargetId = room.players[0]?.id ?? null
    room.selectedCard = null
    return room
  }

  return assignUndercoverRound(room, options.wordPair)
}

export const advanceSpeaking = (room) => {
  if (room.phase === 'word') {
    room.phase = 'speaking'
    room.currentSpeakerIndex = 0
    return room
  }

  if (room.phase !== 'speaking') {
    const error = new Error('room is not in speaking phase')
    error.status = 409
    throw error
  }

  const activePlayers = room.players.filter((player) => player.status === 'online')
  if (room.currentSpeakerIndex < activePlayers.length - 1) {
    room.currentSpeakerIndex += 1
    return room
  }

  room.phase = 'voting'
  return room
}

export const submitPartyVote = (room, voterId, suspectId) => {
  if (room.phase !== 'voting') {
    const error = new Error('room is not in voting phase')
    error.status = 409
    throw error
  }
  if (voterId === suspectId) {
    const error = new Error('cannot vote for self')
    error.status = 400
    throw error
  }
  if (!room.players.some((player) => player.id === suspectId)) {
    const error = new Error('suspect not found')
    error.status = 404
    throw error
  }
  room.votes[voterId] = suspectId
  return room
}

export const revealPartyVotingResult = (room) => {
  if (room.phase !== 'voting') {
    const error = new Error('room is not in voting phase')
    error.status = 409
    throw error
  }

  const counts = {}
  for (const suspectId of Object.values(room.votes)) {
    counts[suspectId] = (counts[suspectId] || 0) + 1
  }
  const [eliminatedId] = Object.entries(counts).sort((left, right) => right[1] - left[1])[0] || []
  if (!eliminatedId) {
    const error = new Error('no votes submitted')
    error.status = 409
    throw error
  }

  const eliminatedRole = room.roles[eliminatedId]
  const remainingRoles = Object.entries(room.roles)
    .filter(([playerId]) => playerId !== eliminatedId)
    .map(([, role]) => role)
  const undercoverRemaining = remainingRoles.filter((role) => role === 'undercover').length
  const civilianRemaining = remainingRoles.filter((role) => role === 'civilian').length

  let winner = 'civilians'
  if (eliminatedRole !== 'undercover' && undercoverRemaining >= civilianRemaining) {
    winner = 'undercover'
  }
  if (eliminatedRole === 'undercover' && undercoverRemaining === 0) {
    winner = 'civilians'
  }

  room.phase = 'result'
  room.result = {
    eliminatedId,
    eliminatedRole,
    winner,
  }
  room.punishmentTargetId = eliminatedId
  return room
}

export const moveToPunishment = (room) => {
  room.phase = 'punishment'
  room.selectedCard = null
  if (!room.punishmentTargetId) {
    room.punishmentTargetId = room.players[room.truthOrDareTurnIndex % room.players.length]?.id ?? null
  }
  return room
}

export const drawPunishmentCard = (room, card) => {
  room.selectedCard = card
  return room
}

export const completePunishment = (room) => {
  if (room.settings.mode === 'truth-or-dare') {
    room.selectedCard = null
    room.truthOrDareTurnIndex = (room.truthOrDareTurnIndex + 1) % Math.max(room.players.length, 1)
    room.punishmentTargetId = room.players[room.truthOrDareTurnIndex]?.id ?? null
    return room
  }

  room.phase = 'waiting'
  room.roles = {}
  room.words = {}
  room.votes = {}
  room.result = null
  room.selectedCard = null
  room.punishmentTargetId = null
  return room
}

export const getPartyRoomSummary = (room) => ({
  code: room.code,
  settings: room.settings,
  players: room.players.map((player) => ({
    id: player.id,
    nickname: player.nickname,
    host: player.host,
    status: player.status,
  })),
  phase: room.phase,
  capacity: {
    current: room.players.length,
    max: room.settings.maxPlayers,
  },
  currentSpeakerId: room.phase === 'speaking' ? room.players.filter((player) => player.status === 'online')[room.currentSpeakerIndex]?.id ?? null : null,
  result: room.result,
  punishmentTargetId: room.punishmentTargetId,
  selectedCard: room.selectedCard,
})
