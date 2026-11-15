import { circle, ellipse, roundBox } from "../drawHelpers";
import { layer, type CharacterDef } from "../types";

const OUT = 0x0f2a32;
const TEAL = 0x2a9d8f;
const TEAL_DARK = 0x1d6f66;
const ORANGE = 0xe76f51;
const CREAM = 0xf4f1de;
const SCREEN = 0x14252b;

export const robotIntern: CharacterDef = {
  id: "robot-intern",
  name: "Over-Caffeinated Robot Intern",
  shortName: "Robot",
  description:
    "Cute retro robot — square head, antenna, spring arms, screen face.",
  accent: "#e76f51",
  fitHeight: 500,
  swapSets: [
    {
      id: "mouth",
      layers: ["mouthClosed", "mouthHalf", "mouthOpen"],
      defaultLayerId: "mouthClosed",
    },
  ],
  triggers: [
    {
      id: "overdrive",
      label: "Overdrive Eyes",
      key: "1",
      mode: "toggle",
      showLayers: ["eyeSparks"],
    },
    {
      id: "salute",
      label: "Salute",
      key: "2",
      mode: "hold",
      showLayers: ["rightHandSalute"],
    },
  ],
  physics: [
    {
      layerId: "antennaTip",
      stiffness: 55,
      damping: 5,
      gravity: 200,
      maxSwing: 0.6,
    },
  ],
  layers: [
    layer({ id: "root", parentId: null, tag: "root", draw: () => {} }),
    layer({
      id: "leftLeg",
      parentId: "root",
      tag: "leftLeg",
      rest: { x: -30, y: 160 },
      draw: (g) => {
        roundBox(g, -14, 0, 28, 60, 6, TEAL_DARK, OUT, 3);
        roundBox(g, -22, 55, 44, 16, 4, ORANGE, OUT, 2);
      },
    }),
    layer({
      id: "rightLeg",
      parentId: "root",
      tag: "rightLeg",
      rest: { x: 30, y: 160 },
      draw: (g) => {
        roundBox(g, -14, 0, 28, 60, 6, TEAL_DARK, OUT, 3);
        roundBox(g, -22, 55, 44, 16, 4, ORANGE, OUT, 2);
      },
    }),
    layer({
      id: "torso",
      parentId: "root",
      tag: "torso",
      rest: { y: 70 },
      zIndex: 1,
      draw: (g) => {
        roundBox(g, -70, -60, 140, 130, 16, TEAL, OUT, 4);
        roundBox(g, -40, -30, 80, 50, 8, SCREEN, OUT, 2);
        // Status LEDs
        circle(g, -20, 40, 6, ORANGE, OUT, 1);
        circle(g, 0, 40, 6, 0x90be6d, OUT, 1);
        circle(g, 20, 40, 6, 0xf9c74f, OUT, 1);
      },
    }),
    layer({
      id: "leftUpperArm",
      parentId: "torso",
      tag: "leftUpperArm",
      rest: { x: -85, y: -20, rotation: 0.3 },
      draw: (g) => {
        // Spring coils
        for (let i = 0; i < 5; i++) {
          ellipse(g, 0, 8 + i * 12, 14, 6, CREAM, OUT, 2);
        }
      },
    }),
    layer({
      id: "leftForearm",
      parentId: "leftUpperArm",
      tag: "leftForearm",
      rest: { y: 70 },
      draw: (g) => {
        for (let i = 0; i < 4; i++) {
          ellipse(g, 0, 6 + i * 12, 12, 5, ORANGE, OUT, 2);
        }
        roundBox(g, -16, 52, 32, 24, 8, TEAL, OUT, 2);
      },
    }),
    layer({
      id: "leftHand",
      parentId: "leftForearm",
      tag: "leftHand",
      rest: { y: 78 },
      draw: (g) => {
        roundBox(g, -18, -10, 36, 28, 6, TEAL_DARK, OUT, 2);
        roundBox(g, -6, -28, 12, 20, 3, CREAM, OUT, 1);
      },
    }),
    layer({
      id: "rightUpperArm",
      parentId: "torso",
      tag: "rightUpperArm",
      rest: { x: 85, y: -20, rotation: -0.3 },
      draw: (g) => {
        for (let i = 0; i < 5; i++) {
          ellipse(g, 0, 8 + i * 12, 14, 6, CREAM, OUT, 2);
        }
      },
    }),
    layer({
      id: "rightForearm",
      parentId: "rightUpperArm",
      tag: "rightForearm",
      rest: { y: 70 },
      draw: (g) => {
        for (let i = 0; i < 4; i++) {
          ellipse(g, 0, 6 + i * 12, 12, 5, ORANGE, OUT, 2);
        }
        roundBox(g, -16, 52, 32, 24, 8, TEAL, OUT, 2);
      },
    }),
    layer({
      id: "rightHand",
      parentId: "rightForearm",
      tag: "rightHand",
      rest: { y: 78 },
      draw: (g) => {
        roundBox(g, -18, -10, 36, 28, 6, TEAL_DARK, OUT, 2);
        roundBox(g, -6, -28, 12, 20, 3, CREAM, OUT, 1);
      },
    }),
    layer({
      id: "rightHandSalute",
      parentId: "torso",
      tag: "rightHand",
      rest: { x: 70, y: -95, rotation: -0.5 },
      visible: false,
      zIndex: 6,
      draw: (g) => {
        roundBox(g, -18, -10, 36, 28, 6, TEAL_DARK, OUT, 2);
        roundBox(g, -6, -28, 12, 20, 3, CREAM, OUT, 1);
      },
    }),
    layer({
      id: "head",
      parentId: "root",
      tag: "head",
      rest: { y: -55 },
      zIndex: 4,
      draw: (g) => {
        roundBox(g, -85, -85, 170, 160, 18, TEAL, OUT, 4);
        // Screen bezel
        roundBox(g, -65, -55, 130, 100, 10, SCREEN, OUT, 3);
        // Ear bolts
        circle(g, -90, 0, 12, ORANGE, OUT, 2);
        circle(g, 90, 0, 12, ORANGE, OUT, 2);
      },
    }),
    layer({
      id: "antenna",
      parentId: "head",
      tag: "hat",
      rest: { y: -95 },
      zIndex: 5,
      draw: (g) => {
        g.moveTo(0, 20);
        g.lineTo(0, -35);
        g.stroke({ width: 4, color: OUT });
      },
    }),
    layer({
      id: "antennaTip",
      parentId: "antenna",
      tag: "physics",
      rest: { y: -40 },
      zIndex: 6,
      draw: (g) => circle(g, 0, 0, 10, ORANGE, OUT, 2),
    }),
    layer({
      id: "leftEye",
      parentId: "head",
      tag: "leftEye",
      rest: { x: -28, y: -15 },
      zIndex: 5,
      draw: (g) => circle(g, 0, 0, 22, 0x90e0ef, OUT, 2),
    }),
    layer({
      id: "rightEye",
      parentId: "head",
      tag: "rightEye",
      rest: { x: 28, y: -15 },
      zIndex: 5,
      draw: (g) => circle(g, 0, 0, 22, 0x90e0ef, OUT, 2),
    }),
    layer({
      id: "leftEyelid",
      parentId: "leftEye",
      tag: "leftEyelid",
      zIndex: 7,
      visible: false,
      draw: (g) => {
        g.rect(-22, -22, 44, 44);
        g.fill({ color: SCREEN });
        g.rect(-22, 0, 44, 4);
        g.fill({ color: 0x90e0ef });
      },
    }),
    layer({
      id: "rightEyelid",
      parentId: "rightEye",
      tag: "rightEyelid",
      zIndex: 7,
      visible: false,
      draw: (g) => {
        g.rect(-22, -22, 44, 44);
        g.fill({ color: SCREEN });
        g.rect(-22, 0, 44, 4);
        g.fill({ color: 0x90e0ef });
      },
    }),
    layer({
      id: "leftPupil",
      parentId: "leftEye",
      tag: "leftPupil",
      zIndex: 6,
      draw: (g) => {
        circle(g, 0, 0, 10, OUT);
        circle(g, -3, -3, 3, 0xffffff);
      },
    }),
    layer({
      id: "rightPupil",
      parentId: "rightEye",
      tag: "rightPupil",
      zIndex: 6,
      draw: (g) => {
        circle(g, 0, 0, 10, OUT);
        circle(g, -3, -3, 3, 0xffffff);
      },
    }),
    layer({
      id: "eyeSparks",
      parentId: "head",
      tag: "accessory",
      rest: { y: -15 },
      visible: false,
      zIndex: 8,
      draw: (g) => {
        for (const x of [-40, -20, 20, 40]) {
          g.moveTo(x, -30);
          g.lineTo(x + 4, -18);
          g.stroke({ width: 2, color: ORANGE });
        }
      },
    }),
    layer({
      id: "jaw",
      parentId: "head",
      tag: "jaw",
      rest: { y: 55 },
      draw: (g) => roundBox(g, -40, -8, 80, 20, 4, TEAL_DARK, OUT, 2),
    }),
    layer({
      id: "mouthClosed",
      parentId: "head",
      tag: "mouth",
      rest: { y: 25 },
      zIndex: 5,
      swapSet: "mouth",
      draw: (g) => {
        g.clear();
        g.roundRect(-30, -4, 60, 8, 2);
        g.fill({ color: 0x90e0ef });
      },
    }),
    layer({
      id: "mouthHalf",
      parentId: "head",
      tag: "mouth",
      rest: { y: 25 },
      zIndex: 5,
      swapSet: "mouth",
      visible: false,
      draw: (g) => {
        g.clear();
        g.roundRect(-32, -10, 64, 20, 4);
        g.fill({ color: 0x90e0ef });
      },
    }),
    layer({
      id: "mouthOpen",
      parentId: "head",
      tag: "mouth",
      rest: { y: 25 },
      zIndex: 5,
      swapSet: "mouth",
      visible: false,
      draw: (g) => {
        g.clear();
        g.roundRect(-36, -16, 72, 32, 6);
        g.fill({ color: 0x90e0ef });
        g.roundRect(-20, -6, 40, 12, 3);
        g.fill({ color: ORANGE, alpha: 0.7 });
      },
    }),
  ],
};
