/** Lightweight flag so the Pixi HUD can hide during video capture without importing ffmpeg. */
let hideHud = false;

export function setRecordingHudHidden(hidden: boolean): void {
  hideHud = hidden;
}

export function isRecordingHudHidden(): boolean {
  return hideHud;
}
