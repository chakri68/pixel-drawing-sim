import { CanvasGrid } from "./lib/canvas/Grid";
import { handleResizeDrag } from "./lib/dom";
import { asyncSleep } from "./lib/utils/animations";
import "./styles/global.scss";
import "./styles/sass/styles.scss";
import NaiveLineDrawing from "./lib/lineDrawing/NaiveLineDrawing";

console.log("index.js connected!");

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const canvasManager = new CanvasGrid(canvas, {
  cellSize: [30, 30],
  gap: 10,
});

handleResizeDrag(canvasManager.resizeHandler.bind(canvasManager));

// @ts-ignore
const fillCell = async (...args) => {
  // @ts-ignore
  canvasManager.fillCell(...args); // A simple alias
  await asyncSleep(1000);
};

async function startAnimation() {
  await canvasManager.drawLine([0, 0], [7, 5], NaiveLineDrawing);
}

startAnimation();
