// apps/mobile/lib/theme.ts
// Quiet Garden design tokens — ported 1:1 from apps/desktop/src/index.css.
// Mobile has no CSS variables, so components read these through useTheme()
// (lib/use-theme.tsx). Never hardcode hexes in screens.

export interface CategoryTheme {
  ink: string   // dots, dot-grid fills, progress bars
  wash: string  // pill / chip backgrounds
  text: string  // text on wash (≥4.5:1)
}

export interface Theme {
  bgPage: string
  bgCard: string
  bgCardLite: string
  bgSidebar: string
  bgHover: string
  bgAccent: string
  textPrimary: string
  textBody: string
  textMuted: string
  textFaint: string
  textAccent: string
  textQuote: string
  accent: string
  accentDeep: string
  modalOverlay: string
  fabShadow: string
  prioHigh: string
  prioMedium: string
  prioLow: string
  categories: Record<string, CategoryTheme>
  fallbackCategory: CategoryTheme
}

export const lightTheme: Theme = {
  bgPage:       '#eef2ec',
  bgCard:       '#ffffff',
  bgCardLite:   '#f2f6f1',
  bgSidebar:    '#e3e9e0',
  bgHover:      '#e7ede6',
  bgAccent:     '#e1efe7',
  textPrimary:  '#1d2620',
  textBody:     '#37423a',
  textMuted:    '#5b6a5f',
  textFaint:    '#93a297',
  textAccent:   '#2c6350',
  textQuote:    '#2c6350',
  accent:       '#33705c',
  accentDeep:   '#24513f',
  modalOverlay: 'rgba(18, 23, 18, 0.35)',
  fabShadow:    'rgba(51, 112, 92, 0.30)',
  prioHigh:     '#bd5b68',
  prioMedium:   '#99690a',
  prioLow:      '#6a7570',
  categories: {
    cat_work:    { ink: '#4270c0', wash: '#e8eef9', text: '#33599c' },
    cat_school:  { ink: '#7a5bc8', wash: '#f0ebfa', text: '#6347ad' },
    cat_health:  { ink: '#bd5b68', wash: '#f9eaec', text: '#a24451' },
    cat_admin:   { ink: '#99690a', wash: '#f7efdb', text: '#7f5706' },
    cat_growth:  { ink: '#5c9a33', wash: '#ecf4e4', text: '#477a24' },
    cat_reading: { ink: '#ad4796', wash: '#f8e9f4', text: '#93377e' },
    cat_social:  { ink: '#b55c22', wash: '#f9eee4', text: '#984c1a' },
    cat_home:    { ink: '#6a7570', wash: '#eef0ef', text: '#55605b' },
  },
  fallbackCategory: { ink: '#6a7570', wash: '#eef0ef', text: '#55605b' },
}

export const darkTheme: Theme = {
  bgPage:       '#121712',
  bgCard:       '#1c231c',
  bgCardLite:   '#222a22',
  bgSidebar:    '#181e18',
  bgHover:      '#242c24',
  bgAccent:     '#1c3a2e',
  textPrimary:  '#e3e9e2',
  textBody:     '#c8d2c8',
  textMuted:    '#93a396',
  textFaint:    '#66756a',
  textAccent:   '#7cbf9e',
  textQuote:    '#a8cdbb',
  accent:       '#7cbf9e',
  accentDeep:   '#98d0b6',
  modalOverlay: 'rgba(0, 0, 0, 0.55)',
  fabShadow:    'rgba(0, 0, 0, 0.45)',
  prioHigh:     '#d98a95',
  prioMedium:   '#cfa14e',
  prioLow:      '#9aa8a0',
  categories: {
    cat_work:    { ink: '#87aef0', wash: '#1f2c42', text: '#a7c4f4' },
    cat_school:  { ink: '#a98fe8', wash: '#2a2442', text: '#beabee' },
    cat_health:  { ink: '#d98a95', wash: '#3c252a', text: '#e3a6ae' },
    cat_admin:   { ink: '#cfa14e', wash: '#37301c', text: '#dcb672' },
    cat_growth:  { ink: '#8cc063', wash: '#263620', text: '#a5cf85' },
    cat_reading: { ink: '#d183bd', wash: '#382138', text: '#dda1cd' },
    cat_social:  { ink: '#d1915c', wash: '#382a1e', text: '#dcaa7f' },
    cat_home:    { ink: '#9aa8a0', wash: '#29302c', text: '#b3bfb8' },
  },
  fallbackCategory: { ink: '#9aa8a0', wash: '#29302c', text: '#b3bfb8' },
}

/** Category theme by seeded id; custom categories fall back to the DB `color`
 *  as ink with a derived wash (color + alpha), matching desktop's rule. */
export function getCategoryTheme(theme: Theme, categoryId: string | null | undefined, dbColor?: string | null): CategoryTheme {
  if (categoryId && theme.categories[categoryId]) return theme.categories[categoryId]
  if (dbColor) return { ink: dbColor, wash: dbColor + '22', text: dbColor }
  return theme.fallbackCategory
}

// Font family names as registered by useFonts() in app/_layout.tsx.
export const fonts = {
  regular:  'HankenGrotesk_400Regular',
  medium:   'HankenGrotesk_500Medium',
  semibold: 'HankenGrotesk_600SemiBold',
  bold:     'HankenGrotesk_700Bold',
  mono:     'DMMono_400Regular',
  monoMedium: 'DMMono_500Medium',
}
