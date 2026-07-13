import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCreateBook } from '@/lib/hooks/use-data'

const FIELD_LABEL: React.CSSProperties = {
  fontFamily: 'DM Mono, monospace',
  fontSize: 11,
  color: 'var(--text-mono)',
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  marginBottom: 4,
  marginTop: 14,
}

export function AddBookModal({ onClose }: { onClose: () => void }) {
  const createBook = useCreateBook()
  const [title,  setTitle]  = useState('')
  const [author, setAuthor] = useState('')
  const [genre,  setGenre]  = useState('')
  const [pages,  setPages]  = useState('')

  function submit() {
    const t = title.trim()
    if (!t) return
    createBook.mutate(
      {
        title: t,
        author: author.trim() || null,
        genre:  genre.trim()  || null,
        total_pages: pages ? Math.max(1, parseInt(pages, 10) || 0) || null : null,
      },
      { onSuccess: onClose }
    )
  }

  return (
    <motion.div
      className="modal-bg"
      onClick={onClose}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <motion.div
        className="modal"
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        <div style={{ fontFamily: 'Lora, serif', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginBottom: 14 }}>
          Add a book
        </div>

        <div style={FIELD_LABEL}>Title</div>
        <input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="What are you going to read?"
          onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onClose() }} />

        <div style={FIELD_LABEL}>Author</div>
        <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Optional" />

        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={FIELD_LABEL}>Genre</div>
            <input value={genre} onChange={e => setGenre(e.target.value)} placeholder="Optional" />
          </div>
          <div style={{ width: 110 }}>
            <div style={FIELD_LABEL}>Pages</div>
            <input value={pages} onChange={e => setPages(e.target.value.replace(/\D/g, ''))} placeholder="e.g. 320" inputMode="numeric" />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 22 }}>
          <button type="button" onClick={onClose} className="btn-ghost">cancel</button>
          <button type="button" onClick={submit} disabled={!title.trim() || createBook.isPending} className="btn-primary">
            Add book
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
