import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Inbox, ListTodo, Flame, BookOpen, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { to: '/',         icon: LayoutDashboard, label: 'Today'   },
  { to: '/inbox',    icon: Inbox,           label: 'Inbox'   },
  { to: '/tasks',    icon: ListTodo,        label: 'Tasks'   },
  { to: '/habits',   icon: Flame,           label: 'Habits'  },
  { to: '/reading',  icon: BookOpen,        label: 'Reading' },
  { to: '/settings', icon: Settings,        label: 'Settings' },
] as const

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {TABS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => cn('bottom-tab', isActive && 'active')}
          >
            <Icon size={18} strokeWidth={2} />
            <span className="bottom-tab-label">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
