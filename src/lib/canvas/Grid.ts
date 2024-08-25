import { asyncSleep } from "../utils/animations";
import { Optional } from "../utils/typeUtils";

type RenderTask = () => void;

export type Point = [number, number];

export type LineStrategy = (point1: Point, point2: Point) => Point[];

export interface Options {
  cellSize: [number, number];
  gap: number;
  color: string;
  pixelRadius: number;
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

type OptionalOptionKeys = "gap" | "color" | "pixelRadius";

export class CanvasGrid {
  public ctx: CanvasRenderingContext2D;
  public options: Options;
  private defaultOptions: Pick<Options, OptionalOptionKeys> = {
    gap: 0,
    color: "#fff",
    pixelRadius: 6,
  };
  private cellData: Cell[][] = [];
  private overlayLines: { startCell: Cell["index"]; endCell: Cell["index"] }[] =
    [];
  private bufferedTasks: Array<RenderTask> = [];
  private resizeTimeout: number | null = null;

  constructor(
    public canvasElement: HTMLCanvasElement,
    options: Optional<Options, OptionalOptionKeys>
  ) {
    this.ctx = canvasElement.getContext("2d")!;
    this.options = { ...this.defaultOptions, ...options };

    this.updateCanvasSize();
    this.updateCellCount();
    this.refreshGrid();

    window.addEventListener("resize", this.handleResize.bind(this));
    this.renderHandler();
  }

  private handleResize() {
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
    this.resizeTimeout = window.setTimeout(() => {
      this.updateCanvasSize();
      this.updateCellCount();
      this.drawCells();
    }, 200);
  }

  public updateCanvasSizeAndRedraw(newSize: [number, number]) {
    this.canvasElement.width = newSize[0];
    this.canvasElement.height = newSize[1];
    this.updateCellCount();
    this.refreshGrid();
  }

  private generateCellData(rows: number, cols: number): Cell[][] {
    const { color, gap, cellSize } = this.options;
    const [cellWidth, cellHeight] = cellSize;

    const [pX, pY] = this.calculatePadding(rows, cols);

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;

    return Array.from({ length: rows }, (_, y) =>
      Array.from({ length: cols }, (_, x) => ({
        index: [x, y],
        rect: {
          x: pX + x * (cellWidth + gap),
          y: pY + y * (cellHeight + gap),
          width: cellWidth,
          height: cellHeight,
        },
        color: color,
      }))
    );
  }

  private drawCells() {
    this.cellData.forEach((row) =>
      row.forEach((cell) => {
        this.ctx.fillStyle = cell.color;
        this.drawRoundRect(
          cell.rect.x,
          cell.rect.y,
          cell.rect.width,
          cell.rect.height
        );
      })
    );
  }

  private drawRoundRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radii: number = this.options.pixelRadius
  ) {
    this.addRenderTask(() => {
      this.ctx.beginPath();
      this.ctx.roundRect(x, y, width, height, radii);
      this.ctx.fill();
    });
  }

  public updateCanvasSize() {
    const { width, height } = this.canvasElement.getBoundingClientRect();
    this.canvasElement.width = width;
    this.canvasElement.height = height;
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
    this.cellData = this.generateCellData(newRows, newCols);
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

  public fillCell(index: [number, number], color: string) {
    const [x, y] = index;
    const cell = this.cellData[y][x];
    cell.color = color;
    this.ctx.fillStyle = color;
    this.drawCell(index);
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
    this.addRenderTask(() => {
      for (const { startCell, endCell } of this.overlayLines) {
        const sCell = this.cellData[startCell[1]][startCell[0]].rect;
        const eCell = this.cellData[endCell[1]][endCell[0]].rect;
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = "#000";
        this.ctx.beginPath();
        this.ctx.moveTo(sCell.x + sCell.width / 2, sCell.y + sCell.height / 2);
        this.ctx.lineTo(eCell.x + eCell.width / 2, eCell.y + eCell.height / 2);
        this.ctx.stroke();
      }
    });
  }

  public addOverlayLine(startIndex: Cell["index"], endIndex: Cell["index"]) {
    this.overlayLines.push({ startCell: startIndex, endCell: endIndex });
    this.drawOverlayLines();
  }

  public clearCells() {
    this.cellData.forEach((row) => {
      row.forEach((cell) => (cell.color = "#fff"));
    });
  }

  public clearOverlayLines() {
    this.overlayLines = [];
  }

  public refreshGrid() {
    this.addRenderTask(() => {
      this.ctx.fillStyle = "#fff";
      this.ctx.fillRect(
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height
      );
    });
    this.drawCells();
    this.drawOverlayLines();
  }

  private addRenderTask(task: RenderTask) {
    this.bufferedTasks.push(task);
  }

  private renderHandler() {
    this.bufferedTasks.forEach((task) => task());
    this.bufferedTasks = [];
    window.requestAnimationFrame(this.renderHandler.bind(this));
  }
}
