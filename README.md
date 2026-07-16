# ADHD Life

A calm, forgiving life management app built for an ADHD brain.
**Runs entirely on your computer. No accounts. No cloud. No internet required.**

Native desktop app (Tauri) for macOS + Windows, with an Expo companion app for iOS + Android. Each keeps its own local SQLite database.

---

## Install (just want to use it?)

Grab the latest installer from [Releases](https://github.com/ASThome00/adhdlife/releases):

- **Windows**: `ADHD Life_x.x.x_x64-setup.exe`
- **macOS**: `ADHD Life_x.x.x_x64.dmg`

The app checks for updates itself (Settings → Check for Updates). Mobile builds ship via Expo/EAS.

---

## Development

### Prerequisites

- Node.js 20+ and pnpm 9+ (`npm i -g pnpm`)
- [Rust](https://rustup.rs) (for the Tauri desktop shell)

### Run

```bash
pnpm install
pnpm dev            # Desktop app (Tauri window + Vite)
pnpm dev:fresh      # Same, but resets the local dev database first
pnpm dev:mobile     # Expo — scan the QR with Expo Go
pnpm typecheck      # TypeScript check across the monorepo
```

No database setup needed — migrations in `apps/desktop/src-tauri/migrations/` run automatically on first launch and seed the 8 default life categories.

---

## What it does

| Feature | Status |
|---|---|
| Daily dashboard (focus tasks, habits, week strip) | ✅ |
| Brain dump inbox (type fast, sort later) | ✅ |
| Tasks (subtasks, due dates, recurrence, priority, snooze) | ✅ |
| 8 life categories (Work, School, Health…) | ✅ |
| Habit tracking with forgiving streaks | ✅ |
| Reading tracker (kanban: To Read / Reading / Finished) | ✅ |
| Weekly review (stats, carried-over, next-week priorities) | ✅ |
| Dark mode + settings + JSON data export | ✅ |
| Auto-updater | ✅ |
| Focus timer (gentle pomodoro) | 🔲 planned |
| Mobile screens (Today, Inbox, …) | 🔲 in progress |

Design principles: every action ≤5 seconds, no punishing red overdue counters, streaks pause instead of resetting, capture first and sort later. Full list in [CLAUDE.md](./CLAUDE.md).

---

## How your data is stored

Everything lives in a single SQLite file in your OS app-data directory:

- **Windows**: `%APPDATA%\com.adhd-life.app\adhd-life.db`
- **macOS**: `~/Library/Application Support/com.adhd-life.app/adhd-life.db`

**To back up:** copy that file anywhere (or use Settings → Export my data for JSON).
**To restore / move machines:** put the file back in the same spot.

The mobile app keeps its own separate SQLite database on-device. There is no sync between desktop and mobile (yet — deliberately).

---

## Project layout

```
adhd-life/
├── apps/
│   ├── desktop/      Tauri 2 + Vite + React — macOS & Windows
│   │   ├── src/              React frontend (pages, components, lib/queries)
│   │   └── src-tauri/        Rust shell + SQLite migrations
│   └── mobile/       Expo (React Native) — iOS & Android, own local DB
├── packages/
│   └── types/        Shared TypeScript types
├── scripts/          Release automation
└── CLAUDE.md         Full context for Claude Code sessions
```

No server, no API routes — React talks to SQLite directly through `tauri-plugin-sql` (desktop) and `expo-sqlite` (mobile).

---

## Releasing

```bash
pnpm release 1.0.0   # Builds all platforms → creates a GitHub Release
```

See [RELEASE.md](./RELEASE.md) for prerequisites (`gh` CLI, `EAS_TOKEN`) and the full checklist in [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md).

---

## Working with Claude Code

Open Claude Code from the project root and it will automatically read `CLAUDE.md` for full context on architecture, design tokens, product decisions, and build order.

```bash
cd adhd-life
claude
```

---

*Built for the love of my life. 💜*
