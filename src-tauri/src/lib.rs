use instance_manager::{delete_instance, download_instance, open_instance, Instance};
use settings::{get_settings, save_settings, Settings};
use tauri::AppHandle;

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

#[tauri::command]
fn open_instance_command(instance: Instance) -> () {
    open_instance(instance);
}

#[tauri::command]
async fn download_instance_command(instance: Instance, app: AppHandle) -> Result<(), String> {
    download_instance(instance, app).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_instance_command(instance: Instance) {
    delete_instance(instance).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_settings_command,
            save_settings_command,
            open_instance_command,
            download_instance_command,
            delete_instance_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
