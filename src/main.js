const { invoke } = window.__TAURI__.tauri;
// import { convertFileSrc } from '@tauri-apps/api/tauri';
const { convertFileSrc } = window.__TAURI__.tauri;
// const { join } = window.__TAURI__.tauri.path;
var { emit, listen } = window.__TAURI__.event;

let path;
let numColumns = 5;

async function file_upload() {
  // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
  // greetMsgEl.textContent = await invoke("greet", { name: greetInputEl.value });
  path = await invoke("file_upload");
  if (path === null) {
    console.log("No file selected");
    return;
  }
  console.log(path);
  // create image element
  let img = document.createElement("img");
  img.src = convertFileSrc(path);
  // append to body
  // document.body.appendChild(img)
  // get image container elelment
  let img_container = document.querySelector(".image-container");
  // append to image container
  img_container.appendChild(img);

  // let numColumns = 5; // Number of columns
  
  img.onload = async () => {
    let width = img.width;

    // If image is wider than the screen
    if (width > window.innerWidth*0.8) {
      // Set image width to screen width
      img.style.width = `${window.innerWidth*0.8}px`;
      // Set image height to auto
      img.style.height = "auto";
    }

    width = img.width;
    let height = img.height;
    let aspectRatio = 1/Math.sqrt(2);
    let gridElementWidth = width / numColumns;
    let gridElementHeight = gridElementWidth / aspectRatio;
    let numRows = Math.ceil(height / gridElementHeight); // Number of rows
    let gridOverlay = document.querySelector(".grid-overlay");
    gridOverlay.style.gridTemplateColumns = `repeat(${numColumns}, ${gridElementWidth}px)`;
    gridOverlay.style.gridTemplateRows = `repeat(${numRows}, ${gridElementHeight}px)`;

    // Remove all existing grid elements
    let gridElements = document.querySelectorAll(".grid-overlay > *");
    gridElements.forEach((element) => {
      element.remove();
    });
    // Add back new grid elements
    for (let i = 0; i < numColumns * numRows; i++) {
      let gridElement = document.createElement("div");
      gridElement.classList.add("grid-element");
      // Give the element the id of column_row
      gridElement.id = `${i % numColumns}_${Math.floor(i / numColumns)}`;
      gridOverlay.appendChild(gridElement);
    }
  }

  // Get number input element
  let numColumnsInput = document.querySelector("#columns");
  // Add event listener
  numColumnsInput.addEventListener("change", () => {
    numColumns = parseInt(numColumnsInput.value);
    img.onload();
  });
  // await invoke("splice_image", { path: path, columns: numColumns });
}

async function chop_image() {
  // get elements with class buttons
  let buttons = document.querySelectorAll(".buttons");
  // iterate through buttons
  buttons.forEach((button) => {
    // display none
    button.style.display = "none";
  });

  // Get the grid overlay element
  let gridOverlay = document.querySelector(".grid-overlay");
  // Set its background
  gridOverlay.style.backgroundColor = "#2f2f2f80";

  await invoke("splice_image", { path: path, columns: numColumns });
}

listen("image-saved", (message) => {
  console.log(message.payload);
  let img = document.createElement("img");
  img.src = convertFileSrc(message.payload);

  // Get the filename of the image
  let filename = message.payload.split("/").pop();
  // Remove .png from the filename
  filename = filename.substring(0, filename.length - 4);

  // Find something with the filenames id
  let gridElement = document.getElementById(filename);
  // Append the image to the grid element
  gridElement.appendChild(img);

  // Get bounding box of grid 
  let gridOverlay = document.querySelector(".grid-overlay");
  let boundingBox = gridOverlay.getBoundingClientRect();
  // Get center of grid bounding box
  let x = boundingBox.width / 2 + boundingBox.x;
  let y = boundingBox.height / 2 + boundingBox.y;

  // Get bounding box of grid element
  let gridElementBoundingBox = gridElement.getBoundingClientRect();
  // Get center of grid element
  let gridElementCenterX = gridElementBoundingBox.width / 2 + gridElementBoundingBox.x;
  let gridElementCenterY = gridElementBoundingBox.height / 2 + gridElementBoundingBox.y;

  // Find distance from center of grid element to center of grid with pythagoras
  let distance = Math.sqrt(Math.pow(gridElementCenterX - x, 2) + Math.pow(gridElementCenterY - y, 2));
  // Find direction between center of grid element and center of grid
  let direction = Math.atan2(gridElementCenterY - y, gridElementCenterX - x);
  // Move the image away from the center of the grid with transform
  let move_multiplier = 0.2;
  img.style.transform = `translate(${move_multiplier * distance * Math.cos(direction)}px, ${move_multiplier * distance * Math.sin(direction)}px)`;
  // Set image scale slightly larger
  let scale_multiplier = 1.2;
  img.style.scale = `${scale_multiplier}`;
  
  gridElement.style.backgroundColor = "#2f2f2f";

  // let mainImage = document.querySelector(".image-container > img");
  // mainImage.style.opacity = 0.5;
  // // Make the grid overlay elements no border
  // let gridElements = document.querySelectorAll(".grid-overlay > *");
  // gridElements.forEach((element) => {
  //   element.style.border = "none";
  // });
});

window.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector("#file-upload")
    .addEventListener("click", () => file_upload());

  document
    .querySelector("#chop-image")
    .addEventListener("click", () => chop_image());
});
