import { CanvasGrid } from "./lib/canvas/Grid";
import { handleResizeDrag } from "./lib/dom";
import { asyncSleep } from "./lib/utils/animations";
import "./styles/global.scss";
import "./styles/sass/styles.scss";
import NaiveLineDrawing from "./lib/lineDrawing/NaiveLineDrawing";

import { EditorView, basicSetup } from "codemirror";
import { EditorState, Text } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { CodeRunner } from "./lib/CodeRunner";
import { indentWithTab } from "@codemirror/commands";

console.log("index.js connected!");

// CodeMirror Setup
const basicTheme = EditorView.theme({
  "&": {
    fontSize: "18px",
  },
  ".cm-content": {
    fontFamily: "monospace",
  },
});

const initCode = `const point1 = [0, 5]
const point2 = [74, 80]

/**
 * @returns {[number, number][]}
 * The array of pixels to color in order
*/
function fillPixels(){
  // Write logic here

}
`;

const state = EditorState.create({
  doc: initCode,
  extensions: [
    basicSetup,
    keymap.of([indentWithTab]),
    javascript(),
    oneDark,
    basicTheme,
  ],
});

const cm = new EditorView({
  state,
  parent: document.getElementById("code-area")!,
});

const codeRunner = new CodeRunner();

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const runBtn = document.getElementById("run-code")!;
const clearBtn = document.getElementById("clear-code")!;

runBtn.addEventListener("click", async () => {
  const pixels = codeRunner.run(cm.state.doc.toString());

  // Check the input pixels
  if (!Array.isArray(pixels)) {
    console.error("Pixels must be an object");
    return;
  }
  for (const pixel of pixels) {
    if (!Array.isArray(pixel)) {
      console.error("Each pixel must be an array");
      return;
    }
    if (pixel.length !== 2) {
      console.error("Each pixel must have 2 values");
      return;
    }
    for (const value of pixel) {
      if (typeof value !== "number") {
        console.error("Each pixel value must be a number");
        return;
      }
    }
  }

  // GOOD TO GO:
  // Clear the canvas
  canvasManager.clearCells();
  canvasManager.clearOverlayLines();
  canvasManager.refreshGrid();

  // Overlay line
  // canvasManager.addOverlayLine(pixels[0], pixels[pixels.length - 1]);

  // Draw the pixels
  for (const pixel of pixels) {
    canvasManager.fillCell(pixel, "#f00");
    await asyncSleep(10);
  }
});

const canvasManager = new CanvasGrid(canvas, {
  cellSize: [10, 10],
  gap: 3,
});

handleResizeDrag(canvasManager.resizeHandler.bind(canvasManager));
