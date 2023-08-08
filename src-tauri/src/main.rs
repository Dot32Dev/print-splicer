#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

// use tauri::Window;
// use tauri::Wry;
use tauri::api::dialog;

// use image::{DynamicImage, ImageBuffer, Rgba, RgbaImage};
// use std::path::Path;

#[tauri::command]
async fn file_upload() -> Option<String> {
    let path = dialog::blocking::FileDialogBuilder::default()
        .add_filter("Image", &["png", "jpg", "jpeg", "bmp"])
        .pick_file();
    if let Some(path) = path {
        return Some(path.to_str().unwrap().to_string())
    }
    None
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![file_upload])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
