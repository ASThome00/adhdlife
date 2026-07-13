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
        <div style={{ fontFamily: 'Lora, serif', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
          Finished! 🎉
        </div>
        <div style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 13, color: 'var(--text-muted)', marginTop: 4, marginBottom: 18 }}>
          {book.title}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--text-mono)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Rating
          </span>
          <StarRating value={rating} onChange={setRating} size={22} />
        </div>

        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Any thoughts you want to keep? (optional)"
          style={{
            width: '100%',
            minHeight: 90,
            resize: 'vertical',
            fontFamily: 'Lora, serif',
            fontStyle: 'italic',
            fontSize: 13.5,
            lineHeight: 1.6,
            color: 'var(--text-body)',
            background: 'transparent',
            border: 'none',
            borderBottom: '1.5px solid var(--input-border)',
            padding: '6px 0',
            outline: 'none',
          }}
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
