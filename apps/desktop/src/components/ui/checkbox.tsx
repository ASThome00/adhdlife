import { cn } from '@/lib/utils'

interface Props {
  done: boolean
  onToggle: () => void
  className?: string
}

export function Checkbox({ done, onToggle, className }: Props) {
  return (
    <div
      role="checkbox"
      aria-checked={done}
      tabIndex={0}
      className={cn('cb', done && 'done', className)}
      onClick={e => { e.stopPropagation(); onToggle() }}
      onKeyDown={e => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          e.stopPropagation()
          onToggle()
        }
      }}
    >
      {done && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden>
          <path d="M1 4L3.8 7L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  )
}
