use fs_extra::dir;
use futures_util::StreamExt;
#[cfg(target_os = "linux")]
use os::unix::fs::PermissionsExt;
use serde::{Deserialize, Serialize};
use std::fs;
use std::{cmp::min, os, process::Command};
use std::{env::temp_dir, fs::File, io::Write, path::PathBuf};
use tauri::{AppHandle, Emitter};

use crate::error::Error;
#[derive(Serialize, Deserialize)]
pub struct Instance {
    pub name: String,
    pub version: u8,
    pub is_free_weekend: bool,
    pub path: PathBuf,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DownloadPacket {
    pub total_size: u64,
    pub packets: u64,
}

pub fn is_instance(path: PathBuf) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    let exe_path = "./subrosa.exe";
    #[cfg(target_os = "linux")]
    let exe_path = "./subrosa.x64";
    let exe = path.join(exe_path);
    if exe.exists() {
        return Ok(());
    }
    Err("This is not a valid game instance".to_owned())
}

pub async fn download_instance(instance: Instance, app: AppHandle) -> Result<(), Error> {
    // base url for fw: https://assets.jpxs.io/freeweekend/
    let response: reqwest::Response;
    if instance.version == 99 {
        // 38 with no custom maps
        response =
            reqwest::get("https://assets.jpxs.io/freeweekend/free-weekend-38_no_maps.zip").await?;
    } else if instance.version == 24 {
        // 24 downloads from separate archive
        response = reqwest::get("https://crypticsea.gart.sh/Sub%20Rosa/0.24/b/Sub%20Rosa%200.24b.zip").await?
    } else {
        response = reqwest::get(
            "https://assets.jpxs.io/freeweekend/free-weekend-".to_owned()
                + &instance.version.to_string()
                + ".zip",
        )
        .await?;
    }
    let size = response
        .content_length()
        .expect("failed to get content length");
    let mut downloaded: u64 = 0;
    let mut stream = response.bytes_stream();
    let path = temp_dir().join("./free-weekend.zip");
    let mut file = File::create(&path)?;
    while let Some(item) = stream.next().await {
        let chunk = item?;
        file.write_all(&chunk)?;
        let new = min(downloaded + (chunk.len() as u64), size);
        downloaded = new;
        app.emit(
            "download_progress",
            DownloadPacket {
                total_size: size,
                packets: downloaded,
            },
        )
        .unwrap();
    }

    if instance.version == 24 {
        let folder_path = temp_dir().join(instance.name);
        fs::create_dir(&folder_path)?;
        zip_extensions::zip_extract(&(path.clone()), &folder_path)?;
        fs::create_dir(&instance.path)?;
        let mut options = dir::CopyOptions::new();
        options.copy_inside = true;
        let mut files = Vec::new();
        for entry in fs::read_dir(folder_path.join("Sub Rosa 0.24b"))? {
            files.push(entry?.path());
        }
        fs_extra::copy_items(&files, &instance.path, &options)?;
        fs::remove_dir_all(&folder_path)?;
    } else {
        zip_extensions::zip_extract(&(path.clone()), &instance.path)?;
    }
    fs::remove_file(&path)?;
    #[cfg(target_os = "linux")]
    {
        let file = File::open(instance.path.join("subrosa.x64"))?;
        let mut perms = file.metadata()?.permissions();
        perms.set_mode(0o775);
        file.set_permissions(perms)?;
    }
    Ok(())
}

pub async fn delete_instance(instance: Instance) -> Result<(), Error> {
    Ok(std::fs::remove_dir_all(instance.path)?)
}

pub fn open_instance(instance: Instance) -> () {
    #[cfg(target_os = "windows")]
    let game_exe = "./subrosa.exe";
    #[cfg(target_os = "linux")]
    let game_exe = "./subrosa.x64";

    let exe_path = instance.path.join(game_exe);
    Command::new(exe_path)
        .current_dir(instance.path)
        .spawn()
        .expect("Failed opening game");
}
