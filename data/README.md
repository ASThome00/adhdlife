# data/

This directory holds your local SQLite database: `adhd-life.db`

The database file is gitignored — it lives only on your machine.

**To back up your data:** copy `adhd-life.db` to Dropbox, a USB drive, or anywhere you want.
**To restore:** put the file back here.

Created by running: `cd packages/database && pnpm db:push && pnpm db:seed`
