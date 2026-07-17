// 3-second undo toast — soft language instead of confirm dialogs (desktop
// parity: snooze/drop never ask, they just offer a quiet way back).
import { useEffect } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { fonts } from '../lib/theme'
import { useTheme } from '../lib/use-theme'

export interface UndoState {
  message: string
  undo: () => void
}

interface Props {
  state: UndoState | null
  onDismiss: () => void
}

export function UndoToast({ state, onDismiss }: Props) {
  const { theme } = useTheme()

  useEffect(() => {
    if (!state) return
    const t = setTimeout(onDismiss, 3000)
    return () => clearTimeout(t)
  }, [state, onDismiss])

  if (!state) return null

  return (
    <View style={[styles.toast, { backgroundColor: theme.bgCard }]}>
      <Text style={[styles.message, { color: theme.textBody }]}>{state.message}</Text>
      <Pressable
        onPress={() => {
          state.undo()
          onDismiss()
        }}
        hitSlop={10}
      >
        <Text style={[styles.undo, { color: theme.textAccent }]}>Undo</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 13,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: '#0a0f0a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 10,
  },
  message: { fontFamily: fonts.medium, fontSize: 14 },
  undo: { fontFamily: fonts.semibold, fontSize: 14 },
})
