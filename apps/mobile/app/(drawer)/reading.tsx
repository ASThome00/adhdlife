// Reading — To Read / Reading / Finished pill tabs, pleasure-first.
import { useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { getBooks, type Book, type BookStatus } from '../../lib/db'
import { fonts } from '../../lib/theme'
import { useTheme } from '../../lib/use-theme'
import { EmptyState } from '../../components/empty-state'
import { ScreenHeader } from '../../components/screen-header'
import { Fab } from '../../components/fab'
import { AddBookSheet } from '../../components/add-book-sheet'
import { BookDetailSheet } from '../../components/book-detail-sheet'

const TABS: Array<[BookStatus, string]> = [
  ['TO_READ', 'To read'],
  ['READING', 'Reading'],
  ['FINISHED', 'Finished'],
]

const EMPTY_COPY: Record<string, string> = {
  TO_READ: 'Nothing on the shelf yet. Add a book you keep meaning to start.',
  READING: 'Nothing in progress. Pick something from your shelf — no pressure.',
  FINISHED: 'Finished books will collect here. There is no hurry.',
}

export default function ReadingScreen() {
  const { theme } = useTheme()
  const [tab, setTab] = useState<BookStatus>('READING')
  const [addOpen, setAddOpen] = useState(false)
  const [selected, setSelected] = useState<Book | null>(null)

  const { data: books = [] } = useQuery({ queryKey: ['books'], queryFn: getBooks })
  const visible = books.filter(b => b.status === tab)

  return (
    <SafeAreaView style={[styles.page, { backgroundColor: theme.bgPage }]} edges={['top']}>
      <ScreenHeader title="Reading" />

      <View style={styles.tabRow}>
        {TABS.map(([status, label]) => {
          const active = tab === status
          return (
            <Pressable
              key={status}
              onPress={() => setTab(status)}
              style={[styles.tab, { backgroundColor: active ? theme.bgAccent : theme.bgCardLite }]}
            >
              <Text style={[styles.tabText, { color: active ? theme.textAccent : theme.textMuted }]}>
                {label}
              </Text>
            </Pressable>
          )
        })}
      </View>

      <FlatList
        data={visible}
        keyExtractor={b => b.id}
        contentContainerStyle={styles.scroll}
        renderItem={({ item }) => {
          const pct = item.total_pages
            ? Math.min(100, Math.round((item.current_page / item.total_pages) * 100))
            : 0
          return (
            <Pressable
              onPress={() => setSelected(item)}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: pressed ? theme.bgHover : theme.bgCard },
              ]}
            >
              <Text style={[styles.bookTitle, { color: theme.textPrimary }]} numberOfLines={2}>
                {item.title}
              </Text>
              {!!item.author && (
                <Text style={[styles.author, { color: theme.textMuted }]} numberOfLines={1}>
                  {item.author}
                </Text>
              )}
              {item.status === 'READING' && !!item.total_pages && (
                <View style={[styles.track, { backgroundColor: theme.bgCardLite }]}>
                  <View style={[styles.fill, { backgroundColor: theme.accent, width: `${pct}%` }]} />
                </View>
              )}
              {item.status === 'FINISHED' && !!item.rating && (
                <Text style={[styles.stars, { color: theme.accent }]}>
                  {'★'.repeat(item.rating)}
                </Text>
              )}
            </Pressable>
          )
        }}
        ListEmptyComponent={<EmptyState>{EMPTY_COPY[tab]}</EmptyState>}
      />

      <Fab onPress={() => setAddOpen(true)} />
      <AddBookSheet visible={addOpen} onClose={() => setAddOpen(false)} />
      <BookDetailSheet book={selected} onClose={() => setSelected(null)} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  tabRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginTop: 14 },
  tab: { borderRadius: 999, paddingHorizontal: 15, paddingVertical: 8 },
  tabText: { fontFamily: fonts.medium, fontSize: 12.5 },
  scroll: { padding: 20, paddingBottom: 100, gap: 10 },
  card: { borderRadius: 13, padding: 16 },
  bookTitle: { fontFamily: fonts.semibold, fontSize: 15.5 },
  author: { fontFamily: fonts.regular, fontSize: 12.5, marginTop: 2 },
  track: { height: 4, borderRadius: 2, marginTop: 12, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2 },
  stars: { fontSize: 13, marginTop: 8, letterSpacing: 2 },
})
