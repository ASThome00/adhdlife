// Quiet empty state — faint text, no italics (P11).
import { StyleSheet, Text } from 'react-native'
import { fonts } from '../lib/theme'
import { useTheme } from '../lib/use-theme'

export function EmptyState({ children }: { children: string }) {
  const { theme } = useTheme()
  return <Text style={[styles.text, { color: theme.textFaint }]}>{children}</Text>
}

const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.regular,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    lineHeight: 20,
  },
})
