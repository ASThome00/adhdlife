import { useState, useRef, useEffect } from 'react'
import { useUpdateTask, useCompleteTask, useCreateTask, useCategories, useSubtasks, useRecurrence, useSetRecurrence } from '@/lib/hooks/use-data'
import type { Task, Priority, Recurrence } from '@/lib/queries/tasks'

const PRIO_COLORS: Record<Priority, string> = { LOW: '#a08060', MEDIUM: '#c9566e', HIGH: '#96334d' }
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
        borderLeft: '1.5px solid var(--border)',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.06)',
        zIndex: 300,
        display: 'flex', flexDirection: 'column',
        transition: 'transform 0.25s ease',
        transform: 'translateX(0)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1.5px solid var(--border)', flexShrink: 0 }}>
        <span style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>Task details</span>
        <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-muted)', fontSize: 16, lineHeight: 1 }}>×</button>
      </div>

      {/* Scrollable body */}
      <div className="content-scroll" style={{ flex: 1, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Title */}
        <input
          ref={titleRef}
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={() => title.trim() && title !== task.title && save({ title: title.trim() })}
          style={{ border: 'none', borderBottom: '1.5px solid var(--input-border)', background: 'transparent', fontFamily: 'Lora, serif', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', padding: '4px 0', outline: 'none', width: '100%' }}
        />

        {/* Notes */}
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          onBlur={() => notes !== (task.notes ?? '') && save({ notes: notes || null })}
          placeholder="Add notes…"
          rows={3}
          style={{ border: 'none', borderBottom: '1.5px solid var(--input-border)', background: 'transparent', fontFamily: 'Geist, sans-serif', fontSize: 13, color: 'var(--text-body)', padding: '4px 0', outline: 'none', resize: 'none', width: '100%' }}
        />

        {/* Due date */}
        <div>
          <Label>Due date</Label>
          <input
            type="date"
            defaultValue={task.due_date?.slice(0, 10) ?? ''}
            onChange={e => handleDueChange(e.target.value)}
            style={{ border: 'none', borderBottom: '1.5px solid var(--input-border)', background: 'transparent', fontFamily: 'Geist, sans-serif', fontSize: 13, color: 'var(--text-body)', padding: '4px 0', outline: 'none' }}
          />
        </div>

        {/* Priority */}
        <div>
          <Label>Priority</Label>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['LOW', 'MEDIUM', 'HIGH'] as Priority[]).map(p => {
              const sel = task.priority === p
              const c = PRIO_COLORS[p]
              return (
                <button key={p} type="button" onClick={() => save({ priority: p })}
                  style={{ padding: '4px 12px', borderRadius: 7, fontFamily: 'Geist, sans-serif', fontSize: 12, fontWeight: sel ? 600 : 400, border: `1.5px solid ${sel ? c : c + '44'}`, background: sel ? c + '18' : 'transparent', color: sel ? c : 'var(--text-sidebar)', cursor: 'pointer', transition: 'all 0.12s' }}>
                  {p === 'LOW' ? 'Low' : p === 'MEDIUM' ? 'Med' : 'High'}
                </button>
              )
            })}
          </div>
        </div>

        {/* Category */}
        <div>
          <Label>Category</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {cats.map(cat => {
              const sel = task.category_id === cat.id
              const c = cat.color
              return (
                <button key={cat.id} type="button" onClick={() => save({ category_id: sel ? null : cat.id })}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 7, fontFamily: 'Geist, sans-serif', fontSize: 12, fontWeight: sel ? 600 : 400, border: `1.5px solid ${sel ? c : c + '44'}`, background: sel ? c + '18' : 'transparent', color: sel ? c : 'var(--text-sidebar)', cursor: 'pointer', transition: 'all 0.12s' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: c, display: 'inline-block' }} />
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
                <SubCheckbox done={sub.status === 'DONE'} onToggle={() => sub.status !== 'DONE' && completeTask.mutate(sub.id)} />
                <span style={{ fontFamily: 'Geist, sans-serif', fontSize: 13, color: 'var(--text-body)', textDecoration: sub.status === 'DONE' ? 'line-through' : 'none', opacity: sub.status === 'DONE' ? 0.5 : 1 }}>
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
            value={recurrence?.frequency ?? 'NEVER'}
            onChange={e => setRecurrence.mutate({ taskId: task.id, frequency: e.target.value === 'NEVER' ? null : e.target.value as Recurrence['frequency'] })}
            style={{ border: 'none', borderBottom: '1.5px solid var(--input-border)', background: 'transparent', fontFamily: 'Geist, sans-serif', fontSize: 13, color: 'var(--text-body)', padding: '4px 0', outline: 'none' }}
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
    <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-mono)', marginBottom: 6 }}>
      {children}
    </div>
  )
}

function SubCheckbox({ done, onToggle }: { done: boolean; onToggle: () => void }) {
  return (
    <div onClick={onToggle} style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${done ? '#b0435c' : 'var(--text-faint)'}`, background: done ? '#c9566e' : 'transparent', cursor: done ? 'default' : 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
      style={{ border: 'none', borderBottom: '1.5px solid transparent', background: 'transparent', fontFamily: 'Geist, sans-serif', fontStyle: 'italic', fontSize: 13, color: 'var(--text-muted)', padding: '4px 0', outline: 'none', width: '100%', marginTop: 4 }}
      onFocus={e => (e.target.style.borderBottomColor = 'var(--input-border)')}
      onBlur={e => (e.target.style.borderBottomColor = 'transparent')}
    />
  )
}
