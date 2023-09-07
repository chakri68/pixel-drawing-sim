import "./styles/global.scss";
import "./styles/sass/styles.scss";

console.log("index.js connected!");

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

// window.addEventListener("resize", () => {
//   const boundingBox = canvas.getBoundingClientRect();
//   canvas.width = boundingBox.width;
//   canvas.height = boundingBox.height;
// });
