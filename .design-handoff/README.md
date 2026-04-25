# Handoff: ADHD Life — Dashboard

## Overview
A daily productivity dashboard designed for people with ADHD. The dashboard surfaces the most important information for today: focus tasks, habit tracking, carried-over tasks, upcoming calendar events, and a week strip. It also includes a quick-add modal, dark mode, and a responsive layout that collapses to a mobile bottom-nav pattern.

## About the Design Files
`dashboard.html` is a **high-fidelity design reference** built in React + Tailwind. It is a prototype showing the intended look, feel, and interactions — **not** production code to copy directly. The task is to **recreate this UI in your target codebase** using its existing framework, libraries, and design conventions. If no framework exists yet, React + Tailwind is a natural fit given the prototype.

## Fidelity
**High-fidelity.** Colors, typography, spacing, shadows, and interactions are all final. Recreate pixel-precisely, adapting to your framework's conventions.

---

## Design Tokens

### Colors
All tokens are CSS custom properties that flip between light and dark mode via a `.dark` class on the root element.

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--bg-page` | `#fdf6ed` | `#18120e` | Page background |
| `--bg-card` | `#fffef9` | `#231810` | Card backgrounds |
| `--bg-card-lite` | `#faf5ea` | `#1e1409` | Secondary card / nested bg |
| `--bg-sidebar` | `#fffef9` | `#1c1510` | Sidebar bg |
| `--bg-hover` | `#fdf0df` | `#2e1f13` | Row hover state |
| `--bg-accent` | `#fdeef2` | `#3a1520` | Accent pill bg (pink) |
| `--border` | `#e2d4c0` | `#3a2a1f` | Default borders |
| `--shadow` | `#dfd0b8` | `#0f0a07` | Hard-offset box shadows |
| `--text-primary` | `#2d1f14` | `#e8d5bc` | Headings, strong labels |
| `--text-body` | `#3d2b1a` | `#d4be9e` | Body text |
| `--text-muted` | `#a08060` | `#8a6a50` | Secondary labels |
| `--text-faint` | `#c4a882` | `#5c4030` | Tertiary / placeholder |
| `--text-accent` | `#96334d` | `#e8829e` | Accent text (pink-red) |
| `--text-mono` | `#b89c80` | `#7a5c45` | Monospace labels, metadata |
| `--acc-note` | `#fdf0df` | `#1e160e` | Motivation quote bg |
| `--modal-overlay` | `rgba(45,31,20,0.28)` | `rgba(8,5,3,0.55)` | Modal backdrop |

**Brand accent:** `#c9566e` (buttons, checked states, FAB, today highlight). Border/shadow partner: `#96334d`.

### Category Colors
Each task/event has a category with an ink (text/border) and wash (background) color:

| Category | Ink | Wash |
|---|---|---|
| Work | `#2563a8` | `#e8f0fb` |
| School | `#96334d` | `#fdeef2` |
| Health | `#b34040` | `#fceaea` |
| Admin | `#b45309` | `#fef3dc` |
| Growth | `#0d7a54` | `#e4f5ee` |
| Reading | `#9d1f6e` | `#fce8f3` |
| Social | `#b84d0a` | `#fef0e6` |
| Home | `#4b5563` | `#f0f0ef` |

### Priority Colors
| Priority | Color |
|---|---|
| HIGH | `#b34040` |
| MEDIUM | `#b45309` |
| LOW | `#0d7a54` |

### Typography
| Role | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Display / card titles | Lora (serif) | 14–19px | 600 | Italic for quotes and modal |
| Body / UI labels | Geist (sans-serif) | 11–15px | 400–600 | Used for all nav, tasks, buttons |
| Metadata / timestamps | DM Mono (monospace) | 10–11px | 400–500 | Streak counts, time, card mono labels |

Load from Google Fonts: `Lora:ital,wght@0,400;0,500;0,600;1,400;1,500` + `Geist:wght@300;400;500;600;700` + `DM+Mono:wght@400;500`

### Spacing & Radii
- Card border-radius: `14px` (main), `10px` (lite/nested)
- Nav item border-radius: `9px`
- Modal border-radius: `16px`
- Checkbox border-radius: `4px`
- Habit circle: `50%` (52×52px desktop, 46×46px mobile)
- Card padding: `20px 22px` (normal), `14px 16px` (compact/mobile)
- Card border: `1.5px solid var(--border)`
- Card box-shadow: `3px 4px 0px var(--shadow)` — **hard offset, no blur** — this is a signature detail

---

## Layout & Shell

### App Shell
- Full-viewport flex row: `sidebar | main-area`
- `main-area` is a flex column: `topbar / content-scroll`
- `content-scroll` is the only scrolling region

### Sidebar (desktop ≥1024px)
- Width: **220px**, collapsed at tablet (768–1023px): **56px**
- Background: `var(--bg-sidebar)`, right border: `1.5px solid var(--border)`, box-shadow: `2px 0 0 var(--border)`
- **Logo area** (top): `✦` icon in `#c9566e`, "ADHD Life" in Lora 600 15px, username in DM Mono 11px `var(--text-mono)`
- **Nav items**: 13px Geist 500, `padding: 8px 10px`, `border-radius: 9px`. Active: `bg: var(--nav-active-bg)`, `color: var(--nav-active-fg)`, weight 600. Hover: `bg: var(--nav-hover-bg)`.
- **Bottom section**: Settings nav item, separated by top border
- Collapsed state hides all text labels; icons are centered

### Bottom Nav (mobile <768px)
- Fixed bottom bar, 5 main tabs + Settings
- `background: var(--bg-bottom-nav)`, `border-top: 1.5px solid var(--border)`
- Tab: icon + 10px label, active color `var(--nav-active-fg)`
- Accounts for `safe-area-inset-bottom`

### Topbar
- `padding: 14px 32px` (16px mobile), flex row space-between
- Left: greeting H1 (Lora italic 19px / 17px mobile) + date subtitle (Geist 12px muted)
- Right: dark-mode toggle button + progress pill
  - **Dark toggle**: 34×34px, `border-radius: 9px`, hard shadow, shows ☀️/🌙
  - **Progress pill**: `background: var(--bg-accent)`, `border-radius: 8px`, hard shadow in `var(--shadow-accent)`, DM Mono for number, Geist for label

### Dashboard Grid
- 2-column CSS grid, `gap: 18px`, `max-width: 960px`
- Collapses to 1-column at ≤900px

---

## Screens / Components

### Focus Tasks Card
- Card header: ⚡ emoji + "Focus tasks" (Lora 600 14px) + done/total counter (DM Mono 11px, right-aligned)
- Task rows: `padding: 8px 5px`, `border-bottom: 1px solid var(--task-border)`, hover bg `var(--bg-hover)`, `border-radius: 7px`
  - Checkbox (18×18px, `border-radius: 4px`): unchecked = `border: 1.5px solid var(--text-faint)`; checked = `background: #c9566e`, `box-shadow: 1px 1.5px 0px var(--check-shadow)`; hover unchecked = border turns `#c9566e`
  - Priority dot: 6×6px circle in priority color
  - Task title: Geist 13.5px 500 `var(--text-body)`. Done: strikethrough + `var(--text-muted)` + opacity 0.42 on row
  - Category dot: 8×8px circle in category ink color, right-aligned
- "Add a task" button: dashed border, Lora italic 12px `var(--text-mono)`, hover turns accent pink

### Habits Card
- Header: 🌱 emoji + "Today's habits"
- Horizontal flex row of 4 habit circles, `justify-content: space-between`
- Each habit: circle button + name label (Geist 11px 500 muted) + streak (DM Mono 10px, 🔥 prefix)
- **Habit circle**: 52px, `border-radius: 50%`. Unchecked: `border: 2px solid var(--border)`. Checked: `background: #c9566e`, `border-color: #b0435c`, `box-shadow: 3px 3.5px 0px var(--habit-shadow)`
- Active state: `transform: translate(1px, 1px)`
- Streak text turns `#e8829e` when done

### Carried Over (Accordion)
- Trigger row: 📋 emoji + "Carried over" (Lora 600 14px) + count badge (DM Mono 11px, `background: #fdeef2`, `color: #96334d`, rounded pill)
- Chevron icon rotates 180° when open
- Body animates: `max-height: 0→280px`, `opacity: 0→1` over 0.3s / 0.25s ease
- Body content: italic Lora 12px quote + task rows in `var(--bg-card-lite)` cards
- Each item shows: checkbox + priority dot + title + "Xd ago" (DM Mono 10px faint) + category dot

### Upcoming Today Card
- Header: 📅 + "Upcoming today"
- Each event is a `card-lite` row: 3×32px colored left border (category ink) + title (Geist 13px 500) + time (DM Mono 11px muted) + category pill
- **Category pill**: `background: wash`, `color: ink`, `border-radius: 6px`, `font-size: 11px`, `padding: 2px 7px`, subtle ink border at 13% opacity

### Week Strip
- 7 day columns, flex row, `gap: 5px`
- Each day: day letter (Geist 9px 600 muted) + date (DM Mono 11px)
- **Today column**: `background: #c9566e`, `border-color: #b0435c`, `box-shadow: 2px 2.5px 0px var(--wday-today-shadow)`, white text

### Motivation Quote
- `background: var(--acc-note)`, `border: 1.5px solid var(--acc-note-border)`, `border-radius: 10px`, hard shadow
- Lora italic 13px `var(--acc-note-text)`, line-height 1.6
- Randomly selected from 3 messages on load

### FAB (Floating Action Button)
- Fixed `bottom: 24px right: 24px` (72px bottom on mobile to clear nav)
- 50px circle, `background: #c9566e`, `border: 2px solid var(--fab-border)`, hard shadow
- `+` icon, white, 26px
- Hover: `translate(-1px,-1px)`, larger shadow. Active: `translate(2px,2px)`, smaller shadow

### Quick Add Modal
- Full-screen overlay: `background: var(--modal-overlay)`, `backdrop-filter: blur(3px)`
- Modal card: `max-width: 420px`, `border-radius: 16px`, `box-shadow: 5px 6px 0px var(--shadow)`
- Text input: borderless except bottom border (`1.5px solid var(--input-border)`), focus = accent pink. Placeholder in Lora italic.
- **Category selector**: grid of pill buttons with category ink/wash colors, toggle selected state
- **Priority selector**: 3 buttons (Low/Med/High) colored by priority, toggle selected state
- Actions: "cancel" (Lora italic, muted, no border) + "Add task" (filled `#c9566e`, hard shadow)
- Clicking overlay or pressing Escape closes modal; auto-focuses input on open

---

## Interactions & Behavior

| Interaction | Detail |
|---|---|
| Task toggle | Click row or checkbox; row fades to 0.42 opacity, title gets strikethrough, checkbox fills pink |
| Habit toggle | Click circle; fills pink with hard shadow; active press moves 1px |
| Accordion | Click carried-over header; chevron rotates, body animates open/closed |
| FAB | Opens Quick Add modal; button shifts on hover/active |
| Dark mode | Toggles `.dark` class on root, persisted in `localStorage` key `adhd-theme` |
| Motivation quote | Random pick from 3 strings on component mount |
| Responsive | Mobile (<768px): sidebar hidden, bottom nav shown, FAB moves up, grid collapses to 1 col, compact layout |
| Tweaks | 3 user-facing toggles: compact layout, daily quote visibility, serif headers |

---

## State

| State | Type | Initial | Notes |
|---|---|---|---|
| `page` | string | `'dashboard'` | Active nav section |
| `tasks` (focus) | array | 3 items | `{id, title, cat, prio, done}` |
| `habits` | array | 4 items | `{id, icon, name, streak, done}` |
| `carriedOver` | array | 2 items | `{id, title, cat, prio, daysAgo, done}` |
| `dark` | boolean | From `localStorage` or `prefers-color-scheme` | Persisted |
| `tweaks.compactMode` | boolean | false | Reduces padding |
| `tweaks.showMotivation` | boolean | true | Shows/hides quote card |
| `tweaks.serifHeaders` | boolean | true | Lora italic vs Geist for greeting |
| `showModal` | boolean | false | Quick Add modal visibility |
| `accordionOpen` | boolean | false | Carried Over section |

---

## Assets & Icons
All icons are inline SVG (Lucide-style, `stroke="currentColor"`, `strokeWidth="2"`, `strokeLinecap="round"`). No external icon library needed — they are defined inline in the prototype.

Icons used: Dashboard (grid of 4 squares), Inbox (envelope), Tasks (checklist), Habits (flame), Reading (open book), Review (bar chart), Settings (gear), Checkmark, Chevron (down), X (close).

---

## Files in This Package
| File | Description |
|---|---|
| `dashboard.html` | Full hi-fi React prototype — open in any browser to see the live design |
| `README.md` | This document |
