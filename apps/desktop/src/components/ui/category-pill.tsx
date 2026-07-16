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
    <span className="cat-pill" style={{ background: theme.wash, color: theme.text }}>
      {theme.name}
    </span>
  )
}
