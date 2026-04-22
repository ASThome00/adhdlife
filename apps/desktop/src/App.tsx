import { Routes, Route, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getSettings } from '@/lib/queries/settings'
import { AppShell } from '@/components/nav/app-shell'
import { SetupPage }     from '@/pages/setup'
import { DashboardPage } from '@/pages/dashboard'
import { InboxPage }     from '@/pages/inbox'
import { TasksPage }     from '@/pages/tasks'
import { HabitsPage }    from '@/pages/habits'
import { ReadingPage }   from '@/pages/reading'
import { ReviewPage }    from '@/pages/review'
import { SettingsPage }  from '@/pages/settings'

export function App() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn:  getSettings,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface-50">
        <div className="text-primary-400 text-2xl animate-pulse">✦</div>
      </div>
    )
  }

  // First-run: show setup screen
  if (!settings?.setup_complete) {
    return <SetupPage />
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/"         element={<DashboardPage />} />
        <Route path="/inbox"    element={<InboxPage />}     />
        <Route path="/tasks"    element={<TasksPage />}     />
        <Route path="/habits"   element={<HabitsPage />}    />
        <Route path="/reading"  element={<ReadingPage />}   />
        <Route path="/review"   element={<ReviewPage />}    />
        <Route path="/settings" element={<SettingsPage />}  />
        <Route path="*"         element={<Navigate to="/" />} />
      </Routes>
    </AppShell>
  )
}
