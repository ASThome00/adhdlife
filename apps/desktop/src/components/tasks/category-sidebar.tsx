import { useState } from 'react'
import { useCreateCategory } from '@/lib/hooks/use-data'
import { PRESET_COLORS } from '@/lib/category-colors'
import { cn } from '@/lib/utils'
import type { Category } from '@/lib/queries/habits-categories-books'

interface Props {
  categories: Category[]
  selectedCatId: string | null
  onSelect: (id: string | null) => void
}

/* Borderless category rail — sits directly on the page bg;
   active item = white fill like the main nav (.sub-item). */
export function CategorySidebar({ categories, selectedCatId, onSelect }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [newName,  setNewName]  = useState('')
  const [newColor, setNewColor] = useState<string>(PRESET_COLORS[0])
  const createCat = useCreateCategory()

  function handleCreate() {
    const name = newName.trim()
    if (!name) return
    createCat.mutate({ name, color: newColor }, {
      onSuccess: () => { setShowForm(false); setNewName(''); setNewColor(PRESET_COLORS[0]) },
    })
  }

  return (
    <aside className="subbar">
      <div className="section-label" style={{ marginBottom: 8, paddingLeft: 10 }}>
        Categories
      </div>

      {/* All Tasks */}
      <button
        type="button"
        className={cn('sub-item', !selectedCatId && 'active')}
        onClick={() => onSelect(null)}
      >
        All tasks
      </button>

      {/* Category list */}
      {categories.map(cat => {
        const active = selectedCatId === cat.id
        return (
          <button
            key={cat.id}
            type="button"
            className={cn('sub-item', active && 'active')}
            onClick={() => onSelect(active ? null : cat.id)}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
            {(cat.task_count ?? 0) > 0 && (
              <span className="sub-count">{cat.task_count}</span>
            )}
          </button>
        )
      })}

      <div style={{ flex: 1 }} />

      {/* New category form */}
      {showForm ? (
        <div style={{ padding: '10px 10px 4px' }}>
          <input
            autoFocus
            className="input"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowForm(false) }}
            placeholder="Category name"
            style={{ fontSize: 13, marginBottom: 10 }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                type="button"
                aria-label={`Use color ${c}`}
                onClick={() => setNewColor(c)}
                style={{
                  width: 20, height: 20, borderRadius: '50%', background: c,
                  border: 'none', cursor: 'pointer', padding: 0,
                  boxShadow: newColor === c ? '0 0 0 2px var(--bg-card), 0 0 0 4px var(--accent)' : 'none',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" className="btn-primary" onClick={handleCreate} disabled={!newName.trim() || createCat.isPending} style={{ flex: 1, padding: '6px 0', fontSize: 12 }}>
              Add
            </button>
            <button type="button" className="btn-ghost" onClick={() => setShowForm(false)} style={{ fontSize: 12 }}>
              cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="sub-item"
          onClick={() => setShowForm(true)}
          style={{ color: 'var(--text-muted)', marginTop: 8 }}
        >
          + New category
        </button>
      )}
    </aside>
  )
}
