// Inbox — brain dump first (ADHD law 5). One thought per line, sort later.
import { useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import {
  assignTaskCategory,
  brainDump,
  getCategories,
  getInboxTasks,
  type Task,
} from '../../lib/db'
import { fonts, getCategoryTheme } from '../../lib/theme'
import { useTheme } from '../../lib/use-theme'
import { Sheet } from '../../components/sheet'
import { EmptyState } from '../../components/empty-state'
import { ScreenHeader } from '../../components/screen-header'

export default function InboxScreen() {
  const { theme } = useTheme()
  const queryClient = useQueryClient()
  const [dumpText, setDumpText] = useState('')
  const [assigning, setAssigning] = useState<Task | null>(null)

  const { data: tasks = [] } = useQuery({ queryKey: ['inbox'], queryFn: getInboxTasks })
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories })

  function handleDump() {
    const text = dumpText.trim()
    if (!text) return
    brainDump(text)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    setDumpText('')
    queryClient.invalidateQueries({ queryKey: ['inbox'] })
  }

  function handleAssign(categoryId: string) {
    if (!assigning) return
    assignTaskCategory(assigning.id, categoryId)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setAssigning(null)
    queryClient.invalidateQueries()
  }

  return (
    <SafeAreaView style={[styles.page, { backgroundColor: theme.bgPage }]} edges={['top']}>
      <ScreenHeader title="Inbox" />
      <FlatList
        data={tasks}
        keyExtractor={t => t.id}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.dumpBlock}>
            <TextInput
              value={dumpText}
              onChangeText={setDumpText}
              placeholder="Brain dump — one thought per line"
              placeholderTextColor={theme.textFaint}
              multiline
              style={[styles.dumpInput, { backgroundColor: theme.bgCard, color: theme.textBody }]}
            />
            <Pressable
              onPress={handleDump}
              style={({ pressed }) => [
                styles.dumpBtn,
                { backgroundColor: theme.accent, transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}
            >
              <Text style={[styles.dumpBtnText, { color: theme.bgPage }]}>Dump it</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.row, { backgroundColor: theme.bgCard }]}>
            <Text style={[styles.rowTitle, { color: theme.textBody }]} numberOfLines={2}>
              {item.title}
            </Text>
            <Pressable onPress={() => setAssigning(item)} hitSlop={8}>
              <Text style={[styles.assign, { color: theme.textAccent }]}>Assign →</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState>You're all caught up. Dump anything new above.</EmptyState>
        }
      />

      <Sheet visible={!!assigning} onClose={() => setAssigning(null)} title="Where does it belong?">
        {categories.map(c => {
          const cat = getCategoryTheme(theme, c.id, c.color)
          return (
            <Pressable
              key={c.id}
              onPress={() => handleAssign(c.id)}
              style={({ pressed }) => [
                styles.catRow,
                pressed && { backgroundColor: theme.bgHover },
              ]}
            >
              <View style={[styles.catDot, { backgroundColor: cat.ink }]} />
              <Text style={[styles.catName, { color: theme.textBody }]}>{c.name}</Text>
            </Pressable>
          )
        })}
      </Sheet>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40, gap: 8 },
  dumpBlock: { marginBottom: 12 },
  dumpInput: {
    borderRadius: 13,
    padding: 16,
    minHeight: 110,
    textAlignVertical: 'top',
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 21,
  },
  dumpBtn: {
    marginTop: 10,
    alignSelf: 'flex-end',
    borderRadius: 11,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  dumpBtnText: { fontFamily: fonts.semibold, fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 13,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowTitle: { flex: 1, fontFamily: fonts.medium, fontSize: 15 },
  assign: { fontFamily: fonts.semibold, fontSize: 13 },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  catDot: { width: 9, height: 9, borderRadius: 5 },
  catName: { fontFamily: fonts.medium, fontSize: 15 },
})
