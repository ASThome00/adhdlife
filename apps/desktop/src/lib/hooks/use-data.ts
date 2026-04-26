// apps/desktop/src/lib/hooks/use-data.ts
// TanStack Query hooks backed by local SQLite (via lib/queries/*).
// No HTTP — direct DB calls. Optimistic updates for instant UI.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getDashboardData, getTasks, getSubtasks, createTask, updateTask, brainDump, dropTask, getRecurrence, setRecurrence } from '@/lib/queries/tasks'
import { getHabits, toggleHabitToday, getCategories, createCategory, updateCategory } from '@/lib/queries/habits-categories-books'
import { getSettings, updateSettings } from '@/lib/queries/settings'
import type { CreateTaskInput, Recurrence } from '@/lib/queries/tasks'
import type { Category } from '@/lib/queries/habits-categories-books'

// ─── QUERY KEYS ───────────────────────────────────────────────────────────────
export const qk = {
  settings:   ['settings']             as const,
  dashboard:  ['dashboard']            as const,
  tasks:      (f?: object) => ['tasks', f ?? {}] as const,
  habits:     ['habits']               as const,
  categories: ['categories']           as const,
  books:      (s?: string) => ['books', s ?? 'all'] as const,
  subtasks:   (parentId: string) => ['subtasks', parentId] as const,
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
    onMutate: async ({ habitId, completed }) => {
      await qc.cancelQueries({ queryKey: qk.dashboard })
      qc.setQueryData(qk.dashboard, (old: any) => {
        if (!old) return old
        return {
          ...old,
          habits: old.habits.map((h: any) =>
            h.id === habitId ? { ...h, completed_today: completed } : h
          ),
        }
      })
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.habits })
      qc.invalidateQueries({ queryKey: qk.dashboard })
    },
    onError: () => toast.error('Failed to update habit'),
  })
}

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
export function useCategories() {
  return useQuery({
    queryKey:  qk.categories,
    queryFn:   getCategories,
    staleTime: 5 * 60 * 1000,
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
