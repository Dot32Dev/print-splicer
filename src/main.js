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
  document.body.appendChild(img)

  await invoke("splice_image", { path: path });
}

window.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector("#file-upload")
    .addEventListener("click", () => file_upload());
});
