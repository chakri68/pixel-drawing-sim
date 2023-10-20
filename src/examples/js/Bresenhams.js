export const BresenhamsLineDrawing = (startPoint, endPoint) => {
  let [x1, y1] = startPoint;
  let [x2, y2] = endPoint;
  const points = [];
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1;
  const sy = y1 < y2 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    points.push([x1, y1]);

    if (x1 === x2 && y1 === y2) break;

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x1 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y1 += sy;
    }
  }

  return points;
};
