# WebPuppet

Browser-based Character Animator clone — real-time webcam face tracking drives a hierarchical 2D puppet entirely client-side.

## Stack

- **Next.js** (App Router) + React + TypeScript + Tailwind CSS
- **MediaPipe Face Landmarker** in a **WebWorker** (WASM / GPU delegate)
- **Pixi.js** viewport for the multi-layer puppet
- **Zustand** for puppet transforms, recording, and app status
- **Web Audio API** for amplitude → viseme lip-sync

## Architecture

```
src/
  services/vision/     MediaPipe worker, landmark packing, SharedArrayBuffer layout
  services/audio/      Mic analyser + viseme calculator
  services/behaviors/  Head tracking, blink, lip-sync drivers
  components/viewport/ Pixi canvas + sample puppet rig
  components/timeline/ Keyframe record / playback
  store/               Zustand stores
```

### Tracking pipeline

1. Main thread captures `ImageBitmap` frames from the webcam.
2. Frames are transferred to `faceTracking.worker.ts`.
3. The worker runs `FaceLandmarker.detectForVideo` and writes yaw/pitch/roll, blendshapes, and packed landmarks into a `SharedArrayBuffer` (or posts a transferable `Float32Array` fallback).
4. `BehaviorSystem` maps signals onto layer-driven transforms in Zustand.
5. `PuppetViewport` syncs the Pixi hierarchy each ticker frame.

Cross-origin isolation headers (`COOP` + `COEP: credentialless`) are set in `next.config.ts` so `SharedArrayBuffer` is available while still loading MediaPipe assets from CDNs.

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, click **Start Tracking**, allow camera (and optionally mic), then **Calibrate Neutral** while facing the camera.

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Local development server |
| `npm run build`| Production build         |
| `npm run start`| Serve production build   |
| `npm run lint` | ESLint                   |
