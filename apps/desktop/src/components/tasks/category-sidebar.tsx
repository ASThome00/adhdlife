import { useState } from 'react'
import { useCreateCategory } from '@/lib/hooks/use-data'
import type { Category } from '@/lib/queries/habits-categories-books'

const CAT_COLORS = ['#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', '#10B981', '#EC4899', '#F97316', '#6B7280']

interface Props {
  categories: Category[]
  selectedCatId: string | null
  onSelect: (id: string | null) => void
}

export function CategorySidebar({ categories, selectedCatId, onSelect }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [newName,  setNewName]  = useState('')
  const [newColor, setNewColor] = useState(CAT_COLORS[0])
  const createCat = useCreateCategory()

  function handleCreate() {
    const name = newName.trim()
    if (!name) return
    createCat.mutate({ name, color: newColor }, {
      onSuccess: () => { setShowForm(false); setNewName(''); setNewColor(CAT_COLORS[0]) },
    })
  }

  const itemBase: React.CSSProperties = {
    width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 8,
    border: 'none', fontFamily: 'Geist, sans-serif', fontSize: 13, cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2,
    transition: 'background 0.12s, color 0.12s',
  }

  return (
    <aside style={{
      width: 220, flexShrink: 0, background: 'var(--bg-sidebar)',
      borderRight: '1.5px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto', padding: '14px 8px',
    }}>
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-mono)', marginBottom: 8, paddingLeft: 10 }}>
        Categories
      </div>

      {/* All Tasks */}
      <button
        type="button"
        onClick={() => onSelect(null)}
        style={{
          ...itemBase,
          background: !selectedCatId ? 'var(--nav-active-bg)' : 'transparent',
          color: !selectedCatId ? 'var(--nav-active-fg)' : 'var(--text-sidebar)',
          fontWeight: !selectedCatId ? 600 : 400,
        }}
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
            onClick={() => onSelect(active ? null : cat.id)}
            style={{
              ...itemBase,
              background: active ? cat.color + '18' : 'transparent',
              color: active ? cat.color : 'var(--text-sidebar)',
              fontWeight: active ? 600 : 400,
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
            {(cat.task_count ?? 0) > 0 && (
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'var(--text-faint)', marginLeft: 'auto' }}>
                {cat.task_count}
              </span>
            )}
          </button>
        )
      })}

      <div style={{ flex: 1 }} />

      {/* New category form */}
      {showForm ? (
        <div style={{ padding: '8px 10px', borderTop: '1px solid var(--border)', marginTop: 8 }}>
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowForm(false) }}
            placeholder="Category name"
            style={{ width: '100%', border: 'none', borderBottom: '1.5px solid var(--input-border)', background: 'transparent', fontFamily: 'Geist, sans-serif', fontSize: 13, color: 'var(--text-body)', padding: '4px 0', outline: 'none', marginBottom: 10 }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
            {CAT_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setNewColor(c)}
                style={{
                  width: 20, height: 20, borderRadius: '50%', background: c, border: newColor === c ? `2px solid ${c}` : '2px solid transparent',
                  boxShadow: newColor === c ? `0 0 0 2px ${c}33` : 'none',
                  cursor: 'pointer', padding: 0, outline: newColor === c ? `2px solid ${c}` : 'none', outlineOffset: 1,
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
          onClick={() => setShowForm(true)}
          style={{ ...itemBase, color: 'var(--text-faint)', fontStyle: 'italic', borderTop: '1px solid var(--border)', marginTop: 8, marginBottom: 0, paddingTop: 10, paddingBottom: 8, background: 'transparent' }}
        >
          + New category
        </button>
      )}
    </aside>
  )
}
