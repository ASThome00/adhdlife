// apps/mobile/lib/db.ts
// Local SQLite database for the Expo mobile app.
// Uses expo-sqlite — fully offline, no network needed.
// Schema and seed rows mirror the desktop app (apps/desktop/src-tauri/migrations/).
// Desktop and mobile stay separate databases on purpose — no sync in MVP.

import * as SQLite from 'expo-sqlite'

let _db: SQLite.SQLiteDatabase | null = null

export function getDb(): SQLite.SQLiteDatabase {
  if (!_db) {
    _db = SQLite.openDatabaseSync('adhd-life.db')
    initSchema(_db)
  }
  return _db
}

// ─── DATE HELPERS ─────────────────────────────────────────────────────────────
// Day-keyed data (habit_logs.date, task date grouping) uses LOCAL dates —
// UTC day keys made evening habit check-ins land on tomorrow. Same rule as
// desktop's lib/db.ts. Never use toISOString().split('T')[0] for a day key.

export function localDateStr(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function todayDateStr(): string {
  return localDateStr(new Date())
}

/** 'YYYY-MM-DD HH:MM:SS' local — pair with SQLite datetime(?, 'utc') to compare
 *  against datetime('now') columns (which store UTC with a space separator). */
export function localNaiveDateTime(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

function startOfTodayNaive(): string {
  return localNaiveDateTime(new Date(new Date().setHours(0, 0, 0, 0)))
}

/** Local calendar day of a stored ISO datetime, or null. */
export function dueDayStr(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null
  return localDateStr(new Date(dateStr))
}

export function randomId(): string {
  // Hermes has no crypto.randomUUID; this matches desktop's 24-char format.
  let id = ''
  while (id.length < 24) id += Math.random().toString(36).slice(2)
  return id.slice(0, 24)
}

// ─── SCHEMA ───────────────────────────────────────────────────────────────────

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

  migrateLegacyCategoryIds(db)

  // Seed default categories if empty — same ids/rows as desktop 001_initial.sql.
  // UI colors come from theme.ts keyed by these ids, not the DB hex.
  const count = db.getFirstSync<{ c: number }>('SELECT COUNT(*) as c FROM categories')
  if ((count?.c ?? 0) === 0) {
    const defaults: Array<[string, string, string, string]> = [
      ['cat_work',    'Work',              '#3B82F6', '💼'],
      ['cat_school',  'School',            '#8B5CF6', '📚'],
      ['cat_health',  'Healthcare',        '#EF4444', '🏥'],
      ['cat_admin',   'Utilities / Admin', '#F59E0B', '🧾'],
      ['cat_growth',  'Self-Improvement',  '#10B981', '🌱'],
      ['cat_reading', 'Reading Goals',     '#EC4899', '📖'],
      ['cat_social',  'Social / Family',   '#F97316', '👨‍👩‍👧'],
      ['cat_home',    'Home / Chores',     '#6B7280', '🏠'],
    ]
    defaults.forEach(([id, name, color, icon], i) => {
      db.runSync(
        'INSERT INTO categories (id, name, color, icon, sort_order, is_default) VALUES (?, ?, ?, ?, ?, 1)',
        [id, name, color, icon, i]
      )
    })
  }

  // Settings singleton must exist for getSettings/updateSettings.
  db.runSync("INSERT OR IGNORE INTO settings (id) VALUES ('1')")
}

/** Early mobile builds seeded categories as cat_0…cat_7. Product decision
 *  (2026-07-13): align to desktop's cat_work…cat_home before any screens ship. */
function migrateLegacyCategoryIds(db: SQLite.SQLiteDatabase) {
  const legacy = db.getFirstSync<{ c: number }>("SELECT COUNT(*) as c FROM categories WHERE id = 'cat_0'")
  if ((legacy?.c ?? 0) === 0) return
  const idMap: Array<[string, string]> = [
    ['cat_0', 'cat_work'], ['cat_1', 'cat_school'], ['cat_2', 'cat_health'],
    ['cat_3', 'cat_admin'], ['cat_4', 'cat_growth'], ['cat_5', 'cat_reading'],
    ['cat_6', 'cat_social'], ['cat_7', 'cat_home'],
  ]
  // FK enforcement blocks renaming either side first; the rename is only
  // consistent once both tables have moved, so switch checks off around it.
  db.execSync('PRAGMA foreign_keys = OFF')
  db.withTransactionSync(() => {
    for (const [oldId, newId] of idMap) {
      db.runSync('UPDATE categories SET id = ? WHERE id = ?', [newId, oldId])
      db.runSync('UPDATE tasks SET category_id = ? WHERE category_id = ?', [newId, oldId])
    }
  })
  db.execSync('PRAGMA foreign_keys = ON')
}

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type Priority   = 'LOW' | 'MEDIUM' | 'HIGH'
export type TaskStatus = 'INBOX' | 'ACTIVE' | 'DONE' | 'SNOOZED' | 'DROPPED'
export type BookStatus = 'TO_READ' | 'READING' | 'FINISHED' | 'ABANDONED' | 'REMOVED'

export interface Task {
  id: string
  category_id: string | null
  title: string
  notes: string | null
  due_date: string | null
  due_time: string | null
  priority: Priority
  status: TaskStatus
  snoozed_until: string | null
  is_focus_today: boolean
  created_at: string
  completed_at: string | null
  category_name?: string | null
  category_color?: string | null
}

export interface Category {
  id: string
  name: string
  color: string
  sort_order: number
}

export interface Habit {
  id: string
  name: string
  color: string
  current_streak: number
  longest_streak: number
  sort_order: number
  completed_today: boolean
}

export interface HabitLogEntry {
  habit_id: string
  date: string   // YYYY-MM-DD local
  completed: boolean
}

export interface Book {
  id: string
  title: string
  author: string | null
  total_pages: number | null
  current_page: number
  status: BookStatus
  rating: number | null
  notes: string | null
}

export interface Settings {
  display_name: string
  theme: 'light' | 'dark'
  daily_focus_limit: number
}

function normalizeTask(row: any): Task {
  return { ...row, is_focus_today: Boolean(row.is_focus_today) }
}

const TASK_SELECT = `
  SELECT t.*, c.name AS category_name, c.color AS category_color
  FROM tasks t LEFT JOIN categories c ON t.category_id = c.id
`

// ─── HOUSEKEEPING ─────────────────────────────────────────────────────────────

/** App-open pass: wake snoozes whose time has come. Mirrors the relevant slice
 *  of desktop's runDailyHousekeeping. Call once from the root layout. */
export function runHousekeeping() {
  const db = getDb()
  db.runSync(
    `UPDATE tasks SET status = 'ACTIVE', snoozed_until = NULL, updated_at = datetime('now')
     WHERE status = 'SNOOZED' AND snoozed_until IS NOT NULL AND snoozed_until <= ?`,
    [new Date().toISOString()]
  )
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────

export function getSettings(): Settings {
  const db = getDb()
  const row = db.getFirstSync<any>("SELECT * FROM settings WHERE id = '1'")
  return {
    display_name: row?.display_name ?? 'friend',
    theme: row?.theme === 'dark' ? 'dark' : 'light',
    daily_focus_limit: row?.daily_focus_limit ?? 5,
  }
}

export function updateSettings(data: Partial<Settings>) {
  const db = getDb()
  if (data.display_name !== undefined) db.runSync("UPDATE settings SET display_name = ? WHERE id = '1'", [data.display_name])
  if (data.theme !== undefined) db.runSync("UPDATE settings SET theme = ? WHERE id = '1'", [data.theme])
  if (data.daily_focus_limit !== undefined) db.runSync("UPDATE settings SET daily_focus_limit = ? WHERE id = '1'", [data.daily_focus_limit])
}

// ─── CATEGORIES ───────────────────────────────────────────────────────────────

export function getCategories(): Category[] {
  const db = getDb()
  return db.getAllSync<Category>(
    'SELECT id, name, color, sort_order FROM categories WHERE is_archived = 0 ORDER BY sort_order ASC'
  )
}

// ─── TASKS ────────────────────────────────────────────────────────────────────

export interface TodayData {
  focusTasks: Task[]
  alsoToday: Task[]
  doneToday: number
}

export function getTodayData(): TodayData {
  const db = getDb()
  const today = todayDateStr()

  const focusTasks = db.getAllSync<any>(`
    ${TASK_SELECT}
    WHERE t.is_focus_today = 1 AND t.status NOT IN ('DONE','DROPPED') AND t.parent_task_id IS NULL
    ORDER BY t.sort_order ASC, t.created_at ASC
  `).map(normalizeTask)

  // Due today (or overdue) but not already in focus — the quiet roll-forward:
  // missed tasks just appear under "Also today", never as a red counter.
  const alsoToday = db.getAllSync<any>(`
    ${TASK_SELECT}
    WHERE t.is_focus_today = 0
      AND t.due_date IS NOT NULL
      AND t.status NOT IN ('DONE','DROPPED','SNOOZED','INBOX')
      AND t.parent_task_id IS NULL
    ORDER BY CASE t.priority WHEN 'HIGH' THEN 0 WHEN 'MEDIUM' THEN 1 ELSE 2 END, t.due_date ASC
  `).map(normalizeTask).filter(t => {
    const d = dueDayStr(t.due_date)
    return d !== null && d <= today
  })

  const done = db.getFirstSync<{ c: number }>(
    `SELECT COUNT(*) as c FROM tasks
     WHERE status = 'DONE' AND completed_at IS NOT NULL
       AND datetime(completed_at) >= datetime(?, 'utc')`,
    [startOfTodayNaive()]
  )

  return { focusTasks, alsoToday, doneToday: done?.c ?? 0 }
}

export function getInboxTasks(): Task[] {
  const db = getDb()
  return db.getAllSync<any>(`
    ${TASK_SELECT}
    WHERE t.status = 'INBOX' AND t.parent_task_id IS NULL
    ORDER BY t.created_at DESC
  `).map(normalizeTask)
}

/** Everything alive for the Tasks tab (grouping into sections happens in JS
 *  with LOCAL day keys — see groupTasks in lib/utils.ts). */
export function getActiveTasks(categoryId?: string | null): Task[] {
  const db = getDb()
  const where = categoryId ? 'AND t.category_id = ?' : ''
  return db.getAllSync<any>(`
    ${TASK_SELECT}
    WHERE t.status = 'ACTIVE' AND t.parent_task_id IS NULL ${where}
    ORDER BY CASE t.priority WHEN 'HIGH' THEN 0 WHEN 'MEDIUM' THEN 1 ELSE 2 END,
             t.due_date ASC, t.created_at ASC
  `, categoryId ? [categoryId] : []).map(normalizeTask)
}

export function createTask(input: {
  title: string
  category_id?: string | null
  due_date?: string | null
  priority?: Priority
  is_focus_today?: boolean
  status?: TaskStatus
}): string {
  const db = getDb()
  const id = randomId()
  // Default rule (desktop parity): categorized → ACTIVE, else INBOX. The Today
  // quick-add passes status ACTIVE explicitly so the task doesn't vanish into
  // the inbox right after she added it for today.
  const status = input.status ?? (input.category_id ? 'ACTIVE' : 'INBOX')
  db.runSync(`
    INSERT INTO tasks (id, title, category_id, due_date, priority, status, is_focus_today, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `, [
    id, input.title, input.category_id ?? null, input.due_date ?? null,
    input.priority ?? 'MEDIUM', status, input.is_focus_today ? 1 : 0,
  ])
  return id
}

export function brainDump(rawText: string): number {
  const lines = rawText.split(/\n+/).map(l => l.trim()).filter(Boolean)
  for (const title of lines) createTask({ title })
  return lines.length
}

export function assignTaskCategory(id: string, categoryId: string) {
  const db = getDb()
  db.runSync(`
    UPDATE tasks SET category_id = ?, updated_at = datetime('now'),
      status = CASE WHEN status = 'INBOX' THEN 'ACTIVE' ELSE status END
    WHERE id = ?
  `, [categoryId, id])
}

export function completeTask(id: string) {
  const db = getDb()
  db.runSync(
    "UPDATE tasks SET status = 'DONE', completed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?",
    [id]
  )
}

export function reopenTask(id: string, status: TaskStatus = 'ACTIVE') {
  const db = getDb()
  db.runSync(
    "UPDATE tasks SET status = ?, completed_at = NULL, snoozed_until = NULL, updated_at = datetime('now') WHERE id = ?",
    [status, id]
  )
}

export function snoozeTask(id: string, days: number) {
  const db = getDb()
  const until = new Date()
  until.setDate(until.getDate() + days)
  until.setHours(8, 0, 0, 0)
  db.runSync(
    "UPDATE tasks SET status = 'SNOOZED', snoozed_until = ?, updated_at = datetime('now') WHERE id = ?",
    [until.toISOString(), id]
  )
}

export function dropTask(id: string) {
  const db = getDb()
  db.runSync("UPDATE tasks SET status = 'DROPPED', updated_at = datetime('now') WHERE id = ?", [id])
}

// ─── HABITS ───────────────────────────────────────────────────────────────────

export function getHabits(): Habit[] {
  const db = getDb()
  const today = todayDateStr()
  return db.getAllSync<any>(`
    SELECT h.*, COALESCE(hl.completed, 0) AS completed_today
    FROM habits h
    LEFT JOIN habit_logs hl ON hl.habit_id = h.id AND hl.date = ?
    WHERE h.is_archived = 0
    ORDER BY h.sort_order ASC
  `, [today]).map(h => ({ ...h, completed_today: Boolean(h.completed_today) }))
}

export function toggleHabitToday(habitId: string, completed: boolean) {
  const db = getDb()
  const today = todayDateStr()

  db.runSync(`
    INSERT INTO habit_logs (id, habit_id, date, completed)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(habit_id, date) DO UPDATE SET completed = excluded.completed
  `, [randomId(), habitId, today, completed ? 1 : 0])

  // Recalculate streak walking backwards from today (desktop parity).
  // Forgiving by design: a missed day just ends the count quietly.
  let streak = 0
  const checkDate = new Date()
  while (true) {
    const log = db.getFirstSync<{ completed: number }>(
      'SELECT completed FROM habit_logs WHERE habit_id = ? AND date = ?',
      [habitId, localDateStr(checkDate)]
    )
    if (!log?.completed) break
    streak++
    checkDate.setDate(checkDate.getDate() - 1)
  }

  db.runSync(
    "UPDATE habits SET current_streak = ?, longest_streak = MAX(longest_streak, ?), updated_at = datetime('now') WHERE id = ?",
    [streak, streak, habitId]
  )
}

export function createHabit(name: string, color: string): string {
  const db = getDb()
  const id = randomId()
  const max = db.getFirstSync<{ m: number }>('SELECT MAX(sort_order) as m FROM habits')
  db.runSync('INSERT INTO habits (id, name, color, sort_order) VALUES (?, ?, ?, ?)', [
    id, name, color, (max?.m ?? -1) + 1,
  ])
  return id
}

/** All habit logs for the last `days` days (one query, not N). Local day keys. */
export function getHabitHistory(days = 30): HabitLogEntry[] {
  const db = getDb()
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - (days - 1))
  return db.getAllSync<any>(
    'SELECT habit_id, date, completed FROM habit_logs WHERE date >= ? ORDER BY date ASC',
    [localDateStr(cutoff)]
  ).map(r => ({ ...r, completed: Boolean(r.completed) }))
}

// ─── BOOKS ────────────────────────────────────────────────────────────────────

export function getBooks(): Book[] {
  const db = getDb()
  return db.getAllSync<Book>(
    "SELECT * FROM books WHERE status != 'REMOVED' ORDER BY updated_at DESC"
  )
}

export function createBook(data: { title: string; author?: string | null; total_pages?: number | null }): string {
  const db = getDb()
  const id = randomId()
  db.runSync('INSERT INTO books (id, title, author, total_pages) VALUES (?, ?, ?, ?)', [
    id, data.title, data.author ?? null, data.total_pages ?? null,
  ])
  return id
}

export function updateBook(id: string, data: Partial<Omit<Book, 'id'>> & { started_at?: string | null; finished_at?: string | null }) {
  const db = getDb()
  const fields: string[] = ["updated_at = datetime('now')"]
  const values: (string | number | null)[] = []
  const cols = ['title', 'author', 'total_pages', 'current_page', 'status', 'rating', 'notes', 'started_at', 'finished_at'] as const
  for (const col of cols) {
    if ((data as any)[col] !== undefined) { fields.push(`${col} = ?`); values.push((data as any)[col]) }
  }
  values.push(id)
  db.runSync(`UPDATE books SET ${fields.join(', ')} WHERE id = ?`, values)
}
