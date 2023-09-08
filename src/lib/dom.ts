export function handleResizeDrag(callback?: (size: [number, number]) => void) {
  const resizeDragEl = document.querySelector(
    "#resize-drag"
  ) as HTMLButtonElement;
  const codeAreaEl = document.querySelector(
    "#code-area-wrapper"
  ) as HTMLDivElement;
  const canvasEl = document.querySelector("#canvas") as HTMLCanvasElement;

  let state = {
    startX: 0, // changes every time the drag starts
    dragStartWidth: 0, // changes every time the drag starts
  };

  const handleMouseDown = (ev: MouseEvent) => {
    resizeDragEl.classList.add("dragging");
    state.startX = ev.clientX;
    state.dragStartWidth = codeAreaEl.getBoundingClientRect().width;

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (ev: MouseEvent) => {
    if (resizeDragEl.classList.contains("dragging")) {
      const dx = ev.clientX - state.startX;
      codeAreaEl.style.width = `${state.dragStartWidth + dx}px`;
      canvasEl.width = canvasEl.getBoundingClientRect().width;
      canvasEl.height = canvasEl.getBoundingClientRect().height;
      callback && callback([canvasEl.width, canvasEl.height]);
    }
  };

  const handleMouseUp = (ev: MouseEvent) => {
    resizeDragEl.classList.remove("dragging");
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  resizeDragEl.addEventListener("mousedown", handleMouseDown);
}
