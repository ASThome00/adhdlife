-- Migration 001: Initial schema
-- Runs automatically via tauri-plugin-sql on first app launch.
-- Re-running is safe (all statements use IF NOT EXISTS).

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ─── SETTINGS (singleton) ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS settings (
  id                    TEXT    PRIMARY KEY DEFAULT '1',
  display_name          TEXT    NOT NULL DEFAULT 'friend',
  theme                 TEXT    NOT NULL DEFAULT 'system',  -- 'light' | 'dark' | 'system'
  daily_focus_limit     INTEGER NOT NULL DEFAULT 5,
  notifications_enabled INTEGER NOT NULL DEFAULT 0,
  setup_complete        INTEGER NOT NULL DEFAULT 0
);

-- Ensure the singleton row always exists
INSERT OR IGNORE INTO settings (id) VALUES ('1');

-- ─── CATEGORIES ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  id          TEXT    PRIMARY KEY,
  name        TEXT    NOT NULL,
  color       TEXT    NOT NULL DEFAULT '#8B5CF6',
  icon        TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_archived INTEGER NOT NULL DEFAULT 0,
  is_default  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Seed 8 default categories (only if table is empty)
INSERT OR IGNORE INTO categories (id, name, color, icon, sort_order, is_default) VALUES
  ('cat_work',    'Work',              '#3B82F6', '💼', 0, 1),
  ('cat_school',  'School',            '#8B5CF6', '📚', 1, 1),
  ('cat_health',  'Healthcare',        '#EF4444', '🏥', 2, 1),
  ('cat_admin',   'Utilities / Admin', '#F59E0B', '🧾', 3, 1),
  ('cat_growth',  'Self-Improvement',  '#10B981', '🌱', 4, 1),
  ('cat_reading', 'Reading Goals',     '#EC4899', '📖', 5, 1),
  ('cat_social',  'Social / Family',   '#F97316', '👨‍👩‍👧', 6, 1),
  ('cat_home',    'Home / Chores',     '#6B7280', '🏠', 7, 1);

-- ─── TASKS ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tasks (
  id               TEXT    PRIMARY KEY,
  category_id      TEXT    REFERENCES categories(id) ON DELETE SET NULL,
  parent_task_id   TEXT    REFERENCES tasks(id) ON DELETE CASCADE,
  title            TEXT    NOT NULL,
  notes            TEXT,
  due_date         TEXT,                    -- ISO datetime string
  due_time         TEXT,                    -- HH:MM
  priority         TEXT    NOT NULL DEFAULT 'MEDIUM', -- LOW | MEDIUM | HIGH
  status           TEXT    NOT NULL DEFAULT 'INBOX',  -- INBOX | ACTIVE | DONE | SNOOZED | DROPPED
  time_estimate_min INTEGER,
  snoozed_until    TEXT,
  is_focus_today   INTEGER NOT NULL DEFAULT 0,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  completed_at     TEXT
);

CREATE INDEX IF NOT EXISTS idx_tasks_status       ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date     ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_category     ON tasks(category_id);
CREATE INDEX IF NOT EXISTS idx_tasks_focus        ON tasks(is_focus_today);
CREATE INDEX IF NOT EXISTS idx_tasks_parent       ON tasks(parent_task_id);

-- ─── RECURRENCE ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS recurrences (
  id           TEXT PRIMARY KEY,
  task_id      TEXT NOT NULL UNIQUE REFERENCES tasks(id) ON DELETE CASCADE,
  frequency    TEXT NOT NULL,  -- DAILY | WEEKLY | BIWEEKLY | MONTHLY | YEARLY
  interval_val INTEGER NOT NULL DEFAULT 1,
  days_of_week TEXT,           -- JSON array e.g. '[1,3,5]' for Mon/Wed/Fri
  end_date     TEXT,
  last_spawn_at TEXT
);

-- ─── TAGS ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tags (
  id    TEXT PRIMARY KEY,
  label TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS task_tags (
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id  TEXT NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);

-- ─── HABITS ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS habits (
  id               TEXT    PRIMARY KEY,
  name             TEXT    NOT NULL,
  color            TEXT    NOT NULL DEFAULT '#10B981',
  target_frequency INTEGER NOT NULL DEFAULT 1,
  current_streak   INTEGER NOT NULL DEFAULT 0,
  longest_streak   INTEGER NOT NULL DEFAULT 0,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  is_archived      INTEGER NOT NULL DEFAULT 0,
  created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS habit_logs (
  id         TEXT    PRIMARY KEY,
  habit_id   TEXT    NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date       TEXT    NOT NULL,  -- YYYY-MM-DD
  completed  INTEGER NOT NULL DEFAULT 1,
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE(habit_id, date)
);

CREATE INDEX IF NOT EXISTS idx_habit_logs_habit ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date  ON habit_logs(date);

-- ─── FOCUS DAYS ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS focus_days (
  id         TEXT PRIMARY KEY,
  date       TEXT NOT NULL UNIQUE,  -- YYYY-MM-DD
  task_ids   TEXT NOT NULL,         -- JSON array of task IDs in order
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── BOOKS ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS books (
  id           TEXT    PRIMARY KEY,
  title        TEXT    NOT NULL,
  author       TEXT,
  genre        TEXT,
  total_pages  INTEGER,
  current_page INTEGER NOT NULL DEFAULT 0,
  status       TEXT    NOT NULL DEFAULT 'TO_READ',  -- TO_READ | READING | FINISHED | ABANDONED
  rating       INTEGER,   -- 1–5
  notes        TEXT,
  cover_url    TEXT,
  started_at   TEXT,
  finished_at  TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
