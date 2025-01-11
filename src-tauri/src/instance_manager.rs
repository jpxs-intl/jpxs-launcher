use std::cmp::min;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};
use std::{env::temp_dir, fs::File, io::Write, path::PathBuf};
use futures_util::StreamExt;

#[derive(Serialize, Deserialize)]
pub struct Instance {
    pub name: String,
    pub version: u8,
    pub is_free_weekend: bool,
    pub path: PathBuf,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct DownloadPacket {
    total_size: u64,
    packets: u64
}

pub async fn download_instance(instance: Instance, app: AppHandle) -> Result<(), reqwest::Error> {
    // base url for fw: https://assets.jpxs.io/freeweekend/
    let response = reqwest::get("https://assets.jpxs.io/freeweekend/free-weekend-".to_owned() + &instance.version.to_string() + ".zip").await?;
    let size = response.content_length().expect("Failed to get content length");
    let mut downloaded: u64 = 0;
    let mut stream = response.bytes_stream();
    let path = temp_dir().join("./free-weekend.zip");
    let mut file = File::create(path.clone()).expect("Failed creating file");
    while let Some(item) = stream.next().await {
        let chunk = item.expect("Failed to download chunk");
        file.write_all(&chunk).expect("Failed to write file");
        let new = min(downloaded + (chunk.len() as u64), size);
        downloaded = new;
        app.emit("download_progress", DownloadPacket {
            total_size: size,
            packets: downloaded
        }).unwrap();
    }
    //std::fs::write(&path, val).expect("Failed to write zip to disk");
    zip_extensions::zip_extract(&(path.clone()), &instance.path).expect("Failed to unzip file");
    Ok(())
}

pub async fn delete_instance(instance: Instance) {
    std::fs::remove_dir_all(instance.path).expect("Failed to delete instance");
}