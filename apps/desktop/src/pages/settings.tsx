import { ProfileCard, AppearanceCard, FocusCard } from '@/components/settings/profile-appearance-cards'
import { CategoriesCard } from '@/components/settings/categories-card'
import { DataCard } from '@/components/settings/data-card'
import { UpdaterCard } from '@/components/settings/updater-card'

export function SettingsPage() {
  return (
    <>
      <header className="topbar" data-tauri-drag-region>
        <h1 className="topbar-title">
          Settings
        </h1>
      </header>

      <div className="content-scroll">
        <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ProfileCard />
          <AppearanceCard />
          <FocusCard />
          <CategoriesCard />
          <DataCard />
          <UpdaterCard />
        </div>
      </div>
    </>
  )
}
