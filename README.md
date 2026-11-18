# WebPuppet

WebPuppet is a browser face puppet studio. Webcam face tracking drives layered 2D puppets on your device. Camera and mic data never leave your browser.

**Live demo:** https://webpuppet.vercel.app/

<img width="1280" height="677" alt="Screenshot 2026-11-19 at 4 22 37AM" src="https://github.com/user-attachments/assets/3fd675c0-57c2-48c0-9939-43c46a5ca4ef" />


## Stack

- Next.js (App Router), React, TypeScript, Tailwind CSS
- MediaPipe Face Landmarker in a WebWorker (self hosted WASM and model)
- Pixi.js viewport for multi layer puppets
- Zustand for puppet transforms, recording, and app status
- Web Audio API for amplitude to viseme lip sync
- IndexedDB autosave for settings and the last recording

## Characters

1. The Jester Co-Host
2. The Grumpy Crypto Bull
3. Over Caffeinated Robot Intern
4. The Wise Old Owl Mentor
5. The Pixel Art Street Kid
6. Classic Host

## Behaviors

Head tracking, face blink, auto blink, eye gaze, lip sync (mouth swap sets), nutcracker jaw, breathe, physics, walk cycle, dragger, keyboard and UI triggers.

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Use **Start Tracking** or **Try without a camera**.

## AI / crawler discovery

| Path | Purpose |
|------|---------|
| `/llms.txt` | Short agent site brief |
| `/llms-full.txt` | Full architecture reference |
| `/sitemap.xml` | XML sitemap |
| `/robots.txt` | Crawl policy |
| `/.well-known/ai-catalog.json` | Catalog pointer |

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Local development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
