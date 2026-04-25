// apps/desktop/src-tauri/src/lib.rs
// Tauri application entry point.
// All heavy lifting (SQLite, migrations) is handled by tauri-plugin-sql.
// Custom Rust commands go in the commands/ module if needed later.

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // SQL plugin — loads migrations from the migrations/ directory automatically
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(
                    "sqlite:adhd-life.db",
                    vec![tauri_plugin_sql::Migration {
                        version:     1,
                        description: "initial_schema",
                        sql:         include_str!("../migrations/001_initial.sql"),
                        kind:        tauri_plugin_sql::MigrationKind::Up,
                    }],
                )
                .build(),
        )
        // Shell plugin — open links in the system browser
        .plugin(tauri_plugin_shell::init())
        // Notifications plugin — for gentle reminders (Phase 7)
        .plugin(tauri_plugin_notification::init())
        // Updater plugin — checks GitHub Releases for new versions
        .plugin(tauri_plugin_updater::Builder::new().build())
        // Process plugin — needed for relaunch after installing an update
        .plugin(tauri_plugin_process::init())
        // Set up the main window
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                // Open devtools automatically in dev mode
                if let Some(window) = app.get_webview_window("main") {
                    window.open_devtools();
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running ADHD Life");
}
