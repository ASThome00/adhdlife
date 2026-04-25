import { Sidebar } from './sidebar'
import { BottomNav } from './bottom-nav'
import { QuickAddFab } from '@/components/tasks/quick-add-fab'
import { QuickAddModal } from '@/components/tasks/quick-add-modal'
import { useBreakpoint } from '@/lib/hooks/use-breakpoint'

export function AppShell({ children }: { children: React.ReactNode }) {
  const bp = useBreakpoint()
  const showSidebar = bp !== 'mobile'
  const sidebarCollapsed = bp === 'tablet'

  return (
    <div className="app-shell">
      {showSidebar && <Sidebar collapsed={sidebarCollapsed} />}

      <div className="main-area">
        {children}
      </div>

      {bp === 'mobile' && <BottomNav />}

      <QuickAddFab />
      <QuickAddModal />
    </div>
  )
}
