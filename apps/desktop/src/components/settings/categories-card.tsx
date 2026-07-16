import { useState } from 'react'
import { useAllCategories, useUpdateCategory } from '@/lib/hooks/use-data'
import { getCategoryTheme, PRESET_COLORS } from '@/lib/category-colors'
import type { Category } from '@/lib/queries/habits-categories-books'

/**
 * Category management: rename (inline), recolor (swatch popover), archive
 * toggle, and ↑/↓ reordering. The session spec suggested @dnd-kit for drag
 * reorder — arrows do the same job with zero new dependencies and keyboard
 * accessibility for free; easy to swap for dnd later if dragging matters.
 */
export function CategoriesCard() {
  const { data: categories = [] } = useAllCategories()
  const updateCategory = useUpdateCategory()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft,     setDraft]     = useState('')
  const [colorFor,  setColorFor]  = useState<string | null>(null)

  function commitRename(cat: Category) {
    const n = draft.trim()
    if (n && n !== cat.name) updateCategory.mutate({ id: cat.id, data: { name: n } })
    setEditingId(null)
  }

  function move(index: number, dir: -1 | 1) {
    const other = categories[index + dir]
    const cat   = categories[index]
    if (!other) return
    updateCategory.mutate({ id: cat.id,   data: { sort_order: other.sort_order } })
    updateCategory.mutate({ id: other.id, data: { sort_order: cat.sort_order } })
  }

  const arrowStyle: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-faint)', fontSize: 11, padding: '1px 3px', lineHeight: 1,
  }

  return (
    <div className="card">
      <div className="card-title">Categories</div>
      {categories.map((cat, i) => {
        const theme = getCategoryTheme(cat.id, cat.name)
        const color = getCategoryTheme(cat.id).name !== 'Uncategorized' ? theme.ink : cat.color
        return (
          <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 2px', borderBottom: i < categories.length - 1 ? '1px solid var(--task-border)' : 'none', opacity: cat.is_archived ? 0.5 : 1, position: 'relative' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <button type="button" style={arrowStyle} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">▲</button>
              <button type="button" style={arrowStyle} onClick={() => move(i, 1)} disabled={i === categories.length - 1} aria-label="Move down">▼</button>
            </div>

            <button
              type="button"
              onClick={() => setColorFor(colorFor === cat.id ? null : cat.id)}
              aria-label="Change color"
              style={{ width: 14, height: 14, borderRadius: '50%', background: color, border: 'none', cursor: 'pointer', flexShrink: 0 }}
            />

            {editingId === cat.id ? (
              <input
                autoFocus
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onBlur={() => commitRename(cat)}
                onKeyDown={e => { if (e.key === 'Enter') commitRename(cat); if (e.key === 'Escape') setEditingId(null) }}
                style={{ flex: 1, fontFamily: 'inherit', fontSize: 13, color: 'var(--text-primary)', background: 'transparent', border: 'none', borderBottom: '1.5px solid var(--accent)', outline: 'none', padding: '2px 0' }}
              />
            ) : (
              <button
                type="button"
                onClick={() => { setDraft(cat.name); setEditingId(cat.id) }}
                title="Click to rename"
                style={{ flex: 1, textAlign: 'left', fontFamily: 'inherit', fontSize: 13, color: 'var(--text-body)', background: 'none', border: 'none', cursor: 'text', padding: 0 }}
              >
                {cat.name}
              </button>
            )}

            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'var(--text-faint)' }}>
              {cat.task_count ?? 0}
            </span>

            <button
              type="button"
              className={`toggle-sw${cat.is_archived ? '' : ' on'}`}
              onClick={() => updateCategory.mutate({ id: cat.id, data: { is_archived: !cat.is_archived } })}
              title={cat.is_archived ? 'Archived — click to restore' : 'Active — click to archive'}
              aria-label={`${cat.name} ${cat.is_archived ? 'archived' : 'active'}`}
            />

            {colorFor === cat.id && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setColorFor(null)} />
                <div style={{ position: 'absolute', top: 30, left: 24, zIndex: 91, display: 'flex', gap: 6, background: 'var(--bg-card)', borderRadius: 13, boxShadow: '0 12px 32px rgba(10, 15, 10, 0.18)', padding: '8px 10px' }}>
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => { updateCategory.mutate({ id: cat.id, data: { color: c } }); setColorFor(null) }}
                      aria-label={`Color ${c}`}
                      style={{ width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer', border: 'none', padding: 0, boxShadow: cat.color === c ? '0 0 0 2px var(--bg-card), 0 0 0 4px var(--accent)' : 'none' }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )
      })}
      <p style={{ fontFamily: 'inherit', fontSize: 11, color: 'var(--text-faint)', marginTop: 10 }}>
        Note: the 8 default categories keep their designed colors in lists for now — custom colors apply to new categories.
      </p>
    </div>
  )
}
