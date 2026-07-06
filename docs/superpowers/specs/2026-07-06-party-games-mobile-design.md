# Party Games Mobile Design

## Context

The feature is a mobile-first party game module for the existing kkhome Vite, React, TypeScript, Tailwind, and Cloudflare Pages application. It extends the current plugin architecture with a new `party-games` plugin.

The primary game is classic Who Is Undercover. Truth or Dare is included as both a standalone mode and a built-in punishment module for Who Is Undercover losers.

The experience must work well on phones during in-person gatherings. The UI should feel like a focused mobile game room, not a desktop page compressed into a phone viewport.

## Goals

- Let a host create an online room from a phone.
- Let players join by room code or invitation link.
- Use the configured player limit as the maximum allowed room capacity.
- Support classic Who Is Undercover with civilian and undercover roles only.
- Support Truth or Dare as a standalone game and as a punishment step after Who Is Undercover.
- Store game content in Cloudflare D1 so question and word banks persist.
- Reuse the existing administrator token pattern for question and word management.
- Keep live room state temporary and real-time through Durable Objects and WebSocket.
- Keep the first implementation small enough to ship and verify.

## Non-Goals

- No account system.
- No whiteboard role in Who Is Undercover.
- No public anonymous chat.
- No long-term storage of every room action by default.
- No R2-backed primary question database.
- No Remotion dependency in the core gameplay path.

## Product Shape

The module is named `聚会游戏` in the UI and uses the plugin id `party-games`.

It contains:

- `谁是卧底`: primary mode.
- `真心话大冒险`: standalone mode and punishment module.
- `题库管理`: administrator-only management surface.

The default landing state selects Who Is Undercover because that is the main game. Truth or Dare remains one tap away and is reused by the punishment flow.

## Mobile UI Direction

Reading this as a mobile-first in-person party game. The visual language should be tactile, clear, and slightly playful, with a tabletop card feel. It should avoid generic purple gradients and dense dashboard patterns.

Design system direction:

- Platform mode: cross-platform premium neutral.
- Layout: mobile app-native, safe-area aware, bottom actions first.
- Palette: dark tabletop base, off-white cards, one high-contrast accent.
- Typography: strong readable Chinese titles, compact supporting text, no decorative tiny labels.
- Shape: consistent soft card radius, pill buttons only for primary actions and segmented controls.
- Motion: restrained in gameplay, stronger only for reveal and card draw moments.

Mobile rules:

- Primary actions sit near the bottom safe area.
- Every game phase has one dominant action.
- Room code and current player count must be immediately visible.
- Text must remain readable on a normal phone viewport.
- Avoid nested cards. Use one main surface per state.
- Loading, reconnecting, full room, and unavailable backend states must be explicit.

## Screen Flow

### 1. Entry Screen

The entry screen has two primary actions:

- `创建房间`
- `加入房间`

A segmented control switches between:

- `谁是卧底`
- `真心话大冒险`

The screen should show the selected mode, a short state summary, and the two actions. It should not explain the full rules inline.

### 2. Create Room Sheet

Room creation opens as a bottom sheet.

Fields:

- Nickname.
- Game mode.
- Max players, default 6, allowed 3 to 12.
- Allow late join, default enabled while the game is waiting.
- Word category for Who Is Undercover.
- Punishment mode for Who Is Undercover losers:
  - Off.
  - Truth.
  - Dare.
  - Random.

The create button is fixed at the sheet bottom. Validation errors appear inline.

### 3. Join Room Sheet

Fields:

- Room code.
- Nickname.

States:

- Room not found.
- Room full.
- Game already started and late join disabled.
- Reconnecting.

### 4. Waiting Room

The waiting room focuses on joining and readiness.

Visible elements:

- Large room code.
- Copy invite link button.
- Player count, for example `4 / 8`.
- Player list as seat rows.
- Host badge.
- Connection status.

Host controls:

- Start game.
- Change max players while waiting.
- Remove disconnected players.

Player controls:

- Leave room.
- Copy invite link.

The host can start before the room reaches max players, as long as the minimum player count is met.

### 5. Who Is Undercover Gameplay

The game has four phases.

#### Word Reveal

Each player sees a private word card. The card uses press-and-hold reveal on mobile. The word is hidden by default.

The UI must avoid showing other players' words.

#### Speaking

The room shows:

- Current speaker.
- Turn order.
- Optional countdown display.
- Host action: next speaker.

The first version can use host-driven progression rather than enforcing timers.

#### Voting

Each player votes for one suspected undercover player.

Rules:

- Votes are locked after submission.
- Vote counts are hidden until all active players vote or the host ends voting.
- A player cannot vote for themselves if the room setting disallows it. The first version should disallow self-voting.

#### Result

The result shows:

- Voted-out player.
- Their role.
- Whether civilians or undercover won.
- Next action:
  - Continue next round.
  - Start punishment.
  - End game.

Win condition for MVP:

- Civilians win when all undercover players are eliminated.
- Undercover wins when remaining undercover count is greater than or equal to remaining civilian count.

The MVP uses one undercover. The data model should not block a future role-count setting, but the first UI exposes only the classic one-undercover rule.

### 6. Truth or Dare

Truth or Dare appears in two contexts:

- Standalone mode.
- Punishment panel for Who Is Undercover.

The UI has:

- Target player name.
- One large draw card.
- Three bottom actions:
  - Truth.
  - Dare.
  - Random.

After a card is drawn, actions change to:

- Complete.
- Draw another.

The standalone mode can use a simple rotating player order. The punishment mode receives the losing player from Who Is Undercover.

## Data Persistence

Use D1 as the primary long-term store for game content.

### Tables

`party_undercover_word_pairs`

- `id TEXT PRIMARY KEY`
- `civilian_word TEXT NOT NULL`
- `undercover_word TEXT NOT NULL`
- `category TEXT NOT NULL`
- `difficulty TEXT NOT NULL`
- `enabled INTEGER NOT NULL DEFAULT 1`
- `created_at TEXT NOT NULL`
- `updated_at TEXT NOT NULL`

`party_truth_or_dare_cards`

- `id TEXT PRIMARY KEY`
- `type TEXT NOT NULL`, values: `truth`, `dare`
- `content TEXT NOT NULL`
- `category TEXT NOT NULL`
- `intensity TEXT NOT NULL`, values: `soft`, `normal`, `spicy`
- `enabled INTEGER NOT NULL DEFAULT 1`
- `created_at TEXT NOT NULL`
- `updated_at TEXT NOT NULL`

`party_game_settings`

- `key TEXT PRIMARY KEY`
- `value_json TEXT NOT NULL`
- `updated_at TEXT NOT NULL`

Seed data should add:

- A usable default Who Is Undercover word bank.
- A usable default Truth card bank.
- A usable default Dare card bank.

Seed cards must avoid unsafe, illegal, humiliating, or explicit tasks. The first content set should stay social and light.

## R2 Usage

R2 is not the primary database for this feature.

Future uses:

- Exported question bank backups.
- Imported question bank files.
- Image or audio assets for future dare cards.
- Remotion-rendered share assets if the project later stores generated media.

## Real-Time Architecture

Use Cloudflare Durable Objects for room state and WebSocket fanout.

Each room maps to one Durable Object instance by room code.

Durable Object responsibilities:

- Track connected players.
- Enforce max player capacity.
- Track host.
- Hold temporary room settings.
- Hold current game phase.
- Assign words and roles.
- Collect votes.
- Broadcast state updates.
- Clean up inactive rooms.

D1 responsibilities:

- Store reusable content.
- Provide random enabled word pairs and cards.
- Store administrator-managed question bank changes.

## API Shape

HTTP endpoints:

- `POST /api/party/rooms`: create a room.
- `GET /api/party/rooms/:code`: read public room summary.
- `GET /api/party/content/undercover`: list word pairs for admin.
- `POST /api/party/content/undercover`: create word pair for admin.
- `PUT /api/party/content/undercover/:id`: update word pair for admin.
- `GET /api/party/content/truth-or-dare`: list cards for admin.
- `POST /api/party/content/truth-or-dare`: create card for admin.
- `PUT /api/party/content/truth-or-dare/:id`: update card for admin.

WebSocket endpoint:

- `GET /api/party/rooms/:code/connect`

WebSocket client events:

- `join_room`
- `leave_room`
- `start_game`
- `reveal_ack`
- `next_speaker`
- `submit_vote`
- `finish_vote`
- `draw_punishment`
- `complete_punishment`
- `restart_round`
- `end_game`

WebSocket server events:

- `room_state`
- `player_joined`
- `player_left`
- `phase_changed`
- `vote_locked`
- `result_revealed`
- `punishment_drawn`
- `error`

The server must never broadcast private words to all players. Private word data is sent only to the matching player connection.

## Admin Management

Reuse the existing administrator authentication pattern and token.

The current music admin implementation uses a bearer token returned after password verification. The first party game admin APIs should reuse that exact token flow and accept the same bearer token. Renaming the environment variable to a shared `ADMIN_TOKEN` is out of scope for the first version.

Admin UI additions:

- Add a `聚会题库` tab to the admin surface.
- List, create, edit, enable, and disable Who Is Undercover word pairs.
- List, create, edit, enable, and disable Truth or Dare cards.
- Filter by type, category, intensity, and enabled status.

The first version does not need bulk import, rich text, media upload, or audit logs.

## Remotion Integration

Remotion is an enhancement layer, not a runtime dependency for core gameplay.

Potential compositions:

- Room invite short video using room code and selected game mode.
- Who Is Undercover victory reveal.
- Truth or Dare draw animation.
- End-of-game recap card.

Implementation guidance:

- Keep Remotion code isolated from the live game plugin.
- Use `useCurrentFrame()` and `interpolate()` for timeline animation.
- Do not rely on CSS animations or Tailwind animation utilities inside Remotion compositions.
- Store assets under `public/` and reference them with `staticFile()`.
- Use Remotion only after the core mobile room flow is stable.

## Error And Fallback States

The mobile UI must handle:

- D1 binding unavailable.
- Durable Object binding unavailable.
- WebSocket connection failed.
- Room not found.
- Room full.
- Duplicate nickname.
- Host disconnected.
- Player reconnecting.
- Late join disabled.
- Empty enabled content bank.

Fallback behavior:

- If D1 is unavailable, show the game as unavailable rather than pretending content is synced.
- If Durable Objects are unavailable, online rooms are unavailable.
- Admin content management should clearly show binding errors.

## Privacy And Safety

- No account or personal profile is required.
- Nicknames are room-local.
- Room state expires after inactivity.
- Do not persist every vote or punishment by default.
- Keep default Truth or Dare content light.
- Avoid adult or coercive prompts in seeded content.
- Do not expose IP addresses or user agents in UI.

## Testing

Add or update Playwright tests for:

- Plugin appears when enabled.
- Create room form validation.
- Join room validation.
- Room full state.
- Waiting room player count.
- Admin question bank list state.
- Binding unavailable state.

Manual or integration verification needed for:

- Two browser contexts joining the same room.
- WebSocket reconnect.
- Private word delivery only to the correct player.
- Vote reveal flow.
- Punishment draw flow.

## Implementation Phases

### Phase 1: Spec And Static Mobile UI

- Add `party-games` plugin shell.
- Add mobile entry, create room, join room, waiting room, and static gameplay states.
- Add plugin config schema and feature flag.

### Phase 2: D1 Content Store

- Add D1 migration for word pairs, Truth cards, Dare cards, and settings.
- Add seed data.
- Add admin APIs.
- Add admin question bank UI.

### Phase 3: Real-Time Rooms

- Add Durable Object room class.
- Add WebSocket endpoint.
- Implement create room, join room, player list, host start, and reconnect.

### Phase 4: Who Is Undercover Rules

- Implement role assignment.
- Implement private word delivery.
- Implement speaking, voting, result, and win checks.

### Phase 5: Truth Or Dare Punishment

- Implement standalone Truth or Dare.
- Implement punishment handoff from Who Is Undercover.
- Add card draw and completion flow.

### Phase 6: Remotion Enhancements

- Add optional compositions for invite, reveal, draw, and recap.
- Add still render checks for composition layout.

## Acceptance Criteria

- A host can create a Who Is Undercover room with a max player limit.
- A second phone or browser context can join by room code.
- The room blocks joins beyond max capacity.
- The host can start before the room is full when minimum player count is met.
- Each player receives only their own word.
- Voting produces a result and checks the classic win conditions.
- A loser can be sent into Truth or Dare punishment.
- Truth or Dare cards come from D1.
- Seed content is available after migrations.
- Admin can enable or disable game content with the reused token pattern.
- The mobile layout is usable in a narrow viewport without overlapping text or hidden primary actions.
- Missing Cloudflare bindings produce honest unavailable states.
