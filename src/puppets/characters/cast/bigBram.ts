import { circle, ellipse, roundBox } from "../../drawHelpers";
import { layer, type CharacterDef } from "../../types";
import { mouthLayers, mouthSwapSet, trigger } from "../../mouthKit";

const OUT = 0x2a1a14;
const SKIN = 0xe0b090;
const BEARD = 0x5c3a28;
const BEARD_LIGHT = 0x7a5238;
const RED = 0xc0392b;
const WHITE = 0xf5f0eb;
const PINK = 0xffb4c4;

export const bigBram: CharacterDef = {
  id: "big-bram",
  name: "Big Bram",
  shortName: "Bram",
  description:
    "Large head, big beard with jaw, melt eyes, tiny striped shirt torso, and flex arm poses.",
  accent: "#c0392b",
  fitHeight: 560,
  swapSets: [mouthSwapSet()],
  triggers: [
    trigger({
      id: "flex",
      label: "Flex",
      key: "1",
      mode: "hold",
      showLayers: ["leftFlex", "rightFlex"],
    }),
    trigger({
      id: "kittenMelt",
      label: "Kitten Melt",
      key: "2",
      mode: "toggle",
      showLayers: ["meltEyes"],
    }),
  ],
  physics: [
    {
      layerId: "beardTip",
      stiffness: 28,
      damping: 4,
      gravity: 280,
      maxSwing: 0.5,
    },
  ],
  layers: [
    layer({ id: "root", parentId: null, tag: "root", draw: () => {} }),
    layer({
      id: "leftLeg",
      parentId: "root",
      tag: "leftLeg",
      rest: { x: -22, y: 175 },
      draw: (g) => {
        roundBox(g, -10, 0, 20, 40, 6, 0x2a2a2a, OUT, 2);
        ellipse(g, 0, 40, 14, 8, 0x1a1a1a, OUT, 2);
      },
    }),
    layer({
      id: "rightLeg",
      parentId: "root",
      tag: "rightLeg",
      rest: { x: 22, y: 175 },
      draw: (g) => {
        roundBox(g, -10, 0, 20, 40, 6, 0x2a2a2a, OUT, 2);
        ellipse(g, 0, 40, 14, 8, 0x1a1a1a, OUT, 2);
      },
    }),
    layer({
      id: "torso",
      parentId: "root",
      tag: "torso",
      rest: { y: 110 },
      zIndex: 1,
      draw: (g) => {
        // Tiny striped shirt under huge head
        roundBox(g, -40, -30, 80, 90, 12, WHITE, OUT, 3);
        for (let i = 0; i < 5; i++) {
          roundBox(g, -38, -22 + i * 16, 76, 8, 0, RED);
        }
      },
    }),
    layer({
      id: "leftUpperArm",
      parentId: "torso",
      tag: "leftUpperArm",
      rest: { x: -55, y: -10, rotation: 0.3 },
      draw: (g) => roundBox(g, -14, 0, 28, 45, 12, SKIN, OUT, 2),
    }),
    layer({
      id: "leftHand",
      parentId: "leftUpperArm",
      tag: "leftHand",
      rest: { y: 48 },
      draw: (g) => ellipse(g, 0, 0, 14, 16, SKIN, OUT, 2),
    }),
    layer({
      id: "rightUpperArm",
      parentId: "torso",
      tag: "rightUpperArm",
      rest: { x: 55, y: -10, rotation: -0.3 },
      draw: (g) => roundBox(g, -14, 0, 28, 45, 12, SKIN, OUT, 2),
    }),
    layer({
      id: "rightHand",
      parentId: "rightUpperArm",
      tag: "rightHand",
      rest: { y: 48 },
      draw: (g) => ellipse(g, 0, 0, 14, 16, SKIN, OUT, 2),
    }),
    layer({
      id: "leftFlex",
      parentId: "torso",
      tag: "leftUpperArm",
      rest: { x: -70, y: -40, rotation: -0.9 },
      visible: false,
      zIndex: 5,
      draw: (g) => {
        roundBox(g, -18, 0, 36, 40, 14, SKIN, OUT, 3);
        ellipse(g, 0, 15, 22, 18, 0xc48a5a);
        ellipse(g, 5, -5, 14, 16, SKIN, OUT, 2);
      },
    }),
    layer({
      id: "rightFlex",
      parentId: "torso",
      tag: "rightUpperArm",
      rest: { x: 70, y: -40, rotation: 0.9 },
      visible: false,
      zIndex: 5,
      draw: (g) => {
        roundBox(g, -18, 0, 36, 40, 14, SKIN, OUT, 3);
        ellipse(g, 0, 15, 22, 18, 0xc48a5a);
        ellipse(g, -5, -5, 14, 16, SKIN, OUT, 2);
      },
    }),
    layer({
      id: "head",
      parentId: "root",
      tag: "head",
      rest: { y: -20 },
      zIndex: 4,
      draw: (g) => {
        ellipse(g, 0, 0, 110, 100, SKIN, OUT, 4);
        // Hair
        g.moveTo(-90, -20);
        g.quadraticCurveTo(-60, -90, 0, -100);
        g.quadraticCurveTo(60, -90, 90, -20);
        g.quadraticCurveTo(40, -50, 0, -55);
        g.quadraticCurveTo(-40, -50, -90, -20);
        g.closePath();
        g.fill({ color: BEARD });
        g.stroke({ width: 2, color: OUT });
      },
    }),
    layer({
      id: "jaw",
      parentId: "head",
      tag: "jaw",
      rest: { y: 55 },
      zIndex: 3,
      draw: (g) => {
        // Big beard
        ellipse(g, 0, 30, 95, 70, BEARD, OUT, 3);
        ellipse(g, -40, 10, 30, 25, BEARD_LIGHT);
        ellipse(g, 40, 10, 30, 25, BEARD_LIGHT);
        ellipse(g, 0, -5, 50, 25, SKIN);
      },
    }),
    layer({
      id: "beardTip",
      parentId: "jaw",
      tag: "physics",
      rest: { y: 85 },
      zIndex: 4,
      draw: (g) => ellipse(g, 0, 0, 35, 25, BEARD, OUT, 2),
    }),
    layer({
      id: "leftEye",
      parentId: "head",
      tag: "leftEye",
      rest: { x: -38, y: -15 },
      zIndex: 5,
      draw: (g) => ellipse(g, 0, 0, 24, 22, 0xffffff, OUT, 2),
    }),
    layer({
      id: "rightEye",
      parentId: "head",
      tag: "rightEye",
      rest: { x: 38, y: -15 },
      zIndex: 5,
      draw: (g) => ellipse(g, 0, 0, 24, 22, 0xffffff, OUT, 2),
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
      id: "leftEyelid",
      parentId: "leftEye",
      tag: "leftEyelid",
      zIndex: 7,
      visible: false,
      draw: (g) => ellipse(g, 0, 0, 24, 22, SKIN, OUT, 2),
    }),
    layer({
      id: "rightEyelid",
      parentId: "rightEye",
      tag: "rightEyelid",
      zIndex: 7,
      visible: false,
      draw: (g) => ellipse(g, 0, 0, 24, 22, SKIN, OUT, 2),
    }),
    layer({
      id: "meltEyes",
      parentId: "head",
      tag: "accessory",
      rest: { y: -15 },
      visible: false,
      zIndex: 8,
      draw: (g) => {
        // Heart melt eyes
        for (const x of [-38, 38]) {
          g.moveTo(x, 8);
          g.bezierCurveTo(x - 18, -5, x - 12, -22, x, -12);
          g.bezierCurveTo(x + 12, -22, x + 18, -5, x, 8);
          g.closePath();
          g.fill({ color: PINK });
          g.stroke({ width: 2, color: OUT });
        }
      },
    }),
    layer({
      id: "leftBrow",
      parentId: "head",
      tag: "leftBrow",
      rest: { x: -38, y: -42 },
      zIndex: 6,
      draw: (g) => {
        g.moveTo(-18, 4);
        g.quadraticCurveTo(0, -4, 18, 2);
        g.stroke({ width: 5, color: BEARD });
      },
    }),
    layer({
      id: "rightBrow",
      parentId: "head",
      tag: "rightBrow",
      rest: { x: 38, y: -42 },
      zIndex: 6,
      draw: (g) => {
        g.moveTo(-18, 2);
        g.quadraticCurveTo(0, -4, 18, 4);
        g.stroke({ width: 5, color: BEARD });
      },
    }),
    ...mouthLayers("jaw", { y: -10 }, 6),
  ],
};
