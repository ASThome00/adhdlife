// Habits — full-page cards with 30-day dot grids. Streaks pause, never reset.
import { useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import {
  createHabit,
  getHabitHistory,
  getHabits,
  toggleHabitToday,
  type Habit,
} from '../../lib/db'
import { fonts } from '../../lib/theme'
import { useTheme } from '../../lib/use-theme'
import { getStreakMessage } from '../../lib/utils'
import { DotGrid } from '../../components/dot-grid'
import { Sheet } from '../../components/sheet'
import { EmptyState } from '../../components/empty-state'
import { ScreenHeader } from '../../components/screen-header'

// Same designed inks as the seeded categories — suggestions, not limits.
const HABIT_COLORS = ['#33705c', '#4270c0', '#7a5bc8', '#bd5b68', '#99690a', '#5c9a33', '#ad4796', '#b55c22']

export default function HabitsScreen() {
  const { theme } = useTheme()
  const queryClient = useQueryClient()
  const [addOpen, setAddOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(HABIT_COLORS[0])

  const { data: habits = [] } = useQuery({ queryKey: ['habits'], queryFn: getHabits })
  const { data: history = [] } = useQuery({ queryKey: ['habitHistory'], queryFn: () => getHabitHistory(30) })

  const doneByHabit = useMemo(() => {
    const map = new Map<string, Set<string>>()
    for (const log of history) {
      if (!log.completed) continue
      if (!map.has(log.habit_id)) map.set(log.habit_id, new Set())
      map.get(log.habit_id)!.add(log.date)
    }
    return map
  }, [history])

  function refresh() {
    queryClient.invalidateQueries()
  }

  function handleToggle(habit: Habit) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    toggleHabitToday(habit.id, !habit.completed_today)
    refresh()
  }

  function handleCreate() {
    const name = newName.trim()
    if (!name) return
    createHabit(name, newColor)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    setNewName('')
    setNewColor(HABIT_COLORS[0])
    setAddOpen(false)
    refresh()
  }

  return (
    <SafeAreaView style={[styles.page, { backgroundColor: theme.bgPage }]} edges={['top']}>
      <ScreenHeader
        title="Habits"
        right={
          <Pressable onPress={() => setAddOpen(true)} hitSlop={10}>
            <Text style={[styles.addLink, { color: theme.textAccent }]}>+ New habit</Text>
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {habits.length === 0 ? (
          <EmptyState>No habits yet. Start with one tiny thing — brushing counts.</EmptyState>
        ) : (
          habits.map(h => (
            <View key={h.id} style={[styles.card, { backgroundColor: theme.bgCard }]}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.habitName, { color: theme.textPrimary }]}>{h.name}</Text>
                  <Text style={[styles.streakMsg, { color: theme.textMuted }]}>
                    {getStreakMessage(h.current_streak)}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleToggle(h)}
                  style={({ pressed }) => [
                    styles.todayCircle,
                    { backgroundColor: h.completed_today ? theme.accent : theme.bgHover },
                    pressed && { transform: [{ scale: 0.94 }] },
                  ]}
                >
                  {h.completed_today && (
                    <Text style={[styles.check, { color: theme.bgPage }]}>✓</Text>
                  )}
                </Pressable>
              </View>
              <View style={styles.grid}>
                <DotGrid doneDates={doneByHabit.get(h.id) ?? new Set()} ink={h.color} />
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Sheet visible={addOpen} onClose={() => setAddOpen(false)} title="New habit">
        <TextInput
          value={newName}
          onChangeText={setNewName}
          placeholder="Drink water, stretch, read a page…"
          placeholderTextColor={theme.textFaint}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleCreate}
          style={[styles.input, { backgroundColor: theme.bgCardLite, color: theme.textBody }]}
        />
        <View style={styles.colorRow}>
          {HABIT_COLORS.map(c => (
            <Pressable
              key={c}
              onPress={() => setNewColor(c)}
              style={[
                styles.colorSwatch,
                { backgroundColor: c },
                newColor === c && { borderWidth: 2.5, borderColor: theme.textPrimary },
              ]}
            />
          ))}
        </View>
        <Pressable
          onPress={handleCreate}
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: theme.accent, transform: [{ scale: pressed ? 0.97 : 1 }] },
          ]}
        >
          <Text style={[styles.addBtnText, { color: theme.bgPage }]}>Add habit</Text>
        </Pressable>
      </Sheet>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40, gap: 16 },
  addLink: { fontFamily: fonts.semibold, fontSize: 14 },
  card: { borderRadius: 20, padding: 20 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  habitName: { fontFamily: fonts.semibold, fontSize: 16 },
  streakMsg: { fontFamily: fonts.regular, fontSize: 13, marginTop: 2 },
  todayCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { fontSize: 18, fontWeight: '700' },
  grid: { marginTop: 16 },
  input: {
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.regular,
    fontSize: 15,
  },
  colorRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  colorSwatch: { width: 30, height: 30, borderRadius: 15 },
  addBtn: {
    marginTop: 18,
    borderRadius: 11,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addBtnText: { fontFamily: fonts.semibold, fontSize: 14 },
})
