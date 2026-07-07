import assert from 'node:assert/strict'
import test from 'node:test'
import { createPartyRoom, getPartyRoomSummary, joinPartyRoom } from '../functions/_shared/partyRooms.js'

const createFakeNamespace = () => {
  const rooms = new Map()
  const socketsByRoom = new Map()

  const getSummary = (room) => ({
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
  })

  return {
    idFromName(name) {
      return name
    },
    get(id) {
      return {
        async fetch(input, init = {}) {
          const request = input instanceof globalThis.Request
            ? input
            : new globalThis.Request(input, init)
          const url = new URL(request.url)

          if (request.method === 'POST' && url.pathname === '/rooms/create') {
            const body = await request.json()
            if (rooms.has(body.code)) {
              return Response.json({ ok: false, error: { code: 'room_exists', message: 'room already exists' } }, { status: 409 })
            }
            const room = {
              code: body.code,
              settings: body.settings,
              phase: 'waiting',
              players: [
                {
                  id: 'host',
                  nickname: body.nickname,
                  host: true,
                  status: 'online',
                },
              ],
            }
            rooms.set(body.code, room)
            return Response.json({ ok: true, data: { room: getSummary(room), session: { playerId: 'host', host: true } } })
          }

          if (request.method === 'POST' && url.pathname === '/rooms/join') {
            const body = await request.json()
            const room = rooms.get(id)
            if (!room) {
              return Response.json({ ok: false, error: { code: 'room_not_found', message: 'room not found' } }, { status: 404 })
            }
            if (room.phase !== 'waiting' && !room.settings.allowLateJoin) {
              return Response.json({ ok: false, error: { code: 'late_join_disabled', message: 'late join disabled' } }, { status: 409 })
            }
            if (room.players.length >= room.settings.maxPlayers) {
              return Response.json({ ok: false, error: { code: 'room_full', message: 'room is full' } }, { status: 409 })
            }
            if (room.players.some((player) => player.nickname === body.nickname)) {
              return Response.json({ ok: false, error: { code: 'duplicate_nickname', message: 'nickname already exists' } }, { status: 409 })
            }
            room.players.push({
              id: `guest-${room.players.length}`,
              nickname: body.nickname,
              host: false,
              status: 'online',
            })
            const playerId = room.players[room.players.length - 1].id
            return Response.json({ ok: true, data: { room: getSummary(room), session: { playerId, host: false } } })
          }

          if (request.method === 'GET' && url.pathname === '/rooms/summary') {
            const room = rooms.get(id)
            if (!room) {
              return Response.json({ ok: false, error: { code: 'room_not_found', message: 'room not found' } }, { status: 404 })
            }
            return Response.json({ ok: true, data: { room: getSummary(room) } })
          }

          if (request.method === 'GET' && url.pathname === '/rooms/connect' && request.headers.get('Upgrade') === 'websocket') {
            const room = rooms.get(id)
            if (!room) {
              return Response.json({ ok: false, error: { code: 'room_not_found', message: 'room not found' } }, { status: 404 })
            }

            const playerId = url.searchParams.get('playerId')
            if (!playerId) {
              return Response.json({ ok: false, error: { code: 'player_required', message: 'playerId is required' } }, { status: 400 })
            }

            const sockets = socketsByRoom.get(id) ?? []
            sockets.push({ playerId })
            socketsByRoom.set(id, sockets)
            return new Response(null, { status: 101 })
          }

          return Response.json({ ok: false, error: { code: 'unknown', message: 'unknown route' } }, { status: 404 })
        },
      }
    },
    __setPhase(code, phase) {
      const room = rooms.get(code)
      if (room) room.phase = phase
    },
  }
}

test('creates a room and returns a public summary', async () => {
  const namespace = createFakeNamespace()

  const result = await createPartyRoom(namespace, {
    nickname: '房主',
    settings: {
      mode: 'undercover',
      maxPlayers: 6,
      allowLateJoin: true,
      wordCategory: '生活',
      punishmentMode: 'random',
    },
  })

  assert.match(result.room.code, /^[A-Z0-9]{4}$/)
  assert.equal(result.room.phase, 'waiting')
  assert.equal(result.room.capacity.current, 1)
  assert.equal(result.room.players[0].nickname, '房主')
  assert.deepEqual(result.session, { playerId: 'host', host: true })
})

test('joins an existing room and reads updated summary', async () => {
  const namespace = createFakeNamespace()
  const created = await createPartyRoom(namespace, {
    nickname: '房主',
    settings: {
      mode: 'truth-or-dare',
      maxPlayers: 3,
      allowLateJoin: true,
      wordCategory: '生活',
      punishmentMode: 'off',
    },
  })

  const joined = await joinPartyRoom(namespace, created.room.code, { nickname: '玩家A' })
  assert.equal(joined.room.capacity.current, 2)
  assert.equal(joined.room.players[1].nickname, '玩家A')
  assert.deepEqual(joined.session, { playerId: 'guest-1', host: false })

  const summary = await getPartyRoomSummary(namespace, created.room.code)
  assert.equal(summary.room.capacity.current, 2)
  assert.equal(summary.room.settings.mode, 'truth-or-dare')
})

test('rejects invalid room payloads and full rooms', async () => {
  const namespace = createFakeNamespace()

  await assert.rejects(
    () => createPartyRoom(namespace, {
      nickname: '',
      settings: {
        mode: 'undercover',
        maxPlayers: 2,
        allowLateJoin: true,
        wordCategory: '生活',
        punishmentMode: 'random',
      },
    }),
    /nickname must be 1-12 chars/,
  )

  const created = await createPartyRoom(namespace, {
    nickname: '房主',
    settings: {
      mode: 'undercover',
      maxPlayers: 3,
      allowLateJoin: true,
      wordCategory: '生活',
      punishmentMode: 'random',
    },
  })

  await joinPartyRoom(namespace, created.room.code, { nickname: '玩家A' })
  await joinPartyRoom(namespace, created.room.code, { nickname: '玩家B' })

  await assert.rejects(
    () => joinPartyRoom(namespace, created.room.code, { nickname: '玩家C' }),
    /room is full/,
  )
})

test('rejects duplicate nicknames and late join disabled after start', async () => {
  const namespace = createFakeNamespace()
  const created = await createPartyRoom(namespace, {
    nickname: '房主',
    settings: {
      mode: 'undercover',
      maxPlayers: 4,
      allowLateJoin: false,
      wordCategory: '生活',
      punishmentMode: 'random',
    },
  })

  await assert.rejects(
    () => joinPartyRoom(namespace, created.room.code, { nickname: '房主' }),
    /nickname already exists/,
  )

  namespace.__setPhase(created.room.code, 'word')

  await assert.rejects(
    () => joinPartyRoom(namespace, created.room.code, { nickname: '玩家B' }),
    /late join disabled/,
  )
})
