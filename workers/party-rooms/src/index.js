/* global WebSocketPair */

import {
  advanceSpeaking,
  completePunishment,
  createInitialPartyRoomState,
  disconnectPartyPlayer,
  drawPunishmentCard,
  getPartyRoomSummary,
  issueConnectToken,
  joinPartyRoomState,
  moveToPunishment,
  reconnectPartyPlayer,
  resetRoomToWaiting,
  revealPartyVotingResult,
  startPartyGame,
  submitPartyDescription,
  submitPartyVote,
  validateConnectToken,
} from '../../../functions/_shared/partyRoomState.js'
import { pickTruthOrDareCard, pickUndercoverWordPair } from '../../../functions/_shared/partyRoomContent.js'

export class PartyRoom {
  constructor(state, env) {
    this.state = state
    this.env = env
    this.room = null
    this.sockets = new Map()
  }

  serializeRoom() {
    return JSON.stringify(this.room)
  }

  async loadRoom() {
    if (this.room) return this.room
    const stored = await this.state.storage.get('room')
    this.room = stored ? JSON.parse(stored) : null
    return this.room
  }

  async persistRoom() {
    if (!this.room) return
    await this.state.storage.put('room', this.serializeRoom())
  }

  getSummary() {
    return getPartyRoomSummary(this.room)
  }

  sendPrivateState(socket, playerId) {
    const word = this.room?.words?.[playerId] ?? null
    socket.send(JSON.stringify({
      type: 'private_state',
      privateWord: word,
      role: this.room?.roles?.[playerId] ?? null,
      playerId,
    }))
  }

  broadcast(payload) {
    const message = JSON.stringify(payload)
    for (const socket of this.sockets.keys()) {
      try {
        socket.send(message)
      } catch {
        this.sockets.delete(socket)
      }
    }
  }

  broadcastState() {
    if (!this.room) return
    this.broadcast({
      type: 'room_state',
      room: this.getSummary(),
    })
    for (const [socket, meta] of this.sockets.entries()) {
      this.sendPrivateState(socket, meta.playerId)
    }
  }

  async createRoom(body) {
    await this.loadRoom()
    if (this.room) {
      return Response.json({ ok: false, error: { code: 'room_exists', message: 'room already exists' } }, { status: 409 })
    }

    this.room = createInitialPartyRoomState({
      code: body.code,
      nickname: body.nickname,
      settings: body.settings,
    })
    const connectToken = crypto.randomUUID()
    issueConnectToken(this.room, 'host', connectToken)
    await this.persistRoom()
    return Response.json({ ok: true, data: { room: this.getSummary(), session: { playerId: 'host', host: true, connectToken } } })
  }

  async joinRoom(body) {
    await this.loadRoom()
    if (!this.room) {
      return Response.json({ ok: false, error: { code: 'room_not_found', message: 'room not found' } }, { status: 404 })
    }

    try {
      const { player } = joinPartyRoomState(this.room, body.nickname)
      const connectToken = crypto.randomUUID()
      issueConnectToken(this.room, player.id, connectToken)
      await this.persistRoom()
      this.broadcastState()
      return Response.json({ ok: true, data: { room: this.getSummary(), session: { playerId: player.id, host: false, connectToken } } })
    } catch (error) {
      return Response.json({ ok: false, error: { code: 'join_failed', message: error.message } }, { status: error.status || 400 })
    }
  }

  async getSummaryResponse() {
    await this.loadRoom()
    if (!this.room) {
      return Response.json({ ok: false, error: { code: 'room_not_found', message: 'room not found' } }, { status: 404 })
    }
    return Response.json({ ok: true, data: { room: this.getSummary() } })
  }

  async connectRoom(request) {
    await this.loadRoom()
    if (!this.room) {
      return Response.json({ ok: false, error: { code: 'room_not_found', message: 'room not found' } }, { status: 404 })
    }

    const url = new URL(request.url)
    const playerId = url.searchParams.get('playerId') || ''
    const connectToken = url.searchParams.get('connectToken') || ''

    // Validate connect token before accepting the connection
    try {
      validateConnectToken(this.room, playerId, connectToken)
    } catch (error) {
      return Response.json({ ok: false, error: { code: 'unauthorized', message: error.message } }, { status: 401 })
    }

    try {
      reconnectPartyPlayer(this.room, playerId)
    } catch (error) {
      return Response.json({ ok: false, error: { code: 'player_not_found', message: error.message } }, { status: error.status || 404 })
    }

    // Close any existing connection for the same playerId to prevent silent parallel eavesdropping
    for (const [existingSocket, meta] of this.sockets.entries()) {
      if (meta.playerId === playerId) {
        try { existingSocket.send(JSON.stringify({ type: 'kicked', reason: 'reconnected_elsewhere' })) } catch { /* already closed */ }
        try { existingSocket.close() } catch { /* already closed */ }
        this.sockets.delete(existingSocket)
      }
    }

    const pair = new WebSocketPair()
    const [client, server] = Object.values(pair)
    server.accept()
    this.sockets.set(server, { playerId })
    await this.persistRoom()

    server.addEventListener('message', async (event) => {
      try {
        const payload = JSON.parse(String(event.data || '{}'))
        await this.handleSocketMessage(playerId, payload)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[party-rooms] handleSocketMessage error:', error)
        server.send(JSON.stringify({ type: 'error', message: error?.message || 'invalid_event' }))
      }
    })

    server.addEventListener('close', async () => {
      this.sockets.delete(server)
      disconnectPartyPlayer(this.room, playerId)
      await this.persistRoom()
      this.broadcastState()
    })

    server.send(JSON.stringify({ type: 'room_state', room: this.getSummary() }))
    this.sendPrivateState(server, playerId)
    this.broadcastState()
    return new Response(null, { status: 101, webSocket: client })
  }

  async handleSocketMessage(playerId, payload) {
    const player = this.room.players.find((entry) => entry.id === playerId)
    if (!player) return

    if (payload.type === 'start_game' && player.host) {
      if (this.room.settings.mode === 'undercover') {
        const wordPair = await pickUndercoverWordPair(this.env.WISHES_DB, this.room.settings.wordCategory)
        startPartyGame(this.room, { wordPair })
      } else {
        startPartyGame(this.room)
      }
      await this.persistRoom()
      this.broadcastState()
      return
    }

    if (payload.type === 'next_speaker' && player.host) {
      advanceSpeaking(this.room)
      await this.persistRoom()
      this.broadcastState()
      return
    }

    if (payload.type === 'submit_description') {
      submitPartyDescription(this.room, playerId, player.nickname, String(payload.content || ''))
      await this.persistRoom()
      this.broadcastState()
      return
    }

    if (payload.type === 'submit_vote') {
      submitPartyVote(this.room, playerId, String(payload.suspectId || ''))
      const activeCount = this.room.players.filter((entry) => entry.status === 'online').length
      if (Object.keys(this.room.votes).length >= activeCount) {
        revealPartyVotingResult(this.room)
      }
      await this.persistRoom()
      this.broadcastState()
      return
    }

    if (payload.type === 'finish_vote' && player.host) {
      revealPartyVotingResult(this.room)
      await this.persistRoom()
      this.broadcastState()
      return
    }

    if (payload.type === 'draw_punishment') {
      if (this.room.phase !== 'punishment') moveToPunishment(this.room)
      const card = await pickTruthOrDareCard(this.env.WISHES_DB, payload.choice || 'random', {
        category: this.room.settings.cardCategory || null,
        intensity: this.room.settings.cardIntensity || null,
        excludeIds: Array.isArray(this.room.drawnCardIds) ? this.room.drawnCardIds : [],
      })
      drawPunishmentCard(this.room, card)
      if (this.room.drawnCardIds && this.room.drawnCardIds.length > 60) {
        // Prevent unbounded growth: recycle when we've drawn most cards
        this.room.drawnCardIds = this.room.drawnCardIds.slice(-20)
      }
      await this.persistRoom()
      this.broadcastState()
      return
    }

    if (payload.type === 'complete_punishment') {
      completePunishment(this.room)
      await this.persistRoom()
      this.broadcastState()
      return
    }

    if (payload.type === 'move_to_punishment' && player.host) {
      moveToPunishment(this.room)
      await this.persistRoom()
      this.broadcastState()
      return
    }

    if (payload.type === 'reset_to_waiting' && player.host) {
      resetRoomToWaiting(this.room)
      await this.persistRoom()
      this.broadcastState()
    }
  }

  async fetch(request) {
    const url = new URL(request.url)

    if (request.method === 'POST' && url.pathname === '/rooms/create') {
      return this.createRoom(await request.json())
    }

    if (request.method === 'POST' && url.pathname === '/rooms/join') {
      return this.joinRoom(await request.json())
    }

    if (request.method === 'GET' && url.pathname === '/rooms/summary') {
      return this.getSummaryResponse()
    }

    if (request.method === 'GET' && url.pathname === '/rooms/connect' && request.headers.get('Upgrade') === 'websocket') {
      return this.connectRoom(request)
    }

    return Response.json({ ok: false, error: { code: 'not_found', message: 'not found' } }, { status: 404 })
  }
}

export default {
  async fetch() {
    return new Response('PartyRoom worker is for Durable Object binding only.', { status: 404 })
  },
}
