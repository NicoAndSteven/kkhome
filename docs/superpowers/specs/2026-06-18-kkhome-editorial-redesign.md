# KKHome Editorial Redesign Spec

**Goal:** Rebuild the site as a cold-white editorial magazine system with stronger typography, calmer color, and asymmetric layout.

**Scope:** Full-site visual redesign only. Keep current information architecture, routes, plugin content, and feature set. Do not add new product behavior in this phase.

**Direction:** The UI should feel like a curated digital magazine, not a dashboard or a flashy landing page. Use more whitespace, fewer borders, one accent color, and restrained motion.

---

## 1. Visual Principles

- Cold-white base with deep ink text.
- One accent color only, used consistently across the whole site.
- Fewer gradients, fewer glow effects, fewer layered glass surfaces.
- Asymmetry over symmetry.
- Editorial hierarchy over “card grid” repetition.
- Motion should support reading and navigation, not compete with it.

## 2. Color System

Use a simplified palette:

- Background: near-white with a cool tint.
- Surface: slightly warmer white than the background, still quiet.
- Text: deep ink, not pure black.
- Muted text: slate-gray with low saturation.
- Accent: one deep blue or blue-violet tone, applied consistently.
- Status colors: only when semantically necessary, and always restrained.

Remove the current mixed red/blue gradient dominance from the global shell. Keep red only if it is tied to actual status or content semantics.

## 3. Typography

- Use a stronger editorial hierarchy.
- Headings should be larger, denser, and more deliberate.
- Body text should be quieter with comfortable line height.
- Side labels and metadata should use mono sparingly, not everywhere.
- Avoid “all caps everywhere” styling.
- Prefer asymmetric type blocks and tighter headline rhythm.

## 4. Layout

- Home page stays functional, but its shell should feel calmer and more editorial.
- Desktop route pages should use a magazine-like reading frame.
- Sidebar should read like an index column, not a widget stack.
- Main content should feel like a page spread with clear breathing room.
- Avoid heavy bordered cards as the default container.
- Use separators, negative space, and selective panels instead of repeated boxes.

## 5. Component Strategy

- `Header`: reduce visual weight, simplify chrome, keep route controls clear.
- `BlogSidebar`: turn into a refined index column with stronger typographic hierarchy.
- `route-frame` and shared content wrappers: remove busy gradients and glow-heavy decoration.
- Shared panel and surface classes: consolidate into a smaller set of calmer surfaces.
- Plugin pages: preserve content, but restyle their outer shell to match the editorial system.

## 6. Motion

- Keep transitions short and purposeful.
- Use subtle translate/fade for route entry and content reveal.
- Keep hover feedback minimal.
- Do not add more “wow” effects until the base system looks right.

## 7. Implementation Constraints

- Do not change route structure or plugin behavior.
- Do not rewrite content.
- Do not introduce new visual gimmicks.
- Do not mix a second accent color into the shell.
- Preserve mobile readability and existing responsive breakpoints.

## 8. Success Criteria

- The site feels quieter, cleaner, and more deliberate.
- The color system looks unified at a glance.
- The sidebar and content area feel like parts of the same editorial layout.
- Nothing important gets hidden or visually crushed.
- The UI feels like a finished design system rather than an accumulation of styles.

