// Quick-add bottom sheet — title + optional category chips + Add.
// ≤5 seconds rule: one field, one tap, done.
import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import { createTask, getCategories } from '../lib/db'
import { fonts, getCategoryTheme } from '../lib/theme'
import { useTheme } from '../lib/use-theme'
import { Sheet } from './sheet'

interface Props {
  visible: boolean
  onClose: () => void
  /** Give the new task today's date + ACTIVE status (Today-screen quick add). */
  dueToday?: boolean
}

export function QuickAddSheet({ visible, onClose, dueToday }: Props) {
  const { theme } = useTheme()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories })

  function handleAdd() {
    const trimmed = title.trim()
    if (!trimmed) return
    createTask({
      title: trimmed,
      category_id: categoryId,
      due_date: dueToday ? new Date().toISOString() : null,
      status: dueToday ? 'ACTIVE' : undefined,
    })
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    queryClient.invalidateQueries()
    setTitle('')
    setCategoryId(null)
    onClose()
  }

  return (
    <Sheet visible={visible} onClose={onClose} title="Add a task">
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="What's on your mind?"
        placeholderTextColor={theme.textFaint}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={handleAdd}
        style={[styles.input, { backgroundColor: theme.bgCardLite, color: theme.textBody }]}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        <View style={styles.chips}>
          {categories.map(c => {
            const cat = getCategoryTheme(theme, c.id, c.color)
            const selected = categoryId === c.id
            return (
              <Pressable
                key={c.id}
                onPress={() => setCategoryId(selected ? null : c.id)}
                style={[
                  styles.chip,
                  { backgroundColor: selected ? cat.wash : theme.bgCardLite },
                ]}
              >
                <View style={[styles.chipDot, { backgroundColor: cat.ink }]} />
                <Text style={[styles.chipText, { color: selected ? cat.text : theme.textMuted }]}>
                  {c.name}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </ScrollView>

      <Pressable
        onPress={handleAdd}
        style={({ pressed }) => [
          styles.addBtn,
          { backgroundColor: theme.accent, transform: [{ scale: pressed ? 0.97 : 1 }] },
        ]}
      >
        <Text style={[styles.addText, { color: theme.bgPage }]}>Add</Text>
      </Pressable>
    </Sheet>
  )
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.regular,
    fontSize: 15,
  },
  chipRow: { marginTop: 14, flexGrow: 0 },
  chips: { flexDirection: 'row', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipDot: { width: 7, height: 7, borderRadius: 4 },
  chipText: { fontFamily: fonts.medium, fontSize: 12 },
  addBtn: {
    marginTop: 18,
    borderRadius: 11,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addText: { fontFamily: fonts.semibold, fontSize: 14 },
})
