// 52px habit circle — filled bg-hover, done = accent fill. Streak numbers in
// DM Mono, shown only at ≥3 days (P7); no flame glyphs, missed is never red.
import { Pressable, StyleSheet, Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { fonts } from '../lib/theme'
import { useTheme } from '../lib/use-theme'
import type { Habit } from '../lib/db'

interface Props {
  habit: Habit
  onToggle: (habit: Habit) => void
}

export function HabitCircle({ habit, onToggle }: Props) {
  const { theme } = useTheme()
  const done = habit.completed_today
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onToggle(habit)
      }}
      style={({ pressed }) => [styles.wrap, pressed && { transform: [{ scale: 0.94 }] }]}
    >
      <View style={[styles.circle, { backgroundColor: done ? theme.accent : theme.bgHover }]}>
        {done && <Text style={[styles.check, { color: theme.bgPage }]}>✓</Text>}
      </View>
      <Text style={[styles.name, { color: theme.textMuted }]} numberOfLines={1}>
        {habit.name}
      </Text>
      {habit.current_streak >= 3 && (
        <Text style={[styles.streak, { color: theme.textAccent }]}>{habit.current_streak}d</Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', width: 68 },
  circle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { fontSize: 18, fontWeight: '700' },
  name: {
    fontFamily: fonts.medium,
    fontSize: 11,
    marginTop: 6,
    maxWidth: 64,
    textAlign: 'center',
  },
  streak: {
    fontFamily: fonts.mono,
    fontSize: 10,
    marginTop: 1,
  },
})
