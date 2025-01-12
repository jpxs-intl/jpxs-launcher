use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use std::path::PathBuf;

use crate::error::Error;
use crate::instance_manager::Instance;

#[derive(Serialize, Deserialize)]
pub struct Settings {
    pub install_location: PathBuf,
    pub instances: Vec<Instance>,
    pub last_played: Option<String>,
    pub settings_version: i32,
}

const SETTINGS_VERSION: i32 = 1;
#[cfg(target_os = "windows")]
const HOMEDIR: &str = "APPDATA";

#[cfg(any(target_os = "macos", target_os = "linux"))]
const HOMEDIR: &str = "HOME";
pub fn get_base_dir() -> Result<PathBuf, Error> {
    let home = PathBuf::from(std::env::var(HOMEDIR).unwrap());
    #[cfg(debug_assertions)]
    let jpxs_folder_name = ".dev_jpxs_launcher";
    #[cfg(not(debug_assertions))]
    let jpxs_folder_name = ".jpxs_launcher";
    #[cfg(any(target_os = "windows", target_os = "linux"))]
    let base_dir = home.join(jpxs_folder_name);
    #[cfg(target_os = "macos")]
    let base_dir = home
        .join("Library")
        .join("Application Support")
        .join(jpxs_folder_name);
    if !base_dir.exists() {
        fs::create_dir(&base_dir)?;
    }
    Ok(base_dir)
}

pub fn get_settings_path() -> Result<PathBuf, Error> {
    Ok(get_base_dir()?.join("settings.json"))
}

pub fn check_settings_exist() -> Result<(), Error> {
    if !Path::try_exists(&get_settings_path()?)? {
        Ok(save_settings(Settings {
            install_location: get_base_dir()?.join("instances"),
            instances: vec![],
            last_played: None,
            settings_version: SETTINGS_VERSION,
        })?)
    } else {
        Ok(())
    }
}

pub fn get_settings() -> Result<Settings, Error> {
    check_settings_exist()?;
    Ok(serde_json::from_str(&fs::read_to_string(get_settings_path()?)?)?)
}

pub fn save_settings(settings: Settings) -> Result<(), Error> {
    let config = get_settings_path()?;
    let json = serde_json::to_string_pretty(&settings);
    if !settings.install_location.exists() {
        fs::create_dir(settings.install_location)?;
    }
    println!("Saving");
    Ok(fs::write(config, json?)?)
}
