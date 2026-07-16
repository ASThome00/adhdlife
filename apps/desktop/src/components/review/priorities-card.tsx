import { useEffect, useState } from 'react'
import { useSettings, useUpdateSettings } from '@/lib/hooks/use-data'

/**
 * "Top 3 priorities for next week" — three real form fields (boxed, per the
 * design: this is a form, not an inline edit). Saved to settings on blur.
 */
export function PrioritiesCard() {
  const { data: settings } = useSettings()
  const updateSettings = useUpdateSettings()
  const [values, setValues] = useState<string[]>(['', '', ''])

  useEffect(() => {
    if (settings) {
      const p = settings.next_week_priorities
      setValues([p[0] ?? '', p[1] ?? '', p[2] ?? ''])
    }
  }, [settings])

  function save() {
    updateSettings.mutate({ next_week_priorities: values.map(v => v.trim()) })
  }

  return (
    <div className="card">
      <div className="card-title">Top 3 priorities next week</div>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: i < 2 ? 10 : 0 }}>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: 'var(--text-accent)', fontWeight: 600, width: 16 }}>
            {i + 1}.
          </span>
          <input
            className="input"
            value={values[i]}
            onChange={e => setValues(vs => vs.map((v, j) => (j === i ? e.target.value : v)))}
            onBlur={save}
            placeholder={`Priority ${i + 1}…`}
            style={{ flex: 1, width: 'auto', fontSize: 13.5 }}
          />
        </div>
      ))}
    </div>
  )
}
