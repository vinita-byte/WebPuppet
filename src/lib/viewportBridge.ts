/**
 * Lets the timeline video recorder reach the live Pixi canvas
 * without prop drilling through the studio shell.
 */
let viewportCanvas: HTMLCanvasElement | null = null;

export function registerViewportCanvas(
  canvas: HTMLCanvasElement | null,
): void {
  viewportCanvas = canvas;
}

export function getViewportCanvas(): HTMLCanvasElement | null {
  return viewportCanvas;
}
