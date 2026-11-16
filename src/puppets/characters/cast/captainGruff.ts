import { circle, ellipse, roundBox } from "../../drawHelpers";
import { layer, type CharacterDef } from "../../types";
import { mouthLayers, mouthSwapSet, trigger } from "../../mouthKit";

const OUT = 0x1a2030;
const SKIN = 0xd4a07a;
const BLUE = 0x2e5a8a;
const BLUE_DARK = 0x1e3f60;
const STRIPE = 0xe8eef5;
const BEET = 0x8b1a3a;
const CREAM = 0xf5e6d3;

export const captainGruff: CharacterDef = {
  id: "captain-gruff",
  name: "Captain Gruff",
  shortName: "Gruff",
  description:
    "Squinty sailor with a blue cap, a beetroot in the mouth corner, stocky torso, and huge forearms.",
  accent: "#2e5a8a",
  fitHeight: 520,
  swapSets: [mouthSwapSet()],
  triggers: [
    trigger({
      id: "popBeetroot",
      label: "Pop Beetroot",
      key: "1",
      mode: "toggle",
      showLayers: ["beetrootPop"],
    }),
    trigger({
      id: "swellArms",
      label: "Swell Arms",
      key: "2",
      mode: "hold",
      showLayers: ["leftForearmSwell", "rightForearmSwell"],
    }),
  ],
  physics: [
    {
      layerId: "capTassel",
      stiffness: 35,
      damping: 4.5,
      gravity: 320,
      maxSwing: 0.75,
    },
  ],
  layers: [
    layer({ id: "root", parentId: null, tag: "root", draw: () => {} }),
    layer({
      id: "leftLeg",
      parentId: "root",
      tag: "leftLeg",
      rest: { x: -32, y: 160 },
      draw: (g) => {
        roundBox(g, -16, 0, 32, 50, 6, BLUE_DARK, OUT, 3);
        roundBox(g, -20, 45, 40, 16, 4, 0x2a2a2a, OUT, 2);
      },
    }),
    layer({
      id: "rightLeg",
      parentId: "root",
      tag: "rightLeg",
      rest: { x: 32, y: 160 },
      draw: (g) => {
        roundBox(g, -16, 0, 32, 50, 6, BLUE_DARK, OUT, 3);
        roundBox(g, -20, 45, 40, 16, 4, 0x2a2a2a, OUT, 2);
      },
    }),
    layer({
      id: "torso",
      parentId: "root",
      tag: "torso",
      rest: { y: 70 },
      zIndex: 1,
      draw: (g) => {
        // Stocky striped torso
        roundBox(g, -75, -50, 150, 130, 20, STRIPE, OUT, 4);
        for (let i = 0; i < 5; i++) {
          roundBox(g, -72, -40 + i * 22, 144, 12, 0, BLUE);
        }
      },
    }),
    layer({
      id: "leftUpperArm",
      parentId: "torso",
      tag: "leftUpperArm",
      rest: { x: -90, y: -15, rotation: 0.2 },
      draw: (g) => roundBox(g, -18, 0, 36, 50, 14, SKIN, OUT, 3),
    }),
    layer({
      id: "leftForearm",
      parentId: "leftUpperArm",
      tag: "leftForearm",
      rest: { y: 50 },
      draw: (g) => roundBox(g, -22, 0, 44, 55, 16, SKIN, OUT, 3),
    }),
    layer({
      id: "leftForearmSwell",
      parentId: "leftUpperArm",
      tag: "leftForearm",
      rest: { y: 50 },
      visible: false,
      zIndex: 5,
      draw: (g) => {
        roundBox(g, -32, -5, 64, 65, 22, SKIN, OUT, 3);
        ellipse(g, 0, 25, 30, 20, 0xc48a5a);
      },
    }),
    layer({
      id: "leftHand",
      parentId: "leftForearm",
      tag: "leftHand",
      rest: { y: 58 },
      draw: (g) => ellipse(g, 0, 0, 20, 22, SKIN, OUT, 2),
    }),
    layer({
      id: "rightUpperArm",
      parentId: "torso",
      tag: "rightUpperArm",
      rest: { x: 90, y: -15, rotation: -0.2 },
      draw: (g) => roundBox(g, -18, 0, 36, 50, 14, SKIN, OUT, 3),
    }),
    layer({
      id: "rightForearm",
      parentId: "rightUpperArm",
      tag: "rightForearm",
      rest: { y: 50 },
      draw: (g) => roundBox(g, -22, 0, 44, 55, 16, SKIN, OUT, 3),
    }),
    layer({
      id: "rightForearmSwell",
      parentId: "rightUpperArm",
      tag: "rightForearm",
      rest: { y: 50 },
      visible: false,
      zIndex: 5,
      draw: (g) => {
        roundBox(g, -32, -5, 64, 65, 22, SKIN, OUT, 3);
        ellipse(g, 0, 25, 30, 20, 0xc48a5a);
      },
    }),
    layer({
      id: "rightHand",
      parentId: "rightForearm",
      tag: "rightHand",
      rest: { y: 58 },
      draw: (g) => ellipse(g, 0, 0, 20, 22, SKIN, OUT, 2),
    }),
    layer({
      id: "head",
      parentId: "root",
      tag: "head",
      rest: { y: -45 },
      zIndex: 4,
      draw: (g) => {
        ellipse(g, 0, 5, 70, 72, SKIN, OUT, 3);
        // Squint creases
        g.moveTo(-45, -5);
        g.lineTo(-20, 0);
        g.stroke({ width: 2, color: OUT });
        g.moveTo(20, 0);
        g.lineTo(45, -5);
        g.stroke({ width: 2, color: OUT });
      },
    }),
    layer({
      id: "hat",
      parentId: "head",
      tag: "hat",
      rest: { y: -55 },
      zIndex: 5,
      draw: (g) => {
        ellipse(g, 0, 20, 78, 18, BLUE, OUT, 3);
        roundBox(g, -50, -25, 100, 45, 8, BLUE, OUT, 3);
        roundBox(g, -48, -10, 96, 12, 0, STRIPE);
      },
    }),
    layer({
      id: "capTassel",
      parentId: "hat",
      tag: "physics",
      rest: { x: 45, y: -10 },
      zIndex: 6,
      draw: (g) => {
        g.moveTo(0, 0);
        g.lineTo(18, 28);
        g.stroke({ width: 3, color: OUT });
        circle(g, 20, 32, 8, BLUE_DARK, OUT, 2);
      },
    }),
    layer({
      id: "leftEye",
      parentId: "head",
      tag: "leftEye",
      rest: { x: -26, y: -8 },
      zIndex: 5,
      draw: (g) => {
        // Squinty eye
        g.moveTo(-16, 0);
        g.quadraticCurveTo(0, 8, 16, 0);
        g.quadraticCurveTo(0, 4, -16, 0);
        g.fill({ color: 0xffffff });
        g.stroke({ width: 2, color: OUT });
      },
    }),
    layer({
      id: "rightEye",
      parentId: "head",
      tag: "rightEye",
      rest: { x: 26, y: -8 },
      zIndex: 5,
      draw: (g) => {
        g.moveTo(-16, 0);
        g.quadraticCurveTo(0, 8, 16, 0);
        g.quadraticCurveTo(0, 4, -16, 0);
        g.fill({ color: 0xffffff });
        g.stroke({ width: 2, color: OUT });
      },
    }),
    layer({
      id: "leftPupil",
      parentId: "leftEye",
      tag: "leftPupil",
      zIndex: 6,
      draw: (g) => circle(g, 0, 2, 4, OUT),
    }),
    layer({
      id: "rightPupil",
      parentId: "rightEye",
      tag: "rightPupil",
      zIndex: 6,
      draw: (g) => circle(g, 0, 2, 4, OUT),
    }),
    layer({
      id: "leftEyelid",
      parentId: "leftEye",
      tag: "leftEyelid",
      zIndex: 7,
      visible: false,
      draw: (g) => ellipse(g, 0, 0, 16, 10, SKIN, OUT, 2),
    }),
    layer({
      id: "rightEyelid",
      parentId: "rightEye",
      tag: "rightEyelid",
      zIndex: 7,
      visible: false,
      draw: (g) => ellipse(g, 0, 0, 16, 10, SKIN, OUT, 2),
    }),
    layer({
      id: "beetroot",
      parentId: "head",
      tag: "accessory",
      rest: { x: 42, y: 35, rotation: 0.4 },
      zIndex: 7,
      draw: (g) => {
        ellipse(g, 0, 0, 14, 10, BEET, OUT, 2);
        g.moveTo(-4, -8);
        g.lineTo(-2, -18);
        g.lineTo(4, -16);
        g.stroke({ width: 2, color: 0x3a7a3a });
      },
    }),
    layer({
      id: "beetrootPop",
      parentId: "head",
      tag: "accessory",
      rest: { x: 70, y: 10, rotation: -0.3 },
      visible: false,
      zIndex: 8,
      draw: (g) => {
        ellipse(g, 0, 0, 16, 12, BEET, OUT, 2);
        g.moveTo(-4, -10);
        g.lineTo(0, -22);
        g.lineTo(6, -18);
        g.stroke({ width: 2, color: 0x3a7a3a });
        // Pop lines
        for (const a of [-0.5, 0, 0.5]) {
          g.moveTo(18 * Math.cos(a), 18 * Math.sin(a));
          g.lineTo(28 * Math.cos(a), 28 * Math.sin(a));
          g.stroke({ width: 2, color: CREAM });
        }
      },
    }),
    layer({
      id: "jaw",
      parentId: "head",
      tag: "jaw",
      rest: { y: 52 },
      draw: (g) => ellipse(g, 0, 0, 48, 22, SKIN, OUT, 2),
    }),
    ...mouthLayers("head", { y: 30 }, 6),
  ],
};
