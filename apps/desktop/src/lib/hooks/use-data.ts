// apps/desktop/src/lib/hooks/use-data.ts
// TanStack Query hooks backed by local SQLite (via lib/queries/*).
// No HTTP — direct DB calls. Optimistic updates for instant UI.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getDashboardData, getTasks, getSubtasks, createTask, updateTask, brainDump, dropTask, getRecurrence, setRecurrence, getWeeklyReviewData } from '@/lib/queries/tasks'
import { getHabits, createHabit, updateHabit, toggleHabitToday, getHabitHistory, getCategories, createCategory, updateCategory, getBooks, createBook, updateBook } from '@/lib/queries/habits-categories-books'
import { getSettings, updateSettings } from '@/lib/queries/settings'
import { todayDateStr } from '@/lib/db'
import type { CreateTaskInput, Recurrence } from '@/lib/queries/tasks'
import type { Category, Book } from '@/lib/queries/habits-categories-books'

// ─── QUERY KEYS ───────────────────────────────────────────────────────────────
export const qk = {
  settings:   ['settings']             as const,
  dashboard:  ['dashboard']            as const,
  tasks:      (f?: object) => ['tasks', f ?? {}] as const,
  habits:     ['habits']               as const,
  habitHistory: ['habit-history']      as const,
  categories: ['categories']           as const,
  books:      (s?: string) => ['books', s ?? 'all'] as const,
  subtasks:   (parentId: string) => ['subtasks', parentId] as const,
  weeklyReview: ['weekly-review']      as const,
  recurrence: (taskId: string)   => ['recurrence', taskId] as const,
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
export function useSettings() {
  return useQuery({ queryKey: qk.settings, queryFn: getSettings })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateSettings,
    onSuccess:  () => qc.invalidateQueries({ queryKey: qk.settings }),
  })
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export function useDashboard() {
  return useQuery({
    queryKey:  qk.dashboard,
    queryFn:   getDashboardData,
    staleTime: 15 * 1000,
  })
}

// ─── TASKS ────────────────────────────────────────────────────────────────────
export function useTasks(filters?: { status?: string; category_id?: string; focus_only?: boolean }) {
  return useQuery({
    queryKey: qk.tasks(filters),
    queryFn:  () => getTasks(filters as any),
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onSuccess: (_id, input) => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      qc.invalidateQueries({ queryKey: qk.dashboard })
      if (input.parent_task_id) {
        qc.invalidateQueries({ queryKey: qk.subtasks(input.parent_task_id) })
      }
      toast.success('Task added!')
    },
    onError: () => toast.error('Failed to add task'),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateTask>[1] }) =>
      updateTask(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      qc.invalidateQueries({ queryKey: qk.dashboard })
      qc.invalidateQueries({ queryKey: qk.weeklyReview })
    },
    onError: () => toast.error('Failed to update task'),
  })
}

export function useCompleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => updateTask(id, { status: 'DONE' }),
    // Optimistic: remove from lists immediately
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: qk.dashboard })
      const prev = qc.getQueryData(qk.dashboard)
      qc.setQueryData(qk.dashboard, (old: any) => {
        if (!old) return old
        const removeId = (arr: any[]) => arr.filter(t => t.id !== id)
        return {
          ...old,
          focusTasks:    removeId(old.focusTasks),
          upcomingToday: removeId(old.upcomingToday),
          overdueTasks:  removeId(old.overdueTasks),
          completedToday: old.completedToday + 1,
        }
      })
      return { prev }
    },
    onError: (_err, _id, ctx: any) => {
      qc.setQueryData(qk.dashboard, ctx?.prev)
      toast.error('Could not mark as done')
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.dashboard })
      qc.invalidateQueries({ queryKey: ['tasks'] })
      qc.invalidateQueries({ queryKey: ['subtasks'] })
      qc.invalidateQueries({ queryKey: qk.weeklyReview })
    },
  })
}

export function useBrainDump() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (rawText: string) => brainDump(rawText),
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      toast.success(`${count} task${count === 1 ? '' : 's'} added to inbox!`)
    },
    onError: () => toast.error('Brain dump failed'),
  })
}

// ─── HABITS ───────────────────────────────────────────────────────────────────
export function useHabits() {
  return useQuery({ queryKey: qk.habits, queryFn: getHabits })
}

export function useToggleHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ habitId, completed }: { habitId: string; completed: boolean }) =>
      toggleHabitToday(habitId, completed),
    // Optimistic across every cache that shows habit state: dashboard circles,
    // the Habits page list (streak number nudged so the tap feels instant —
    // the real streak recalc lands on invalidation), and the 30-day grid.
    onMutate: async ({ habitId, completed }) => {
      await Promise.all([
        qc.cancelQueries({ queryKey: qk.dashboard }),
        qc.cancelQueries({ queryKey: qk.habits }),
        qc.cancelQueries({ queryKey: qk.habitHistory }),
      ])
      qc.setQueryData(qk.dashboard, (old: any) => {
        if (!old) return old
        return {
          ...old,
          habits: old.habits.map((h: any) =>
            h.id === habitId ? { ...h, completed_today: completed } : h
          ),
        }
      })
      qc.setQueryData(qk.habits, (old: any) => {
        if (!old) return old
        return old.map((h: any) =>
          h.id === habitId
            ? {
                ...h,
                completed_today: completed,
                current_streak: Math.max(0, h.current_streak + (completed ? 1 : -1)),
              }
            : h
        )
      })
      const today = todayDateStr()
      qc.setQueryData(qk.habitHistory, (old: any) => {
        if (!old) return old
        const rest = old.filter((e: any) => !(e.habit_id === habitId && e.date === today))
        return [...rest, { habit_id: habitId, date: today, completed }]
      })
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.habits })
      qc.invalidateQueries({ queryKey: qk.habitHistory })
      qc.invalidateQueries({ queryKey: qk.dashboard })
    },
    onError: () => toast.error('Failed to update habit'),
  })
}

export function useHabitHistory() {
  return useQuery({ queryKey: qk.habitHistory, queryFn: () => getHabitHistory(30) })
}

export function useCreateHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ name, color }: { name: string; color: string }) => createHabit(name, color),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.habits })
      qc.invalidateQueries({ queryKey: qk.dashboard })
      toast.success('Habit added!')
    },
    onError: () => toast.error('Failed to add habit'),
  })
}

export function useUpdateHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateHabit>[1] }) =>
      updateHabit(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.habits })
      qc.invalidateQueries({ queryKey: qk.dashboard })
    },
    onError: () => toast.error('Failed to update habit'),
  })
}

// ─── WEEKLY REVIEW ────────────────────────────────────────────────────────────
export function useWeeklyReview() {
  return useQuery({ queryKey: qk.weeklyReview, queryFn: getWeeklyReviewData })
}

// ─── BOOKS ────────────────────────────────────────────────────────────────────
export function useBooks() {
  return useQuery({ queryKey: qk.books(), queryFn: () => getBooks() })
}

export function useCreateBook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof createBook>[0]) => createBook(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['books'] })
      toast.success('Book added!')
    },
    onError: () => toast.error('Failed to add book'),
  })
}

export function useUpdateBook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateBook>[1] }) =>
      updateBook(id, data),
    // Optimistic: merge the patch into every books cache so column moves,
    // page updates, and ratings land instantly.
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: ['books'] })
      const snapshots = qc.getQueriesData<Book[]>({ queryKey: ['books'] })
      for (const [key, books] of snapshots) {
        if (Array.isArray(books)) {
          qc.setQueryData(key, books.map(b => (b.id === id ? { ...b, ...data } : b)))
        }
      }
      return { snapshots }
    },
    onError: (_err, _vars, ctx: any) => {
      for (const [key, books] of ctx?.snapshots ?? []) qc.setQueryData(key, books)
      toast.error('Failed to update book')
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['books'] }),
  })
}

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
export function useCategories() {
  return useQuery({
    queryKey:  qk.categories,
    queryFn:   () => getCategories(),
    staleTime: 5 * 60 * 1000,
  })
}

/** Settings page needs archived categories too (to unarchive them). */
export function useAllCategories() {
  return useQuery({
    queryKey: ['categories', 'all'],
    queryFn:  () => getCategories(true),
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ name, color }: { name: string; color: string }) => createCategory(name, color),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.categories }),
    onError: () => toast.error('Failed to create category'),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateCategory>[1] }) =>
      updateCategory(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.categories }),
    onError: () => toast.error('Failed to update category'),
  })
}

// ─── SUBTASKS ─────────────────────────────────────────────────────────────────
export function useSubtasks(parentId: string) {
  return useQuery({
    queryKey: qk.subtasks(parentId),
    queryFn:  () => getSubtasks(parentId),
    enabled:  Boolean(parentId),
  })
}

// ─── DROP / SNOOZE ────────────────────────────────────────────────────────────
export function useDropTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => dropTask(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['tasks'] })
      const snapshots = qc.getQueriesData<any[]>({ queryKey: ['tasks'] })
      for (const [key, data] of snapshots) {
        if (Array.isArray(data)) {
          qc.setQueryData(key, data.filter((t: any) => t.id !== id))
        }
      }
      return { snapshots }
    },
    onError: (_err, _id, ctx: any) => {
      for (const [key, data] of ctx?.snapshots ?? []) {
        qc.setQueryData(key, data)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      qc.invalidateQueries({ queryKey: qk.dashboard })
      qc.invalidateQueries({ queryKey: qk.weeklyReview })
    },
  })
}

export function useSnoozeTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, until }: { id: string; until: string }) =>
      updateTask(id, { status: 'SNOOZED', snoozed_until: until }),
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: ['tasks'] })
      const snapshots = qc.getQueriesData<any[]>({ queryKey: ['tasks'] })
      for (const [key, data] of snapshots) {
        if (Array.isArray(data)) {
          qc.setQueryData(key, data.filter((t: any) => t.id !== id))
        }
      }
      return { snapshots }
    },
    onError: (_err, _vars, ctx: any) => {
      for (const [key, data] of ctx?.snapshots ?? []) {
        qc.setQueryData(key, data)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      qc.invalidateQueries({ queryKey: qk.dashboard })
      qc.invalidateQueries({ queryKey: qk.weeklyReview })
    },
  })
}

// ─── RECURRENCE ───────────────────────────────────────────────────────────────
export function useRecurrence(taskId: string) {
  return useQuery({
    queryKey:  qk.recurrence(taskId),
    queryFn:   () => getRecurrence(taskId),
    staleTime: 0,
    enabled:   Boolean(taskId),
  })
}

export function useSetRecurrence() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, frequency }: { taskId: string; frequency: Recurrence['frequency'] | null }) =>
      setRecurrence(taskId, frequency),
    onSuccess: (_result, { taskId }) => {
      qc.invalidateQueries({ queryKey: qk.recurrence(taskId) })
    },
    onError: () => toast.error('Failed to update recurrence'),
  })
}

// Re-export types so consumers can import from one place
export type { Recurrence, Category }
