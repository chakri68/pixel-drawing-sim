import { Optional } from "../utils/typeUtils";

export interface Options {
  size: [number, number];
  canvasPadding: [number, number];
  gap: number;
  color: string;
}

export type Cell = {
  index: [number, number];
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  color: string;
};

type optionalOptionKeys = "canvasPadding" | "gap" | "color";

export class CanvasGrid {
  public ctx: CanvasRenderingContext2D;
  public options: Options;
  private defaultOptions: Pick<Options, optionalOptionKeys> = {
    canvasPadding: [10, 10],
    gap: 0,
    color: "#fff",
  };
  private cellData: Cell[][] = [];

  constructor(
    public canvasElement: HTMLCanvasElement,
    options: Optional<Options, optionalOptionKeys>
  ) {
    this.updateCanvasSize();
    this.ctx = canvasElement.getContext("2d")!;
    // Merge default options
    this.options = {
      ...options,
      ...Object.fromEntries(
        Object.entries(this.defaultOptions).filter(
          // @ts-ignore
          ([key, value]) => options[key] === undefined
        )
      ),
    } as Options;

    // Generate and update CellData
    this.cellData = this.generateCellData();

    this.drawCells();
    this.addResizeHandler();
  }

  private generateCellData(): Cell[][] {
    const { canvasPadding, size, color, gap } = this.options;
    const [cols, rows] = size;
    const [paddingX, paddingY] = canvasPadding;

    const cellData: Cell[][] = [];

    // Calculate cell width and height, considering the gap
    const cellWidth =
      (this.canvasElement.width - 2 * paddingX - (cols - 1) * gap) / cols;
    const cellHeight =
      (this.canvasElement.height - 2 * paddingY - (rows - 1) * gap) / rows;

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;

    // Draw the grid as cells
    for (let y = 0; y < rows; y++) {
      cellData[y] = [];
      for (let x = 0; x < cols; x++) {
        const startX = x * (cellWidth + gap) + paddingX;
        const startY = y * (cellHeight + gap) + paddingY;
        cellData[y][x] = {
          index: [x, y],
          rect: {
            x: startX,
            y: startY,
            width: cellWidth,
            height: cellHeight,
          },
          color: color,
        };
      }
    }
    return cellData;
  }

  private updateCellRects() {
    const { canvasPadding, size, color, gap } = this.options;
    const [cols, rows] = size;
    const [paddingX, paddingY] = canvasPadding;

    // Calculate cell width and height, considering the gap
    const cellWidth =
      (this.canvasElement.width - 2 * paddingX - (cols - 1) * gap) / cols;
    const cellHeight =
      (this.canvasElement.height - 2 * paddingY - (rows - 1) * gap) / rows;

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const startX = x * (cellWidth + gap) + paddingX;
        const startY = y * (cellHeight + gap) + paddingY;
        this.cellData[y][x].rect = {
          x: startX,
          y: startY,
          width: cellWidth,
          height: cellHeight,
        };
      }
    }
  }

  private drawCells() {
    this.cellData.forEach((row) => {
      row.forEach((cell) => {
        this.ctx.fillStyle = cell.color;
        this.drawRoundRect(
          cell.rect.x,
          cell.rect.y,
          cell.rect.width,
          cell.rect.height
        );
      });
    });
  }

  private drawRoundRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radii: number = 6
  ) {
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, width, height, radii);
    this.ctx.fill();
  }

  private drawCell(index: [number, number]) {
    const [x, y] = index;
    const cell = this.cellData[y][x];
    this.ctx.fillStyle = cell.color;
    this.drawRoundRect(
      cell.rect.x,
      cell.rect.y,
      cell.rect.width,
      cell.rect.height
    );
  }

  private addResizeHandler() {
    window.addEventListener("resize", () => {
      this.updateCanvasSize();
      this.updateCellRects();
      this.drawCells();
    });
  }

  public updateCanvasSize() {
    const boundingBox = this.canvasElement.getBoundingClientRect();
    this.canvasElement.width = boundingBox.width;
    this.canvasElement.height = boundingBox.height;
  }

  public resizeHandler([width, height]: [number, number]) {
    this.canvasElement.width = width;
    this.canvasElement.height = height;
    this.updateCellRects();
    this.drawCells();
  }

  public fillCell(index: [number, number], color: string) {
    const [x, y] = index;
    const cell = this.cellData[y][x];
    cell.color = color;
    this.ctx.fillStyle = color;
    this.drawCell(index);
  }
}
