// Today — the hero screen. Greeting, habit circles, Focus + Also today.
import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  completeTask,
  getHabits,
  getSettings,
  getTodayData,
  toggleHabitToday,
  type Habit,
} from '../../lib/db'
import { fonts } from '../../lib/theme'
import { useTheme } from '../../lib/use-theme'
import { getGreeting } from '../../lib/utils'
import { HabitCircle } from '../../components/habit-circle'
import { MenuButton } from '../../components/screen-header'
import { TaskRow } from '../../components/task-row'
import { SectionLabel } from '../../components/section-label'
import { EmptyState } from '../../components/empty-state'
import { Fab } from '../../components/fab'
import { QuickAddSheet } from '../../components/quick-add-sheet'

export default function TodayScreen() {
  const { theme } = useTheme()
  const queryClient = useQueryClient()
  const [addOpen, setAddOpen] = useState(false)

  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: getSettings })
  const { data: today } = useQuery({ queryKey: ['today'], queryFn: getTodayData })
  const { data: habits = [] } = useQuery({ queryKey: ['habits'], queryFn: getHabits })

  function refresh() {
    queryClient.invalidateQueries()
  }

  function handleToggleHabit(habit: Habit) {
    toggleHabitToday(habit.id, !habit.completed_today)
    refresh()
  }

  function handleComplete(id: string) {
    completeTask(id)
    refresh()
  }

  const doneToday = today?.doneToday ?? 0

  return (
    <SafeAreaView style={[styles.page, { backgroundColor: theme.bgPage }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <MenuButton />
          <View style={{ flex: 1 }}>
            <Text style={[styles.greeting, { color: theme.textPrimary }]}>
              {getGreeting(settings?.display_name ?? 'friend')}
            </Text>
            <Text style={[styles.date, { color: theme.textMuted }]}>
              {format(new Date(), 'EEEE, MMMM d')}
              {doneToday > 0 ? `   ·   ${doneToday} done today` : ''}
            </Text>
          </View>
          <Pressable onPress={() => router.push('/settings')} hitSlop={12}>
            <Ionicons name="settings-outline" size={20} color={theme.textMuted} />
          </Pressable>
        </View>

        {habits.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.habitStrip}
            contentContainerStyle={styles.habitRow}
          >
            {habits.map(h => (
              <HabitCircle key={h.id} habit={h} onToggle={handleToggleHabit} />
            ))}
          </ScrollView>
        )}

        <View style={[styles.card, { backgroundColor: theme.bgCard }]}>
          <SectionLabel>Focus</SectionLabel>
          {(today?.focusTasks.length ?? 0) === 0 ? (
            <EmptyState>Nothing in focus yet. Pick what matters today — even one thing counts.</EmptyState>
          ) : (
            today!.focusTasks.map(t => (
              <TaskRow key={t.id} task={t} onComplete={handleComplete} />
            ))
          )}
        </View>

        {(today?.alsoToday.length ?? 0) > 0 && (
          <View style={[styles.card, { backgroundColor: theme.bgCard }]}>
            <SectionLabel>Also today</SectionLabel>
            {today!.alsoToday.map(t => (
              <TaskRow key={t.id} task={t} onComplete={handleComplete} />
            ))}
          </View>
        )}
      </ScrollView>

      <Fab onPress={() => setAddOpen(true)} />
      <QuickAddSheet visible={addOpen} onClose={() => setAddOpen(false)} dueToday />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 100, gap: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: 8,
  },
  greeting: { fontFamily: fonts.bold, fontSize: 22, letterSpacing: -0.4 },
  date: { fontFamily: fonts.mono, fontSize: 11, marginTop: 4 },
  habitStrip: { flexGrow: 0 },
  habitRow: { gap: 10, paddingVertical: 4 },
  card: { borderRadius: 20, padding: 20 },
})
