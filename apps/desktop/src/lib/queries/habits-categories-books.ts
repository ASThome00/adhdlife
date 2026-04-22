// apps/desktop/src/lib/queries/habits.ts
import { select, selectOne, execute, todayDateStr } from '@/lib/db'
import { randomId } from '@/lib/utils'

export interface Habit {
  id:               string
  name:             string
  color:            string
  target_frequency: number
  current_streak:   number
  longest_streak:   number
  sort_order:       number
  is_archived:      boolean
  completed_today?: boolean
}

export async function getHabits(): Promise<Habit[]> {
  const today = todayDateStr()
  const rows = await select<any>(`
    SELECT h.*, COALESCE(hl.completed, 0) AS completed_today
    FROM habits h
    LEFT JOIN habit_logs hl ON hl.habit_id = h.id AND hl.date = ?
    WHERE h.is_archived = 0
    ORDER BY h.sort_order ASC
  `, [today])
  return rows.map(r => ({ ...r, is_archived: Boolean(r.is_archived), completed_today: Boolean(r.completed_today) }))
}

export async function createHabit(name: string, color = '#10B981'): Promise<string> {
  const id = randomId()
  const maxOrder = await selectOne<{ m: number }>('SELECT MAX(sort_order) as m FROM habits')
  await execute(
    'INSERT INTO habits (id, name, color, sort_order) VALUES (?, ?, ?, ?)',
    [id, name, color, (maxOrder?.m ?? -1) + 1]
  )
  return id
}

export async function toggleHabitToday(habitId: string, completed: boolean) {
  const today  = todayDateStr()
  const logId  = randomId()
  const habit  = await selectOne<Habit>('SELECT * FROM habits WHERE id = ?', [habitId])
  if (!habit) throw new Error('Habit not found')

  // Upsert today's log
  await execute(`
    INSERT INTO habit_logs (id, habit_id, date, completed)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(habit_id, date) DO UPDATE SET completed = excluded.completed
  `, [logId, habitId, today, completed ? 1 : 0])

  // Recalculate streak by walking backwards
  let streak = 0
  let checkDate = new Date()
  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0]
    const log = await selectOne<{ completed: number }>(
      'SELECT completed FROM habit_logs WHERE habit_id = ? AND date = ?',
      [habitId, dateStr]
    )
    if (!log?.completed) break
    streak++
    checkDate.setDate(checkDate.getDate() - 1)
  }

  await execute(
    'UPDATE habits SET current_streak = ?, longest_streak = MAX(longest_streak, ?), updated_at = datetime(\'now\') WHERE id = ?',
    [streak, streak, habitId]
  )
}

// ─── CATEGORIES ───────────────────────────────────────────────────────────────

export interface Category {
  id:         string
  name:       string
  color:      string
  icon:       string | null
  sort_order: number
  is_archived: boolean
  is_default: boolean
  task_count?: number
}

export async function getCategories(): Promise<Category[]> {
  const rows = await select<any>(`
    SELECT c.*, COUNT(t.id) AS task_count
    FROM categories c
    LEFT JOIN tasks t ON t.category_id = c.id AND t.status NOT IN ('DONE', 'DROPPED')
    WHERE c.is_archived = 0
    GROUP BY c.id
    ORDER BY c.sort_order ASC
  `)
  return rows.map(r => ({ ...r, is_archived: Boolean(r.is_archived), is_default: Boolean(r.is_default) }))
}

export async function createCategory(name: string, color: string, icon?: string): Promise<string> {
  const id = randomId()
  const maxOrder = await selectOne<{ m: number }>('SELECT MAX(sort_order) as m FROM categories')
  await execute(
    'INSERT INTO categories (id, name, color, icon, sort_order) VALUES (?, ?, ?, ?, ?)',
    [id, name, color, icon ?? null, (maxOrder?.m ?? -1) + 1]
  )
  return id
}

export async function updateCategory(id: string, data: Partial<Pick<Category, 'name' | 'color' | 'icon' | 'sort_order' | 'is_archived'>>) {
  const fields: string[] = ['updated_at = datetime(\'now\')']
  const values: unknown[] = []
  if (data.name       !== undefined) { fields.push('name = ?');       values.push(data.name) }
  if (data.color      !== undefined) { fields.push('color = ?');      values.push(data.color) }
  if (data.icon       !== undefined) { fields.push('icon = ?');       values.push(data.icon) }
  if (data.sort_order !== undefined) { fields.push('sort_order = ?'); values.push(data.sort_order) }
  if (data.is_archived !== undefined){ fields.push('is_archived = ?'); values.push(data.is_archived ? 1 : 0) }
  values.push(id)
  await execute(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, values)
}

// ─── BOOKS ────────────────────────────────────────────────────────────────────

export type BookStatus = 'TO_READ' | 'READING' | 'FINISHED' | 'ABANDONED'

export interface Book {
  id:           string
  title:        string
  author:       string | null
  genre:        string | null
  total_pages:  number | null
  current_page: number
  status:       BookStatus
  rating:       number | null
  notes:        string | null
  started_at:   string | null
  finished_at:  string | null
}

export async function getBooks(status?: BookStatus): Promise<Book[]> {
  const where = status ? 'WHERE status = ?' : ''
  return select<Book>(`SELECT * FROM books ${where} ORDER BY updated_at DESC`, status ? [status] : [])
}

export async function createBook(data: Pick<Book, 'title'> & Partial<Omit<Book, 'id' | 'current_page' | 'status'>>): Promise<string> {
  const id = randomId()
  await execute(
    'INSERT INTO books (id, title, author, genre, total_pages) VALUES (?, ?, ?, ?, ?)',
    [id, data.title, data.author ?? null, data.genre ?? null, data.total_pages ?? null]
  )
  return id
}

export async function updateBook(id: string, data: Partial<Omit<Book, 'id'>>) {
  const fields: string[] = ["updated_at = datetime('now')"]
  const values: unknown[] = []
  const map: Record<string, string> = {
    title: 'title', author: 'author', genre: 'genre', total_pages: 'total_pages',
    current_page: 'current_page', status: 'status', rating: 'rating', notes: 'notes',
    started_at: 'started_at', finished_at: 'finished_at',
  }
  for (const [key, col] of Object.entries(map)) {
    if ((data as any)[key] !== undefined) { fields.push(`${col} = ?`); values.push((data as any)[key]) }
  }
  values.push(id)
  await execute(`UPDATE books SET ${fields.join(', ')} WHERE id = ?`, values)
}
