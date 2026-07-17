// apps/mobile/app/(drawer)/_layout.tsx
// Hamburger drawer navigation — room to grow past five pages (tab bar retired
// 2026-07-17 at Andrew's request). Drawer styling mirrors the desktop sidebar.
import { Drawer } from 'expo-router/drawer'
import { DrawerContent } from '../../components/drawer-content'
import { useTheme } from '../../lib/use-theme'

export default function DrawerLayout() {
  const { theme } = useTheme()
  return (
    <Drawer
      drawerContent={props => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          backgroundColor: theme.bgSidebar,
          width: 264,
        },
        overlayColor: theme.modalOverlay,
        sceneContainerStyle: { backgroundColor: theme.bgPage },
      }}
    />
  )
}
