// apps/desktop/src/lib/db.ts
// Thin wrapper around @tauri-apps/plugin-sql.
// All SQL queries go through `getDb()`.
// The plugin handles the SQLite file location natively
// (stored in the OS app data directory — no manual path needed).

import Database from '@tauri-apps/plugin-sql'

let _db: Database | null = null

export async function getDb(): Promise<Database> {
  if (!_db) {
    // tauri-plugin-sql resolves 'sqlite:adhd-life.db' to:
    //   macOS: ~/Library/Application Support/com.adhd-life.app/adhd-life.db
    //   Windows: %APPDATA%\com.adhd-life.app\adhd-life.db
    // Migrations in src-tauri/migrations/ run automatically on first open.
    _db = await Database.load('sqlite:adhd-life.db')
  }
  return _db
}

// Convenience: typed select
export async function select<T>(sql: string, args: unknown[] = []): Promise<T[]> {
  const db = await getDb()
  return db.select<T[]>(sql, args)
}

// Convenience: execute (INSERT, UPDATE, DELETE)
export async function execute(sql: string, args: unknown[] = []) {
  const db = await getDb()
  return db.execute(sql, args)
}

// Convenience: get single row or null
export async function selectOne<T>(sql: string, args: unknown[] = []): Promise<T | null> {
  const rows = await select<T>(sql, args)
  return rows[0] ?? null
}

// ─── DATE HELPERS ─────────────────────────────────────────────────────────────
// SQLite stores dates as ISO strings. These helpers normalize input/output.

export function toSqlDate(date: Date | string | null | undefined): string | null {
  if (!date) return null
  return new Date(date).toISOString()
}

export function startOfTodaySql(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export function endOfTodaySql(): string {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d.toISOString()
}

export function todayDateStr(): string {
  return new Date().toISOString().split('T')[0] // YYYY-MM-DD
}
