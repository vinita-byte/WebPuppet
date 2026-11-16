import { circle, ellipse, roundBox } from "../../drawHelpers";
import { layer, type CharacterDef } from "../../types";
import { mouthLayers, mouthSwapSet, trigger } from "../../mouthKit";

const OUT = 0x1a2030;
const SKIN = 0xe8c4a0;
const BEARD = 0xf0ebe3;
const NAVY = 0x1e3a5f;
const NAVY_DARK = 0x142840;
const GOLD = 0xc9a227;
const BROWN = 0x5c4030;

export const gordon: CharacterDef = {
  id: "gordon",
  name: "Gordon",
  shortName: "Gordon",
  description:
    "Weathered librarian captain with a white beard, bushy brows, a navy coat, and a ship bell.",
  accent: "#1e3a5f",
  fitHeight: 540,
  swapSets: [mouthSwapSet()],
  triggers: [
    trigger({
      id: "oneBrow",
      label: "One Brow",
      key: "1",
      mode: "toggle",
      showLayers: ["leftBrowUp"],
    }),
    trigger({
      id: "browsSlam",
      label: "Both Brows Slam",
      key: "2",
      mode: "hold",
      showLayers: ["leftBrowSlam", "rightBrowSlam"],
    }),
    trigger({
      id: "softBrows",
      label: "Soft Brows",
      key: "3",
      mode: "toggle",
      showLayers: ["leftBrowSoft", "rightBrowSoft"],
    }),
  ],
  physics: [
    {
      layerId: "shipBell",
      stiffness: 45,
      damping: 6,
      gravity: 380,
      maxSwing: 0.65,
    },
  ],
  layers: [
    layer({ id: "root", parentId: null, tag: "root", draw: () => {} }),
    layer({
      id: "leftLeg",
      parentId: "root",
      tag: "leftLeg",
      rest: { x: -30, y: 175 },
      draw: (g) => {
        roundBox(g, -16, 0, 32, 55, 6, NAVY_DARK, OUT, 3);
        roundBox(g, -20, 50, 40, 16, 4, 0x2a2a2a, OUT, 2);
      },
    }),
    layer({
      id: "rightLeg",
      parentId: "root",
      tag: "rightLeg",
      rest: { x: 30, y: 175 },
      draw: (g) => {
        roundBox(g, -16, 0, 32, 55, 6, NAVY_DARK, OUT, 3);
        roundBox(g, -20, 50, 40, 16, 4, 0x2a2a2a, OUT, 2);
      },
    }),
    layer({
      id: "torso",
      parentId: "root",
      tag: "torso",
      rest: { y: 75 },
      zIndex: 1,
      draw: (g) => {
        roundBox(g, -70, -55, 140, 140, 18, NAVY, OUT, 4);
        // Lapels
        g.moveTo(-20, -55);
        g.lineTo(-55, 20);
        g.lineTo(-20, 20);
        g.closePath();
        g.fill({ color: NAVY_DARK });
        g.moveTo(20, -55);
        g.lineTo(55, 20);
        g.lineTo(20, 20);
        g.closePath();
        g.fill({ color: NAVY_DARK });
        for (let i = 0; i < 3; i++) {
          circle(g, 0, -10 + i * 28, 5, GOLD, OUT, 1);
        }
      },
    }),
    layer({
      id: "shipBell",
      parentId: "torso",
      tag: "physics",
      rest: { x: 55, y: 40 },
      zIndex: 4,
      draw: (g) => {
        g.moveTo(0, -20);
        g.lineTo(0, 0);
        g.stroke({ width: 3, color: OUT });
        ellipse(g, 0, 18, 18, 22, GOLD, OUT, 2);
        roundBox(g, -6, -4, 12, 8, 2, OUT);
      },
    }),
    layer({
      id: "leftUpperArm",
      parentId: "torso",
      tag: "leftUpperArm",
      rest: { x: -85, y: -20, rotation: 0.25 },
      draw: (g) => roundBox(g, -16, 0, 32, 55, 12, NAVY, OUT, 3),
    }),
    layer({
      id: "leftForearm",
      parentId: "leftUpperArm",
      tag: "leftForearm",
      rest: { y: 55 },
      draw: (g) => roundBox(g, -14, 0, 28, 45, 10, NAVY_DARK, OUT, 2),
    }),
    layer({
      id: "leftHand",
      parentId: "leftForearm",
      tag: "leftHand",
      rest: { y: 48 },
      draw: (g) => ellipse(g, 0, 0, 16, 18, SKIN, OUT, 2),
    }),
    layer({
      id: "rightUpperArm",
      parentId: "torso",
      tag: "rightUpperArm",
      rest: { x: 85, y: -20, rotation: -0.4 },
      zIndex: 2,
      draw: (g) => roundBox(g, -16, 0, 32, 55, 12, NAVY, OUT, 3),
    }),
    layer({
      id: "rightForearm",
      parentId: "rightUpperArm",
      tag: "rightForearm",
      rest: { y: 50, rotation: -0.6 },
      draw: (g) => roundBox(g, -14, 0, 28, 45, 10, NAVY_DARK, OUT, 2),
    }),
    layer({
      id: "rightHand",
      parentId: "rightForearm",
      tag: "rightHand",
      rest: { y: 48 },
      draw: (g) => {
        ellipse(g, 0, 0, 16, 18, SKIN, OUT, 2);
        // Shush finger
        g.moveTo(0, -10);
        g.lineTo(0, -32);
        g.stroke({ width: 5, color: SKIN });
      },
    }),
    layer({
      id: "head",
      parentId: "root",
      tag: "head",
      rest: { y: -50 },
      zIndex: 4,
      draw: (g) => {
        ellipse(g, 0, 0, 72, 78, SKIN, OUT, 3);
        // Hair fringe
        g.moveTo(-60, -20);
        g.quadraticCurveTo(-40, -70, 0, -75);
        g.quadraticCurveTo(40, -70, 60, -20);
        g.quadraticCurveTo(20, -40, 0, -45);
        g.quadraticCurveTo(-20, -40, -60, -20);
        g.closePath();
        g.fill({ color: BEARD });
        g.stroke({ width: 2, color: OUT });
      },
    }),
    layer({
      id: "jaw",
      parentId: "head",
      tag: "jaw",
      rest: { y: 50 },
      zIndex: 3,
      draw: (g) => {
        ellipse(g, 0, 10, 65, 45, BEARD, OUT, 2);
        ellipse(g, 0, -5, 40, 20, SKIN);
      },
    }),
    layer({
      id: "leftBrow",
      parentId: "head",
      tag: "leftBrow",
      rest: { x: -28, y: -35 },
      zIndex: 6,
      draw: (g) => {
        g.moveTo(-18, 4);
        g.quadraticCurveTo(0, -8, 18, 2);
        g.stroke({ width: 6, color: BROWN });
      },
    }),
    layer({
      id: "rightBrow",
      parentId: "head",
      tag: "rightBrow",
      rest: { x: 28, y: -35 },
      zIndex: 6,
      draw: (g) => {
        g.moveTo(-18, 2);
        g.quadraticCurveTo(0, -8, 18, 4);
        g.stroke({ width: 6, color: BROWN });
      },
    }),
    layer({
      id: "leftBrowUp",
      parentId: "head",
      tag: "leftBrow",
      rest: { x: -28, y: -48, rotation: -0.25 },
      visible: false,
      zIndex: 7,
      draw: (g) => {
        g.moveTo(-18, 4);
        g.quadraticCurveTo(0, -10, 18, 0);
        g.stroke({ width: 6, color: BROWN });
      },
    }),
    layer({
      id: "leftBrowSlam",
      parentId: "head",
      tag: "leftBrow",
      rest: { x: -28, y: -22, rotation: 0.2 },
      visible: false,
      zIndex: 7,
      draw: (g) => {
        g.moveTo(-18, -2);
        g.lineTo(18, 6);
        g.stroke({ width: 7, color: BROWN });
      },
    }),
    layer({
      id: "rightBrowSlam",
      parentId: "head",
      tag: "rightBrow",
      rest: { x: 28, y: -22, rotation: -0.2 },
      visible: false,
      zIndex: 7,
      draw: (g) => {
        g.moveTo(-18, 6);
        g.lineTo(18, -2);
        g.stroke({ width: 7, color: BROWN });
      },
    }),
    layer({
      id: "leftBrowSoft",
      parentId: "head",
      tag: "leftBrow",
      rest: { x: -28, y: -38 },
      visible: false,
      zIndex: 7,
      draw: (g) => {
        g.moveTo(-16, 2);
        g.quadraticCurveTo(0, 6, 16, 2);
        g.stroke({ width: 4, color: BROWN });
      },
    }),
    layer({
      id: "rightBrowSoft",
      parentId: "head",
      tag: "rightBrow",
      rest: { x: 28, y: -38 },
      visible: false,
      zIndex: 7,
      draw: (g) => {
        g.moveTo(-16, 2);
        g.quadraticCurveTo(0, 6, 16, 2);
        g.stroke({ width: 4, color: BROWN });
      },
    }),
    layer({
      id: "leftEye",
      parentId: "head",
      tag: "leftEye",
      rest: { x: -28, y: -12 },
      zIndex: 5,
      draw: (g) => ellipse(g, 0, 0, 18, 16, 0xffffff, OUT, 2),
    }),
    layer({
      id: "rightEye",
      parentId: "head",
      tag: "rightEye",
      rest: { x: 28, y: -12 },
      zIndex: 5,
      draw: (g) => ellipse(g, 0, 0, 18, 16, 0xffffff, OUT, 2),
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
      zIndex: 7,
      visible: false,
      draw: (g) => ellipse(g, 0, 0, 18, 16, SKIN, OUT, 2),
    }),
    layer({
      id: "rightEyelid",
      parentId: "rightEye",
      tag: "rightEyelid",
      zIndex: 7,
      visible: false,
      draw: (g) => ellipse(g, 0, 0, 18, 16, SKIN, OUT, 2),
    }),
    ...mouthLayers("jaw", { y: -5 }, 6),
  ],
};
