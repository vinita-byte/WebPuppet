import { circle, drawMouthShape, ellipse, roundBox } from "../drawHelpers";
import { layer, type CharacterDef } from "../types";

const OUT = 0x3d2914;
const BROWN = 0x8b5e34;
const CREAM = 0xf3e6c8;
const DARK = 0x5c3b1e;
const GOLD = 0xd4a017;

export const owlMentor: CharacterDef = {
  id: "owl-mentor",
  name: "The Wise Old Owl Mentor",
  shortName: "Owl",
  description:
    "Storybook owl professor — round glasses, graduation cap, warm browns.",
  accent: "#d4a017",
  fitHeight: 460,
  swapSets: [
    {
      id: "mouth",
      layers: ["beakClosed", "beakOpen"],
      defaultLayerId: "beakClosed",
    },
  ],
  triggers: [
    {
      id: "lecture",
      label: "Lecture Wing",
      key: "1",
      mode: "hold",
      showLayers: ["rightWingUp"],
    },
    {
      id: "wise",
      label: "Open Beak",
      key: "2",
      mode: "toggle",
      swapTo: { setId: "mouth", layerId: "beakOpen" },
    },
  ],
  physics: [
    {
      layerId: "tassel",
      stiffness: 35,
      damping: 4,
      gravity: 350,
      maxSwing: 0.85,
    },
  ],
  layers: [
    layer({ id: "root", parentId: null, tag: "root", draw: () => {} }),
    layer({
      id: "leftLeg",
      parentId: "root",
      tag: "leftLeg",
      rest: { x: -24, y: 150 },
      draw: (g) => {
        g.moveTo(0, 0);
        g.lineTo(-10, 40);
        g.lineTo(0, 40);
        g.lineTo(10, 40);
        g.stroke({ width: 4, color: GOLD });
      },
    }),
    layer({
      id: "rightLeg",
      parentId: "root",
      tag: "rightLeg",
      rest: { x: 24, y: 150 },
      draw: (g) => {
        g.moveTo(0, 0);
        g.lineTo(-10, 40);
        g.lineTo(0, 40);
        g.lineTo(10, 40);
        g.stroke({ width: 4, color: GOLD });
      },
    }),
    layer({
      id: "torso",
      parentId: "root",
      tag: "torso",
      rest: { y: 55 },
      zIndex: 1,
      draw: (g) => {
        ellipse(g, 0, 20, 90, 110, BROWN, OUT, 4);
        ellipse(g, 0, 35, 55, 70, CREAM, OUT, 2);
        // Soft feather rows
        for (let i = 0; i < 4; i++) {
          ellipse(g, -20 + i * 14, 10 + i * 18, 18, 10, DARK, undefined);
        }
      },
    }),
    layer({
      id: "leftWing",
      parentId: "torso",
      tag: "leftUpperArm",
      rest: { x: -85, y: 0, rotation: 0.35 },
      zIndex: 0,
      draw: (g) => {
        ellipse(g, 0, 40, 35, 70, DARK, OUT, 3);
        ellipse(g, 5, 30, 18, 40, BROWN);
      },
    }),
    layer({
      id: "rightWing",
      parentId: "torso",
      tag: "rightUpperArm",
      rest: { x: 85, y: 0, rotation: -0.35 },
      zIndex: 0,
      draw: (g) => {
        ellipse(g, 0, 40, 35, 70, DARK, OUT, 3);
        ellipse(g, -5, 30, 18, 40, BROWN);
      },
    }),
    layer({
      id: "rightWingUp",
      parentId: "torso",
      tag: "rightHand",
      rest: { x: 80, y: -70, rotation: -1.1 },
      visible: false,
      zIndex: 5,
      draw: (g) => {
        ellipse(g, 0, 30, 32, 60, DARK, OUT, 3);
        ellipse(g, -4, 20, 16, 35, BROWN);
      },
    }),
    layer({
      id: "head",
      parentId: "root",
      tag: "head",
      rest: { y: -55 },
      zIndex: 4,
      draw: (g) => {
        ellipse(g, 0, 0, 100, 90, BROWN, OUT, 4);
        // Ear tufts
        g.moveTo(-70, -50);
        g.lineTo(-95, -95);
        g.lineTo(-45, -70);
        g.closePath();
        g.fill({ color: DARK });
        g.stroke({ width: 2, color: OUT });
        g.moveTo(70, -50);
        g.lineTo(95, -95);
        g.lineTo(45, -70);
        g.closePath();
        g.fill({ color: DARK });
        g.stroke({ width: 2, color: OUT });
        ellipse(g, 0, 20, 55, 45, CREAM);
      },
    }),
    layer({
      id: "hat",
      parentId: "head",
      tag: "hat",
      rest: { y: -85 },
      zIndex: 5,
      draw: (g) => {
        g.moveTo(0, -40);
        g.lineTo(55, 20);
        g.lineTo(-55, 20);
        g.closePath();
        g.fill({ color: 0x2b2118 });
        g.stroke({ width: 3, color: OUT });
        roundBox(g, -60, 15, 120, 12, 2, 0x2b2118, OUT, 2);
      },
    }),
    layer({
      id: "tassel",
      parentId: "hat",
      tag: "physics",
      rest: { x: 40, y: 10 },
      zIndex: 6,
      draw: (g) => {
        g.moveTo(0, 0);
        g.lineTo(25, 35);
        g.stroke({ width: 3, color: GOLD });
        circle(g, 28, 40, 8, GOLD, OUT, 2);
      },
    }),
    layer({
      id: "glasses",
      parentId: "head",
      tag: "glasses",
      rest: { y: -8 },
      zIndex: 7,
      draw: (g) => {
        g.circle(-32, 0, 28);
        g.stroke({ width: 3, color: GOLD });
        g.circle(32, 0, 28);
        g.stroke({ width: 3, color: GOLD });
        g.moveTo(-4, 0);
        g.lineTo(4, 0);
        g.stroke({ width: 3, color: GOLD });
      },
    }),
    layer({
      id: "leftEye",
      parentId: "head",
      tag: "leftEye",
      rest: { x: -32, y: -8 },
      zIndex: 5,
      draw: (g) => circle(g, 0, 0, 24, 0xffffff, OUT, 2),
    }),
    layer({
      id: "rightEye",
      parentId: "head",
      tag: "rightEye",
      rest: { x: 32, y: -8 },
      zIndex: 5,
      draw: (g) => circle(g, 0, 0, 24, 0xffffff, OUT, 2),
    }),
    layer({
      id: "leftEyelid",
      parentId: "leftEye",
      tag: "leftEyelid",
      zIndex: 8,
      visible: false,
      draw: (g) => circle(g, 0, 0, 24, BROWN, OUT, 2),
    }),
    layer({
      id: "rightEyelid",
      parentId: "rightEye",
      tag: "rightEyelid",
      zIndex: 8,
      visible: false,
      draw: (g) => circle(g, 0, 0, 24, BROWN, OUT, 2),
    }),
    layer({
      id: "leftPupil",
      parentId: "leftEye",
      tag: "leftPupil",
      zIndex: 6,
      draw: (g) => {
        circle(g, 0, 2, 10, OUT);
        circle(g, -3, -2, 3, 0xffffff);
      },
    }),
    layer({
      id: "rightPupil",
      parentId: "rightEye",
      tag: "rightPupil",
      zIndex: 6,
      draw: (g) => {
        circle(g, 0, 2, 10, OUT);
        circle(g, -3, -2, 3, 0xffffff);
      },
    }),
    layer({
      id: "jaw",
      parentId: "head",
      tag: "jaw",
      rest: { y: 55 },
      draw: (g) => ellipse(g, 0, 0, 30, 12, CREAM),
    }),
    layer({
      id: "beakClosed",
      parentId: "head",
      tag: "mouth",
      rest: { y: 35 },
      zIndex: 6,
      swapSet: "mouth",
      draw: (g) => {
        g.clear();
        g.moveTo(0, -8);
        g.lineTo(-18, 12);
        g.lineTo(18, 12);
        g.closePath();
        g.fill({ color: GOLD });
        g.stroke({ width: 2, color: OUT });
      },
    }),
    layer({
      id: "beakOpen",
      parentId: "head",
      tag: "mouth",
      rest: { y: 35 },
      zIndex: 6,
      swapSet: "mouth",
      visible: false,
      draw: (g) => {
        g.clear();
        g.moveTo(0, -14);
        g.lineTo(-20, 6);
        g.lineTo(20, 6);
        g.closePath();
        g.fill({ color: GOLD });
        g.stroke({ width: 2, color: OUT });
        g.moveTo(-16, 8);
        g.lineTo(0, 28);
        g.lineTo(16, 8);
        g.closePath();
        g.fill({ color: 0xc47a1a });
        g.stroke({ width: 2, color: OUT });
        drawMouthShape(g, "half", 0x5c1a1a, 0xff8fa3);
      },
    }),
  ],
};
