use settings::{get_settings, save_settings, Settings};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod instance_manager;
mod settings;

#[tauri::command]
fn get_settings_command() -> Result<Settings, String> {
    get_settings().map_err(|e| e.to_string())
}

#[tauri::command]
fn save_settings_command(settings: Settings) -> Result<(), String> {
    save_settings(settings).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_settings_command,
            save_settings_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
