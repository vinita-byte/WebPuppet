import { pixelRect } from "../drawHelpers";
import { layer, type CharacterDef } from "../types";

/** Limited 16-color streetwear palette (no anti-alias — hard pixel edges). */
const C = {
  outline: 0x1a1423,
  skin: 0xe8b896,
  beanie: 0x3d5a80,
  beanieStripe: 0xee6c4d,
  hoodie: 0x293241,
  hoodieLight: 0x4a5568,
  pants: 0x1b263b,
  sneaker: 0xf0ebd8,
  sneakerAccent: 0xee6c4d,
  eye: 0xffffff,
  pupil: 0x0d1b2a,
  mouth: 0x3d0c11,
  tongue: 0xd62828,
};

function mouthClosed(g: import("pixi.js").Graphics): void {
  g.clear();
  pixelRect(g, -12, -2, 24, 4, C.mouth);
}

function mouthHalf(g: import("pixi.js").Graphics): void {
  g.clear();
  pixelRect(g, -14, -6, 28, 12, C.mouth);
  pixelRect(g, -8, -2, 16, 4, C.tongue);
}

function mouthWide(g: import("pixi.js").Graphics): void {
  g.clear();
  pixelRect(g, -16, -10, 32, 20, C.mouth);
  pixelRect(g, -10, -4, 20, 8, C.tongue);
}

export const pixelKid: CharacterDef = {
  id: "pixel-kid",
  name: "The Pixel-Art Street Kid",
  shortName: "Pixel",
  description:
    "Chunky pixel streetwear kid with a beanie, hoodie, sneakers, and a 16 color palette.",
  accent: "#ee6c4d",
  fitHeight: 420,
  swapSets: [
    {
      id: "mouth",
      layers: ["mouthClosed", "mouthHalf", "mouthOpen"],
      defaultLayerId: "mouthClosed",
    },
  ],
  triggers: [
    {
      id: "hoodUp",
      label: "Hood Vibes",
      key: "1",
      mode: "toggle",
      showLayers: ["hoodAura"],
    },
    {
      id: "shout",
      label: "Wide Mouth",
      key: "2",
      mode: "hold",
      swapTo: { setId: "mouth", layerId: "mouthOpen" },
    },
  ],
  physics: [],
  layers: [
    layer({ id: "root", parentId: null, tag: "root", draw: () => {} }),
    layer({
      id: "leftLeg",
      parentId: "root",
      tag: "leftLeg",
      rest: { x: -20, y: 140 },
      draw: (g) => {
        pixelRect(g, -12, 0, 24, 48, C.pants);
        pixelRect(g, -16, 44, 32, 14, C.sneaker);
        pixelRect(g, -16, 52, 32, 4, C.sneakerAccent);
      },
    }),
    layer({
      id: "rightLeg",
      parentId: "root",
      tag: "rightLeg",
      rest: { x: 20, y: 140 },
      draw: (g) => {
        pixelRect(g, -12, 0, 24, 48, C.pants);
        pixelRect(g, -16, 44, 32, 14, C.sneaker);
        pixelRect(g, -16, 52, 32, 4, C.sneakerAccent);
      },
    }),
    layer({
      id: "torso",
      parentId: "root",
      tag: "torso",
      rest: { y: 55 },
      zIndex: 1,
      draw: (g) => {
        pixelRect(g, -48, -50, 96, 110, C.hoodie);
        pixelRect(g, -36, -40, 72, 60, C.hoodieLight);
        // Kangaroo pocket
        pixelRect(g, -28, 20, 56, 28, C.hoodieLight);
        pixelRect(g, -48, -50, 16, 30, C.hoodie); // hood sides
        pixelRect(g, 32, -50, 16, 30, C.hoodie);
      },
    }),
    layer({
      id: "leftUpperArm",
      parentId: "torso",
      tag: "leftUpperArm",
      rest: { x: -58, y: -20, rotation: 0.2 },
      draw: (g) => pixelRect(g, -12, 0, 24, 44, C.hoodie),
    }),
    layer({
      id: "leftForearm",
      parentId: "leftUpperArm",
      tag: "leftForearm",
      rest: { y: 42 },
      draw: (g) => {
        pixelRect(g, -10, 0, 20, 36, C.hoodieLight);
        pixelRect(g, -12, 32, 24, 16, C.skin);
      },
    }),
    layer({
      id: "rightUpperArm",
      parentId: "torso",
      tag: "rightUpperArm",
      rest: { x: 58, y: -20, rotation: -0.2 },
      draw: (g) => pixelRect(g, -12, 0, 24, 44, C.hoodie),
    }),
    layer({
      id: "rightForearm",
      parentId: "rightUpperArm",
      tag: "rightForearm",
      rest: { y: 42 },
      draw: (g) => {
        pixelRect(g, -10, 0, 20, 36, C.hoodieLight);
        pixelRect(g, -12, 32, 24, 16, C.skin);
      },
    }),
    layer({
      id: "hoodAura",
      parentId: "torso",
      tag: "accessory",
      rest: { y: -60 },
      visible: false,
      zIndex: 0,
      draw: (g) => {
        pixelRect(g, -40, -20, 80, 8, C.beanieStripe);
        pixelRect(g, -36, -12, 72, 8, C.beanie);
      },
    }),
    layer({
      id: "head",
      parentId: "root",
      tag: "head",
      rest: { y: -50 },
      zIndex: 4,
      draw: (g) => {
        pixelRect(g, -44, -40, 88, 88, C.skin);
        // Ears
        pixelRect(g, -52, -4, 10, 18, C.skin);
        pixelRect(g, 42, -4, 10, 18, C.skin);
      },
    }),
    layer({
      id: "hat",
      parentId: "head",
      tag: "hat",
      rest: { y: -48 },
      zIndex: 5,
      draw: (g) => {
        pixelRect(g, -48, -20, 96, 36, C.beanie);
        pixelRect(g, -48, 12, 96, 8, C.beanieStripe);
        pixelRect(g, -8, -32, 16, 16, C.beanie); // pom
      },
    }),
    layer({
      id: "leftEye",
      parentId: "head",
      tag: "leftEye",
      rest: { x: -18, y: -4 },
      zIndex: 5,
      draw: (g) => pixelRect(g, -10, -10, 20, 20, C.eye),
    }),
    layer({
      id: "rightEye",
      parentId: "head",
      tag: "rightEye",
      rest: { x: 18, y: -4 },
      zIndex: 5,
      draw: (g) => pixelRect(g, -10, -10, 20, 20, C.eye),
    }),
    layer({
      id: "leftEyelid",
      parentId: "leftEye",
      tag: "leftEyelid",
      zIndex: 7,
      visible: false,
      draw: (g) => pixelRect(g, -10, -10, 20, 20, C.skin),
    }),
    layer({
      id: "rightEyelid",
      parentId: "rightEye",
      tag: "rightEyelid",
      zIndex: 7,
      visible: false,
      draw: (g) => pixelRect(g, -10, -10, 20, 20, C.skin),
    }),
    layer({
      id: "leftPupil",
      parentId: "leftEye",
      tag: "leftPupil",
      zIndex: 6,
      draw: (g) => pixelRect(g, -5, -5, 10, 10, C.pupil),
    }),
    layer({
      id: "rightPupil",
      parentId: "rightEye",
      tag: "rightPupil",
      zIndex: 6,
      draw: (g) => pixelRect(g, -5, -5, 10, 10, C.pupil),
    }),
    layer({
      id: "jaw",
      parentId: "head",
      tag: "jaw",
      rest: { y: 40 },
      draw: (g) => pixelRect(g, -20, -6, 40, 14, C.skin),
    }),
    layer({
      id: "mouthClosed",
      parentId: "head",
      tag: "mouth",
      rest: { y: 28 },
      zIndex: 5,
      swapSet: "mouth",
      draw: mouthClosed,
    }),
    layer({
      id: "mouthHalf",
      parentId: "head",
      tag: "mouth",
      rest: { y: 28 },
      zIndex: 5,
      swapSet: "mouth",
      visible: false,
      draw: mouthHalf,
    }),
    layer({
      id: "mouthOpen",
      parentId: "head",
      tag: "mouth",
      rest: { y: 28 },
      zIndex: 5,
      swapSet: "mouth",
      visible: false,
      draw: mouthWide,
    }),
  ],
};
