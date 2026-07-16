import { useEffect, useState } from 'react'
import { useSettings, useUpdateSettings } from '@/lib/hooks/use-data'
import { useTheme, type Theme } from '@/lib/theme'

export function ProfileCard() {
  const { data: settings } = useSettings()
  const updateSettings = useUpdateSettings()
  const [name, setName] = useState('')

  useEffect(() => { if (settings) setName(settings.display_name) }, [settings])

  function save() {
    const n = name.trim()
    if (n && n !== settings?.display_name) updateSettings.mutate({ display_name: n })
  }

  return (
    <div className="card">
      <div className="card-title">Profile</div>
      <input
        className="input"
        value={name}
        onChange={e => setName(e.target.value)}
        onBlur={save}
        onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
        placeholder="Your name"
        style={{ fontSize: 15 }}
      />
      <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6 }}>
        Used for your morning greeting
      </p>
    </div>
  )
}

const THEME_OPTIONS: Array<{ k: Theme; label: string }> = [
  { k: 'light',  label: 'Light'  },
  { k: 'dark',   label: 'Dark'   },
  { k: 'system', label: 'System' },
]

export function AppearanceCard() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="card">
      <div className="card-title">Appearance</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {THEME_OPTIONS.map(({ k, label }) => {
          const selected = theme === k
          return (
            <button
              key={k}
              type="button"
              className={selected ? 'chip sel' : 'chip'}
              onClick={() => setTheme(k)}
            >
              {label}
            </button>
          )
        })}
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 10 }}>
        System follows your computer's light/dark preference
      </p>
    </div>
  )
}

export function FocusCard() {
  const { data: settings } = useSettings()
  const updateSettings = useUpdateSettings()
  const [limit, setLimit] = useState('')

  useEffect(() => { if (settings) setLimit(String(settings.daily_focus_limit)) }, [settings])

  function save() {
    const n = Math.min(20, Math.max(1, parseInt(limit, 10) || 5))
    setLimit(String(n))
    if (n !== settings?.daily_focus_limit) updateSettings.mutate({ daily_focus_limit: n })
  }

  return (
    <div className="card">
      <div className="card-title">Daily focus limit</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <input
          value={limit}
          onChange={e => setLimit(e.target.value.replace(/\D/g, ''))}
          onBlur={save}
          onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
          inputMode="numeric"
          className="input"
          style={{ width: 64, fontFamily: 'DM Mono, monospace', fontSize: 20, textAlign: 'center', color: 'var(--text-accent)' }}
        />
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          focus tasks per day, max
        </span>
      </div>
    </div>
  )
}
