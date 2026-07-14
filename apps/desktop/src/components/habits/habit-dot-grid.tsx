import { format } from 'date-fns'
import { localDateStr } from '@/lib/db'

interface Props {
  color:     string
  doneDates: Set<string>   // YYYY-MM-DD strings with a completed log
  days?:     number
}

/**
 * 30-day consistency grid. Oldest day first, today last, so the eye reads
 * left→right toward now. Missed days are quiet cream squares — never red.
 */
export function HabitDotGrid({ color, doneDates, days = 30 }: Props) {
  const cells: Array<{ date: string; done: boolean }> = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = localDateStr(d)
    cells.push({ date: dateStr, done: doneDates.has(dateStr) })
  }

  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {cells.map(({ date, done }) => (
        <div
          key={date}
          title={format(new Date(date + 'T12:00:00'), 'EEE MMM d')}
          style={{
            width: 18,
            height: 18,
            borderRadius: 4,
            background: done ? color + 'cc' : 'var(--bg-card-lite)',
            border: `1px solid ${done ? color + '44' : 'var(--border)'}`,
            transition: 'all 0.15s',
          }}
        />
      ))}
    </div>
  )
}
