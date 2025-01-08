use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Serialize, Deserialize)]

pub struct Instance {
    pub name: String,
    pub version: i32,
    pub is_free_weekend: bool,
    pub path: PathBuf,
}
