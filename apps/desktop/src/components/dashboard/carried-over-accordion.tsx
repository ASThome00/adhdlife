import { useState } from 'react'
import { differenceInCalendarDays } from 'date-fns'
import { Checkbox } from '@/components/ui/checkbox'
import { PriorityDot } from '@/components/ui/priority-dot'
import { CategoryDot } from '@/components/ui/category-dot'
import { useCompleteTask } from '@/lib/hooks/use-data'
import type { Task } from '@/lib/queries/tasks'

function daysAgo(dueDate: string | null): number {
  if (!dueDate) return 0
  const due = new Date(dueDate)
  const now = new Date()
  return Math.max(0, differenceInCalendarDays(now, due))
}

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
          justifyContent: 'space-between',
          padding: '15px 20px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span aria-hidden style={{ fontSize: 14 }}>📋</span>
          <span style={{ fontFamily: 'Lora, serif', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
            Carried over
          </span>
          <span
            style={{
              background: 'var(--bg-accent)',
              color: 'var(--text-accent)',
              borderRadius: 99,
              fontFamily: 'DM Mono, monospace',
              fontSize: 11,
              fontWeight: 500,
              padding: '1px 8px',
              border: '1px solid var(--pill-border)',
            }}
          >
            {tasks.length}
          </span>
        </div>
        <svg
          width="13" height="13" viewBox="0 0 14 14" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s' }}
        >
          <path d="M3.5 5.5L7 9L10.5 5.5" stroke="var(--text-mono)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className={`acc-body ${open ? 'open' : ''}`}>
        <div style={{ padding: '0 20px 16px' }}>
          <p
            style={{
              fontFamily: 'Lora, serif',
              fontStyle: 'italic',
              fontSize: 12,
              color: 'var(--text-mono)',
              marginBottom: 10,
            }}
          >
            These wandered over from earlier — no rush, just keeping them visible. ✨
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
                  gap: 8,
                  padding: '8px 10px',
                  borderRadius: 8,
                  marginBottom: 6,
                  background: 'var(--bg-card-lite)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  opacity: done ? 0.42 : 1,
                }}
              >
                <Checkbox done={done} onToggle={() => !done && complete.mutate(t.id)} />
                <PriorityDot priority={t.priority} />
                <span
                  style={{
                    flex: 1,
                    fontFamily: 'Geist, sans-serif',
                    fontSize: 13,
                    color: 'var(--text-body)',
                    fontWeight: 500,
                    textDecoration: done ? 'line-through' : 'none',
                    textDecorationColor: 'var(--text-faint)',
                  }}
                >
                  {t.title}
                </span>
                <span
                  style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 10,
                    color: 'var(--text-faint)',
                  }}
                >
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
