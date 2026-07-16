# ADHD Life — UI Redesign Brief

> Paste this into the Claude Design project. It is self-contained, but the real code is
> also available — see "Code access" below for the exact files that define the current UI.

---

## Code access

Public repo: **https://github.com/ASThome00/adhdlife** (branch `main`)

The live app is `apps/desktop` (Tauri + Vite + React). `CLAUDE.md` at the repo root is the full project doc.

The current UI is defined by these files (raw links fetch directly if you can't browse the repo):

| What | Path | Raw URL |
|---|---|---|
| **All design tokens + component CSS** (the main artifact this redesign replaces) | `apps/desktop/src/index.css` | https://raw.githubusercontent.com/ASThome00/adhdlife/main/apps/desktop/src/index.css |
| **Category ink/wash + priority colors** | `apps/desktop/src/lib/category-colors.ts` | https://raw.githubusercontent.com/ASThome00/adhdlife/main/apps/desktop/src/lib/category-colors.ts |
| Dashboard page + cards | `apps/desktop/src/pages/dashboard.tsx`, `apps/desktop/src/components/dashboard/` | browse repo |
| Task rows, pills, checkboxes | `apps/desktop/src/components/ui/`, `apps/desktop/src/components/tasks/` | browse repo |
| Other pages | `apps/desktop/src/pages/` (tasks, habits, reading, review, inbox, settings) | browse repo |

Read `index.css` and `category-colors.ts` before designing — they are the ground truth for every color, shadow, and component pattern described below. Component JSX shows how densely those patterns stack on real screens (useful for the declutter pitches).

---

## Context

ADHD Life is a personal life-management desktop app (Tauri, 1280×820 default window) built by Andrew for his wife — a med student with ADHD. Local-only, no accounts, no cloud. The dashboard is the hero screen; she spends 80% of her time there.

**Success = she opens it every morning without dreading it.**

The app is feature-complete for MVP (dashboard, brain-dump inbox, tasks, habits, reading tracker, weekly review, settings, light/dark mode). This redesign is about the *skin*, not the features.

### ADHD Design Laws (non-negotiable, carry into any concept)

1. Any action ≤5 seconds. No multi-step flows for common tasks.
2. Calm, not punishing. No red overdue counters. No alarm colors.
3. One thing at a time — focused slices, not everything at once.
4. Forgiving streaks — missed days pause, never reset.
5. Brain dump first — capture is instant, sorting comes later.
6. Object permanence — nothing important gets buried.
7. UI responds instantly (optimistic updates).

### The user's own words

> "Please make the colors nice. A calming color palette makes a huge difference."
> "I'd rather have 5 things that work perfectly than 20 things that are half-baked."

---

## Objective

Redesign the visual language of the app. The current warm rose/cream/brown theme reads **muddy and dingy** rather than calm, and the pages feel **busy and cluttered**. Deliver new concept directions for Andrew to choose from, then a full implementable spec for the winner.

This is an **open redesign**: new palettes, new typography, new depth/texture approach are all on the table. The layout bones (sidebar + topbar + card grid) can stay unless you have a strong pitch otherwise.

---

## Current Design System (what we're replacing)

### Palette — light mode

| Token | Value | Role |
|---|---|---|
| `--bg-page` | `#fdf6ed` | warm cream page |
| `--bg-card` | `#fffef9` | card |
| `--bg-card-lite` | `#faf5ea` | subtle card variant |
| `--bg-hover` | `#fdf0df` | row hover |
| `--border` | `#e2d4c0` | tan border, 1.5px on everything |
| `--shadow` | `#dfd0b8` | flat offset shadow color |
| `--text-primary` | `#2d1f14` | headings |
| `--text-body` | `#3d2b1a` | body |
| `--text-muted` | `#a08060` | secondary labels |
| `--text-faint` | `#c4a882` | placeholders |
| `--text-mono` | `#b89c80` | mono section labels |
| Accent | `#c9566e` rose | buttons, FAB, checked states, streaks |
| Accent deep | `#96334d` | button borders + shadows |

Dark mode exists (brown-black `#18120e` base, same structure) — every token has a dark twin.

### Category inks (8, used as dots/pills on task rows)

work `#2563a8` · school `#96334d` · health `#b34040` · admin `#b45309` · growth `#0d7a54` · reading `#9d1f6e` · social `#b84d0a` · home `#4b5563`
Each has a pale wash (`ink + '18'`) for pill backgrounds.

Priority colors: HIGH `#b34040` · MEDIUM `#b45309` · LOW `#0d7a54`.

### Typography — three fonts used simultaneously

- **Geist** (sans) 13–15px — UI/body
- **Lora** (serif) — card titles, greetings, *italic* for placeholders, ghost buttons, empty states, quotes
- **DM Mono** 11px uppercase — section labels, counts, streak numbers, dates

### Depth & chrome

- Every card: `1.5px solid` border **plus** a hard flat offset shadow (`3px 4px 0`, no blur) in tan.
- Buttons: filled rose + `2px` dark border + offset shadow; press = translate down.
- Radii: modal 16 / card 14 / pill 7–9 / checkbox 4.
- No gradients, no blur shadows (current rule).

---

## Diagnosis — what Andrew flagged (design against these)

### 1. Colors feel muddy / gross

- The page is **tan-on-cream-on-tan**: cream background, off-white cards, tan borders, tan shadows, brown-beige muted text (`#a08060`, `#b89c80`, `#c4a882`). Nothing is clean; everything looks slightly stained.
- The rose accent `#c9566e` sitting on warm browns reads dingy rather than cheerful.
- The 8 category inks are all desaturated mid-tones at similar lightness — at dot/pill size they blur together and add to the murk instead of aiding scanning.
- Dark mode is brown-black, which compounds the muddiness.

### 2. Too busy / cluttered

- A single task row carries up to 6 visual elements: checkbox, priority dot, title, category dot/pill, due-date label, ⋯ menu.
- Every card stacks: serif title + mono meta label + border + offset shadow + internal dividers. The chrome competes with the content.
- Three typefaces (one of them italic-serif in several roles) appear together inside single cards.
- Hard offset shadows outline *everything*, so nothing recedes — the whole page is foreground.

---

## The Ask — two phases

### Phase 1: Pitch (do this first, stop for Andrew's pick)

Produce **2–3 distinct concept directions**. For each:

1. **A named direction** with a one-paragraph mood statement (e.g. "clinical calm," "soft daylight," "quiet paper").
2. **A palette**: page/card/border/text scale, one accent, and a rework of the 8 category inks that are actually distinguishable at 8px-dot size.
3. **A typography plan** — fewer simultaneous voices. It's fine to keep a serif moment for warmth, but define exactly where each face is allowed to appear. Google Fonts only.
4. **A depth strategy** — how cards separate from the page *without* outlining everything (e.g. background-contrast cards with no borders, single soft shadow, borders only on interactive elements — your call, but pick one system and apply it consistently).
5. **A dashboard mockup** (full HTML page, 1280×820) showing: topbar greeting, focus tasks card, habits card with streak circles, upcoming card, week strip, quote — with realistic content.

At least one concept should leave warm tones entirely (cool or neutral ground); at least one can be a cleaned-up evolution of warmth. Don't make three variations of the same idea.

**Also in Phase 1 — the open pitch list.** Separately propose any UI improvements beyond recoloring that you believe in: decluttering the task row, reducing card chrome, hierarchy fixes, spacing/density changes, micro-interaction ideas, layout tweaks. Present each as *pitch + rationale + cost (small/medium/large)*. Andrew will approve or reject individually — do not fold them silently into the mockups; make the pitches legible.

### Phase 2: Spec (after Andrew picks a direction)

1. **Full token sheet** — light **and** dark values for **every** CSS variable, using the **same variable names** (this makes implementation a drop-in `index.css` swap). The complete list:

   ```
   --bg-page --bg-card --bg-card-lite --bg-sidebar --bg-hover --bg-accent
   --bg-topbar --bg-bottom-nav
   --border --border-logo --shadow --shadow-lite --shadow-accent
   --text-primary --text-body --text-muted --text-faint --text-sidebar
   --text-sidebar-hover --text-accent --text-accent2 --text-mono --text-quote
   --nav-active-bg --nav-active-fg --nav-hover-bg
   --check-shadow --habit-shadow --fab-border --fab-shadow --wday-today-shadow
   --pill-border --dash-divider --task-border
   --acc-note --acc-note-border --acc-note-shadow --acc-note-text
   --toggle-track --input-border --modal-overlay
   --accent --accent-border --accent-deep
   ```

   If your depth strategy retires shadows/borders somewhere, still supply a value for the token (e.g. `transparent`) — nothing may be left undefined.
2. **Category ink set + washes** and priority colors.
3. **Component specs**: card, task row, pill button, primary button, input, checkbox, habit circle, modal, section label — the same inventory as today.
4. **An updated reference `dashboard.html`** — a single self-contained file with the full token set in a `<style>` block. This becomes the design source of truth the coding sessions build from.

---

## Constraints

- **Contrast**: body text ≥ 4.5:1 on its background; secondary/muted text ≥ 4.5:1 too (this is a readability redesign — no more `#a08060`-on-cream); large headings may go to 3:1. Check dark mode equally.
- **Dark mode is required** — every token needs a dark twin, same variable structure.
- **Calm over punchy**: no alarm reds, no aggressive saturation, no gradients-as-decoration. HIGH priority may be visible but never screaming.
- **8 category colors** must survive at 8px dot size and as text-on-wash pills, in both modes.
- **Fonts from Google Fonts only** (desktop app loads them at build).
- **No emoji in UI chrome. No left-border-accent cards** (AI-slop trope).
- Works at 1280×820 default and down to ~900px width.

## Non-Goals

- No new features, screens, or flows — skin only (pitch-list items are UI polish, not features).
- No component library adoption; output is CSS tokens + patterns, hand-implemented.
- Mobile app styling is out of scope for now (it inherits the tokens later).

## Acceptance (Phase 1)

- 2–3 genuinely distinct directions, each with a complete dashboard mockup.
- Palettes pass the contrast constraints.
- Pitch list is present, itemized, with rationale and cost per item.
- Nothing violates the ADHD Design Laws.
