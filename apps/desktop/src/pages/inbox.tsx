import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBrainDump, useTasks, useUpdateTask, useCategories } from '@/lib/hooks/use-data'
import { getCategoryTheme } from '@/lib/category-colors'
import { InboxRow } from '@/components/tasks/inbox-row'

type DueSel = 'today' | 'tomorrow' | 'week'

function computeDue(sel: DueSel): string {
  const d = new Date()
  if (sel === 'today') {
    d.setHours(23, 59, 59, 999)
  } else if (sel === 'tomorrow') {
    d.setDate(d.getDate() + 1)
    d.setHours(23, 59, 59, 999)
  } else {
    const daysUntilFriday = ((5 - d.getDay()) + 7) % 7 || 7
    d.setDate(d.getDate() + daysUntilFriday)
    d.setHours(23, 59, 59, 999)
  }
  return d.toISOString()
}

const SECTION_LABEL: React.CSSProperties = {
  fontFamily: 'Geist, sans-serif',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--text-mono)',
}

export function InboxPage() {
  const [dumpText,    setDumpText]    = useState('')
  const [hiddenIds,   setHiddenIds]   = useState<Set<string>>(new Set())
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkMode,    setBulkMode]    = useState<'cat' | 'due' | null>(null)

  const brainDump  = useBrainDump()
  const updateTask = useUpdateTask()
  const { data: tasks      = [] } = useTasks({ status: 'INBOX' })
  const { data: categories = [] } = useCategories()

  const visibleTasks = tasks.filter(t => !hiddenIds.has(t.id))

  function hide(id: string) {
    setHiddenIds(prev => new Set([...prev, id]))
  }

  function handleDump() {
    const text = dumpText.trim()
    if (!text || brainDump.isPending) return
    brainDump.mutate(text)
    setDumpText('')
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function handleAssignCategory(taskId: string, catId: string) {
    hide(taskId)
    updateTask.mutate({ id: taskId, data: { category_id: catId } })
    setSelectedIds(prev => { const n = new Set(prev); n.delete(taskId); return n })
  }

  function handleDrop(taskId: string) {
    hide(taskId)
    updateTask.mutate({ id: taskId, data: { status: 'DROPPED' } })
    setSelectedIds(prev => { const n = new Set(prev); n.delete(taskId); return n })
  }

  function handleBulkDrop() {
    for (const id of selectedIds) {
      hide(id)
      updateTask.mutate({ id, data: { status: 'DROPPED' } })
    }
    setSelectedIds(new Set())
    setBulkMode(null)
  }

  function handleBulkAssignCat(catId: string) {
    for (const id of selectedIds) {
      hide(id)
      updateTask.mutate({ id, data: { category_id: catId } })
    }
    setSelectedIds(new Set())
    setBulkMode(null)
  }

  function handleBulkSetDue(sel: DueSel) {
    const due_date = computeDue(sel)
    for (const id of selectedIds) {
      updateTask.mutate({ id, data: { due_date } })
    }
    setSelectedIds(new Set())
    setBulkMode(null)
  }

  const isMac = navigator.platform?.includes('Mac')

  return (
    <>
      <header className="topbar" data-tauri-drag-region>
        <h1 style={{
          fontFamily: 'Lora, serif',
          fontStyle: 'italic',
          fontSize: 19,
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}>
          Inbox
        </h1>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: 'var(--text-mono)' }}>
          {visibleTasks.length} unsorted
        </span>
      </header>

      <div className="content-scroll">
        <div style={{ maxWidth: 640 }}>

          {/* Brain dump card */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">🧠 Brain dump</div>
            <textarea
              value={dumpText}
              onChange={e => setDumpText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  handleDump()
                }
              }}
              placeholder="What's on your mind? One thought per line."
              style={{
                width: '100%',
                minHeight: 120,
                resize: 'vertical',
                fontFamily: 'Lora, serif',
                fontStyle: 'italic',
                fontSize: 14,
                lineHeight: 1.7,
                color: 'var(--text-body)',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                padding: '4px 0',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <span style={{ fontFamily: 'Geist, sans-serif', fontSize: 11, color: 'var(--text-faint)' }}>
                {isMac ? '⌘' : 'Ctrl'}+Enter to dump
              </span>
              <button
                type="button"
                className="btn-primary"
                disabled={!dumpText.trim() || brainDump.isPending}
                onClick={handleDump}
              >
                {brainDump.isPending ? 'Dumping…' : 'Dump it'}
              </button>
            </div>
          </div>

          {/* Inbox list */}
          {visibleTasks.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={SECTION_LABEL}>Inbox</span>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--text-mono)' }}>
                  ({visibleTasks.length} unsorted)
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {visibleTasks.map(task => (
                  <InboxRow
                    key={task.id}
                    task={task}
                    categories={categories}
                    selected={selectedIds.has(task.id)}
                    onToggleSelect={toggleSelect}
                    onAssignCategory={handleAssignCategory}
                    onDrop={handleDrop}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {visibleTasks.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '48px 0',
              fontFamily: 'Lora, serif',
              fontStyle: 'italic',
              fontSize: 15,
              color: 'var(--text-muted)',
            }}>
              You're all sorted! Brain dump anything new above.
            </div>
          )}

        </div>
      </div>

      {/* Bulk action bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border)',
              borderRadius: 14,
              boxShadow: '3px 4px 0px var(--shadow)',
              padding: '14px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              minWidth: 340,
              zIndex: 300,
            }}
          >
            {/* Row 1: count + action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: 'var(--text-mono)', marginRight: 4 }}>
                {selectedIds.size} selected
              </span>
              <BulkBtn active={bulkMode === 'cat'} onClick={() => setBulkMode(m => m === 'cat' ? null : 'cat')}>
                Assign category
              </BulkBtn>
              <BulkBtn active={bulkMode === 'due'} onClick={() => setBulkMode(m => m === 'due' ? null : 'due')}>
                Set due date
              </BulkBtn>
              <button
                type="button"
                onClick={handleBulkDrop}
                style={{
                  marginLeft: 'auto',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Geist, sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--text-accent)',
                  padding: '4px 8px',
                }}
              >
                Drop all
              </button>
            </div>

            {/* Bulk category picker */}
            {bulkMode === 'cat' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {categories.map(cat => {
                  const theme = getCategoryTheme(cat.id, cat.name)
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleBulkAssignCat(cat.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '4px 9px',
                        borderRadius: 7,
                        border: `1.5px solid ${theme.ink}44`,
                        background: 'transparent',
                        color: 'var(--text-sidebar)',
                        fontFamily: 'Geist, sans-serif',
                        fontSize: 12,
                        cursor: 'pointer',
                        transition: 'all 0.1s',
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: theme.ink, display: 'inline-block' }} />
                      {theme.name}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Bulk due date picker */}
            {bulkMode === 'due' && (
              <div style={{ display: 'flex', gap: 6 }}>
                {(['today', 'tomorrow', 'week'] as const).map(sel => (
                  <button
                    key={sel}
                    type="button"
                    onClick={() => handleBulkSetDue(sel)}
                    style={{
                      padding: '5px 11px',
                      borderRadius: 7,
                      fontFamily: 'Geist, sans-serif',
                      fontSize: 12,
                      cursor: 'pointer',
                      border: '1.5px solid var(--border)',
                      background: 'transparent',
                      color: 'var(--text-mono)',
                      transition: 'all 0.12s',
                    }}
                  >
                    {sel === 'today' ? 'Today' : sel === 'tomorrow' ? 'Tomorrow' : 'This week'}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function BulkBtn({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: 'Geist, sans-serif',
        fontSize: 12,
        fontWeight: active ? 600 : 400,
        color: active ? 'var(--text-accent)' : 'var(--text-sidebar)',
        background: active ? 'var(--bg-accent)' : 'transparent',
        border: `1.5px solid ${active ? 'var(--pill-border)' : 'var(--border)'}`,
        borderRadius: 7,
        padding: '4px 10px',
        cursor: 'pointer',
        transition: 'all 0.12s',
      }}
    >
      {children}
    </button>
  )
}
