import { circle, ellipse, roundBox } from "../../drawHelpers";
import { layer, type CharacterDef } from "../../types";
import { mouthLayers, mouthSwapSet, trigger } from "../../mouthKit";

const OUT = 0x3d2914;
const TAN = 0xd4a574;
const WHITE = 0xf5efe6;
const GOLD = 0xc9a227;
const TWEED = 0x8b7355;
const TWEED_DARK = 0x6b563f;

export const professorBiscuit: CharacterDef = {
  id: "professor-biscuit",
  name: "Professor Biscuit",
  shortName: "Biscuit",
  description:
    "Tan and white corgi in a tweed waistcoat with gold glasses, brows, and a wagging tail.",
  accent: "#c9a227",
  fitHeight: 480,
  swapSets: [mouthSwapSet()],
  triggers: [
    trigger({
      id: "earsPerk",
      label: "Ears Perk",
      key: "1",
      mode: "toggle",
      showLayers: ["leftEarPerk", "rightEarPerk"],
    }),
    trigger({
      id: "pausePose",
      label: "Pause Pose",
      key: "2",
      mode: "hold",
      showLayers: ["pointerPawUp"],
    }),
  ],
  physics: [
    {
      layerId: "tail",
      stiffness: 30,
      damping: 4,
      gravity: 180,
      maxSwing: 1.0,
    },
  ],
  layers: [
    layer({ id: "root", parentId: null, tag: "root", draw: () => {} }),
    layer({
      id: "tail",
      parentId: "root",
      tag: "physics",
      rest: { x: -70, y: 100, rotation: 0.4 },
      zIndex: 0,
      draw: (g) => {
        ellipse(g, 20, 0, 40, 16, TAN, OUT, 2);
        ellipse(g, 50, -8, 18, 12, WHITE, OUT, 2);
      },
    }),
    layer({
      id: "leftLeg",
      parentId: "root",
      tag: "leftLeg",
      rest: { x: -35, y: 140 },
      draw: (g) => {
        roundBox(g, -12, 0, 24, 45, 8, TAN, OUT, 2);
        ellipse(g, 0, 45, 16, 10, WHITE, OUT, 2);
      },
    }),
    layer({
      id: "rightLeg",
      parentId: "root",
      tag: "rightLeg",
      rest: { x: 35, y: 140 },
      draw: (g) => {
        roundBox(g, -12, 0, 24, 45, 8, TAN, OUT, 2);
        ellipse(g, 0, 45, 16, 10, WHITE, OUT, 2);
      },
    }),
    layer({
      id: "torso",
      parentId: "root",
      tag: "torso",
      rest: { y: 70 },
      zIndex: 1,
      draw: (g) => {
        ellipse(g, 0, 20, 85, 70, TAN, OUT, 3);
        // Tweed waistcoat
        g.moveTo(0, -40);
        g.lineTo(55, 10);
        g.lineTo(45, 80);
        g.lineTo(-45, 80);
        g.lineTo(-55, 10);
        g.closePath();
        g.fill({ color: TWEED });
        g.stroke({ width: 3, color: OUT });
        for (let i = 0; i < 4; i++) {
          g.moveTo(-30 + i * 8, -10 + i * 18);
          g.lineTo(30 - i * 8, -10 + i * 18);
          g.stroke({ width: 1, color: TWEED_DARK });
        }
        circle(g, 0, 10, 4, GOLD, OUT, 1);
        circle(g, 0, 30, 4, GOLD, OUT, 1);
        circle(g, 0, 50, 4, GOLD, OUT, 1);
      },
    }),
    layer({
      id: "leftUpperArm",
      parentId: "torso",
      tag: "leftUpperArm",
      rest: { x: -80, y: -10, rotation: 0.3 },
      draw: (g) => ellipse(g, 0, 25, 20, 35, TAN, OUT, 2),
    }),
    layer({
      id: "leftHand",
      parentId: "leftUpperArm",
      tag: "leftHand",
      rest: { y: 60 },
      draw: (g) => ellipse(g, 0, 0, 16, 14, WHITE, OUT, 2),
    }),
    layer({
      id: "rightUpperArm",
      parentId: "torso",
      tag: "rightUpperArm",
      rest: { x: 80, y: -10, rotation: -0.25 },
      draw: (g) => ellipse(g, 0, 25, 20, 35, TAN, OUT, 2),
    }),
    layer({
      id: "rightHand",
      parentId: "rightUpperArm",
      tag: "rightHand",
      rest: { y: 60 },
      draw: (g) => {
        ellipse(g, 0, 0, 16, 14, WHITE, OUT, 2);
        // Pointer paw tip
        g.moveTo(8, -4);
        g.lineTo(28, -18);
        g.stroke({ width: 3, color: WHITE });
      },
    }),
    layer({
      id: "pointerPawUp",
      parentId: "torso",
      tag: "rightHand",
      rest: { x: 70, y: -70, rotation: -0.9 },
      visible: false,
      zIndex: 6,
      draw: (g) => {
        ellipse(g, 0, 20, 18, 30, TAN, OUT, 2);
        ellipse(g, 0, 0, 16, 14, WHITE, OUT, 2);
        g.moveTo(5, -8);
        g.lineTo(20, -30);
        g.stroke({ width: 4, color: WHITE });
      },
    }),
    layer({
      id: "head",
      parentId: "root",
      tag: "head",
      rest: { y: -40 },
      zIndex: 4,
      draw: (g) => {
        ellipse(g, 0, 5, 75, 65, TAN, OUT, 3);
        ellipse(g, 0, 25, 45, 35, WHITE);
        ellipse(g, -20, -15, 22, 18, WHITE);
        ellipse(g, 20, -15, 22, 18, WHITE);
      },
    }),
    layer({
      id: "leftEar",
      parentId: "head",
      tag: "other",
      rest: { x: -55, y: -40, rotation: 0.2 },
      zIndex: 3,
      draw: (g) => {
        ellipse(g, 0, 0, 22, 35, TAN, OUT, 2);
        ellipse(g, 2, 5, 10, 18, 0xe8a0a0);
      },
    }),
    layer({
      id: "rightEar",
      parentId: "head",
      tag: "other",
      rest: { x: 55, y: -40, rotation: -0.2 },
      zIndex: 3,
      draw: (g) => {
        ellipse(g, 0, 0, 22, 35, TAN, OUT, 2);
        ellipse(g, -2, 5, 10, 18, 0xe8a0a0);
      },
    }),
    layer({
      id: "leftEarPerk",
      parentId: "head",
      tag: "other",
      rest: { x: -50, y: -55, rotation: -0.15 },
      visible: false,
      zIndex: 5,
      draw: (g) => {
        ellipse(g, 0, 0, 20, 38, TAN, OUT, 2);
        ellipse(g, 2, 5, 9, 18, 0xe8a0a0);
      },
    }),
    layer({
      id: "rightEarPerk",
      parentId: "head",
      tag: "other",
      rest: { x: 50, y: -55, rotation: 0.15 },
      visible: false,
      zIndex: 5,
      draw: (g) => {
        ellipse(g, 0, 0, 20, 38, TAN, OUT, 2);
        ellipse(g, -2, 5, 9, 18, 0xe8a0a0);
      },
    }),
    layer({
      id: "glasses",
      parentId: "head",
      tag: "glasses",
      rest: { y: -8 },
      zIndex: 7,
      draw: (g) => {
        g.circle(-28, 0, 22);
        g.stroke({ width: 3, color: GOLD });
        g.circle(28, 0, 22);
        g.stroke({ width: 3, color: GOLD });
        g.moveTo(-6, 0);
        g.lineTo(6, 0);
        g.stroke({ width: 3, color: GOLD });
      },
    }),
    layer({
      id: "leftBrow",
      parentId: "head",
      tag: "leftBrow",
      rest: { x: -28, y: -32 },
      zIndex: 6,
      draw: (g) => {
        g.moveTo(-16, 4);
        g.quadraticCurveTo(0, -6, 16, 2);
        g.stroke({ width: 4, color: OUT });
      },
    }),
    layer({
      id: "rightBrow",
      parentId: "head",
      tag: "rightBrow",
      rest: { x: 28, y: -32 },
      zIndex: 6,
      draw: (g) => {
        g.moveTo(-16, 2);
        g.quadraticCurveTo(0, -6, 16, 4);
        g.stroke({ width: 4, color: OUT });
      },
    }),
    layer({
      id: "leftEye",
      parentId: "head",
      tag: "leftEye",
      rest: { x: -28, y: -8 },
      zIndex: 5,
      draw: (g) => circle(g, 0, 0, 16, 0xffffff, OUT, 2),
    }),
    layer({
      id: "rightEye",
      parentId: "head",
      tag: "rightEye",
      rest: { x: 28, y: -8 },
      zIndex: 5,
      draw: (g) => circle(g, 0, 0, 16, 0xffffff, OUT, 2),
    }),
    layer({
      id: "leftPupil",
      parentId: "leftEye",
      tag: "leftPupil",
      zIndex: 6,
      draw: (g) => {
        circle(g, 0, 1, 7, OUT);
        circle(g, -2, -1, 2, 0xffffff);
      },
    }),
    layer({
      id: "rightPupil",
      parentId: "rightEye",
      tag: "rightPupil",
      zIndex: 6,
      draw: (g) => {
        circle(g, 0, 1, 7, OUT);
        circle(g, -2, -1, 2, 0xffffff);
      },
    }),
    layer({
      id: "leftEyelid",
      parentId: "leftEye",
      tag: "leftEyelid",
      zIndex: 8,
      visible: false,
      draw: (g) => circle(g, 0, 0, 16, TAN, OUT, 2),
    }),
    layer({
      id: "rightEyelid",
      parentId: "rightEye",
      tag: "rightEyelid",
      zIndex: 8,
      visible: false,
      draw: (g) => circle(g, 0, 0, 16, TAN, OUT, 2),
    }),
    layer({
      id: "jaw",
      parentId: "head",
      tag: "jaw",
      rest: { y: 50 },
      draw: (g) => ellipse(g, 0, 0, 35, 16, WHITE, OUT, 2),
    }),
    ...mouthLayers("head", { y: 30 }, 6),
  ],
};
