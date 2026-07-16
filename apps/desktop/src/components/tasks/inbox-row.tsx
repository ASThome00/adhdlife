import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { getCategoryTheme } from '@/lib/category-colors'
import { formatDueDate } from '@/lib/utils'
import type { Task } from '@/lib/queries/tasks'

interface Category {
  id: string
  name: string
}

interface Props {
  task: Task
  categories: Category[]
  selected: boolean
  onToggleSelect: (id: string) => void
  onAssignCategory: (taskId: string, catId: string) => void
  onDrop: (taskId: string) => void
}

export function InboxRow({ task, categories, selected, onToggleSelect, onAssignCategory, onDrop }: Props) {
  const [catPickerOpen, setCatPickerOpen] = useState(false)

  return (
    <div
      className="task-row"
      style={{ alignItems: 'flex-start', padding: '10px 8px' }}
      onClick={e => {
        if ((e.target as HTMLElement).closest('button')) return
        onToggleSelect(task.id)
      }}
    >
      <div style={{ paddingTop: 1 }}>
        <Checkbox done={selected} onToggle={() => onToggleSelect(task.id)} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <span className="task-title">{task.title}</span>

        {catPickerOpen ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
            {categories.map(cat => {
              const theme = getCategoryTheme(cat.id, cat.name)
              return (
                <button
                  key={cat.id}
                  type="button"
                  className="chip"
                  onClick={e => {
                    e.stopPropagation()
                    setCatPickerOpen(false)
                    onAssignCategory(task.id, cat.id)
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget
                    el.style.background = theme.wash
                    el.style.color = theme.text
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget
                    el.style.background = ''
                    el.style.color = ''
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: theme.ink, display: 'inline-block' }} />
                  {theme.name}
                </button>
              )
            })}
            <button
              type="button"
              className="btn-ghost"
              style={{ fontSize: 12, padding: '5px 10px' }}
              onClick={e => { e.stopPropagation(); setCatPickerOpen(false) }}
            >
              cancel
            </button>
          </div>
        ) : (
          /* P11 — no italics; accent link color per the inbox spec */
          <button
            type="button"
            onClick={e => { e.stopPropagation(); setCatPickerOpen(true) }}
            style={{
              display: 'block',
              marginTop: 4,
              fontFamily: 'inherit',
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--text-accent)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 0',
            }}
          >
            Assign category →
          </button>
        )}
      </div>

      {task.due_date && (
        <span className="num" style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', paddingTop: 3 }}>
          {formatDueDate(task.due_date)}
        </span>
      )}

      {/* P9 — drop button hover-revealed */}
      <button
        type="button"
        className="row-action"
        onClick={e => { e.stopPropagation(); onDrop(task.id) }}
        title="Drop task"
        aria-label="Drop task"
        style={{ marginTop: 1 }}
      >
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path d="M1.5 1.5L9.5 9.5M9.5 1.5L1.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
