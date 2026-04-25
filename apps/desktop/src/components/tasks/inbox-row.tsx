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
                  onClick={e => {
                    e.stopPropagation()
                    setCatPickerOpen(false)
                    onAssignCategory(task.id, cat.id)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '3px 8px',
                    borderRadius: 6,
                    border: `1.5px solid ${theme.ink}44`,
                    background: 'transparent',
                    color: 'var(--text-faint)',
                    fontFamily: 'Geist, sans-serif',
                    fontSize: 12,
                    cursor: 'pointer',
                    transition: 'all 0.1s',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget
                    el.style.background = theme.wash
                    el.style.color = theme.ink
                    el.style.borderColor = theme.ink
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget
                    el.style.background = 'transparent'
                    el.style.color = 'var(--text-faint)'
                    el.style.borderColor = `${theme.ink}44`
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: theme.ink, display: 'inline-block' }} />
                  {theme.name}
                </button>
              )
            })}
          </div>
        ) : (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); setCatPickerOpen(true) }}
            style={{
              display: 'block',
              marginTop: 4,
              fontFamily: 'Geist, sans-serif',
              fontSize: 12,
              color: 'var(--text-faint)',
              fontStyle: 'italic',
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
        <span style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: 11,
          color: 'var(--text-muted)',
          whiteSpace: 'nowrap',
          paddingTop: 3,
        }}>
          {formatDueDate(task.due_date)}
        </span>
      )}

      <button
        type="button"
        onClick={e => { e.stopPropagation(); onDrop(task.id) }}
        title="Drop task"
        aria-label="Drop task"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-faint)',
          padding: 4,
          lineHeight: 1,
          flexShrink: 0,
          transition: 'color 0.12s',
          paddingTop: 2,
        }}
        onMouseEnter={e => { (e.currentTarget).style.color = 'var(--text-accent)' }}
        onMouseLeave={e => { (e.currentTarget).style.color = 'var(--text-faint)' }}
      >
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path d="M1.5 1.5L9.5 9.5M9.5 1.5L1.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
