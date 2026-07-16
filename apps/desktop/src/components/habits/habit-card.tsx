import { useState } from 'react'
import { cn, getStreakMessage } from '@/lib/utils'
import { useToggleHabit, useUpdateHabit } from '@/lib/hooks/use-data'
import { HabitDotGrid } from './habit-dot-grid'
import type { Habit } from '@/lib/queries/habits-categories-books'

interface Props {
  habit:     Habit
  doneDates: Set<string>
}

export function HabitCard({ habit, doneDates }: Props) {
  const toggle = useToggleHabit()
  const update = useUpdateHabit()
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing,  setEditing]  = useState(false)
  const [draft,    setDraft]    = useState(habit.name)

  const paused = habit.current_streak === 0 && habit.longest_streak > 0
  const message = paused
    ? `Paused at ${habit.longest_streak} days — pick it back up whenever`
    : getStreakMessage(habit.current_streak)

  function commitRename() {
    const n = draft.trim()
    if (n && n !== habit.name) update.mutate({ id: habit.id, data: { name: n } })
    setEditing(false)
  }

  return (
    <div className="card" style={{ marginBottom: 14, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        {/* Today's circle — the big satisfying tap target */}
        <button
          type="button"
          onClick={() => toggle.mutate({ habitId: habit.id, completed: !habit.completed_today })}
          aria-label={`${habit.name}, ${habit.completed_today ? 'done' : 'not done'} today`}
          style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}
        >
          <div className={cn('hcircle', habit.completed_today && 'done')}>
            {habit.completed_today ? (
              <svg width="18" height="14" viewBox="0 0 10 8" fill="none" aria-hidden>
                <path d="M1 4L3.8 7L9 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <span style={{ width: 14, height: 14, borderRadius: '50%', background: habit.color, display: 'inline-block', opacity: 0.75 }} />
            )}
          </div>
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          {editing ? (
            <input
              autoFocus
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onBlur={commitRename}
              onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') { setDraft(habit.name); setEditing(false) } }}
              className="input"
              style={{ fontWeight: 600, fontSize: 15 }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: habit.color, flexShrink: 0 }} />
              <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {habit.name}
              </span>
            </div>
          )}
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
            {message}
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {/* No flame glyphs; DM Mono 16 accent (faint at 0) */}
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 16, fontWeight: 500, color: habit.current_streak > 0 ? 'var(--text-accent)' : 'var(--text-faint)', whiteSpace: 'nowrap' }}>
            {habit.current_streak} day{habit.current_streak === 1 ? '' : 's'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            Best: {habit.longest_streak}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Habit options"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16, padding: '2px 6px', flexShrink: 0, lineHeight: 1, fontFamily: 'inherit' }}
        >
          {'\u22ef'}
        </button>
      </div>

      <HabitDotGrid color={habit.color} doneDates={doneDates} />

      {menuOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setMenuOpen(false)} />
          <div style={{ position: 'absolute', top: 42, right: 14, zIndex: 91, background: 'var(--bg-card)', borderRadius: 13, boxShadow: '0 12px 32px rgba(10, 15, 10, 0.18)', padding: 6, minWidth: 130 }}>
            <MenuItem label="Edit name" onClick={() => { setDraft(habit.name); setEditing(true); setMenuOpen(false) }} />
            <MenuItem label="Archive"   onClick={() => { update.mutate({ id: habit.id, data: { is_archived: true } }); setMenuOpen(false) }} />
          </div>
        </>
      )}
    </div>
  )
}

function MenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 7, border: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 12.5, color: 'var(--text-body)', cursor: 'pointer' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {label}
    </button>
  )
}
