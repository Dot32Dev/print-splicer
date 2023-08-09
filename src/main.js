const { invoke } = window.__TAURI__.tauri;
// import { convertFileSrc } from '@tauri-apps/api/tauri';
const { convertFileSrc } = window.__TAURI__.tauri;
// const { join } = window.__TAURI__.tauri.path;

async function file_upload() {
  // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
  // greetMsgEl.textContent = await invoke("greet", { name: greetInputEl.value });
  let path = await invoke("file_upload");
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

  // const imageWidth = img.width;
  // console.log(imageWidth)
  // const aspectRatio = Math.sqrt(2);
  // // const gridElementHeight = imageWidth/5 / 29.7*21;
  // const numColumns = 5; // Number of columns
  // const gridElementWidth = imageWidth / numColumns;
  // console.log(gridElementWidth)
  // const gridElementHeight = gridElementWidth / aspectRatio;
  // const numRows = Math.ceil(img.height / gridElementHeight); // Number of rows
  // const gridOverlay = document.querySelector(".grid-overlay");
  // gridOverlay.style.gridTemplateColumns = `repeat(${numColumns}, ${gridElementWidth}px))`;
  // gridOverlay.style.gridTemplateRows = `repeat(${numRows}, ${gridElementHeight}px)`;

  img.onload = async () => {
    let width = img.width;
    let height = img.height;
    let aspectRatio = 1/Math.sqrt(2);
    let numColumns = 5; // Number of columns
    let gridElementWidth = width / numColumns;
    let gridElementHeight = gridElementWidth / aspectRatio;
    let numRows = Math.ceil(height / gridElementHeight); // Number of rows
    let gridOverlay = document.querySelector(".grid-overlay");
    gridOverlay.style.gridTemplateColumns = `repeat(${numColumns}, ${gridElementWidth}px)`;
    gridOverlay.style.gridTemplateRows = `repeat(${numRows}, ${gridElementHeight}px)`;
  }

  await invoke("splice_image", { path: path });
}

window.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector("#file-upload")
    .addEventListener("click", () => file_upload());
});
