// Shared page header: hamburger + title + optional right slot.
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from 'expo-router'
import { DrawerActions } from '@react-navigation/native'
import type { ReactNode } from 'react'
import { fonts } from '../lib/theme'
import { useTheme } from '../lib/use-theme'

export function MenuButton() {
  const { theme } = useTheme()
  const navigation = useNavigation()
  return (
    <Pressable
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      hitSlop={12}
      style={styles.menuBtn}
    >
      <Ionicons name="menu-outline" size={24} color={theme.textPrimary} />
    </Pressable>
  )
}

export function ScreenHeader({ title, right }: { title: string; right?: ReactNode }) {
  const { theme } = useTheme()
  return (
    <View style={styles.row}>
      <MenuButton />
      <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
      {right}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  menuBtn: { marginLeft: -4 },
  title: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 22,
    letterSpacing: -0.4,
  },
})
