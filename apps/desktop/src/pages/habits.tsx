import { useHabits, useHabitHistory } from '@/lib/hooks/use-data'
import { AddHabitForm } from '@/components/habits/add-habit-form'
import { HabitCard } from '@/components/habits/habit-card'

export function HabitsPage() {
  const { data: habits = [], isLoading } = useHabits()
  const { data: history = [] } = useHabitHistory()

  // One pass over the log rows → per-habit set of completed dates
  const doneByHabit = new Map<string, Set<string>>()
  for (const e of history) {
    if (!e.completed) continue
    if (!doneByHabit.has(e.habit_id)) doneByHabit.set(e.habit_id, new Set())
    doneByHabit.get(e.habit_id)!.add(e.date)
  }

  return (
    <>
      <header className="topbar" data-tauri-drag-region>
        <h1 className="topbar-title">
          Habits
        </h1>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: 'var(--text-mono)' }}>
          {habits.filter(h => h.completed_today).length} of {habits.length} done today
        </span>
      </header>

      <div className="content-scroll">
        <div style={{ maxWidth: 720 }}>
          <AddHabitForm />

          {isLoading ? (
            <div style={{ fontFamily: 'inherit', fontStyle: 'normal', fontSize: 14, color: 'var(--text-mono)', padding: '24px 4px' }}>
              Loading your habits…
            </div>
          ) : habits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', fontFamily: 'inherit', fontStyle: 'normal', fontSize: 15, color: 'var(--text-faint)' }}>
              No habits yet. Start with one tiny thing — that's how streaks begin.
            </div>
          ) : (
            habits.map(h => (
              <HabitCard key={h.id} habit={h} doneDates={doneByHabit.get(h.id) ?? new Set()} />
            ))
          )}
        </div>
      </div>
    </>
  )
}
