import { useState, useRef, useEffect } from 'react'
import { useUpdateTask, useCompleteTask, useCreateTask, useCategories, useSubtasks, useRecurrence, useSetRecurrence } from '@/lib/hooks/use-data'
import { getCategoryTheme } from '@/lib/category-colors'
import type { Task, Priority, Recurrence } from '@/lib/queries/tasks'

/* Selected priority chip takes its wash bg + ink text (shared families) */
const PRIO_CHIP: Record<Priority, { wash: string; text: string }> = {
  HIGH:   { wash: 'var(--cat-health-wash)', text: 'var(--cat-health-text)' },
  MEDIUM: { wash: 'var(--cat-admin-wash)',  text: 'var(--cat-admin-text)'  },
  LOW:    { wash: 'var(--cat-home-wash)',   text: 'var(--cat-home-text)'   },
}
const RECUR_OPTIONS: Array<{ value: Recurrence['frequency'] | 'NEVER'; label: string }> = [
  { value: 'NEVER',   label: 'Never' },
  { value: 'DAILY',   label: 'Daily' },
  { value: 'WEEKLY',  label: 'Weekly' },
  { value: 'BIWEEKLY',label: 'Biweekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY',  label: 'Yearly' },
]

interface Props {
  task: Task | null
  onClose: () => void
}

export function TaskDetailPanel({ task, onClose }: Props) {
  const [title, setTitle]     = useState(task?.title ?? '')
  const [notes, setNotes]     = useState(task?.notes ?? '')
  const titleRef              = useRef<HTMLInputElement>(null)

  useEffect(() => { setTitle(task?.title ?? ''); setNotes(task?.notes ?? '') }, [task?.id])

  const updateTask    = useUpdateTask()
  const completeTask  = useCompleteTask()
  const createTask    = useCreateTask()
  const { data: cats = [] }     = useCategories()
  const { data: subtasks = [] } = useSubtasks(task?.id ?? '')
  const { data: recurrence }    = useRecurrence(task?.id ?? '')
  const setRecurrence = useSetRecurrence()

  if (!task) return null

  function save(data: Parameters<typeof updateTask.mutate>[0]['data']) {
    if (!task) return
    updateTask.mutate({ id: task.id, data })
  }

  function handleDueChange(val: string) {
    if (!val) { save({ due_date: null }); return }
    const d = new Date(val)
    d.setHours(23, 59, 59, 999)
    save({ due_date: d.toISOString() })
  }

  return (
    <div
      style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 360,
        background: 'var(--bg-card)',
        boxShadow: '-12px 0 32px rgba(10, 15, 10, 0.14)',
        zIndex: 300,
        display: 'flex', flexDirection: 'column',
        transition: 'transform 0.25s ease',
        transform: 'translateX(0)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px', flexShrink: 0 }}>
        <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>Task details</span>
        <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-muted)', fontSize: 16, lineHeight: 1, fontFamily: 'inherit' }}>×</button>
      </div>

      {/* Scrollable body */}
      <div className="content-scroll" style={{ flex: 1, padding: '4px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Title */}
        <input
          ref={titleRef}
          className="input"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={() => title.trim() && title !== task.title && save({ title: title.trim() })}
          style={{ fontSize: 15, fontWeight: 600 }}
        />

        {/* Notes */}
        <textarea
          className="textarea"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          onBlur={() => notes !== (task.notes ?? '') && save({ notes: notes || null })}
          placeholder="Add notes…"
          rows={3}
          style={{ minHeight: 72, fontSize: 13, resize: 'none' }}
        />

        {/* Due date */}
        <div>
          <Label>Due date</Label>
          <input
            type="date"
            className="input"
            defaultValue={task.due_date?.slice(0, 10) ?? ''}
            onChange={e => handleDueChange(e.target.value)}
            style={{ fontSize: 13, width: 'auto' }}
          />
        </div>

        {/* Priority */}
        <div>
          <Label>Priority</Label>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['LOW', 'MEDIUM', 'HIGH'] as Priority[]).map(p => {
              const sel = task.priority === p
              const c = PRIO_CHIP[p]
              return (
                <button key={p} type="button" className="chip"
                  onClick={() => save({ priority: p })}
                  style={sel ? { background: c.wash, color: c.text, fontWeight: 600 } : undefined}>
                  {p === 'LOW' ? 'Low' : p === 'MEDIUM' ? 'Med' : 'High'}
                </button>
              )
            })}
          </div>
        </div>

        {/* Focus */}
        <div>
          <Label>Focus</Label>
          <button
            type="button"
            className={task.is_focus_today ? 'chip sel' : 'chip'}
            onClick={() => save(task.is_focus_today ? { is_focus_today: false } : { is_focus_today: true, status: 'ACTIVE' })}
          >
            {task.is_focus_today ? 'Focused today' : "Add to today's focus"}
          </button>
        </div>

        {/* Category */}
        <div>
          <Label>Category</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {cats.map(cat => {
              const sel = task.category_id === cat.id
              const theme = getCategoryTheme(cat.id, cat.name)
              return (
                <button key={cat.id} type="button" className="chip"
                  onClick={() => save({ category_id: sel ? null : cat.id })}
                  style={sel ? { background: theme.wash, color: theme.text, fontWeight: 600 } : undefined}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: theme.ink, display: 'inline-block' }} />
                  {cat.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Subtasks */}
        <div>
          <Label>Subtasks</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {subtasks.map(sub => (
              <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <SubCheckbox done={sub.status === 'DONE'} onToggle={() => sub.status === 'DONE' ? updateTask.mutate({ id: sub.id, data: { status: 'ACTIVE' } }) : completeTask.mutate(sub.id)} />
                <span style={{ fontSize: 13, color: 'var(--text-body)', textDecoration: sub.status === 'DONE' ? 'line-through' : 'none', opacity: sub.status === 'DONE' ? 0.5 : 1 }}>
                  {sub.title}
                </span>
              </div>
            ))}
            <AddSubtaskInput parentId={task.id} onCreate={input => createTask.mutate(input)} />
          </div>
        </div>

        {/* Recurrence */}
        <div>
          <Label>Repeat</Label>
          <select
            className="input"
            value={recurrence?.frequency ?? 'NEVER'}
            onChange={e => setRecurrence.mutate({ taskId: task.id, frequency: e.target.value === 'NEVER' ? null : e.target.value as Recurrence['frequency'] })}
            style={{ fontSize: 13, width: 'auto' }}
          >
            {RECUR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="section-label" style={{ marginBottom: 6 }}>
      {children}
    </div>
  )
}

function SubCheckbox({ done, onToggle }: { done: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      className={done ? 'cb done' : 'cb'}
      style={{ width: 16, height: 16, borderRadius: 5 }}
    >
      {done && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </div>
  )
}

function AddSubtaskInput({ parentId, onCreate }: { parentId: string; onCreate: (input: any) => void }) {
  const [val, setVal] = useState('')
  return (
    <input
      value={val}
      onChange={e => setVal(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter' && val.trim()) {
          onCreate({ title: val.trim(), parent_task_id: parentId })
          setVal('')
        }
      }}
      placeholder="+ Add subtask"
      style={{ border: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13, color: 'var(--text-muted)', padding: '4px 0', outline: 'none', width: '100%', marginTop: 4 }}
    />
  )
}
