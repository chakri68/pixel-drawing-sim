import { asyncSleep } from "../utils/animations";
import { Optional } from "../utils/typeUtils";

export type Point = [number, number];

export type LineStrategy = (point1: Point, point2: Point) => Point[];

export interface Options {
  cellSize: [number, number];
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

type optionalOptionKeys = "gap" | "color";

export class CanvasGrid {
  public ctx: CanvasRenderingContext2D;
  public options: Options;
  private defaultOptions: Pick<Options, optionalOptionKeys> = {
    gap: 0,
    color: "#fff", // default color
  };
  private cellData: Cell[][] = [];
  private overlayLines: { startCell: Cell["index"]; endCell: Cell["index"] }[] =
    [];

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

    this.updateCellCount();

    this.refreshGrid();
  }

  private generateCellData(
    rows: number,
    cols: number,
    oldData: Cell[][] = []
  ): Cell[][] {
    const { color, gap, cellSize } = this.options;
    const [cellWidth, cellHeight] = cellSize;

    const [pX, pY] = this.calculatePadding(rows, cols);

    const cellData: Cell[][] = oldData
      .map((data) => data.slice(0, cols))
      .slice(0, rows);

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;

    // Draw the grid as cells
    for (let y = 0; y < rows; y++) {
      if (!cellData[y]) cellData[y] = [];
      for (let x = 0; x < cols; x++) {
        const startX = pX + x * (cellWidth + gap);
        const startY = pY + y * (cellHeight + gap);
        if (!cellData[y][x])
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
        else {
          cellData[y][x].rect = {
            x: startX,
            y: startY,
            width: cellWidth,
            height: cellHeight,
          };
        }
      }
    }
    return cellData;
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
      this.updateCellCount();
      this.drawCells();
    });
  }

  public updateCanvasSize() {
    const boundingBox = this.canvasElement.getBoundingClientRect();
    this.canvasElement.width = boundingBox.width;
    this.canvasElement.height = boundingBox.height;
  }

  private updateCellCount() {
    const { gap, cellSize } = this.options;

    const [cellWidth, cellHeight] = cellSize;
    const newCols = Math.floor(
      (this.canvasElement.width + gap) / (cellWidth + gap)
    );
    const newRows = Math.floor(
      (this.canvasElement.height + gap) / (cellHeight + gap)
    );
    this.cellData = this.generateCellData(newRows, newCols, this.cellData);
  }

  private calculatePadding(rows: number, cols: number) {
    const { gap, cellSize } = this.options;
    const [cellWidth, cellHeight] = cellSize;
    const paddingX =
      (this.canvasElement.width - (cols * cellWidth + (cols - 1) * gap)) / 2;
    const paddingY =
      (this.canvasElement.height - (rows * cellHeight + (rows - 1) * gap)) / 2;

    return [paddingX, paddingY];
  }

  public resizeHandler([width, height]: [number, number]) {
    this.canvasElement.width = width;
    this.canvasElement.height = height;
    this.updateCellCount();
    this.drawCells();
    this.drawOverlayLines();
  }

  public fillCell(index: [number, number], color: string) {
    const [x, y] = index;
    const cell = this.cellData[y][x];
    cell.color = color;
    this.ctx.fillStyle = color;
    this.drawCell(index);
  }

  public async drawLine(point1: Point, point2: Point, strategy: LineStrategy) {
    this.addOverlayLine(point1, point2);
    const points = strategy(point1, point2);
    for (const point of points) {
      this.fillCell(point, "#f00");
      this.drawOverlayLines();
      await asyncSleep(1000);
    }
  }

  private drawOverlayLines() {
    for (const { startCell, endCell } of this.overlayLines) {
      const sCell = this.cellData[startCell[1]][startCell[0]].rect;
      const eCell = this.cellData[endCell[1]][endCell[0]].rect;
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = "#000";
      this.ctx.moveTo(sCell.x + sCell.width / 2, sCell.y + sCell.height / 2);
      this.ctx.lineTo(eCell.x + eCell.width / 2, eCell.y + eCell.height / 2);
      this.ctx.stroke();
    }
  }

  public addOverlayLine(startIndex: Cell["index"], endIndex: Cell["index"]) {
    this.overlayLines.push({ startCell: startIndex, endCell: endIndex });
    this.drawOverlayLines();
  }

  public clearCells() {
    for (const row of this.cellData) {
      for (const col of row) {
        col.color = "#fff"; // default color
      }
    }
  }

  public clearOverlayLines() {
    this.overlayLines = [];
  }

  public refreshGrid() {
    this.ctx.fillStyle = "#fff";
    this.ctx.fillRect(
      0,
      0,
      this.canvasElement.width,
      this.canvasElement.height
    );
    this.drawCells();
    this.drawOverlayLines();
  }
}
