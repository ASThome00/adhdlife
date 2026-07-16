import { useState } from 'react'
import { motion } from 'framer-motion'
import { useUpdateBook } from '@/lib/hooks/use-data'
import { StarRating } from './star-rating'
import type { Book } from '@/lib/queries/habits-categories-books'

export function FinishBookModal({ book, onClose }: { book: Book; onClose: () => void }) {
  const updateBook = useUpdateBook()
  const [rating, setRating] = useState<number>(0)
  const [notes,  setNotes]  = useState('')

  function submit() {
    updateBook.mutate(
      {
        id: book.id,
        data: {
          status: 'FINISHED',
          finished_at: new Date().toISOString(),
          current_page: book.total_pages ?? book.current_page,
          rating: rating || null,
          notes:  notes.trim() || null,
        },
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
        <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
          Finished
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, marginBottom: 18 }}>
          {book.title}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span className="section-label">Rating</span>
          <StarRating value={rating} onChange={setRating} size={22} />
        </div>

        <textarea
          className="textarea"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Any thoughts you want to keep? (optional)"
          style={{ minHeight: 90, fontSize: 13.5, lineHeight: 1.6 }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
          <button type="button" onClick={onClose} className="btn-ghost">not yet</button>
          <button type="button" onClick={submit} disabled={updateBook.isPending} className="btn-primary">
            Mark finished
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
