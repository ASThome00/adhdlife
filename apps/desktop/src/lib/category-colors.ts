import type { Priority } from '@/lib/queries/tasks'

export interface CategoryTheme {
  /** Dot / bar / strong-accent color. CSS var — flips automatically in dark mode. */
  ink:  string
  /** Pale pill background. CSS var — flips automatically in dark mode. */
  wash: string
  /** Text on wash (>=4.5:1 in both modes). CSS var. */
  text: string
  name: string
}

/**
 * Quiet Garden category palette, keyed by the DB category ids seeded in
 * migration 001. Values are CSS variables defined in index.css (light + dark
 * twins), so dark mode flips without any TS involvement. The literal hex
 * values live only in index.css — single source of truth.
 */
export const CATEGORY_THEME: Record<string, CategoryTheme> = {
  cat_work:    { ink: 'var(--cat-work)',    wash: 'var(--cat-work-wash)',    text: 'var(--cat-work-text)',    name: 'Work'    },
  cat_school:  { ink: 'var(--cat-school)',  wash: 'var(--cat-school-wash)',  text: 'var(--cat-school-text)',  name: 'School'  },
  cat_health:  { ink: 'var(--cat-health)',  wash: 'var(--cat-health-wash)',  text: 'var(--cat-health-text)',  name: 'Health'  },
  cat_admin:   { ink: 'var(--cat-admin)',   wash: 'var(--cat-admin-wash)',   text: 'var(--cat-admin-text)',   name: 'Admin'   },
  cat_growth:  { ink: 'var(--cat-growth)',  wash: 'var(--cat-growth-wash)',  text: 'var(--cat-growth-text)',  name: 'Growth'  },
  cat_reading: { ink: 'var(--cat-reading)', wash: 'var(--cat-reading-wash)', text: 'var(--cat-reading-text)', name: 'Reading' },
  cat_social:  { ink: 'var(--cat-social)',  wash: 'var(--cat-social-wash)',  text: 'var(--cat-social-text)',  name: 'Social'  },
  cat_home:    { ink: 'var(--cat-home)',    wash: 'var(--cat-home-wash)',    text: 'var(--cat-home-text)',    name: 'Home'    },
}

const FALLBACK: CategoryTheme = {
  ink:  'var(--cat-home)',
  wash: 'var(--cat-home-wash)',
  text: 'var(--cat-home-text)',
  name: 'Uncategorized',
}

export function getCategoryTheme(
  categoryId: string | null | undefined,
  displayName?: string | null,
): CategoryTheme {
  if (categoryId && CATEGORY_THEME[categoryId]) return CATEGORY_THEME[categoryId]
  if (displayName) return { ...FALLBACK, name: displayName }
  return FALLBACK
}

/**
 * 8 preset swatches for habits + new categories.
 * Literal hexes (light-mode inks) because these are persisted to the DB
 * `color` column — CSS vars can't be stored there.
 */
export const PRESET_COLORS = [
  '#4270c0', '#7a5bc8', '#bd5b68', '#99690a',
  '#5c9a33', '#ad4796', '#b55c22', '#6a7570',
] as const

/** Priority colors — CSS vars so dark mode flips automatically. */
export const PRIO: Record<Priority, string> = {
  HIGH:   'var(--prio-high)',
  MEDIUM: 'var(--prio-medium)',
  LOW:    'var(--prio-low)',
}
