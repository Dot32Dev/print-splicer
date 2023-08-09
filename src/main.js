const { invoke } = window.__TAURI__.tauri;
// import { convertFileSrc } from '@tauri-apps/api/tauri';
const { convertFileSrc } = window.__TAURI__.tauri;
// const { join } = window.__TAURI__.tauri.path;

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
      // gridElement.id = `grid_${Math.floor(i / numColumns)}_${i % numColumns}`;
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
  await invoke("splice_image", { path: path, columns: numColumns });
}

window.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector("#file-upload")
    .addEventListener("click", () => file_upload());

  document
    .querySelector("#chop-image")
    .addEventListener("click", () => chop_image());
});
