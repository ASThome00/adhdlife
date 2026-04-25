import { create } from 'zustand'

interface QuickAddState {
  open: boolean
  isFocusToday: boolean
  show: (opts?: { isFocusToday?: boolean }) => void
  close: () => void
}

export const useQuickAdd = create<QuickAddState>((set) => ({
  open: false,
  isFocusToday: false,
  show: (opts) => set({ open: true, isFocusToday: opts?.isFocusToday ?? false }),
  close: () => set({ open: false, isFocusToday: false }),
}))
