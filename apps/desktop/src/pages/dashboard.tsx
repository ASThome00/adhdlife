import { useDashboard } from '@/lib/hooks/use-data'
import { useDarkMode } from '@/lib/theme'
import { Topbar } from '@/components/dashboard/topbar'
import { FocusTasksCard } from '@/components/dashboard/focus-tasks-card'
import { HabitsCard } from '@/components/dashboard/habits-card'
import { CarriedOverAccordion } from '@/components/dashboard/carried-over-accordion'
import { UpcomingCard } from '@/components/dashboard/upcoming-card'
import { WeekStrip } from '@/components/dashboard/week-strip'
import { MotivationQuote } from '@/components/dashboard/motivation-quote'

export function DashboardPage() {
  const { data, isLoading } = useDashboard()
  const [dark, toggleDark] = useDarkMode()

  const focusTasks    = data?.focusTasks    ?? []
  const overdueTasks  = data?.overdueTasks  ?? []
  const upcomingToday = data?.upcomingToday ?? []
  const habits        = data?.habits        ?? []
  const completedToday      = data?.completedToday      ?? 0
  const totalScheduledToday = data?.totalScheduledToday ?? 0

  return (
    <>
      <Topbar
        dark={dark}
        onToggleDark={toggleDark}
        completedToday={completedToday}
        totalScheduledToday={totalScheduledToday}
      />

      <div className="content-scroll">
        {isLoading ? (
          <div
            style={{
              fontFamily: 'Lora, serif',
              fontStyle: 'italic',
              fontSize: 14,
              color: 'var(--text-mono)',
              padding: '24px 4px',
            }}
          >
            Loading your day…
          </div>
        ) : (
          <div className="dash-grid">
            {/* Left column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <FocusTasksCard tasks={focusTasks} completedToday={completedToday} />
              <HabitsCard habits={habits as any} />
              <MotivationQuote />
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <CarriedOverAccordion tasks={overdueTasks} />
              <UpcomingCard tasks={upcomingToday} />
              <WeekStrip />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
