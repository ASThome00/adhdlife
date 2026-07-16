import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCreateTask, useCategories } from '@/lib/hooks/use-data'
import { useQuickAdd } from '@/lib/stores/quick-add'
import { getCategoryTheme } from '@/lib/category-colors'
import type { Priority } from '@/lib/queries/tasks'

const PRIO_OPTIONS: Array<{ k: Priority; label: string }> = [
  { k: 'LOW',    label: 'Low'  },
  { k: 'MEDIUM', label: 'Med'  },
  { k: 'HIGH',   label: 'High' },
]

/* Selected priority chip takes its wash bg + ink text. The prio colors are
   shared with the health/admin/home category families (see index.css). */
const PRIO_CHIP: Record<Priority, { wash: string; text: string }> = {
  HIGH:   { wash: 'var(--cat-health-wash)', text: 'var(--cat-health-text)' },
  MEDIUM: { wash: 'var(--cat-admin-wash)',  text: 'var(--cat-admin-text)'  },
  LOW:    { wash: 'var(--cat-home-wash)',   text: 'var(--cat-home-text)'   },
}

type DueSel = 'today' | 'tomorrow' | 'week' | null

const DUE_OPTIONS: Array<{ k: DueSel; label: string }> = [
  { k: 'today',    label: 'Today'     },
  { k: 'tomorrow', label: 'Tomorrow'  },
  { k: 'week',     label: 'This week' },
  { k: null,       label: 'None'      },
]

function getDueDate(sel: DueSel): Date | undefined {
  if (!sel) return undefined
  const d = new Date()
  if (sel === 'today')    { d.setHours(23, 59, 59, 999); return d }
  if (sel === 'tomorrow') { d.setDate(d.getDate() + 1); d.setHours(23, 59, 59, 999); return d }
  const daysUntilFriday = ((5 - d.getDay()) + 7) % 7 || 7
  d.setDate(d.getDate() + daysUntilFriday)
  d.setHours(23, 59, 59, 999)
  return d
}

export function QuickAddModal() {
  const open         = useQuickAdd(s => s.open)
  const isFocusToday = useQuickAdd(s => s.isFocusToday)
  const close        = useQuickAdd(s => s.close)

  const { data: categories = [] } = useCategories()
  const createTask = useCreateTask()
  const inputRef = useRef<HTMLInputElement>(null)

  const [title,   setTitle]   = useState('')
  const [selCat,  setSelCat]  = useState<string | null>(null)
  const [selPrio, setSelPrio] = useState<Priority>('MEDIUM')
  const [selDue,  setSelDue]  = useState<DueSel>(null)

  // Reset form whenever the modal opens
  useEffect(() => {
    if (open) {
      setTitle('')
      setSelCat(null)
      setSelPrio('MEDIUM')
      setSelDue(null)
      // Autofocus input next tick
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  // Escape to close
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  function submit() {
    const t = title.trim()
    if (!t) return
    createTask.mutate(
      { title: t, category_id: selCat ?? undefined, priority: selPrio, due_date: getDueDate(selDue), is_focus_today: isFocusToday },
      { onSuccess: close }
    )
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-bg"
          onClick={close}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="modal"
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{    opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
                {isFocusToday ? 'Add focus task' : 'Quick add'}
              </span>
              <button
                onClick={close}
                aria-label="Close"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2L12 12M12 2L2 12" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <input
              ref={inputRef}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What's on your mind?"
              onKeyDown={e => {
                if (e.key === 'Enter')  { e.preventDefault(); submit() }
              }}
            />

            {/* Category — selected chip takes its wash bg + ink text */}
            <div style={{ marginTop: 18, marginBottom: 6 }}>
              <div className="section-label" style={{ marginBottom: 8 }}>Category</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {categories.map(cat => {
                  const theme = getCategoryTheme(cat.id, cat.name)
                  const selected = selCat === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className="chip"
                      onClick={() => setSelCat(selected ? null : cat.id)}
                      style={selected ? { background: theme.wash, color: theme.text, fontWeight: 600 } : undefined}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: theme.ink, display: 'inline-block' }} />
                      {theme.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Due date — selected chip takes the accent wash */}
            <div style={{ marginTop: 14 }}>
              <div className="section-label" style={{ marginBottom: 8 }}>Due date</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {DUE_OPTIONS.map(({ k, label }) => (
                  <button
                    key={String(k)}
                    type="button"
                    className={selDue === k ? 'chip sel' : 'chip'}
                    onClick={() => setSelDue(k)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority — selected chip takes its wash bg + ink text */}
            <div style={{ marginTop: 14 }}>
              <div className="section-label" style={{ marginBottom: 8 }}>Priority</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {PRIO_OPTIONS.map(({ k, label }) => {
                  const selected = selPrio === k
                  const c = PRIO_CHIP[k]
                  return (
                    <button
                      key={k}
                      type="button"
                      className="chip"
                      onClick={() => setSelPrio(k)}
                      style={selected ? { background: c.wash, color: c.text, fontWeight: 600 } : undefined}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 22 }}>
              <button type="button" onClick={close} className="btn-ghost">cancel</button>
              <button
                type="button"
                onClick={submit}
                disabled={!title.trim() || createTask.isPending}
                className="btn-primary"
              >
                Add task
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
