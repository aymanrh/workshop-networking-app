---
phase: 1
slug: foundation-static-export-spine
status: approved
shadcn_initialized: true
preset: new-york
created: 2026-05-12
---

# Phase 1 — UI Design Contract

> Visual and interaction contract for the Foundation & Static-Export Spine phase.
> Phase 1 ships the **shell only** — sidebar (desktop), bottom nav (mobile), TopBar with theme toggle, placeholder routes. No data UIs land in Phase 1; this contract locks the shell's visual language and the design-system tokens that every later phase will inherit.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui CLI 3.5 |
| Preset | new-york |
| Component library | Radix primitives via shadcn |
| Icon library | lucide-react |
| Font | Geist Sans + Geist Mono (via `next/font/google`) — falls through to Inter if Geist not available |

**shadcn primitives installed in Phase 1:** `button`, `dropdown-menu`, `separator`, `skeleton` (only what the shell needs).
Deferred to Phase 2+: `input`, `label`, `form`, `card`, `dialog`, `sheet`, `command`, `tabs`, `badge`, `avatar`, `scroll-area`, `sonner`.

---

## Spacing Scale

Declared values (multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon-to-label gap in nav items, inline chips |
| sm | 8px | Compact element spacing (nav-item internal padding) |
| md | 16px | Default element spacing (page content padding) |
| lg | 24px | Section padding inside cards / page sections |
| xl | 32px | Layout gaps between major sections on desktop |
| 2xl | 48px | Vertical rhythm between page header and content |
| 3xl | 64px | Reserved — not used in Phase 1 |

Exceptions: none. Tailwind defaults (`p-1`, `p-2`, `p-4`, `p-6`, `p-8`, `p-12`) map cleanly onto this scale.

**Sidebar width (desktop):** `w-64` (256px). **BottomNav height (mobile):** `h-16` (64px) + safe-area-inset-bottom. **TopBar height:** `h-14` (56px).

---

## Typography

Geist Sans variable font; line-heights via Tailwind `leading-*`.

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 14px (`text-sm`) | 400 | 1.5 (`leading-normal`) |
| Label | 13px (`text-[13px]`) | 500 | 1.3 (`leading-tight`) — nav labels, badges |
| Heading | 20px (`text-xl`) | 600 | 1.3 (`leading-tight`) — page titles |
| Display | 24px (`text-2xl`) | 600 | 1.2 (`leading-snug`) — H1 on placeholder pages |

Tabular numerals reserved for future use (counts in Phase 4).
No weights heavier than 600 in Phase 1 — Linear/Notion polish requires restraint.

---

## Color

Tokens are HSL strings consumed by Tailwind v4 `@theme` directive in `globals.css`. Values match `research/ARCHITECTURE.md` §"Theming" exactly.

| Role | Value (light) | Value (dark) | Usage |
|------|---------------|--------------|-------|
| Dominant (60%) | `0 0% 100%` (`--background`) | `240 10% 4%` | Background, page surface |
| Secondary (30%) | `240 5% 96%` (`--muted`) | `240 4% 12%` | Sidebar bg, nav bg, hover surfaces |
| Accent (10%) | `240 6% 10%` (`--primary`) | `0 0% 98%` | Active nav item, theme-toggle pressed state, focus ring |
| Destructive | shadcn default red | shadcn default red | NOT USED in Phase 1 — reserved for Phase 2 delete flows |
| Border | `240 6% 90%` | `240 4% 16%` | Sidebar/TopBar dividers |
| Foreground | `240 10% 4%` | `0 0% 98%` | Body text |
| Muted foreground | `240 4% 46%` | `240 5% 65%` | Placeholder text on /people, /events |

**Accent reserved for:** active nav item only (currently selected route), theme toggle icon, focus ring on interactive elements. Never "all interactive elements" — buttons in Phase 1 (theme toggle) are ghost-styled.

`--radius: 0.5rem` (8px) — tighter than shadcn default; Linear-style.

---

## Copywriting Contract

Phase 1 is shell + placeholders. Copy is minimal and explicit about the deferred-by-design state.

| Element | Copy |
|---------|------|
| App title (TopBar) | `Networking App` |
| Nav label: Home | `Home` |
| Nav label: People | `People` |
| Nav label: Events | `Events` |
| Theme toggle: light → dark | Icon-only; `aria-label="Switch to dark theme"` |
| Theme toggle: dark → light | Icon-only; `aria-label="Switch to light theme"` |
| Theme toggle: system | Icon-only; `aria-label="Use system theme"` |
| Home page H1 | `Home` |
| Home page body | `Welcome. Add your first person from the People tab.` (no FAB in Phase 1) |
| People page H1 | `People` |
| People list empty (Phase 1 placeholder) | `No people yet — coming in Phase 2.` |
| Events page H1 | `Events` |
| Events list empty (Phase 1 placeholder) | `No events yet — coming in Phase 3.` |
| Person detail placeholder | `Person {id} — detail view coming in Phase 2.` |
| Event detail placeholder | `Event {id} — detail view coming in Phase 3.` |
| Primary CTA (Phase 1) | None — no actions yet. FAB lands in Phase 2. |
| Destructive confirmation | N/A in Phase 1. |

**Voice:** direct, factual, kind. No marketing language. No emoji in UI copy.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | `button`, `dropdown-menu` (theme toggle menu), `separator`, `skeleton` | Not required — official registry |
| `next-themes` | `ThemeProvider` | Not required — direct npm dep |
| `lucide-react` | `Home`, `Users`, `Calendar`, `Sun`, `Moon`, `Monitor` icons | Not required — direct npm dep |

No third-party registries used in Phase 1.

---

## Interaction Contracts

### Navigation

- **Desktop (≥md):** persistent sidebar on the left, 256px wide; logo+title at top, nav items as vertical stack, theme toggle pinned at bottom of sidebar.
- **Mobile (<md):** fixed bottom nav with 3 tab buttons + safe-area padding; TopBar at top holds title + theme toggle.
- **Active state:** route currently matched gets the accent color background (`bg-accent`) and accent foreground.
- **Hover state:** desktop sidebar items get `bg-muted` on hover via `@media (hover: hover)` so iOS doesn't keep stuck hover (PITFALLS §"Hover styles stick on tap").
- **Focus state:** every interactive element gets a 2px focus ring in accent color (`outline-2 outline-offset-2 outline-primary`) — required for keyboard access.

### Theme Toggle

- Renders as `dropdown-menu` triggered by an icon button in the header (desktop) or TopBar (mobile).
- Three items: `Light`, `Dark`, `System` — each with its lucide icon.
- Active item shows a check icon.
- Initial paint matches `system` preference via the `next-themes` inline script (no FOUC, FND-08).

### Responsive Breakpoints

| Breakpoint | Tailwind alias | Width | Behavior |
|------------|----------------|-------|----------|
| Mobile (default) | none | <768px | Bottom nav, TopBar visible, sidebar hidden |
| Tablet/Desktop | `md:` | ≥768px | Sidebar visible, bottom nav hidden, TopBar simplified |
| Wide (deferred) | `lg:` | ≥1024px | Master-detail layout (v2, not Phase 1) |

### Safe-Area & Viewport

- Root layout uses `min-h-dvh` (NOT `min-h-screen` which is `100vh`) per POL-04.
- BottomNav uses `pb-[env(safe-area-inset-bottom)]`.
- Main content area uses `pb-20 md:pb-8` to clear bottom nav on mobile.
- No `100vh` anywhere in the codebase — ESLint rule or grep-check in CI is a future-Phase-4 polish item.

### Loading States

Phase 1 placeholder pages are static — no loading skeletons needed yet. The `skeleton` shadcn primitive is installed but unused; it lands in Phase 2 for the People list.

### Empty States

Phase 1 placeholder copy IS the empty state. A dedicated `<EmptyState>` component is **not** built in Phase 1 — defer to Phase 2 where it gets a real design with CTAs.

---

## Accessibility

- All interactive elements: minimum 44×44px tap target on mobile (POL-03). Sidebar items on desktop can be `h-9` (36px) since they're keyboard-driven.
- Focus visible: 2px accent ring with 2px offset on every focusable element.
- Color contrast: WCAG AA — verified via shadcn `new-york` token defaults which already meet AA in both modes.
- Keyboard nav: Tab moves through TopBar → Sidebar → Content. `Escape` closes any dropdown menu.
- Screen reader: `<nav aria-label="Primary">` around sidebar; `<nav aria-label="Mobile navigation">` around bottom nav.

---

## Visual Hierarchy Examples

### Desktop layout
```
┌────────────┬────────────────────────────────────────┐
│            │  Networking App           [☼/☾ menu]   │ ← TopBar h-14
│  Networking│  ──────────────────────────────────────│
│            │                                        │
│  ◉ Home    │  # Home                                │
│  ○ People  │                                        │
│  ○ Events  │  Welcome. Add your first person        │
│            │  from the People tab.                  │
│            │                                        │
│            │                                        │
│  [☼ Theme] │                                        │
└────────────┴────────────────────────────────────────┘
   w-64                       (content)
```

### Mobile layout
```
┌──────────────────────────────────┐
│ Networking App           [☼]    │ ← TopBar h-14
│ ─────────────────────────────── │
│                                  │
│ # Home                           │
│                                  │
│ Welcome. Add your first person   │
│ from the People tab.             │
│                                  │
│                                  │
│                                  │
│                                  │
│ ─────────────────────────────── │
│  [⌂ Home] [☺ People] [📆 Events] │ ← BottomNav h-16 + safe-area
└──────────────────────────────────┘
```

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS — every visible string is named, voice is direct, no marketing fluff
- [x] Dimension 2 Visuals: PASS — sidebar/bottom-nav/topbar pattern matches wireframes; placeholder routes have explicit copy
- [x] Dimension 3 Color: PASS — 60/30/10 ratio enforced; accent reserved for active state + focus only
- [x] Dimension 4 Typography: PASS — single font family (Geist), restrained weights (400/500/600), explicit role table
- [x] Dimension 5 Spacing: PASS — all values multiples of 4; sidebar/topbar/bottomnav dimensions declared
- [x] Dimension 6 Registry Safety: PASS — only official shadcn registry blocks used; no third-party registries

**Approval:** approved 2026-05-12 (auto-mode; gray areas were entirely locked by PROJECT.md, REQUIREMENTS.md, and `research/ARCHITECTURE.md` §Theming — checker dimensions all trivially satisfy from the lock)
