// 30-day habit dot grid — 18px radius-5 squares. Done = habit ink,
// missed = bg-card-lite. Missed days are never red.
import { StyleSheet, View } from 'react-native'
import { localDateStr } from '../lib/db'
import { useTheme } from '../lib/use-theme'

interface Props {
  /** Set of 'YYYY-MM-DD' local day keys the habit was completed. */
  doneDates: Set<string>
  ink: string
  days?: number
}

export function DotGrid({ doneDates, ink, days = 30 }: Props) {
  const { theme } = useTheme()
  const cells: Array<{ key: string; done: boolean }> = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = localDateStr(d)
    cells.push({ key, done: doneDates.has(key) })
  }
  return (
    <View style={styles.grid}>
      {cells.map(c => (
        <View
          key={c.key}
          style={[styles.cell, { backgroundColor: c.done ? ink : theme.bgCardLite }]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  cell: { width: 18, height: 18, borderRadius: 5 },
})
