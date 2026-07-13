-- Migration 002: Weekly Review — store "top 3 priorities for next week"
-- on the settings singleton as a JSON array of strings.
-- (tauri-plugin-sql tracks migration versions, so this runs exactly once.)

ALTER TABLE settings ADD COLUMN next_week_priorities TEXT;
