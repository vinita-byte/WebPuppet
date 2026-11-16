import { circle, ellipse, roundBox } from "../../drawHelpers";
import { layer, type CharacterDef } from "../../types";
import { mouthLayers, mouthSwapSet, trigger } from "../../mouthKit";

const OUT = 0x2a2030;

function squadBase(
  body: number,
  bodyDark: number,
  accent: number,
): CharacterDef["layers"] {
  return [
    layer({ id: "root", parentId: null, tag: "root", draw: () => {} }),
    layer({
      id: "leftLeg",
      parentId: "root",
      tag: "leftLeg",
      rest: { x: -20, y: 130 },
      draw: (g) => {
        roundBox(g, -10, 0, 20, 40, 6, bodyDark, OUT, 2);
        ellipse(g, 0, 40, 14, 8, bodyDark, OUT, 2);
      },
    }),
    layer({
      id: "rightLeg",
      parentId: "root",
      tag: "rightLeg",
      rest: { x: 20, y: 130 },
      draw: (g) => {
        roundBox(g, -10, 0, 20, 40, 6, bodyDark, OUT, 2);
        ellipse(g, 0, 40, 14, 8, bodyDark, OUT, 2);
      },
    }),
    layer({
      id: "torso",
      parentId: "root",
      tag: "torso",
      rest: { y: 55 },
      zIndex: 1,
      draw: (g) => {
        ellipse(g, 0, 15, 55, 60, body, OUT, 3);
        ellipse(g, 0, 30, 30, 28, bodyDark);
      },
    }),
    layer({
      id: "leftUpperArm",
      parentId: "torso",
      tag: "leftUpperArm",
      rest: { x: -55, y: -5, rotation: 0.4 },
      draw: (g) => ellipse(g, 0, 18, 14, 24, body, OUT, 2),
    }),
    layer({
      id: "leftHand",
      parentId: "leftUpperArm",
      tag: "leftHand",
      rest: { y: 42 },
      draw: (g) => circle(g, 0, 0, 12, bodyDark, OUT, 2),
    }),
    layer({
      id: "rightUpperArm",
      parentId: "torso",
      tag: "rightUpperArm",
      rest: { x: 55, y: -5, rotation: -0.4 },
      draw: (g) => ellipse(g, 0, 18, 14, 24, body, OUT, 2),
    }),
    layer({
      id: "rightHand",
      parentId: "rightUpperArm",
      tag: "rightHand",
      rest: { y: 42 },
      draw: (g) => circle(g, 0, 0, 12, bodyDark, OUT, 2),
    }),
    layer({
      id: "teamPoseArms",
      parentId: "torso",
      tag: "accessory",
      rest: { y: -50 },
      visible: false,
      zIndex: 6,
      draw: (g) => {
        ellipse(g, -50, 10, 16, 28, body, OUT, 2);
        ellipse(g, 50, 10, 16, 28, body, OUT, 2);
        circle(g, -50, -15, 12, bodyDark, OUT, 2);
        circle(g, 50, -15, 12, bodyDark, OUT, 2);
        // Star sparkle between raised hands
        g.moveTo(0, -30);
        g.lineTo(4, -18);
        g.lineTo(16, -18);
        g.lineTo(6, -10);
        g.lineTo(10, 2);
        g.lineTo(0, -6);
        g.lineTo(-10, 2);
        g.lineTo(-6, -10);
        g.lineTo(-16, -18);
        g.lineTo(-4, -18);
        g.closePath();
        g.fill({ color: accent });
        g.stroke({ width: 2, color: OUT });
      },
    }),
    layer({
      id: "head",
      parentId: "root",
      tag: "head",
      rest: { y: -40 },
      zIndex: 4,
      draw: (g) => ellipse(g, 0, 0, 58, 55, body, OUT, 3),
    }),
    layer({
      id: "cape",
      parentId: "torso",
      tag: "physics",
      rest: { y: -20 },
      zIndex: 0,
      draw: (g) => {
        g.moveTo(-30, 0);
        g.lineTo(-50, 70);
        g.lineTo(0, 55);
        g.lineTo(50, 70);
        g.lineTo(30, 0);
        g.closePath();
        g.fill({ color: accent });
        g.stroke({ width: 2, color: OUT });
      },
    }),
    layer({
      id: "leftEye",
      parentId: "head",
      tag: "leftEye",
      rest: { x: -20, y: -8 },
      zIndex: 5,
      draw: (g) => circle(g, 0, 0, 14, 0xffffff, OUT, 2),
    }),
    layer({
      id: "rightEye",
      parentId: "head",
      tag: "rightEye",
      rest: { x: 20, y: -8 },
      zIndex: 5,
      draw: (g) => circle(g, 0, 0, 14, 0xffffff, OUT, 2),
    }),
    layer({
      id: "leftPupil",
      parentId: "leftEye",
      tag: "leftPupil",
      zIndex: 6,
      draw: (g) => {
        circle(g, 0, 1, 6, OUT);
        circle(g, -2, -1, 2, 0xffffff);
      },
    }),
    layer({
      id: "rightPupil",
      parentId: "rightEye",
      tag: "rightPupil",
      zIndex: 6,
      draw: (g) => {
        circle(g, 0, 1, 6, OUT);
        circle(g, -2, -1, 2, 0xffffff);
      },
    }),
    layer({
      id: "leftEyelid",
      parentId: "leftEye",
      tag: "leftEyelid",
      zIndex: 7,
      visible: false,
      draw: (g) => circle(g, 0, 0, 14, body, OUT, 2),
    }),
    layer({
      id: "rightEyelid",
      parentId: "rightEye",
      tag: "rightEyelid",
      zIndex: 7,
      visible: false,
      draw: (g) => circle(g, 0, 0, 14, body, OUT, 2),
    }),
    layer({
      id: "jaw",
      parentId: "head",
      tag: "jaw",
      rest: { y: 38 },
      draw: (g) => ellipse(g, 0, 0, 30, 14, bodyDark),
    }),
    ...mouthLayers("head", { y: 22 }, 6),
  ];
}

const YELLOW = 0xf5d76e;
const YELLOW_DARK = 0xd4b44a;
const SUN = 0xff9f43;

export const bubbles: CharacterDef = {
  id: "bubbles",
  name: "Bubbles",
  shortName: "Bubbles",
  description:
    "Sunny yellow sparkle squad member with sparkle cheeks, a cape, and stubby arms.",
  accent: "#f5d76e",
  fitHeight: 480,
  swapSets: [mouthSwapSet()],
  triggers: [
    trigger({
      id: "teamPose",
      label: "Team Pose",
      key: "1",
      mode: "hold",
      showLayers: ["teamPoseArms"],
    }),
    trigger({
      id: "cheerBounce",
      label: "Cheer Bounce",
      key: "2",
      mode: "hold",
      showLayers: ["cheerSparkles"],
    }),
  ],
  physics: [
    {
      layerId: "cape",
      stiffness: 32,
      damping: 4,
      gravity: 250,
      maxSwing: 0.8,
    },
  ],
  layers: [
    ...squadBase(YELLOW, YELLOW_DARK, SUN),
    layer({
      id: "sparkleCheeks",
      parentId: "head",
      tag: "accessory",
      rest: { y: 12 },
      zIndex: 8,
      draw: (g) => {
        for (const x of [-38, 38]) {
          g.moveTo(x, -6);
          g.lineTo(x + 3, 0);
          g.lineTo(x, 6);
          g.lineTo(x - 3, 0);
          g.closePath();
          g.fill({ color: 0xff6b9d });
          circle(g, x, 8, 8, 0xffb4c4);
        }
      },
    }),
    layer({
      id: "cheerSparkles",
      parentId: "head",
      tag: "other",
      rest: { y: -50 },
      visible: false,
      zIndex: 9,
      draw: (g) => {
        for (const [x, y] of [
          [-30, 0],
          [0, -12],
          [30, 0],
        ] as const) {
          g.moveTo(x, y - 6);
          g.lineTo(x + 2, y);
          g.lineTo(x, y + 6);
          g.lineTo(x - 2, y);
          g.closePath();
          g.fill({ color: SUN });
        }
      },
    }),
  ],
};

const RED = 0xe74c3c;
const RED_DARK = 0xb03a2e;
const CLIP = 0xf5f0e6;

export const bossy: CharacterDef = {
  id: "bossy",
  name: "Bossy",
  shortName: "Bossy",
  description:
    "Bold red sparkle squad member with a clipboard, cape, and team pose energy.",
  accent: "#e74c3c",
  fitHeight: 480,
  swapSets: [mouthSwapSet()],
  triggers: [
    trigger({
      id: "teamPose",
      label: "Team Pose",
      key: "1",
      mode: "hold",
      showLayers: ["teamPoseArms"],
    }),
    trigger({
      id: "clipboardWave",
      label: "Clipboard Wave",
      key: "2",
      mode: "hold",
      showLayers: ["clipboardWave"],
    }),
  ],
  physics: [
    {
      layerId: "cape",
      stiffness: 34,
      damping: 4.5,
      gravity: 260,
      maxSwing: 0.75,
    },
  ],
  layers: [
    ...squadBase(RED, RED_DARK, 0xf5c542),
    layer({
      id: "clipboard",
      parentId: "rightHand",
      tag: "accessory",
      rest: { x: 8, y: 5, rotation: 0.2 },
      zIndex: 5,
      draw: (g) => {
        roundBox(g, -18, -28, 36, 48, 3, CLIP, OUT, 2);
        roundBox(g, -8, -32, 16, 8, 2, 0x888888, OUT, 1);
        for (let i = 0; i < 4; i++) {
          g.moveTo(-12, -16 + i * 10);
          g.lineTo(12, -16 + i * 10);
          g.stroke({ width: 1, color: 0xaaaaaa });
        }
      },
    }),
    layer({
      id: "clipboardWave",
      parentId: "torso",
      tag: "rightHand",
      rest: { x: 70, y: -60, rotation: -0.8 },
      visible: false,
      zIndex: 7,
      draw: (g) => {
        circle(g, 0, 20, 12, RED_DARK, OUT, 2);
        roundBox(g, -18, -30, 36, 48, 3, CLIP, OUT, 2);
        roundBox(g, -8, -34, 16, 8, 2, 0x888888, OUT, 1);
      },
    }),
  ],
};

const PURPLE = 0x5b2c6f;
const PURPLE_DARK = 0x3d1a4a;
const BUNNY = 0xf5e6d8;

export const grumble: CharacterDef = {
  id: "grumble",
  name: "Grumble",
  shortName: "Grumble",
  description:
    "Deep purple sparkle squad member with scowl brows and a stuffed bunny hidden for soft moments.",
  accent: "#5b2c6f",
  fitHeight: 480,
  swapSets: [mouthSwapSet()],
  triggers: [
    trigger({
      id: "teamPose",
      label: "Team Pose",
      key: "1",
      mode: "hold",
      showLayers: ["teamPoseArms"],
    }),
    trigger({
      id: "bunny",
      label: "Bunny",
      key: "2",
      mode: "toggle",
      showLayers: ["stuffedBunny"],
    }),
  ],
  physics: [
    {
      layerId: "cape",
      stiffness: 30,
      damping: 5,
      gravity: 270,
      maxSwing: 0.7,
    },
  ],
  layers: [
    ...squadBase(PURPLE, PURPLE_DARK, 0x9b59b6),
    layer({
      id: "leftBrow",
      parentId: "head",
      tag: "leftBrow",
      rest: { x: -20, y: -28, rotation: 0.25 },
      zIndex: 6,
      draw: (g) => {
        g.moveTo(-14, -2);
        g.lineTo(14, 6);
        g.stroke({ width: 5, color: OUT });
      },
    }),
    layer({
      id: "rightBrow",
      parentId: "head",
      tag: "rightBrow",
      rest: { x: 20, y: -28, rotation: -0.25 },
      zIndex: 6,
      draw: (g) => {
        g.moveTo(-14, 6);
        g.lineTo(14, -2);
        g.stroke({ width: 5, color: OUT });
      },
    }),
    layer({
      id: "stuffedBunny",
      parentId: "torso",
      tag: "accessory",
      rest: { x: -70, y: 20 },
      visible: false,
      zIndex: 8,
      draw: (g) => {
        ellipse(g, 0, 10, 22, 26, BUNNY, OUT, 2);
        ellipse(g, -10, -20, 8, 18, BUNNY, OUT, 2);
        ellipse(g, 10, -20, 8, 18, BUNNY, OUT, 2);
        ellipse(g, -10, -22, 4, 10, 0xffb4c4);
        ellipse(g, 10, -22, 4, 10, 0xffb4c4);
        circle(g, -6, 5, 3, OUT);
        circle(g, 6, 5, 3, OUT);
        ellipse(g, 0, 12, 5, 3, 0xff8fab);
      },
    }),
  ],
};
