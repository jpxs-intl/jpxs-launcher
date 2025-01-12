use std::path::PathBuf;

use instance_manager::{delete_instance, download_instance, is_instance, open_instance, Instance};
use settings::{get_settings, save_settings, Settings};
use tauri::AppHandle;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod instance_manager;
mod settings;
mod error;
use error::Error;

#[tauri::command]
fn get_settings_command() -> Result<Settings, Error> {
    get_settings()
}

#[tauri::command]
fn save_settings_command(settings: Settings) -> Result<(), Error> {
    save_settings(settings)
}

#[tauri::command]
fn open_instance_command(instance: Instance) -> () {
    open_instance(instance);
}

#[tauri::command]
async fn download_instance_command(instance: Instance, app: AppHandle) -> Result<(), Error> {
    download_instance(instance, app).await
}

#[tauri::command]
async fn delete_instance_command(instance: Instance) -> Result<(), Error> {
    delete_instance(instance).await
}

#[tauri::command]
fn is_instance_command(path: String) -> Result<(), String> {
    is_instance(PathBuf::from(path))
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
            delete_instance_command,
            is_instance_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
