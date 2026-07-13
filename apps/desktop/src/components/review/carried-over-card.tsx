import { useQueryClient } from '@tanstack/react-query'
import { useUpdateTask, useDropTask, qk } from '@/lib/hooks/use-data'
import { PriorityDot } from '@/components/ui/priority-dot'
import { CategoryDot } from '@/components/ui/category-dot'
import { formatDueDate } from '@/lib/utils'
import type { Task } from '@/lib/queries/tasks'

/** Next Monday, end of day — "next week" without picking a scary deadline. */
function nextMondayIso(): string {
  const d = new Date()
  d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7))
  d.setHours(23, 59, 59, 999)
  return d.toISOString()
}

export function CarriedOverCard({ tasks }: { tasks: Task[] }) {
  const qc = useQueryClient()
  const updateTask = useUpdateTask()
  const dropTask   = useDropTask()

  // Remove the row from the review cache instantly, then let the mutation's
  // own invalidations refresh everything else.
  function withOptimisticRemove(id: string, run: () => void) {
    qc.setQueryData(qk.weeklyReview, (old: any) =>
      old ? { ...old, carriedOver: old.carriedOver.filter((t: Task) => t.id !== id) } : old
    )
    run()
  }

  const pillStyle: React.CSSProperties = {
    fontFamily: 'Geist, sans-serif', fontSize: 11, fontWeight: 500,
    padding: '3px 9px', borderRadius: 7, cursor: 'pointer',
    border: '1.5px solid var(--border)', background: 'transparent',
    color: 'var(--text-muted)', transition: 'all 0.12s', whiteSpace: 'nowrap',
  }

  return (
    <div className="card">
      <div className="card-title">
        <span aria-hidden>🔄</span> Carried forward
        <span className="card-title-mono">{tasks.length}</span>
      </div>

      {tasks.length === 0 ? (
        <p style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 13, color: 'var(--text-mono)', padding: '4px 2px' }}>
          Nothing left over — clean slate for next week.
        </p>
      ) : (
        tasks.map(t => (
          <div key={t.id} className="task-row" style={{ cursor: 'default' }}>
            <PriorityDot priority={t.priority} />
            <CategoryDot categoryId={t.category_id} categoryName={t.category_name} size={7} />
            <span className="task-title">{t.title}</span>
            {t.due_date && (
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10.5, color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>
                {formatDueDate(t.due_date)}
              </span>
            )}
            <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
              <button type="button" style={pillStyle}
                onClick={() => withOptimisticRemove(t.id, () =>
                  updateTask.mutate({ id: t.id, data: { due_date: nextMondayIso(), status: 'ACTIVE' } })
                )}>
                Next week
              </button>
              <button type="button" style={{ ...pillStyle, color: 'var(--accent)', borderColor: 'var(--pill-border)' }}
                onClick={() => withOptimisticRemove(t.id, () =>
                  updateTask.mutate({ id: t.id, data: { is_focus_today: true, status: 'ACTIVE' } })
                )}>
                Focus now
              </button>
              <button type="button" style={pillStyle}
                onClick={() => withOptimisticRemove(t.id, () => dropTask.mutate(t.id))}>
                Drop
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
