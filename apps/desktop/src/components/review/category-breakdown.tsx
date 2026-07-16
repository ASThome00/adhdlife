import { getCategoryTheme } from '@/lib/category-colors'
import type { WeeklyReviewData } from '@/lib/queries/tasks'

/** CSS-only proportional bars — no chart library, per spec. */
export function CategoryBreakdown({ rows }: { rows: WeeklyReviewData['categoryBreakdown'] }) {
  if (rows.length === 0) return null
  const max = Math.max(...rows.map(r => r.count))

  return (
    <div className="card">
      <div className="card-title">Where the week went</div>
      {rows.map(r => {
        const theme = getCategoryTheme(r.category_id, r.name)
        return (
          <div key={r.category_id ?? 'none'} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: theme.ink, flexShrink: 0 }} />
            <span style={{ fontFamily: 'inherit', fontSize: 12.5, color: 'var(--text-body)', width: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {theme.name}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ height: 8, width: `${Math.max(6, Math.round((r.count / max) * 100))}%`, background: theme.ink, borderRadius: 4, transition: 'width 0.4s' }} />
            </div>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--text-muted)', width: 24, textAlign: 'right', flexShrink: 0 }}>
              {r.count}
            </span>
          </div>
        )
      })}
    </div>
  )
}
