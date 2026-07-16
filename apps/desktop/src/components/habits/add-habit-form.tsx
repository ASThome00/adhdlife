import { useState } from 'react'
import { useCreateHabit } from '@/lib/hooks/use-data'
import { PRESET_COLORS } from '@/lib/category-colors'

/**
 * Inline add-habit form: border-bottom-only name input (modal input style,
 * per Session 5 spec) + 8 preset color swatches + primary Add button.
 */
export function AddHabitForm() {
  const createHabit = useCreateHabit()
  const [name,  setName]  = useState('')
  const [color, setColor] = useState<string>(PRESET_COLORS[0])

  function submit() {
    const n = name.trim()
    if (!n) return
    createHabit.mutate({ name: n, color })
    setName('')
  }

  return (
    <div className="card" style={{ marginBottom: 18, padding: '16px 20px' }}>
      <div style={{ fontFamily: 'inherit', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 10 }}>
        + New habit
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <input
          className="input"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submit() } }}
          placeholder="Something small you want to do daily…"
          style={{ flex: 1, width: 'auto', minWidth: 180 }}
        />

        <div style={{ display: 'flex', gap: 6 }}>
          {PRESET_COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`Color ${c}`}
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: c,
                cursor: 'pointer',
                border: color === c ? `2px solid ${c}` : '2px solid transparent',
                boxShadow: color === c ? `1px 1.5px 0 ${c}` : 'none',
                outline: color === c ? '2px solid var(--bg-card)' : 'none',
                outlineOffset: -4,
                transition: 'all 0.12s',
              }}
            />
          ))}
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={submit}
          disabled={!name.trim() || createHabit.isPending}
        >
          Add
        </button>
      </div>
    </div>
  )
}
