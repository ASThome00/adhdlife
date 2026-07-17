// apps/mobile/lib/use-theme.tsx
// Theme context — reads the persisted choice from the settings table and
// applies the matching Quiet Garden token set app-wide.
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { getSettings, updateSettings } from './db'
import { darkTheme, lightTheme, type Theme } from './theme'

interface ThemeContextValue {
  theme: Theme
  mode: 'light' | 'dark'
  setMode: (mode: 'light' | 'dark') => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  mode: 'light',
  setMode: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<'light' | 'dark'>(() => getSettings().theme)

  const setMode = useCallback((next: 'light' | 'dark') => {
    setModeState(next)
    updateSettings({ theme: next })
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme: mode === 'dark' ? darkTheme : lightTheme, mode, setMode }),
    [mode, setMode]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
