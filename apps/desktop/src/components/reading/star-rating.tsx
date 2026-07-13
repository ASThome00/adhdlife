interface Props {
  value:     number | null
  onChange?: (rating: number) => void
  size?:     number
}

/** Simple ★/☆ rating — rose fill, click to set (read-only when no onChange). */
export function StarRating({ value, onChange, size = 15 }: Props) {
  return (
    <div style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => {
        const filled = (value ?? 0) >= n
        return (
          <button
            key={n}
            type="button"
            disabled={!onChange}
            onClick={() => onChange?.(n)}
            aria-label={`${n} star${n === 1 ? '' : 's'}`}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: onChange ? 'pointer' : 'default',
              fontSize: size,
              lineHeight: 1,
              color: filled ? 'var(--accent)' : 'var(--text-faint)',
              transition: 'color 0.12s',
            }}
          >
            {filled ? '★' : '☆'}
          </button>
        )
      })}
    </div>
  )
}
