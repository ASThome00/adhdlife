// apps/desktop/src/lib/queries/tasks.ts
import { select, selectOne, execute, startOfTodaySql, endOfTodaySql, todayDateStr, toSqlDate } from '@/lib/db'
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
    ORDER BY t.is_focus_today DESC, t.priority DESC, t.due_date ASC, t.created_at ASC
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

  const [focusTasks, overdueTasks, upcomingToday, habits, completedCount] = await Promise.all([
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
      ORDER BY t.priority DESC, t.due_date ASC
    `, [todayStart, todayEnd]),
    select<any>(`
      SELECT h.*, COALESCE(hl.completed, 0) AS completed_today
      FROM habits h
      LEFT JOIN habit_logs hl ON hl.habit_id = h.id AND hl.date = ?
      WHERE h.is_archived = 0
      ORDER BY h.sort_order ASC
    `, [today]),
    selectOne<{ c: number }>(
      `SELECT COUNT(*) as c FROM tasks WHERE completed_at >= ? AND completed_at <= ? AND status = 'DONE'`,
      [todayStart, todayEnd]
    ),
  ])

  return {
    focusTasks:          focusTasks.map(normalizeTask),
    overdueTasks:        overdueTasks.map(normalizeTask),
    upcomingToday:       upcomingToday.map(normalizeTask),
    habits:              habits.map(h => ({ ...h, completed_today: Boolean(h.completed_today) })),
    completedToday:      completedCount?.c ?? 0,
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

// ─── NORMALIZATION ────────────────────────────────────────────────────────────

function normalizeTask(row: any): Task {
  return {
    ...row,
    is_focus_today: Boolean(row.is_focus_today),
  }
}
