# ADHD Life

A calm, forgiving life management app built for an ADHD brain.
**Runs entirely on your computer. No accounts. No cloud. No internet required.**

---

## Quick Start (5 minutes)

### Prerequisites
- Node.js 20+ and pnpm (`npm i -g pnpm`)
- That's it.

### 1. Install
```bash
pnpm install
```

### 2. Set up the database
```bash
cp apps/web/.env.example apps/web/.env.local
# No edits needed — the default SQLite path works out of the box

cd packages/database
pnpm db:push    # Creates data/adhd-life.db
pnpm db:seed    # Seeds settings + 8 default life categories
cd ../..
```

### 3. Run
```bash
pnpm dev:web
# Open http://localhost:3000
# You'll see a one-time setup screen asking for your name, then the dashboard.
```

### Mobile (optional)
```bash
pnpm dev:mobile
# Scan QR with Expo Go — works fully offline with its own local SQLite DB
```

---

## What it does

| Feature | Status |
|---|---|
| Daily dashboard (focus tasks, habits, overdue) | Scaffolded — ready to build |
| Brain dump inbox (type fast, sort later) | API done |
| 8 life categories (Work, School, Health…) | Seeded |
| Task detail (subtasks, due date, recurrence, priority) | API done |
| Habit tracking with forgiving streaks | API done |
| Reading tracker | API done |
| First-run setup (no login) | Done |
| Weekly review | Phase 7 |
| Dark mode | Phase 7 |
| PWA (installable) | Phase 7 |

---

## How your data is stored

Everything lives in a single SQLite file at `data/adhd-life.db` in this folder.
It's gitignored, so it stays on your machine.

**To back up:** Copy `data/adhd-life.db` anywhere you want.  
**To restore:** Put it back.  
**To move to a new machine:** Copy the file over.

---

## Project layout

```
adhd-life/
├── apps/
│   ├── web/          Next.js 14 — the main desktop app
│   └── mobile/       Expo — the mobile companion (offline SQLite)
├── packages/
│   ├── database/     Prisma schema + seed script
│   └── types/        Shared TypeScript types
├── data/             SQLite database lives here (gitignored)
└── CLAUDE.md         Full context for Claude Code sessions
```

---

## Useful commands

```bash
pnpm dev:web               # Start web app
pnpm dev:mobile            # Start mobile (Expo)
pnpm typecheck             # TypeScript check

cd packages/database
pnpm db:push               # Apply schema changes to DB (no migration file)
pnpm db:migrate            # Create a named migration
pnpm db:studio             # Prisma Studio — visual DB browser
pnpm db:seed               # Re-seed default data (safe to re-run)
```

---

## Working with Claude Code

Open Claude Code from the project root and it will automatically read `CLAUDE.md`
for full context on architecture, build order, design principles, and API routes.

```bash
cd adhd-life
claude
```

---

*Built for the love of my life. 💜*
