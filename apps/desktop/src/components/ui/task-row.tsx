import { useState } from 'react'
import { Checkbox } from './checkbox'
import { CategoryDot } from './category-dot'
import { cn } from '@/lib/utils'
import type { Task } from '@/lib/queries/tasks'

interface Props {
  task: Task
  onComplete: (id: string) => void
  onRowClick?: (id: string) => void
  trailing?: React.ReactNode
}

/* P1 — no priority dot in rows; HIGH priority rings the checkbox.
   P6 — completing fades + sinks the row 250ms before the optimistic
   update reorders it (the mutation's cache update does the reordering). */
export function TaskRow({ task, onComplete, onRowClick, trailing }: Props) {
  const done = task.status === 'DONE'
  const [sinking, setSinking] = useState(false)

  const complete = () => {
    if (done || sinking) return
    setSinking(true)
    setTimeout(() => {
      setSinking(false)
      onComplete(task.id)
    }, 250)
  }

  return (
    <div
      className={cn('task-row', sinking && 'sinking', done && 'done-row')}
      onClick={() => !done && (onRowClick ? onRowClick(task.id) : complete())}
    >
      <Checkbox done={done || sinking} priority={task.priority} onToggle={complete} />
      <span className={cn('task-title', (done || sinking) && 'done')}>{task.title}</span>
      <CategoryDot categoryId={task.category_id} categoryName={task.category_name} />
      {trailing}
    </div>
  )
}
