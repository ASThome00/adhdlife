// Add-book bottom sheet — title, author, optional page count.
import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import { createBook } from '../lib/db'
import { fonts } from '../lib/theme'
import { useTheme } from '../lib/use-theme'
import { Sheet } from './sheet'

export function AddBookSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { theme } = useTheme()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [pages, setPages] = useState('')

  function handleAdd() {
    const t = title.trim()
    if (!t) return
    const total = parseInt(pages, 10)
    createBook({
      title: t,
      author: author.trim() || null,
      total_pages: Number.isFinite(total) && total > 0 ? total : null,
    })
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    queryClient.invalidateQueries({ queryKey: ['books'] })
    setTitle(''); setAuthor(''); setPages('')
    onClose()
  }

  const inputStyle = [styles.input, { backgroundColor: theme.bgCardLite, color: theme.textBody }]

  return (
    <Sheet visible={visible} onClose={onClose} title="Add a book">
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        placeholderTextColor={theme.textFaint}
        autoFocus
        style={inputStyle}
      />
      <TextInput
        value={author}
        onChangeText={setAuthor}
        placeholder="Author (optional)"
        placeholderTextColor={theme.textFaint}
        style={[...inputStyle, styles.spaced]}
      />
      <TextInput
        value={pages}
        onChangeText={setPages}
        placeholder="Total pages (optional)"
        placeholderTextColor={theme.textFaint}
        keyboardType="number-pad"
        style={[...inputStyle, styles.spaced]}
      />
      <Pressable
        onPress={handleAdd}
        style={({ pressed }) => [
          styles.addBtn,
          { backgroundColor: theme.accent, transform: [{ scale: pressed ? 0.97 : 1 }] },
        ]}
      >
        <Text style={[styles.addText, { color: theme.bgPage }]}>Add to shelf</Text>
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
  spaced: { marginTop: 10 },
  addBtn: {
    marginTop: 18,
    borderRadius: 11,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addText: { fontFamily: fonts.semibold, fontSize: 14 },
})
