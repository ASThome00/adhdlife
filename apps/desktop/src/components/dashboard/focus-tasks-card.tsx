import { TaskRow } from '@/components/ui/task-row'
import { useCompleteTask } from '@/lib/hooks/use-data'
import { useQuickAdd } from '@/lib/stores/quick-add'
import type { Task } from '@/lib/queries/tasks'

export function FocusTasksCard({ tasks, completedToday }: { tasks: Task[]; completedToday: number }) {
  const complete = useCompleteTask()
  const showQuickAdd = useQuickAdd(s => s.show)

  const total = tasks.length + completedToday
  return (
    <div className="card">
      <div className="card-title">
        <span aria-hidden>⚡</span> Focus tasks
        <span className="card-title-mono">
          {completedToday}/{total}
        </span>
      </div>

      {tasks.length === 0 ? (
        <p
          style={{
            fontFamily: 'Lora, serif',
            fontStyle: 'italic',
            fontSize: 13,
            color: 'var(--text-mono)',
            padding: '12px 4px',
            lineHeight: 1.5,
          }}
        >
          No focus tasks yet — pick a few from your task list, or add one below.
        </p>
      ) : (
        tasks.map(t => (
          <TaskRow key={t.id} task={t} onComplete={id => complete.mutate(id)} />
        ))
      )}

      <button
        type="button"
        onClick={() => showQuickAdd({ isFocusToday: true })}
        style={{
          marginTop: 10,
          width: '100%',
          padding: 7,
          border: '1.5px dashed var(--border)',
          borderRadius: 8,
          background: 'transparent',
          fontFamily: 'Lora, serif',
          fontStyle: 'italic',
          fontSize: 12,
          color: 'var(--text-mono)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5,
          transition: 'all 0.12s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--accent)'
          e.currentTarget.style.color = 'var(--text-accent)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.color = 'var(--text-mono)'
        }}
      >
        + add a task
      </button>
    </div>
  )
}
