import { useQuickAdd } from '@/lib/stores/quick-add'

export function QuickAddFab() {
  const show = useQuickAdd(s => s.show)
  return (
    <button
      type="button"
      className="fab"
      onClick={() => show()}
      title="Quick add"
      aria-label="Quick add task"
    >
      +
    </button>
  )
}
