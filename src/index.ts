import { CanvasGrid } from "./lib/canvas/Grid";
import { handleResizeDrag } from "./lib/dom";
import { asyncSleep } from "./lib/utils/animations";
import "./styles/global.scss";
import "./styles/sass/styles.scss";

console.log("index.js connected!");

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const canvasManager = new CanvasGrid(canvas, {
  size: [9, 9],
  gap: 10,
  canvasPadding: [10, 10],
});

handleResizeDrag(canvasManager.resizeHandler.bind(canvasManager));

// @ts-ignore
const fillCell = async (...args) => {
  // @ts-ignore
  canvasManager.fillCell(...args); // A simple alias
  await asyncSleep(1000);
};

async function startAnimation() {
  await fillCell([0, 0], "#f00");
  await fillCell([1, 0], "#f00");
  await fillCell([2, 0], "#f00");
  await fillCell([3, 0], "#f00");
}

startAnimation();
