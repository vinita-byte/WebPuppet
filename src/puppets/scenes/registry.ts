import type { Graphics } from "pixi.js";
import type { SceneDef, ScenePropDef } from "./types";

const ALL_CAST = [
  "nimbus",
  "pixel",
  "gordon",
  "professor-biscuit",
  "madame-mochi",
  "captain-gruff",
  "big-bram",
  "sparkle-squad",
] as const;

function fillRect(
  g: Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number,
  alpha = 1,
): void {
  g.rect(x, y, w, h);
  g.fill({ color, alpha });
}

function fillRound(
  g: Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: number,
  alpha = 1,
): void {
  g.roundRect(x, y, w, h, r);
  g.fill({ color, alpha });
}

function fillEllipse(
  g: Graphics,
  x: number,
  y: number,
  rx: number,
  ry: number,
  color: number,
  alpha = 1,
): void {
  g.ellipse(x, y, rx, ry);
  g.fill({ color, alpha });
}

function fillCircle(
  g: Graphics,
  x: number,
  y: number,
  r: number,
  color: number,
  alpha = 1,
): void {
  g.circle(x, y, r);
  g.fill({ color, alpha });
}

function strokeLine(
  g: Graphics,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: number,
  width = 3,
): void {
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
  g.stroke({ width, color });
}

function cloudBlob(
  g: Graphics,
  x: number,
  y: number,
  s: number,
  color: number,
  alpha = 1,
): void {
  fillEllipse(g, x, y, s * 1.1, s * 0.55, color, alpha);
  fillEllipse(g, x - s * 0.55, y + s * 0.08, s * 0.55, s * 0.4, color, alpha);
  fillEllipse(g, x + s * 0.5, y + s * 0.05, s * 0.6, s * 0.42, color, alpha);
  fillEllipse(g, x - s * 0.15, y - s * 0.28, s * 0.5, s * 0.38, color, alpha);
}

function prop(
  id: string,
  label: string,
  draw: ScenePropDef["draw"],
  extra?: Partial<Pick<ScenePropDef, "animate" | "zIndex">>,
): ScenePropDef {
  return { id, label, draw, ...extra };
}

/* -------------------------------------------------------------------------- */
/* 1. Cloudtop Weather Studio                                                 */
/* -------------------------------------------------------------------------- */

const cloudtopWeather: SceneDef = {
  id: "cloudtop-weather",
  name: "Cloudtop Weather Studio",
  shortName: "Cloudtop",
  mood: "Bright forecast vibes with soft drifting clouds and sunny chatter.",
  palette: "soft sky blue, white, yellow",
  bestFor: ["nimbus", "pixel"],
  colors: { far: 0x87ceeb, mid: 0xb8e0f0, accent: 0xffd866, light: 0xfff8e7 },
  drawFar: (g, w, h) => {
    fillRect(g, -w / 2, -h / 2, w, h, 0x87ceeb);
    fillEllipse(g, w * 0.28, -h * 0.28, 48, 48, 0xffe066);
    fillEllipse(g, w * 0.28, -h * 0.28, 62, 62, 0xfff0a8, 0.35);
    cloudBlob(g, -w * 0.32, -h * 0.22, 42, 0xffffff, 0.85);
    cloudBlob(g, w * 0.08, -h * 0.32, 36, 0xf5fbff, 0.75);
    cloudBlob(g, w * 0.35, -h * 0.12, 30, 0xffffff, 0.7);
  },
  drawMid: (g, w, h) => {
    fillRound(g, -w * 0.42, h * 0.08, w * 0.84, h * 0.32, 18, 0xd9eff8);
    fillRect(g, -w * 0.42, h * 0.28, w * 0.84, h * 0.22, 0xf4f7fa);
    fillRound(g, -w * 0.36, h * 0.12, w * 0.42, h * 0.18, 10, 0xffffff);
    fillRound(g, -w * 0.34, h * 0.14, w * 0.16, h * 0.14, 6, 0x6ec6ff);
    fillRound(g, -w * 0.15, h * 0.14, w * 0.16, h * 0.14, 6, 0xffd866);
    fillRound(g, w * 0.12, h * 0.14, 70, 36, 8, 0xff6b6b);
    fillCircle(g, w * 0.12 + 18, h * 0.14 + 18, 8, 0xffffff);
  },
  props: [
    prop("desk", "Forecast Desk", (g, w, h) => {
      fillRound(g, -120, h * 0.22, 240, 48, 8, 0xf0e6d2);
      fillRect(g, -110, h * 0.22 + 8, 80, 12, 0x87ceeb);
      fillRect(g, 20, h * 0.22 + 10, 60, 18, 0xffffff);
      fillCircle(g, 90, h * 0.22 + 16, 10, 0xffd866);
    }),
    prop("weather-icons", "Weather Map Icons", (g, w, h) => {
      fillCircle(g, -80, h * 0.02, 16, 0xffe066);
      cloudBlob(g, 0, h * 0.04, 18, 0xffffff);
      fillEllipse(g, 70, h * 0.05, 8, 14, 0x6ec6ff);
      fillEllipse(g, 82, h * 0.05, 8, 14, 0x6ec6ff);
    }),
    prop("on-air", "On-Air Light", (g, _w, h) => {
      fillRound(g, 110, -h * 0.08, 72, 28, 6, 0x2a2a2a);
      fillRound(g, 116, -h * 0.08 + 6, 60, 16, 4, 0xff3b3b);
    }),
    prop(
      "drift-clouds",
      "Drifting Clouds",
      (g, w, h) => {
        cloudBlob(g, -w * 0.1, -h * 0.18, 28, 0xffffff, 0.9);
        cloudBlob(g, w * 0.18, -h * 0.26, 22, 0xf8fcff, 0.8);
      },
      {
        zIndex: 2,
        animate: (g, t) => {
          g.x = Math.sin(t * Math.PI * 2) * 28;
          g.y = Math.cos(t * Math.PI * 2) * 6;
        },
      },
    ),
  ],
};

/* -------------------------------------------------------------------------- */
/* 2. Apology Hotline Call Centre                                             */
/* -------------------------------------------------------------------------- */

const apologyHotline: SceneDef = {
  id: "apology-hotline",
  name: "The Apology Hotline Call Centre",
  shortName: "Hotline",
  mood: "Mint cubicles buzzing with sincere sorry energy and sticky notes.",
  palette: "mint, cream, orange",
  bestFor: ["pixel", "gordon"],
  colors: { far: 0xd8f3e8, mid: 0xfff6e8, accent: 0xff8a4c, light: 0xfffaf0 },
  drawFar: (g, w, h) => {
    fillRect(g, -w / 2, -h / 2, w, h, 0xd8f3e8);
    fillRect(g, -w / 2, -h * 0.1, w, h * 0.6, 0xc8ebe0);
    for (let i = -3; i <= 3; i++) {
      fillRect(g, i * 90 - 8, -h * 0.28, 16, h * 0.2, 0xb5ddd0);
    }
  },
  drawMid: (g, w, h) => {
    fillRect(g, -w * 0.45, h * 0.05, w * 0.9, h * 0.4, 0xfff6e8);
    // Cubicle walls
    fillRect(g, -w * 0.38, h * 0.05, 8, h * 0.28, 0x9fd9c4);
    fillRect(g, -w * 0.08, h * 0.05, 8, h * 0.28, 0x9fd9c4);
    fillRect(g, w * 0.22, h * 0.05, 8, h * 0.28, 0x9fd9c4);
    fillRound(g, -w * 0.36, h * 0.22, 100, 36, 6, 0xffe8c8);
    fillRound(g, -w * 0.05, h * 0.22, 100, 36, 6, 0xffe8c8);
    fillRound(g, w * 0.25, h * 0.22, 100, 36, 6, 0xffe8c8);
  },
  props: [
    prop("cubicles", "Cubicles", (g, w, h) => {
      fillRound(g, -w * 0.32, h * 0.08, 70, 50, 4, 0xb8e6d4);
      fillRound(g, 10, h * 0.08, 70, 50, 4, 0xb8e6d4);
      fillRound(g, w * 0.28 - 20, h * 0.08, 70, 50, 4, 0xb8e6d4);
    }),
    prop("phones", "Desk Phones", (g, w, h) => {
      fillRound(g, -w * 0.28, h * 0.2, 36, 22, 4, 0xff8a4c);
      fillRound(g, 20, h * 0.2, 36, 22, 4, 0xff8a4c);
      fillCircle(g, -w * 0.28 + 18, h * 0.2 - 6, 8, 0x2a2a2a);
      fillCircle(g, 38, h * 0.2 - 6, 8, 0x2a2a2a);
    }),
    prop("clock", "Wall Clock", (g, _w, h) => {
      fillCircle(g, 0, -h * 0.18, 28, 0xfffaf0);
      fillCircle(g, 0, -h * 0.18, 24, 0xffffff);
      strokeLine(g, 0, -h * 0.18, 0, -h * 0.18 - 14, 0x2a2a2a, 2);
      strokeLine(g, 0, -h * 0.18, 12, -h * 0.18 + 4, 0xff8a4c, 2);
    }),
    prop("sticky-notes", "Sticky Notes", (g, w, h) => {
      fillRect(g, -w * 0.2, -h * 0.05, 28, 28, 0xfff07a);
      fillRect(g, -w * 0.2 + 34, -h * 0.02, 24, 24, 0xffb4a2);
      fillRect(g, w * 0.15, -h * 0.06, 26, 26, 0xa8e6cf);
      fillRect(g, w * 0.15 + 30, -h * 0.03, 22, 22, 0xffd6a5);
    }),
  ],
};

/* -------------------------------------------------------------------------- */
/* 3. Lecture Hall of Random Facts                                            */
/* -------------------------------------------------------------------------- */

const lectureHall: SceneDef = {
  id: "lecture-hall",
  name: "The Lecture Hall of Random Facts",
  shortName: "Lecture Hall",
  mood: "Warm wood seats ready for surprising trivia and chalk dust.",
  palette: "wood, green, gold",
  bestFor: ["professor-biscuit", "madame-mochi"],
  colors: { far: 0x3d5a40, mid: 0xc4a574, accent: 0xd4a017, light: 0xf5e6c8 },
  drawFar: (g, w, h) => {
    fillRect(g, -w / 2, -h / 2, w, h, 0x2f4a34);
    fillRound(g, -w * 0.38, -h * 0.32, w * 0.76, h * 0.36, 8, 0x3d6b45);
    fillRound(g, -w * 0.34, -h * 0.28, w * 0.68, h * 0.28, 4, 0x2f5a38);
  },
  drawMid: (g, w, h) => {
    fillRect(g, -w / 2, h * 0.15, w, h * 0.35, 0xc4a574);
    for (let row = 0; row < 3; row++) {
      const y = h * 0.18 + row * 36;
      fillRound(g, -w * 0.4, y, w * 0.8, 22, 4, 0xa67c52);
      fillRect(g, -w * 0.4, y + 18, w * 0.8, 6, 0x8b6540);
    }
    fillRound(g, -80, h * 0.05, 160, 28, 6, 0x8b5a2b);
  },
  props: [
    prop("chalkboard", "Chalkboard Socks", (g, w, h) => {
      fillRound(g, -w * 0.28, -h * 0.26, w * 0.56, h * 0.22, 4, 0x1e3d28);
      // "Socks" letter blocks
      fillRect(g, -50, -h * 0.18, 14, 28, 0xf5e6c8);
      fillRect(g, -30, -h * 0.18, 14, 28, 0xf5e6c8);
      fillRect(g, -10, -h * 0.18, 14, 28, 0xf5e6c8);
      fillRect(g, 10, -h * 0.18, 14, 28, 0xf5e6c8);
      fillRect(g, 30, -h * 0.18, 14, 28, 0xf5e6c8);
    }),
    prop("ladder", "Library Ladder", (g, w, h) => {
      fillRect(g, w * 0.32, -h * 0.2, 8, h * 0.4, 0xa67c52);
      fillRect(g, w * 0.32 + 28, -h * 0.2, 8, h * 0.4, 0xa67c52);
      for (let i = 0; i < 5; i++) {
        fillRect(g, w * 0.32, -h * 0.16 + i * 28, 36, 5, 0xc4a574);
      }
    }),
    prop("owl", "Perched Owl", (g, w, h) => {
      fillEllipse(g, -w * 0.34, -h * 0.05, 18, 22, 0x8b6914);
      fillCircle(g, -w * 0.34 - 6, -h * 0.08, 5, 0xf5e6c8);
      fillCircle(g, -w * 0.34 + 6, -h * 0.08, 5, 0xf5e6c8);
      fillCircle(g, -w * 0.34 - 6, -h * 0.08, 2, 0x1a1a1a);
      fillCircle(g, -w * 0.34 + 6, -h * 0.08, 2, 0x1a1a1a);
    }),
    prop("projector", "Overhead Projector", (g, _w, h) => {
      fillRound(g, -40, h * 0.02, 80, 36, 6, 0xd4a017);
      fillRect(g, -20, h * 0.02 - 18, 40, 18, 0xf5e6c8);
      fillCircle(g, 0, h * 0.02 - 24, 10, 0x87ceeb, 0.6);
    }),
  ],
};

/* -------------------------------------------------------------------------- */
/* 4. Madame Mochi's Etiquette Academy                                        */
/* -------------------------------------------------------------------------- */

const etiquetteAcademy: SceneDef = {
  id: "etiquette-academy",
  name: "Madame Mochi's Etiquette Academy",
  shortName: "Etiquette",
  mood: "Pearl manners, gold trim, and perfectly poured afternoon tea.",
  palette: "blush, pearl, gold",
  bestFor: ["madame-mochi", "professor-biscuit"],
  colors: { far: 0xf7d6e0, mid: 0xfaf6f0, accent: 0xd4a017, light: 0xfff8f0 },
  drawFar: (g, w, h) => {
    fillRect(g, -w / 2, -h / 2, w, h, 0xf7d6e0);
    fillEllipse(g, 0, -h * 0.35, w * 0.35, 40, 0xfaf0f4);
    // Curtain tops
    fillEllipse(g, -w * 0.35, -h * 0.2, 50, 80, 0xe8a0b0);
    fillEllipse(g, w * 0.35, -h * 0.2, 50, 80, 0xe8a0b0);
  },
  drawMid: (g, w, h) => {
    fillRect(g, -w / 2, h * 0.1, w, h * 0.4, 0xfaf6f0);
    fillRect(g, -w / 2, h * 0.1, w, 12, 0xd4a017);
    fillEllipse(g, 0, h * 0.28, 90, 28, 0xe8d5b7);
    fillRound(g, -55, h * 0.12, 110, 50, 8, 0xfff8f0);
  },
  props: [
    prop("tea-table", "Tea Table", (g, _w, h) => {
      fillEllipse(g, 0, h * 0.2, 70, 22, 0xe8d5b7);
      fillCircle(g, -20, h * 0.16, 12, 0xfaf6f0);
      fillCircle(g, 20, h * 0.16, 12, 0xfaf6f0);
      fillEllipse(g, 0, h * 0.14, 14, 8, 0xd4a017);
      fillRect(g, -2, h * 0.06, 4, 16, 0xd4a017);
    }),
    prop("books", "Etiquette Books", (g, w, h) => {
      fillRect(g, w * 0.28, h * 0.15, 18, 50, 0xd4a017);
      fillRect(g, w * 0.28 + 20, h * 0.18, 16, 44, 0xe8a0b0);
      fillRect(g, w * 0.28 + 38, h * 0.2, 14, 40, 0x8b6914);
    }),
    prop("chandelier", "Chandelier", (g, _w, h) => {
      strokeLine(g, 0, -h * 0.45, 0, -h * 0.28, 0xd4a017, 2);
      fillCircle(g, 0, -h * 0.28, 10, 0xd4a017);
      for (const dx of [-28, -14, 0, 14, 28]) {
        fillEllipse(g, dx, -h * 0.22, 8, 12, 0xfff8f0);
        fillCircle(g, dx, -h * 0.22 + 10, 4, 0xd4a017);
      }
    }),
    prop("curtains", "Silk Curtains", (g, w, h) => {
      fillEllipse(g, -w * 0.42, 0, 36, h * 0.35, 0xe8a0b0);
      fillEllipse(g, w * 0.42, 0, 36, h * 0.35, 0xe8a0b0);
      fillEllipse(g, -w * 0.38, h * 0.05, 20, 40, 0xf7d6e0);
      fillEllipse(g, w * 0.38, h * 0.05, 20, 40, 0xf7d6e0);
    }),
  ],
};

/* -------------------------------------------------------------------------- */
/* 5. Stormy Library                                                          */
/* -------------------------------------------------------------------------- */

const stormyLibrary: SceneDef = {
  id: "stormy-library",
  name: "The Stormy Library",
  shortName: "Stormy Library",
  mood: "Navy shelves, brass glow, and rain tapping the reading window.",
  palette: "navy, brass, lamp yellow",
  bestFor: ["gordon", "captain-gruff"],
  colors: { far: 0x1a2744, mid: 0x2c3e5a, accent: 0xc9a227, light: 0xffe9a8 },
  drawFar: (g, w, h) => {
    fillRect(g, -w / 2, -h / 2, w, h, 0x1a2744);
    // Rainy window
    fillRound(g, w * 0.15, -h * 0.35, w * 0.28, h * 0.4, 6, 0x0d1528);
    fillRound(g, w * 0.17, -h * 0.32, w * 0.24, h * 0.34, 4, 0x243656);
    for (let i = 0; i < 8; i++) {
      strokeLine(
        g,
        w * 0.2 + i * 14,
        -h * 0.3,
        w * 0.18 + i * 14,
        -h * 0.05,
        0x6a8caf,
        1.5,
      );
    }
  },
  drawMid: (g, w, h) => {
    fillRect(g, -w / 2, h * 0.2, w, h * 0.3, 0x2c3e5a);
    // Bookshelves
    for (let col = 0; col < 4; col++) {
      const x = -w * 0.42 + col * 70;
      fillRect(g, x, -h * 0.15, 60, h * 0.35, 0x243656);
      for (let row = 0; row < 4; row++) {
        fillRect(g, x + 4, -h * 0.12 + row * 32, 52, 6, 0xc9a227);
        fillRect(g, x + 8, -h * 0.1 + row * 32, 10, 22, 0x8b4513);
        fillRect(g, x + 22, -h * 0.1 + row * 32, 12, 22, 0x4a6741);
        fillRect(g, x + 38, -h * 0.1 + row * 32, 10, 22, 0x6b3a5d);
      }
    }
  },
  props: [
    prop("ship-bell", "Ship Bell", (g, w, h) => {
      fillEllipse(g, -w * 0.28, -h * 0.22, 22, 18, 0xc9a227);
      fillRect(g, -w * 0.28 - 3, -h * 0.28, 6, 14, 0xc9a227);
      fillCircle(g, -w * 0.28, -h * 0.18, 4, 0xffe9a8);
    }),
    prop("wheel", "Ship Wheel", (g, w, h) => {
      fillCircle(g, w * 0.05, h * 0.08, 36, 0x8b6914);
      fillCircle(g, w * 0.05, h * 0.08, 22, 0x2c3e5a);
      fillCircle(g, w * 0.05, h * 0.08, 8, 0xc9a227);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        strokeLine(
          g,
          w * 0.05 + Math.cos(a) * 12,
          h * 0.08 + Math.sin(a) * 12,
          w * 0.05 + Math.cos(a) * 40,
          h * 0.08 + Math.sin(a) * 40,
          0x8b6914,
          4,
        );
      }
    }),
    prop("lamp", "Reading Lamp", (g, w, h) => {
      fillRect(g, -w * 0.1, h * 0.05, 6, 50, 0xc9a227);
      fillEllipse(g, -w * 0.1 + 3, h * 0.02, 24, 14, 0xffe9a8);
      fillEllipse(g, -w * 0.1 + 3, h * 0.02, 30, 20, 0xffe9a8, 0.25);
    }),
    prop("quiet-sign", "Quiet Please", (g, w, h) => {
      fillRound(g, w * 0.22, h * 0.12, 90, 28, 4, 0xc9a227);
      fillRound(g, w * 0.22 + 4, h * 0.12 + 4, 82, 20, 3, 0xffe9a8);
      fillRect(g, w * 0.22 + 14, h * 0.12 + 10, 62, 6, 0x1a2744);
    }),
  ],
};

/* -------------------------------------------------------------------------- */
/* 6. Beetroot Dock                                                           */
/* -------------------------------------------------------------------------- */

const beetrootDock: SceneDef = {
  id: "beetroot-dock",
  name: "The Beetroot Dock",
  shortName: "Beetroot Dock",
  mood: "Salty pier air, beet barrels, and seagulls arguing over lunch.",
  palette: "teal, red, cream",
  bestFor: ["captain-gruff", "big-bram"],
  colors: { far: 0x4ecdc4, mid: 0xf7e8d0, accent: 0xc23b22, light: 0xfff5e6 },
  drawFar: (g, w, h) => {
    fillRect(g, -w / 2, -h / 2, w, h, 0x87ceeb);
    fillRect(g, -w / 2, 0, w, h / 2, 0x4ecdc4);
    fillEllipse(g, w * 0.3, -h * 0.28, 36, 36, 0xffe066);
    // Distant lighthouse
    fillRect(g, -w * 0.38, -h * 0.2, 24, h * 0.28, 0xfff5e6);
    fillRect(g, -w * 0.38, -h * 0.2, 24, 20, 0xc23b22);
    fillRect(g, -w * 0.38, -h * 0.05, 24, 16, 0xc23b22);
    fillCircle(g, -w * 0.38 + 12, -h * 0.22, 10, 0xffe066);
  },
  drawMid: (g, w, h) => {
    fillRect(g, -w / 2, h * 0.15, w, h * 0.35, 0x8b6914);
    for (let i = 0; i < 10; i++) {
      fillRect(g, -w * 0.45 + i * 55, h * 0.15, 48, 14, 0xa67c52);
    }
    fillRect(g, -w * 0.48, h * 0.15, 16, h * 0.3, 0x6b4f2a);
    fillRect(g, w * 0.4, h * 0.15, 16, h * 0.3, 0x6b4f2a);
  },
  props: [
    prop("pier", "Pier Planks", (g, w, h) => {
      fillRect(g, -w * 0.4, h * 0.18, w * 0.8, 20, 0xa67c52);
      for (let i = 0; i < 6; i++) {
        strokeLine(
          g,
          -w * 0.38 + i * 70,
          h * 0.18,
          -w * 0.38 + i * 70,
          h * 0.38,
          0x6b4f2a,
          2,
        );
      }
    }),
    prop("barrels", "Beet Barrels", (g, w, h) => {
      fillEllipse(g, -w * 0.2, h * 0.22, 28, 34, 0xc23b22);
      fillEllipse(g, -w * 0.2, h * 0.22, 28, 10, 0x8b1e10);
      fillEllipse(g, -w * 0.08, h * 0.24, 24, 30, 0xc23b22);
      fillRect(g, -w * 0.2 - 28, h * 0.2, 56, 4, 0xfff5e6);
    }),
    prop("boat", "Dock Boat", (g, w, h) => {
      g.moveTo(-w * 0.05, h * 0.32);
      g.lineTo(w * 0.25, h * 0.32);
      g.lineTo(w * 0.2, h * 0.42);
      g.lineTo(0, h * 0.42);
      g.closePath();
      g.fill({ color: 0xfff5e6 });
      fillRect(g, w * 0.08, h * 0.18, 6, 60, 0x8b6914);
      g.moveTo(w * 0.08 + 6, h * 0.18);
      g.lineTo(w * 0.08 + 50, h * 0.28);
      g.lineTo(w * 0.08 + 6, h * 0.32);
      g.closePath();
      g.fill({ color: 0xc23b22 });
    }),
    prop("seagulls", "Seagulls", (g, w, h) => {
      for (const [x, y] of [
        [-w * 0.15, -h * 0.25],
        [w * 0.1, -h * 0.3],
        [w * 0.28, -h * 0.18],
      ] as const) {
        strokeLine(g, x - 12, y, x, y - 6, 0xffffff, 2);
        strokeLine(g, x, y - 6, x + 12, y, 0xffffff, 2);
      }
    }),
  ],
};

/* -------------------------------------------------------------------------- */
/* 7. Flex Arena                                                              */
/* -------------------------------------------------------------------------- */

const flexArena: SceneDef = {
  id: "flex-arena",
  name: "The Flex Arena",
  shortName: "Flex Arena",
  mood: "Roaring crowd, golden ropes, and dramatic flex showdowns.",
  palette: "red, gold, purple",
  bestFor: ["big-bram", "captain-gruff"],
  colors: { far: 0x2d1b4e, mid: 0x8b1e1e, accent: 0xd4a017, light: 0xffe9a8 },
  drawFar: (g, w, h) => {
    fillRect(g, -w / 2, -h / 2, w, h, 0x2d1b4e);
    // Spotlights
    g.moveTo(-w * 0.3, -h * 0.5);
    g.lineTo(-w * 0.15, h * 0.1);
    g.lineTo(-w * 0.45, h * 0.1);
    g.closePath();
    g.fill({ color: 0xffe9a8, alpha: 0.15 });
    g.moveTo(w * 0.3, -h * 0.5);
    g.lineTo(w * 0.45, h * 0.1);
    g.lineTo(w * 0.15, h * 0.1);
    g.closePath();
    g.fill({ color: 0xffe9a8, alpha: 0.15 });
    // Crowd silhouettes
    for (let i = -8; i <= 8; i++) {
      fillEllipse(g, i * 42, -h * 0.18, 16, 20, 0x1a1030);
      fillCircle(g, i * 42, -h * 0.26, 10, 0x1a1030);
    }
  },
  drawMid: (g, w, h) => {
    fillRect(g, -w / 2, h * 0.15, w, h * 0.35, 0x8b1e1e);
    // Ring mat
    fillRound(g, -w * 0.32, h * 0.12, w * 0.64, h * 0.28, 8, 0x3a1a5c);
    fillRound(g, -w * 0.28, h * 0.15, w * 0.56, h * 0.22, 6, 0x4a2868);
    // Corner posts
    for (const x of [-w * 0.32, w * 0.32 - 12]) {
      fillRect(g, x, h * 0.05, 12, h * 0.3, 0xd4a017);
    }
    // Ropes
    for (let i = 0; i < 3; i++) {
      const y = h * 0.1 + i * 22;
      strokeLine(g, -w * 0.3, y, w * 0.3, y, 0xd4a017, 3);
    }
  },
  props: [
    prop("ring", "Wrestling Ring", (g, w, h) => {
      fillRound(g, -w * 0.25, h * 0.18, w * 0.5, h * 0.16, 4, 0x5a3478);
      fillCircle(g, 0, h * 0.26, 20, 0xd4a017, 0.4);
    }),
    prop("spotlights", "Spotlights", (g, w, h) => {
      fillEllipse(g, -w * 0.3, -h * 0.42, 20, 12, 0xd4a017);
      fillEllipse(g, w * 0.3, -h * 0.42, 20, 12, 0xd4a017);
      fillCircle(g, -w * 0.3, -h * 0.42, 8, 0xffe9a8);
      fillCircle(g, w * 0.3, -h * 0.42, 8, 0xffe9a8);
    }),
    prop("scoreboard", "Scoreboard", (g, _w, h) => {
      fillRound(g, -60, -h * 0.35, 120, 50, 6, 0x1a1030);
      fillRound(g, -52, -h * 0.33, 48, 34, 4, 0x8b1e1e);
      fillRound(g, 4, -h * 0.33, 48, 34, 4, 0x8b1e1e);
      fillRect(g, -40, -h * 0.28, 24, 12, 0xffe9a8);
      fillRect(g, 16, -h * 0.28, 24, 12, 0xffe9a8);
    }),
    prop("kitten-basket", "Hidden Kitten Basket", (g, w, h) => {
      fillEllipse(g, w * 0.34, h * 0.28, 28, 16, 0xd4a017);
      fillEllipse(g, w * 0.34, h * 0.26, 22, 12, 0x8b6914);
      fillCircle(g, w * 0.34 - 6, h * 0.22, 8, 0xffb07c);
      fillCircle(g, w * 0.34 + 6, h * 0.22, 7, 0xffb07c);
      fillCircle(g, w * 0.34 - 8, h * 0.2, 2, 0x1a1a1a);
      fillCircle(g, w * 0.34 - 4, h * 0.2, 2, 0x1a1a1a);
    }, { zIndex: 5 }),
  ],
};

/* -------------------------------------------------------------------------- */
/* 8. Sparkle City Rooftop                                                    */
/* -------------------------------------------------------------------------- */

const sparkleRooftop: SceneDef = {
  id: "sparkle-rooftop",
  name: "Sparkle City Rooftop",
  shortName: "Rooftop",
  mood: "Twilight skyline sparkles while wind dances across the beacon.",
  palette: "pink, lavender, orange",
  bestFor: ["sparkle-squad"],
  colors: { far: 0x6b5b95, mid: 0xff8c69, accent: 0xff69b4, light: 0xffe4f0 },
  drawFar: (g, w, h) => {
    fillRect(g, -w / 2, -h / 2, w, h * 0.55, 0x6b5b95);
    fillRect(g, -w / 2, -h * 0.05, w, h * 0.55, 0xff8c69);
    fillEllipse(g, w * 0.28, -h * 0.28, 40, 40, 0xfff0c8);
    // Skyline
    const buildings = [
      [-0.42, 0.22],
      [-0.32, 0.3],
      [-0.2, 0.18],
      [-0.08, 0.35],
      [0.05, 0.25],
      [0.18, 0.32],
      [0.32, 0.2],
    ] as const;
    for (const [fx, fh] of buildings) {
      fillRect(g, w * fx, h * 0.05 - h * fh, 48, h * fh, 0x3d2f5c);
      for (let wy = 0; wy < 4; wy++) {
        fillRect(
          g,
          w * fx + 8,
          h * 0.05 - h * fh + 10 + wy * 18,
          10,
          10,
          0xffe4f0,
          0.7,
        );
        fillRect(
          g,
          w * fx + 28,
          h * 0.05 - h * fh + 10 + wy * 18,
          10,
          10,
          0xff69b4,
          0.5,
        );
      }
    }
  },
  drawMid: (g, w, h) => {
    fillRect(g, -w / 2, h * 0.2, w, h * 0.3, 0x4a3a6a);
    fillRect(g, -w * 0.4, h * 0.15, w * 0.8, 16, 0xff69b4);
    fillCircle(g, 0, h * 0.08, 18, 0xffe4f0);
    fillRect(g, -6, h * 0.08, 12, h * 0.14, 0xd4a017);
  },
  props: [
    prop("beacon", "Rooftop Beacon", (g, _w, h) => {
      fillRect(g, -8, h * 0.0, 16, 60, 0xd4a017);
      fillCircle(g, 0, h * 0.0 - 8, 16, 0xff69b4);
      fillCircle(g, 0, h * 0.0 - 8, 10, 0xffe4f0);
      fillEllipse(g, 0, h * 0.0 - 8, 28, 28, 0xff69b4, 0.25);
    }),
    prop("skyline", "City Skyline", (g, w, h) => {
      fillRect(g, -w * 0.45, h * 0.05, 40, 70, 0x3d2f5c);
      fillRect(g, w * 0.35, h * 0.08, 50, 60, 0x3d2f5c);
    }),
    prop("moon", "Moon", (g, w, h) => {
      fillCircle(g, -w * 0.3, -h * 0.3, 32, 0xfff0c8);
      fillCircle(g, -w * 0.3 + 10, -h * 0.3 - 6, 24, 0x6b5b95);
    }),
    prop(
      "wind",
      "Wind Gusts",
      (g, w, h) => {
        for (let i = 0; i < 4; i++) {
          const y = -h * 0.1 + i * 28;
          strokeLine(g, -w * 0.2, y, w * 0.15, y - 8, 0xffe4f0, 2);
          strokeLine(g, -w * 0.15, y + 10, w * 0.2, y + 2, 0xff69b4, 1.5);
        }
      },
      {
        zIndex: 3,
        animate: (g, t) => {
          g.x = Math.sin(t * Math.PI * 2) * 18;
          g.alpha = 0.45 + Math.sin(t * Math.PI * 2) * 0.35;
        },
      },
    ),
  ],
};

/* -------------------------------------------------------------------------- */
/* 9. Bedtime Bunker                                                          */
/* -------------------------------------------------------------------------- */

const bedtimeBunker: SceneDef = {
  id: "bedtime-bunker",
  name: "The Bedtime Bunker",
  shortName: "Bedtime",
  mood: "Cozy midnight hush with nightlights and sleepy pillow friends.",
  palette: "midnight blue, yellow, pink",
  bestFor: ["sparkle-squad"],
  colors: { far: 0x1a2744, mid: 0x2a3a5c, accent: 0xffe066, light: 0xffb6c1 },
  drawFar: (g, w, h) => {
    fillRect(g, -w / 2, -h / 2, w, h, 0x1a2744);
    for (const [x, y, r] of [
      [-0.3, -0.3, 2],
      [-0.1, -0.35, 1.5],
      [0.15, -0.28, 2],
      [0.35, -0.32, 1.5],
      [0.05, -0.4, 1],
    ] as const) {
      fillCircle(g, w * x, h * y, r * 2, 0xffe066);
    }
    fillEllipse(g, w * 0.3, -h * 0.25, 28, 28, 0xfff0c8, 0.8);
  },
  drawMid: (g, w, h) => {
    fillRect(g, -w / 2, h * 0.1, w, h * 0.4, 0x2a3a5c);
    fillRect(g, -w / 2, h * 0.1, w, 10, 0xffb6c1);
    // Three beds
    for (let i = 0; i < 3; i++) {
      const x = -w * 0.32 + i * w * 0.28;
      fillRound(g, x, h * 0.2, 100, 50, 8, 0x4a5a7c);
      fillRound(g, x + 8, h * 0.18, 84, 30, 6, 0xffb6c1);
      fillRound(g, x + 12, h * 0.22, 30, 18, 8, 0xffe066);
    }
  },
  props: [
    prop("beds", "Three Beds", (g, w, h) => {
      for (let i = 0; i < 3; i++) {
        const x = -w * 0.3 + i * w * 0.28;
        fillRound(g, x, h * 0.22, 90, 40, 6, 0x3a4a6c);
        fillEllipse(g, x + 45, h * 0.2, 36, 12, 0xffc0cb);
      }
    }),
    prop("nightlights", "Nightlights", (g, w, h) => {
      for (const x of [-w * 0.25, 0, w * 0.25]) {
        fillCircle(g, x, h * 0.08, 12, 0xffe066);
        fillEllipse(g, x, h * 0.08, 24, 24, 0xffe066, 0.2);
        fillRect(g, x - 3, h * 0.08 + 10, 6, 16, 0xffb6c1);
      }
    }),
    prop("clock", "Bedside Clock", (g, w, h) => {
      fillRound(g, w * 0.32, h * 0.05, 50, 30, 6, 0xffe066);
      fillRound(g, w * 0.32 + 4, h * 0.05 + 4, 42, 22, 4, 0x1a2744);
      fillRect(g, w * 0.32 + 12, h * 0.05 + 10, 10, 10, 0xffe066);
      fillRect(g, w * 0.32 + 28, h * 0.05 + 10, 10, 10, 0xffe066);
    }),
    prop("bunny-pillow", "Bunny Pillow", (g, w, h) => {
      fillEllipse(g, -w * 0.28, h * 0.18, 28, 20, 0xffb6c1);
      fillEllipse(g, -w * 0.28 - 12, h * 0.08, 8, 16, 0xffb6c1);
      fillEllipse(g, -w * 0.28 + 12, h * 0.08, 8, 16, 0xffb6c1);
      fillCircle(g, -w * 0.28 - 8, h * 0.16, 3, 0x1a2744);
      fillCircle(g, -w * 0.28 + 8, h * 0.16, 3, 0x1a2744);
    }),
  ],
};

/* -------------------------------------------------------------------------- */
/* 10. Candy Cloud Cafe                                                       */
/* -------------------------------------------------------------------------- */

const candyCloudCafe: SceneDef = {
  id: "candy-cloud-cafe",
  name: "The Candy Cloud Cafe",
  shortName: "Candy Cafe",
  mood: "Sweet steam, pastel treats, and cloud-soft cafe chatter.",
  palette: "mint, peach, cream",
  bestFor: ["madame-mochi", "nimbus"],
  colors: { far: 0xb8f2e6, mid: 0xffd8b8, accent: 0xff8fab, light: 0xfff8f0 },
  drawFar: (g, w, h) => {
    fillRect(g, -w / 2, -h / 2, w, h, 0xb8f2e6);
    cloudBlob(g, -w * 0.3, -h * 0.28, 40, 0xffffff, 0.9);
    cloudBlob(g, w * 0.25, -h * 0.22, 48, 0xfff0f5, 0.85);
    cloudBlob(g, 0, -h * 0.35, 32, 0xffffff, 0.7);
  },
  drawMid: (g, w, h) => {
    fillRect(g, -w / 2, h * 0.05, w, h * 0.45, 0xfff8f0);
    fillRect(g, -w / 2, h * 0.05, w, 14, 0xffd8b8);
    // Counter
    fillRound(g, -w * 0.4, h * 0.15, w * 0.5, h * 0.22, 10, 0xffd8b8);
    fillRound(g, -w * 0.38, h * 0.12, w * 0.46, 20, 6, 0xff8fab);
    // Tables
    fillEllipse(g, w * 0.22, h * 0.28, 40, 16, 0xffe4d0);
    fillEllipse(g, w * 0.38, h * 0.32, 36, 14, 0xffe4d0);
  },
  props: [
    prop("cupcake-counter", "Cupcake Counter", (g, w, h) => {
      for (let i = 0; i < 5; i++) {
        const x = -w * 0.35 + i * 42;
        fillEllipse(g, x, h * 0.14, 14, 10, 0xff8fab);
        fillRect(g, x - 8, h * 0.14, 16, 14, 0xfff8f0);
        fillCircle(g, x, h * 0.1, 5, 0xffe066);
      }
    }),
    prop("macarons", "Macaron Tower", (g, w, h) => {
      const colors = [0xff8fab, 0xb8f2e6, 0xffd8b8, 0xd4a017, 0xc5a3ff];
      colors.forEach((c, i) => {
        fillEllipse(g, w * 0.15, h * 0.18 - i * 12, 18, 8, c);
      });
    }),
    prop("coffee-machine", "Steam Hearts Coffee", (g, w, h) => {
      fillRound(g, -w * 0.15, h * 0.08, 50, 60, 8, 0x6b5b95);
      fillRound(g, -w * 0.15 + 8, h * 0.12, 34, 20, 4, 0xfff8f0);
      fillCircle(g, -w * 0.15 + 25, h * 0.02, 8, 0xff8fab);
      // Steam hearts
      fillCircle(g, -w * 0.15 + 18, h * 0.0, 5, 0xff8fab, 0.6);
      fillCircle(g, -w * 0.15 + 26, h * 0.0, 5, 0xff8fab, 0.6);
      fillEllipse(g, -w * 0.15 + 22, h * 0.04, 8, 6, 0xff8fab, 0.6);
    }),
    prop("menu", "Cafe Menu", (g, w, h) => {
      fillRound(g, w * 0.28, -h * 0.05, 70, 90, 6, 0xfff8f0);
      fillRect(g, w * 0.28 + 10, -h * 0.02, 50, 6, 0xff8fab);
      fillRect(g, w * 0.28 + 10, h * 0.02, 50, 4, 0xb8f2e6);
      fillRect(g, w * 0.28 + 10, h * 0.05, 50, 4, 0xffd8b8);
      fillRect(g, w * 0.28 + 10, h * 0.08, 40, 4, 0xff8fab);
    }),
  ],
};

/* -------------------------------------------------------------------------- */
/* 11. Robot Repair Garage                                                    */
/* -------------------------------------------------------------------------- */

const robotGarage: SceneDef = {
  id: "robot-garage",
  name: "The Robot Repair Garage",
  shortName: "Robot Garage",
  mood: "Sparks, mint panels, and a swinging bulb over the workbench.",
  palette: "steel, mint, orange",
  bestFor: ["pixel", "gordon"],
  colors: { far: 0x5a6a7a, mid: 0x3d4a55, accent: 0xff8c42, light: 0xa8e6cf },
  drawFar: (g, w, h) => {
    fillRect(g, -w / 2, -h / 2, w, h, 0x5a6a7a);
    // Garage door stripes
    for (let i = 0; i < 8; i++) {
      fillRect(
        g,
        -w * 0.35,
        -h * 0.35 + i * 28,
        w * 0.7,
        24,
        i % 2 === 0 ? 0x6a7a8a : 0x4a5a6a,
      );
    }
    fillRect(g, -w * 0.38, -h * 0.38, w * 0.76, 12, 0xff8c42);
  },
  drawMid: (g, w, h) => {
    fillRect(g, -w / 2, h * 0.15, w, h * 0.35, 0x3d4a55);
    fillRound(g, -w * 0.4, h * 0.18, w * 0.55, h * 0.2, 6, 0x2a353c);
    fillRect(g, -w * 0.4, h * 0.18, w * 0.55, 10, 0xa8e6cf);
    // Tool wall
    fillRect(g, w * 0.25, -h * 0.1, 80, h * 0.3, 0x4a5a6a);
    for (let i = 0; i < 4; i++) {
      fillRect(g, w * 0.28 + i * 16, -h * 0.05, 8, 30, 0xff8c42);
    }
  },
  props: [
    prop("workbench", "Workbench", (g, w, h) => {
      fillRound(g, -w * 0.35, h * 0.2, w * 0.45, 50, 4, 0x2a353c);
      fillRect(g, -w * 0.35, h * 0.2, w * 0.45, 8, 0xa8e6cf);
      fillCircle(g, -w * 0.2, h * 0.18, 10, 0xff8c42);
      fillRect(g, -w * 0.1, h * 0.14, 40, 12, 0x6a7a8a);
    }),
    prop(
      "swinging-bulb",
      "Swinging Bulb",
      (g, _w, h) => {
        strokeLine(g, 0, -h * 0.4, 0, -h * 0.15, 0x2a2a2a, 2);
        fillCircle(g, 0, -h * 0.12, 16, 0xffe066);
        fillEllipse(g, 0, -h * 0.12, 28, 28, 0xffe066, 0.2);
      },
      {
        zIndex: 4,
        animate: (g, t) => {
          g.rotation = Math.sin(t * Math.PI * 2) * 0.35;
        },
      },
    ),
    prop("antenna-boxes", "Antenna Boxes", (g, w, h) => {
      fillRound(g, w * 0.22, h * 0.2, 50, 40, 4, 0xa8e6cf);
      fillRect(g, w * 0.22 + 20, h * 0.12, 6, 20, 0x6a7a8a);
      fillCircle(g, w * 0.22 + 23, h * 0.1, 8, 0xff8c42);
      fillRound(g, w * 0.34, h * 0.24, 40, 32, 4, 0x6a7a8a);
      fillRect(g, w * 0.34 + 16, h * 0.16, 5, 16, 0xa8e6cf);
      fillCircle(g, w * 0.34 + 18, h * 0.14, 6, 0xff8c42);
    }),
    prop("hug-sign", "Hug Before Reboot", (g, w, h) => {
      fillRound(g, -w * 0.15, -h * 0.08, 140, 36, 6, 0xff8c42);
      fillRound(g, -w * 0.15 + 6, -h * 0.08 + 6, 128, 24, 4, 0xfff8f0);
      fillRect(g, -w * 0.15 + 16, -h * 0.08 + 14, 108, 8, 0x2a353c);
    }),
  ],
};

/* -------------------------------------------------------------------------- */
/* 12. Grand Finale Stage                                                     */
/* -------------------------------------------------------------------------- */

const grandFinale: SceneDef = {
  id: "grand-finale",
  name: "The Grand Finale Stage",
  shortName: "Finale",
  mood: "Curtains up, disco shine, and every friend taking a bow.",
  palette: "red, gold, white",
  bestFor: [...ALL_CAST],
  colors: { far: 0x1a0a12, mid: 0x8b1e1e, accent: 0xd4a017, light: 0xfff8f0 },
  drawFar: (g, w, h) => {
    fillRect(g, -w / 2, -h / 2, w, h, 0x1a0a12);
    // Curtains
    fillEllipse(g, -w * 0.4, 0, 70, h * 0.5, 0x8b1e1e);
    fillEllipse(g, w * 0.4, 0, 70, h * 0.5, 0x8b1e1e);
    fillRect(g, -w / 2, -h * 0.45, w, 40, 0xd4a017);
    for (let i = 0; i < 12; i++) {
      fillEllipse(g, -w * 0.45 + i * (w * 0.08), -h * 0.38, 20, 30, 0x8b1e1e);
    }
  },
  drawMid: (g, w, h) => {
    fillRect(g, -w / 2, h * 0.15, w, h * 0.35, 0x8b1e1e);
    fillRound(g, -w * 0.35, h * 0.18, w * 0.7, h * 0.2, 8, 0xd4a017);
    fillRound(g, -w * 0.32, h * 0.2, w * 0.64, h * 0.16, 6, 0xfff8f0);
    // Podium
    fillRound(g, -40, h * 0.08, 80, 50, 6, 0xd4a017);
    fillRound(g, -30, h * 0.1, 60, 30, 4, 0xfff8f0);
  },
  props: [
    prop("curtains", "Stage Curtains", (g, w, h) => {
      fillEllipse(g, -w * 0.42, h * 0.05, 50, h * 0.4, 0xa02030);
      fillEllipse(g, w * 0.42, h * 0.05, 50, h * 0.4, 0xa02030);
      fillCircle(g, -w * 0.35, -h * 0.15, 10, 0xd4a017);
      fillCircle(g, w * 0.35, -h * 0.15, 10, 0xd4a017);
    }),
    prop(
      "disco-ball",
      "Disco Ball",
      (g, _w, h) => {
        fillCircle(g, 0, -h * 0.22, 28, 0xc0c0c0);
        for (let row = -2; row <= 2; row++) {
          for (let col = -2; col <= 2; col++) {
            fillRect(
              g,
              col * 10 - 3,
              -h * 0.22 + row * 10 - 3,
              6,
              6,
              (row + col) % 2 === 0 ? 0xfff8f0 : 0xd4a017,
            );
          }
        }
        strokeLine(g, 0, -h * 0.45, 0, -h * 0.22 - 28, 0xfff8f0, 1.5);
      },
      {
        zIndex: 6,
        animate: (g, t) => {
          g.rotation = t * Math.PI * 2;
        },
      },
    ),
    prop("podium", "Winner Podium", (g, _w, h) => {
      fillRect(g, -50, h * 0.12, 100, 40, 0xd4a017);
      fillRect(g, -40, h * 0.08, 80, 20, 0xfff8f0);
      fillCircle(g, 0, h * 0.05, 12, 0xd4a017);
    }),
    prop("confetti", "Confetti", (g, w, h) => {
      const bits = [
        [-0.3, -0.2, 0xff6b6b],
        [-0.15, -0.28, 0xffe066],
        [0.05, -0.15, 0x6bcbff],
        [0.2, -0.25, 0xff8fab],
        [0.32, -0.18, 0xa8e6cf],
        [-0.25, -0.05, 0xd4a017],
        [0.12, -0.08, 0xff6b6b],
        [-0.05, -0.32, 0xfff8f0],
      ] as const;
      for (const [fx, fy, c] of bits) {
        fillRect(g, w * fx, h * fy, 8, 5, c);
      }
    }),
    prop("name-chairs", "Name-Card Chairs", (g, w, h) => {
      for (let i = 0; i < 4; i++) {
        const x = -w * 0.3 + i * w * 0.2;
        fillRect(g, x, h * 0.28, 36, 30, 0xfff8f0);
        fillRect(g, x, h * 0.22, 36, 12, 0xd4a017);
        fillRect(g, x + 6, h * 0.24, 24, 6, 0x8b1e1e);
      }
    }),
  ],
};

/* -------------------------------------------------------------------------- */
/* Registry exports                                                           */
/* -------------------------------------------------------------------------- */

export const SCENES: SceneDef[] = [
  cloudtopWeather,
  apologyHotline,
  lectureHall,
  etiquetteAcademy,
  stormyLibrary,
  beetrootDock,
  flexArena,
  sparkleRooftop,
  bedtimeBunker,
  candyCloudCafe,
  robotGarage,
  grandFinale,
];

export const SCENE_MAP = Object.fromEntries(
  SCENES.map((s) => [s.id, s]),
) as Record<string, SceneDef>;

export function getScene(id: string): SceneDef {
  return SCENE_MAP[id] ?? cloudtopWeather;
}

export const DEFAULT_SCENE_ID = "cloudtop-weather";
