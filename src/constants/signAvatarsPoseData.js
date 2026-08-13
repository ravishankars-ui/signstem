/**
 * SignAvatars-Compatible 3D Holistic Pose Data for Indian Sign Language (ISL)
 * 
 * Based on SMPL-X / MANO joint rotations (in radians):
 * - Body: spine, chest, neck, head (pitch, yaw, roll)
 * - Shoulders & Arms: clavicle, shoulder (pitch, yaw, roll), elbow flexion, forearm twist, wrist (pitch, yaw, roll)
 * - MANO 5-Finger Hand Joint Rotations:
 *   thumb: [joint1, joint2, joint3]
 *   index: [mcp, pip, dip]
 *   middle: [mcp, pip, dip]
 *   ring: [mcp, pip, dip]
 *   pinky: [mcp, pip, dip]
 */

export const SMPLX_ISL_POSES = {
  // 1. NEUTRAL RESTING POSE (Natural resting arms at sides/lap)
  'IDLE': {
    name: 'IDLE',
    head: { x: 0, y: 0, z: 0 },
    eyes: { blink: false, gazeY: 0 },
    mouth: 'smile',
    leftArm: {
      shoulder: { x: 0.2, y: 0.1, z: -0.15 },
      elbow: 0.35,
      forearmTwist: 0.2,
      wrist: { x: 0.1, y: 0.2, z: 0.1 },
      hand: 'rest_relaxed'
    },
    rightArm: {
      shoulder: { x: 0.2, y: -0.1, z: 0.15 },
      elbow: 0.35,
      forearmTwist: -0.2,
      wrist: { x: 0.1, y: -0.2, z: -0.1 },
      hand: 'rest_relaxed'
    },
    duration: 1500
  },

  // 2. NAMASTE (Anjali Mudra at Heart Center with polite head bow)
  'NAMASTE': {
    name: 'NAMASTE',
    head: { x: 0.15, y: 0, z: 0 }, // Gentle bow
    eyes: { blink: false, gazeY: -0.1 },
    mouth: 'warm_smile',
    leftArm: {
      shoulder: { x: 0.85, y: 0.55, z: -0.4 },
      elbow: 1.65,
      forearmTwist: 0.9,
      wrist: { x: 0.2, y: 0.6, z: 0.3 },
      hand: 'namaste_prayer'
    },
    rightArm: {
      shoulder: { x: 0.85, y: -0.55, z: 0.4 },
      elbow: 1.65,
      forearmTwist: -0.9,
      wrist: { x: 0.2, y: -0.6, z: -0.3 },
      hand: 'namaste_prayer'
    },
    duration: 1600
  },

  // 3. HELLO (Open palm salute at forehead/temple waving outward)
  'HELLO': {
    name: 'HELLO',
    head: { x: -0.05, y: 0.08, z: 0.05 },
    eyes: { blink: false, gazeY: 0.05 },
    mouth: 'warm_smile',
    leftArm: {
      shoulder: { x: 0.2, y: 0.1, z: -0.15 },
      elbow: 0.35,
      forearmTwist: 0.2,
      wrist: { x: 0.1, y: 0.2, z: 0.1 },
      hand: 'rest_relaxed'
    },
    rightArm: {
      shoulder: { x: 1.45, y: -0.35, z: 0.7 },
      elbow: 1.85,
      forearmTwist: -0.6,
      wrist: { x: 0.3, y: -0.4, z: 0.2 },
      hand: 'open_5_spread'
    },
    duration: 1400
  },

  // 4. YOU (Direct index pointing forward with eye contact)
  'YOU': {
    name: 'YOU',
    head: { x: 0.02, y: 0, z: 0 },
    eyes: { blink: false, gazeY: 0 },
    mouth: 'neutral',
    leftArm: {
      shoulder: { x: 0.2, y: 0.1, z: -0.15 },
      elbow: 0.35,
      forearmTwist: 0.2,
      wrist: { x: 0.1, y: 0.2, z: 0.1 },
      hand: 'rest_relaxed'
    },
    rightArm: {
      shoulder: { x: 0.95, y: -0.15, z: 0.1 },
      elbow: 0.9,
      forearmTwist: -0.3,
      wrist: { x: -0.1, y: -0.1, z: 0 },
      hand: 'point_index'
    },
    duration: 1200
  },

  // 5. ME / I (Index pointing to chest center)
  'ME': {
    name: 'ME',
    head: { x: 0.08, y: -0.05, z: 0 },
    eyes: { blink: false, gazeY: -0.1 },
    mouth: 'neutral',
    leftArm: {
      shoulder: { x: 0.2, y: 0.1, z: -0.15 },
      elbow: 0.35,
      forearmTwist: 0.2,
      wrist: { x: 0.1, y: 0.2, z: 0.1 },
      hand: 'rest_relaxed'
    },
    rightArm: {
      shoulder: { x: 0.75, y: -0.45, z: 0.3 },
      elbow: 1.9,
      forearmTwist: -1.1,
      wrist: { x: 0.5, y: -0.3, z: 0.2 },
      hand: 'point_index'
    },
    duration: 1200
  },
  'I': {
    name: 'I',
    head: { x: 0.08, y: -0.05, z: 0 },
    eyes: { blink: false, gazeY: -0.1 },
    mouth: 'neutral',
    leftArm: {
      shoulder: { x: 0.2, y: 0.1, z: -0.15 },
      elbow: 0.35,
      forearmTwist: 0.2,
      wrist: { x: 0.1, y: 0.2, z: 0.1 },
      hand: 'rest_relaxed'
    },
    rightArm: {
      shoulder: { x: 0.75, y: -0.45, z: 0.3 },
      elbow: 1.9,
      forearmTwist: -1.1,
      wrist: { x: 0.5, y: -0.3, z: 0.2 },
      hand: 'point_index'
    },
    duration: 1200
  },

  // 6. HOW (Dual cupped hands rotating outward)
  'HOW': {
    name: 'HOW',
    head: { x: -0.1, y: 0, z: -0.05 },
    eyes: { blink: false, gazeY: 0.1 },
    mouth: 'question',
    leftArm: {
      shoulder: { x: 0.75, y: 0.3, z: -0.25 },
      elbow: 1.25,
      forearmTwist: 1.1,
      wrist: { x: 0.2, y: 0.4, z: 0.1 },
      hand: 'cupped_palm_up'
    },
    rightArm: {
      shoulder: { x: 0.75, y: -0.3, z: 0.25 },
      elbow: 1.25,
      forearmTwist: -1.1,
      wrist: { x: 0.2, y: -0.4, z: -0.1 },
      hand: 'cupped_palm_up'
    },
    duration: 1500
  },

  // 7. WHAT (Dual open hands shrugging outwards)
  'WHAT': {
    name: 'WHAT',
    head: { x: -0.08, y: 0.08, z: 0.08 },
    eyes: { blink: false, gazeY: 0.1 },
    mouth: 'question',
    leftArm: {
      shoulder: { x: 0.65, y: 0.45, z: -0.35 },
      elbow: 1.15,
      forearmTwist: 1.2,
      wrist: { x: 0.2, y: 0.3, z: 0.1 },
      hand: 'open_5_spread'
    },
    rightArm: {
      shoulder: { x: 0.65, y: -0.45, z: 0.35 },
      elbow: 1.15,
      forearmTwist: -1.2,
      wrist: { x: 0.2, y: -0.3, z: -0.1 },
      hand: 'open_5_spread'
    },
    duration: 1500
  },

  // 8. THANK_YOU (Hand moves from chin forward)
  'THANK_YOU': {
    name: 'THANK_YOU',
    head: { x: 0.08, y: 0, z: 0 },
    eyes: { blink: false, gazeY: 0 },
    mouth: 'warm_smile',
    leftArm: {
      shoulder: { x: 0.2, y: 0.1, z: -0.15 },
      elbow: 0.35,
      forearmTwist: 0.2,
      wrist: { x: 0.1, y: 0.2, z: 0.1 },
      hand: 'rest_relaxed'
    },
    rightArm: {
      shoulder: { x: 1.1, y: -0.2, z: 0.25 },
      elbow: 1.6,
      forearmTwist: -0.5,
      wrist: { x: 0.4, y: -0.2, z: 0.1 },
      hand: 'flat_palm'
    },
    duration: 1500
  },
  'THANKS': {
    name: 'THANKS',
    head: { x: 0.08, y: 0, z: 0 },
    eyes: { blink: false, gazeY: 0 },
    mouth: 'warm_smile',
    leftArm: {
      shoulder: { x: 0.2, y: 0.1, z: -0.15 },
      elbow: 0.35,
      forearmTwist: 0.2,
      wrist: { x: 0.1, y: 0.2, z: 0.1 },
      hand: 'rest_relaxed'
    },
    rightArm: {
      shoulder: { x: 1.1, y: -0.2, z: 0.25 },
      elbow: 1.6,
      forearmTwist: -0.5,
      wrist: { x: 0.4, y: -0.2, z: 0.1 },
      hand: 'flat_palm'
    },
    duration: 1500
  },

  // 9. PLEASE (Flat hand circular rub on chest)
  'PLEASE': {
    name: 'PLEASE',
    head: { x: 0.05, y: -0.05, z: 0 },
    eyes: { blink: false, gazeY: 0 },
    mouth: 'warm_smile',
    leftArm: {
      shoulder: { x: 0.2, y: 0.1, z: -0.15 },
      elbow: 0.35,
      forearmTwist: 0.2,
      wrist: { x: 0.1, y: 0.2, z: 0.1 },
      hand: 'rest_relaxed'
    },
    rightArm: {
      shoulder: { x: 0.75, y: -0.35, z: 0.2 },
      elbow: 1.8,
      forearmTwist: -0.9,
      wrist: { x: 0.3, y: -0.2, z: 0.1 },
      hand: 'flat_palm'
    },
    duration: 1450
  },

  // 10. HELP (Left flat support hand, right thumbs-up rising together)
  'HELP': {
    name: 'HELP',
    head: { x: 0.02, y: 0, z: 0 },
    eyes: { blink: false, gazeY: -0.05 },
    mouth: 'neutral',
    leftArm: {
      shoulder: { x: 0.7, y: 0.3, z: -0.2 },
      elbow: 1.45,
      forearmTwist: 1.3,
      wrist: { x: 0.1, y: 0.2, z: 0 },
      hand: 'flat_palm'
    },
    rightArm: {
      shoulder: { x: 0.75, y: -0.25, z: 0.2 },
      elbow: 1.5,
      forearmTwist: -0.8,
      wrist: { x: 0.2, y: -0.1, z: 0 },
      hand: 'thumbs_up'
    },
    duration: 1500
  },

  // 11. GOOD (Thumbs-up affirmative forward)
  'GOOD': {
    name: 'GOOD',
    head: { x: 0.06, y: 0, z: 0 },
    eyes: { blink: false, gazeY: 0 },
    mouth: 'warm_smile',
    leftArm: {
      shoulder: { x: 0.2, y: 0.1, z: -0.15 },
      elbow: 0.35,
      forearmTwist: 0.2,
      wrist: { x: 0.1, y: 0.2, z: 0.1 },
      hand: 'rest_relaxed'
    },
    rightArm: {
      shoulder: { x: 0.85, y: -0.2, z: 0.2 },
      elbow: 1.3,
      forearmTwist: -0.5,
      wrist: { x: 0.1, y: -0.1, z: 0 },
      hand: 'thumbs_up'
    },
    duration: 1300
  },

  // 12. NAME (Two fingers H tap)
  'NAME': {
    name: 'NAME',
    head: { x: 0.04, y: 0, z: 0 },
    eyes: { blink: false, gazeY: -0.05 },
    mouth: 'neutral',
    leftArm: {
      shoulder: { x: 0.75, y: 0.25, z: -0.2 },
      elbow: 1.5,
      forearmTwist: 0.7,
      wrist: { x: 0.1, y: 0.3, z: 0 },
      hand: 'two_fingers_h'
    },
    rightArm: {
      shoulder: { x: 0.75, y: -0.25, z: 0.2 },
      elbow: 1.5,
      forearmTwist: -0.7,
      wrist: { x: 0.1, y: -0.3, z: 0 },
      hand: 'two_fingers_h'
    },
    duration: 1400
  },

  // 13. FRIEND (Index hooks interlock)
  'FRIEND': {
    name: 'FRIEND',
    head: { x: 0.05, y: 0.05, z: 0 },
    eyes: { blink: false, gazeY: -0.05 },
    mouth: 'warm_smile',
    leftArm: {
      shoulder: { x: 0.8, y: 0.3, z: -0.2 },
      elbow: 1.6,
      forearmTwist: 0.8,
      wrist: { x: 0.2, y: 0.4, z: 0 },
      hand: 'hook_index'
    },
    rightArm: {
      shoulder: { x: 0.8, y: -0.3, z: 0.2 },
      elbow: 1.6,
      forearmTwist: -0.8,
      wrist: { x: 0.2, y: -0.4, z: 0 },
      hand: 'hook_index'
    },
    duration: 1500
  },

  // 14. SIGN / LANGUAGE
  'SIGN': {
    name: 'SIGN',
    head: { x: 0, y: 0, z: 0 },
    eyes: { blink: false, gazeY: 0 },
    mouth: 'warm_smile',
    leftArm: {
      shoulder: { x: 0.85, y: 0.3, z: -0.2 },
      elbow: 1.3,
      forearmTwist: 0.5,
      wrist: { x: 0.2, y: 0.2, z: 0 },
      hand: 'point_index'
    },
    rightArm: {
      shoulder: { x: 0.85, y: -0.3, z: 0.2 },
      elbow: 1.3,
      forearmTwist: -0.5,
      wrist: { x: 0.2, y: -0.2, z: 0 },
      hand: 'point_index'
    },
    duration: 1500
  },
  'LANGUAGE': {
    name: 'LANGUAGE',
    head: { x: 0, y: 0, z: 0 },
    eyes: { blink: false, gazeY: 0 },
    mouth: 'warm_smile',
    leftArm: {
      shoulder: { x: 0.85, y: 0.35, z: -0.25 },
      elbow: 1.25,
      forearmTwist: 0.6,
      wrist: { x: 0.1, y: 0.3, z: 0 },
      hand: 'two_fingers_l'
    },
    rightArm: {
      shoulder: { x: 0.85, y: -0.35, z: 0.25 },
      elbow: 1.25,
      forearmTwist: -0.6,
      wrist: { x: 0.1, y: -0.3, z: 0 },
      hand: 'two_fingers_l'
    },
    duration: 1500
  },

  // 15. INDIA
  'INDIA': {
    name: 'INDIA',
    head: { x: 0.05, y: 0, z: 0 },
    eyes: { blink: false, gazeY: 0 },
    mouth: 'warm_smile',
    leftArm: {
      shoulder: { x: 0.2, y: 0.1, z: -0.15 },
      elbow: 0.35,
      forearmTwist: 0.2,
      wrist: { x: 0.1, y: 0.2, z: 0.1 },
      hand: 'rest_relaxed'
    },
    rightArm: {
      shoulder: { x: 1.35, y: -0.25, z: 0.5 },
      elbow: 1.7,
      forearmTwist: -0.7,
      wrist: { x: 0.2, y: -0.3, z: 0.1 },
      hand: 'open_5_spread'
    },
    duration: 1500
  }
};

/**
 * MANO Finger Joint Flexions for standard Sign Shapes
 * Joint angles in radians [MCP, PIP, DIP]
 */
export const MANO_HAND_SHAPES = {
  // 1. OPEN 5 SPREAD
  'open_5_spread': {
    thumb: [0.1, 0.05, 0.05],
    index: [0.05, 0.05, 0.05],
    middle: [0.05, 0.05, 0.05],
    ring: [0.05, 0.05, 0.05],
    pinky: [0.05, 0.05, 0.05]
  },

  // 2. POINT INDEX
  'point_index': {
    thumb: [0.7, 0.5, 0.3],
    index: [0.05, 0.05, 0.05],
    middle: [1.4, 1.5, 1.2],
    ring: [1.4, 1.5, 1.2],
    pinky: [1.4, 1.5, 1.2]
  },

  // 3. NAMASTE / PRAYER
  'namaste_prayer': {
    thumb: [0.1, 0.1, 0.05],
    index: [0.05, 0.05, 0.05],
    middle: [0.05, 0.05, 0.05],
    ring: [0.05, 0.05, 0.05],
    pinky: [0.05, 0.05, 0.05]
  },

  // 4. THUMBS UP
  'thumbs_up': {
    thumb: [0.0, 0.0, 0.0],
    index: [1.4, 1.5, 1.2],
    middle: [1.4, 1.5, 1.2],
    ring: [1.4, 1.5, 1.2],
    pinky: [1.4, 1.5, 1.2]
  },

  // 5. FIST
  'fist': {
    thumb: [0.8, 0.6, 0.4],
    index: [1.4, 1.5, 1.2],
    middle: [1.4, 1.5, 1.2],
    ring: [1.4, 1.5, 1.2],
    pinky: [1.4, 1.5, 1.2]
  },

  // 6. C CURVE / CUPPED
  'c_curve': {
    thumb: [0.4, 0.4, 0.3],
    index: [0.7, 0.7, 0.6],
    middle: [0.7, 0.7, 0.6],
    ring: [0.7, 0.7, 0.6],
    pinky: [0.7, 0.7, 0.6]
  },
  'cupped_palm_up': {
    thumb: [0.3, 0.3, 0.2],
    index: [0.5, 0.5, 0.4],
    middle: [0.5, 0.5, 0.4],
    ring: [0.5, 0.5, 0.4],
    pinky: [0.5, 0.5, 0.4]
  },

  // 7. PEACE V
  'peace_v': {
    thumb: [0.7, 0.5, 0.3],
    index: [0.05, 0.05, 0.05],
    middle: [0.05, 0.05, 0.05],
    ring: [1.4, 1.5, 1.2],
    pinky: [1.4, 1.5, 1.2]
  },

  // 8. TWO FINGERS H / L
  'two_fingers_h': {
    thumb: [0.7, 0.5, 0.3],
    index: [0.05, 0.05, 0.05],
    middle: [0.05, 0.05, 0.05],
    ring: [1.4, 1.5, 1.2],
    pinky: [1.4, 1.5, 1.2]
  },
  'two_fingers_l': {
    thumb: [0.1, 0.05, 0.05],
    index: [0.05, 0.05, 0.05],
    middle: [1.4, 1.5, 1.2],
    ring: [1.4, 1.5, 1.2],
    pinky: [1.4, 1.5, 1.2]
  },

  // 9. FLAT PALM
  'flat_palm': {
    thumb: [0.2, 0.1, 0.05],
    index: [0.05, 0.05, 0.05],
    middle: [0.05, 0.05, 0.05],
    ring: [0.05, 0.05, 0.05],
    pinky: [0.05, 0.05, 0.05]
  },

  // 10. HOOK INDEX
  'hook_index': {
    thumb: [0.7, 0.5, 0.3],
    index: [0.8, 1.2, 0.9],
    middle: [1.4, 1.5, 1.2],
    ring: [1.4, 1.5, 1.2],
    pinky: [1.4, 1.5, 1.2]
  },

  // 11. REST RELAXED
  'rest_relaxed': {
    thumb: [0.25, 0.2, 0.15],
    index: [0.35, 0.4, 0.3],
    middle: [0.4, 0.45, 0.35],
    ring: [0.4, 0.45, 0.35],
    pinky: [0.35, 0.4, 0.3]
  }
};

/**
 * 3D ISL Fingerspelling (A–Z)
 */
export function getSMPLXFingerspellPose(letter) {
  const char = (letter || 'A').toUpperCase();

  switch (char) {
    // VOWEL 'A' - Right index touches Left thumb tip
    case 'A':
      return {
        name: 'LETTER_A',
        head: { x: 0.05, y: 0, z: 0 },
        eyes: { blink: false, gazeY: -0.05 },
        mouth: 'neutral',
        leftArm: {
          shoulder: { x: 0.8, y: 0.3, z: -0.25 },
          elbow: 1.4,
          forearmTwist: 0.8,
          wrist: { x: 0.1, y: 0.3, z: 0 },
          hand: 'open_5_spread'
        },
        rightArm: {
          shoulder: { x: 0.8, y: -0.15, z: 0.15 },
          elbow: 1.6,
          forearmTwist: -0.6,
          wrist: { x: 0.3, y: -0.3, z: 0 },
          hand: 'point_index'
        },
        duration: 900
      };

    // 'B' - Double C circles
    case 'B':
      return {
        name: 'LETTER_B',
        head: { x: 0, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: {
          shoulder: { x: 0.8, y: 0.2, z: -0.15 },
          elbow: 1.5,
          forearmTwist: 0.5,
          wrist: { x: 0.1, y: 0.2, z: 0 },
          hand: 'c_curve'
        },
        rightArm: {
          shoulder: { x: 0.8, y: -0.2, z: 0.15 },
          elbow: 1.5,
          forearmTwist: -0.5,
          wrist: { x: 0.1, y: -0.2, z: 0 },
          hand: 'c_curve'
        },
        duration: 900
      };

    // 'C'
    case 'C':
      return {
        name: 'LETTER_C',
        head: { x: 0, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: {
          shoulder: { x: 0.2, y: 0.1, z: -0.15 },
          elbow: 0.35,
          forearmTwist: 0.2,
          wrist: { x: 0.1, y: 0.2, z: 0.1 },
          hand: 'rest_relaxed'
        },
        rightArm: {
          shoulder: { x: 0.85, y: -0.2, z: 0.25 },
          elbow: 1.4,
          forearmTwist: -0.5,
          wrist: { x: 0.2, y: -0.2, z: 0 },
          hand: 'c_curve'
        },
        duration: 900
      };

    // VOWEL 'E' - Touch Index tip
    case 'E':
      return {
        name: 'LETTER_E',
        head: { x: 0.05, y: 0, z: 0 },
        eyes: { blink: false, gazeY: -0.05 },
        mouth: 'neutral',
        leftArm: {
          shoulder: { x: 0.8, y: 0.3, z: -0.25 },
          elbow: 1.4,
          forearmTwist: 0.8,
          wrist: { x: 0.1, y: 0.3, z: 0 },
          hand: 'open_5_spread'
        },
        rightArm: {
          shoulder: { x: 0.85, y: -0.1, z: 0.15 },
          elbow: 1.5,
          forearmTwist: -0.5,
          wrist: { x: 0.2, y: -0.2, z: 0 },
          hand: 'point_index'
        },
        duration: 900
      };

    // VOWEL 'I' - Touch Middle tip
    case 'I':
      return {
        name: 'LETTER_I',
        head: { x: 0.05, y: 0, z: 0 },
        eyes: { blink: false, gazeY: -0.05 },
        mouth: 'neutral',
        leftArm: {
          shoulder: { x: 0.8, y: 0.3, z: -0.25 },
          elbow: 1.4,
          forearmTwist: 0.8,
          wrist: { x: 0.1, y: 0.3, z: 0 },
          hand: 'open_5_spread'
        },
        rightArm: {
          shoulder: { x: 0.85, y: -0.05, z: 0.15 },
          elbow: 1.45,
          forearmTwist: -0.5,
          wrist: { x: 0.2, y: -0.1, z: 0 },
          hand: 'point_index'
        },
        duration: 900
      };

    // VOWEL 'O' - Touch Ring tip
    case 'O':
      return {
        name: 'LETTER_O',
        head: { x: 0.05, y: 0, z: 0 },
        eyes: { blink: false, gazeY: -0.05 },
        mouth: 'neutral',
        leftArm: {
          shoulder: { x: 0.8, y: 0.3, z: -0.25 },
          elbow: 1.4,
          forearmTwist: 0.8,
          wrist: { x: 0.1, y: 0.3, z: 0 },
          hand: 'open_5_spread'
        },
        rightArm: {
          shoulder: { x: 0.85, y: 0.0, z: 0.15 },
          elbow: 1.4,
          forearmTwist: -0.4,
          wrist: { x: 0.2, y: 0, z: 0 },
          hand: 'point_index'
        },
        duration: 900
      };

    // VOWEL 'U' - Touch Pinky tip
    case 'U':
      return {
        name: 'LETTER_U',
        head: { x: 0.05, y: 0, z: 0 },
        eyes: { blink: false, gazeY: -0.05 },
        mouth: 'neutral',
        leftArm: {
          shoulder: { x: 0.8, y: 0.3, z: -0.25 },
          elbow: 1.4,
          forearmTwist: 0.8,
          wrist: { x: 0.1, y: 0.3, z: 0 },
          hand: 'open_5_spread'
        },
        rightArm: {
          shoulder: { x: 0.85, y: 0.05, z: 0.15 },
          elbow: 1.35,
          forearmTwist: -0.3,
          wrist: { x: 0.2, y: 0.1, z: 0 },
          hand: 'point_index'
        },
        duration: 900
      };

    // 'L'
    case 'L':
      return {
        name: 'LETTER_L',
        head: { x: 0, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: {
          shoulder: { x: 0.2, y: 0.1, z: -0.15 },
          elbow: 0.35,
          forearmTwist: 0.2,
          wrist: { x: 0.1, y: 0.2, z: 0.1 },
          hand: 'rest_relaxed'
        },
        rightArm: {
          shoulder: { x: 0.9, y: -0.2, z: 0.25 },
          elbow: 1.3,
          forearmTwist: -0.5,
          wrist: { x: 0.1, y: -0.2, z: 0 },
          hand: 'two_fingers_l'
        },
        duration: 900
      };

    // 'V'
    case 'V':
      return {
        name: 'LETTER_V',
        head: { x: 0, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: {
          shoulder: { x: 0.2, y: 0.1, z: -0.15 },
          elbow: 0.35,
          forearmTwist: 0.2,
          wrist: { x: 0.1, y: 0.2, z: 0.1 },
          hand: 'rest_relaxed'
        },
        rightArm: {
          shoulder: { x: 0.9, y: -0.2, z: 0.25 },
          elbow: 1.3,
          forearmTwist: -0.5,
          wrist: { x: 0.1, y: -0.2, z: 0 },
          hand: 'peace_v'
        },
        duration: 900
      };

    default:
      return {
        name: `LETTER_${char}`,
        head: { x: 0, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: {
          shoulder: { x: 0.2, y: 0.1, z: -0.15 },
          elbow: 0.35,
          forearmTwist: 0.2,
          wrist: { x: 0.1, y: 0.2, z: 0.1 },
          hand: 'rest_relaxed'
        },
        rightArm: {
          shoulder: { x: 0.9, y: -0.2, z: 0.25 },
          elbow: 1.35,
          forearmTwist: -0.5,
          wrist: { x: 0.2, y: -0.2, z: 0 },
          hand: 'open_5_spread'
        },
        duration: 900
      };
  }
}
