use serde::{Deserialize, Serialize};
use std::path::PathBuf;
#[derive(Serialize, Deserialize)]
pub struct Instance {
    pub name: String,
    pub version: u8,
    pub is_free_weekend: bool,
    pub path: PathBuf,
}

pub async fn download_instance(instance: Instance) -> Result<(), reqwest::Error> {
    // base url for fw: https://assets.jpxs.io/freeweekend/
    let response = reqwest::get("https://assets.jpxs.io/freeweekend/free-weekend-".to_owned() + &instance.version.to_string() + ".zip");
    let val = response.await?.bytes().await?;
    std::fs::write("temp.zip", val).expect("Failed to write zip to disk");
    zip_extensions::zip_extract(&PathBuf::from("temp.zip"), &instance.path).expect("Failed to unzip file");
    Ok(())
}