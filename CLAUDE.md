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

## Desktop: Commands Reference

```bash
# From apps/desktop/
pnpm dev       # Tauri dev server (hot reload)
pnpm build     # Production build → .dmg (Mac) / .exe installer (Windows)
pnpm vite:dev  # Frontend only (no Tauri shell, for pure UI work)
pnpm typecheck

# From monorepo root
pnpm dev:desktop
pnpm build:desktop
```

Prerequisites before first `pnpm dev`:
1. Install Rust: https://rustup.rs
2. macOS: `xcode-select --install`
3. Windows: Install Visual Studio Build Tools + WebView2

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

## Build Order — Desktop (follow this sequence)

### ✅ Phase 1 — Foundation (complete)
All scaffolding, Tauri config, SQL migration, query layer, hooks, nav shell.

### 🔲 Phase 2 — Daily Dashboard (build first)
**This is the hero screen. Start here.**

File: `src/pages/dashboard.tsx`

Import and wire:
```tsx
const { data, isLoading } = useDashboard()
```

Components to build (all using existing skeleton components):
- `<DashboardHeader>` — greeting from `getGreeting(settings.display_name)`, today's date,
  completion counter "X done today" (calm, not gamified)
- `<FocusTaskList>` — renders `data.focusTasks`, uses `<TaskCard>`, tap → `useCompleteTask()`
- `<HabitCheckRow>` — renders `data.habits`, uses existing `habit-check-row.tsx`,
  wire `useToggleHabit()`
- `<OverdueCollapsible>` — renders `data.overdueTasks`, collapsed by default,
  uses existing `overdue-collapsible.tsx`
- `<UpcomingList>` — renders `data.upcomingToday`, simple task list
- `<QuickAddFAB>` — floating `+` button, opens `<QuickAddModal>` — wire `useCreateTask()`

Layout: two-column on wide screens (focus + habits left, upcoming + overdue right).
Single column below 1100px.

### 🔲 Phase 3 — Quick Add + Brain Dump

**Quick Add Modal** (called from FAB on every page):
- Auto-focused title input
- Category picker: color dot grid from `useCategories()`
- Due date row: Today / Tomorrow / This week / Custom (date picker)
- Priority toggle: Low · Medium · High (pill buttons)
- Submit on Enter, close on Escape
- Wire to `useCreateTask()`

**Inbox page** (`src/pages/inbox.tsx`):
- Large textarea: "What's on your mind?"
- "Dump it" button → `useBrainDump(rawText)`
- Below: list of INBOX tasks from `useTasks({ status: 'INBOX' })`
- Each task: inline category assign dropdown + due date → promotes to ACTIVE
- Bulk select → bulk assign category / drop / snooze

### 🔲 Phase 4 — Tasks & Categories

**Tasks page** (`src/pages/tasks.tsx`):
- Left panel: category list from `useCategories()`, click to filter
- Main panel: filtered task list grouped by:
  - Overdue · Today · This Week · Upcoming · Someday · Done
- Each group is collapsible, count shown in header
- Inline task actions: complete, snooze, drop, edit due date

**Task Detail** — implement as a slide-over panel (not a new page):
- Trigger: click task title anywhere in the app
- Shows: title (editable), notes (editable), subtasks checklist,
  due date, recurrence, priority, category, tags
- Subtasks: `getSubtasks(taskId)`, add via inline input
- Recurrence: frequency picker → INSERT into `recurrences` table

### 🔲 Phase 5 — Habits

**Habits page** (`src/pages/habits.tsx`):
- Top: add new habit (name + color picker)
- Grid: all habits, each showing streak + monthly consistency dots
- Monthly grid: 30 days of `habit_logs`, green = completed, gray = missed, empty = no data
- Streak display: current + longest, using `getStreakMessage()` from utils

### 🔲 Phase 6 — Reading Tracker

**Reading page** (`src/pages/reading.tsx`):
- Three columns: To Read · Reading · Finished
- Add book: title, author, genre, page count
- "Currently Reading" shows progress bar (current_page / total_pages)
- Update progress: click page count → number input inline
- Finish: prompt for rating (1–5 stars) + notes

### 🔲 Phase 7 — Weekly Review

**Review page** (`src/pages/review.tsx`):
- Stats for the past 7 days:
  - Tasks completed vs. planned
  - Habit consistency % per habit
  - Category breakdown (simple bar chart or color blocks — no heavy charting lib)
- "Carried over" list: tasks that were due this week, still not done
- Input: "What are your top 3 priorities for next week?" (saved to `focus_days`)

### 🔲 Phase 8 — Settings + Polish

**Settings page** (`src/pages/settings.tsx`):
- Display name (edit)
- Theme: Light / Dark / System (apply `dark` class to `<html>`)
- Daily focus limit (number input, default 5)
- Category management: reorder (drag), rename, recolor, archive
- Export data: dump all tables to JSON, trigger file save via `tauri-plugin-fs`

**Polish:**
- Dark mode: add `dark:` variants throughout, read `settings.theme`,
  apply class to document root
- Keyboard shortcuts: `N` = new task, `B` = brain dump, `Escape` = close modal
- Window title: update to "ADHD Life — Today" etc. via `@tauri-apps/api/window`

---

## Build Order — Mobile (Expo iOS + Android)

Mobile mirrors the desktop feature set but with native patterns.
`apps/mobile/lib/db.ts` already has the schema and two helper queries.

### 🔲 Mobile Phase 2 — Today Screen
File: `apps/mobile/app/(tabs)/index.tsx`

Use `getTodayTasks()` and `getHabitsWithTodayStatus()` from `lib/db.ts`.
Layout: ScrollView with sections — Focus Tasks, Habits, Upcoming.
Task completion: `UPDATE tasks SET status='DONE', completed_at=... WHERE id=?`
Habit toggle: `INSERT OR REPLACE INTO habit_logs ...`

Add helper functions to `lib/db.ts` as needed — same SQL patterns as desktop.

### 🔲 Mobile Phase 3 — Inbox Tab
File: `apps/mobile/app/(tabs)/inbox.tsx`

TextInput (multiline) + "Dump" button.
On submit: split by newlines → bulk INSERT into tasks as INBOX status.
Below: FlatList of INBOX tasks with swipe-to-categorize.

### 🔲 Mobile Phase 4–6
Follow same feature order as desktop. Each tab = one page.
Use `expo-haptics` on task completion (satisfying tap feedback).
Use React Native's built-in `Pressable` with scale animation for interactivity.

### 🔲 Mobile Phase 7 — Notifications
`expo-notifications` is already installed.
Schedule a daily morning reminder at a user-set time.
Keep it gentle: "Good morning! Ready to plan your day?" — not "You have 12 overdue tasks."

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

*Built with love by Andrew, for his wife. 💜*
