import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Inbox, ListTodo, Flame, BookOpen, Timer, BarChart2, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSettings } from '@/lib/hooks/use-data'

const NAV = [
  { to: '/',        icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/inbox',   icon: Inbox,           label: 'Inbox'         },
  { to: '/tasks',   icon: ListTodo,        label: 'Tasks'         },
  { to: '/habits',  icon: Flame,           label: 'Habits'        },
  { to: '/reading', icon: BookOpen,        label: 'Reading'       },
  { to: '/pomodoro', icon: Timer,          label: 'Pomodoro'      },
  { to: '/review',  icon: BarChart2,       label: 'Weekly Review' },
] as const

export function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const { data: settings } = useSettings()

  return (
    <aside className={cn('sidebar', collapsed && 'collapsed')}>
      {/* Logo — also the Tauri drag region */}
      <div className="sidebar-logo" data-tauri-drag-region>
        <div className="sidebar-logo-row">
          <span className="sidebar-logo-icon">✦</span>
          <span className="sidebar-logo-text sidebar-label">ADHD Life</span>
        </div>
        {settings?.display_name && (
          <p className="sidebar-user">{settings.display_name}</p>
        )}
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            title={collapsed ? label : undefined}
            className={({ isActive }) => cn('nav-item', isActive && 'active')}
          >
            <Icon size={15} strokeWidth={2} />
            <span className="sidebar-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Settings at bottom */}
      <div className="sidebar-bottom">
        <NavLink
          to="/settings"
          title={collapsed ? 'Settings' : undefined}
          className={({ isActive }) => cn('nav-item', isActive && 'active')}
        >
          <Settings size={15} strokeWidth={2} />
          <span className="sidebar-label">Settings</span>
        </NavLink>
      </div>
    </aside>
  )
}
