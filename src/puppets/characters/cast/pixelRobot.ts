import { circle, ellipse, roundBox } from "../../drawHelpers";
import { layer, type CharacterDef } from "../../types";
import { mouthLayers, mouthSwapSet, trigger } from "../../mouthKit";

const OUT = 0x1a3a32;
const MINT = 0x7dcea0;
const MINT_DARK = 0x4a9b78;
const CREAM = 0xf5fff8;
const PINK = 0xff8fab;

export const pixelRobot: CharacterDef = {
  id: "pixel-robot",
  name: "Pixel Robot",
  shortName: "Pixel",
  description:
    "Mint green boxy robot with round eyes, a floppy antenna, wringing arms, and a headset.",
  accent: "#7dcea0",
  fitHeight: 500,
  swapSets: [mouthSwapSet()],
  triggers: [
    trigger({
      id: "fluster",
      label: "Fluster Antenna",
      key: "1",
      mode: "toggle",
      showLayers: ["flusterDots", "antennaWiggle"],
    }),
    trigger({
      id: "bow",
      label: "Bow",
      key: "2",
      mode: "hold",
      showLayers: ["bowPose"],
    }),
  ],
  physics: [
    {
      layerId: "antennaTip",
      stiffness: 50,
      damping: 4.5,
      gravity: 220,
      maxSwing: 0.7,
    },
  ],
  layers: [
    layer({ id: "root", parentId: null, tag: "root", draw: () => {} }),
    layer({
      id: "leftLeg",
      parentId: "root",
      tag: "leftLeg",
      rest: { x: -28, y: 155 },
      draw: (g) => {
        roundBox(g, -12, 0, 24, 50, 4, MINT_DARK, OUT, 3);
        roundBox(g, -18, 45, 36, 14, 3, MINT, OUT, 2);
      },
    }),
    layer({
      id: "rightLeg",
      parentId: "root",
      tag: "rightLeg",
      rest: { x: 28, y: 155 },
      draw: (g) => {
        roundBox(g, -12, 0, 24, 50, 4, MINT_DARK, OUT, 3);
        roundBox(g, -18, 45, 36, 14, 3, MINT, OUT, 2);
      },
    }),
    layer({
      id: "torso",
      parentId: "root",
      tag: "torso",
      rest: { y: 70 },
      zIndex: 1,
      draw: (g) => {
        roundBox(g, -60, -50, 120, 110, 10, MINT, OUT, 4);
        roundBox(g, -35, -20, 70, 40, 6, CREAM, OUT, 2);
        for (let i = 0; i < 3; i++) {
          circle(g, -16 + i * 16, 40, 5, i === 1 ? PINK : 0x5dade2, OUT, 1);
        }
      },
    }),
    layer({
      id: "leftUpperArm",
      parentId: "torso",
      tag: "leftUpperArm",
      rest: { x: -75, y: -15, rotation: 0.55 },
      draw: (g) => roundBox(g, -12, 0, 24, 48, 6, MINT, OUT, 3),
    }),
    layer({
      id: "leftForearm",
      parentId: "leftUpperArm",
      tag: "leftForearm",
      rest: { y: 48, rotation: 0.8 },
      draw: (g) => roundBox(g, -10, 0, 20, 40, 5, MINT_DARK, OUT, 2),
    }),
    layer({
      id: "leftHand",
      parentId: "leftForearm",
      tag: "leftHand",
      rest: { y: 42 },
      draw: (g) => roundBox(g, -14, -8, 28, 22, 5, CREAM, OUT, 2),
    }),
    layer({
      id: "rightUpperArm",
      parentId: "torso",
      tag: "rightUpperArm",
      rest: { x: 75, y: -15, rotation: -0.55 },
      draw: (g) => roundBox(g, -12, 0, 24, 48, 6, MINT, OUT, 3),
    }),
    layer({
      id: "rightForearm",
      parentId: "rightUpperArm",
      tag: "rightForearm",
      rest: { y: 48, rotation: -0.8 },
      draw: (g) => roundBox(g, -10, 0, 20, 40, 5, MINT_DARK, OUT, 2),
    }),
    layer({
      id: "rightHand",
      parentId: "rightForearm",
      tag: "rightHand",
      rest: { y: 42 },
      draw: (g) => roundBox(g, -14, -8, 28, 22, 5, CREAM, OUT, 2),
    }),
    layer({
      id: "bowPose",
      parentId: "torso",
      tag: "accessory",
      rest: { y: -80, rotation: 0.35 },
      visible: false,
      zIndex: 8,
      draw: (g) => {
        roundBox(g, -40, -30, 80, 50, 8, MINT, OUT, 3);
        ellipse(g, 0, 0, 20, 12, OUT);
      },
    }),
    layer({
      id: "head",
      parentId: "root",
      tag: "head",
      rest: { y: -50 },
      zIndex: 4,
      draw: (g) => {
        roundBox(g, -70, -70, 140, 130, 12, MINT, OUT, 4);
        roundBox(g, -50, -40, 100, 70, 8, 0x1a2e28, OUT, 2);
      },
    }),
    layer({
      id: "headset",
      parentId: "head",
      tag: "hat",
      rest: { y: -10 },
      zIndex: 7,
      draw: (g) => {
        g.moveTo(-75, -20);
        g.lineTo(-75, 30);
        g.stroke({ width: 5, color: OUT });
        g.moveTo(75, -20);
        g.lineTo(75, 30);
        g.stroke({ width: 5, color: OUT });
        g.moveTo(-75, -35);
        g.quadraticCurveTo(0, -80, 75, -35);
        g.stroke({ width: 4, color: MINT_DARK });
        circle(g, -78, 35, 16, MINT_DARK, OUT, 2);
        circle(g, 78, 35, 16, MINT_DARK, OUT, 2);
      },
    }),
    layer({
      id: "antenna",
      parentId: "head",
      tag: "accessory",
      rest: { y: -78 },
      zIndex: 5,
      draw: (g) => {
        g.moveTo(0, 10);
        g.lineTo(0, -30);
        g.stroke({ width: 3, color: OUT });
      },
    }),
    layer({
      id: "antennaTip",
      parentId: "antenna",
      tag: "physics",
      rest: { y: -35 },
      zIndex: 6,
      draw: (g) => circle(g, 0, 0, 9, PINK, OUT, 2),
    }),
    layer({
      id: "antennaWiggle",
      parentId: "head",
      tag: "other",
      rest: { y: -100 },
      visible: false,
      zIndex: 8,
      draw: (g) => {
        for (const x of [-18, 0, 18]) {
          g.moveTo(x, 0);
          g.lineTo(x + 4, -12);
          g.stroke({ width: 2, color: PINK });
        }
      },
    }),
    layer({
      id: "leftEye",
      parentId: "head",
      tag: "leftEye",
      rest: { x: -26, y: -10 },
      zIndex: 5,
      draw: (g) => circle(g, 0, 0, 18, CREAM, OUT, 2),
    }),
    layer({
      id: "rightEye",
      parentId: "head",
      tag: "rightEye",
      rest: { x: 26, y: -10 },
      zIndex: 5,
      draw: (g) => circle(g, 0, 0, 18, CREAM, OUT, 2),
    }),
    layer({
      id: "leftPupil",
      parentId: "leftEye",
      tag: "leftPupil",
      zIndex: 6,
      draw: (g) => {
        circle(g, 0, 1, 7, OUT);
        circle(g, -2, -2, 2, 0xffffff);
      },
    }),
    layer({
      id: "rightPupil",
      parentId: "rightEye",
      tag: "rightPupil",
      zIndex: 6,
      draw: (g) => {
        circle(g, 0, 1, 7, OUT);
        circle(g, -2, -2, 2, 0xffffff);
      },
    }),
    layer({
      id: "leftEyelid",
      parentId: "leftEye",
      tag: "leftEyelid",
      zIndex: 7,
      visible: false,
      draw: (g) => circle(g, 0, 0, 18, MINT, OUT, 2),
    }),
    layer({
      id: "rightEyelid",
      parentId: "rightEye",
      tag: "rightEyelid",
      zIndex: 7,
      visible: false,
      draw: (g) => circle(g, 0, 0, 18, MINT, OUT, 2),
    }),
    layer({
      id: "flusterDots",
      parentId: "head",
      tag: "accessory",
      rest: { y: 10 },
      visible: false,
      zIndex: 8,
      draw: (g) => {
        for (const [x, y] of [
          [-55, 5],
          [-48, 18],
          [48, 5],
          [55, 18],
        ] as const) {
          circle(g, x, y, 4, PINK);
        }
      },
    }),
    layer({
      id: "jaw",
      parentId: "head",
      tag: "jaw",
      rest: { y: 50 },
      draw: (g) => roundBox(g, -35, -6, 70, 16, 4, MINT_DARK, OUT, 2),
    }),
    ...mouthLayers("head", { y: 28 }, 6),
  ],
};
