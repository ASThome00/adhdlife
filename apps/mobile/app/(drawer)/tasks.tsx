// Tasks — category filter pills + grouped sections + swipe actions.
import { useCallback, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  completeTask,
  dropTask,
  getActiveTasks,
  getCategories,
  reopenTask,
  snoozeTask,
  type Task,
} from '../../lib/db'
import { fonts, getCategoryTheme } from '../../lib/theme'
import { useTheme } from '../../lib/use-theme'
import { groupTasks } from '../../lib/utils'
import { SwipeableTaskRow } from '../../components/swipeable-task-row'
import { ScreenHeader } from '../../components/screen-header'
import { SectionLabel } from '../../components/section-label'
import { EmptyState } from '../../components/empty-state'
import { Fab } from '../../components/fab'
import { QuickAddSheet } from '../../components/quick-add-sheet'
import { UndoToast, type UndoState } from '../../components/undo-toast'

const SECTION_ORDER = [
  ['overdue', 'Overdue'],
  ['today', 'Today'],
  ['thisWeek', 'This week'],
  ['upcoming', 'Upcoming'],
  ['someday', 'Someday'],
] as const

export default function TasksScreen() {
  const { theme } = useTheme()
  const queryClient = useQueryClient()
  const [selectedCat, setSelectedCat] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [undoState, setUndoState] = useState<UndoState | null>(null)

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories })
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', selectedCat],
    queryFn: () => getActiveTasks(selectedCat),
  })

  const refresh = useCallback(() => queryClient.invalidateQueries(), [queryClient])
  const dismissUndo = useCallback(() => setUndoState(null), [])

  function handleComplete(id: string) {
    completeTask(id)
    refresh()
  }

  function handleSnooze(id: string) {
    snoozeTask(id, 1)
    refresh()
    setUndoState({
      message: 'Snoozed until tomorrow',
      undo: () => { reopenTask(id); refresh() },
    })
  }

  function handleDrop(id: string) {
    dropTask(id)
    refresh()
    setUndoState({
      message: 'Task dropped',
      undo: () => { reopenTask(id); refresh() },
    })
  }

  const sections = groupTasks(tasks)

  return (
    <SafeAreaView style={[styles.page, { backgroundColor: theme.bgPage }]} edges={['top']}>
      <ScreenHeader title="Tasks" />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.pillStrip}
        contentContainerStyle={styles.pillRow}
      >
        <Pressable
          onPress={() => setSelectedCat(null)}
          style={[
            styles.pill,
            { backgroundColor: selectedCat === null ? theme.bgAccent : theme.bgCardLite },
          ]}
        >
          <Text
            style={[
              styles.pillText,
              { color: selectedCat === null ? theme.textAccent : theme.textMuted },
            ]}
          >
            All
          </Text>
        </Pressable>
        {categories.map(c => {
          const cat = getCategoryTheme(theme, c.id, c.color)
          const selected = selectedCat === c.id
          return (
            <Pressable
              key={c.id}
              onPress={() => setSelectedCat(selected ? null : c.id)}
              style={[styles.pill, { backgroundColor: selected ? cat.wash : theme.bgCardLite }]}
            >
              <View style={[styles.pillDot, { backgroundColor: cat.ink }]} />
              <Text style={[styles.pillText, { color: selected ? cat.text : theme.textMuted }]}>
                {c.name}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {tasks.length === 0 ? (
          <EmptyState>All clear. Add a task with the + button.</EmptyState>
        ) : (
          SECTION_ORDER.map(([key, label]) => {
            const list = sections[key]
            if (list.length === 0) return null
            return (
              <View key={key} style={styles.section}>
                <SectionLabel>{label}</SectionLabel>
                {list.map((t: Task) => (
                  <SwipeableTaskRow
                    key={t.id}
                    task={t}
                    onComplete={handleComplete}
                    onSnooze={handleSnooze}
                    onDrop={handleDrop}
                  />
                ))}
              </View>
            )
          })
        )}
      </ScrollView>

      <Fab onPress={() => setAddOpen(true)} />
      <QuickAddSheet visible={addOpen} onClose={() => setAddOpen(false)} />
      <UndoToast state={undoState} onDismiss={dismissUndo} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  pillStrip: { flexGrow: 0, marginTop: 14 },
  pillRow: { paddingHorizontal: 20, gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  pillDot: { width: 7, height: 7, borderRadius: 4 },
  pillText: { fontFamily: fonts.medium, fontSize: 12.5 },
  scroll: { padding: 20, paddingBottom: 100 },
  section: { marginBottom: 20 },
})
