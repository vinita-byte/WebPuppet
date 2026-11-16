import { circle, ellipse, roundBox } from "../../drawHelpers";
import { layer, type CharacterDef } from "../../types";
import { mouthLayers, mouthSwapSet, trigger } from "../../mouthKit";

const OUT = 0x2a3340;
const CLOUD = 0xb8c4d4;
const CLOUD_DARK = 0x8a98ae;
const BLUE = 0x3b82c4;
const CREAM = 0xf0f4f8;

export const nimbus: CharacterDef = {
  id: "nimbus",
  name: "Nimbus",
  shortName: "Nimbus",
  description:
    "Fluffy grey weather cloud with heavy eyelids, a blue tie, and a mic arm.",
  accent: "#3b82c4",
  fitHeight: 520,
  swapSets: [mouthSwapSet()],
  triggers: [
    trigger({
      id: "sigh",
      label: "Sigh",
      key: "1",
      mode: "hold",
      showLayers: ["sighPuff"],
    }),
    trigger({
      id: "sparkle",
      label: "Sparkle",
      key: "2",
      mode: "toggle",
      showLayers: ["sparkleEyes"],
    }),
  ],
  physics: [
    {
      layerId: "tie",
      stiffness: 42,
      damping: 5.5,
      gravity: 260,
      maxSwing: 0.5,
    },
  ],
  layers: [
    layer({ id: "root", parentId: null, tag: "root", draw: () => {} }),
    layer({
      id: "torso",
      parentId: "root",
      tag: "torso",
      rest: { y: 90 },
      zIndex: 1,
      draw: (g) => {
        ellipse(g, -50, 10, 55, 45, CLOUD, OUT, 3);
        ellipse(g, 50, 10, 55, 45, CLOUD, OUT, 3);
        ellipse(g, 0, 30, 70, 55, CLOUD_DARK, OUT, 3);
      },
    }),
    layer({
      id: "tie",
      parentId: "torso",
      tag: "physics",
      rest: { y: -10 },
      zIndex: 3,
      draw: (g) => {
        g.moveTo(0, -8);
        g.lineTo(-14, 8);
        g.lineTo(0, 55);
        g.lineTo(14, 8);
        g.closePath();
        g.fill({ color: BLUE });
        g.stroke({ width: 2, color: OUT });
        roundBox(g, -18, -14, 36, 12, 4, BLUE, OUT, 2);
      },
    }),
    layer({
      id: "leftUpperArm",
      parentId: "torso",
      tag: "leftUpperArm",
      rest: { x: -85, y: -10, rotation: 0.35 },
      draw: (g) => ellipse(g, 0, 30, 22, 40, CLOUD, OUT, 2),
    }),
    layer({
      id: "leftHand",
      parentId: "leftUpperArm",
      tag: "leftHand",
      rest: { y: 70 },
      draw: (g) => ellipse(g, 0, 0, 18, 16, CLOUD_DARK, OUT, 2),
    }),
    layer({
      id: "rightUpperArm",
      parentId: "torso",
      tag: "rightUpperArm",
      rest: { x: 90, y: -5, rotation: -0.55 },
      zIndex: 2,
      draw: (g) => {
        ellipse(g, 0, 28, 18, 36, CLOUD, OUT, 2);
        // Mic arm shaft
        g.moveTo(0, 55);
        g.lineTo(8, 95);
        g.stroke({ width: 4, color: OUT });
        circle(g, 10, 105, 14, 0x1a1a1a, OUT, 2);
        circle(g, 10, 105, 6, 0x555555);
      },
    }),
    layer({
      id: "rightHand",
      parentId: "rightUpperArm",
      tag: "rightHand",
      rest: { y: 60, x: 4 },
      draw: (g) => ellipse(g, 0, 0, 16, 14, CLOUD_DARK, OUT, 2),
    }),
    layer({
      id: "head",
      parentId: "root",
      tag: "head",
      rest: { y: -40 },
      zIndex: 4,
      draw: (g) => {
        ellipse(g, -70, 0, 60, 55, CLOUD, OUT, 3);
        ellipse(g, 70, 0, 60, 55, CLOUD, OUT, 3);
        ellipse(g, 0, -30, 75, 60, CLOUD, OUT, 3);
        ellipse(g, 0, 20, 90, 70, CLOUD, OUT, 3);
        ellipse(g, -40, -50, 40, 35, CREAM);
        ellipse(g, 40, -50, 40, 35, CREAM);
      },
    }),
    layer({
      id: "leftEye",
      parentId: "head",
      tag: "leftEye",
      rest: { x: -36, y: -8 },
      zIndex: 5,
      draw: (g) => ellipse(g, 0, 0, 22, 18, 0xffffff, OUT, 2),
    }),
    layer({
      id: "rightEye",
      parentId: "head",
      tag: "rightEye",
      rest: { x: 36, y: -8 },
      zIndex: 5,
      draw: (g) => ellipse(g, 0, 0, 22, 18, 0xffffff, OUT, 2),
    }),
    layer({
      id: "leftPupil",
      parentId: "leftEye",
      tag: "leftPupil",
      zIndex: 6,
      draw: (g) => {
        circle(g, 0, 2, 8, OUT);
        circle(g, -2, -1, 2, 0xffffff);
      },
    }),
    layer({
      id: "rightPupil",
      parentId: "rightEye",
      tag: "rightPupil",
      zIndex: 6,
      draw: (g) => {
        circle(g, 0, 2, 8, OUT);
        circle(g, -2, -1, 2, 0xffffff);
      },
    }),
    layer({
      id: "leftEyelid",
      parentId: "leftEye",
      tag: "leftEyelid",
      zIndex: 7,
      draw: (g) => {
        g.ellipse(0, -6, 24, 14);
        g.fill({ color: CLOUD_DARK });
        g.stroke({ width: 2, color: OUT });
      },
    }),
    layer({
      id: "rightEyelid",
      parentId: "rightEye",
      tag: "rightEyelid",
      zIndex: 7,
      draw: (g) => {
        g.ellipse(0, -6, 24, 14);
        g.fill({ color: CLOUD_DARK });
        g.stroke({ width: 2, color: OUT });
      },
    }),
    layer({
      id: "sparkleEyes",
      parentId: "head",
      tag: "accessory",
      rest: { y: -8 },
      visible: false,
      zIndex: 8,
      draw: (g) => {
        for (const [x, y] of [
          [-55, -30],
          [-20, -35],
          [20, -35],
          [55, -30],
          [0, -50],
        ] as const) {
          g.moveTo(x, y - 8);
          g.lineTo(x + 3, y);
          g.lineTo(x, y + 8);
          g.lineTo(x - 3, y);
          g.closePath();
          g.fill({ color: 0xffe066 });
        }
      },
    }),
    layer({
      id: "sighPuff",
      parentId: "head",
      tag: "other",
      rest: { x: 70, y: 40 },
      visible: false,
      zIndex: 6,
      draw: (g) => {
        ellipse(g, 0, 0, 18, 12, CREAM, OUT, 1);
        ellipse(g, 22, -6, 12, 8, CREAM, OUT, 1);
        ellipse(g, 38, -10, 8, 5, CREAM, OUT, 1);
      },
    }),
    layer({
      id: "jaw",
      parentId: "head",
      tag: "jaw",
      rest: { y: 55 },
      draw: (g) => ellipse(g, 0, 0, 50, 22, CLOUD_DARK, OUT, 2),
    }),
    ...mouthLayers("head", { y: 32 }, 6),
  ],
};
