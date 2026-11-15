import { circle, drawMouthShape, ellipse, roundBox } from "../drawHelpers";
import { layer, type CharacterDef } from "../types";

const OUT = 0x1a1f14;
const FUR = 0x5f6b3a;
const FUR_DARK = 0x3f4628;
const GOLD = 0xc9a227;
const CREAM = 0xe8e0c8;
const SUIT = 0x2a3320;

export const cryptoBull: CharacterDef = {
  id: "crypto-bull",
  name: "The Grumpy Crypto Bull",
  shortName: "Bull",
  description:
    "Stocky bull in a tiny suit — permanently unimpressed, green & gold.",
  accent: "#c9a227",
  fitHeight: 480,
  swapSets: [
    {
      id: "mouth",
      layers: ["mouthClosed", "mouthHalf", "mouthOpen"],
      defaultLayerId: "mouthClosed",
    },
  ],
  triggers: [
    {
      id: "smirk",
      label: "Unimpressed",
      key: "1",
      mode: "toggle",
      swapTo: { setId: "mouth", layerId: "mouthClosed" },
    },
    {
      id: "snort",
      label: "Snort",
      key: "2",
      mode: "hold",
      swapTo: { setId: "mouth", layerId: "mouthOpen" },
    },
  ],
  physics: [
    { layerId: "tie", stiffness: 40, damping: 6, gravity: 280, maxSwing: 0.45 },
  ],
  layers: [
    layer({ id: "root", parentId: null, tag: "root", draw: () => {} }),
    layer({
      id: "leftLeg",
      parentId: "root",
      tag: "leftLeg",
      rest: { x: -32, y: 155 },
      draw: (g) => {
        roundBox(g, -18, 0, 36, 55, 8, SUIT, OUT, 3);
        roundBox(g, -22, 48, 44, 16, 6, 0x1a1a1a, OUT, 2);
      },
    }),
    layer({
      id: "rightLeg",
      parentId: "root",
      tag: "rightLeg",
      rest: { x: 32, y: 155 },
      draw: (g) => {
        roundBox(g, -18, 0, 36, 55, 8, SUIT, OUT, 3);
        roundBox(g, -22, 48, 44, 16, 6, 0x1a1a1a, OUT, 2);
      },
    }),
    layer({
      id: "torso",
      parentId: "root",
      tag: "torso",
      rest: { y: 70 },
      zIndex: 1,
      draw: (g) => {
        roundBox(g, -75, -55, 150, 140, 24, SUIT, OUT, 4);
        // Shirt triangle
        g.moveTo(-20, -50);
        g.lineTo(20, -50);
        g.lineTo(0, 20);
        g.closePath();
        g.fill({ color: CREAM });
        g.stroke({ width: 2, color: OUT });
      },
    }),
    layer({
      id: "tie",
      parentId: "torso",
      tag: "physics",
      rest: { y: -20 },
      zIndex: 3,
      draw: (g) => {
        g.moveTo(-12, -18);
        g.lineTo(12, -18);
        g.lineTo(8, 55);
        g.lineTo(0, 62);
        g.lineTo(-8, 55);
        g.closePath();
        g.fill({ color: GOLD });
        g.stroke({ width: 2, color: OUT });
      },
    }),
    layer({
      id: "leftUpperArm",
      parentId: "torso",
      tag: "leftUpperArm",
      rest: { x: -85, y: -15, rotation: 0.2 },
      draw: (g) => roundBox(g, -16, 0, 32, 50, 12, SUIT, OUT, 3),
    }),
    layer({
      id: "leftForearm",
      parentId: "leftUpperArm",
      tag: "leftForearm",
      rest: { y: 48 },
      draw: (g) => {
        roundBox(g, -14, 0, 28, 42, 10, SUIT, OUT, 3);
        ellipse(g, 0, 44, 16, 14, FUR, OUT, 2);
      },
    }),
    layer({
      id: "rightUpperArm",
      parentId: "torso",
      tag: "rightUpperArm",
      rest: { x: 85, y: -15, rotation: -0.2 },
      draw: (g) => roundBox(g, -16, 0, 32, 50, 12, SUIT, OUT, 3),
    }),
    layer({
      id: "rightForearm",
      parentId: "rightUpperArm",
      tag: "rightForearm",
      rest: { y: 48 },
      draw: (g) => {
        roundBox(g, -14, 0, 28, 42, 10, SUIT, OUT, 3);
        ellipse(g, 0, 44, 16, 14, FUR, OUT, 2);
      },
    }),
    layer({
      id: "head",
      parentId: "root",
      tag: "head",
      rest: { y: -50 },
      zIndex: 4,
      draw: (g) => {
        ellipse(g, 0, 10, 95, 85, FUR, OUT, 4);
        // Snout
        ellipse(g, 0, 48, 48, 32, CREAM, OUT, 3);
        circle(g, -14, 42, 5, OUT);
        circle(g, 14, 42, 5, OUT);
        // Horns
        g.moveTo(-70, -40);
        g.lineTo(-110, -90);
        g.lineTo(-55, -55);
        g.closePath();
        g.fill({ color: CREAM });
        g.stroke({ width: 3, color: OUT });
        g.moveTo(70, -40);
        g.lineTo(110, -90);
        g.lineTo(55, -55);
        g.closePath();
        g.fill({ color: CREAM });
        g.stroke({ width: 3, color: OUT });
        // Ears
        ellipse(g, -88, 0, 18, 28, FUR_DARK, OUT, 2);
        ellipse(g, 88, 0, 18, 28, FUR_DARK, OUT, 2);
      },
    }),
    layer({
      id: "leftBrow",
      parentId: "head",
      tag: "leftBrow",
      rest: { x: -36, y: -28, rotation: 0.25 },
      zIndex: 6,
      draw: (g) => {
        g.roundRect(-22, -5, 44, 10, 4);
        g.fill({ color: OUT });
      },
    }),
    layer({
      id: "rightBrow",
      parentId: "head",
      tag: "rightBrow",
      rest: { x: 36, y: -28, rotation: -0.25 },
      zIndex: 6,
      draw: (g) => {
        g.roundRect(-22, -5, 44, 10, 4);
        g.fill({ color: OUT });
      },
    }),
    layer({
      id: "leftEye",
      parentId: "head",
      tag: "leftEye",
      rest: { x: -34, y: -5 },
      zIndex: 5,
      draw: (g) => ellipse(g, 0, 0, 22, 18, 0xffffff, OUT, 3),
    }),
    layer({
      id: "rightEye",
      parentId: "head",
      tag: "rightEye",
      rest: { x: 34, y: -5 },
      zIndex: 5,
      draw: (g) => ellipse(g, 0, 0, 22, 18, 0xffffff, OUT, 3),
    }),
    layer({
      id: "leftEyelid",
      parentId: "leftEye",
      tag: "leftEyelid",
      zIndex: 8,
      visible: false,
      draw: (g) => ellipse(g, 0, 0, 22, 18, FUR, OUT, 2),
    }),
    layer({
      id: "rightEyelid",
      parentId: "rightEye",
      tag: "rightEyelid",
      zIndex: 8,
      visible: false,
      draw: (g) => ellipse(g, 0, 0, 22, 18, FUR, OUT, 2),
    }),
    layer({
      id: "leftPupil",
      parentId: "leftEye",
      tag: "leftPupil",
      zIndex: 6,
      draw: (g) => circle(g, 0, 2, 8, OUT),
    }),
    layer({
      id: "rightPupil",
      parentId: "rightEye",
      tag: "rightPupil",
      zIndex: 6,
      draw: (g) => circle(g, 0, 2, 8, OUT),
    }),
    layer({
      id: "jaw",
      parentId: "head",
      tag: "jaw",
      rest: { y: 78 },
      draw: (g) => ellipse(g, 0, 0, 40, 16, CREAM),
    }),
    layer({
      id: "mouthClosed",
      parentId: "head",
      tag: "mouth",
      rest: { y: 58 },
      zIndex: 5,
      swapSet: "mouth",
      draw: (g) => {
        g.clear();
        g.roundRect(-28, -3, 56, 7, 3);
        g.fill({ color: OUT });
      },
    }),
    layer({
      id: "mouthHalf",
      parentId: "head",
      tag: "mouth",
      rest: { y: 58 },
      zIndex: 5,
      swapSet: "mouth",
      visible: false,
      draw: (g) => drawMouthShape(g, "half", OUT, 0xb85c5c),
    }),
    layer({
      id: "mouthOpen",
      parentId: "head",
      tag: "mouth",
      rest: { y: 58 },
      zIndex: 5,
      swapSet: "mouth",
      visible: false,
      draw: (g) => drawMouthShape(g, "open", OUT, 0xb85c5c),
    }),
  ],
};
