// ─── RE-EXPORT PRISMA ENUMS ───────────────────────────────────────────────────
export type { TaskStatus, Priority, RecurrenceFrequency, BookStatus } from '@adhd-life/database'

// ─── UI / VIEW TYPES ─────────────────────────────────────────────────────────

export type DashboardView = 'today' | 'inbox' | 'category' | 'habits' | 'reading' | 'weekly'

export type TaskGrouping = 'overdue' | 'today' | 'this_week' | 'upcoming' | 'someday' | 'done'

export interface DailyDashboardData {
  date: Date
  focusTasks: TaskWithMeta[]
  overdueTasks: TaskWithMeta[]
  upcomingToday: TaskWithMeta[]
  habits: HabitWithTodayStatus[]
  streakCount: number
  completedToday: number
  totalScheduledToday: number
}

export interface TaskWithMeta {
  id: string
  title: string
  notes?: string | null
  dueDate?: Date | null
  priority: Priority
  status: TaskStatus
  isFocusToday: boolean
  categoryName?: string | null
  categoryColor?: string | null
  categoryIcon?: string | null
  subtaskCount: number
  completedSubtaskCount: number
  tags: string[]
}

export interface HabitWithTodayStatus {
  id: string
  name: string
  color: string
  currentStreak: number
  completedToday: boolean
}

export interface WeeklyReviewData {
  weekStart: Date
  weekEnd: Date
  tasksCompleted: number
  tasksPlanned: number
  rolledOverTasks: TaskWithMeta[]
  categoryBreakdown: { category: string; completed: number; color: string }[]
}

// ─── FORM TYPES ───────────────────────────────────────────────────────────────

export interface CreateTaskInput {
  title: string
  categoryId?: string
  notes?: string
  dueDate?: Date
  dueTime?: string
  priority?: Priority
  timeEstimateMin?: number
}

export interface BrainDumpInput {
  rawText: string // newline or comma-separated tasks
}

export interface CreateHabitInput {
  name: string
  color?: string
  targetFrequency?: number
}

export interface CreateBookInput {
  title: string
  author?: string
  genre?: string
  totalPages?: number
}

// ─── API RESPONSE TYPES ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH'
export type TaskStatus = 'INBOX' | 'ACTIVE' | 'DONE' | 'SNOOZED' | 'DROPPED'
export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM'
export type BookStatus = 'TO_READ' | 'READING' | 'FINISHED' | 'ABANDONED'
