import { useDashboard } from '@/lib/hooks/use-data'
import { useDarkMode } from '@/lib/theme'
import { Topbar } from '@/components/dashboard/topbar'
import { FocusTasksCard } from '@/components/dashboard/focus-tasks-card'
import { HabitsCard } from '@/components/dashboard/habits-card'
import { CarriedOverAccordion } from '@/components/dashboard/carried-over-accordion'
import { UpcomingCard } from '@/components/dashboard/upcoming-card'

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
              fontSize: 14,
              color: 'var(--text-muted)',
              padding: '24px 4px',
            }}
          >
            Loading your day…
          </div>
        ) : (
          /* P12 — grid holds only Focus / Habits / Still on the list / Upcoming;
             quote + week strip moved to the header band (P3/P4) */
          <div className="dash-grid">
            <div className="dash-col">
              <FocusTasksCard tasks={focusTasks} completedFocusToday={data?.completedFocusToday ?? 0} />
              <HabitsCard habits={habits as any} />
            </div>

            <div className="dash-col">
              <CarriedOverAccordion tasks={overdueTasks} />
              <UpcomingCard tasks={upcomingToday} />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
