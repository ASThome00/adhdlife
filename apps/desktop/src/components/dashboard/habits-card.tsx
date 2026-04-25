import { cn } from '@/lib/utils'
import { useToggleHabit } from '@/lib/hooks/use-data'

interface DashboardHabit {
  id: string
  name: string
  color: string
  current_streak: number
  completed_today: boolean
}

export function HabitsCard({ habits }: { habits: DashboardHabit[] }) {
  const toggle = useToggleHabit()

  return (
    <div className="card">
      <div className="card-title">
        <span aria-hidden>🌱</span> Today's habits
      </div>

      {habits.length === 0 ? (
        <p
          style={{
            fontFamily: 'Lora, serif',
            fontStyle: 'italic',
            fontSize: 13,
            color: 'var(--text-mono)',
            padding: '8px 4px',
          }}
        >
          No habits yet — add your first one in the Habits tab.
        </p>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
          {habits.slice(0, 6).map(h => (
            <button
              key={h.id}
              type="button"
              onClick={() =>
                toggle.mutate({ habitId: h.id, completed: !h.completed_today })
              }
              style={{
                textAlign: 'center',
                flex: 1,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
              aria-label={`${h.name}, ${h.completed_today ? 'done' : 'not done'} today`}
            >
              <div className={cn('hcircle', h.completed_today && 'done')}>
                {h.completed_today ? (
                  <svg width="18" height="14" viewBox="0 0 10 8" fill="none" aria-hidden>
                    <path d="M1 4L3.8 7L9 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: h.color || 'var(--text-faint)',
                      display: 'inline-block',
                      opacity: 0.8,
                    }}
                  />
                )}
              </div>
              <div
                style={{
                  fontFamily: 'Geist, sans-serif',
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  marginTop: 6,
                  fontWeight: 500,
                  maxWidth: 72,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {h.name}
              </div>
              <div
                style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: 10,
                  color: h.completed_today ? 'var(--text-accent)' : 'var(--text-faint)',
                  marginTop: 2,
                }}
              >
                🔥 {h.current_streak}d
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
