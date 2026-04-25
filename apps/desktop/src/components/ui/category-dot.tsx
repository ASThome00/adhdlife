import { getCategoryTheme } from '@/lib/category-colors'

interface Props {
  categoryId: string | null | undefined
  categoryName?: string | null
  size?: number
}

export function CategoryDot({ categoryId, categoryName, size = 8 }: Props) {
  const theme = getCategoryTheme(categoryId, categoryName)
  return (
    <span
      aria-label={theme.name}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: theme.ink,
        display: 'inline-block',
        flexShrink: 0,
      }}
    />
  )
}
