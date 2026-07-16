import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useBooks } from '@/lib/hooks/use-data'
import { BookCard } from '@/components/reading/book-card'
import { AddBookModal } from '@/components/reading/add-book-modal'
import { FinishBookModal } from '@/components/reading/finish-book-modal'
import type { Book, BookStatus } from '@/lib/queries/habits-categories-books'

const COLUMNS: Array<{ status: BookStatus; label: string }> = [
  { status: 'TO_READ',  label: 'To read'  },
  { status: 'READING',  label: 'Reading'  },
  { status: 'FINISHED', label: 'Finished' },
]

const COL_LABEL: React.CSSProperties = {
  fontFamily: 'DM Mono, monospace',
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--text-mono)',
  marginBottom: 10,
}

export function ReadingPage() {
  const { data: books = [], isLoading } = useBooks()
  const [addOpen,    setAddOpen]    = useState(false)
  const [finishBook, setFinishBook] = useState<Book | null>(null)

  return (
    <>
      <header className="topbar" data-tauri-drag-region>
        <h1 className="topbar-title">
          Reading
        </h1>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: 'var(--text-mono)' }}>
          {books.filter(b => b.status === 'READING').length} in progress
        </span>
      </header>

      <div className="content-scroll">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 900 }}>
          {COLUMNS.map(col => {
            const colBooks = books.filter(b => b.status === col.status)
            return (
              <div key={col.status}>
                <div style={COL_LABEL}>
                  {col.label} <span style={{ opacity: 0.7 }}>· {colBooks.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.status === 'TO_READ' && (
                    <button
                      type="button"
                      className="btn-pill-add"
                      onClick={() => setAddOpen(true)}
                      style={{ marginTop: 0, fontSize: 13, padding: '10px 0' }}
                    >
                      + add a book
                    </button>
                  )}
                  {colBooks.map(b => (
                    <BookCard key={b.id} book={b} onFinish={setFinishBook} />
                  ))}
                  {colBooks.length === 0 && col.status !== 'TO_READ' && !isLoading && (
                    <div style={{ fontSize: 12.5, color: 'var(--text-faint)', padding: '8px 2px' }}>
                      {col.status === 'READING' ? 'Nothing in progress — pick one!' : 'Finished books will land here.'}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <AnimatePresence>
        {addOpen && <AddBookModal key="add" onClose={() => setAddOpen(false)} />}
        {finishBook && <FinishBookModal key="finish" book={finishBook} onClose={() => setFinishBook(null)} />}
      </AnimatePresence>
    </>
  )
}
