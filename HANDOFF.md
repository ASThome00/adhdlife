# Claude Code Handoff — ADHD Life

> Give this document to Claude Code at the start of each session alongside CLAUDE.md.
> Each session below is a focused, completable unit of work.

---

## Before Any Session — Prerequisites

### One-time machine setup

**macOS:**
```bash
# 1. Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# 2. Install Xcode Command Line Tools (for macOS builds)
xcode-select --install

# 3. Install pnpm if not already installed
npm install -g pnpm
```

**Windows:**
```
1. Install Visual Studio Build Tools 2022
   (select "Desktop development with C++")
2. Install WebView2 Runtime (usually pre-installed on Win11)
3. Install Rust: https://rustup.rs
4. Install pnpm: npm install -g pnpm
```

### One-time project setup (run once, then never again)
```bash
cd adhd-life
pnpm install
```

That's it. No database to provision. No env vars to fill in.
The SQLite file is created automatically on first `pnpm dev:desktop`.

---

## How to start a Claude Code session

```bash
cd adhd-life
claude
```

Claude Code reads `CLAUDE.md` automatically. Then paste the session prompt below.

---

## SESSION 1 — Verify & First Run

**Goal:** Confirm the app compiles and runs. Fix any build issues.

**Prompt to give Claude Code:**
```
Read CLAUDE.md. Then:

1. Run `pnpm install` from the monorepo root and fix any dependency issues.

2. From apps/desktop/, attempt `pnpm vite:dev` (frontend only, no Tauri).
   Fix any TypeScript or import errors until the Vite dev server starts.

3. Verify all imports in App.tsx resolve. The pages (dashboard, inbox, etc.)
   don't exist yet — replace them with placeholder components that just render
   a div with the page name. We'll build the real pages in later sessions.

4. Once Vite starts clean, attempt `pnpm dev` (full Tauri).
   - If Rust isn't installed, output the install instructions and stop.
   - If Rust is installed, fix any Cargo build errors.

5. When the app opens, the setup screen should appear (pages/setup.tsx).
   Confirm: entering a name and clicking "Let's go" changes the view.
   (App.tsx reads settings.setup_complete — if true, it renders the shell.)

6. Fix the placeholder dashboard so it shows "Dashboard placeholder" text
   instead of crashing.

Report what works and what needed fixing.
```

---

## SESSION 2 — Daily Dashboard

**Goal:** Build the hero screen. This is the most important session.

**Prompt to give Claude Code:**
```
Read CLAUDE.md. We're building the daily dashboard — the hero screen.

File to create: apps/desktop/src/pages/dashboard.tsx

The data hook is already written: `useDashboard()` in lib/hooks/use-data.ts.
It returns: { focusTasks, overdueTasks, upcomingToday, habits, completedToday, totalScheduledToday }

Build these components, all in dashboard.tsx or split into files under
components/dashboard/ if they get large:

1. DashboardHeader
   - Personalized greeting using `getGreeting(settings.display_name)` from lib/utils.ts
   - Today's date formatted as "Wednesday, April 23"
   - Subtle completion counter: "X of Y done" in muted text — calm, not gamified
   - This area should be the Tauri drag region (data-tauri-drag-region)

2. FocusTaskList
   - Heading: "Today's Focus"
   - Renders focusTasks (max 5)
   - Each task uses TaskCard from components/tasks/task-card.tsx
   - Tapping the checkbox calls useCompleteTask() with optimistic update
   - If empty: soft placeholder "No focus tasks — pick some from your task list"
   - "Add focus task" button opens QuickAddModal with isFocusToday pre-set

3. HabitCheckRow
   - Uses the existing components/habits/habit-check-row.tsx skeleton
   - Wire useToggleHabit() to the toggle handler
   - Satisfying check animation on completion (Framer Motion scale + color fill)

4. OverdueCollapsible
   - Uses existing components/tasks/overdue-collapsible.tsx skeleton
   - Collapsed by default, label: "Carried over (N)" — not "OVERDUE"
   - "Move all to today" bulk action: PATCH all overdue tasks' due_date to today

5. UpcomingToday
   - Simple list below the fold
   - Heading: "Also due today"
   - Uses TaskCard, same complete action

6. QuickAddFAB
   - Uses existing components/tasks/quick-add-fab.tsx skeleton
   - The modal needs: title input (auto-focused), category color picker,
     due date shortcuts (Today / Tomorrow / This week), priority toggle
   - Wire useCreateTask()
   - Close on Escape, submit on Enter

Layout: use CSS Grid. Two columns above 1100px:
  Left col (flex-grow): FocusTaskList + HabitCheckRow
  Right col (fixed ~340px): UpcomingToday + OverdueCollapsible
Single column below 1100px.

All list areas should scroll independently (.scroll-panel class).
The outer layout must NOT scroll — this is a desktop app.

ADHD Design Laws to check before finishing:
- Overdue section: is it calm? No red? Collapsed by default?
- Completion: does it feel satisfying, not punishing?
- Empty states: are they encouraging, not guilt-inducing?
```

---

## SESSION 3 — Quick Add & Brain Dump

**Goal:** The two fastest-path task entry flows.

**Prompt to give Claude Code:**
```
Read CLAUDE.md. Build two task entry flows.

--- PART A: Complete the QuickAddFAB modal ---

The skeleton exists at components/tasks/quick-add-fab.tsx.
Replace the TODO comment with a full bottom-sheet/modal:

Fields:
- Title input (auto-focused, submit on Enter)
- Category picker: horizontal scroll of color dots from useCategories()
  Click a dot to select. Selected dot gets a ring. "None" is valid.
- Due date row: pill buttons — Today | Tomorrow | This week | None
  "This week" = next Friday. Each sets the due_date.
- Priority: three pills — Low · Medium · High (Medium default)

Behavior:
- Keyboard: Enter submits, Escape closes
- On submit: call useCreateTask() then close and reset form
- The modal should be centered on desktop (not a bottom sheet — this is a desktop app)
- Use Framer Motion: fade + scale in, fade + scale out

--- PART B: Inbox / Brain Dump page ---

File: apps/desktop/src/pages/inbox.tsx

Top section — Brain Dump area:
- Large textarea: placeholder "What's on your mind? One thought per line."
- "Dump it" button below (or Cmd+Enter shortcut)
- On submit: call useBrainDump(rawText) then clear the textarea
- Show a brief success toast: "X tasks added to inbox"
- Keep it visually generous — big text, lots of breathing room

Bottom section — Inbox task list:
- Heading: "Inbox (N unsorted)"
- Fetch with useTasks({ status: 'INBOX' })
- Each task row shows: title, "Assign category →" dropdown, due date picker
- Assigning a category calls updateTask(id, { category_id }) which auto-promotes INBOX→ACTIVE
  and removes it from this list (optimistic remove)
- Bulk actions bar (appears when tasks selected): Assign category | Set due date | Drop all

Empty state: "You're all sorted! Brain dump anything new above."
```

---

## SESSION 4 — Tasks & Categories View

**Goal:** The full task browser.

**Prompt to give Claude Code:**
```
Read CLAUDE.md. Build the Tasks page.

File: apps/desktop/src/pages/tasks.tsx

Layout: two-panel (sidebar + main), similar to an email client.

LEFT PANEL (~220px, fixed):
- "All Tasks" item at top (no filter)
- Category list from useCategories()
- Each item: color dot + name + active task count badge
- Click to filter the main panel
- "+ New Category" button at bottom → inline name + color picker form

MAIN PANEL (flex-grow, scrollable):
- Heading: selected category name or "All Tasks"
- Tasks grouped into collapsible sections:
    Overdue   — due_date < today, status not DONE/DROPPED
    Today     — due_date = today
    This Week — due_date within next 7 days
    Upcoming  — due_date > 7 days
    Someday   — no due_date, status = ACTIVE
    Inbox     — status = INBOX (only shown in "All Tasks" view)
- Each section header: label + count. Collapsed if count = 0.
- Use getTasks() with appropriate filters per section.

TASK ROW (reuse TaskCard, adapt for list-density):
- Checkbox (complete) | Priority dot | Title | Category dot | Due date | "⋯" menu
- "⋯" menu: Edit | Snooze 1 day | Snooze 1 week | Move to today | Drop
- Click title → open TaskDetailPanel (slide-over from right)

TASK DETAIL PANEL (slide-over, not a new page):
- Renders over the right side of the screen
- Fields: Title (editable h2), Notes (contenteditable div), Due date picker,
  Priority picker, Category picker, Time estimate (minutes input)
- Subtasks checklist: list of child tasks, checkable, "+ Add subtask" inline input
  Subtasks fetched with getSubtasks(taskId) — already written
- Recurrence: "Repeat" dropdown (Never / Daily / Weekly / Monthly / Yearly)
  On select: INSERT into recurrences table
- All edits call updateTask() on blur/change with optimistic update

ADHD principles:
- "Drop" not "Delete" — soft language
- Snoozed tasks disappear from view (status=SNOOZED, snoozed_until set)
- No confirmation dialogs for snooze/drop — just an undo toast for 3 seconds
```

---

## SESSION 5 — Habits

**Goal:** Daily habit tracking with forgiving streaks.

**Prompt to give Claude Code:**
```
Read CLAUDE.md. Build the Habits page.

File: apps/desktop/src/pages/habits.tsx

TOP SECTION — Add new habit:
- Inline form: name input + color swatch picker (8 preset colors) + "Add" button
- Calls createHabit() from lib/queries/habits-categories-books.ts

HABITS GRID:
- One card per habit
- Each card shows:
  - Habit name + color indicator
  - Today's checkbox (large, satisfying to tap)
  - Current streak with flame emoji: "🔥 12 days"
  - Longest streak in muted text: "Best: 34"
  - 30-day consistency grid (6 rows × 5 cols or 5 rows × 6 cols)
    Each dot = one day. Green = completed. Gray dot = missed. Empty = no data yet.
    Fetch with: SELECT date, completed FROM habit_logs WHERE habit_id = ?
      AND date >= date('now', '-29 days') ORDER BY date ASC
  - Motivational text from getStreakMessage(currentStreak) in lib/utils.ts

STREAK RULE (critical — implement correctly):
- toggleHabitToday() in queries already handles this correctly
- Missed days PAUSE the streak (current_streak resets to 0 temporarily)
- longest_streak is NEVER reduced — only ever increases
- The UI should reflect this: if streak = 0 but longest > 0,
  show "Paused at X days — start again today!" not shame language

ARCHIVE:
- "⋯" menu on each card: Edit name | Archive
- Archived habits disappear from this view (is_archived = 1)
- No delete — data is preserved
```

---

## SESSION 6 — Reading Tracker

**Goal:** Track her med school reading and personal books.

**Prompt to give Claude Code:**
```
Read CLAUDE.md. Build the Reading page.

File: apps/desktop/src/pages/reading.tsx

Layout: three columns — To Read | Currently Reading | Finished

Each column is a scrollable card list.

ADD BOOK (button at top of "To Read"):
- Modal form: Title (required), Author, Genre, Page count
- Calls createBook() from lib/queries/habits-categories-books.ts

BOOK CARD:
- Title + Author
- Genre tag (colored pill)
- Status-specific content:

  TO_READ cards:
  - "Start reading" button → sets status=READING, started_at=now

  READING cards:
  - Progress bar: current_page / total_pages (if total_pages set)
  - "Page N of M" — click page number to edit inline
  - "Mark finished" button → opens finish modal

  FINISHED cards:
  - Completion date
  - Star rating (1–5, click to set)
  - Notes snippet (click to expand/edit)

FINISH MODAL:
- Star rating (1–5 interactive stars)
- Notes textarea: "Any thoughts or highlights?"
- On save: updateBook(id, { status: 'FINISHED', finished_at: now, rating, notes })

DRAG BETWEEN COLUMNS:
- Nice to have — implement only if time allows
- Simple: just use the status-change buttons above instead
```

---

## SESSION 7 — Weekly Review

**Goal:** A guided, encouraging look back at the week.

**Prompt to give Claude Code:**
```
Read CLAUDE.md. Build the Weekly Review page.

File: apps/desktop/src/pages/review.tsx

This page shows the past 7 days and helps plan next week.
Fetch everything in a single query function — add it to lib/queries/tasks.ts.

STATS SECTION:
- Tasks completed this week (COUNT WHERE completed_at >= 7 days ago)
- Tasks planned vs. done (nice ratio, not a shame number)
- Habit consistency: % of days each habit was completed this week
  Show as a small colored bar per habit

CARRIED OVER SECTION:
- Tasks that were due this week and are still ACTIVE or INBOX
- Each shows: title, original due date, category color
- Actions: "Move to next week" | "Drop it" | "Focus this week"
- No scary warnings — just a calm list

NEXT WEEK SECTION:
- Prompt: "What are your top 3 priorities for next week?"
- Three text inputs, saved to a note in focus_days or a simple text field in settings
  (add a `next_week_priorities` TEXT column to settings via a new migration if needed)

CATEGORY BREAKDOWN:
- Simple colored block chart — no heavy charting library
- Each category: name + color + count of tasks completed
- Use div widths as proportional bars (pure CSS, no chart lib)

TONE: Everything on this page should feel like a supportive friend reviewing the week,
not a productivity dashboard judging performance.
```

---

## SESSION 8 — Settings & Dark Mode

**Goal:** User preferences + dark mode + data export.

**Prompt to give Claude Code:**
```
Read CLAUDE.md. Build the Settings page and dark mode.

File: apps/desktop/src/pages/settings.tsx

SECTIONS:

Profile:
- Display name (editable input) → updateSettings({ display_name })
- Small note: "Used for your morning greeting"

Appearance:
- Theme toggle: Light | Dark | System (three pills)
- On change: updateSettings({ theme }) AND apply to document:
  Light: document.documentElement.classList.remove('dark')
  Dark:  document.documentElement.classList.add('dark')
  System: match prefers-color-scheme media query
- Store preference in settings table, apply on app startup

Focus:
- Daily focus limit: number input (1–10, default 5)
- "How many tasks can appear in today's focus list"
- → updateSettings({ daily_focus_limit })

Categories:
- List all categories from useCategories()
- Reorder: drag handles (use @dnd-kit/sortable — add to package.json)
- Rename: click name → inline input
- Recolor: click color dot → color picker (8 preset swatches)
- Archive: toggle → updateCategory(id, { is_archived: true })
- Default categories are reorderable and recolorable but not archivable

Data:
- "Export my data" button
  Fetch all tables → JSON → use @tauri-apps/plugin-fs to save file dialog
  Add tauri-plugin-fs to Cargo.toml and tauri.conf.json allowlist
- Format: { tasks: [...], habits: [...], categories: [...], books: [...], settings: {...} }

DARK MODE — apply throughout:
Add dark: variants to all components. Key mappings:
  bg-white → dark:bg-gray-900
  bg-surface-50 → dark:bg-gray-950
  bg-surface-100 → dark:bg-gray-800
  border-surface-200 → dark:border-gray-700
  text-gray-900 → dark:text-gray-100
  text-gray-500 → dark:text-gray-400
  card class → add dark:bg-gray-900 dark:border-gray-700
```

---

## SESSION 9 — Mobile: Today Screen + Inbox

**Goal:** First two screens of the Expo mobile app.

**Prompt to give Claude Code:**
```
Read CLAUDE.md. Build the first two screens of the Expo mobile app.

The database layer is already written at apps/mobile/lib/db.ts.
It exports: getDb(), getTodayTasks(), getHabitsWithTodayStatus()
Add any extra helper functions needed directly to that file.

--- TODAY SCREEN: apps/mobile/app/(tabs)/index.tsx ---

ScrollView layout with three sections:

1. Header
   - Greeting: "Good morning! 👋" (time-based, from a simple helper)
   - Date: "Wednesday, April 23"
   - Completion count: "X done today" (muted, encouraging)

2. Habits row
   - Horizontal ScrollView
   - Each habit: circle (filled = done, dashed = pending), name below, streak count
   - Tap to toggle: INSERT OR REPLACE INTO habit_logs
   - Use expo-haptics on toggle: Haptics.impactAsync(ImpactFeedbackStyle.Light)
   - Color from habit.color field

3. Focus Tasks
   - Fetch tasks WHERE is_focus_today=1 AND status != 'DONE'
   - Each task: checkbox + title + category color dot
   - Tap checkbox: UPDATE tasks SET status='DONE', completed_at=datetime('now')
     Use expo-haptics: Haptics.notificationAsync(NotificationFeedbackType.Success)
   - Optimistic update: remove from list immediately, requery in background

4. Also today
   - Tasks WHERE due_date = today AND is_focus_today=0 AND status NOT IN (DONE, DROPPED)
   - Same row format, same completion behavior

5. Floating "+" button (bottom right)
   - Opens a bottom sheet (react-native's built-in Modal or a simple animated view)
   - Just title input + submit for now — quick capture is the priority

All data fetching: use useQuery from @tanstack/react-query wrapping the sqlite helpers.
QueryClient is already set up in app/_layout.tsx.

--- INBOX SCREEN: apps/mobile/app/(tabs)/inbox.tsx ---

Top: Multiline TextInput
  placeholder="Brain dump — one thought per line"
  Large, generous padding, soft background

"Dump it" button below:
  Split by newlines → INSERT INTO tasks (status='INBOX') for each non-empty line
  Clear input, show brief success message

Below: FlatList of INBOX tasks
  Each row: title + "→ Assign" button
  "→ Assign" opens a bottom sheet with category list
  On select: UPDATE tasks SET category_id=?, status='ACTIVE'
  Optimistic remove from inbox list

Empty state: "You're all caught up! Dump anything new above." with a small brain emoji.

STYLING:
Use NativeWind (Tailwind for React Native, already in package.json).
Match the desktop color palette exactly (same hex values).
Safe area: use SafeAreaView from react-native-safe-area-context everywhere.
```

---

## SESSION 10 — Mobile: Remaining Tabs + Notifications

**Goal:** Complete the mobile app.

**Prompt to give Claude Code:**
```
Read CLAUDE.md. Complete the remaining Expo mobile screens.

--- TASKS TAB: apps/mobile/app/(tabs)/tasks.tsx ---

Category filter pills at top (horizontal scroll).
Task list below, filtered by selected category.
Same group sections as desktop: Overdue / Today / This Week / Upcoming / Someday
Each task: swipe right to complete, swipe left for "Snooze 1 day" and "Drop"
Use react-native-gesture-handler for swipe actions (already installed).

--- HABITS TAB: apps/mobile/app/(tabs)/habits.tsx ---

Same data as Today screen's habit row, but full page view.
Each habit: large card with 30-day consistency dots grid.
Tap today's circle to toggle.
Streak display with getStreakMessage equivalent.
"+ New habit" button at bottom opens modal.

--- READING TAB: apps/mobile/app/(tabs)/reading.tsx ---

Three horizontal tabs at top: To Read | Reading | Finished
FlatList per tab.
Book card: title, author, progress bar (for Reading).
Tap to open book detail modal: all fields, progress update, rating.

--- NOTIFICATIONS ---

File: apps/mobile/lib/notifications.ts

Use expo-notifications (already installed).
One function: schedulemorningReminder(hour: number, minute: number)
  → cancels existing, schedules a daily repeating notification
  → message: "Good morning! Ready to see your day?" (no task counts, no urgency)

Call from a settings screen (create apps/mobile/app/settings.tsx as a modal route):
  Time picker for notification time
  Toggle on/off
  Store preference in the habits/settings SQLite table
  (add a notifications_time TEXT column via an ALTER TABLE in db.ts initSchema)

--- SETTINGS MODAL: apps/mobile/app/settings.tsx ---

Stack.Screen with presentation: 'modal'
Fields:
  Display name (sync with SQLite settings table)
  Notification time toggle + time picker
  Theme: Light / Dark / System (AsyncStorage for React Native theming)

Access from a gear icon in the Today screen header.
```

---

## After all sessions — Building installers

### macOS (.dmg)
```bash
cd apps/desktop
pnpm build
# Output: src-tauri/target/release/bundle/dmg/ADHD Life_0.1.0_x64.dmg
```
Double-click the .dmg to install. On first launch, macOS may warn about an unnotarized app —
right-click → Open to bypass (or set up Apple notarization for distribution).

### Windows (.exe installer)
```bash
# On a Windows machine:
cd apps/desktop
pnpm build
# Output: src-tauri/target/release/bundle/nsis/ADHD Life_0.1.0_x64-setup.exe
```

### iOS (via Expo)
```bash
cd apps/mobile

# Development build on Simulator:
pnpm ios

# Physical device build (requires Apple Developer account — $99/year):
npm install -g eas-cli
eas login
eas build --platform ios --profile preview
# EAS handles signing — follow the prompts
```

### Android (via Expo)
```bash
cd apps/mobile
eas build --platform android --profile preview
# Outputs a .apk or .aab
```

---

## Quick reference — where things live

| Thing | Location |
|---|---|
| SQLite schema | `apps/desktop/src-tauri/migrations/001_initial.sql` |
| Desktop DB queries | `apps/desktop/src/lib/queries/` |
| Desktop hooks | `apps/desktop/src/lib/hooks/use-data.ts` |
| Desktop pages | `apps/desktop/src/pages/` |
| Desktop components | `apps/desktop/src/components/` |
| Mobile DB | `apps/mobile/lib/db.ts` |
| Mobile screens | `apps/mobile/app/(tabs)/` |
| Shared types | `packages/types/src/index.ts` |
| Design tokens | `apps/desktop/tailwind.config.js` |
| ADHD Design Laws | `CLAUDE.md` → "ADHD Design Laws" section |
EOF