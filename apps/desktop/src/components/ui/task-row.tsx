import { Checkbox } from './checkbox'
import { PriorityDot } from './priority-dot'
import { CategoryDot } from './category-dot'
import { cn } from '@/lib/utils'
import type { Task } from '@/lib/queries/tasks'

interface Props {
  task: Task
  onComplete: (id: string) => void
  onRowClick?: (id: string) => void
  trailing?: React.ReactNode
}

export function TaskRow({ task, onComplete, onRowClick, trailing }: Props) {
  const done = task.status === 'DONE'
  return (
    <div
      className="task-row"
      style={{ opacity: done ? 0.42 : 1 }}
      onClick={() => !done && (onRowClick ? onRowClick(task.id) : onComplete(task.id))}
    >
      <Checkbox done={done} onToggle={() => !done && onComplete(task.id)} />
      <PriorityDot priority={task.priority} />
      <span className={cn('task-title', done && 'done')}>{task.title}</span>
      <CategoryDot categoryId={task.category_id} categoryName={task.category_name} />
      {trailing}
    </div>
  )
}
