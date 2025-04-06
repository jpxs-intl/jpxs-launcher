use std::{cmp::min, path::PathBuf};

use sysinfo::System;
use instance_manager::{delete_instance, download_instance, is_instance, open_instance, DownloadPacket, Instance};
use settings::{get_base_dir, get_settings, save_settings, Settings};
use tauri::AppHandle;
use tauri::Emitter;
use tauri_plugin_updater::UpdaterExt;
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod error;
mod instance_manager;
mod settings;
use error::Error;

// settings commands

#[tauri::command]
fn get_settings_command() -> Result<Settings, Error> {
    get_settings()
}

#[tauri::command]
fn save_settings_command(settings: Settings) -> Result<(), Error> {
    save_settings(settings)
}

#[tauri::command]
fn open_path_command(path: String) -> Result<(), Error> {
    Ok(open::that(path)?)
}

#[tauri::command]
fn open_settings_command() -> Result<(), Error> {
    Ok(open::that(get_base_dir()?)?)
}

// instance commands

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

#[tauri::command]
fn is_steam_open() -> Result<bool, Error> {
    let s = System::new_all();
    for _process in s.processes_by_name("steam".as_ref()) {
        return Ok(true);
    }
    Ok(false)
}

// misc commands

#[tauri::command]
fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
async fn update_app(app: AppHandle) -> Result<(), Error> {
    if let Some(update) =  app.updater()?.check().await? {
        let mut downloaded = 0;
        update.download_and_install(|chunk_len, size| {
            let fullsize = size.expect("no size");
            let new = min(downloaded + (chunk_len as u64), fullsize);
            downloaded = new;
            let _ = app.emit("update_progress",
            DownloadPacket {
                total_size: fullsize,
                packets: downloaded,
            });
        }, || {
            println!("downloaded, restarting");
        }).await?;

        app.restart();
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_settings_command,
            save_settings_command,
            open_instance_command,
            download_instance_command,
            delete_instance_command,
            is_instance_command,
            open_path_command,
            open_settings_command,
            update_app,
            get_version,
            is_steam_open
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
