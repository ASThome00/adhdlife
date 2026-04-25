import { CategoryPill } from '@/components/ui/category-pill'
import { getCategoryTheme } from '@/lib/category-colors'
import type { Task } from '@/lib/queries/tasks'

function formatTime(due_time: string | null): string {
  if (!due_time) return ''
  // Accept HH:MM or HH:MM:SS → render as 12h clock
  const [h, m] = due_time.split(':').map(n => parseInt(n, 10))
  if (isNaN(h) || isNaN(m)) return due_time
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = ((h + 11) % 12) + 1
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`
}

export function UpcomingCard({ tasks }: { tasks: Task[] }) {
  return (
    <div className="card">
      <div className="card-title">
        <span aria-hidden>📅</span> Upcoming today
      </div>

      {tasks.length === 0 ? (
        <p
          style={{
            fontFamily: 'Lora, serif',
            fontStyle: 'italic',
            fontSize: 13,
            color: 'var(--text-mono)',
            padding: '8px 4px',
          }}
        >
          Nothing else on the books. Enjoy the space.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tasks.map(t => {
            const theme = getCategoryTheme(t.category_id, t.category_name)
            const timeLabel = formatTime(t.due_time)
            return (
              <div
                key={t.id}
                className="card-lite"
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px' }}
              >
                <div
                  style={{
                    width: 3,
                    height: 32,
                    borderRadius: 2,
                    background: theme.ink,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: 'Geist, sans-serif',
                      fontSize: 13,
                      fontWeight: 500,
                      color: 'var(--text-body)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {t.title}
                  </div>
                  {timeLabel && (
                    <div
                      style={{
                        fontFamily: 'DM Mono, monospace',
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        marginTop: 2,
                      }}
                    >
                      {timeLabel}
                    </div>
                  )}
                </div>
                <CategoryPill categoryId={t.category_id} categoryName={t.category_name} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
