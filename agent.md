# kkhome Agent Notes

## Current source of truth
- Use this file for the active project notes and working assumptions.
- Do not keep parallel planning/spec copies unless they are actively maintained.

## Repository basics
- App code lives in `src/`.
- Static config lives in `public/config/`.
- E2E tests live in `tests/`.
- Use `npm run check` before handoff when code changes are involved.

## Current product direction
- The public site is in an active UI redesign.
- Prefer a single shared visual system across public pages.
- Keep homepage behavior, route structure, API contracts, and admin-only areas stable unless the task explicitly says otherwise.
- Treat older design drafts under `docs/superpowers/` as disposable once their important points are merged here.

## Working rules
- Preserve existing user changes outside the requested scope.
- Do not reintroduce deleted public entry points or routes without an explicit request.
- Keep UI changes accessible on desktop and mobile.
