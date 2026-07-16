import { cn } from '@/lib/utils'
import type { Priority } from '@/lib/queries/tasks'

interface Props {
  done: boolean
  onToggle: () => void
  className?: string
  /** P1 — HIGH renders a tinted inset ring; MEDIUM/LOW look identical */
  priority?: Priority
}

export function Checkbox({ done, onToggle, className, priority }: Props) {
  return (
    <div
      role="checkbox"
      aria-checked={done}
      tabIndex={0}
      className={cn('cb', done && 'done', priority === 'HIGH' && 'prio-high', className)}
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
          {/* stroke overridden to var(--bg-page) by .cb.done svg path in index.css */}
          <path d="M1 4L3.8 7L9 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  )
}
