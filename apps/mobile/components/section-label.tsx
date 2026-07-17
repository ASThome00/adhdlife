// DM Mono uppercase section label — mirrors desktop's .section-label.
import { Text, StyleSheet } from 'react-native'
import { fonts } from '../lib/theme'
import { useTheme } from '../lib/use-theme'

export function SectionLabel({ children }: { children: string }) {
  const { theme } = useTheme()
  return <Text style={[styles.label, { color: theme.textMuted }]}>{children.toUpperCase()}</Text>
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 8,
  },
})
