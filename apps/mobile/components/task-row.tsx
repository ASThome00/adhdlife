// Task row: checkbox + title + category dot (+ quiet due label).
// Complete = light haptic, 250ms fade + strikethrough, then the mutation fires
// (P6 sink pattern — optimistic, never waits on the DB).
import { useRef, useState } from 'react'
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { fonts, getCategoryTheme } from '../lib/theme'
import { useTheme } from '../lib/use-theme'
import { formatDueDate } from '../lib/utils'
import type { Task } from '../lib/db'

interface Props {
  task: Task
  onComplete: (id: string) => void
  onPress?: (task: Task) => void
  showDue?: boolean
}

export function TaskRow({ task, onComplete, onPress, showDue }: Props) {
  const { theme } = useTheme()
  const [checking, setChecking] = useState(false)
  const opacity = useRef(new Animated.Value(1)).current
  const cat = getCategoryTheme(theme, task.category_id, task.category_color)

  function handleCheck() {
    if (checking) return
    setChecking(true)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    Animated.timing(opacity, { toValue: 0.35, duration: 250, useNativeDriver: true }).start(() => {
      onComplete(task.id)
    })
  }

  return (
    <Animated.View style={{ opacity }}>
      <Pressable
        style={styles.row}
        onPress={() => onPress?.(task)}
        disabled={!onPress && !checking}
      >
        <Pressable
          onPress={handleCheck}
          hitSlop={10}
          style={[
            styles.checkbox,
            { backgroundColor: checking ? theme.accent : theme.bgHover },
            task.priority === 'HIGH' && !checking && {
              borderWidth: 1.5,
              borderColor: theme.prioHigh,
            },
          ]}
        >
          {checking && <Text style={[styles.check, { color: theme.bgPage }]}>✓</Text>}
        </Pressable>

        <Text
          style={[
            styles.title,
            { color: theme.textBody },
            checking && { textDecorationLine: 'line-through', color: theme.textMuted },
          ]}
          numberOfLines={2}
        >
          {task.title}
        </Text>

        {showDue && !!task.due_date && (
          <Text style={[styles.due, { color: theme.textMuted }]}>{formatDueDate(task.due_date)}</Text>
        )}

        {task.category_id && <View style={[styles.dot, { backgroundColor: cat.ink }]} />}
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { fontSize: 13, fontWeight: '700', lineHeight: 16 },
  title: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
  },
  due: {
    fontFamily: fonts.mono,
    fontSize: 11,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
})
