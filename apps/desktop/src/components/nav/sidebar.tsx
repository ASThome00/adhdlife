'use client'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Inbox, ListTodo, Flame, BookOpen, BarChart2, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSettings } from '@/lib/hooks/use-data'

const NAV = [
  { to: '/',        icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/inbox',   icon: Inbox,           label: 'Inbox'         },
  { to: '/tasks',   icon: ListTodo,        label: 'Tasks'         },
  { to: '/habits',  icon: Flame,           label: 'Habits'        },
  { to: '/reading', icon: BookOpen,        label: 'Reading'       },
  { to: '/review',  icon: BarChart2,       label: 'Weekly Review' },
] as const

export function Sidebar() {
  const { data: settings } = useSettings()

  return (
    <aside className="flex flex-col w-56 bg-white border-r border-surface-200 py-5 px-2 flex-shrink-0">
      {/* Logo — also the drag region for moving the window */}
      <div className="px-3 mb-6 pb-4 border-b border-surface-100" data-tauri-drag-region>
        <div className="flex items-center gap-2">
          <span className="text-primary-500 text-xl">✦</span>
          <span className="font-bold text-gray-800 text-base">ADHD Life</span>
        </div>
        {settings?.display_name && (
          <p className="text-xs text-gray-400 mt-1 ml-7 truncate">{settings.display_name}</p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full',
              isActive
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-500 hover:bg-surface-100 hover:text-gray-800'
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Settings at bottom */}
      <NavLink
        to="/settings"
        className={({ isActive }) => cn(
          'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600 hover:bg-surface-100'
        )}
      >
        <Settings className="w-4 h-4" />
        Settings
      </NavLink>
    </aside>
  )
}
