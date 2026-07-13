import type { WeeklyReviewData } from '@/lib/queries/tasks'

/**
 * Three calm stat cards + per-habit consistency bars.
 * Tone rule: ratios, never deficits — "9 of 14" not "5 missed".
 */
export function StatsRow({ data }: { data: WeeklyReviewData }) {
  const habitAvg = data.habitStats.length
    ? Math.round(
        (data.habitStats.reduce((sum, h) => sum + h.doneDays / h.windowDays, 0) / data.habitStats.length) * 100
      )
    : null

  const stats = [
    { label: 'Tasks done',  value: String(data.completedThisWeek), sub: data.plannedThisWeek > 0 ? `of ${data.plannedThisWeek} planned` : 'this week', color: '#0d7a54' },
    { label: 'Habit avg',   value: habitAvg !== null ? `${habitAvg}%` : '—', sub: `across ${data.habitStats.length} habit${data.habitStats.length === 1 ? '' : 's'}`, color: 'var(--accent)' },
    { label: 'Brain dumps', value: String(data.inboxCleared), sub: 'items sorted', color: '#2563a8' },
  ]

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {stats.map(s => (
          <div key={s.label} className="card" style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 26, fontWeight: 500, color: s.color }}>{s.value}</div>
            <div style={{ fontFamily: 'Lora, serif', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginTop: 4 }}>{s.label}</div>
            <div style={{ fontFamily: 'Geist, sans-serif', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {data.habitStats.length > 0 && (
        <div className="card">
          <div className="card-title"><span aria-hidden>🌱</span> Habit consistency</div>
          {data.habitStats.map(h => {
            const pct = Math.round((h.doneDays / h.windowDays) * 100)
            return (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 }}>
                <span style={{ fontFamily: 'Geist, sans-serif', fontSize: 12.5, color: 'var(--text-body)', width: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {h.name}
                </span>
                <div style={{ flex: 1, height: 8, background: 'var(--bg-card-lite)', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: h.color, borderRadius: 4, transition: 'width 0.4s' }} />
                </div>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--text-muted)', width: 58, textAlign: 'right', flexShrink: 0 }}>
                  {h.doneDays} of {h.windowDays}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
