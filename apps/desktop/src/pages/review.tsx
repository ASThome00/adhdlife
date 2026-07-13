import { format } from 'date-fns'
import { useWeeklyReview } from '@/lib/hooks/use-data'
import { StatsRow } from '@/components/review/stats-row'
import { CarriedOverCard } from '@/components/review/carried-over-card'
import { PrioritiesCard } from '@/components/review/priorities-card'
import { CategoryBreakdown } from '@/components/review/category-breakdown'

export function ReviewPage() {
  const { data, isLoading } = useWeeklyReview()

  return (
    <>
      <header className="topbar" data-tauri-drag-region>
        <h1 style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 19, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Weekly Review
        </h1>
        {data && (
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: 'var(--text-mono)' }}>
            {format(new Date(data.weekStart), 'MMM d')} – {format(new Date(data.weekEnd), 'MMM d')}
          </span>
        )}
      </header>

      <div className="content-scroll">
        <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {isLoading || !data ? (
            <div style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 14, color: 'var(--text-mono)', padding: '24px 4px' }}>
              Looking back at your week…
            </div>
          ) : (
            <>
              <p style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 14, color: 'var(--text-quote)', lineHeight: 1.6, padding: '0 2px' }}>
                {data.completedThisWeek > 0
                  ? `You got ${data.completedThisWeek} thing${data.completedThisWeek === 1 ? '' : 's'} done this week. That counts.`
                  : 'A quiet week — that happens. Here’s a fresh look at what’s ahead.'}
              </p>
              <StatsRow data={data} />
              <CarriedOverCard tasks={data.carriedOver} />
              <PrioritiesCard />
              <CategoryBreakdown rows={data.categoryBreakdown} />
            </>
          )}
        </div>
      </div>
    </>
  )
}
