import { format } from 'date-fns'
import { getGreeting } from '@/lib/utils'
import { useSettings } from '@/lib/hooks/use-data'

interface Props {
  dark: boolean
  onToggleDark: () => void
  completedToday: number
  totalScheduledToday: number
}

export function Topbar({ dark, onToggleDark, completedToday, totalScheduledToday }: Props) {
  const { data: settings } = useSettings()
  const name = settings?.display_name ?? 'friend'
  const today = format(new Date(), 'EEEE, MMMM d')

  return (
    <header className="topbar" data-tauri-drag-region>
      <div style={{ minWidth: 0 }}>
        <h1
          style={{
            fontFamily: 'Lora, serif',
            fontStyle: 'italic',
            fontSize: 19,
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          {getGreeting(name)}
        </h1>
        <p
          style={{
            fontFamily: 'Geist, sans-serif',
            fontSize: 12,
            color: 'var(--text-muted)',
            marginTop: 1,
          }}
        >
          {today}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          className="theme-toggle"
          onClick={onToggleDark}
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? '☀️' : '🌙'}
        </button>

        <div
          style={{
            background: 'var(--bg-accent)',
            border: '1.5px solid var(--pill-border)',
            borderRadius: 8,
            padding: '7px 14px',
            boxShadow: '2px 2.5px 0px var(--shadow-accent)',
            fontFamily: 'Geist, sans-serif',
            fontSize: 13,
            color: 'var(--text-accent)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontFamily: 'DM Mono, monospace' }}>
            {completedToday} of {totalScheduledToday + completedToday}
          </span>
          <span style={{ fontWeight: 400, color: 'var(--text-accent2)' }}>done today</span>
          <span>✓</span>
        </div>
      </div>
    </header>
  )
}
