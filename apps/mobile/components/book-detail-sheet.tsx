// Book detail sheet — progress nudges while reading, gentle finish with stars.
// Pleasure-first (product decision): no chapters, no task linking.
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import { updateBook, type Book } from '../lib/db'
import { fonts } from '../lib/theme'
import { useTheme } from '../lib/use-theme'
import { Sheet } from './sheet'

export function BookDetailSheet({ book, onClose }: { book: Book | null; onClose: () => void }) {
  const { theme } = useTheme()
  const queryClient = useQueryClient()
  const [finishing, setFinishing] = useState(false)

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ['books'] })
  }

  function close() {
    setFinishing(false)
    onClose()
  }

  if (!book) return null

  function startReading() {
    updateBook(book!.id, { status: 'READING', started_at: new Date().toISOString() })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    refresh()
    close()
  }

  function addPages(n: number) {
    const next = book!.total_pages
      ? Math.min(book!.current_page + n, book!.total_pages)
      : book!.current_page + n
    updateBook(book!.id, { current_page: next })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    refresh()
  }

  function finishWithRating(rating: number) {
    updateBook(book!.id, { status: 'FINISHED', rating, finished_at: new Date().toISOString() })
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    refresh()
    close()
  }

  const pct = book.total_pages ? Math.min(100, Math.round((book.current_page / book.total_pages) * 100)) : null

  return (
    <Sheet visible={!!book} onClose={close} title={book.title}>
      {!!book.author && (
        <Text style={[styles.author, { color: theme.textMuted }]}>{book.author}</Text>
      )}

      {book.status === 'TO_READ' && (
        <Pressable
          onPress={startReading}
          style={({ pressed }) => [
            styles.primaryBtn,
            { backgroundColor: theme.accent, transform: [{ scale: pressed ? 0.97 : 1 }] },
          ]}
        >
          <Text style={[styles.primaryText, { color: theme.bgPage }]}>Start reading</Text>
        </Pressable>
      )}

      {book.status === 'READING' && !finishing && (
        <>
          <Text style={[styles.progress, { color: theme.textBody }]}>
            {book.total_pages
              ? `Page ${book.current_page} of ${book.total_pages}${pct !== null ? `  ·  ${pct}%` : ''}`
              : `Page ${book.current_page}`}
          </Text>
          <View style={styles.btnRow}>
            <Pressable
              onPress={() => addPages(10)}
              style={[styles.ghostBtn, { backgroundColor: theme.bgCardLite }]}
            >
              <Text style={[styles.ghostText, { color: theme.textAccent }]}>+10 pages</Text>
            </Pressable>
            <Pressable
              onPress={() => setFinishing(true)}
              style={[styles.ghostBtn, { backgroundColor: theme.bgAccent }]}
            >
              <Text style={[styles.ghostText, { color: theme.textAccent }]}>Finished it</Text>
            </Pressable>
          </View>
        </>
      )}

      {book.status === 'READING' && finishing && (
        <>
          <Text style={[styles.progress, { color: theme.textBody }]}>How was it?</Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map(n => (
              <Pressable key={n} onPress={() => finishWithRating(n)} hitSlop={6}>
                <Text style={[styles.star, { color: theme.textFaint }]}>★</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {book.status === 'FINISHED' && (
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map(n => (
            <Text
              key={n}
              style={[styles.star, { color: (book.rating ?? 0) >= n ? theme.accent : theme.textFaint }]}
            >
              ★
            </Text>
          ))}
        </View>
      )}
    </Sheet>
  )
}

const styles = StyleSheet.create({
  author: { fontFamily: fonts.regular, fontSize: 13, marginTop: -8, marginBottom: 12 },
  primaryBtn: { borderRadius: 11, paddingVertical: 12, alignItems: 'center' },
  primaryText: { fontFamily: fonts.semibold, fontSize: 14 },
  progress: { fontFamily: fonts.mono, fontSize: 12, marginBottom: 14 },
  btnRow: { flexDirection: 'row', gap: 10 },
  ghostBtn: {
    flex: 1,
    borderRadius: 11,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ghostText: { fontFamily: fonts.semibold, fontSize: 13.5 },
  starRow: { flexDirection: 'row', gap: 12, justifyContent: 'center', paddingVertical: 6 },
  star: { fontSize: 30 },
})
