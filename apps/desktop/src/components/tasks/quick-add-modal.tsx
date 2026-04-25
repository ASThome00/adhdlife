import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCreateTask, useCategories } from '@/lib/hooks/use-data'
import { useQuickAdd } from '@/lib/stores/quick-add'
import { getCategoryTheme, PRIO } from '@/lib/category-colors'
import type { Priority } from '@/lib/queries/tasks'

const PRIO_OPTIONS: Array<{ k: Priority; label: string }> = [
  { k: 'LOW',    label: 'Low'  },
  { k: 'MEDIUM', label: 'Med'  },
  { k: 'HIGH',   label: 'High' },
]

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

  // Reset form whenever the modal opens
  useEffect(() => {
    if (open) {
      setTitle('')
      setSelCat(null)
      setSelPrio('MEDIUM')
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

  async function submit() {
    const t = title.trim()
    if (!t) return
    await createTask.mutateAsync({
      title: t,
      category_id: selCat ?? undefined,
      priority: selPrio,
      is_focus_today: isFocusToday,
    })
    close()
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
              <span style={{ fontFamily: 'Lora, serif', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
                {isFocusToday ? 'Add focus task' : 'Quick add'}
              </span>
              <button
                onClick={close}
                aria-label="Close"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2L12 12M12 2L2 12" stroke="var(--text-mono)" strokeWidth="1.5" strokeLinecap="round" />
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

            {/* Category */}
            <div style={{ marginTop: 18, marginBottom: 6 }}>
              <div style={sectionLabel}>Category</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {categories.map(cat => {
                  const theme = getCategoryTheme(cat.id, cat.name)
                  const selected = selCat === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelCat(selected ? null : cat.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '4px 9px',
                        borderRadius: 7,
                        border: `1.5px solid ${selected ? theme.ink : theme.ink + '44'}`,
                        background: selected ? theme.wash : 'transparent',
                        color: selected ? theme.ink : 'var(--text-sidebar)',
                        fontFamily: 'Geist, sans-serif',
                        fontSize: 12,
                        fontWeight: selected ? 600 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.12s',
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: theme.ink, display: 'inline-block' }} />
                      {theme.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Priority */}
            <div style={{ marginTop: 14 }}>
              <div style={sectionLabel}>Priority</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {PRIO_OPTIONS.map(({ k, label }) => {
                  const selected = selPrio === k
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setSelPrio(k)}
                      style={{
                        padding: '5px 14px',
                        borderRadius: 7,
                        fontFamily: 'Geist, sans-serif',
                        fontSize: 12,
                        fontWeight: selected ? 600 : 400,
                        cursor: 'pointer',
                        border: `1.5px solid ${selected ? PRIO[k] : PRIO[k] + '44'}`,
                        background: selected ? PRIO[k] + '18' : 'transparent',
                        color: selected ? PRIO[k] : 'var(--text-sidebar)',
                        transition: 'all 0.12s',
                      }}
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

const sectionLabel: React.CSSProperties = {
  fontFamily: 'Geist, sans-serif',
  fontSize: 11,
  color: 'var(--text-mono)',
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  marginBottom: 8,
}
