export const DDALineDrawing = (startPoint, endPoint) => {
  const [x1, y1] = startPoint;
  const [x2, y2] = endPoint;

  const points = [];

  const dx = x2 - x1;
  const dy = y2 - y1;

  const steps = Math.max(Math.abs(dx), Math.abs(dy));

  const xIncrement = dx / steps;
  const yIncrement = dy / steps;

  let x = x1;
  let y = y1;

  for (let i = 0; i <= steps; i++) {
    points.push([Math.round(x), Math.round(y)]);
    x += xIncrement;
    y += yIncrement;
  }

  return points;
};
