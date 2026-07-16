import { useState } from 'react'
import { format } from 'date-fns'
import { getGreeting } from '@/lib/utils'
import { useSettings } from '@/lib/hooks/use-data'
import { WeekStrip } from './week-strip'

interface Props {
  dark: boolean
  onToggleDark: () => void
  completedToday: number
  totalScheduledToday: number
}

/* P3 — the quote is one line under the greeting (no emoji in UI chrome) */
const QUOTES = [
  'Progress, not perfection.',
  "One thing at a time — that's the whole secret.",
  'Every small step is still a step forward.',
]

/* P12 — "Today" header band: greeting + date + quote left; week strip,
   done chip, and theme toggle right. Sits on the page, no bar chrome. */
export function Topbar({ dark, onToggleDark, completedToday, totalScheduledToday }: Props) {
  const { data: settings } = useSettings()
  const name = settings?.display_name ?? 'friend'
  const today = format(new Date(), 'EEE · MMM d')
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)])

  return (
    <header className="topbar" data-tauri-drag-region>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <h1 className="greeting">{getGreeting(name)}</h1>
          <span className="greeting-date">{today}</span>
        </div>
        <p className="topbar-quote">{quote}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* P4 — mini week strip lives in the header */}
        <WeekStrip mini />

        <div className="done-chip">
          <span className="num" style={{ fontWeight: 500 }}>
            {completedToday}/{totalScheduledToday + completedToday}
          </span>
          <span>done today</span>
          <svg width="12" height="10" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.8 7L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <button
          type="button"
          className="theme-toggle"
          onClick={onToggleDark}
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}
