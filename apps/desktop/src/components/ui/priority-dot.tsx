import { PRIO } from '@/lib/category-colors'
import type { Priority } from '@/lib/queries/tasks'

export function PriorityDot({ priority, size = 6 }: { priority: Priority; size?: number }) {
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: PRIO[priority],
        display: 'inline-block',
        flexShrink: 0,
      }}
    />
  )
}
