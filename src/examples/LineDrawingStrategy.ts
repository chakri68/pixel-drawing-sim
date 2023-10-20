export type Point = [number, number];

export type LineDrawingStrategy = (
  startPoint: Point,
  endPoint: Point
) => Point[];
