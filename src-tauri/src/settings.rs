use std::path::PathBuf;
use std::path::Path;
use std::fs;
use serde::{Deserialize, Serialize};

use crate::instance_manager::instance;

#[derive(Serialize, Deserialize)]
pub struct Settings {
    pub install_location: PathBuf,
    pub instances: Vec<instance>
}

#[cfg(target_os = "windows")]
const HOMEDIR: &str = "APPDATA";

#[cfg(any(target_os = "macos", target_os = "linux"))]
const HOMEDIR: &str = "HOME";
pub fn get_base_dir() -> PathBuf {
    let home = PathBuf::from(std::env::var(HOMEDIR).unwrap());
    #[cfg(debug_assertions)]
    let jpxs_folder_name = ".dev_jpxs_launcher";
    #[cfg(not(debug_assertions))]
    let jpxs_folder_name = ".jpxs_launcher";
    #[cfg(any(target_os = "windows", target_os = "linux"))]
    let base_dir = home.join(jpxs_folder_name);
    #[cfg(target_os = "macos")]
    let base_dir = home.join("Library").join("Application Support").join(jpxs_folder_name);
    if !base_dir.exists() {
      fs::create_dir(&base_dir).expect("Could not create base directory");
    }
    return base_dir;
}

pub fn get_settings_path() -> PathBuf {
    return get_base_dir().join("settings.json");
}

pub fn check_settings_exist() {
    if !Path::exists(&get_settings_path()) {
        // implement saving once settings struct is done
    }
}

pub fn get_settings() -> Result<Settings, serde_json::Error> {
    let config = get_settings_path();
    check_settings_exist();
    let result = fs::read_to_string(config);
    match serde_json::from_str(result.expect("Failed Loading: IO Error").as_str()) {
        Ok(val) => {Ok(val)}
        Err(val) => {Err(val)}
    }
}

pub fn save_settings(settings: Settings) -> Result<(), std::io::Error> {
    let config = get_settings_path();
    let json = serde_json::to_string_pretty(&settings);
    println!("Saving");
    match fs::write(config, json.expect("Failed Saving: Malformed JSON")) {
        Ok(val) => {Ok(val)}
        Err(val) => {Err(val)}
    }
}