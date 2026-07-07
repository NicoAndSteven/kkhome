# Party Games Phase 2 Closeout Design

## Context

The `party-games` feature already has a base product spec in `docs/superpowers/specs/2026-07-06-party-games-mobile-design.md` and an implementation plan for Phase 2 in `docs/superpowers/plans/2026-07-07-party-games-d1-content-store.md`.

Git history and current workspace state show that Phase 1 is complete and Phase 2 is partially implemented:

- D1 migration exists.
- Shared validation and CRUD helpers exist.
- Admin Pages Functions for `undercover` and `truth-or-dare` exist.
- Unit tests for shared content helpers exist.
- Admin UI work is in progress but not yet committed as a complete Phase 2 closeout.

This design defines how to take over the current in-progress Phase 2 work, finish it against the approved spec, and avoid expanding scope into Phase 3.

## Goal

Close out Phase 2 so the administrator can reliably manage party game content through the existing admin surface, with behavior that matches the product spec closely enough to treat D1-backed content management as complete.

## Non-Goals

This closeout does not include:

- Durable Objects
- WebSocket room state
- Online room creation or joining
- Who Is Undercover runtime rules
- Truth or Dare runtime punishment flow changes
- Bulk import/export
- Media upload
- Audit logs
- Server-side query-driven filtering unless current implementation proves front-end filtering is insufficient

## Current Phase Assessment

The implementation is still in **Phase 2: D1 Content Store**, not Phase 3.

Phase 2 is incomplete because the current admin UI does not yet fully satisfy the Phase 2 admin management requirements from the main spec:

- Add a `聚会题库` tab to the admin surface.
- List Who Is Undercover word pairs.
- List Truth or Dare cards.
- Create new content.
- Edit existing content.
- Enable and disable existing content.
- Filter by type, category, intensity, and enabled status.

The backend already covers most Phase 2 data concerns. The remaining work is primarily UI completion, interaction clarity, and end-to-end verification.

## Recommended Approach

Use a **progressive closeout** approach:

1. Keep the existing D1 schema and Phase 2 API boundaries.
2. Keep `src/components/PartyContentAdmin.tsx` as the main party-content management surface.
3. Add the missing Phase 2 behavior in the admin UI rather than expanding the backend contract.
4. Prefer front-end filtering over new server query parameters for this phase.
5. Add direct enable/disable actions in the list so status changes are obvious and low-friction.
6. Expand Playwright coverage from smoke-level visibility checks to behavior-level Phase 2 verification.

This is the lowest-risk path because it aligns with the current commit chain, preserves already-landed backend code, and avoids dragging Phase 2 into a broader architecture rewrite.

## Alternatives Considered

### Option A: Progressive UI closeout on current API

This keeps the current API shape and finishes the missing admin interactions in the React layer.

Pros:

- Minimal scope growth
- Matches current partial implementation
- Fastest route to a real Phase 2 finish
- Keeps risk localized to admin UI and tests

Cons:

- Filtering happens on the client
- `PartyContentAdmin.tsx` may need modest internal cleanup to stay readable

### Option B: Refactor admin content management before finishing behavior

This would split the UI into smaller components before adding the missing interactions.

Pros:

- Cleaner structure
- Better long-term maintainability

Cons:

- Slower Phase 2 completion
- Higher regression risk while current work is still unsettled
- Solves a structural problem before finishing the missing product behavior

### Option C: Expand backend filtering first

This would add query-based server filtering to the content APIs and then wire the admin UI to those parameters.

Pros:

- Better scaling if content volume grows
- Cleaner future contract for larger datasets

Cons:

- Expands Phase 2 beyond what is required
- Adds API and test surface without immediate product need
- Risks slipping into post-Phase-2 optimization work

## Chosen Design

Choose **Option A: Progressive UI closeout on current API**.

Phase 2 already has the right storage and endpoint shape. The missing value is in making the admin UI operational and verifiable. That means the design should finish the admin experience instead of reopening backend architecture questions.

## Functional Design

### 1. Admin Navigation

The existing admin panel keeps the new `聚会题库` tab.

When the administrator opens that tab:

- The app loads both `undercover` and `truth-or-dare` datasets.
- The tab renders independently from the existing music moderation lists.
- Loading and binding failures are shown honestly inside the party-content area.

### 2. Content Modes

The party content admin surface keeps two top-level content modes:

- `谁是卧底`
- `真心话大冒险`

The selected mode controls:

- which list is visible
- which edit form is shown
- which filter controls are visible

### 3. Listing

The list must show enough information to manage items without opening edit mode.

For `undercover` rows:

- civilian word
- undercover word
- category
- difficulty
- enabled state

For `truth-or-dare` rows:

- content
- type
- category
- intensity
- enabled state

### 4. Direct Status Management

Enable and disable must be a direct row action, not only a form field hidden behind edit mode.

Behavior:

- Enabled content shows a direct `停用` action.
- Disabled content shows a direct `启用` action.
- The action reuses the existing update endpoint and preserves the rest of the item fields.
- The list refreshes after status mutation.

This keeps the spec’s enable/disable requirement obvious and fast.

### 5. Filters

Filters are implemented in the UI for Phase 2.

Required filters:

- `undercover`: category, difficulty, enabled status
- `truth-or-dare`: type, category, intensity, enabled status

Filtering rules:

- Filters operate on already-loaded content arrays.
- Default state is “all”.
- Filters can be combined.
- If no results match, the UI shows an empty-state message specific to the active content mode.

This satisfies the spec without adding new server query parameters.

### 6. Create And Edit

The existing create/edit side form remains the primary editing mechanism.

Behavior:

- `新增题目` remains the default form mode.
- Clicking `编辑` loads the item into the form.
- Saving an item returns the form to create mode.
- Validation errors continue to surface from the API response.

The form does not need bulk actions or advanced workflows in this phase.

## UI Structure

`src/components/PartyContentAdmin.tsx` remains the top-level container for Phase 2.

Its responsibilities should be:

- fetch both datasets
- hold current content mode state
- hold filter state
- derive filtered lists
- handle save and direct status toggle actions
- render list, empty, loading, and error states

If the file becomes hard to follow while adding filters and direct status actions, it is acceptable to extract small local-presentational helpers, but this is optional. Finishing missing product behavior is more important than aggressive refactoring.

## Data Flow

1. Admin enters `聚会题库`.
2. UI fetches both resources with the reused bearer token.
3. Raw API results are stored in local React state.
4. Visible rows are derived through client-side filters.
5. Create, edit, enable, and disable all call the existing POST or PUT endpoints.
6. After mutation, the UI refreshes content from the server to avoid local divergence.

## Error Handling

The closeout must preserve explicit failure states:

- Missing `WISHES_DB` binding remains a server error surfaced in UI.
- Unauthorized access remains blocked by the existing bearer-token guard.
- Invalid item payloads remain validated by `partyContent.js`.
- Failed mutations show a visible error path and do not silently reset the form.

Direct enable/disable actions should also surface failure clearly rather than fail invisibly.

## Testing Design

Phase 2 closeout needs verification beyond simple presence checks.

### Unit level

Keep the existing helper tests and extend them only if UI-driven behavior reveals missing API assumptions.

No new server filtering tests are required because filtering stays client-side in this phase.

### End-to-end level

Playwright should verify:

- admin can open the `聚会题库` tab
- admin can switch between `谁是卧底` and `真心话大冒险`
- filters change visible results correctly
- enabled and disabled status can be toggled from the list
- the create/edit surface still appears and remains reachable

At least one interaction test should cover a real mutation path through mocked responses, not only static rendering.

## Acceptance Criteria

Phase 2 closeout is complete when all of the following are true:

- `聚会题库` is reachable from the admin panel.
- Both content resources load with the existing admin token flow.
- Admin can list, create, edit, enable, and disable `undercover` items.
- Admin can list, create, edit, enable, and disable `truth-or-dare` items.
- Admin can filter by category and enabled status for both resources.
- Admin can filter by difficulty for `undercover`.
- Admin can filter by type and intensity for `truth-or-dare`.
- UI empty states are correct after filtering.
- Phase 2 Playwright coverage verifies interaction, not just visibility.
- No Phase 3 realtime room work is introduced during this closeout.

## Implementation Boundaries

The closeout should touch only the minimum set of files needed:

- `src/components/AdminPanel.tsx`
- `src/components/PartyContentAdmin.tsx`
- `tests/homepage.spec.ts`

Backend files should change only if verification reveals a concrete defect. This protects the already-landed Phase 2 API work from unnecessary churn.
