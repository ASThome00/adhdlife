// Custom drawer — Quiet Garden sidebar: ✦ logo, nav items with stroke icons,
// active item on accent wash, Settings pinned to the footer.
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router, usePathname } from 'expo-router'
import type { DrawerContentComponentProps } from '@react-navigation/drawer'
import { fonts } from '../lib/theme'
import { useTheme } from '../lib/use-theme'

const ITEMS: Array<{ href: string; icon: keyof typeof Ionicons.glyphMap; label: string }> = [
  { href: '/',        icon: 'today-outline',    label: 'Today' },
  { href: '/inbox',   icon: 'archive-outline',  label: 'Inbox' },
  { href: '/tasks',   icon: 'checkbox-outline', label: 'Tasks' },
  { href: '/habits',  icon: 'leaf-outline',     label: 'Habits' },
  { href: '/reading', icon: 'book-outline',     label: 'Reading' },
]

export function DrawerContent(props: DrawerContentComponentProps) {
  const { theme } = useTheme()
  const pathname = usePathname()

  function go(href: string) {
    props.navigation.closeDrawer()
    router.push(href as never)
  }

  return (
    <SafeAreaView style={styles.wrap} edges={['top', 'bottom']}>
      <View style={styles.logoRow}>
        <Text style={[styles.logoMark, { color: theme.accent }]}>✦</Text>
        <Text style={[styles.logoText, { color: theme.textPrimary }]}>ADHD Life</Text>
      </View>

      <View style={styles.items}>
        {ITEMS.map(item => {
          const active = pathname === item.href
          return (
            <Pressable
              key={item.href}
              onPress={() => go(item.href)}
              style={[styles.item, active && { backgroundColor: theme.bgAccent }]}
            >
              <Ionicons
                name={item.icon}
                size={19}
                color={active ? theme.textAccent : theme.textMuted}
              />
              <Text
                style={[
                  styles.itemLabel,
                  { color: active ? theme.textAccent : theme.textBody },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          )
        })}
      </View>

      <Pressable onPress={() => go('/settings')} style={styles.item}>
        <Ionicons name="settings-outline" size={19} color={theme.textMuted} />
        <Text style={[styles.itemLabel, { color: theme.textBody }]}>Settings</Text>
      </Pressable>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16 },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 22,
  },
  logoMark: { fontSize: 17 },
  logoText: { fontFamily: fonts.bold, fontSize: 16, letterSpacing: -0.2 },
  items: { flex: 1, gap: 2 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  itemLabel: { fontFamily: fonts.medium, fontSize: 14.5 },
})
