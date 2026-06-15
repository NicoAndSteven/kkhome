# Design System: kkhome — Kinetic Personal Hub

## 1. Visual Theme & Atmosphere

A kinetic, editorial-grade personal dashboard that feels alive with perpetual micro-motion. The atmosphere is **architectural yet playful** — deep charcoal foundations with vibrant cyan energy pulses, asymmetric compositional risk, and hardware-accelerated motion at every interaction layer.

- **Density:** Balanced (5/10) — spacious on hero, dense on data views
- **Variance:** Confident Asymmetric (7/10) — no symmetrical hero sections, no 3-column equal card grids
- **Motion:** Cinematic Choreography (8/10) — spring physics, parallax depth, perpetual micro-interactions, staggered orchestration
- **Emotion:** Premium, alive, technically confident — like walking through a well-lit gallery where every artifact responds to your presence

## 2. Color Palette & Roles

- **Abyss Black** (#070809) — Primary background, deepest layer
- **Charcoal Canvas** (#111416) — Secondary background surface
- **Surface Card** (#15191b) — Card and container fill
- **Cyan Pulse** (#8be9f4) — Primary accent, interactive states, active indicators
- **Ember Orange** (#ff6b4a) — Secondary accent, CTAs, energy markers, error states
- **Warm Amber** (#ffd6a3) — Tertiary accent, highlights, premium badges
- **Pearl White** (#f1ece6) — Primary text on dark backgrounds
- **Muted Silver** (#9aa3a8) — Secondary text, metadata, descriptions
- **Subtle Border** (rgba(223, 232, 236, 0.12)) — Card borders, structural lines
- **Cyan Glow** (rgba(139, 233, 244, 0.10)) — Ambient glow behind active elements
- **Ember Glow** (rgba(255, 107, 74, 0.08)) — Secondary ambient glow
- **Canvas White** (#f4f5f2) — Light mode background
- **Pure Surface** (#ffffff) — Light mode card fill
- **Charcoal Ink** (#1a1a1a) — Light mode primary text
- **Slate Muted** (#687076) — Light mode secondary text

## 3. Typography Rules

- **Display:** Geist + Cabinet Grotesk — Track-tight, weight-driven hierarchy. Display sizes use negative letter-spacing for premium compactness. Never use font-size alone for hierarchy — pair weight and color.
- **Body:** Geist — Relaxed leading (1.6–1.75), max 65ch width, neutral secondary color for subdued content
- **Mono:** JetBrains Mono — For all numerical data, timestamps, labels, metadata, keyboard shortcuts. Monospace everywhere data needs precision.
- **Scale:**
  - Display: 112px desktop / 56px mobile, weight 700, letter-spacing -0.04em
  - Headline: 32px, weight 600, letter-spacing -0.02em
  - Body Large: 18px, weight 400, leading 1.75
  - Body: 16px, weight 400, leading 1.6
  - Label Mono: 14px/12px/10px, weight 500, letter-spacing 0.02em, uppercase
- **Banned:** Inter, generic system fonts. No serif fonts in dashboards.

## 4. Component Stylings

### Buttons
- **Primary:** Solid accent fill (Cyan Pulse), white text, weight 600. No outer glow. On hover: slight lift (-2px translateY) with intensified shadow. On active: tactile -1px translateY with scale(0.98). Shimmer overflow on primary CTA buttons.
- **Secondary:** Glass background with 1px subtle border. On hover: border shifts to accent with 30% opacity, background gains accent at 8%.
- **Ghost:** No background, no border. On hover: subtle background at 8% accent.
- **All buttons:** Min 44px tap target. No neon outer glows. No custom cursors.

### Cards
- **Elevated cards:** Large rounded corners (1.5rem / 24px), diffused whisper shadow tinted to background. Used only when elevation serves hierarchy.
- **Surface cards:** 1px subtle border, no shadow. Background at card level. On hover: border shifts to accent at 25% opacity, -2px translateY lift, shadow intensifies.
- **High-density cards:** Replace card containers with border-top dividers or pure negative space separation.
- **Loading skeleton:** Skeletal shimmer matching exact card dimensions — never generic circular spinners.

### Inputs & Forms
- Label above input (never floating labels), helper text optional, error text below.
- Focus ring in accent color with subtle glow, 2px offset.
- Background at surface level, inset shadow for depth.
- Search inputs: icon left-inset, clear button on right when populated.

### Navigation
- **Header:** Fixed top bar, glass background (backdrop-blur-xl), 1px bottom border. Horizontal scroll on mobile with overflow-x-auto.
- **Progress Rail:** Right-side vertical dot rail. Active dot expands to pill shape with accent fill. Dot count matches available routes.
- **Route tabs:** Bottom border indicator for active state. Hover shows animated underline with scale transition.

### Drawers & Modals
- **Contact Drawer:** Right-side slide-in panel, max 420px width. Full-height backdrop with blur. Spring transition on open/close (transform translateX).
- **Overlay:** Backdrop with 3px blur, opacity fade transition.

### Empty States
- Composed, intentional compositions — never just "No data" text. Provide actionable next step.
- Use muted icon + descriptive text + CTA button pattern.

### Error States
- Inline error banners: accent border at 20% opacity, accent background at 10%, icon + message.
- Full-page error: centered composition with error code in display mono, description, retry button.

## 5. Layout Principles

- **Grid:** 12-column CSS Grid. Never flexbox percentage math (`calc()` hacks banned).
- **Hero:** Left-aligned asymmetric split. Text occupies 7 columns, visual/decorative panel occupies 5 columns. Never centered hero sections.
- **Max-width:** 1480px centered container for home page. Full-bleed for route pages.
- **Section spacing:** `clamp(3rem, 8vw, 6rem)` vertical gaps. Internal card padding: `clamp(1rem, 3vw, 2rem)`.
- **Route view:** Full viewport height with 3D perspective wrapper. Content frame floats inside depth layers.
- **Mobile collapse:** All multi-column layouts collapse to single column below 768px. No horizontal overflow.
- **Full-height:** Use `min-h-[100dvh]` never `h-screen`.
- **Background:** Fixed grid pattern (88px cells) with ambient gradient orbs that respond to mouse position (--mouse-x / --mouse-y CSS variables). Cyan glow from bottom-left, ember glow from top-right.

## 6. Motion & Interaction

### Core Philosophy
Every element should feel alive. No static interfaces. Motion communicates hierarchy, state, and personality.

### Spring Physics (default)
- **Interactive elements:** `stiffness: 120, damping: 14` — premium bounce-back on hover, press, and release
- **Page transitions:** `stiffness: 80, damping: 12` — weighty, cinematic camera moves
- **Drawer/modal reveals:** `stiffness: 100, damping: 16` — smooth slide with subtle overshoot
- **Never linear easing.** All transitions use cubic-bezier(0.16, 1, 0.3, 1) — the "premium ease" curve.

### Perpetual Micro-Interactions
- **Background orbs:** Slow floating animation (20s duration, infinite) on ambient gradient blobs
- **Progress dots:** Gentle pulse animation on the active dot (2s cycle)
- **Status indicators:** Slow breathing pulse on online/live indicators
- **Shimmer buttons:** Infinite shimmer sweep across primary CTA buttons (3s cycle)
- **Route transitions:** 3D camera rotation on route enter (rotateX, translateZ, blur fade-in cascade)
- **Intro stage:** Grid rise, scanline sweep, ring pulse, copy reveal — orchestrated timeline (1.8s total)

### Staggered Orchestration
- **List/Grid reveals:** Children animate in sequence with 80ms cascade delay per item, 760ms total duration
- **Content sections:** Opacity + translateY fade-in, staggered by nth-child with CSS custom property `--stagger`
- **Route depth layers:** Three depth planes (far/mid/frame) animate in sequence creating 3D parallax entrance

### Performance Rules
- Animate exclusively via `transform` and `opacity` — never `top`, `left`, `width`, `height`
- Use `will-change: transform` on animated elements
- `contain: paint` on shimmer overflow elements
- Respect `prefers-reduced-motion`: disable all animations, show static content immediately
- Hardware-accelerated transforms via `translate3d` and `scale3d`

### Scroll Effects
- **Reveal on scroll:** IntersectionObserver at 15% threshold, adds `.active` class for fade-in-up animation (800ms)
- **Parallax background:** Grid pattern shifts subtly based on scroll position
- **Mouse-reactive:** Background gradient orbs track cursor position via `--mouse-x` / `--mouse-y`

## 7. Responsive Rules

- **Mobile-first collapse < 768px:** All multi-column → single column. No exceptions.
- **Header:** Horizontal nav with scroll on mobile. Route labels visible, no hamburger menu — content-first approach.
- **Typography:** Display scales via `clamp()`. Body min 14px.
- **Touch targets:** All interactive elements min 44px.
- **Progress rail:** Hidden on mobile (below 768px) and short viewports (below 820px height).
- **Section gaps:** Reduce proportionally on mobile (`clamp(2rem, 5vw, 4rem)`).

## 8. Anti-Patterns (Banned)

- ❌ No emojis anywhere in UI
- ❌ No Inter font
- ❌ No serif fonts in dashboards
- ❌ No pure black (#000000)
- ❌ No neon/outer glow shadows (use tinted diffuse shadows)
- ❌ No oversaturated accents (max saturation 80%)
- ❌ No excessive gradient text on large headers
- ❌ No custom mouse cursors
- ❌ No overlapping elements — clean spatial separation
- ❌ No 3-column equal card layouts
- ❌ No centered hero sections
- ❌ No generic names ("John Doe", "Acme Team")
- ❌ No fake round numbers ("99.99%", "50%+")
- ❌ No AI copywriting clichés ("Elevate", "Seamless", "Unleash", "Next-Gen", "Supercharge")
- ❌ No filler UI text: "Scroll to explore", "Swipe down", scroll arrows, bouncing chevrons
- ❌ No broken Unsplash links — use picsum.photos or SVG
- ❌ No circular spinners — use skeletal shimmer instead
- ❌ No `h-screen` — use `min-h-[100dvh]` only
