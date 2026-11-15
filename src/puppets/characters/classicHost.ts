import { circle, drawMouthShape, ellipse, roundBox } from "../drawHelpers";
import { layer, type CharacterDef } from "../types";

export const classicHost: CharacterDef = {
  id: "classic-host",
  name: "Classic Host",
  shortName: "Classic",
  description: "Original peach toned sample host with hierarchical face layers.",
  accent: "#38bdf8",
  fitHeight: 420,
  swapSets: [
    {
      id: "mouth",
      layers: ["mouthClosed", "mouthHalf", "mouthOpen", "mouthWide"],
      defaultLayerId: "mouthClosed",
    },
  ],
  triggers: [
    {
      id: "wave",
      label: "Wave",
      key: "1",
      mode: "hold",
      showLayers: ["leftHandWave"],
    },
    {
      id: "point",
      label: "Point",
      key: "2",
      mode: "hold",
      showLayers: ["rightHandPoint"],
    },
  ],
  physics: [],
  layers: [
    layer({ id: "root", parentId: null, tag: "root", draw: () => {} }),
    layer({
      id: "torso",
      parentId: "root",
      tag: "torso",
      rest: { y: 90 },
      zIndex: 0,
      draw: (g) => {
        roundBox(g, -55, -40, 110, 120, 28, 0x2b4c7e, 0x14233a);
      },
    }),
    layer({
      id: "head",
      parentId: "root",
      tag: "head",
      rest: { y: -40 },
      zIndex: 2,
      draw: (g) => {
        roundBox(g, -110, -130, 220, 250, 90, 0xf2c9a0, 0xc48a5a);
        ellipse(g, -118, -10, 22, 32, 0xe8b890);
        ellipse(g, 118, -10, 22, 32, 0xe8b890);
        g.moveTo(0, -5);
        g.lineTo(-10, 28);
        g.lineTo(10, 28);
        g.closePath();
        g.fill({ color: 0xd9a07a });
      },
    }),
    layer({
      id: "jaw",
      parentId: "head",
      tag: "jaw",
      rest: { y: 78 },
      zIndex: 1,
      draw: (g) => ellipse(g, 0, 0, 70, 28, 0xe8b890),
    }),
    layer({
      id: "leftEye",
      parentId: "head",
      tag: "leftEye",
      rest: { x: -42, y: -28 },
      zIndex: 3,
      draw: (g) => ellipse(g, 0, 0, 28, 22, 0xffffff, 0x3a2a1f, 2),
    }),
    layer({
      id: "rightEye",
      parentId: "head",
      tag: "rightEye",
      rest: { x: 42, y: -28 },
      zIndex: 3,
      draw: (g) => ellipse(g, 0, 0, 28, 22, 0xffffff, 0x3a2a1f, 2),
    }),
    layer({
      id: "leftEyelid",
      parentId: "leftEye",
      tag: "leftEyelid",
      zIndex: 5,
      visible: false,
      draw: (g) => ellipse(g, 0, 0, 28, 22, 0xf2c9a0, 0xc48a5a, 2),
    }),
    layer({
      id: "rightEyelid",
      parentId: "rightEye",
      tag: "rightEyelid",
      zIndex: 5,
      visible: false,
      draw: (g) => ellipse(g, 0, 0, 28, 22, 0xf2c9a0, 0xc48a5a, 2),
    }),
    layer({
      id: "leftPupil",
      parentId: "leftEye",
      tag: "leftPupil",
      zIndex: 4,
      draw: (g) => {
        circle(g, 0, 0, 10, 0x1c1410);
        circle(g, -3, -3, 3, 0xffffff);
      },
    }),
    layer({
      id: "rightPupil",
      parentId: "rightEye",
      tag: "rightPupil",
      zIndex: 4,
      draw: (g) => {
        circle(g, 0, 0, 10, 0x1c1410);
        circle(g, -3, -3, 3, 0xffffff);
      },
    }),
    layer({
      id: "mouthClosed",
      parentId: "head",
      tag: "mouth",
      rest: { y: 48 },
      zIndex: 3,
      swapSet: "mouth",
      draw: (g) => drawMouthShape(g, "closed"),
    }),
    layer({
      id: "mouthHalf",
      parentId: "head",
      tag: "mouth",
      rest: { y: 48 },
      zIndex: 3,
      swapSet: "mouth",
      visible: false,
      draw: (g) => drawMouthShape(g, "half"),
    }),
    layer({
      id: "mouthOpen",
      parentId: "head",
      tag: "mouth",
      rest: { y: 48 },
      zIndex: 3,
      swapSet: "mouth",
      visible: false,
      draw: (g) => drawMouthShape(g, "open"),
    }),
    layer({
      id: "mouthWide",
      parentId: "head",
      tag: "mouth",
      rest: { y: 48 },
      zIndex: 3,
      swapSet: "mouth",
      visible: false,
      draw: (g) => drawMouthShape(g, "wide"),
    }),
    layer({
      id: "leftHandWave",
      parentId: "torso",
      tag: "leftHand",
      rest: { x: -90, y: -20, rotation: -0.6 },
      zIndex: 4,
      visible: false,
      draw: (g) => {
        ellipse(g, 0, 0, 22, 28, 0xf2c9a0, 0xc48a5a, 2);
        g.moveTo(-8, -30);
        g.lineTo(-4, -52);
        g.stroke({ width: 4, color: 0xf2c9a0 });
        g.moveTo(0, -30);
        g.lineTo(4, -54);
        g.stroke({ width: 4, color: 0xf2c9a0 });
        g.moveTo(8, -28);
        g.lineTo(14, -50);
        g.stroke({ width: 4, color: 0xf2c9a0 });
      },
    }),
    layer({
      id: "rightHandPoint",
      parentId: "torso",
      tag: "rightHand",
      rest: { x: 95, y: -10, rotation: 0.4 },
      zIndex: 4,
      visible: false,
      draw: (g) => {
        ellipse(g, 0, 0, 20, 26, 0xf2c9a0, 0xc48a5a, 2);
        g.moveTo(8, -20);
        g.lineTo(34, -48);
        g.stroke({ width: 5, color: 0xf2c9a0 });
      },
    }),
  ],
};
