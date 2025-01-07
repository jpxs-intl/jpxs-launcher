use std::path::{PathBuf};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]

pub struct instance {
    pub name: String,
    pub version: i32,
    pub is_free_weekend: bool,
    pub path: PathBuf
}