// Shared framer-motion values for list-item removal — the same gentle fade
// everywhere an item leaves a list (tasks, inbox, habits, books, carried-forward),
// so dropping/archiving/removing feels identical across the app.
export const LIST_ITEM_EXIT = { opacity: 0, scale: 0.96 }
export const LIST_ITEM_TRANSITION = { duration: 0.18, ease: 'easeOut' as const }
