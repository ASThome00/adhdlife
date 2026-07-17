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
│   │   │   │   ├── tasks.tsx         ✅ Done — two-panel (category sidebar + sections) + detail slide-over
│   │   │   │   ├── habits.tsx        ✅ Done — streaks + 30-day grid
│   │   │   │   ├── reading.tsx       ✅ Done — three-column book kanban
│   │   │   │   ├── review.tsx        ✅ Done — stats + carried-over + priorities
│   │   │   │   ├── pomodoro.tsx      🔲 Next: focus-task initiation timer (see Product Decisions)
│   │   │   │   └── settings.tsx      ✅ Done — profile/theme/categories/export + updater
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
│       │   ├── _layout.tsx           ✅ Done — fonts + QueryClient + ThemeProvider + housekeeping
│       │   ├── settings.tsx          ✅ Done — modal: display name + theme toggle (NO notifications)
│       │   └── (drawer)/             Hamburger drawer nav (NOT tabs — Andrew wants room to add pages)
│       │       ├── _layout.tsx       ✅ Done — expo-router Drawer, Quiet Garden sidebar styling
│       │       ├── index.tsx         ✅ Done — Today: greeting, habit circles, Focus/Also today, FAB
│       │       ├── inbox.tsx         ✅ Done — brain dump + assign-category sheet
│       │       ├── tasks.tsx         ✅ Done — category pills + 5 sections + swipe complete/snooze/drop
│       │       ├── habits.tsx        ✅ Done — cards + 30-day dot grid + new-habit sheet
│       │       └── reading.tsx       ✅ Done — To read/Reading/Finished pills + detail sheet
│       ├── components/               ✅ drawer-content, screen-header (hamburger), task-row,
│       │                                swipeable-task-row, habit-circle, dot-grid, sheet,
│       │                                quick-add-sheet, add-book-sheet, book-detail-sheet,
│       │                                fab, undo-toast, section-label, empty-state
│       └── lib/
│           ├── db.ts                 ✅ Done — expo-sqlite, desktop-aligned seeds (cat_work…cat_home),
│           │                            LOCAL day keys, full query/mutation helpers, housekeeping
│           ├── theme.ts              ✅ Quiet Garden tokens (light+dark) — mobile has no CSS vars,
│           │                            components read tokens via useTheme(); never hardcode hexes
│           ├── use-theme.tsx         ✅ ThemeProvider/useTheme — persists choice in settings table
│           └── utils.ts              ✅ greeting, formatDueDate, streak copy, section grouping
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
| `getSubtasks(parentId)` | tasks.ts | Child tasks for a parent (subtask checklist) |
| `getRecurrence` / `setRecurrence` | tasks.ts | Repeat cadence for a task (Never/Daily/Weekly/Monthly/Yearly) |
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

## Desktop: Page Behaviors

Durable functional patterns from the shipped pages (visual spec lives in Design Reference below).

**Tasks** (`pages/tasks.tsx`): sections are Overdue / Today / This week / Upcoming / Someday,
plus Inbox (only shown in "All Tasks", hidden inside a category filter). Row menu: complete,
snooze 1 day / 1 week, move to today, drop. Snooze and drop always show a 3s undo toast
(`components/tasks/undo-toast.tsx`) instead of a confirm dialog — "Drop" not "Delete" is
deliberate soft language. The detail slide-over supports subtasks (`getSubtasks(parentId)`,
self-referencing `parent_task_id`) and recurrence (`getRecurrence`/`setRecurrence`).

**Habits**: `updateHabit()` handles rename/recolor/archive. Archived habits
(`is_archived = 1`) are hidden, never deleted — there is no delete affordance.

**Reading**: three columns keyed on `status` — `TO_READ` / `READING` / `FINISHED` (a fourth,
`RESTING`, i.e. "put down for now," is planned — see Product Decisions). Page count updates
inline; finishing sets `rating` + `notes` via the finish modal.

**Settings**: sections are Profile, Appearance (theme), Focus (daily limit), Categories
(drag reorder via `@dnd-kit/sortable`, inline rename, recolor, archive), Data (export). The
updater card is separate pre-existing infra — don't rebuild it.

---

## Data Layer (Mobile)

`apps/mobile/lib/db.ts` — expo-sqlite (sync API), same schema as desktop.
`getDb()` opens the DB, runs `initSchema()` (tables + desktop-aligned category seeds
`cat_work…cat_home`, plus a one-shot migration remapping legacy `cat_0…cat_7` installs).
Screens call the exported helpers directly through TanStack Query — no HTTP, no server.

Helpers mirror desktop query logic: `getTodayData()`, `getInboxTasks()`, `getActiveTasks()`,
`createTask()` / `brainDump()` / `assignTaskCategory()` / `completeTask()` / `snoozeTask()` /
`dropTask()` / `reopenTask()`, `getHabits()` / `toggleHabitToday()` (same walk-back streak
recalc) / `getHabitHistory()`, `getBooks()` / `createBook()` / `updateBook()`,
`getSettings()` / `updateSettings()`, `runHousekeeping()` (wakes due snoozes on app open).

Mobile SQLite rules are the same as desktop: **LOCAL day keys** (`localDateStr()`),
`datetime(completed_at) >= datetime(?, 'utc')` for done-today counts, booleans 0/1.

Styling: **no NativeWind** (deliberate — it was never wired up, and adding its babel/metro
config would risk the CI Android build). Screens use `StyleSheet` with Quiet Garden tokens
from `lib/theme.ts` via `useTheme()`. Fonts: Hanken Grotesk + DM Mono bundled locally via
`@expo-google-fonts/*` (no runtime fetch — the no-third-parties rule holds).

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
- `ANDROID_*` signing secrets in the GitHub repo for Android builds
  (one-time keystore setup — see RELEASE.md § Mobile setup)

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
- Device builds come from the release pipeline (no cloud build service —
  `expo prebuild` + Gradle on the GitHub runner; see RELEASE.md)

---

# Product Decisions (locked 2026-07-13)

> Decided by Andrew after the v0.3.0 deep audit (2026-07-13). The audit doc itself has
> been removed now that its outcomes are captured here — these decisions are the full
> record. Do not re-litigate them in future sessions without asking him.

- **Due dates:** calendar dates + OPTIONAL time (detail-panel picker, quiet display). Grouping is always by LOCAL date.
- **Focus:** unfinished focus tasks get a one-click morning re-confirm ("keep these from yesterday?") — the seed of the Plan-my-day flow. Never a silent reset, never a forced wizard.
- **Done/Dropped:** collapsed "Recently done" (last 7 days, struck-through) on the Tasks page. NO dropped archive — dropped stays gone, deliberately.
- **Category colors:** the DB `color` column is the single source everywhere; wash derived as `color + '18'`; map legacy bright seed hexes to the designed inks; `PRESET_COLORS` are suggestions, not limits.
- **Habits:** mixed cadence — build weekly-target habits ("N of M this week" via `target_frequency`). Keep streak numbers; paused shows `⏸ Nd` (faint), never `🔥 0`; compute streaks on read (chain may end today OR yesterday).
- **Pomodoro:** build as a focus-task INITIATION timer — pick a focus task, one-tap 10/15/25/45 countdown, gentle finish ("keep going / done / switch"), never track failed sessions. Not strict pomodoro.
- **Notifications: NONE anywhere** — desktop and mobile. (Overrides the original Session 10 plan below.)
- **Reading:** pleasure-first, keep simple; add soft "put down for now" (ABANDONED rendered as "Resting"). No chapters, no reading↔task linking.
- **No "big dates" / exam-countdown strip.** Tasks with due dates suffice.
- **Mobile:** align seed category ids to desktop's `cat_work…cat_home` (currently `cat_0…cat_7`) BEFORE building any mobile screens. — **Done 2026-07-16** (Sessions 9–10 shipped: seed alignment + legacy-id migration + all five tabs + settings modal).
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
9. Mobile seed-id alignment (fold into Session 9) — **shipped 2026-07-16 with Sessions 9–10**
10. Startup error states (audit B6) + paper-cuts (audit P1–P7)
11. Mobile release pipeline — **phase 1 (Android) shipped 2026-07-16**: `build-and-release.yml`
    builds the APK directly on the GitHub runner (`expo prebuild` + Gradle + apksigner —
    deliberately NO EAS/Expo cloud service, per the no-third-parties gospel) and attaches it
    to the GitHub Release. Job self-skips until the one-time keystore setup in RELEASE.md
    § Mobile setup is done (four `ANDROID_*` secrets). **Phase 2 (iOS) remains**: xcodebuild
    on the macOS runner + TestFlight upload — Andrew has an Apple Developer account; needs
    signing certs/profile as GitHub secrets and a `build-ios` job. No EAS here either.

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

### Android (.apk)
Built by the release pipeline (`expo prebuild` + Gradle on the GitHub runner —
no EAS). To build locally with the Android SDK installed:
```bash
cd apps/mobile
npx expo prebuild --platform android --no-install
cd android && ./gradlew assembleRelease
# Output: app/build/outputs/apk/release/app-release.apk (debug-signed;
# the pipeline re-signs with the release keystore)
```

### iOS (.ipa)
Pipeline phase 2 (not built yet). Local simulator runs work via `pnpm ios` on macOS.

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
dark twin in `index.css` — never hardcode light-only values. `theme.ts` also mirrors the
mode onto `document.documentElement.style.colorScheme` (not just the `#root` class) so
native form-control chrome — the `<input type="date">` calendar icon, `<select>` panel —
doesn't render with mismatched light icons inside a dark app.

**Known limitation:** the date input's *popup calendar overlay* still renders with light
OS chrome in dark mode regardless. Confirmed on Windows/WebView2 (2026-07 verification
pass) — the overlay keys off the system/OS theme, not page CSS, so it isn't fixable via
`color-scheme` or any stylesheet change. Fixing it for real means swapping `<input
type="date">` for a custom-built date picker — a real feature, not a CSS fix. Don't
re-attempt a CSS-only fix; if this ever needs to look right in dark mode, scope it as its
own task.

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

