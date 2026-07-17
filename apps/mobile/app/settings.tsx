// apps/mobile/app/settings.tsx — modal: display name + theme toggle.
// Deliberately tiny (product decision 2026-07-13: no notifications anywhere).
import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import { getSettings, updateSettings } from '../lib/db'
import { fonts } from '../lib/theme'
import { useTheme } from '../lib/use-theme'
import { SectionLabel } from '../components/section-label'

export default function SettingsScreen() {
  const { theme, mode, setMode } = useTheme()
  const queryClient = useQueryClient()
  const [name, setName] = useState(() => getSettings().display_name)

  function saveName() {
    const trimmed = name.trim()
    if (trimmed) {
      updateSettings({ display_name: trimmed })
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    }
  }

  return (
    <SafeAreaView style={[styles.page, { backgroundColor: theme.bgPage }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Settings</Text>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={[styles.done, { color: theme.textAccent }]}>Done</Text>
        </Pressable>
      </View>

      <View style={[styles.card, { backgroundColor: theme.bgCard }]}>
        <SectionLabel>Your name</SectionLabel>
        <TextInput
          value={name}
          onChangeText={setName}
          onBlur={saveName}
          onSubmitEditing={saveName}
          placeholder="What should we call you?"
          placeholderTextColor={theme.textFaint}
          returnKeyType="done"
          style={[styles.input, { backgroundColor: theme.bgCardLite, color: theme.textBody }]}
        />
      </View>

      <View style={[styles.card, { backgroundColor: theme.bgCard }]}>
        <SectionLabel>Appearance</SectionLabel>
        <View style={[styles.toggleTrack, { backgroundColor: theme.bgCardLite }]}>
          {(['light', 'dark'] as const).map(m => (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              style={[styles.toggleItem, mode === m && { backgroundColor: theme.bgAccent }]}
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: mode === m ? theme.textAccent : theme.textMuted },
                ]}
              >
                {m === 'light' ? 'Light' : 'Dark'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 20, gap: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingTop: 4,
  },
  title: { fontFamily: fonts.bold, fontSize: 20 },
  done: { fontFamily: fonts.semibold, fontSize: 15 },
  card: { borderRadius: 20, padding: 24 },
  input: {
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: fonts.regular,
    fontSize: 15,
  },
  toggleTrack: {
    flexDirection: 'row',
    borderRadius: 999,
    padding: 4,
    gap: 4,
  },
  toggleItem: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
  },
  toggleText: { fontFamily: fonts.semibold, fontSize: 13 },
})
