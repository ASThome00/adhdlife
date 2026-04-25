import { useEffect, useState, useCallback } from 'react'

const STORAGE_KEY = 'adhd-theme'

function readInitial(): boolean {
  if (typeof window === 'undefined') return false
  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved === 'dark') return true
  if (saved === 'light') return false
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

function apply(dark: boolean) {
  const root = document.getElementById('root')
  if (!root) return
  if (dark) root.classList.add('dark')
  else root.classList.remove('dark')
  window.localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
}

export function useDarkMode(): [boolean, () => void] {
  const [dark, setDark] = useState<boolean>(readInitial)

  useEffect(() => { apply(dark) }, [dark])

  const toggle = useCallback(() => setDark(d => !d), [])
  return [dark, toggle]
}
