import { useEffect } from 'react'
import { motion } from 'framer-motion'

interface Props {
  message: string
  onUndo: () => void
  onDismiss: () => void
}

export function UndoToast({ message, onUndo, onDismiss }: Props) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <motion.div
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 16, opacity: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        bottom: 28,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--bg-card)',
        borderRadius: 13,
        boxShadow: '0 12px 32px rgba(10, 15, 10, 0.18)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        zIndex: 500,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontFamily: 'inherit', fontSize: 13, color: 'var(--text-body)' }}>
        {message}
      </span>
      <span style={{ color: 'var(--border)', fontSize: 13 }}>|</span>
      <button
        type="button"
        onClick={onUndo}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-accent)',
          padding: 0,
        }}
      >
        Undo
      </button>
    </motion.div>
  )
}
