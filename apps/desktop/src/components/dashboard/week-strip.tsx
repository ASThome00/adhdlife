import { startOfWeek, addDays, format, isSameDay } from 'date-fns'
import { cn } from '@/lib/utils'

export function WeekStrip() {
  const today = new Date()
  const monday = startOfWeek(today, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i))

  return (
    <div style={{ display: 'flex', gap: 5 }}>
      {days.map(d => {
        const isToday = isSameDay(d, today)
        return (
          <div key={d.toISOString()} className={cn('wday', isToday && 'today')}>
            <span
              style={{
                fontFamily: 'Geist, sans-serif',
                fontSize: 9,
                fontWeight: 600,
                color: isToday ? 'rgba(255,255,255,0.85)' : 'var(--text-mono)',
              }}
            >
              {format(d, 'EEEEE')}
            </span>
            <span
              style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: 11,
                color: isToday ? 'white' : 'var(--text-sidebar)',
                fontWeight: isToday ? 700 : 400,
              }}
            >
              {format(d, 'd')}
            </span>
          </div>
        )
      })}
    </div>
  )
}
