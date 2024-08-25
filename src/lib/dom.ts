export function handleResizeDrag(callback?: (size: [number, number]) => void) {
  const resizeDragEl = document.querySelector(
    "#resize-drag"
  ) as HTMLButtonElement;
  const codeAreaEl = document.querySelector(
    "#code-area-wrapper"
  ) as HTMLDivElement;
  const canvasEl = document.querySelector("#canvas") as HTMLCanvasElement;

  const state = {
    startX: 0,
    dragStartWidth: 0,
  };

  const handleMouseDown = (ev: MouseEvent) => {
    resizeDragEl.classList.add("dragging");
    state.startX = ev.clientX;
    state.dragStartWidth = codeAreaEl.getBoundingClientRect().width;

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (ev: MouseEvent) => {
    const dx = ev.clientX - state.startX;
    codeAreaEl.style.width = `${state.dragStartWidth + dx}px`;

    // requestAnimationFrame(() => {
    //   const { width, height } = canvasEl.getBoundingClientRect();
    //   canvasEl.width = width;
    //   canvasEl.height = height;
    //   if (callback) {
    //     callback([canvasEl.width, canvasEl.height]);
    //   }
    // });
  };

  const handleMouseUp = () => {
    resizeDragEl.classList.remove("dragging");
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
    const { width, height } = canvasEl.getBoundingClientRect();
    canvasEl.width = width;
    canvasEl.height = height;
    if (callback) {
      callback([canvasEl.width, canvasEl.height]);
    }
  };

  resizeDragEl.addEventListener("mousedown", handleMouseDown);
}
