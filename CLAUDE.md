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
│   │   │   │   ├── dashboard.tsx     🔲 Build next
│   │   │   │   ├── inbox.tsx         🔲
│   │   │   │   ├── tasks.tsx         🔲
│   │   │   │   ├── habits.tsx        🔲
│   │   │   │   ├── reading.tsx       🔲
│   │   │   │   ├── review.tsx        🔲
│   │   │   │   └── settings.tsx      🔲
│   │   │   ├── components/
│   │   │   │   ├── nav/
│   │   │   │   │   ├── app-shell.tsx ✅ Done
│   │   │   │   │   └── sidebar.tsx   ✅ Done
│   │   │   │   ├── tasks/
│   │   │   │   │   ├── task-card.tsx         ✅ Done (needs desktop polish)
│   │   │   │   │   ├── quick-add-fab.tsx     ✅ Done (needs category picker)
│   │   │   │   │   └── overdue-collapsible.tsx ✅ Done
│   │   │   │   └── habits/
│   │   │   │       └── habit-check-row.tsx   ✅ Done
│   │   │   └── lib/
│   │   │       ├── db.ts             ✅ SQLite singleton (tauri-plugin-sql)
│   │   │       ├── utils.ts          ✅ cn(), formatDueDate(), PRIORITY_CONFIG
│   │   │       ├── queries/
│   │   │       │   ├── settings.ts   ✅ getSettings / updateSettings
│   │   │       │   ├── tasks.ts      ✅ Full CRUD + getDashboardData
│   │   │       │   └── habits-categories-books.ts ✅ Full CRUD
│   │   │       └── hooks/
│   │   │           └── use-data.ts   ✅ All TanStack Query hooks
│   │   └── src-tauri/
│   │       ├── src/
│   │       │   ├── main.rs           ✅ Done
│   │       │   └── lib.rs            ✅ Done — registers plugins + migrations
│   │       ├── migrations/
│   │       │   └── 001_initial.sql   ✅ Full schema + default category seed
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

### SQLite Notes
- Dates stored as ISO strings. Use `startOfTodaySql()` / `endOfTodaySql()` from `lib/db.ts`.
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

```
Primary:  #8b5cf6  (violet)  — buttons, active states
Surface:  #fafaf9  (warm white) — page background
Card:     #ffffff  — card backgrounds
Border:   #e7e5e4

Category colors (also used as CSS vars):
  work #3B82F6 · school #8B5CF6 · health #EF4444 · admin #F59E0B
  growth #10B981 · reading #EC4899 · social #F97316 · home #6B7280
```

Utility classes in `index.css`:
- `.card` — white rounded-2xl card with shadow
- `.btn-primary` — filled violet button
- `.btn-ghost` — text-only hover button
- `.priority-dot-HIGH/MEDIUM/LOW` — colored dot
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

# ADHD Life — Claude Code Session Plan
## Design Source of Truth

> **Before every session:** The visual design for this app lives in a Claude Design project.
> All component styles, tokens, spacing, shadows, typography, and interaction patterns
> must be pulled from there — do NOT invent new UI. The design file is the reference.
>
> **Design file location:** `design-reference/dashboard.html` (and supporting files
> `design-reference/app-components.jsx`, `design-reference/dashboard-cards.jsx`,
> `design-reference/pages.jsx`)
>
> Read CLAUDE.md for the full design token reference (colors, shadows, radii, typography).
> The `## Design Reference` section of CLAUDE.md is the canonical spec extracted from the
> design file — use it as your lookup table when writing component CSS.

---

## SESSION 4 — Tasks & Categories View

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

## SESSION 5 — Habits

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

## SESSION 6 — Reading Tracker

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

## SESSION 7 — Weekly Review

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

## SESSION 8 — Settings & Dark Mode

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

File: apps/mobile/lib/notifications.ts

expo-notifications (already installed).
scheduleMorningReminder(hour: number, minute: number):
  Cancel existing → schedule daily repeating.
  Message: "Good morning! Ready to see your day?" — calm, no task counts.

Settings modal: apps/mobile/app/settings.tsx (presentation: 'modal').
Display name, notification time picker, theme toggle.
Store in SQLite settings table (add notifications_time TEXT + theme TEXT columns).
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

# Design Reference

## Source of truth

All UI in this project must match the visual language defined in `design-reference/dashboard.html`.
Read that file before building any new component or page. The supporting component files are:

- `design-reference/app-components.jsx` — icons, shared primitives
- `design-reference/dashboard-cards.jsx` — card components, task rows, habit circles
- `design-reference/pages.jsx` — full page layouts

---

## Typography

| Role | Font | Size | Weight | Notes |
|---|---|---|---|---|
| UI / body | `'Geist', system-ui, sans-serif` | 13–15px | 400–600 | Default for all interactive elements |
| Headings / modal titles | `'Lora', serif` | 14–15px | 600 | Card titles, modal headers |
| Section labels | `'DM Mono', monospace` | 11px | 400–500 | Uppercase, letter-spacing: 0.06em |
| Cancel / ghost actions | `'Lora', serif` | 13px | 400 | font-style: italic |
| Placeholder text | `'Lora', serif` | — | 400 | font-style: italic |

---

## Color tokens

Use CSS variables exclusively — never hardcode a color that has a token equivalent.
The full token set (light + dark) lives in the `<style>` block of `dashboard.html`.

| Token | Light value | Purpose |
|---|---|---|
| `--bg-page` | `#fdf6ed` | Page background |
| `--bg-card` | `#fffef9` | Card / modal background |
| `--bg-card-lite` | `#faf5ea` | Subtle card variant |
| `--bg-hover` | `#fdf0df` | Row hover state |
| `--border` | `#e2d4c0` | Default border |
| `--text-primary` | `#2d1f14` | Headings, strong text |
| `--text-body` | `#3d2b1a` | Body copy |
| `--text-muted` | `#a08060` | Secondary labels |
| `--text-faint` | `#c4a882` | Placeholders, disabled |
| `--text-mono` | `#b89c80` | DM Mono labels |
| `--shadow` | `#dfd0b8` | Flat offset shadow color |
| `--input-border` | `#e2d4c0` | Input border (bottom only) |
| `--modal-overlay` | `rgba(45,31,20,0.28)` | Modal backdrop |

Named accent values (use directly, not as vars):

| Name | Value | Usage |
|---|---|---|
| Primary | `#c9566e` | Buttons, active dots, FAB, checked states |
| Primary border | `#96334d` | Border + shadow on primary buttons |
| Primary wash | `#c9566e18` | Selected pill background |

Priority colors: Low `#a08060` · Medium `#c9566e` · High `#96334d`

---

## Shadows

All shadows are **flat offset** (no blur). Never use `box-shadow` with a blur radius for UI chrome.

| Context | Value |
|---|---|
| Small card / pill | `2px 2.5px 0px var(--shadow)` |
| Standard card | `3px 4px 0px var(--shadow)` |
| Modal | `5px 6px 0px var(--shadow)` |
| Primary button | `2px 2.5px 0 #96334d` |
| Accent shadow (checked checkbox, habit) | `1px 1.5px 0px var(--check-shadow)` |

Active state: shift shadow down — use `transform: translate(2px, 2px)` + reduce shadow.

---

## Border radii

| Element | Radius |
|---|---|
| Modal | 16px |
| Card | 14px |
| Card lite | 10px |
| Button / pill | 7–9px |
| Nav item | 9px |
| Checkbox | 4px |
| Toggle track | 9px |

---

## Component patterns

### Cards
```css
background: var(--bg-card);
border-radius: 14px;
border: 1.5px solid var(--border);
box-shadow: 3px 4px 0px var(--shadow);
padding: 20px 22px;
```
Card title: Lora 600 14px `var(--text-primary)`. DM Mono count/meta flush right.

### Pill buttons (category / priority / due date)
Two states only:

```css
/* Unselected */
background: transparent;
border: 1.5px solid {color}44;
color: var(--text-sidebar);
font-weight: 400;

/* Selected */
background: {color}18;
border: 1.5px solid {color};
color: {color};
font-weight: 600;
```
Font: Geist 12px. Border-radius: 7px. Padding: 4px 9px. Transition: all 0.12s.

### Primary action button
```css
background: #c9566e;
border: 2px solid #96334d;
border-radius: 9px;
box-shadow: 2px 2.5px 0 #96334d;
color: white;
font-family: 'Geist', sans-serif;
font-size: 13px;
font-weight: 600;
padding: 7px 18px;
```
Disabled: `background: var(--bg-card-lite)`, `border: var(--border)`, `color: var(--text-faint)`, no shadow.

### Inputs
Border-bottom only. No full border, no background fill.
```css
border: none;
border-bottom: 1.5px solid var(--input-border);
background: transparent;
font-family: 'Geist', sans-serif;
font-size: 15px;
color: var(--text-primary);
padding: 8px 0;
outline: none;
```
Focus: `border-bottom-color: #c9566e`. Placeholder: Lora italic `var(--text-faint)`.

### Task rows
```css
display: flex;
align-items: center;
gap: 9px;
padding: 8px 5px;
border-bottom: 1px solid var(--task-border);
border-radius: 7px;
transition: background 0.12s;
```
Hover: `background: var(--bg-hover)`. Last row: no border-bottom.

### Modals
```css
background: var(--bg-card);
border: 1.5px solid var(--border);
border-radius: 16px;
box-shadow: 5px 6px 0px var(--shadow);
padding: 24px;
max-width: 420px;
```
Overlay: `background: var(--modal-overlay)` + `backdrop-filter: blur(3px)`.

Enter animation (Framer Motion or CSS keyframe):
```
opacity: 0 → 1, scale: 0.96 → 1, translateY: 8px → 0
duration: 0.18s, easing: ease
```

### Section labels (inside modals / forms)
```css
font-family: 'DM Mono', monospace;
font-size: 11px;
color: var(--text-mono);
font-weight: 600;
letter-spacing: 0.06em;
text-transform: uppercase;
margin-bottom: 8px;
```

### Checkboxes
```css
width: 18px; height: 18px;
border-radius: 4px;
border: 1.5px solid var(--text-faint);
```
Checked: `background: #c9566e`, `border-color: #b0435c`, `box-shadow: 1px 1.5px 0 var(--check-shadow)`.

---

## Transitions

All interactive elements: `transition: all 0.12s` to `transition: all 0.2s`.  
Never use transitions longer than 0.3s for UI chrome.  
Theme (bg/color changes): 0.3s.

---

## Dark mode

Apply via `.dark` class on `#root`. All tokens have dark equivalents in `dashboard.html`.
Never hardcode light-only values — always use a CSS var so dark mode works for free.

---

## Do not

- Use blur-radius box-shadows for cards or modals
- Invent colors not in the token set (use oklch only if a genuinely new hue is needed)
- Use Inter, Roboto, or system fonts — always load Geist + Lora + DM Mono from Google Fonts
- Use emoji in UI chrome
- Add gradient backgrounds
- Use rounded-corner containers with a left-border accent (common AI trope — avoid)


*Built with love by Andrew, for his wife. 💜*
