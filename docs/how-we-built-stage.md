# How We Built Stage

A deep dive into building a browser native face puppet studio: on device tracking, a pro style workspace, recording and export, and the product decisions that shaped it.

---

## The short version

**Stage** is a face puppet studio that runs entirely in the browser. Point a camera at your face (or try a sample performance with no camera), pick a puppet, and watch it copy your expression in real time. You can record a take, scrub a timeline, read from a teleprompter, and export MP4 or MOV. Nothing from the camera or mic is uploaded. Tracking, lip sync, and video conversion all stay on the device.

Live app: [webpuppet.vercel.app](https://webpuppet.vercel.app/)  
Source: [github.com/vinita-byte/WebPuppet](https://github.com/vinita-byte/WebPuppet)

This article walks through how that product came together: the stack, the architecture, the hard problems, the studio redesign, and the final Stage rebrand.

---

## Why build it in the browser?

Most face driven puppet tools live as desktop apps. We wanted something people could open in a tab, try without installing anything, and trust with their face.

That led to three non negotiable product rules:

1. **On device only.** Camera and microphone streams never leave the browser.
2. **Instant value.** First visit users should see a puppet move within seconds, even without a camera.
3. **Pro workflow, approachable surface.** Think menu bar, stage, inspector, timeline, not a pile of panels with jargon.

Those rules drove almost every technical choice that followed.

---

## The stack

| Layer | Choice | Why |
| --- | --- | --- |
| App framework | Next.js (App Router) + React + TypeScript | Fast shipping, solid SEO metadata, easy Vercel deploy |
| Rendering | Pixi.js v8 | Hierarchical 2D scene graph for layered puppets and procedural scenes |
| Face tracking | MediaPipe Face Landmarker in a WebWorker | Proven landmarks and blendshapes, keeps the UI thread free |
| State | Zustand | Small stores for puppet, recording, scene, layout, theme, video |
| Persistence | IndexedDB | Autosave settings and last keyframe take without a backend |
| Video export | `captureStream` + MediaRecorder + self hosted ffmpeg.wasm | Record the stage, then transcode to MP4 / MOV on device |
| Styling | Tailwind CSS v4 + design tokens | Dark studio feel with a light theme twin and WCAG minded contrast |

Cross origin isolation headers (`Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: credentialless`) unlock `SharedArrayBuffer` so landmark frames can move from the vision worker to the render path with less copying.

---

## Architecture at a glance

```
Browser tab
├── Studio UI (React)
│   ├── Menu bar, tool strip, inspector, timeline, teleprompter
│   └── Zustand stores (app, puppet, scene, recording, video, layout, theme)
├── Vision WebWorker
│   └── MediaPipe Face Landmarker (self hosted WASM + model)
├── Pixi stage
│   ├── Scene far / mid / props
│   └── PuppetRig (tagged layers, mouth kit, physics hooks)
├── Audio analyser (optional mic lip sync)
└── Video path
    ├── canvas.captureStream + mic → MediaRecorder (WebM in memory)
    └── ffmpeg.wasm (same origin /ffmpeg) → MP4 or MOV download
```

There is no app server for media. Next.js serves the static app and assets. All “compute” for faces, audio, and export happens client side.

### Source layout

- `src/puppets` — character definitions, layer tags, scenes, zip import/export
- `src/services/vision` — MediaPipe worker, demo tracker, buffers
- `src/services/audio` — mic analyser and viseme weights
- `src/services/behaviors` — head, blink, gaze, jaw, breathe, physics, walk, dragger
- `src/services/video` — take capture and ffmpeg conversion
- `src/components/viewport` — Pixi canvas and `PuppetRig`
- `src/components/studio` — shell, menus, inspector, tour, teleprompter
- `src/components/timeline` — record, scrub, export dialog
- `src/store` — Zustand stores
- `public/mediapipe` and `public/ffmpeg` — self hosted runtime assets
- `public/llms.txt`, `sitemap`, robots — agent and search discovery

---

## Building the puppet system

### Characters as tagged layer graphs

Each puppet is not a single sprite. It is a **definition**: nested layers with tags like head, eyes, brows, mouth shapes, and optional physics or trigger hooks. Behaviors look up layers by tag and drive transforms and opacity from face data.

That tagging model is what lets one behavior stack work across a large cast: Nimbus, Pixel, Professor Biscuit, Madame Mochi, Gordon, Captain Gruff, Big Bram, Bubbles, Bossy, Grumble, plus the studio classics (Jester, Bull, Robot Intern, Owl, Pixel Kid, Classic Host).

Mouth shapes follow a shared kit (`mouthClosed`, `mouthOpen`, `mouthOh`, `mouthSmile`, `mouthTongue`) so lip sync stays consistent.

### Scenes as procedural backgrounds

Instead of shipping huge background images, scenes are drawn with Pixi `Graphics`: far pass, mid pass, and animated props. Twelve scenes cover moods from Cloudtop Weather to Grand Finale. Artists draw in centered coordinates; the viewport anchors those containers at stage center so the backdrop fills the frame instead of leaking into a corner.

### Import and export

Creators can package a puppet as a zip (historically `.webpuppet.zip` with `puppet.json` plus SVG or PNG layers). The UI also keeps SVG prompt ideas under Help so people building characters outside Stage know how to structure layers.

---

## Making the face drive the puppet

### MediaPipe in a worker

Face Landmarker runs off the main thread. The pipeline roughly:

1. Request camera (or start the bundled sample face “demo” tracker).
2. Run landmarks at a target FPS (about 30).
3. Map rotation, blinks, gaze, mouth openness, and related signals into the puppet store.
4. Behavior modules apply those signals to tagged layers each frame.

Calibration captures a neutral pose so “straight ahead” feels correct for that face and lighting.

### Try without a camera

First time visitors should not hit a permission wall before they see magic. **Try without a camera** plays a sample face performance through the same behavior stack. The guided tour uses that path so the demo never forces a camera prompt.

### Lip sync

When the mic is available, an analyser produces viseme weights that blend mouth shapes. Mic is optional; face mouth openness still drives the jaw when audio is off.

---

## The studio as a product surface

Early versions stacked capture, puppets, behaviors, and prompts in one long sidebar. The stage felt secondary. The redesign treated Stage like a small creative suite:

```
Menu bar (File Edit View Puppet Record Help)
Tool strip | Hero stage | Inspector (Puppet / Behaviors / Frame)
Timeline dock (resizable, collapsible)
Status strip
```

### What that unlocked

- **Wayfinding:** File for session and export, Help for Demo video, shortcuts, privacy, SVG ideas.
- **Hero stage:** Letterboxed 16:9 or 9:16, fit controls, REC badge and countdown, floating camera picture in picture.
- **Inspector:** Named puppet grid instead of unlabeled icons; behaviors with plain language; frame controls.
- **Timeline:** Time ruler, scrubbing, Record with 3 2 1 countdown, Export dialog that explains when it is disabled, Clear with confirm and an undo toast.
- **Status strip:** Camera, Tracking, FPS, Puppet, Scene, Frame, Saved in plain words.

Accessibility got real attention: focus rings, aria labels and tooltips on icon buttons, keyboard menu traversal, and contrast tokens pushed to a Lighthouse accessibility score in the mid 90s.

### Guided demo tour

A scripted live tour runs on the real UI (spotlight + captions, optional animated cursor). It auto starts on first visit with Watch or Skip, and is always available from **Help → Demo video**. Captions live in the DOM for screen readers and crawlers. Reduced motion falls back to a simple step slideshow.

---

## Recording and export without a backend

Recording has two related tracks:

1. **Keyframe take** — face and layer state sampled while you perform, for timeline playback inside Stage.
2. **Video take** — the live Pixi canvas (and mic when present) captured with `HTMLCanvasElement.captureStream` into an in memory blob.

Export loads **same origin** ffmpeg assets under `/public/ffmpeg` (not a CDN) so COEP does not block the worker. The take converts to MP4 (`libx264` + `aac`) or QuickTime MOV, then downloads. Closing the tab clears the in memory video so sessions do not hoard large blobs.

That path taught us a lesson the hard way: CDN hosted ffmpeg workers fail under credentialless isolation. Self hosting fixed it.

---

## Teleprompter, themes, and the Stage brand

As the workspace matured, the product needed a clearer identity and a few creator comforts:

- **Rename to Stage** in UI copy, metadata, tour, About, and agent files (`llms.txt`, AI catalog).
- **Logo and favicon** — a stage mark (curtains + spotlight) in the menu bar and browser tab.
- **Light / dark / system themes** with CSS variables on `html[data-theme]` and a tiny boot script to avoid a flash of the wrong theme.
- **Teleprompter** — paste a script, set scroll speed and size, optional mirror mode, play while you perform.

The page became **scrollable**: the studio still fills the first viewport, and a real HTML SEO section sits below (how to use, teleprompter, shortcuts, privacy, links to `llms.txt` and the sitemap). JSON-LD describes Stage as a `WebApplication`. Robots allow search and AI crawlers; the sitemap lists the home page and discovery files.

---

## Privacy by construction

There is no account system for camera data. There is no upload API for video frames. Persistence is local (IndexedDB for settings and keyframe takes). Video takes stay in tab memory. That is not a policy bolted on later; it is the architecture.

When we talk about tracking in Help, the copy stays plain: your camera stays on your device; nothing is uploaded.

---

## Shipping on Vercel

The app deploys as a Next.js project on Vercel with production promotions from feature branches. Preview URLs and production share the same on device runtime constraints, which is why ffmpeg and MediaPipe assets ship in `public/` rather than from third party CDNs.

Agent friendly discovery stayed first class throughout: `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`, and `.well-known/ai-catalog.json`.

---

## What we would tell another team starting today

1. **Self host anything that spawns workers** if you need COEP for `SharedArrayBuffer`.
2. **Tag your puppet layers early.** Behaviors age better than one off wire ups per character.
3. **Show value before permissions.** Sample face mode and a skippable tour remove the biggest first run cliff.
4. **Design the stage as the hero.** If the puppet is cropped or the sidebar owns the layout, users never feel they are performing.
5. **Treat export as a product.** Disabled buttons need reasons; Clear needs undo; formats need a real dialog.
6. **Keep SEO content as real HTML.** A studio SPA can still ship indexable explanation below the fold.

---

## Closing

Stage started as a technical experiment: can a Character Animator style loop feel good in a tab without sending a face to a server? It grew into a small studio with a cast of puppets, procedural scenes, a docked timeline, a guided tour, a teleprompter, and light and dark themes.

The interesting part is not any single library. It is the decision to keep the hard work on the device, and to wrap that capability in a workspace that feels intentional: menu, stage, inspector, timeline, status, and a clear invitation to try without a camera.

If you open [Stage](https://webpuppet.vercel.app/), press **Try without a camera**, and watch a puppet talk back, you are looking at that whole stack running locally in your browser.

---

*Written from the Stage / WebPuppet engineering notes: foundation, cast and scenes, studio redesign, video export, and the Stage rebrand.*
