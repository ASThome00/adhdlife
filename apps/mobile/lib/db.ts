// apps/mobile/lib/db.ts
// Local SQLite database for the Expo mobile app.
// Uses expo-sqlite — fully offline, no network needed.
// Schema mirrors the web Prisma schema (same tables, same columns).

import * as SQLite from 'expo-sqlite'

let _db: SQLite.SQLiteDatabase | null = null

export function getDb(): SQLite.SQLiteDatabase {
  if (!_db) {
    _db = SQLite.openDatabaseSync('adhd-life.db')
    initSchema(_db)
  }
  return _db
}

function initSchema(db: SQLite.SQLiteDatabase) {
  db.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY DEFAULT '1',
      display_name TEXT DEFAULT 'friend',
      theme TEXT DEFAULT 'light',
      daily_focus_limit INTEGER DEFAULT 5,
      setup_complete INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      icon TEXT,
      sort_order INTEGER DEFAULT 0,
      is_archived INTEGER DEFAULT 0,
      is_default INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
      parent_task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      notes TEXT,
      due_date TEXT,
      due_time TEXT,
      priority TEXT DEFAULT 'MEDIUM',
      status TEXT DEFAULT 'INBOX',
      time_estimate_min INTEGER,
      snoozed_until TEXT,
      is_focus_today INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#10B981',
      target_frequency INTEGER DEFAULT 1,
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      is_archived INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      completed INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(habit_id, date)
    );

    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT,
      genre TEXT,
      total_pages INTEGER,
      current_page INTEGER DEFAULT 0,
      status TEXT DEFAULT 'TO_READ',
      rating INTEGER,
      notes TEXT,
      started_at TEXT,
      finished_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `)

  // Seed default categories if empty
  const count = db.getFirstSync<{ c: number }>('SELECT COUNT(*) as c FROM categories')
  if ((count?.c ?? 0) === 0) {
    const defaults = [
      { name: 'Work',              color: '#3B82F6', icon: '💼' },
      { name: 'School',            color: '#8B5CF6', icon: '📚' },
      { name: 'Healthcare',        color: '#EF4444', icon: '🏥' },
      { name: 'Utilities / Admin', color: '#F59E0B', icon: '🧾' },
      { name: 'Self-Improvement',  color: '#10B981', icon: '🌱' },
      { name: 'Reading Goals',     color: '#EC4899', icon: '📖' },
      { name: 'Social / Family',   color: '#F97316', icon: '👨‍👩‍👧' },
      { name: 'Home / Chores',     color: '#6B7280', icon: '🏠' },
    ]
    defaults.forEach((cat, i) => {
      db.runSync(
        'INSERT INTO categories (id, name, color, icon, sort_order, is_default) VALUES (?, ?, ?, ?, ?, 1)',
        [`cat_${i}`, cat.name, cat.color, cat.icon, i]
      )
    })
  }
}

// ─── QUERY HELPERS ────────────────────────────────────────────────────────────

export function getTodayTasks() {
  const db = getDb()
  const today = new Date().toISOString().split('T')[0]
  return db.getAllSync<any>(`
    SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
    FROM tasks t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE (t.is_focus_today = 1 OR DATE(t.due_date) = ?)
      AND t.status NOT IN ('DONE', 'DROPPED')
    ORDER BY t.is_focus_today DESC, t.priority DESC, t.due_date ASC
  `, [today])
}

export function getHabitsWithTodayStatus() {
  const db = getDb()
  const today = new Date().toISOString().split('T')[0]
  return db.getAllSync<any>(`
    SELECT h.*, 
           COALESCE(hl.completed, 0) as completed_today
    FROM habits h
    LEFT JOIN habit_logs hl ON hl.habit_id = h.id AND DATE(hl.date) = ?
    WHERE h.is_archived = 0
    ORDER BY h.sort_order ASC
  `, [today])
}
