# kkhome Public UI Redesign: Dark Media System

## Goal
Rebuild all public-facing pages except the welcome/home screen into a unified dark media interface inspired by NetEase Cloud Music, while preserving existing routes, content, and admin-only surfaces.

## Scope
### In scope
- `src/App.tsx` public route shell
- `src/components/BlogSidebar.tsx`
- `src/components/Header.tsx`, `src/components/MobileTabBar.tsx`, `src/components/Layout.tsx`, `src/components/Loading.tsx`
- Public plugin UIs, especially `src/plugins/local-music/index.tsx` and `src/plugins/ambient-music/index.tsx`
- Public-facing routes: `ai-tools`, `wish-wall`, `cloudflare-lab`, `news`, `stock-watch`, `food`, `ambient-music`, `gallery`, `local-music`

### Out of scope
- Welcome/home screen at `#/home`
- Admin login and admin-only audit / moderation UI
- Route IDs, data flow, API contracts, and plugin enablement logic

## Design Direction
Reading this as an existing personal hub redesign for public users, with a dark media language, high visual density, strong hierarchy, and restrained red accent.

## Visual Principles
- One theme for all public routes: deep charcoal / black base, off-white text, NetEase-like red accent
- One accent color: red only, used for active states, CTA, progress, and selected rows
- Clear hierarchy over decoration: top-level nav, content shell, content cards, lists, and media state bars
- Softer corners than current UI, but not fully pill-shaped everywhere
- Tighter, denser layouts for media and list-heavy pages, with more space only where content needs breathing room

## Page Shell
- Replace the current light glass route frame with a dark shell for all public routes
- Keep the left sidebar layout on desktop, but restyle it as a media client navigation rail
- On mobile, use a dark top/bottom navigation treatment with full-width content cards
- Preserve the current route structure and active route handling in `App.tsx`

## Shared Components
### Sidebar
- Dark background, subtle border, strong active state
- Active route gets red indicator and brighter label, not a light pill
- Secondary routes stay visually quieter

### Header / Mobile Nav
- Reduce decorative glass effects
- Use compact, media-client style controls and a stronger active route treatment

### Surfaces
- Replace white cards with charcoal panels and lighter inset borders
- Keep hover lift small and purposeful
- Use tinted shadows instead of generic black shadows

## Music Pages
### Local Music
- Make this the flagship page
- Add a large now-playing header area, compact transport controls, and a dense song list
- Make selected, playing, and hover states more explicit
- Keep upload / wish entry points, but visually subordinate them to playback
- Do not show admin-only moderation UI styling changes here

### Ambient Music
- Convert to a cleaner dark control board
- Use compact track cards with stronger playback state, volume controls, and mixed-source emphasis
- Keep the multi-track nature readable without making it feel like an admin panel

## Public Non-Music Pages
- `news`, `stock-watch`, `gallery`, `food`, `wish-wall`, `ai-tools`, `cloudflare-lab` should all adopt the same dark system
- Each page keeps its own content model, but cards, chips, lists, empty states, and button styles become consistent
- Replace bright light surfaces with dark content panels and red-focused interaction states

## Motion
- Keep motion restrained and confident
- Use fade, slide, and subtle scale for page states and list interaction
- No flashy neon animation, no excessive glow, no decorative motion that competes with content
- Preserve accessibility with reduced-motion fallbacks

## States
- Loading: skeletons or structural placeholders, not only spinners
- Empty: composed dark empty states with a clear next step
- Error: inline and contextual, readable on dark backgrounds

## Implementation Strategy
1. Update the shared design tokens and public shell styles in `src/index.css`
2. Restyle the public navigation shell in `src/App.tsx` and `src/components/BlogSidebar.tsx`
3. Update shared UI primitives used by public routes
4. Redesign `local-music` and `ambient-music` first as the reference implementation
5. Cascade the same system to remaining public pages
6. Verify contrast, responsiveness, and route-level regressions

## Acceptance Criteria
- Welcome/home screen remains visually unchanged
- Admin-only moderation UI remains functionally intact and visually untouched
- All public routes feel like one coherent dark media product
- Music pages clearly feel closer to a polished client like NetEase Cloud Music
- No route, API, or data model changes are required for the visual redesign

## Risks
- Dark mode can expose contrast issues in some existing utility classes
- Shared components may need broader token cleanup than expected
- Some plugin pages may rely on light surfaces and will need targeted overrides rather than one global replacement
