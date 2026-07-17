// Floating add button — accent fill, one soft blur shadow (the FAB exception).
import { Pressable, StyleSheet, Text } from 'react-native'
import { useTheme } from '../lib/use-theme'

export function Fab({ onPress }: { onPress: () => void }) {
  const { theme } = useTheme()
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        {
          backgroundColor: theme.accent,
          shadowColor: theme.fabShadow,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        },
      ]}
      hitSlop={8}
    >
      <Text style={[styles.plus, { color: theme.bgPage }]}>+</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  plus: { fontSize: 28, lineHeight: 32, fontWeight: '400', marginTop: -2 },
})
