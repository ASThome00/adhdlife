import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { TaskRow } from '@/components/ui/task-row'
import type { Task } from '@/lib/queries/tasks'

interface Props {
  label: string
  tasks: Task[]
  onComplete: (id: string) => void
  onOpenDetail: (task: Task) => void
  onSnooze: (id: string, days: 1 | 7) => void
  onMoveToToday: (id: string) => void
  onDrop: (id: string) => void
  defaultOpen?: boolean
}

export function TaskSection({ label, tasks, onComplete, onOpenDetail, onSnooze, onMoveToToday, onDrop, defaultOpen = true }: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  if (tasks.length === 0) return null

  return (
    <div style={{ marginBottom: 4 }}>
      <button
        type="button"
        onClick={() => setIsOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px 5px',
          textAlign: 'left',
        }}
      >
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{
            color: 'var(--text-faint)',
            transition: 'transform 0.15s',
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
        >
          <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--text-mono)',
        }}>
          {label}
        </span>
        <span style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: 10,
          color: 'var(--text-faint)',
          marginLeft: 2,
        }}>
          {tasks.length}
        </span>
      </button>

      <div style={{
        overflow: isOpen ? 'visible' : 'hidden',
        maxHeight: isOpen ? 99999 : 0,
        opacity: isOpen ? 1 : 0,
        transition: 'max-height 0.3s ease, opacity 0.25s ease',
      }}>
        {tasks.map(task => (
          <TaskRow
            key={task.id}
            task={task}
            onComplete={onComplete}
            onRowClick={(id) => onOpenDetail(tasks.find(t => t.id === id)!)}
            trailing={
              <KebabMenu
                task={task}
                onEdit={() => onOpenDetail(task)}
                onSnooze={onSnooze}
                onMoveToToday={onMoveToToday}
                onDrop={onDrop}
              />
            }
          />
        ))}
      </div>
    </div>
  )
}

interface KebabProps {
  task: Task
  onEdit: () => void
  onSnooze: (id: string, days: 1 | 7) => void
  onMoveToToday: (id: string) => void
  onDrop: (id: string) => void
}

function KebabMenu({ task, onEdit, onSnooze, onMoveToToday, onDrop }: KebabProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  function action(fn: () => void) {
    return (e: React.MouseEvent) => {
      e.stopPropagation()
      fn()
      setOpen(false)
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
      <button
        type="button"
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px 6px',
          borderRadius: 5,
          fontFamily: 'Geist, sans-serif',
          fontSize: 15,
          color: 'var(--text-faint)',
          lineHeight: 1,
          transition: 'color 0.12s',
        }}
        title="More options"
      >
        ⋯
      </button>

      {open && (
        <div
          className="card"
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: 4,
            zIndex: 200,
            minWidth: 148,
            padding: '4px 0',
            boxShadow: '3px 4px 0 var(--shadow)',
          }}
        >
          {[
            { label: 'Edit', fn: onEdit },
            { label: 'Snooze 1 day',  fn: () => onSnooze(task.id, 1) },
            { label: 'Snooze 1 week', fn: () => onSnooze(task.id, 7) },
            { label: 'Move to today', fn: () => onMoveToToday(task.id) },
            { label: 'Drop',          fn: () => onDrop(task.id) },
          ].map(({ label, fn }) => (
            <button
              key={label}
              type="button"
              onClick={action(fn)}
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '7px 14px',
                fontFamily: 'Geist, sans-serif',
                fontSize: 13,
                color: label === 'Drop' ? 'var(--text-accent)' : 'var(--text-body)',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
