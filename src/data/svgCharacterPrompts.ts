export interface SvgPromptIdea {
  id: string;
  title: string;
  vibe: string;
  prompt: string;
  layers: string[];
  tip: string;
}

/**
 * Ready to copy ideas for authors building outside SVG puppets
 * that import as .webpuppet.zip packages.
 */
export const SVG_CHARACTER_PROMPTS: SvgPromptIdea[] = [
  {
    id: "neon-ramen-fox",
    title: "Neon ramen fox",
    vibe: "Late night diner mascot",
    prompt:
      "Design a layered SVG fox chef with a bowl hat, chopsticks as arms, and five mouth shapes for slurping. Keep each ear, eyelid, and the steam swirl on its own layer.",
    layers: [
      "root",
      "torso",
      "head",
      "leftEar",
      "rightEar",
      "leftEye",
      "rightEye",
      "leftEyelid",
      "rightEyelid",
      "mouthClosed",
      "mouthOpen",
      "mouthOh",
      "mouthSmile",
      "mouthTongue",
      "steam",
      "chopsticks",
    ],
    tip: "Animate steam with a soft physics tag so it sways while talking.",
  },
  {
    id: "library-moth",
    title: "Library moth scholar",
    vibe: "Quietly dramatic",
    prompt:
      "Draw a moth librarian in SVG. Dusty lavender wings on separate layers, tiny spectacles, a bookmark scarf, and a full lip sync mouth set for whispered facts.",
    layers: [
      "root",
      "torso",
      "leftWing",
      "rightWing",
      "head",
      "glasses",
      "scarf",
      "mouthClosed",
      "mouthOpen",
      "mouthOh",
      "mouthSmile",
      "mouthTongue",
    ],
    tip: "Put wings under physics so they flutter on head turns.",
  },
  {
    id: "subway-pickle",
    title: "Subway pickle DJ",
    vibe: "Loud and crunchy",
    prompt:
      "Create a pickle character with headphone eyes, a turntable torso, and arms that can crossfade. Include closed, open, oh, smile, and tongue mouth layers.",
    layers: [
      "root",
      "torso",
      "head",
      "leftArm",
      "rightArm",
      "headphones",
      "mouthClosed",
      "mouthOpen",
      "mouthOh",
      "mouthSmile",
      "mouthTongue",
    ],
    tip: "Use a swap set for leftArm and rightArm dance poses.",
  },
  {
    id: "garden-gnome-ceo",
    title: "Garden gnome CEO",
    vibe: "Tiny but serious",
    prompt:
      "SVG gnome in a tiny suit, oversized red hat on its own layer, bushy brows that act, and a briefcase prop. Add the five mouth shapes for boardroom pep talks.",
    layers: [
      "root",
      "torso",
      "head",
      "hat",
      "leftBrow",
      "rightBrow",
      "briefcase",
      "mouthClosed",
      "mouthOpen",
      "mouthOh",
      "mouthSmile",
      "mouthTongue",
    ],
    tip: "Brows should be separate layers. They sell suspicion better than the mouth.",
  },
  {
    id: "toast-ghost",
    title: "Toast ghost roommate",
    vibe: "Soft horror comedy",
    prompt:
      "Design a slice of toast that is also a friendly ghost. Crust outline, jelly cheeks, floating crumb particles, and lip sync mouths that look stamped on butter.",
    layers: [
      "root",
      "body",
      "head",
      "leftCheek",
      "rightCheek",
      "crumbs",
      "mouthClosed",
      "mouthOpen",
      "mouthOh",
      "mouthSmile",
      "mouthTongue",
    ],
    tip: "Export each mouth as its own SVG file named to match puppet.json layer ids.",
  },
  {
    id: "balloon-detective",
    title: "Balloon detective",
    vibe: "Mystery that floats away",
    prompt:
      "A round balloon detective with a trench coat string, magnifying glass hand, and a knot for a chin. Mouth shapes should stretch the balloon rubber.",
    layers: [
      "root",
      "torso",
      "head",
      "coat",
      "leftHand",
      "rightHand",
      "glass",
      "mouthClosed",
      "mouthOpen",
      "mouthOh",
      "mouthSmile",
      "mouthTongue",
    ],
    tip: "Keep the string under physics so it bobs when the head nods.",
  },
  {
    id: "cactus-barista",
    title: "Cactus barista",
    vibe: "Spiky but sweet",
    prompt:
      "SVG cactus with an apron, espresso cup arms, flower hat, and blinking spines as eyelid accents. Include the standard five mouth shapes for order callouts.",
    layers: [
      "root",
      "torso",
      "head",
      "flower",
      "apron",
      "leftArm",
      "rightArm",
      "leftEyelid",
      "rightEyelid",
      "mouthClosed",
      "mouthOpen",
      "mouthOh",
      "mouthSmile",
      "mouthTongue",
    ],
    tip: "Name files assets/layers/mouthClosed.svg and so on so import maps automatically.",
  },
  {
    id: "origami-dragon",
    title: "Origami office dragon",
    vibe: "Folded ambition",
    prompt:
      "Make a paper dragon from crisp geometric SVG paths. Separate wing folds, a stapler tail, and mouth shapes that look like folded paper cones.",
    layers: [
      "root",
      "torso",
      "head",
      "leftWing",
      "rightWing",
      "tail",
      "mouthClosed",
      "mouthOpen",
      "mouthOh",
      "mouthSmile",
      "mouthTongue",
    ],
    tip: "Hard edges work great. Avoid soft blurs so the puppet stays sharp on camera.",
  },
];

export const SVG_PACKAGE_RECIPE = [
  "Create one SVG per moving part (head, eyes, eyelids, each mouth shape, props).",
  "Center artwork around 0,0 in each file so WebPuppet can place rest poses.",
  "Zip as name.webpuppet.zip with puppet.json plus assets/layers/*.svg.",
  "Prefer SVG for vector puppets. Use PNG only for pixel art.",
  "Include a mouth swap set with closed, open, oh, smile, and tongue members.",
];
