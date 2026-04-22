// apps/desktop/src/lib/hooks/use-data.ts
// TanStack Query hooks backed by local SQLite (via lib/queries/*).
// No HTTP — direct DB calls. Optimistic updates for instant UI.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getDashboardData, getTasks, createTask, updateTask, brainDump } from '@/lib/queries/tasks'
import { getHabits, toggleHabitToday, getCategories } from '@/lib/queries/habits-categories-books'
import { getSettings, updateSettings } from '@/lib/queries/settings'
import type { CreateTaskInput } from '@/lib/queries/tasks'

// ─── QUERY KEYS ───────────────────────────────────────────────────────────────
export const qk = {
  settings:   ['settings']             as const,
  dashboard:  ['dashboard']            as const,
  tasks:      (f?: object) => ['tasks', f ?? {}] as const,
  habits:     ['habits']               as const,
  categories: ['categories']           as const,
  books:      (s?: string) => ['books', s ?? 'all'] as const,
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      qc.invalidateQueries({ queryKey: qk.dashboard })
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
