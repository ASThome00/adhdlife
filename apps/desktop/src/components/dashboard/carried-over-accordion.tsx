import { useState } from 'react'
import { differenceInCalendarDays } from 'date-fns'
import { Checkbox } from '@/components/ui/checkbox'
import { CategoryDot } from '@/components/ui/category-dot'
import { useCompleteTask } from '@/lib/hooks/use-data'
import type { Task } from '@/lib/queries/tasks'

function daysAgo(dueDate: string | null): number {
  if (!dueDate) return 0
  const due = new Date(dueDate)
  const now = new Date()
  return Math.max(0, differenceInCalendarDays(now, due))
}

/* P8 — "Carried over" → "Still on the list" with a neutral count chip */
export function CarriedOverAccordion({ tasks }: { tasks: Task[] }) {
  const [open, setOpen] = useState(false)
  const complete = useCompleteTask()

  if (tasks.length === 0) return null

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '16px 22px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          Still on the list
        </span>
        <span
          className="num"
          style={{
            fontSize: 11,
            color: 'var(--text-sidebar)',
            background: 'var(--bg-card-lite)',
            borderRadius: 99,
            padding: '2px 9px',
          }}
        >
          {tasks.length}
        </span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{
            marginLeft: 'auto',
            opacity: 0.45,
            color: 'var(--text-body)',
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.25s',
          }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div className={`acc-body ${open ? 'open' : ''}`}>
        <div style={{ padding: '0 22px 18px' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
            These wandered over from earlier — no rush, just keeping them visible.
          </p>
          {tasks.map(t => {
            const done = t.status === 'DONE'
            return (
              <div
                key={t.id}
                onClick={() => !done && complete.mutate(t.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 13,
                  marginBottom: 6,
                  background: 'var(--bg-card-lite)',
                  cursor: 'pointer',
                  opacity: done ? 0.5 : 1,
                }}
              >
                <Checkbox done={done} priority={t.priority} onToggle={() => !done && complete.mutate(t.id)} />
                <span
                  style={{
                    flex: 1,
                    fontSize: 13,
                    color: 'var(--text-body)',
                    fontWeight: 500,
                    textDecoration: done ? 'line-through' : 'none',
                    textDecorationColor: 'var(--text-faint)',
                  }}
                >
                  {t.title}
                </span>
                <span className="num" style={{ fontSize: 10, color: 'var(--text-faint)' }}>
                  {daysAgo(t.due_date)}d ago
                </span>
                <CategoryDot categoryId={t.category_id} categoryName={t.category_name} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
