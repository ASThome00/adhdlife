// Swipe right → complete (accent). Swipe left → snooze / drop.
// Calm colors only: pine, gold, grey — never red (ADHD law 2).
import { useRef } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import * as Haptics from 'expo-haptics'
import { fonts } from '../lib/theme'
import { useTheme } from '../lib/use-theme'
import { TaskRow } from './task-row'
import type { Task } from '../lib/db'

interface Props {
  task: Task
  onComplete: (id: string) => void
  onSnooze: (id: string) => void
  onDrop: (id: string) => void
}

export function SwipeableTaskRow({ task, onComplete, onSnooze, onDrop }: Props) {
  const { theme } = useTheme()
  const ref = useRef<Swipeable>(null)

  function act(fn: () => void) {
    ref.current?.close()
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    fn()
  }

  return (
    <Swipeable
      ref={ref}
      overshootLeft={false}
      overshootRight={false}
      renderLeftActions={() => (
        <Pressable
          style={[styles.action, { backgroundColor: theme.accent }]}
          onPress={() => act(() => onComplete(task.id))}
        >
          <Text style={[styles.actionText, { color: theme.bgPage }]}>Done</Text>
        </Pressable>
      )}
      renderRightActions={() => (
        <View style={styles.rightActions}>
          <Pressable
            style={[styles.action, { backgroundColor: theme.prioMedium }]}
            onPress={() => act(() => onSnooze(task.id))}
          >
            <Text style={[styles.actionText, { color: theme.bgPage }]}>Snooze</Text>
          </Pressable>
          <Pressable
            style={[styles.action, { backgroundColor: theme.prioLow }]}
            onPress={() => act(() => onDrop(task.id))}
          >
            <Text style={[styles.actionText, { color: theme.bgPage }]}>Drop</Text>
          </Pressable>
        </View>
      )}
    >
      <View style={{ backgroundColor: theme.bgPage }}>
        <TaskRow task={task} onComplete={onComplete} showDue />
      </View>
    </Swipeable>
  )
}

const styles = StyleSheet.create({
  rightActions: { flexDirection: 'row' },
  action: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 76,
    borderRadius: 8,
    marginVertical: 2,
  },
  actionText: { fontFamily: fonts.semibold, fontSize: 12.5 },
})
