import chalk from "chalk";
import { CanvasGrid } from "./lib/canvas/Grid";
import { handleResizeDrag } from "./lib/dom";
import { asyncSleep } from "./lib/utils/animations";
import "./styles/global.scss";
import "./styles/sass/styles.scss";

import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { CodeRunner } from "./lib/CodeRunner";
import { indentWithTab } from "@codemirror/commands";
import { File, StateManager } from "./lib/utils/state";

console.log("index.js connected!");

// Check the local storage for a saved code
let prevState = StateManager.loadState();
if (prevState === null) {
  console.info("No previous state found");
  console.info("Created a new state");
}

const stateManager = new StateManager(prevState ?? undefined);
console.info("Loaded state", stateManager.getState());

// CodeMirror Setup
const basicTheme = EditorView.theme({
  "&": {
    fontSize: "18px",
  },
  ".cm-content": {
    fontFamily: "monospace",
  },
});

let initFile: File;

if (stateManager.getFiles().length > 0) {
  console.info("Opening file", stateManager.getFiles()[0].name);
  initFile = stateManager.openFile(stateManager.getFiles()[0].name);
} else {
  console.info("No files found, creating a new file");
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
  initFile = { name: "untitled.js", data: initCode };
  stateManager.createFile(initFile);
  console.info("Created a new file", initFile);
}

console.info("Opened file", initFile);
const initCode = stateManager.openFile(initFile.name).data;

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
    if (pixel.length !== 2 && pixel.length !== 3) {
      console.error("Each pixel must have 2 values");
      return;
    }
    // for (const value of pixel) {
    //   if (typeof value !== "number") {
    //     console.error("Each pixel value must be a number");
    //     return;
    //   }
    // }
  }

  // GOOD TO GO:
  // Clear the canvas
  canvasManager.clearCells();
  canvasManager.clearOverlayLines();
  canvasManager.refreshGrid();

  // Overlay line
  // canvasManager.addOverlayLine(
  //   pixels[0].slice(0, 2),
  //   pixels[pixels.length - 1].slice(0, 2)
  // );

  // Draw the pixels
  for (const pixel of pixels) {
    canvasManager.fillCell(pixel.slice(0, 2), pixel?.[2] ?? "#f00");
    await asyncSleep(10);
  }
});

const canvasManager = new CanvasGrid(canvas, {
  cellSize: [2, 2],
  gap: 0,
});

handleResizeDrag(canvasManager.resizeHandler.bind(canvasManager));

window.addEventListener("beforeunload", () => {
  const data = cm.state.doc.toString();
  stateManager.saveOpenedFile(data);
  StateManager.saveState(stateManager.getState());
  console.info("Saved state", stateManager.getState());
});

// ctrl + s
document.addEventListener("keydown", (ev) => {
  if (ev.ctrlKey && ev.key === "s") {
    ev.preventDefault();
    const data = cm.state.doc.toString();
    stateManager.saveOpenedFile(data);
    StateManager.saveState(stateManager.getState());
    console.info("Saved state");
  }
});

// Sceme way of giving the canvas manager to the window to allow for file loading and things
Object.defineProperty(window, "CanvasManager", {
  value: Object.freeze({
    drawingUtils: {
      drawPixel: canvasManager.fillCell.bind(canvasManager),
      clearPixels: canvasManager.clearCells.bind(canvasManager),
    },
    storage: {
      saveState: StateManager.saveState.bind(StateManager),
      getState: StateManager.loadState.bind(StateManager),
      newFile: (fileName: string) => {
        const file = stateManager.createFile({ name: fileName, data: "" });
        cm.dispatch({
          changes: {
            from: 0,
            to: cm.state.doc.length,
            insert: stateManager.openFile(file.name).data,
          },
        });
      },
      renameFile: (fileName: string) => {
        const openedFile = stateManager.getOpenedFile();
        if (!openedFile) return;
        stateManager.renameFile(openedFile.name, fileName);
      },
      saveFile: () => stateManager.saveOpenedFile(cm.state.doc.toString()),
      openFile: (fileName: string) => {
        const file = stateManager.openFile(fileName);
        cm.dispatch({
          changes: {
            from: 0,
            to: cm.state.doc.length,
            insert: file.data,
          },
        });
      },
      listFiles: () => {
        return stateManager.getFiles().map((file) => file.name);
      },
      currentFile: () => {
        return stateManager.getOpenedFile()?.name ?? null;
      },
      deleteFile: (fileName: string) => {
        stateManager.deleteFile(fileName);
        // Open the first file
        const files = stateManager.getFiles();
        if (files.length > 0) {
          stateManager.openFile(files[0].name);
          cm.dispatch({
            changes: {
              from: 0,
              to: cm.state.doc.length,
              insert: stateManager.openFile(files[0].name).data,
            },
          });
        } else {
          // create a new file
          const newFile = stateManager.createFile({
            name: "untitled.js",
            data: "",
          });
          cm.dispatch({
            changes: {
              from: 0,
              to: cm.state.doc.length,
              insert: stateManager.openFile(newFile.name).data,
            },
          });
        }
      },
    },
  }),
  writable: false,
  enumerable: true,
  configurable: false,
});

// Write to the console about the CLI
console.log(chalk.bgBlack.cyan("Welcome to the CLI!"));
console.log(
  `Use ${chalk.bgBlack.cyan("CanvasManager")} to see the available commands`
);
