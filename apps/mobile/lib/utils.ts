// apps/mobile/lib/utils.ts
import { format, isToday, isTomorrow } from 'date-fns'
import { dueDayStr, localDateStr, todayDateStr, type Task } from './db'

export function getGreeting(name: string): string {
  const hour = new Date().getHours()
  const g = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  return `${g}, ${name}`
}

export function formatDueDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isToday(date))    return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  return format(date, 'EEE MMM d')
}

/* Forgiving tone, no emoji in UI chrome (Quiet Garden) */
export function getStreakMessage(streak: number): string {
  if (streak === 0)  return 'Start today — no pressure.'
  if (streak === 1)  return 'Day 1 — great start.'
  if (streak < 7)    return `${streak} days going strong.`
  if (streak < 30)   return `${streak} days — this is becoming a rhythm.`
  return `${streak} days — quietly incredible.`
}

export interface TaskSections {
  overdue: Task[]
  today: Task[]
  thisWeek: Task[]
  upcoming: Task[]
  someday: Task[]
}

/** Same section rules as desktop pages/tasks.tsx — LOCAL day keys throughout. */
export function groupTasks(tasks: Task[]): TaskSections {
  const today = todayDateStr()
  const weekEnd = (() => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    return localDateStr(d)
  })()

  const sections: TaskSections = { overdue: [], today: [], thisWeek: [], upcoming: [], someday: [] }
  for (const t of tasks) {
    const d = dueDayStr(t.due_date)
    if (d === null)            sections.someday.push(t)
    else if (d < today)        sections.overdue.push(t)
    else if (d === today)      sections.today.push(t)
    else if (d <= weekEnd)     sections.thisWeek.push(t)
    else                       sections.upcoming.push(t)
  }
  return sections
}
