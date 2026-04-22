// apps/desktop/src/lib/queries/settings.ts
import { selectOne, execute } from '@/lib/db'

export interface Settings {
  id:                   string
  display_name:         string
  theme:                'light' | 'dark' | 'system'
  daily_focus_limit:    number
  notifications_enabled: boolean
  setup_complete:       boolean
}

export async function getSettings(): Promise<Settings> {
  const row = await selectOne<any>('SELECT * FROM settings WHERE id = ?', ['1'])
  return normalizeSettings(row)
}

export async function updateSettings(data: Partial<Omit<Settings, 'id'>>) {
  const fields: string[] = []
  const values: unknown[] = []

  if (data.display_name          !== undefined) { fields.push('display_name = ?');          values.push(data.display_name) }
  if (data.theme                 !== undefined) { fields.push('theme = ?');                 values.push(data.theme) }
  if (data.daily_focus_limit     !== undefined) { fields.push('daily_focus_limit = ?');     values.push(data.daily_focus_limit) }
  if (data.notifications_enabled !== undefined) { fields.push('notifications_enabled = ?'); values.push(data.notifications_enabled ? 1 : 0) }
  if (data.setup_complete        !== undefined) { fields.push('setup_complete = ?');        values.push(data.setup_complete ? 1 : 0) }

  if (fields.length === 0) return

  values.push('1')
  await execute(`UPDATE settings SET ${fields.join(', ')} WHERE id = ?`, values)
}

function normalizeSettings(row: any): Settings {
  return {
    id:                   row.id,
    display_name:         row.display_name,
    theme:                row.theme,
    daily_focus_limit:    row.daily_focus_limit,
    notifications_enabled: Boolean(row.notifications_enabled),
    setup_complete:       Boolean(row.setup_complete),
  }
}
