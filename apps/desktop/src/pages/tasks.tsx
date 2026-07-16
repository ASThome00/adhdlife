import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useTasks, useCategories, useCompleteTask, useSnoozeTask, useDropTask, useUpdateTask } from '@/lib/hooks/use-data'
import { endOfTodaySql, todayDateStr, localDateStr } from '@/lib/db'
import { CategorySidebar } from '@/components/tasks/category-sidebar'
import { TaskSection } from '@/components/tasks/task-section'
import { TaskDetailPanel } from '@/components/tasks/task-detail-panel'
import { UndoToast } from '@/components/tasks/undo-toast'
import type { Task } from '@/lib/queries/tasks'

type UndoState = { message: string; undo: () => void }

function weekLaterStr(): string {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return localDateStr(d)
}

// LOCAL calendar date — due dates are stored as instants (local 23:59 → UTC
// ISO), so slicing the UTC string put "Today" tasks in tomorrow's bucket.
function dueStr(task: Task): string | null {
  return task.due_date ? localDateStr(new Date(task.due_date)) : null
}

export function TasksPage() {
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null)
  const [detailTaskId,  setDetailTaskId]  = useState<string | null>(null)
  const [undoState,     setUndoState]     = useState<UndoState | null>(null)

  const { data: allTasks  = [] } = useTasks(selectedCatId ? { category_id: selectedCatId } : undefined)
  const { data: categories = [] } = useCategories()
  // Derive the panel's task from the live cache — a frozen snapshot meant
  // priority/category edits saved but never lit up in the panel.
  const detailTask = allTasks.find(t => t.id === detailTaskId) ?? null
  const completeTask = useCompleteTask()
  const snoozeTask   = useSnoozeTask()
  const dropTask     = useDropTask()
  const updateTask   = useUpdateTask()

  // Derive sections
  const today   = todayDateStr()
  const weekEnd = weekLaterStr()
  const active  = allTasks.filter(t => t.status !== 'SNOOZED' && t.status !== 'DONE' && t.status !== 'DROPPED')

  const overdue   = active.filter(t => { const d = dueStr(t); return d !== null && d < today && t.status !== 'INBOX' })
  const todayList = active.filter(t => dueStr(t) === today)
  const thisWeek  = active.filter(t => { const d = dueStr(t); return d !== null && d > today && d <= weekEnd })
  const upcoming  = active.filter(t => { const d = dueStr(t); return d !== null && d > weekEnd })
  const someday   = active.filter(t => !t.due_date && t.status === 'ACTIVE')
  const inbox     = !selectedCatId ? allTasks.filter(t => t.status === 'INBOX') : []

  const selectedCatName = selectedCatId ? (categories.find(c => c.id === selectedCatId)?.name ?? 'Tasks') : 'All Tasks'

  function handleSnooze(id: string, days: 1 | 7) {
    const prev = allTasks.find(t => t.id === id)
    const until = new Date()
    until.setDate(until.getDate() + days)
    until.setHours(8, 0, 0, 0)
    snoozeTask.mutate({ id, until: until.toISOString() })
    setUndoState({
      message: `Snoozed for ${days === 1 ? '1 day' : '1 week'}`,
      undo: () => updateTask.mutate({ id, data: { status: prev?.status === 'INBOX' ? 'INBOX' : 'ACTIVE', snoozed_until: null } }),
    })
  }

  function handleDrop(id: string) {
    const prev = allTasks.find(t => t.id === id)
    dropTask.mutate(id)
    setUndoState({
      message: 'Task dropped',
      undo: () => updateTask.mutate({ id, data: { status: prev?.status === 'INBOX' ? 'INBOX' : 'ACTIVE' } }),
    })
  }

  function handleMoveToToday(id: string) {
    updateTask.mutate({ id, data: { due_date: endOfTodaySql(), status: 'ACTIVE' } })
  }

  function handleFocusToday(id: string, focus: boolean) {
    if (focus) updateTask.mutate({ id, data: { is_focus_today: true, status: 'ACTIVE' } })
    else       updateTask.mutate({ id, data: { is_focus_today: false } })
  }

  const sectionProps = {
    onComplete: (id: string) => completeTask.mutate(id),
    onOpenDetail: (t: Task) => setDetailTaskId(t.id),
    onFocusToday: handleFocusToday,
    onSnooze: handleSnooze,
    onMoveToToday: handleMoveToToday,
    onDrop: handleDrop,
  }

  return (
    <>
      <header className="topbar" data-tauri-drag-region>
        <h1 className="topbar-title">{selectedCatName}</h1>
        <span className="topbar-meta">{active.length} active</span>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <CategorySidebar
          categories={categories}
          selectedCatId={selectedCatId}
          onSelect={setSelectedCatId}
        />

        <div className="content-scroll" style={{ flex: 1, maxWidth: 720 }}>
          <TaskSection label="Overdue"    tasks={overdue}   {...sectionProps} defaultOpen />
          <TaskSection label="Today"      tasks={todayList} {...sectionProps} defaultOpen />
          <TaskSection label="This week"  tasks={thisWeek}  {...sectionProps} />
          <TaskSection label="Upcoming"   tasks={upcoming}  {...sectionProps} />
          <TaskSection label="Someday"    tasks={someday}   {...sectionProps} />
          {!selectedCatId && <TaskSection label="Inbox" tasks={inbox} {...sectionProps} />}

          {active.length === 0 && inbox.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0', fontSize: 15, color: 'var(--text-faint)' }}>
              All clear. Add a task with the + button.
            </div>
          )}
        </div>
      </div>

      <TaskDetailPanel
        key={detailTask?.id ?? 'none'}
        task={detailTask}
        onClose={() => setDetailTaskId(null)}
      />

      <AnimatePresence>
        {undoState && (
          <UndoToast
            message={undoState.message}
            onUndo={() => { undoState.undo(); setUndoState(null) }}
            onDismiss={() => setUndoState(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
