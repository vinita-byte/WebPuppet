import { circle, drawMouthShape, ellipse, roundBox } from "../drawHelpers";
import { layer, type CharacterDef } from "../types";

const OUT = 0x1f1630;
const SKIN = 0xffd6a8;
const PURPLE = 0x6c3ce0;
const GOLD = 0xf5c542;
const TEAL = 0x2ec4b6;

export const jester: CharacterDef = {
  id: "jester",
  name: "The Jester Co-Host",
  shortName: "Jester",
  description:
    "Cheeky WhatTheWeb jester — two-tone hat with bells, big eyes, bow tie.",
  accent: "#6c3ce0",
  fitHeight: 520,
  swapSets: [
    {
      id: "mouth",
      layers: ["mouthClosed", "mouthHalf", "mouthOpen", "mouthWide"],
      defaultLayerId: "mouthClosed",
    },
  ],
  triggers: [
    {
      id: "juggle",
      label: "Juggle Pose",
      key: "1",
      mode: "hold",
      showLayers: ["leftHandUp", "rightHandUp"],
    },
    {
      id: "laugh",
      label: "Laugh Mouth",
      key: "2",
      mode: "toggle",
      swapTo: { setId: "mouth", layerId: "mouthWide" },
    },
  ],
  physics: [
    { layerId: "bellLeft", stiffness: 28, damping: 4.5, gravity: 420, maxSwing: 0.9 },
    { layerId: "bellRight", stiffness: 28, damping: 4.5, gravity: 420, maxSwing: 0.9 },
    { layerId: "bellMid", stiffness: 32, damping: 5, gravity: 400, maxSwing: 0.7 },
  ],
  layers: [
    layer({ id: "root", parentId: null, tag: "root", draw: () => {} }),
    layer({
      id: "leftLeg",
      parentId: "root",
      tag: "leftLeg",
      rest: { x: -28, y: 175 },
      draw: (g) => {
        roundBox(g, -16, 0, 32, 70, 10, PURPLE, OUT, 3);
        roundBox(g, -20, 62, 40, 18, 8, GOLD, OUT, 2);
      },
    }),
    layer({
      id: "rightLeg",
      parentId: "root",
      tag: "rightLeg",
      rest: { x: 28, y: 175 },
      draw: (g) => {
        roundBox(g, -16, 0, 32, 70, 10, TEAL, OUT, 3);
        roundBox(g, -20, 62, 40, 18, 8, GOLD, OUT, 2);
      },
    }),
    layer({
      id: "torso",
      parentId: "root",
      tag: "torso",
      rest: { y: 70 },
      zIndex: 1,
      draw: (g) => {
        // Diamond harlequin torso
        g.moveTo(0, -70);
        g.lineTo(70, 10);
        g.lineTo(50, 95);
        g.lineTo(-50, 95);
        g.lineTo(-70, 10);
        g.closePath();
        g.fill({ color: PURPLE });
        g.stroke({ width: 4, color: OUT });
        g.moveTo(0, -70);
        g.lineTo(70, 10);
        g.lineTo(0, 95);
        g.closePath();
        g.fill({ color: TEAL });
      },
    }),
    layer({
      id: "bowTie",
      parentId: "torso",
      tag: "accessory",
      rest: { y: -55 },
      zIndex: 3,
      draw: (g) => {
        g.moveTo(-28, 0);
        g.lineTo(-6, -12);
        g.lineTo(-6, 12);
        g.closePath();
        g.fill({ color: GOLD });
        g.stroke({ width: 2, color: OUT });
        g.moveTo(28, 0);
        g.lineTo(6, -12);
        g.lineTo(6, 12);
        g.closePath();
        g.fill({ color: GOLD });
        g.stroke({ width: 2, color: OUT });
        circle(g, 0, 0, 7, 0xff6b4a, OUT, 2);
      },
    }),
    layer({
      id: "leftUpperArm",
      parentId: "torso",
      tag: "leftUpperArm",
      rest: { x: -78, y: -20, rotation: 0.25 },
      zIndex: 0,
      draw: (g) => roundBox(g, -14, 0, 28, 55, 12, PURPLE, OUT, 3),
    }),
    layer({
      id: "leftForearm",
      parentId: "leftUpperArm",
      tag: "leftForearm",
      rest: { y: 52, rotation: 0.15 },
      draw: (g) => roundBox(g, -12, 0, 24, 48, 10, TEAL, OUT, 3),
    }),
    layer({
      id: "leftHand",
      parentId: "leftForearm",
      tag: "leftHand",
      rest: { y: 48 },
      draw: (g) => ellipse(g, 0, 0, 18, 22, SKIN, OUT, 2),
    }),
    layer({
      id: "leftHandUp",
      parentId: "torso",
      tag: "leftHand",
      rest: { x: -95, y: -80, rotation: -0.9 },
      visible: false,
      zIndex: 5,
      draw: (g) => ellipse(g, 0, 0, 18, 22, SKIN, OUT, 2),
    }),
    layer({
      id: "rightUpperArm",
      parentId: "torso",
      tag: "rightUpperArm",
      rest: { x: 78, y: -20, rotation: -0.25 },
      zIndex: 0,
      draw: (g) => roundBox(g, -14, 0, 28, 55, 12, TEAL, OUT, 3),
    }),
    layer({
      id: "rightForearm",
      parentId: "rightUpperArm",
      tag: "rightForearm",
      rest: { y: 52, rotation: -0.15 },
      draw: (g) => roundBox(g, -12, 0, 24, 48, 10, PURPLE, OUT, 3),
    }),
    layer({
      id: "rightHand",
      parentId: "rightForearm",
      tag: "rightHand",
      rest: { y: 48 },
      draw: (g) => ellipse(g, 0, 0, 18, 22, SKIN, OUT, 2),
    }),
    layer({
      id: "rightHandUp",
      parentId: "torso",
      tag: "rightHand",
      rest: { x: 95, y: -80, rotation: 0.9 },
      visible: false,
      zIndex: 5,
      draw: (g) => ellipse(g, 0, 0, 18, 22, SKIN, OUT, 2),
    }),
    layer({
      id: "head",
      parentId: "root",
      tag: "head",
      rest: { y: -55 },
      zIndex: 4,
      draw: (g) => {
        ellipse(g, 0, 10, 88, 95, SKIN, OUT, 4);
        // Cheeks
        ellipse(g, -52, 28, 16, 10, 0xffb4a2);
        ellipse(g, 52, 28, 16, 10, 0xffb4a2);
      },
    }),
    layer({
      id: "hat",
      parentId: "head",
      tag: "hat",
      rest: { y: -85 },
      zIndex: 5,
      draw: (g) => {
        g.moveTo(-10, 40);
        g.lineTo(-95, -55);
        g.lineTo(-20, 10);
        g.closePath();
        g.fill({ color: PURPLE });
        g.stroke({ width: 3, color: OUT });
        g.moveTo(10, 40);
        g.lineTo(95, -55);
        g.lineTo(20, 10);
        g.closePath();
        g.fill({ color: TEAL });
        g.stroke({ width: 3, color: OUT });
        roundBox(g, -55, 28, 110, 22, 8, GOLD, OUT, 2);
      },
    }),
    layer({
      id: "bellLeft",
      parentId: "hat",
      tag: "physics",
      rest: { x: -95, y: -55 },
      zIndex: 6,
      draw: (g) => {
        circle(g, 0, 12, 12, GOLD, OUT, 2);
        g.moveTo(0, 0);
        g.lineTo(0, -18);
        g.stroke({ width: 3, color: OUT });
      },
    }),
    layer({
      id: "bellRight",
      parentId: "hat",
      tag: "physics",
      rest: { x: 95, y: -55 },
      zIndex: 6,
      draw: (g) => {
        circle(g, 0, 12, 12, GOLD, OUT, 2);
        g.moveTo(0, 0);
        g.lineTo(0, -18);
        g.stroke({ width: 3, color: OUT });
      },
    }),
    layer({
      id: "bellMid",
      parentId: "hat",
      tag: "physics",
      rest: { y: -20 },
      zIndex: 6,
      draw: (g) => circle(g, 0, 0, 10, 0xff6b4a, OUT, 2),
    }),
    layer({
      id: "leftEye",
      parentId: "head",
      tag: "leftEye",
      rest: { x: -34, y: -8 },
      zIndex: 5,
      draw: (g) => ellipse(g, 0, 0, 26, 30, 0xffffff, OUT, 3),
    }),
    layer({
      id: "rightEye",
      parentId: "head",
      tag: "rightEye",
      rest: { x: 34, y: -8 },
      zIndex: 5,
      draw: (g) => ellipse(g, 0, 0, 26, 30, 0xffffff, OUT, 3),
    }),
    layer({
      id: "leftEyelid",
      parentId: "leftEye",
      tag: "leftEyelid",
      zIndex: 7,
      visible: false,
      draw: (g) => ellipse(g, 0, 0, 26, 30, SKIN, OUT, 2),
    }),
    layer({
      id: "rightEyelid",
      parentId: "rightEye",
      tag: "rightEyelid",
      zIndex: 7,
      visible: false,
      draw: (g) => ellipse(g, 0, 0, 26, 30, SKIN, OUT, 2),
    }),
    layer({
      id: "leftPupil",
      parentId: "leftEye",
      tag: "leftPupil",
      zIndex: 6,
      draw: (g) => {
        circle(g, 0, 2, 11, OUT);
        circle(g, -3, -1, 3, 0xffffff);
      },
    }),
    layer({
      id: "rightPupil",
      parentId: "rightEye",
      tag: "rightPupil",
      zIndex: 6,
      draw: (g) => {
        circle(g, 0, 2, 11, OUT);
        circle(g, -3, -1, 3, 0xffffff);
      },
    }),
    layer({
      id: "jaw",
      parentId: "head",
      tag: "jaw",
      rest: { y: 70 },
      zIndex: 3,
      draw: (g) => ellipse(g, 0, 0, 48, 20, SKIN),
    }),
    ...(["mouthClosed", "mouthHalf", "mouthOpen", "mouthWide"] as const).map(
      (id, i) =>
        layer({
          id,
          parentId: "head",
          tag: "mouth",
          rest: { y: 48 },
          zIndex: 5,
          swapSet: "mouth",
          visible: i === 0,
          draw: (g) =>
            drawMouthShape(
              g,
              id === "mouthClosed"
                ? "closed"
                : id === "mouthHalf"
                  ? "half"
                  : id === "mouthOpen"
                    ? "open"
                    : "wide",
              OUT,
              0xff8fa3,
            ),
        }),
    ),
  ],
};
