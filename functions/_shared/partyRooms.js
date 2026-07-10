const ROOM_CODE_LENGTH = 4
const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

const cleanText = (value) => String(value ?? '').trim()

const ensureLength = (name, value, min, max) => {
  if (value.length < min || value.length > max) {
    throw new Error(`${name} must be ${min}-${max} chars`)
  }
}

const normalizeRoomCode = (value) => cleanText(value).toUpperCase()

const normalizeNickname = (value) => {
  const nickname = cleanText(value)
  ensureLength('nickname', nickname, 1, 12)
  return nickname
}

const normalizeSettings = (value = {}) => {
  const mode = cleanText(value.mode) === 'truth-or-dare' ? 'truth-or-dare' : 'undercover'
  const maxPlayers = Number(value.maxPlayers)
  const allowLateJoin = value.allowLateJoin !== false
  const wordCategory = cleanText(value.wordCategory || '生活')
  const punishmentMode = ['off', 'truth', 'dare', 'random'].includes(cleanText(value.punishmentMode))
    ? cleanText(value.punishmentMode)
    : 'random'

  if (!Number.isInteger(maxPlayers) || maxPlayers < 2 || maxPlayers > 12) {
    throw new Error('maxPlayers must be 2-12')
  }

  ensureLength('wordCategory', wordCategory, 1, 16)

  return {
    mode,
    maxPlayers,
    allowLateJoin,
    wordCategory,
    punishmentMode,
  }
}

const createRoomCode = () => {
  let code = ''
  for (let index = 0; index < ROOM_CODE_LENGTH; index += 1) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)]
  }
  return code
}

const parseNamespaceResponse = async (response) => {
  const json = await response.json().catch(() => null)
  if (!response.ok || !json?.ok) {
    const message = json?.error?.message || 'party room request failed'
    const error = new Error(message)
    error.status = response.status || json?.error?.status || 500
    throw error
  }
  return json.data
}

const requireNamespace = (namespace) => {
  if (!namespace?.idFromName || !namespace?.get) {
    throw new Error('PARTY_ROOMS binding is not configured')
  }
  return namespace
}

const getRoomStub = (namespace, code) => {
  const normalizedCode = normalizeRoomCode(code)
  const id = requireNamespace(namespace).idFromName(normalizedCode)
  return {
    code: normalizedCode,
    stub: namespace.get(id),
  }
}

export const createPartyRoom = async (namespace, payload) => {
  const nickname = normalizeNickname(payload.nickname)
  const settings = normalizeSettings(payload.settings)
  const code = normalizeRoomCode(payload.code || createRoomCode())
  ensureLength('code', code, ROOM_CODE_LENGTH, ROOM_CODE_LENGTH)

  const { stub } = getRoomStub(namespace, code)
  return parseNamespaceResponse(await stub.fetch('https://party.internal/rooms/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, nickname, settings }),
  }))
}

export const joinPartyRoom = async (namespace, code, payload) => {
  const nickname = normalizeNickname(payload.nickname)
  const target = getRoomStub(namespace, code)

  return parseNamespaceResponse(await target.stub.fetch('https://party.internal/rooms/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname }),
  }))
}

export const getPartyRoomSummary = async (namespace, code) => {
  const target = getRoomStub(namespace, code)
  return parseNamespaceResponse(await target.stub.fetch('https://party.internal/rooms/summary'))
}
