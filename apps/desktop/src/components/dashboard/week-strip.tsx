import { startOfWeek, addDays, format, isSameDay } from 'date-fns'
import { cn } from '@/lib/utils'

interface Props {
  /** P4 — compact variant that lives in the dashboard header band */
  mini?: boolean
}

export function WeekStrip({ mini }: Props) {
  const today = new Date()
  const monday = startOfWeek(today, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i))

  return (
    <div className={mini ? 'wk-mini' : undefined} style={mini ? undefined : { display: 'flex', gap: 5 }}>
      {days.map(d => {
        const isToday = isSameDay(d, today)
        return (
          <div key={d.toISOString()} className={cn('wday', isToday && 'today')}>
            <span className="wday-name">{format(d, 'EEEEE')}</span>
            <span className="wday-num">{format(d, 'd')}</span>
          </div>
        )
      })}
    </div>
  )
}
