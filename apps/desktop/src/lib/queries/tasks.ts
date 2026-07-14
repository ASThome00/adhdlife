// apps/desktop/src/lib/queries/tasks.ts
import { select, selectOne, execute, startOfTodaySql, endOfTodaySql, todayDateStr, toSqlDate, localDateStr, localNaiveDateTime } from '@/lib/db'
import { randomId } from '@/lib/utils'

export type Priority  = 'LOW' | 'MEDIUM' | 'HIGH'
export type TaskStatus = 'INBOX' | 'ACTIVE' | 'DONE' | 'SNOOZED' | 'DROPPED'

export interface Task {
  id:               string
  category_id:      string | null
  parent_task_id:   string | null
  title:            string
  notes:            string | null
  due_date:         string | null
  due_time:         string | null
  priority:         Priority
  status:           TaskStatus
  time_estimate_min: number | null
  snoozed_until:    string | null
  is_focus_today:   boolean
  sort_order:       number
  created_at:       string
  updated_at:       string
  completed_at:     string | null
  // Joined from categories:
  category_name?:   string | null
  category_color?:  string | null
  category_icon?:   string | null
}

export interface CreateTaskInput {
  title:            string
  category_id?:     string
  notes?:           string
  due_date?:        Date | string
  due_time?:        string
  priority?:        Priority
  time_estimate_min?: number
  parent_task_id?:  string
  is_focus_today?:  boolean
}

// ─── READS ────────────────────────────────────────────────────────────────────

export async function getTasks(filters?: {
  status?:      TaskStatus
  category_id?: string
  focus_only?:  boolean
  parent_id?:   string | null
}): Promise<Task[]> {
  const conditions = ['t.parent_task_id IS NULL']
  const args: unknown[] = []

  if (filters?.status)      { conditions.push('t.status = ?');       args.push(filters.status) }
  if (filters?.category_id) { conditions.push('t.category_id = ?');  args.push(filters.category_id) }
  if (filters?.focus_only)  { conditions.push('t.is_focus_today = 1') }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  return select<Task>(`
    SELECT t.*,
           c.name  AS category_name,
           c.color AS category_color,
           c.icon  AS category_icon
    FROM tasks t
    LEFT JOIN categories c ON t.category_id = c.id
    ${where}
    ORDER BY t.is_focus_today DESC,
             CASE t.priority WHEN 'HIGH' THEN 0 WHEN 'MEDIUM' THEN 1 ELSE 2 END,
             t.due_date ASC, t.created_at ASC
  `, args).then(rows => rows.map(normalizeTask))
}

export async function getTask(id: string): Promise<Task | null> {
  const row = await selectOne<any>(`
    SELECT t.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
    FROM tasks t LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.id = ?
  `, [id])
  return row ? normalizeTask(row) : null
}

export async function getSubtasks(parentId: string): Promise<Task[]> {
  return select<Task>(
    'SELECT * FROM tasks WHERE parent_task_id = ? ORDER BY sort_order ASC',
    [parentId]
  ).then(rows => rows.map(normalizeTask))
}

export async function getDashboardData() {
  const todayStart = startOfTodaySql()
  const todayEnd   = endOfTodaySql()
  const today      = todayDateStr()

  const [focusTasks, overdueTasks, upcomingToday, habits, completedCount, focusDoneCount] = await Promise.all([
    select<Task>(`
      SELECT t.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
      FROM tasks t LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.is_focus_today = 1 AND t.status != 'DONE' AND t.parent_task_id IS NULL
      ORDER BY t.sort_order ASC LIMIT 5
    `),
    select<Task>(`
      SELECT t.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
      FROM tasks t LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.due_date < ? AND t.status NOT IN ('DONE','DROPPED','SNOOZED') AND t.parent_task_id IS NULL
      ORDER BY t.due_date ASC LIMIT 20
    `, [todayStart]),
    select<Task>(`
      SELECT t.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
      FROM tasks t LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.is_focus_today = 0
        AND t.due_date >= ? AND t.due_date <= ?
        AND t.status NOT IN ('DONE','DROPPED') AND t.parent_task_id IS NULL
      ORDER BY CASE t.priority WHEN 'HIGH' THEN 0 WHEN 'MEDIUM' THEN 1 ELSE 2 END, t.due_date ASC
    `, [todayStart, todayEnd]),
    select<any>(`
      SELECT h.*, COALESCE(hl.completed, 0) AS completed_today
      FROM habits h
      LEFT JOIN habit_logs hl ON hl.habit_id = h.id AND hl.date = ?
      WHERE h.is_archived = 0
      ORDER BY h.sort_order ASC
    `, [today]),
    // NB: completed_at is written by SQLite as 'YYYY-MM-DD HH:MM:SS' (UTC, space
    // separator) while our JS helpers produce 'YYYY-MM-DDTHH:MM:SS.sssZ'. Raw
    // string comparison between the two formats is wrong (' ' sorts before 'T'),
    // so normalize both sides through datetime(). datetime(?, 'utc') converts
    // the local-midnight param to the UTC instant SQLite stored.
    selectOne<{ c: number }>(
      `SELECT COUNT(*) as c FROM tasks
       WHERE status = 'DONE' AND completed_at IS NOT NULL
         AND datetime(completed_at) >= datetime(?, 'utc')`,
      [localNaiveDateTime(new Date(new Date().setHours(0, 0, 0, 0)))]
    ),
    // Focus-card ratio: only focus tasks completed today (completedToday above
    // counts everything and feeds the topbar).
    selectOne<{ c: number }>(
      `SELECT COUNT(*) as c FROM tasks
       WHERE is_focus_today = 1 AND status = 'DONE' AND completed_at IS NOT NULL
         AND datetime(completed_at) >= datetime(?, 'utc')`,
      [localNaiveDateTime(new Date(new Date().setHours(0, 0, 0, 0)))]
    ),
  ])

  return {
    focusTasks:          focusTasks.map(normalizeTask),
    overdueTasks:        overdueTasks.map(normalizeTask),
    upcomingToday:       upcomingToday.map(normalizeTask),
    habits:              habits.map(h => ({ ...h, completed_today: Boolean(h.completed_today) })),
    completedToday:      completedCount?.c ?? 0,
    completedFocusToday: focusDoneCount?.c ?? 0,
    totalScheduledToday: focusTasks.length + upcomingToday.length,
  }
}

// ─── WRITES ───────────────────────────────────────────────────────────────────

export async function createTask(input: CreateTaskInput): Promise<string> {
  const id     = randomId()
  const status = input.category_id ? 'ACTIVE' : 'INBOX'

  await execute(`
    INSERT INTO tasks (id, title, notes, category_id, parent_task_id, due_date, due_time,
                       priority, status, time_estimate_min, is_focus_today, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `, [
    id,
    input.title,
    input.notes          ?? null,
    input.category_id    ?? null,
    input.parent_task_id ?? null,
    input.due_date       ? toSqlDate(input.due_date as any) : null,
    input.due_time       ?? null,
    input.priority       ?? 'MEDIUM',
    status,
    input.time_estimate_min ?? null,
    input.is_focus_today ? 1 : 0,
  ])

  return id
}

export async function brainDump(rawText: string): Promise<number> {
  const lines = rawText.split(/\n+/).map(l => l.trim()).filter(Boolean)
  for (const title of lines) {
    await createTask({ title })
  }
  return lines.length
}

export async function updateTask(id: string, data: Partial<{
  title:            string
  notes:            string | null
  category_id:      string | null
  due_date:         string | null
  due_time:         string | null
  priority:         Priority
  status:           TaskStatus
  is_focus_today:   boolean
  snoozed_until:    string | null
  time_estimate_min: number | null
}>) {
  const fields: string[] = ['updated_at = datetime(\'now\')']
  const values: unknown[] = []

  if (data.title            !== undefined) { fields.push('title = ?');             values.push(data.title) }
  if (data.notes            !== undefined) { fields.push('notes = ?');             values.push(data.notes) }
  if (data.category_id      !== undefined) { fields.push('category_id = ?');      values.push(data.category_id) }
  if (data.due_date         !== undefined) { fields.push('due_date = ?');         values.push(data.due_date) }
  if (data.due_time         !== undefined) { fields.push('due_time = ?');         values.push(data.due_time) }
  if (data.priority         !== undefined) { fields.push('priority = ?');         values.push(data.priority) }
  if (data.is_focus_today   !== undefined) { fields.push('is_focus_today = ?');   values.push(data.is_focus_today ? 1 : 0) }
  if (data.snoozed_until    !== undefined) { fields.push('snoozed_until = ?');    values.push(data.snoozed_until) }
  if (data.time_estimate_min !== undefined){ fields.push('time_estimate_min = ?');values.push(data.time_estimate_min) }

  if (data.status !== undefined) {
    fields.push('status = ?')
    values.push(data.status)
    if (data.status === 'DONE') {
      fields.push("completed_at = datetime('now')")
    } else {
      fields.push('completed_at = NULL')
    }
  }

  // INBOX → ACTIVE when a category is assigned
  if (data.category_id) {
    fields.push("status = CASE WHEN status = 'INBOX' THEN 'ACTIVE' ELSE status END")
  }

  values.push(id)
  await execute(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, values)
}

export async function dropTask(id: string) {
  await updateTask(id, { status: 'DROPPED' })
}

// ─── RECURRENCE ───────────────────────────────────────────────────────────────

export interface Recurrence {
  id:           string
  task_id:      string
  frequency:    'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'YEARLY'
  interval_val: number
}

export async function getRecurrence(taskId: string): Promise<Recurrence | null> {
  return selectOne<Recurrence>('SELECT * FROM recurrences WHERE task_id = ?', [taskId])
}

export async function setRecurrence(
  taskId: string,
  frequency: Recurrence['frequency'] | null
): Promise<void> {
  if (frequency === null) {
    await execute('DELETE FROM recurrences WHERE task_id = ?', [taskId])
  } else {
    await execute(
      `INSERT OR REPLACE INTO recurrences (id, task_id, frequency, interval_val)
       VALUES (?, ?, ?, 1)`,
      [randomId(), taskId, frequency]
    )
  }
}

// ─── WEEKLY REVIEW ────────────────────────────────────────────────────────────

export interface WeeklyReviewData {
  weekStart:         string   // ISO — Monday 00:00 local
  weekEnd:           string   // ISO — Sunday 23:59 local
  completedThisWeek: number
  plannedThisWeek:   number
  inboxCleared:      number
  habitStats:        Array<{ id: string; name: string; color: string; doneDays: number; windowDays: number }>
  carriedOver:       Task[]
  categoryBreakdown: Array<{ category_id: string | null; name: string; count: number }>
}

export async function getWeeklyReviewData(): Promise<WeeklyReviewData> {
  const now = new Date()
  // Week = Monday..Sunday of the current week
  const weekStart = new Date(now)
  const dow = (now.getDay() + 6) % 7   // 0 = Monday
  weekStart.setDate(now.getDate() - dow)
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  const weekStartNaive = localNaiveDateTime(weekStart)
  const weekStartIso   = weekStart.toISOString()
  const weekEndIso     = weekEnd.toISOString()

  // Habit-log date keys follow todayDateStr() (UTC date), so build the
  // week-to-date window the same way for an apples-to-apples count.
  const windowDates: string[] = []
  for (let d = new Date(weekStart); d <= now; d.setDate(d.getDate() + 1)) {
    windowDates.push(localDateStr(d))
  }

  const [completed, planned, cleared, habitRows, carriedRows, catRows] = await Promise.all([
    selectOne<{ c: number }>(
      `SELECT COUNT(*) as c FROM tasks
       WHERE status = 'DONE' AND completed_at IS NOT NULL
         AND datetime(completed_at) >= datetime(?, 'utc')`,
      [weekStartNaive]
    ),
    selectOne<{ c: number }>(
      `SELECT COUNT(*) as c FROM tasks
       WHERE due_date >= ? AND due_date <= ? AND status != 'DROPPED' AND parent_task_id IS NULL`,
      [weekStartIso, weekEndIso]
    ),
    // "Brain dumps cleared" — approximation: tasks created this week that are
    // no longer sitting in the inbox. We don't keep status history, so tasks
    // created directly with a category count too; close enough for a
    // supportive weekly summary.
    selectOne<{ c: number }>(
      `SELECT COUNT(*) as c FROM tasks
       WHERE datetime(created_at) >= datetime(?, 'utc')
         AND status NOT IN ('INBOX', 'DROPPED') AND parent_task_id IS NULL`,
      [weekStartNaive]
    ),
    select<any>(
      `SELECT h.id, h.name, h.color, COUNT(hl.id) AS done_days
       FROM habits h
       LEFT JOIN habit_logs hl
         ON hl.habit_id = h.id AND hl.completed = 1 AND hl.date >= ?
       WHERE h.is_archived = 0
       GROUP BY h.id ORDER BY h.sort_order ASC`,
      [windowDates[0]]
    ),
    select<Task>(
      `SELECT t.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
       FROM tasks t LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.due_date IS NOT NULL AND t.due_date <= ?
         AND t.status IN ('ACTIVE', 'INBOX') AND t.parent_task_id IS NULL
       ORDER BY t.due_date ASC`,
      [weekEndIso]
    ),
    select<any>(
      `SELECT t.category_id, COALESCE(c.name, 'Uncategorized') AS name, COUNT(*) AS count
       FROM tasks t LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.status = 'DONE' AND t.completed_at IS NOT NULL
         AND datetime(t.completed_at) >= datetime(?, 'utc')
       GROUP BY t.category_id ORDER BY count DESC`,
      [weekStartNaive]
    ),
  ])

  return {
    weekStart:         weekStartIso,
    weekEnd:           weekEndIso,
    completedThisWeek: completed?.c ?? 0,
    plannedThisWeek:   planned?.c ?? 0,
    inboxCleared:      cleared?.c ?? 0,
    habitStats: habitRows.map(h => ({
      id: h.id, name: h.name, color: h.color,
      doneDays: h.done_days ?? 0, windowDays: windowDates.length,
    })),
    carriedOver:       carriedRows.map(normalizeTask),
    categoryBreakdown: catRows,
  }
}

// ─── NORMALIZATION ────────────────────────────────────────────────────────────

function normalizeTask(row: any): Task {
  return {
    ...row,
    is_focus_today: Boolean(row.is_focus_today),
  }
}
