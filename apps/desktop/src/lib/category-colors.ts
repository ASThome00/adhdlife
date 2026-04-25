import type { Priority } from '@/lib/queries/tasks'

export interface CategoryTheme {
  ink:  string
  wash: string
  name: string
}

/**
 * Design-palette mapping, keyed by the DB category ids seeded in migration 001.
 * The DB's `color` column is ignored for dashboard rendering — the design
 * specifies these specific warm colors and the README is the source of truth.
 */
export const CATEGORY_THEME: Record<string, CategoryTheme> = {
  cat_work:    { ink: '#2563a8', wash: '#e8f0fb', name: 'Work'    },
  cat_school:  { ink: '#96334d', wash: '#fdeef2', name: 'School'  },
  cat_health:  { ink: '#b34040', wash: '#fceaea', name: 'Health'  },
  cat_admin:   { ink: '#b45309', wash: '#fef3dc', name: 'Admin'   },
  cat_growth:  { ink: '#0d7a54', wash: '#e4f5ee', name: 'Growth'  },
  cat_reading: { ink: '#9d1f6e', wash: '#fce8f3', name: 'Reading' },
  cat_social:  { ink: '#b84d0a', wash: '#fef0e6', name: 'Social'  },
  cat_home:    { ink: '#4b5563', wash: '#f0f0ef', name: 'Home'    },
}

const FALLBACK: CategoryTheme = { ink: '#a08060', wash: '#f5ede0', name: 'Uncategorized' }

export function getCategoryTheme(
  categoryId: string | null | undefined,
  displayName?: string | null,
): CategoryTheme {
  if (categoryId && CATEGORY_THEME[categoryId]) return CATEGORY_THEME[categoryId]
  if (displayName) return { ...FALLBACK, name: displayName }
  return FALLBACK
}

export const PRIO: Record<Priority, string> = {
  HIGH:   '#b34040',
  MEDIUM: '#b45309',
  LOW:    '#0d7a54',
}
