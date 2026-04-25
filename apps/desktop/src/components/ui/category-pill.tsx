import { getCategoryTheme } from '@/lib/category-colors'

export function CategoryPill({
  categoryId,
  categoryName,
}: {
  categoryId: string | null | undefined
  categoryName?: string | null
}) {
  const theme = getCategoryTheme(categoryId, categoryName)
  return (
    <span
      style={{
        background: theme.wash,
        color: theme.ink,
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 500,
        padding: '2px 7px',
        border: `1px solid ${theme.ink}22`,
        whiteSpace: 'nowrap',
      }}
    >
      {theme.name}
    </span>
  )
}
