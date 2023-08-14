#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Window;
use tauri::Wry;
use tauri::api::dialog;

use image::{DynamicImage, ImageBuffer, Rgba, RgbaImage, GenericImageView};
use std::sync::Arc;
use std::fs;

#[tauri::command]
async fn file_upload() -> Option<String> {
    let path = dialog::blocking::FileDialogBuilder::default()
        .add_filter("Image", &["png", "jpg", "jpeg", "bmp"])
        .pick_file();
    if let Some(path) = path {
        // let img = image::open(path.clone()).expect("Failed to open image");
        // let (width, height) = img.dimensions();
        // println!("Image dimensions: {} x {}", width, height);

        // let sub_image_width = width/5;
        // let sub_image_height = (sub_image_width as f32/21.0*29.7) as u32; 

        // let output_dir = dirs::data_local_dir().unwrap().join("Print Splicer");
        // // add the app name to the output path
        // // let output_dir = output_dir.join("Print Splicer");
        // fs::create_dir_all(&output_dir).expect("Failed to create output directory");

        // for (row, y) in (0..height).step_by(sub_image_height as usize).enumerate() {
        //     for (column, x) in (0..width).step_by(sub_image_width as usize).enumerate() {
        //         let sub_image = extract_sub_image(&img, x, y, sub_image_width, sub_image_height);
        //         let output_path = format!("{}/{}_{}.png", output_dir.to_string_lossy(), column, row);
        //         sub_image.save(output_path).expect("Failed to save sub-image");
        //     }
        // }

        return Some(path.to_str().unwrap().to_string())
    }
    None
}

#[tauri::command]
async fn splice_image(path: String, columns: u32, window: Window<Wry>) {
    let img = image::open(path.clone()).expect("Failed to open image");
    let (width, height) = img.dimensions();
    println!("Image dimensions: {} x {}", width, height);

    let sub_image_width = width/columns;
    let sub_image_height = (sub_image_width as f32/21.0*29.7) as u32; 

    let output_dir = dirs::data_local_dir().unwrap().join("Print Splicer");
    // add the app name to the output path
    // let output_dir = output_dir.join("Print Splicer");
    fs::create_dir_all(&output_dir).expect("Failed to create output directory");

    for (row, y) in (0..height).step_by(sub_image_height as usize).enumerate() {
        for (column, x) in (0..width).step_by(sub_image_width as usize).enumerate() {
            let handle = Arc::new(window.clone()).clone();
            let sub_image = extract_sub_image(&img, x, y, sub_image_width, sub_image_height);
            let output_path = format!("{}/{}_{}.png", output_dir.to_string_lossy(), column, row);
            sub_image.save(output_path.clone()).expect("Failed to save sub-image");
            handle.emit("image-saved", output_path).expect("Failed to emit event");
        }
    }
}

fn extract_sub_image(
    img: &DynamicImage,
    x: u32,
    y: u32,
    width: u32,
    height: u32,
) -> RgbaImage {
    let mut sub_image = ImageBuffer::new(width, height);

    for sub_y in 0..height {
        for sub_x in 0..width {
            let img_x = x + sub_x;
            let img_y = y + sub_y;

            // Make sure the pixel coordinates are within the bounds of the input image
            if img_x < img.width() && img_y < img.height() {
                let pixel = img.get_pixel(img_x, img_y);
                sub_image.put_pixel(sub_x, sub_y, Rgba(pixel.0));
            }
        }
    }

    sub_image
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            file_upload,
            splice_image,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}