# CLAUDE.md — ADHD Life

> Read this at the start of every session. It is the single source of truth.

---

## What This App Is

A personal life management app for an ADHD brain (Andrew's wife, med student).
Calm. Forgiving. No cloud. No accounts. Everything stays on-device.

**Success = she opens it every morning without dreading it.**

---

## Platform Map

| Platform | App | Tech | DB |
|---|---|---|---|
| **macOS** | `apps/desktop` | Tauri 2 + Vite + React | SQLite via tauri-plugin-sql |
| **Windows** | `apps/desktop` | Tauri 2 + Vite + React | SQLite via tauri-plugin-sql |
| **iOS** | `apps/mobile` | Expo (React Native) | expo-sqlite (local) |
| **Android** | `apps/mobile` | Expo (React Native) | expo-sqlite (local) |

Desktop and mobile are **separate apps with separate local databases**.
Sync between them is a Phase 8+ concern — not in scope for MVP.

---

## ADHD Design Laws — Never Break These

1. **≤5 seconds** for any action. No multi-step flows for common tasks.
2. **Calm, not punishing.** No red overdue counters. Missed = roll forward quietly.
3. **One thing at a time.** Default views show a focused slice, not everything.
4. **Forgiving streaks.** Missed days *pause* the streak. They never reset it.
5. **Brain dump first.** Always let her capture fast. Sorting can happen later.
6. **Object permanence.** Nothing important gets buried forever.
7. **Optimistic updates always.** UI responds before the DB confirms.

---

## Monorepo Structure

```
adhd-life/
├── apps/
│   ├── desktop/                      Tauri desktop (macOS + Windows)
│   │   ├── src/                      Vite + React frontend
│   │   │   ├── App.tsx               Router + setup guard
│   │   │   ├── main.tsx              React entry point
│   │   │   ├── index.css             Tailwind base + component classes
│   │   │   ├── pages/                One file per route
│   │   │   │   ├── setup.tsx         ✅ Done — first-run name screen
│   │   │   │   ├── dashboard.tsx     ✅ Done — hero screen
│   │   │   │   ├── inbox.tsx         ✅ Done — brain dump + assign flow
│   │   │   │   ├── tasks.tsx         ✅ Done — Session 4 (two-panel + detail slide-over)
│   │   │   │   ├── habits.tsx        ✅ Done — Session 5 (streaks + 30-day grid)
│   │   │   │   ├── reading.tsx       ✅ Done — Session 6 (three-column book kanban)
│   │   │   │   ├── review.tsx        ✅ Done — Session 7 (stats + carried-over + priorities)
│   │   │   │   ├── pomodoro.tsx      🔲 Next: focus-task initiation timer (see Product Decisions)
│   │   │   │   └── settings.tsx      ✅ Done — Session 8 (profile/theme/categories/export + updater)
│   │   │   ├── components/
│   │   │   │   ├── nav/              ✅ app-shell, sidebar, bottom-nav
│   │   │   │   ├── dashboard/        ✅ topbar, week-strip, focus-tasks-card, habits-card,
│   │   │   │   │                        upcoming-card, carried-over-accordion, motivation-quote
│   │   │   │   ├── tasks/            ✅ quick-add-fab, quick-add-modal, inbox-row,
│   │   │   │   │                        category-sidebar, task-section, task-detail-panel, undo-toast
│   │   │   │   ├── habits/           ✅ add-habit-form, habit-card, habit-dot-grid
│   │   │   │   ├── reading/          ✅ book-card, add-book-modal, finish-book-modal, star-rating
│   │   │   │   ├── review/           ✅ stats-row, carried-over-card, priorities-card, category-breakdown
│   │   │   │   ├── settings/         ✅ profile-appearance-cards, categories-card, data-card, updater-card
│   │   │   │   └── ui/               ✅ task-row, checkbox, category-dot, category-pill,
│   │   │   │                            priority-dot, placeholder-page
│   │   │   └── lib/
│   │   │       ├── db.ts             ✅ SQLite singleton + local-date helpers (localDateStr/localNaiveDateTime)
│   │   │       ├── housekeeping.ts   ✅ app-open: wake snoozes, spawn recurrences, retire stale focus
│   │   │       ├── utils.ts          ✅ cn(), formatDueDate(), PRIORITY_CONFIG
│   │   │       ├── theme.ts          ✅ theme application
│   │   │       ├── category-colors.ts ✅ CATEGORY_THEME + PRIO — canonical color mapping
│   │   │       ├── stores/quick-add.ts ✅ quick-add modal state
│   │   │       ├── queries/
│   │   │       │   ├── settings.ts   ✅ getSettings / updateSettings (+ next_week_priorities)
│   │   │       │   ├── export.ts     ✅ full-DB JSON export via dialog+fs
│   │   │       │   ├── tasks.ts      ✅ Full CRUD + getDashboardData
│   │   │       │   └── habits-categories-books.ts ✅ Full CRUD
│   │   │       └── hooks/
│   │   │           ├── use-data.ts   ✅ All TanStack Query hooks
│   │   │           └── use-breakpoint.ts ✅
│   │   └── src-tauri/
│   │       ├── src/
│   │       │   ├── main.rs           ✅ Done
│   │       │   └── lib.rs            ✅ Done — registers plugins + migrations
│   │       ├── migrations/
│   │       │   ├── 001_initial.sql   ✅ Full schema + default category seed
│   │       │   └── 002_next_week_priorities.sql ✅ Weekly-review priorities column
│   │       ├── tauri.conf.json       ✅ Done — 1280×820 window
│   │       ├── Cargo.toml            ✅ Done
│   │       └── build.rs              ✅ Done
│   └── mobile/                       Expo iOS + Android
│       ├── app/
│       │   ├── _layout.tsx           ✅ Done — QueryClient + gesture handler
│       │   └── (tabs)/
│       │       ├── _layout.tsx       ✅ Done — 5-tab nav
│       │       └── index.tsx         🔲 Today screen
│       └── lib/
│           └── db.ts                 ✅ Done — expo-sqlite, mirrors schema, auto-seeds
├── packages/
│   └── types/                        Shared TS types (no Prisma)
├── turbo.json
└── CLAUDE.md                         ← you are here
```

---

## Data Layer (Desktop)

**No HTTP. No API routes. No server.** React calls SQLite directly via Tauri's plugin.

```
React component
  → useXxx() hook          (lib/hooks/use-data.ts)
    → query/mutation fn    (lib/queries/*.ts)
      → select() / execute() (lib/db.ts)
        → @tauri-apps/plugin-sql
          → SQLite file on disk
```

All query functions are in `lib/queries/`. They return typed objects.
All hooks are in `lib/hooks/use-data.ts`. They wrap TanStack Query.
Optimistic updates are implemented in `useCompleteTask` and `useToggleHabit` — follow that pattern.

### Key query functions already written

| Function | File | What it does |
|---|---|---|
| `getDashboardData()` | tasks.ts | All dashboard data in one parallel query |
| `getTasks(filters?)` | tasks.ts | List tasks with category join |
| `createTask(input)` | tasks.ts | Insert task, auto-promote INBOX→ACTIVE |
| `updateTask(id, data)` | tasks.ts | Partial update, handles completion timestamp |
| `brainDump(rawText)` | tasks.ts | Split text → bulk INSERT as INBOX |
| `dropTask(id)` | tasks.ts | Soft delete (status=DROPPED) |
| `getCategories()` | habits-categories-books.ts | With active task counts |
| `getHabits()` | habits-categories-books.ts | With today's completion status |
| `toggleHabitToday()` | habits-categories-books.ts | Upsert log + recalculate streak |
| `getBooks(status?)` | habits-categories-books.ts | |
| `getSettings()` | settings.ts | Settings singleton |
| `updateSettings(data)` | settings.ts | Partial update |
| `getWeeklyReviewData()` | tasks.ts | All review stats in one parallel query |
| `getHabitHistory(days)` | habits-categories-books.ts | Log rows for the 30-day grids |
| `updateHabit(id, data)` | habits-categories-books.ts | Rename / recolor / archive |
| `createBook` / `updateBook` | habits-categories-books.ts | Reading kanban |
| `exportAllData()` | export.ts | Full-DB JSON via native save dialog |
| `runDailyHousekeeping()` | housekeeping.ts | App-open: snoozes, recurrences, focus rollover |

### SQLite Notes
- Dates stored as ISO strings. Use `startOfTodaySql()` / `endOfTodaySql()` from `lib/db.ts`.
- **Day-keyed data uses LOCAL dates** (`localDateStr()` in db.ts) — habit_logs.date, task date grouping. UTC day keys made evening habit check-ins land on tomorrow; never use `toISOString().split('T')[0]` for a day key.
- **SQLite `datetime('now')` columns (completed_at, created_at) are UTC `'YYYY-MM-DD HH:MM:SS'`** — raw string comparison against JS ISO strings is WRONG (space sorts before 'T'). Compare via `datetime(col) >= datetime(?, 'utc')` with `localNaiveDateTime()` params.
- Booleans stored as 0/1. Normalize with `Boolean(row.field)` on read.
- `focus_days.task_ids` is a JSON string — `JSON.parse()` on read.
- `recurrences.days_of_week` is a JSON string — `JSON.parse()` on read.
- No `@db.Date` type — always full ISO datetime.

---

## Data Layer (Mobile)

`apps/mobile/lib/db.ts` — expo-sqlite, same schema as desktop.
`getDb()` opens the DB and runs `initSchema()` (creates tables + seeds categories).
Helper functions at the bottom: `getTodayTasks()`, `getHabitsWithTodayStatus()`.

Mobile pages call these helpers directly — no HTTP, no server needed.

---

## Desktop: Color Palette & Component Classes

> **Theme: "Quiet Garden"** (redesign shipped 2026-07 from the Claude Design handoff —
> reference file `design-reference/dashboard.html`, gitignored but the single source of truth).
> The canonical token set is the "Design Reference" section at the bottom of this file.
> Category/priority colors are CSS vars (`--cat-*`, `--prio-*`) defined in `index.css`;
> `category-colors.ts` maps to them via `getCategoryTheme()` / `PRIO` — never hardcode hexes.

```
Accent:   #33705c  (pine)   — buttons, active states, FAB, checked states
                              (dark mode accent: #7cbf9e; text on accent = var(--bg-page))
Surface:  #eef2ec  (--bg-page, sage)
Sidebar:  #e3e9e0  (--bg-sidebar, darker sage step)
Card:     #ffffff  (--bg-card)  ·  inset #f2f6f1 (--bg-card-lite)

Depth = tonal layering ONLY. No borders and no shadows on surfaces.
Floating layers (FAB, modal, menus, toasts, bulk bar) carry ONE soft blur shadow.
Retired border/shadow tokens are set to `transparent`.

Category inks (CSS vars in index.css, light + dark twins; keyed by seeded ids):
  work #4270c0 · school #7a5bc8 · health #bd5b68 · admin #99690a
  growth #5c9a33 · reading #ad4796 · social #b55c22 · home #6a7570
Each has --cat-*-wash (pill bg) and --cat-*-text (text on wash, ≥4.5:1).

Priority colors: --prio-high #bd5b68 · --prio-medium #99690a · --prio-low #6a7570
P1: priority dots are gone from rows — HIGH = inset ring on the checkbox.
```

Utility classes in `index.css`:
- `.card` / `.card-lite` — tonal cards, radius 20/13, no border/shadow
- `.btn-primary` — filled pine button · `.btn-ghost` · `.btn-pill-add`
- `.chip` / `.chip.sel` — filled selectable chips (selected = wash + ink text)
- `.input` / `.textarea` — filled fields, 2px accent focus ring
- `.row-action` — hover-revealed row buttons (P9) · `.more-row` (P5)
- `.section-label` — DM Mono 10.5px uppercase
- `.subbar` / `.sub-item` — borderless category rail
- `.scroll-panel` — scrollable area with thin scrollbar

Always use `cn()` from `lib/utils.ts` for conditional Tailwind.

---

## Commands Reference

```bash
# Development
pnpm dev           # Start dev servers

# Release (automated build + GitHub Release for all platforms)
pnpm release 1.0.0  # Builds macOS, Windows, iOS, Android → creates GitHub Release

# Frontend-only (if needed)
cd apps/desktop && pnpm vite:dev  # Tauri frontend without shell
pnpm typecheck                     # Type check all
```

**Release process:** See [RELEASE.md](./RELEASE.md)

Prerequisites:
- Node 20+, pnpm 9+
- `gh` CLI for releases: https://cli.github.com
- `EAS_TOKEN` secret in GitHub repo (for mobile builds)

---

## Mobile: Commands Reference

```bash
# From apps/mobile/
pnpm dev          # Expo start (QR code)
pnpm ios          # iOS Simulator
pnpm android      # Android emulator

# From monorepo root
pnpm dev:mobile
```

Prerequisites:
- macOS required for iOS builds
- Xcode installed (for iOS Simulator)
- EAS CLI for device builds: `npm i -g eas-cli`

---

# Product Decisions (locked 2026-07-13)

> Decided by Andrew after the v0.3.0 deep audit (full context: `AUDIT-2026-07-13.md`).
> Do not re-litigate these in future sessions without asking him.

- **Due dates:** calendar dates + OPTIONAL time (detail-panel picker, quiet display). Grouping is always by LOCAL date.
- **Focus:** unfinished focus tasks get a one-click morning re-confirm ("keep these from yesterday?") — the seed of the Plan-my-day flow. Never a silent reset, never a forced wizard.
- **Done/Dropped:** collapsed "Recently done" (last 7 days, struck-through) on the Tasks page. NO dropped archive — dropped stays gone, deliberately.
- **Category colors:** the DB `color` column is the single source everywhere; wash derived as `color + '18'`; map legacy bright seed hexes to the designed inks; `PRESET_COLORS` are suggestions, not limits.
- **Habits:** mixed cadence — build weekly-target habits ("N of M this week" via `target_frequency`). Keep streak numbers; paused shows `⏸ Nd` (faint), never `🔥 0`; compute streaks on read (chain may end today OR yesterday).
- **Pomodoro:** build as a focus-task INITIATION timer — pick a focus task, one-tap 10/15/25/45 countdown, gentle finish ("keep going / done / switch"), never track failed sessions. Not strict pomodoro.
- **Notifications: NONE anywhere** — desktop and mobile. (Overrides the original Session 10 plan below.)
- **Reading:** pleasure-first, keep simple; add soft "put down for now" (ABANDONED rendered as "Resting"). No chapters, no reading↔task linking.
- **No "big dates" / exam-countdown strip.** Tasks with due dates suffice.
- **Mobile:** align seed category ids to desktop's `cat_work…cat_home` (currently `cat_0…cat_7`) BEFORE building any mobile screens.
- **Weekly review stays solo** — current one-person design is right.

## Next-build queue (post-audit, in order)

1. Plan-my-day morning flow (focus re-confirm + empty-focus-card suggestions)
2. Category color unification (fixes audit B5)
3. "Recently done" collapsed section on Tasks
4. Focus timer page (pomodoro slot) — own session
5. Weekly-target habits + paused-streak display + streak-on-read recalc
6. Due-time picker in the task detail panel
7. Reading card ⋯ menu (move back / Resting / remove) + "+10 pages" tap
8. Review quick wins: show last week's priorities, carried-forward `< today`, wins list, Sunday dashboard whisper
9. Mobile seed-id alignment (fold into Session 9)
10. Startup error states (audit B6) + paper-cuts (audit P1–P7)

---

# ADHD Life — Claude Code Session Plan
## Design Source of Truth

> **Before every session:** The visual design lives in a Claude Design project.
> Current theme: **"Quiet Garden"** (shipped 2026-07). Do NOT invent new UI.
>
> **Design file location:** `design-reference/dashboard.html` — the interactive Quiet
> Garden handoff (all pages + spec appendix). `design-reference/README.md` maps the
> P1–P12 approved pitches to code. (Old `*.jsx` prototype files in that folder are the
> retired rose/cream design — ignore them.)
>
> The `## Design Reference` section at the bottom of this file is the canonical spec.
> NOTE: the session logs below predate the redesign — their visual details (Lora italic,
> rose #c9566e, offset shadows, dashed borders) are historical; follow Quiet Garden.

---

## SESSION 4 — Tasks & Categories View ✅ SHIPPED

**Goal:** The full task browser.

```
Read CLAUDE.md. Build the Tasks page.

File: apps/desktop/src/pages/tasks.tsx

DESIGN REFERENCE:
The Tasks page already has a working prototype in design-reference/pages.jsx — see the
TasksPage() component. Copy the visual patterns exactly:
- Two-panel layout with category sidebar (160px) + scrollable main area
- Category sidebar: color dot + name + count badge, active state uses nav-active-bg/fg tokens
- Task rows: reuse the .task-row class pattern with Cb checkbox, PrioDot, title, CatPill, due label
- All card/border/shadow values from CLAUDE.md Design Reference section
Do not invent new colors or spacing — use only CSS vars defined in index.css.

Layout: two-panel (sidebar + main), similar to an email client.

LEFT PANEL (~220px, fixed):
- "All Tasks" item at top (no filter)
- Category list from useCategories()
- Each item: color dot + name + active task count badge
- Click to filter the main panel
- "+ New Category" button at bottom → inline name + color picker form (8 preset swatches
  matching the category colors defined in CLAUDE.md)

MAIN PANEL (flex-grow, scrollable):
- Heading: selected category name or "All Tasks" — Lora serif italic 19px
- Tasks grouped into collapsible sections:
    Overdue   — due_date < today, status not DONE/DROPPED
    Today     — due_date = today
    This Week — due_date within next 7 days
    Upcoming  — due_date > 7 days
    Someday   — no due_date, status = ACTIVE
    Inbox     — status = INBOX (only shown in "All Tasks" view)
- Each section header: DM Mono 11px uppercase label + count. Collapsed if count = 0.
- Use getTasks() with appropriate filters per section.

TASK ROW (use existing TaskRow component from components/ui/task-row.tsx):
- Checkbox (complete) | Priority dot | Title | Category dot | Due date | "⋯" menu
- "⋯" menu: Edit | Snooze 1 day | Snooze 1 week | Move to today | Drop
- Click title → open TaskDetailPanel (slide-over from right)

TASK DETAIL PANEL (slide-over, not a new page):
- Slides in from right, overlays the main panel (not full-screen takeover)
- Background: var(--bg-card), border-left: 1.5px solid var(--border)
- Box-shadow: -4px 0 20px rgba(0,0,0,0.06)
- Width: 360px
- Fields: Title (editable, Lora serif), Notes (contenteditable, Geist),
  Due date picker, Priority picker (LOW/MEDIUM/HIGH pills matching modal style),
  Category picker (same pill pattern as QuickAddModal)
- Subtasks checklist: list of child tasks, checkable, "+ Add subtask" inline input
  Subtasks fetched with getSubtasks(taskId)
- Recurrence: "Repeat" dropdown (Never / Daily / Weekly / Monthly / Yearly)
  On select: INSERT into recurrences table
- All edits call updateTask() on blur/change with optimistic update

ADHD principles:
- "Drop" not "Delete" — soft language
- Snoozed tasks disappear from view (status=SNOOZED, snoozed_until set)
- No confirmation dialogs for snooze/drop — undo toast for 3 seconds only
- Undo toast style: var(--bg-card), border 1.5px solid var(--border),
  box-shadow 3px 4px 0 var(--shadow), Geist 13px — matches card style
```

---

## SESSION 5 — Habits ✅ SHIPPED

**Goal:** Daily habit tracking with forgiving streaks.

```
Read CLAUDE.md. Build the Habits page.

File: apps/desktop/src/pages/habits.tsx

DESIGN REFERENCE:
The Habits page prototype lives in design-reference/pages.jsx — see HabitsPage().
The dashboard habit circles are in design-reference/dashboard-cards.jsx — see HabitsCard().
Key patterns to replicate:
- Habit card: .card class, Lora serif name, DM Mono streak numbers
- Streak number color: #c9566e when active, var(--text-faint) when paused
- 30-day dot grid: 18×18px dots, border-radius 4px, habit color + 'cc' opacity when done,
  var(--bg-card-lite) background when missed, var(--border) border
- Today's circle: .hcircle class — see index.css. Done state: background #c9566e,
  border-color #b0435c, box-shadow 3px 3.5px 0 var(--habit-shadow)
- Color swatch picker: 8 presets — use the category color values from CLAUDE.md

TOP SECTION — Add new habit:
- Inline form: name input (border-bottom only, no box, matches modal input style) +
  color swatch picker (8 preset circles, click to select) + "Add" button (btn-primary class)
- Calls createHabit() from lib/queries/habits-categories-books.ts

HABITS GRID (one card per habit):
- Habit name (Lora 600 15px) + color dot indicator
- Today's checkbox circle (.hcircle) — large, satisfying click
- Current streak: "🔥 12 days" in DM Mono, colored #c9566e
- Longest streak: "Best: 34" in Geist 11px var(--text-muted)
- 30-day consistency grid (dots as described above)
- Motivational text from getStreakMessage(currentStreak) — Lora italic 12px var(--text-mono)

STREAK RULE (implement correctly):
- toggleHabitToday() in queries handles DB logic — call it, trust it
- If streak = 0 but longest > 0: "Paused at X days — start again today!" (never shame)
- If streak > 0: use getStreakMessage() from lib/utils.ts

ARCHIVE:
- "⋯" menu on each card: Edit name | Archive
- Archived habits hidden (is_archived = 1)
- No delete
```

---

## SESSION 6 — Reading Tracker ✅ SHIPPED

**Goal:** Track her med school reading and personal books.

```
Read CLAUDE.md. Build the Reading page.

File: apps/desktop/src/pages/reading.tsx

DESIGN REFERENCE:
Prototype in design-reference/pages.jsx — see ReadingPage().
Three-column kanban layout. Each column has a DM Mono 11px uppercase header.
Book cards use .card class with padding 14px 16px.
- Title: Lora 600 14px var(--text-primary)
- Author: Geist 12px var(--text-muted)
- Progress bar: height 4px, background var(--bg-card-lite), filled with #c9566e
- Genre pill: same pill pattern as CategoryPill in app-components.jsx
- Star rating: simple ★/☆ characters, color #c9566e for filled

Layout: three columns — To Read | Currently Reading | Finished

ADD BOOK button:
- Top of "To Read" column — dashed border button (like the "+ add a task" button in
  FocusTasksCard: 1.5px dashed var(--border), Lora italic, hover border #c9566e)
- Opens modal (matches QuickAddModal style exactly): Title, Author, Genre, Page count
- Calls createBook() from lib/queries/habits-categories-books.ts

BOOK CARD status-specific content:
  TO_READ: "Start reading" button → sets status=READING, started_at=now
  READING: Progress bar + "Page N of M" (click page number = inline number input) +
           "Mark finished" button (btn-primary)
  FINISHED: Completion date (DM Mono 10px var(--text-muted)) +
            Star rating (1–5, click to set, #c9566e filled) +
            Notes snippet (Lora italic 12px, click to expand/edit)

FINISH MODAL (matches .modal class):
- Star rating: 5 interactive stars
- Notes textarea (Lora italic, transparent background, no border box — matches brain dump)
- On save: updateBook(id, { status: 'FINISHED', finished_at: now, rating, notes })
```

---

## SESSION 7 — Weekly Review ✅ SHIPPED

**Goal:** A guided, encouraging look back at the week.

```
Read CLAUDE.md. Build the Weekly Review page.

File: apps/desktop/src/pages/review.tsx

DESIGN REFERENCE:
Prototype in design-reference/pages.jsx — see ReviewPage().
Key patterns:
- Stats row: 3-column grid of .card cards, DM Mono 26px stat value, Lora 13px label
- Carried forward list: .task-row pattern with PrioDot, no checkbox needed
- Priority inputs: Geist 13.5px, background var(--bg-card-lite), border 1.5px var(--input-border),
  border-radius 8px — NOT border-bottom-only (this is a form field, not inline edit)
- Category bar chart: pure CSS div widths, colored with each category's ink color,
  height 8px, border-radius 4px — no chart libraries

Fetch everything in a single query — add getWeeklyReviewData() to lib/queries/tasks.ts.

STATS SECTION (matches existing design):
- Tasks completed this week vs. planned (calm ratio display)
- Habit consistency % per habit (small colored bar per habit)
- Brain dumps cleared

CARRIED OVER SECTION:
- Tasks due this week still ACTIVE or INBOX
- Each: title + original due date + category color dot
- Action buttons (small, pill style): "Next week" | "Drop" | "Focus now"
- No scary warnings

NEXT WEEK SECTION:
- "What are your top 3 priorities for next week?"
- Three inputs (styled as form fields, not inline edits)
- Saved to settings table (add next_week_priorities TEXT column via new migration)

CATEGORY BREAKDOWN:
- CSS-only proportional bars (div widths), no chart lib
- Category name + color + completed task count

TONE: Supportive friend reviewing the week, not a productivity judge.
```

---

## SESSION 8 — Settings & Dark Mode ✅ SHIPPED

**Goal:** User preferences + dark mode + data export.

```
Read CLAUDE.md. Build the Settings page and dark mode.

File: apps/desktop/src/pages/settings.tsx

DESIGN REFERENCE:
Prototype in design-reference/pages.jsx — see SettingsPage().
The updater UI (Check for Updates card) is ALREADY BUILT in settings.tsx — do not rebuild it.
New sections to add around it, matching the design:
- All cards use .card class
- Section labels use DM Mono 11px uppercase pattern
- Toggle switches use .toggle-sw class (see index.css)
- Theme pills: same pill button pattern as priority/due-date pickers in QuickAddModal
- Color swatches for category recolor: 8 preset circles, 24×24px, border-radius 50%,
  selected state has border 2px solid that color + box-shadow 1px 1.5px 0 that color

SECTIONS (build around existing updater card):

Profile:
- Display name (editable input, border-bottom-only style) → updateSettings({ display_name })
- "Used for your morning greeting" — Geist 11px var(--text-faint)

Appearance:
- Theme: Light | Dark | System (three pill buttons, same pattern as priority picker)
- On change: updateSettings({ theme }) AND apply dark class to document root
- System: match prefers-color-scheme

Focus:
- Daily focus limit: DM Mono number input, color #c9566e, background var(--bg-card-lite)
- → updateSettings({ daily_focus_limit })

Categories:
- List all from useCategories()
- Drag to reorder: @dnd-kit/sortable
- Rename: click name → inline input (border-bottom-only on focus)
- Recolor: click dot → 8 color swatch picker popover
- Archive toggle: .toggle-sw

Data:
- "Export my data" button (btn-primary style)
- Fetch all tables → JSON → tauri-plugin-fs save dialog
- Format: { tasks, habits, categories, books, settings }

DARK MODE:
All tokens already have dark equivalents — apply .dark to #root.
Dark mode is triggered by the theme setting. On app startup in App.tsx,
read settings.theme and apply the class immediately before first render
to avoid flash of wrong theme.
```

---

## SESSION 9 — Mobile: Today Screen + Inbox

**Goal:** First two screens of the Expo mobile app.

```
Read CLAUDE.md. Build the first two screens of the Expo mobile app.

DESIGN REFERENCE:
The mobile app should use the same color tokens as the desktop — same hex values,
same category colors, same primary #c9566e. Use NativeWind throughout.
The design system is documented in CLAUDE.md under "Color tokens".

FIRST: align mobile seed category ids to desktop's (cat_work…cat_home —
mobile currently seeds cat_0…cat_7). See Product Decisions.

The database layer is already written at apps/mobile/lib/db.ts.
It exports: getDb(), getTodayTasks(), getHabitsWithTodayStatus()
Add extra helper functions to that file as needed.

--- TODAY SCREEN: apps/mobile/app/(tabs)/index.tsx ---

SafeAreaView > ScrollView layout with sections:

1. Header
   - Greeting: time-based (Good morning/afternoon/evening), Lora serif italic
   - Date: "Wednesday, April 23" — Geist 12px muted
   - "X done today" — DM Mono, color #c9566e

2. Habits row (horizontal ScrollView)
   - Each habit: circle (filled = done: #c9566e bg, else dashed border #c9566e),
     name below (Geist 11px muted), streak count (DM Mono 10px)
   - Tap to toggle: INSERT OR REPLACE INTO habit_logs
   - expo-haptics on toggle: ImpactFeedbackStyle.Light
   - Circle size: 52px to match desktop hcircle

3. Focus Tasks section header: DM Mono 11px uppercase "FOCUS" label
   - Fetch WHERE is_focus_today=1 AND status != 'DONE'
   - Task row: checkbox circle + title (Geist 500 14px) + category color dot
   - Checkbox: 20×20px, border-radius 4px, border 1.5px #c9566e,
     checked: bg #c9566e with white checkmark
   - Tap: expo-haptics NotificationFeedbackType.Success, optimistic complete

4. Also today section: same row format, different fetch filter

5. FAB: position absolute bottom-right, 50px circle, bg #c9566e,
   border 2px solid #96334d, box-shadow offset (match desktop fab)
   Opens bottom sheet: title TextInput + "Add" button

All fetching: useQuery from @tanstack/react-query wrapping sqlite helpers.

--- INBOX SCREEN: apps/mobile/app/(tabs)/inbox.tsx ---

Top: Multiline TextInput
  placeholder="Brain dump — one thought per line"
  Lora italic font, background #faf5ea (--bg-card-lite), borderRadius 12,
  border 1.5px #e2d4c0 (--border), minHeight 120

"Dump it" button: btn-primary style (#c9566e bg, #96334d border, border-radius 9)

FlatList of INBOX tasks:
  Row: title (Geist 500) + "Assign →" button (Lora italic, #a08060)
  "Assign →" → bottom sheet with category list (color dot + name per row)
  On assign: UPDATE tasks SET category_id=?, status='ACTIVE', optimistic remove

Empty state: Lora italic 15px muted "You're all caught up! Dump anything new above."
```

---

## SESSION 10 — Mobile: Remaining Tabs + Notifications

**Goal:** Complete the mobile app.

```
Read CLAUDE.md. Complete the remaining Expo mobile screens.

DESIGN REFERENCE:
Same token system as desktop — same hex values, same typography scale (adjusted for
native: Lora for headings/labels, system monospace for DM Mono equiv, SF Pro for Geist).
Use NativeWind for all styles. See CLAUDE.md "Color tokens" section.

--- TASKS TAB: apps/mobile/app/(tabs)/tasks.tsx ---

Category filter pills at top (horizontal ScrollView).
Pill style: border 1.5px solid color, bg color+'18' when selected, Geist 12px.
Task list below, filtered by selected category.
Group sections: Overdue / Today / This Week / Upcoming / Someday — DM Mono headers.
Each task: swipe right → complete (haptics), swipe left → "Snooze" + "Drop" actions.
Swipe action colors: complete = #0d7a54, drop = #96334d (soft red-rose, not bright red).
react-native-gesture-handler for swipe (already installed).

--- HABITS TAB: apps/mobile/app/(tabs)/habits.tsx ---

Full page version of the Today habits row.
Each habit: card (bg #fffef9, border 1.5px #e2d4c0, borderRadius 14,
  shadow offset 3px 4px color #dfd0b8).
30-day dot grid — same dot style as desktop (18×18, borderRadius 4).
Tap today circle to toggle. Streak display with getStreakMessage equivalent.
"+ New habit" bottom sheet.

--- READING TAB: apps/mobile/app/(tabs)/reading.tsx ---

Three pill tabs at top: To Read | Reading | Finished (same pill pattern).
FlatList per tab.
Book card: title (Lora 600), author (Geist 12px muted), progress bar for Reading
  (height 4px, bg #e2d4c0, fill #c9566e).
Tap → book detail modal (full-screen stack): all fields, progress update, rating.

--- NOTIFICATIONS ---

DECISION (2026-07-13): NO notifications anywhere — desktop or mobile.
Skip scheduleMorningReminder entirely; do not add a notifications_time column.

Settings modal: apps/mobile/app/settings.tsx (presentation: 'modal').
Display name + theme toggle only.
Store in SQLite settings table (add theme TEXT column).
Access via gear icon in Today screen header.
```

---

## After all sessions — Building installers

### macOS (.dmg)
```bash
cd apps/desktop && pnpm build
# Output: src-tauri/target/release/bundle/dmg/ADHD Life_0.1.0_x64.dmg
```

### Windows (.exe installer)
```bash
# On a Windows machine:
cd apps/desktop && pnpm build
# Output: src-tauri/target/release/bundle/nsis/ADHD Life_0.1.0_x64-setup.exe
```

### iOS (via Expo)
```bash
cd apps/mobile
npm install -g eas-cli && eas login
eas build --platform ios --profile preview
```

### Android (via Expo)
```bash
cd apps/mobile
eas build --platform android --profile preview
```

---

## Quick reference

| Thing | Location |
|---|---|
| **Design file** | `design-reference/dashboard.html` |
| **Design tokens** | `CLAUDE.md` → "Design Reference" section |
| **SQLite schema** | `apps/desktop/src-tauri/migrations/001_initial.sql` |
| **Desktop DB queries** | `apps/desktop/src/lib/queries/` |
| **Desktop hooks** | `apps/desktop/src/lib/hooks/use-data.ts` |
| **Desktop pages** | `apps/desktop/src/pages/` |
| **Desktop components** | `apps/desktop/src/components/` |
| **Mobile DB** | `apps/mobile/lib/db.ts` |
| **Mobile screens** | `apps/mobile/app/(tabs)/` |
| **Shared types** | `packages/types/src/index.ts` |
| **ADHD Design Laws** | `CLAUDE.md` → "ADHD Design Laws" section |


---

## Notes from the Wife (the actual user — never ignore these)

> "Don't over-engineer it. A simple, working version I actually use beats a fancy one I abandon."
> "Make the daily dashboard the hero screen. That's where I'll spend 80% of my time."
> "Please make the colors nice. A calming color palette makes a huge difference."
> "If something is hard to build, skip it for now. We can add features later."
> "I'd rather have 5 things that work perfectly than 20 things that are half-baked."

---

## Claude Code Rules for This Project

1. **Read this file first, every session.** Don't start coding without it.
2. **Dashboard first, always.** Improve the dashboard before adding new screens.
3. **Check the ADHD Design Laws** before shipping any UI decision.
4. **Optimistic updates** on every mutation — never make her wait for a DB round-trip.
5. **Use Claude Design** for any complex component before writing the code.
6. **No harsh UI.** Ask yourself: could this feel punishing to an ADHD brain?
7. **SQLite quirks**: booleans are 0/1, dates are ISO strings, arrays are JSON strings.
8. **Tauri IPC is async** — all `select()` and `execute()` calls must be awaited.
9. Keep components small. If a component file exceeds ~150 lines, split it.
10. **Mobile and desktop share zero runtime code** — they have separate DBs and separate React trees. That is intentional.

---
# Design Reference — "Quiet Garden"

## Source of truth

All UI must match `design-reference/dashboard.html` (the Quiet Garden handoff — an
interactive full-app reference with every page, the quick-add modal, dark toggle, and a
spec appendix). The folder is gitignored; if it's missing, re-export from the Claude
Design project. `design-reference/README.md` is the handoff doc with the P1–P12 pitch map.

---

## Typography

Two faces only. **Lora and Geist are retired. No italics anywhere.**

| Role | Font | Size | Weight |
|---|---|---|---|
| ALL UI text | `'Hanken Grotesk', system-ui, sans-serif` | 13–15px | 400 body · 500 rows/labels · 600 titles/buttons · 700 greeting/logo |
| Numbers ONLY (counts, streaks, times, dates) | `'DM Mono', monospace` | 10–11px (stat numbers up to 26) | 400–500 |

Section labels: DM Mono 10.5px uppercase, letter-spacing 0.08em (`.section-label`).
Placeholders: `--text-faint`, never italic (P11).

---

## Color tokens

Use CSS variables exclusively. Full light + dark sheet lives in `apps/desktop/src/index.css`
(same values as the `<style>` block of `design-reference/dashboard.html`).

| Token | Light | Purpose |
|---|---|---|
| `--bg-page` | `#eef2ec` | Page (sage) |
| `--bg-card` | `#ffffff` | Cards / modals |
| `--bg-card-lite` | `#f2f6f1` | Inset panels, filled inputs, chips |
| `--bg-sidebar` | `#e3e9e0` | Sidebar, week-strip chips, theme toggle |
| `--bg-hover` | `#e7ede6` | Row hover, unchecked checkboxes, habit circles |
| `--bg-accent` | `#e1efe7` | Accent wash (selected chips, done chip) |
| `--text-primary` | `#1d2620` | Headings |
| `--text-body` | `#37423a` | Body copy |
| `--text-muted` | `#5b6a5f` | Secondary labels (≥4.5:1 everywhere) |
| `--text-faint` | `#93a297` | Placeholders only |
| `--text-accent` | `#2c6350` | Accent text, links |
| `--accent` | `#33705c` | Pine accent (dark: `#7cbf9e`) |
| `--accent-deep` | `#24513f` | Button hover fill |

Text on accent fills is `var(--bg-page)`, **not** hardcoded white (dark mode flips it).
Category (`--cat-*`, `--cat-*-wash`, `--cat-*-text`) and priority (`--prio-*`) vars are in
`index.css` with dark twins; `category-colors.ts` reads them so TS never holds hexes
(exception: `PRESET_COLORS` — persisted to the DB `color` column).

---

## Depth

**Tonal layering only.** No borders and no shadows on any surface — separation comes from
background steps: page → sidebar → card → inset.

Exceptions (floating layers get ONE soft blur shadow):

| Layer | Shadow |
|---|---|
| Modal | `0 20px 50px rgba(10,15,10,.28)` |
| Menus / toasts / bulk bar | `0 12px 32px rgba(10,15,10,.18)` |
| FAB | `0 6px 16px var(--fab-shadow)` |
| Input focus | `0 0 0 2px var(--accent)` ring |

Never use flat offset shadows (the old style). Never put a border on a card.

---

## Radii

| Element | Radius |
|---|---|
| Card / modal | 20px |
| Card-lite / inset / menus | 13px |
| Buttons / inputs / nav items | 11px |
| Chips / pills | 999px |
| Task rows / row actions | 8px |
| Checkbox | 6px |
| Dot-grid cells | 5px |

---

## Spacing (P10 — 8px grid)

Card padding 24 · grid gaps 16 · task rows min-height 40, padding 10/8.

---

## Component patterns

### Cards
`background: var(--bg-card); border-radius: 20px; border: none; box-shadow: none; padding: 24px;`
Title: Hanken 600 13px `--text-primary`, no icons (P2); DM Mono count flush right (Focus only).

### Chips (category / priority / due / theme)
`.chip`: filled `--bg-card-lite`, radius 999, Hanken 12/500, no border.
Selected: category/priority chips take their wash bg + `--cat-*-text`; due/generic take `.chip.sel` (accent wash).

### Primary button
`.btn-primary`: fill `--accent`, text `var(--bg-page)`, radius 11, 13/600, padding 9/18.
Hover: `--accent-deep` fill. Active: `scale(.97)`. No border, no offset shadow.

### Inputs
`.input` / `.textarea`: filled `--bg-card-lite`, radius 11, no border at rest;
focus = 2px accent ring. Placeholder `--text-faint`, never italic.

### Task rows
Checkbox · title 13.5/500 · category dot 8px · hover-revealed `.row-action` ⋯ (P9).
HIGH priority = inset ring on checkbox (P1). Complete = 250ms fade + sink (P6),
then strikethrough at ~50% opacity.

### Checkboxes
18px, radius 6, filled `--bg-hover`, no border. Done: fill `--accent`, check stroked `var(--bg-page)`.

### Habit circles
52px, filled `--bg-hover`. Done: `--accent` fill. Press: `scale(.94)`.
Streak numbers DM Mono; render only at ≥3 days (P7); no flame glyphs.
Dot grid: 18px radius-5 squares — done = habit ink, missed = `--bg-card-lite`, never red.

### Modals
bg `--bg-card`, radius 20, one blur shadow, overlay `--modal-overlay` + 3px blur.
Enter: opacity 0→1, scale .96→1, translateY 8→0, 0.18s ease.

### Dashboard header band (P12)
No topbar chrome — sits on the page. Left: greeting 20/700 + DM Mono date + one quote
line in `--text-quote` (P3). Right: `.wk-mini` week strip (P4) + done chip + theme toggle.

---

## Responsive (~900px, implemented at `@media (max-width: 1100px)`)

Sidebar → 56px icon rail · dash grid → 1 column (max 560) · content padding 20/24 ·
header wraps, `.wk-mini` hides first · Tasks category rail (`.subbar`) hides.

---

## Transitions

Interactive elements 0.12–0.2s; row sink 0.25s; theme changes 0.3s. Nothing longer.

---

## Dark mode

Apply via `.dark` class on `#root`. Every token (including `--cat-*` / `--prio-*`) has a
dark twin in `index.css` — never hardcode light-only values.

## Do not

- Put borders or shadows on cards/surfaces (tonal steps only)
- Use flat offset shadows anywhere
- Use Lora, Geist, or any italics
- Use DM Mono for words (numbers only)
- Use emoji in UI chrome (inline stroke SVGs only; ✦ logo mark and ★ stars are the exceptions)
- Hardcode white text on accent fills (use `var(--bg-page)`)
- Show red anywhere for missed/overdue states
- Use rounded-corner containers with a left-border accent (AI trope — the 3px upcoming-card
  time bar per the reference is the one sanctioned use)

