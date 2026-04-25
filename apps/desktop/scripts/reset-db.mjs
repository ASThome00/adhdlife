#!/usr/bin/env node
// Deletes the local SQLite database so the app starts completely fresh.
// Path mirrors what tauri-plugin-sql resolves for 'sqlite:adhd-life.db':
//   Windows : %APPDATA%\com.adhd-life.app\adhd-life.db
//   macOS   : ~/Library/Application Support/com.adhd-life.app/adhd-life.db
//   Linux   : ~/.local/share/com.adhd-life.app/adhd-life.db

import { existsSync, rmSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

const APP_ID = 'com.adhd-life.app'
const DB_FILE = 'adhd-life.db'

function getAppDataDir() {
  switch (process.platform) {
    case 'win32':
      return join(process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming'), APP_ID)
    case 'darwin':
      return join(homedir(), 'Library', 'Application Support', APP_ID)
    default:
      return join(process.env.XDG_DATA_HOME ?? join(homedir(), '.local', 'share'), APP_ID)
  }
}

const dbPath = join(getAppDataDir(), DB_FILE)

if (existsSync(dbPath)) {
  rmSync(dbPath)
  console.log(`✓ Deleted ${dbPath}`)
} else {
  console.log(`  No database found at ${dbPath} — nothing to delete.`)
}
