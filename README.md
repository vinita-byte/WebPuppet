# WebPuppet

Browser-based Character Animator clone — real-time webcam face tracking drives a hierarchical 2D puppet entirely client-side.

## Stack

- **Next.js** (App Router) + React + TypeScript + Tailwind CSS
- **MediaPipe Face Landmarker** in a **WebWorker** (WASM / GPU delegate)
- **Pixi.js** viewport for multi-layer puppets
- **Zustand** for puppet transforms, recording, and app status
- **Web Audio API** for amplitude → viseme lip-sync

## Characters

Procedural layered puppets (tagged layers + mouth swap sets + triggers):

1. **The Jester Co-Host** — WhatTheWeb jester with physics bells  
2. **The Grumpy Crypto Bull** — suit + separate brows/pupils/mouth  
3. **Over-Caffeinated Robot Intern** — screen face, spring arms  
4. **The Wise Old Owl Mentor** — glasses, cap tassel physics, beak swap  
5. **The Pixel-Art Street Kid** — 16-color hard-edge pixel puppet  
6. **Classic Host** — original sample face host  

## Character Animator–style behaviors

Head tracking · Face blink · Auto blink · Eye gaze · Lip sync (viseme swap sets) · Nutcracker jaw · Breathe · Physics · Walk cycle · Dragger · Keyboard/UI triggers & swap sets

## Architecture

```
src/
  puppets/             Character definitions, layer tags, swap sets, triggers
  services/vision/     MediaPipe worker, landmark packing, SharedArrayBuffer layout
  services/audio/      Mic analyser + viseme calculator
  services/behaviors/  Modular CA-style drivers
  components/viewport/ Pixi canvas + hierarchical puppet rig
  components/timeline/ Keyframe record / playback
  components/studio/   Character picker, controls, capture
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
