import { useState } from 'react'
import { TaskRow } from '@/components/ui/task-row'
import { useCompleteTask } from '@/lib/hooks/use-data'
import { useQuickAdd } from '@/lib/stores/quick-add'
import type { Task } from '@/lib/queries/tasks'

/* P5 — show max 3 open focus tasks, the rest behind a "+N more" expander */
const VISIBLE_LIMIT = 3

export function FocusTasksCard({ tasks, completedFocusToday }: { tasks: Task[]; completedFocusToday: number }) {
  const complete = useCompleteTask()
  const showQuickAdd = useQuickAdd(s => s.show)
  const [expanded, setExpanded] = useState(false)

  const total = tasks.length + completedFocusToday
  const visible = expanded ? tasks : tasks.slice(0, VISIBLE_LIMIT)
  const hidden = tasks.length - VISIBLE_LIMIT

  return (
    <div className="card">
      {/* P2 — no title icon; Focus keeps its count */}
      <div className="card-title">
        Focus tasks
        <span className="card-title-mono">
          {completedFocusToday}/{total}
        </span>
      </div>

      {tasks.length === 0 ? (
        /* P11 — empty states: body face, faint, no italics */
        <p style={{ fontSize: 13, color: 'var(--text-faint)', padding: '12px 4px', lineHeight: 1.5 }}>
          No focus tasks yet — pick a few from your task list, or add one below.
        </p>
      ) : (
        <>
          {visible.map(t => (
            <TaskRow key={t.id} task={t} onComplete={id => complete.mutate(id)} />
          ))}
          {!expanded && hidden > 0 && (
            <button type="button" className="more-row" onClick={() => setExpanded(true)}>
              + {hidden} more
            </button>
          )}
        </>
      )}

      <button
        type="button"
        className="btn-pill-add"
        onClick={() => showQuickAdd({ isFocusToday: true })}
      >
        + add a task
      </button>
    </div>
  )
}
