import { useState } from 'react'
import { format } from 'date-fns'
import { useUpdateBook } from '@/lib/hooks/use-data'
import { StarRating } from './star-rating'
import { getCategoryTheme } from '@/lib/category-colors'
import type { Book } from '@/lib/queries/habits-categories-books'

export function BookCard({ book, onFinish }: { book: Book; onFinish: (b: Book) => void }) {
  const updateBook = useUpdateBook()
  const [editingPage,  setEditingPage]  = useState(false)
  const [pageDraft,    setPageDraft]    = useState('')
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesDraft,   setNotesDraft]   = useState('')

  const genreTheme = getCategoryTheme('cat_reading')
  const pct = book.total_pages ? Math.min(100, Math.round((book.current_page / book.total_pages) * 100)) : 0

  function commitPage() {
    const n = parseInt(pageDraft, 10)
    if (!Number.isNaN(n) && n >= 0) {
      updateBook.mutate({ id: book.id, data: { current_page: book.total_pages ? Math.min(n, book.total_pages) : n } })
    }
    setEditingPage(false)
  }

  function commitNotes() {
    updateBook.mutate({ id: book.id, data: { notes: notesDraft.trim() || null } })
    setEditingNotes(false)
  }

  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ fontFamily: 'Lora, serif', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 3 }}>{book.title}</div>
      {book.author && <div style={{ fontFamily: 'Geist, sans-serif', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{book.author}</div>}

      {book.status === 'TO_READ' && (
        <button
          type="button"
          onClick={() => updateBook.mutate({ id: book.id, data: { status: 'READING', started_at: new Date().toISOString() } })}
          style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 12.5, color: 'var(--accent)', background: 'transparent', border: '1.5px dashed var(--border)', borderRadius: 7, padding: '5px 12px', cursor: 'pointer', transition: 'border-color 0.15s', marginTop: 2 }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          Start reading →
        </button>
      )}

      {book.status === 'READING' && (
        <>
          {book.total_pages != null && (
            <div style={{ height: 4, background: 'var(--bg-card-lite)', borderRadius: 2, border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 5 }}>
              <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: 2, transition: 'width 0.4s' }} />
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            {editingPage ? (
              <input
                autoFocus
                value={pageDraft}
                onChange={e => setPageDraft(e.target.value.replace(/\D/g, ''))}
                onBlur={commitPage}
                onKeyDown={e => { if (e.key === 'Enter') commitPage(); if (e.key === 'Escape') setEditingPage(false) }}
                inputMode="numeric"
                style={{ width: 56, fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--text-primary)', background: 'var(--bg-card-lite)', border: '1.5px solid var(--input-border)', borderRadius: 6, padding: '2px 6px', outline: 'none' }}
              />
            ) : (
              <button
                type="button"
                onClick={() => { setPageDraft(String(book.current_page)); setEditingPage(true) }}
                title="Update page"
                style={{ fontFamily: 'DM Mono, monospace', fontSize: 10.5, color: 'var(--text-muted)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                p. {book.current_page}{book.total_pages ? ` / ${book.total_pages}` : ''}
              </button>
            )}
            <button type="button" className="btn-primary" style={{ padding: '4px 10px', fontSize: 11.5 }} onClick={() => onFinish(book)}>
              Mark finished
            </button>
          </div>
        </>
      )}

      {book.status === 'FINISHED' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <StarRating value={book.rating} onChange={r => updateBook.mutate({ id: book.id, data: { rating: r } })} size={14} />
            {book.finished_at && (
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'var(--text-muted)' }}>
                {format(new Date(book.finished_at), 'MMM d, yyyy')}
              </span>
            )}
          </div>
          {editingNotes ? (
            <textarea
              autoFocus
              value={notesDraft}
              onChange={e => setNotesDraft(e.target.value)}
              onBlur={commitNotes}
              style={{ width: '100%', minHeight: 60, marginTop: 8, resize: 'vertical', fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 12, lineHeight: 1.55, color: 'var(--text-body)', background: 'transparent', border: 'none', borderBottom: '1.5px solid var(--input-border)', padding: '4px 0', outline: 'none' }}
            />
          ) : (
            <div
              onClick={() => { setNotesDraft(book.notes ?? ''); setEditingNotes(true) }}
              title="Click to edit notes"
              style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 12, lineHeight: 1.55, color: book.notes ? 'var(--text-quote)' : 'var(--text-faint)', marginTop: 8, cursor: 'text', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}
            >
              {book.notes || 'Add a note…'}
            </div>
          )}
        </>
      )}

      {book.genre && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 10, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontFamily: 'Geist, sans-serif', border: `1.5px solid ${genreTheme.ink}44`, background: genreTheme.wash, color: genreTheme.ink }}>
          {book.genre}
        </span>
      )}
    </div>
  )
}
