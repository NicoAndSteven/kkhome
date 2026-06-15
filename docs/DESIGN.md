# Design System: kkhome — Sea Salt Soda Personal Blog

## 1. Visual Theme & Atmosphere

A fresh, clean personal blog with a **Sea Salt Soda** aesthetic — cool,通透, and calming. The atmosphere is like a seaside café: cold white bases with seafoam green and sky blue accents, cherry blossom pink as playful highlights. The design is minimal and editorial, with generous white space, subtle glassmorphism, and gentle micro-motion.

- **Density:** Balanced — spacious hero, dense data views
- **Variance:** Clean asymmetric layouts
- **Motion:** Gentle and purposeful — scroll reveals, fade transitions, Vanta Birds dynamic background on homepage

## 2. Color Palette & Roles

- **Ice White** (#F5F9FC) — Primary background, cool off-white
- **Pure White** (#FFFFFF) — Card surfaces, containers
- **Seafoam** (#4DD0C8) — Primary accent, buttons, links, active states
- **Sky Blue** (#64B5F6) — Secondary accent, gradients, supporting interactions
- **Cherry Pink** (#F06292) — Tertiary accent, CTAs, highlights, badges
- **Deep Slate** (#37474F) — Primary text, headings
- **Muted Steel** (#90A4AE) — Secondary text, metadata, placeholders
- **Frost Border** (#E0ECF5) — Subtle card and container borders
- **Blue Mist** (#F0F6FE) — Container backgrounds, tag/chip backgrounds

## 3. Typography

- **Display/Headlines:** Geist — Weight 700 for display (56px–112px), Weight 600 for headlines (32px). Tight letter-spacing for premium feel.
- **Body:** Geist — Weight 400, 16px body, 14px small. Relaxed leading (1.6–1.75). Max 65ch width.
- **Monospace:** JetBrains Mono — For labels, metadata, tags, data displays. Uppercase with letter-spacing 0.02em.
- **Banned fonts:** Inter (overused), serif fonts in UI context.

## 4. Layout & Navigation

### Welcome Screen (Home)
- Full-screen Vanta Birds dynamic background (animated birds in seafoam/purple)
- Centered content: gradient brand logo (rounded square) + name + optional daily quote + "Get Started" button
- No navigation header, no sidebar — minimal entry point

### Blog Pages
- **Header:** Simple — brand logo only, no route tabs. Glass backdrop (85% white, blur). Bottom border in frost color.
- **Sidebar:** 200px left sidebar, white background, frost border-right. Each route has an icon and label. Active route highlighted with seafoam accent background.
- **Content Area:** Glass container (80% white, blur 12px, rounded 16px, seafoam border glow). Gradient top border (seafoam → sky blue → cherry pink). Dashed inner border decoration. Content scrolls internally.
- **Mobile (<768px):** Sidebar hidden, content full-width.

## 5. Component Stylings

### Cards (Surface Items)
- White background, 1px frost border (#E0ECF5)
- Rounded corners (8px)
- Subtle shadow (inset top highlight)
- **Hover:** Lift -3px, seafoam border, soft glow

### Buttons
- **Primary:** Seafoam-to-Sky-Blue gradient fill, white text (14-15px, weight 600). Rounded (8-12px). Subtle shadow. Hover: slight lift. Active: scale(0.98).
- **Secondary:** White background, 1px frost border, slate text. Hover: seafoam border tint.
- **Ghost:** No background/border. Hover: seafoam bg at 8%.

### Tags/Chips
- Blue mist background (#F0F6FE), seafoam or pink text
- Rounded (4px), small padding
- Or: white bg, frost border

### Glass Panels
- Background: rgba(255,255,255,0.8–0.9)
- backdrop-filter: blur(12px)
- Frost border, rounded (16px)
- Optional gradient top accent stripe

### Navigation (Sidebar)
- 200px width, white bg, frost right border
- Each nav item: icon + label, rounded (8px), slate text
- **Hover:** Blue mist background
- **Active:** Seafoam bg at 10%, seafoam text, medium weight
- Divider line between primary and secondary sections

### Inputs
- Blue mist background (#F0F6FE), frost border
- Focus: seafoam border + glow ring
- Placeholder: muted steel (#90A4AE)

## 6. Motion & Interaction

- **Scroll Reveal:** Elements fade in and translate up when scrolled into view (IntersectionObserver, 15% threshold). Spring-like ease (0.16, 1, 0.3, 1). Staggered per child.
- **Intro Sequence (homepage):** Vanta Rings animation → Grid rise + scanline sweep + ring pulse + text reveal (1.8s orchestrated) → Rings fade out → Vanta Birds background appears (1.2s crossfade).
- **Route Transitions:** Simple fade-in with translateY (500ms, no 3D effects).
- **Card Hover:** Lift with seafoam border glow (320ms ease).
- **Perpetual:** Pulse ring on status indicators, gentle float on decorative elements.
- **Reduced Motion:** All animations respect prefers-reduced-motion. Intro skipped, transitions instant.

## 7. Responsive Rules

- **<768px:** Sidebar hidden, single-column layouts, reduced padding
- **Typography:** Headlines scale via clamp()
- **Touch targets:** Minimum 44px
- **Content:** No horizontal overflow
- **Section gaps:** clamp(2rem, 5vw, 4rem)

## 8. Pages/Screens

### Welcome Screen (Homepage)
Full-screen Vanta Birds background with centered content:
- Gradient brand logo (rounded square, seafoam → sky blue)
- Name in large display weight
- Optional daily inspirational quote (italic, slate text)
- "Get Started" button (gradient, with arrow animation on hover)

### AI Navigator (Tool Search)
- Search bar with icon + intent chips + category tabs
- 3-column tool card grid
- Each card: icon box, title, hostname, description, tags, optional "Pick" badge
- Search and category filtering

### News Aggregator
- Country selector (pill buttons) + stat badges
- AI overview card with seafoam border
- 3-column headline card grid (source badge, headline, timestamp, hover "open" link)
- Historical overview section (previous round + yesterday)

### Wish Wall
- Wish list with status badges (new/accepted/building/shipped)
- Submit form: title, detail, author, category selector
- Real-time updates via API

### Cloudflare Lab
- Health status + binding/feature/experiment grids
- 2-column panel layout
- Status badges (bound/pending/on/off)

### Stock Watch
- Stock list with price, change %, market state
- Detail view with charts (lightweight-charts)
- Search/add symbols

### Food Wheel
- Period-aware spinner (noon/evening)
- Today's result banner
- Menu management drawer
- 24-hour auto-switch

## 9. Banned Patterns
- No dark mode (light theme only)
- No 3D perspective or depth effects
- No emojis in UI
- No neon/outer-glow shadows
- No centered hero sections (home page is centered, but it's a welcome screen not a hero)
- No 3-column equal card grids (use asymmetric or varied layouts)
- No circular spinners (use skeleton shimmer instead)
