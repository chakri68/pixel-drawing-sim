import { LineStrategy, Point } from "../canvas/Grid";

const drawLine: LineStrategy = (point1: Point, point2: Point) => {
  const points: Point[] = [];

  let [x1, y1] = point1;
  let [x2, y2] = point2;

  const rise = y2 - y1;
  const run = x2 - x1;

  // m = Infinity
  if (x2 === x1) {
    if (y2 < y1) [y1, y2] = [y2, y1];
    for (let y = y1; y <= y2; y++) {
      points.push([x1, y]);
    }
    return points;
  }
  // Safe to calculate slope now
  const m = rise / run;
  if (m > 1 || m < -1) {
    // Mostly vertical line -> y moves faster
    if (y2 < y1) {
      [y1, y2] = [y2, y1];
      [x1, x2] = [x2, x1];
    }
    for (let y = y1; y <= y2; y++) {
      // Find x
      const x = Math.round(x1 + (y - y1) / m);
      points.push([x, y]);
    }
    return points;
  }
  if (m <= 1 && m >= -1) {
    // Mostly horizontal line -> x grows faster
    if (x2 < x1) {
      [x1, x2] = [x2, x1];
      [y1, y2] = [y2, y1];
    }
    for (let x = x1; x <= x2; x++) {
      // Calculate y for this x
      const y = Math.round(m * (x - x1) + y1);
      points.push([x, y]);
    }
    return points;
  }
  return [];
};

export default drawLine;
