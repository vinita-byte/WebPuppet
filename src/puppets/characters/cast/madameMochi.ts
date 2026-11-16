import { circle, ellipse, roundBox } from "../../drawHelpers";
import { layer, type CharacterDef } from "../../types";
import { mouthLayers, mouthSwapSet, trigger } from "../../mouthKit";

const OUT = 0x4a3040;
const PEARL = 0xfff5f0;
const PEARL_SHADE = 0xf0d8d0;
const PINK = 0xff8fab;
const ROSE = 0xf4a4b8;
const FAN = 0xffcfd9;
const BOOK = 0x6b4f3a;

export const madameMochi: CharacterDef = {
  id: "madame-mochi",
  name: "Madame Mochi",
  shortName: "Mochi",
  description:
    "Pearly dumpling body with rosy cheeks, a pink bow, a fan, and a book balanced on her head.",
  accent: "#ff8fab",
  fitHeight: 500,
  swapSets: [mouthSwapSet()],
  triggers: [
    trigger({
      id: "laughWobble",
      label: "Laugh Wobble",
      key: "1",
      mode: "hold",
      showLayers: ["wobbleBody"],
    }),
    trigger({
      id: "dropBook",
      label: "Drop Book",
      key: "2",
      mode: "toggle",
      showLayers: ["bookDropped"],
    }),
  ],
  physics: [
    {
      layerId: "bookOnHead",
      stiffness: 38,
      damping: 5,
      gravity: 300,
      maxSwing: 0.55,
    },
  ],
  layers: [
    layer({ id: "root", parentId: null, tag: "root", draw: () => {} }),
    layer({
      id: "torso",
      parentId: "root",
      tag: "torso",
      rest: { y: 80 },
      zIndex: 1,
      draw: (g) => {
        ellipse(g, 0, 10, 100, 95, PEARL, OUT, 3);
        ellipse(g, 0, 40, 70, 50, PEARL_SHADE);
      },
    }),
    layer({
      id: "wobbleBody",
      parentId: "root",
      tag: "other",
      rest: { y: 80, scaleX: 1.08, scaleY: 0.92 },
      visible: false,
      zIndex: 2,
      draw: (g) => {
        ellipse(g, 0, 10, 110, 88, PEARL, OUT, 3);
        ellipse(g, -40, 20, 18, 12, ROSE);
        ellipse(g, 40, 20, 18, 12, ROSE);
      },
    }),
    layer({
      id: "leftUpperArm",
      parentId: "torso",
      tag: "leftUpperArm",
      rest: { x: -95, y: -20, rotation: 0.4 },
      draw: (g) => ellipse(g, 0, 28, 22, 38, PEARL, OUT, 2),
    }),
    layer({
      id: "leftHand",
      parentId: "leftUpperArm",
      tag: "leftHand",
      rest: { y: 65 },
      draw: (g) => ellipse(g, 0, 0, 18, 16, PEARL_SHADE, OUT, 2),
    }),
    layer({
      id: "rightUpperArm",
      parentId: "torso",
      tag: "rightUpperArm",
      rest: { x: 95, y: -15, rotation: -0.5 },
      zIndex: 3,
      draw: (g) => ellipse(g, 0, 28, 22, 38, PEARL, OUT, 2),
    }),
    layer({
      id: "rightHand",
      parentId: "rightUpperArm",
      tag: "rightHand",
      rest: { y: 65 },
      draw: (g) => {
        ellipse(g, 0, 0, 18, 16, PEARL_SHADE, OUT, 2);
        // Fan
        for (let i = -2; i <= 2; i++) {
          g.moveTo(0, 0);
          g.lineTo(i * 14, -40);
          g.stroke({ width: 2, color: PINK });
        }
        g.moveTo(-28, -38);
        g.quadraticCurveTo(0, -55, 28, -38);
        g.stroke({ width: 3, color: FAN });
        roundBox(g, -4, -8, 8, 20, 2, 0xd4a017, OUT, 1);
      },
    }),
    layer({
      id: "head",
      parentId: "root",
      tag: "head",
      rest: { y: -35 },
      zIndex: 4,
      draw: (g) => {
        ellipse(g, 0, 0, 85, 75, PEARL, OUT, 3);
        ellipse(g, -48, 18, 18, 12, ROSE);
        ellipse(g, 48, 18, 18, 12, ROSE);
      },
    }),
    layer({
      id: "bow",
      parentId: "head",
      tag: "hat",
      rest: { x: -55, y: -45, rotation: -0.3 },
      zIndex: 6,
      draw: (g) => {
        g.moveTo(-22, 0);
        g.lineTo(-4, -14);
        g.lineTo(-4, 14);
        g.closePath();
        g.fill({ color: PINK });
        g.stroke({ width: 2, color: OUT });
        g.moveTo(22, 0);
        g.lineTo(4, -14);
        g.lineTo(4, 14);
        g.closePath();
        g.fill({ color: PINK });
        g.stroke({ width: 2, color: OUT });
        circle(g, 0, 0, 7, ROSE, OUT, 2);
      },
    }),
    layer({
      id: "bookOnHead",
      parentId: "head",
      tag: "physics",
      rest: { y: -70 },
      zIndex: 7,
      draw: (g) => {
        roundBox(g, -40, -12, 80, 24, 3, BOOK, OUT, 2);
        roundBox(g, -38, -10, 8, 20, 2, 0xc9a227);
        g.moveTo(-28, -6);
        g.lineTo(30, -6);
        g.stroke({ width: 1, color: 0xe8d5b5 });
      },
    }),
    layer({
      id: "bookDropped",
      parentId: "root",
      tag: "accessory",
      rest: { x: 110, y: 160, rotation: 0.6 },
      visible: false,
      zIndex: 5,
      draw: (g) => {
        roundBox(g, -40, -12, 80, 24, 3, BOOK, OUT, 2);
        roundBox(g, -38, -10, 8, 20, 2, 0xc9a227);
      },
    }),
    layer({
      id: "leftEye",
      parentId: "head",
      tag: "leftEye",
      rest: { x: -28, y: -10 },
      zIndex: 5,
      draw: (g) => ellipse(g, 0, 0, 16, 20, 0xffffff, OUT, 2),
    }),
    layer({
      id: "rightEye",
      parentId: "head",
      tag: "rightEye",
      rest: { x: 28, y: -10 },
      zIndex: 5,
      draw: (g) => ellipse(g, 0, 0, 16, 20, 0xffffff, OUT, 2),
    }),
    layer({
      id: "leftPupil",
      parentId: "leftEye",
      tag: "leftPupil",
      zIndex: 6,
      draw: (g) => {
        circle(g, 0, 2, 7, OUT);
        circle(g, -2, -1, 2, 0xffffff);
      },
    }),
    layer({
      id: "rightPupil",
      parentId: "rightEye",
      tag: "rightPupil",
      zIndex: 6,
      draw: (g) => {
        circle(g, 0, 2, 7, OUT);
        circle(g, -2, -1, 2, 0xffffff);
      },
    }),
    layer({
      id: "leftEyelid",
      parentId: "leftEye",
      tag: "leftEyelid",
      zIndex: 7,
      visible: false,
      draw: (g) => ellipse(g, 0, 0, 16, 20, PEARL, OUT, 2),
    }),
    layer({
      id: "rightEyelid",
      parentId: "rightEye",
      tag: "rightEyelid",
      zIndex: 7,
      visible: false,
      draw: (g) => ellipse(g, 0, 0, 16, 20, PEARL, OUT, 2),
    }),
    layer({
      id: "jaw",
      parentId: "head",
      tag: "jaw",
      rest: { y: 48 },
      draw: (g) => ellipse(g, 0, 0, 40, 18, PEARL_SHADE),
    }),
    ...mouthLayers("head", { y: 28 }, 6),
  ],
};
