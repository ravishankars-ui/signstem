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

const leftPoisedArm = {
  shoulder: { x: 0.70, y: 0.20, z: -0.15 },
  elbow: 1.15,
  forearmTwist: 0.5,
  wrist: { x: 0.1, y: 0.15, z: 0.05 },
  hand: 'rest_poised'
};

export const SMPLX_ISL_POSES = {
  // 1. NEUTRAL RESTING POSE (Natural resting arms at sides, clear of torso)
  'IDLE': {
    name: 'IDLE',
    head: { x: 0, y: 0, z: 0 },
    eyes: { blink: false, gazeY: 0 },
    mouth: 'smile',
    leftArm: {
      shoulder: { x: 0.35, y: 0.15, z: -0.15 },
      elbow: 0.35,
      forearmTwist: 0.2,
      wrist: { x: 0.1, y: 0.2, z: 0.1 },
      hand: 'rest_relaxed'
    },
    rightArm: {
      shoulder: { x: 0.35, y: -0.15, z: 0.15 },
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
    leftArm: leftPoisedArm,
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
    leftArm: leftPoisedArm,
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
    leftArm: leftPoisedArm,
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
    leftArm: leftPoisedArm,
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
    leftArm: leftPoisedArm,
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
    leftArm: leftPoisedArm,
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
    leftArm: leftPoisedArm,
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
    leftArm: leftPoisedArm,
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
    leftArm: leftPoisedArm,
    rightArm: {
      shoulder: { x: 1.35, y: -0.25, z: 0.5 },
      elbow: 1.7,
      forearmTwist: -0.7,
      wrist: { x: 0.2, y: -0.3, z: 0.1 },
      hand: 'open_5_spread'
    },
  },
  'ATOM': {
    name: 'ATOM',
    head: { x: 0.05, y: 0, z: 0 },
    eyes: { blink: false, gazeY: 0 },
    mouth: 'warm_smile',
    leftArm: {
      shoulder: { x: 0.85, y: 0.35, z: -0.2 },
      elbow: 1.45,
      forearmTwist: 0.6,
      wrist: { x: 0.3, y: 0.3, z: 0.1 },
      hand: 'claw_open'
    },
    rightArm: {
      shoulder: { x: 0.95, y: -0.35, z: 0.25 },
      elbow: 1.55,
      forearmTwist: -0.6,
      wrist: { x: 0.3, y: -0.3, z: -0.1 },
      hand: 'claw_open'
    },
    duration: 1600
  },
  'GRAVITY': {
    name: 'GRAVITY',
    head: { x: 0.1, y: 0, z: 0 },
    eyes: { blink: false, gazeY: -0.1 },
    mouth: 'neutral',
    leftArm: {
      shoulder: { x: 0.75, y: 0.3, z: -0.2 },
      elbow: 1.2,
      forearmTwist: 0.8,
      wrist: { x: -0.2, y: 0.2, z: 0.1 },
      hand: 'flat_palm'
    },
    rightArm: {
      shoulder: { x: 0.75, y: -0.3, z: 0.2 },
      elbow: 1.2,
      forearmTwist: -0.8,
      wrist: { x: -0.2, y: -0.2, z: -0.1 },
      hand: 'flat_palm'
    },
    duration: 1600
  },
  'ENERGY': {
    name: 'ENERGY',
    head: { x: -0.05, y: 0, z: 0 },
    eyes: { blink: false, gazeY: 0.05 },
    mouth: 'warm_smile',
    leftArm: {
      shoulder: { x: 0.9, y: 0.4, z: -0.3 },
      elbow: 1.6,
      forearmTwist: 0.9,
      wrist: { x: 0.4, y: 0.3, z: 0.2 },
      hand: 'fist_closed'
    },
    rightArm: {
      shoulder: { x: 0.9, y: -0.4, z: 0.3 },
      elbow: 1.6,
      forearmTwist: -0.9,
      wrist: { x: 0.4, y: -0.3, z: -0.2 },
      hand: 'fist_closed'
    },
    duration: 1500
  },
  'EQUAL': {
    name: 'EQUAL',
    head: { x: 0, y: 0, z: 0 },
    eyes: { blink: false, gazeY: -0.05 },
    mouth: 'neutral',
    leftArm: {
      shoulder: { x: 0.8, y: 0.25, z: -0.15 },
      elbow: 1.35,
      forearmTwist: 0.5,
      wrist: { x: 0.2, y: 0.4, z: 0 },
      hand: 'flat_palm'
    },
    rightArm: {
      shoulder: { x: 0.8, y: -0.25, z: 0.15 },
      elbow: 1.35,
      forearmTwist: -0.5,
      wrist: { x: 0.2, y: -0.4, z: 0 },
      hand: 'flat_palm'
    },
    duration: 1500
  },
  'CODE': {
    name: 'CODE',
    head: { x: 0.08, y: 0, z: 0 },
    eyes: { blink: false, gazeY: -0.1 },
    mouth: 'neutral',
    leftArm: {
      shoulder: { x: 0.75, y: 0.3, z: -0.2 },
      elbow: 1.4,
      forearmTwist: 0.7,
      wrist: { x: 0.2, y: 0.3, z: 0.1 },
      hand: 'claw_open'
    },
    rightArm: {
      shoulder: { x: 0.75, y: -0.3, z: 0.2 },
      elbow: 1.4,
      forearmTwist: -0.7,
      wrist: { x: 0.2, y: -0.3, z: -0.1 },
      hand: 'claw_open'
    },
    duration: 1500
  },
  'SCIENCE': {
    name: 'SCIENCE',
    head: { x: 0.05, y: 0, z: 0 },
    eyes: { blink: false, gazeY: 0 },
    mouth: 'warm_smile',
    leftArm: {
      shoulder: { x: 0.8, y: 0.3, z: -0.2 },
      elbow: 1.5,
      forearmTwist: 0.8,
      wrist: { x: 0.3, y: 0.3, z: 0.1 },
      hand: 'fist_closed'
    },
    rightArm: {
      shoulder: { x: 0.8, y: -0.3, z: 0.2 },
      elbow: 1.5,
      forearmTwist: -0.8,
      wrist: { x: 0.3, y: -0.3, z: -0.1 },
      hand: 'fist_closed'
    },
    duration: 1600
  },

  // --- TIME & CALENDAR (Authentic ISL) ---
  'TODAY': {
    name: 'TODAY',
    head: { x: 0.08, y: 0, z: 0 },
    eyes: { blink: false, gazeY: -0.1 },
    mouth: 'neutral',
    leftArm: {
      shoulder: { x: 0.65, y: 0.25, z: -0.15 },
      elbow: 1.25,
      forearmTwist: 1.2,
      wrist: { x: 0.1, y: 0.3, z: 0.1 },
      hand: 'cupped_palm_up'
    },
    rightArm: {
      shoulder: { x: 0.65, y: -0.25, z: 0.15 },
      elbow: 1.25,
      forearmTwist: -1.2,
      wrist: { x: 0.1, y: -0.3, z: -0.1 },
      hand: 'cupped_palm_up'
    },
    duration: 1400
  },
  'NOW': {
    name: 'NOW',
    head: { x: 0.08, y: 0, z: 0 },
    eyes: { blink: false, gazeY: -0.1 },
    mouth: 'neutral',
    leftArm: {
      shoulder: { x: 0.65, y: 0.25, z: -0.15 },
      elbow: 1.25,
      forearmTwist: 1.2,
      wrist: { x: 0.1, y: 0.3, z: 0.1 },
      hand: 'cupped_palm_up'
    },
    rightArm: {
      shoulder: { x: 0.65, y: -0.25, z: 0.15 },
      elbow: 1.25,
      forearmTwist: -1.2,
      wrist: { x: 0.1, y: -0.3, z: -0.1 },
      hand: 'cupped_palm_up'
    },
    duration: 1400
  },
  'TOMORROW': {
    name: 'TOMORROW',
    head: { x: -0.02, y: 0.05, z: 0.05 },
    eyes: { blink: false, gazeY: 0.05 },
    mouth: 'warm_smile',
    leftArm: leftPoisedArm,
    rightArm: {
      shoulder: { x: 1.35, y: -0.30, z: 0.45 },
      elbow: 1.75,
      forearmTwist: -0.8,
      wrist: { x: 0.3, y: -0.3, z: 0.2 },
      hand: 'thumbs_up'
    },
    duration: 1500
  },
  'YESTERDAY': {
    name: 'YESTERDAY',
    head: { x: -0.05, y: 0.05, z: 0.05 },
    eyes: { blink: false, gazeY: 0.05 },
    mouth: 'neutral',
    leftArm: leftPoisedArm,
    rightArm: {
      shoulder: { x: 1.40, y: -0.40, z: 0.55 },
      elbow: 1.95,
      forearmTwist: -0.9,
      wrist: { x: 0.4, y: -0.4, z: 0.3 },
      hand: 'thumbs_up'
    },
    duration: 1500
  },
  'TIME': {
    name: 'TIME',
    head: { x: 0.12, y: -0.08, z: 0 },
    eyes: { blink: false, gazeY: -0.15 },
    mouth: 'neutral',
    leftArm: {
      shoulder: { x: 0.75, y: 0.35, z: -0.25 },
      elbow: 1.45,
      forearmTwist: 0.6,
      wrist: { x: 0.1, y: 0.4, z: 0 },
      hand: 'flat_palm'
    },
    rightArm: {
      shoulder: { x: 0.85, y: -0.15, z: 0.15 },
      elbow: 1.55,
      forearmTwist: -0.7,
      wrist: { x: 0.3, y: -0.1, z: 0 },
      hand: 'point_index'
    },
    duration: 1400
  },

  // --- QUESTIONS (Authentic ISL) ---
  'WHERE': {
    name: 'WHERE',
    head: { x: -0.08, y: 0.08, z: 0.08 },
    eyes: { blink: false, gazeY: 0.1 },
    mouth: 'question',
    leftArm: {
      shoulder: { x: 0.65, y: 0.40, z: -0.30 },
      elbow: 1.15,
      forearmTwist: 1.2,
      wrist: { x: 0.1, y: 0.3, z: 0.1 },
      hand: 'open_5_spread'
    },
    rightArm: {
      shoulder: { x: 0.65, y: -0.40, z: 0.30 },
      elbow: 1.15,
      forearmTwist: -1.2,
      wrist: { x: 0.1, y: -0.3, z: -0.1 },
      hand: 'open_5_spread'
    },
    duration: 1500
  },
  'WHEN': {
    name: 'WHEN',
    head: { x: 0.05, y: 0, z: 0 },
    eyes: { blink: false, gazeY: -0.05 },
    mouth: 'question',
    leftArm: {
      shoulder: { x: 0.80, y: 0.25, z: -0.20 },
      elbow: 1.35,
      forearmTwist: 0.5,
      wrist: { x: 0.2, y: 0.3, z: 0 },
      hand: 'point_index'
    },
    rightArm: {
      shoulder: { x: 0.85, y: -0.15, z: 0.15 },
      elbow: 1.45,
      forearmTwist: -0.6,
      wrist: { x: 0.2, y: -0.1, z: 0 },
      hand: 'point_index'
    },
    duration: 1500
  },
  'WHY': {
    name: 'WHY',
    head: { x: -0.08, y: 0.08, z: 0.05 },
    eyes: { blink: false, gazeY: 0.1 },
    mouth: 'question',
    leftArm: leftPoisedArm,
    rightArm: {
      shoulder: { x: 1.35, y: -0.25, z: 0.4 },
      elbow: 1.70,
      forearmTwist: -0.7,
      wrist: { x: 0.3, y: -0.2, z: 0.1 },
      hand: 'two_fingers_l'
    },
    duration: 1500
  },

  // --- EVERYDAY LIFE & SUSTENANCE ---
  'WATER': {
    name: 'WATER',
    head: { x: 0.06, y: 0, z: 0 },
    eyes: { blink: false, gazeY: 0 },
    mouth: 'warm_smile',
    leftArm: leftPoisedArm,
    rightArm: {
      shoulder: { x: 1.15, y: -0.20, z: 0.30 },
      elbow: 1.85,
      forearmTwist: -0.6,
      wrist: { x: 0.4, y: -0.2, z: 0.1 },
      hand: 'three_fingers_w'
    },
    duration: 1400
  },
  'FOOD': {
    name: 'FOOD',
    head: { x: 0.05, y: 0, z: 0 },
    eyes: { blink: false, gazeY: -0.05 },
    mouth: 'warm_smile',
    leftArm: leftPoisedArm,
    rightArm: {
      shoulder: { x: 1.10, y: -0.20, z: 0.25 },
      elbow: 1.85,
      forearmTwist: -0.8,
      wrist: { x: 0.45, y: -0.2, z: 0.15 },
      hand: 'claw_open'
    },
    duration: 1400
  },
  'EAT': {
    name: 'EAT',
    head: { x: 0.05, y: 0, z: 0 },
    eyes: { blink: false, gazeY: -0.05 },
    mouth: 'warm_smile',
    leftArm: leftPoisedArm,
    rightArm: {
      shoulder: { x: 1.10, y: -0.20, z: 0.25 },
      elbow: 1.85,
      forearmTwist: -0.8,
      wrist: { x: 0.45, y: -0.2, z: 0.15 },
      hand: 'claw_open'
    },
    duration: 1400
  },

  // --- EDUCATION & COMMUNITY ---
  'LEARN': {
    name: 'LEARN',
    head: { x: 0.05, y: 0, z: 0 },
    eyes: { blink: false, gazeY: 0 },
    mouth: 'warm_smile',
    leftArm: {
      shoulder: { x: 0.70, y: 0.30, z: -0.20 },
      elbow: 1.35,
      forearmTwist: 1.1,
      wrist: { x: 0.1, y: 0.3, z: 0 },
      hand: 'flat_palm'
    },
    rightArm: {
      shoulder: { x: 1.25, y: -0.25, z: 0.40 },
      elbow: 1.70,
      forearmTwist: -0.6,
      wrist: { x: 0.3, y: -0.2, z: 0.1 },
      hand: 'open_5_spread'
    },
    duration: 1600
  },
  'TEACH': {
    name: 'TEACH',
    head: { x: 0.02, y: 0, z: 0 },
    eyes: { blink: false, gazeY: 0 },
    mouth: 'warm_smile',
    leftArm: {
      shoulder: { x: 1.15, y: 0.30, z: -0.30 },
      elbow: 1.55,
      forearmTwist: 0.6,
      wrist: { x: 0.2, y: 0.2, z: 0 },
      hand: 'claw_open'
    },
    rightArm: {
      shoulder: { x: 1.15, y: -0.30, z: 0.30 },
      elbow: 1.55,
      forearmTwist: -0.6,
      wrist: { x: 0.2, y: -0.2, z: 0 },
      hand: 'claw_open'
    },
    duration: 1500
  },
  'STUDY': {
    name: 'STUDY',
    head: { x: 0.12, y: 0, z: 0 },
    eyes: { blink: false, gazeY: -0.15 },
    mouth: 'neutral',
    leftArm: {
      shoulder: { x: 0.70, y: 0.30, z: -0.20 },
      elbow: 1.30,
      forearmTwist: 1.1,
      wrist: { x: 0.1, y: 0.3, z: 0 },
      hand: 'flat_palm'
    },
    rightArm: {
      shoulder: { x: 0.85, y: -0.20, z: 0.20 },
      elbow: 1.45,
      forearmTwist: -0.8,
      wrist: { x: 0.2, y: -0.3, z: 0 },
      hand: 'open_5_spread'
    },
    duration: 1500
  },
  'DEAF': {
    name: 'DEAF',
    head: { x: 0.02, y: 0.05, z: 0 },
    eyes: { blink: false, gazeY: 0 },
    mouth: 'neutral',
    leftArm: leftPoisedArm,
    rightArm: {
      shoulder: { x: 1.25, y: -0.30, z: 0.40 },
      elbow: 1.80,
      forearmTwist: -0.7,
      wrist: { x: 0.35, y: -0.2, z: 0.1 },
      hand: 'point_index'
    },
    duration: 1400
  },
  'HEARING': {
    name: 'HEARING',
    head: { x: 0.02, y: 0.05, z: 0 },
    eyes: { blink: false, gazeY: 0 },
    mouth: 'neutral',
    leftArm: leftPoisedArm,
    rightArm: {
      shoulder: { x: 1.15, y: -0.25, z: 0.35 },
      elbow: 1.75,
      forearmTwist: -0.6,
      wrist: { x: 0.3, y: -0.2, z: 0.1 },
      hand: 'point_index'
    },
    duration: 1400
  },
  'STOP': {
    name: 'STOP',
    head: { x: 0.04, y: 0, z: 0 },
    eyes: { blink: false, gazeY: 0 },
    mouth: 'neutral',
    leftArm: {
      shoulder: { x: 0.75, y: 0.30, z: -0.20 },
      elbow: 1.30,
      forearmTwist: 0.9,
      wrist: { x: 0.1, y: 0.3, z: 0 },
      hand: 'flat_palm'
    },
    rightArm: {
      shoulder: { x: 0.85, y: -0.25, z: 0.20 },
      elbow: 1.45,
      forearmTwist: -0.9,
      wrist: { x: 0.2, y: -0.2, z: 0 },
      hand: 'flat_palm'
    },
    duration: 1300
  },
  'YES': {
    name: 'YES',
    head: { x: 0.08, y: 0, z: 0 },
    eyes: { blink: false, gazeY: 0 },
    mouth: 'warm_smile',
    leftArm: leftPoisedArm,
    rightArm: {
      shoulder: { x: 0.85, y: -0.20, z: 0.20 },
      elbow: 1.45,
      forearmTwist: -0.6,
      wrist: { x: 0.35, y: -0.1, z: 0 },
      hand: 'fist'
    },
    duration: 1300
  },
  'NO': {
    name: 'NO',
    head: { x: 0, y: 0.08, z: 0 },
    eyes: { blink: false, gazeY: 0 },
    mouth: 'neutral',
    leftArm: leftPoisedArm,
    rightArm: {
      shoulder: { x: 0.85, y: -0.20, z: 0.20 },
      elbow: 1.45,
      forearmTwist: -0.6,
      wrist: { x: 0.15, y: -0.2, z: 0 },
      hand: 'point_index'
    },
    duration: 1300
  },
  'LOVE': {
    name: 'LOVE',
    head: { x: -0.05, y: 0.05, z: 0.05 },
    eyes: { blink: false, gazeY: 0.05 },
    mouth: 'warm_smile',
    leftArm: leftPoisedArm,
    rightArm: {
      shoulder: { x: 0.95, y: -0.25, z: 0.25 },
      elbow: 1.35,
      forearmTwist: -0.5,
      wrist: { x: 0.1, y: -0.1, z: 0 },
      hand: 'ily_love'
    },
    duration: 1400
  },
  'OK': {
    name: 'OK',
    head: { x: 0.05, y: 0, z: 0 },
    eyes: { blink: false, gazeY: 0 },
    mouth: 'warm_smile',
    leftArm: leftPoisedArm,
    rightArm: {
      shoulder: { x: 0.90, y: -0.20, z: 0.20 },
      elbow: 1.40,
      forearmTwist: -0.6,
      wrist: { x: 0.2, y: -0.2, z: 0 },
      hand: 'ok_pinch'
    },
    duration: 1300
  }
};

/**
 * MANO Finger Joint Flexions for standard Sign Shapes
 * Joint angles in radians [MCP, PIP, DIP]
 */
export const MANO_HAND_SHAPES = {
  // 1. OPEN 5 SPREAD
  'open_5_spread': {
    thumb: [0.25, 0.20, 0.15],
    index: [0.05, 0.05, 0.05],
    middle: [0.05, 0.05, 0.05],
    ring: [0.05, 0.05, 0.05],
    pinky: [0.05, 0.05, 0.05]
  },

  // 2. POINT INDEX (Thumb tucked across middle & ring)
  'point_index': {
    thumb: [0.85, 0.70, 0.50],
    index: [0.05, 0.05, 0.05],
    middle: [1.4, 1.5, 1.2],
    ring: [1.4, 1.5, 1.2],
    pinky: [1.4, 1.5, 1.2]
  },

  // 3. NAMASTE / PRAYER
  'namaste_prayer': {
    thumb: [0.30, 0.20, 0.10],
    index: [0.05, 0.05, 0.05],
    middle: [0.05, 0.05, 0.05],
    ring: [0.05, 0.05, 0.05],
    pinky: [0.05, 0.05, 0.05]
  },

  // 4. THUMBS UP
  'thumbs_up': {
    thumb: [0.10, 0.10, 0.05],
    index: [1.4, 1.5, 1.2],
    middle: [1.4, 1.5, 1.2],
    ring: [1.4, 1.5, 1.2],
    pinky: [1.4, 1.5, 1.2]
  },

  // 5. FIST (Thumb firmly locked across fingers)
  'fist': {
    thumb: [0.95, 0.80, 0.60],
    index: [1.4, 1.5, 1.2],
    middle: [1.4, 1.5, 1.2],
    ring: [1.4, 1.5, 1.2],
    pinky: [1.4, 1.5, 1.2]
  },

  // 6. C CURVE / CUPPED
  'c_curve': {
    thumb: [0.55, 0.50, 0.40],
    index: [0.7, 0.7, 0.6],
    middle: [0.7, 0.7, 0.6],
    ring: [0.7, 0.7, 0.6],
    pinky: [0.7, 0.7, 0.6]
  },
  'cupped_palm_up': {
    thumb: [0.45, 0.40, 0.30],
    index: [0.5, 0.5, 0.4],
    middle: [0.5, 0.5, 0.4],
    ring: [0.5, 0.5, 0.4],
    pinky: [0.5, 0.5, 0.4]
  },

  // 7. PEACE V (Thumb holding down ring & pinky)
  'peace_v': {
    thumb: [0.85, 0.70, 0.50],
    index: [0.05, 0.05, 0.05],
    middle: [0.05, 0.05, 0.05],
    ring: [1.4, 1.5, 1.2],
    pinky: [1.4, 1.5, 1.2]
  },

  // 8. TWO FINGERS H / L (Thumb holding down ring & pinky in letter F, H)
  'two_fingers_h': {
    thumb: [0.85, 0.70, 0.50],
    index: [0.05, 0.05, 0.05],
    middle: [0.05, 0.05, 0.05],
    ring: [1.4, 1.5, 1.2],
    pinky: [1.4, 1.5, 1.2]
  },
  'two_fingers_l': {
    thumb: [0.20, 0.15, 0.10],
    index: [0.05, 0.05, 0.05],
    middle: [1.4, 1.5, 1.2],
    ring: [1.4, 1.5, 1.2],
    pinky: [1.4, 1.5, 1.2]
  },

  // 9. FLAT PALM
  'flat_palm': {
    thumb: [0.35, 0.25, 0.15],
    index: [0.05, 0.05, 0.05],
    middle: [0.05, 0.05, 0.05],
    ring: [0.05, 0.05, 0.05],
    pinky: [0.05, 0.05, 0.05]
  },

  // 10. HOOK INDEX
  'hook_index': {
    thumb: [0.85, 0.70, 0.50],
    index: [0.8, 1.2, 0.9],
    middle: [1.4, 1.5, 1.2],
    ring: [1.4, 1.5, 1.2],
    pinky: [1.4, 1.5, 1.2]
  },

  // 12. Y SHAPE (Thumb and Pinky extended, middle 3 curled)
  'y_shape': {
    thumb: [0.15, 0.10, 0.05],
    index: [1.4, 1.5, 1.2],
    middle: [1.4, 1.5, 1.2],
    ring: [1.4, 1.5, 1.2],
    pinky: [0.05, 0.05, 0.05]
  },

  // 13. R CROSS (Index and middle fingers crossed, thumb holding ring/pinky)
  'r_cross': {
    thumb: [0.85, 0.70, 0.50],
    index: [0.1, 0.05, 0.05],
    middle: [0.1, 0.05, 0.05],
    ring: [1.4, 1.5, 1.2],
    pinky: [1.4, 1.5, 1.2]
  },

  // 14. THREE FINGERS W (Thumb holding pinky)
  'three_fingers_w': {
    thumb: [0.85, 0.70, 0.50],
    index: [0.05, 0.05, 0.05],
    middle: [0.05, 0.05, 0.05],
    ring: [0.05, 0.05, 0.05],
    pinky: [1.4, 1.5, 1.2]
  },

  // 15. OK / PINCH O (Thumb & Index tips touching)
  'pinch_o': {
    thumb: [0.65, 0.60, 0.45],
    index: [0.55, 0.6, 0.5],
    middle: [0.1, 0.05, 0.05],
    ring: [0.1, 0.05, 0.05],
    pinky: [0.1, 0.05, 0.05]
  },

  // 16. M THREE (Thumb tucked beneath 3 fingers)
  'm_three': {
    thumb: [0.85, 0.70, 0.50],
    index: [0.6, 0.7, 0.5],
    middle: [0.6, 0.7, 0.5],
    ring: [0.6, 0.7, 0.5],
    pinky: [1.4, 1.5, 1.2]
  },

  // 17. N TWO (Thumb tucked beneath 2 fingers)
  'n_two': {
    thumb: [0.85, 0.70, 0.50],
    index: [0.6, 0.7, 0.5],
    middle: [0.6, 0.7, 0.5],
    ring: [1.4, 1.5, 1.2],
    pinky: [1.4, 1.5, 1.2]
  },

  // 18. REST RELAXED / POISED
  'rest_relaxed': {
    thumb: [0.45, 0.35, 0.25],
    index: [0.35, 0.35, 0.25],
    middle: [0.4, 0.4, 0.3],
    ring: [0.45, 0.45, 0.35],
    pinky: [0.5, 0.5, 0.4]
  },
  'rest_poised': {
    thumb: [0.40, 0.30, 0.20],
    index: [0.35, 0.35, 0.25],
    middle: [0.4, 0.4, 0.3],
    ring: [0.45, 0.45, 0.35],
    pinky: [0.5, 0.5, 0.4]
  }
};

/**
 * 3D ISL Fingerspelling & Number Poses (A–Z, 0–9)
 * All gestures positioned at natural chest/chin level in active signing space.
 */
export function getSMPLXFingerspellPose(letter) {
  const char = (letter || 'A').toUpperCase().trim();

  // Common chest-height base arm coordinates (active reference base hand)
  const leftBase = {
    shoulder: { x: 0.80, y: 0.25, z: -0.15 },
    elbow: 1.35,
    forearmTwist: 0.6,
    wrist: { x: 0.1, y: 0.2, z: 0 },
    hand: 'flat_palm'
  };

  // Non-dominant arm poised ready in the active lower-chest signing space
  const leftPoised = {
    shoulder: { x: 0.70, y: 0.20, z: -0.15 },
    elbow: 1.15,
    forearmTwist: 0.5,
    wrist: { x: 0.1, y: 0.15, z: 0.05 },
    hand: 'rest_poised'
  };

  const rightBase = {
    shoulder: { x: 0.85, y: -0.20, z: 0.15 },
    elbow: 1.45,
    forearmTwist: -0.6,
    wrist: { x: 0.2, y: -0.2, z: 0 },
    hand: 'point_index'
  };

  switch (char) {
    // VOWEL 'A' - Right index touches Left thumb tip
    case 'A':
      return {
        name: 'LETTER_A',
        head: { x: 0.05, y: 0, z: 0 },
        eyes: { blink: false, gazeY: -0.05 },
        mouth: 'neutral',
        leftArm: { ...leftBase, hand: 'open_5_spread' },
        rightArm: { ...rightBase, shoulder: { x: 0.80, y: -0.15, z: 0.15 }, hand: 'point_index' },
        duration: 1600
      };

    // 'B' - Double C curves forming B in front of chest
    case 'B':
      return {
        name: 'LETTER_B',
        head: { x: 0, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: { ...leftBase, hand: 'c_curve' },
        rightArm: { ...rightBase, hand: 'c_curve' },
        duration: 1600
      };

    // 'C' - Right hand C-curve, left hand poised in active signing space
    case 'C':
      return {
        name: 'LETTER_C',
        head: { x: 0, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: leftPoised,
        rightArm: { ...rightBase, hand: 'c_curve' },
        duration: 1600
      };

    // 'D' - Left index pointing up, Right C touches top/base forming D
    case 'D':
      return {
        name: 'LETTER_D',
        head: { x: 0.05, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: { ...leftBase, hand: 'point_index' },
        rightArm: { ...rightBase, hand: 'c_curve' },
        duration: 1600
      };

    // VOWEL 'E' - Right index touches Left index tip
    case 'E':
      return {
        name: 'LETTER_E',
        head: { x: 0.05, y: 0, z: 0 },
        eyes: { blink: false, gazeY: -0.05 },
        mouth: 'neutral',
        leftArm: { ...leftBase, hand: 'open_5_spread' },
        rightArm: { ...rightBase, shoulder: { x: 0.82, y: -0.10, z: 0.15 }, hand: 'point_index' },
        duration: 1600
      };

    // 'F' - Left index & middle horizontal, Right index & middle crossed over
    case 'F':
      return {
        name: 'LETTER_F',
        head: { x: 0.05, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: { ...leftBase, shoulder: { x: 0.85, y: 0.20, z: -0.15 }, elbow: 1.45, hand: 'two_fingers_h' },
        rightArm: { ...rightBase, shoulder: { x: 0.88, y: -0.15, z: 0.15 }, elbow: 1.50, hand: 'two_fingers_h' },
        duration: 1600
      };

    // 'G' - Both fists together
    case 'G':
      return {
        name: 'LETTER_G',
        head: { x: 0, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: { ...leftBase, hand: 'fist' },
        rightArm: { ...rightBase, hand: 'fist' },
        duration: 1600
      };

    // 'H' - Left flat hand, Right flat hand slicing across
    case 'H':
      return {
        name: 'LETTER_H',
        head: { x: 0.05, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: { ...leftBase, hand: 'flat_palm' },
        rightArm: { ...rightBase, hand: 'flat_palm' },
        duration: 1600
      };

    // VOWEL 'I' - Right index touches Left middle tip
    case 'I':
      return {
        name: 'LETTER_I',
        head: { x: 0.05, y: 0, z: 0 },
        eyes: { blink: false, gazeY: -0.05 },
        mouth: 'neutral',
        leftArm: { ...leftBase, hand: 'open_5_spread' },
        rightArm: { ...rightBase, shoulder: { x: 0.85, y: -0.05, z: 0.15 }, hand: 'point_index' },
        duration: 1600
      };

    // 'J' - Tracing J on palm
    case 'J':
      return {
        name: 'LETTER_J',
        head: { x: 0.05, y: 0, z: 0 },
        eyes: { blink: false, gazeY: -0.05 },
        mouth: 'neutral',
        leftArm: { ...leftBase, hand: 'flat_palm' },
        rightArm: { ...rightBase, shoulder: { x: 0.85, y: -0.05, z: 0.15 }, hand: 'hook_index' },
        duration: 1600
      };

    // 'K' - Left index up, Right V-shape touching side
    case 'K':
      return {
        name: 'LETTER_K',
        head: { x: 0.05, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: { ...leftBase, hand: 'point_index' },
        rightArm: { ...rightBase, hand: 'peace_v' },
        duration: 1600
      };

    // 'L' - Right hand L-shape, left hand poised in active space
    case 'L':
      return {
        name: 'LETTER_L',
        head: { x: 0, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: leftPoised,
        rightArm: { ...rightBase, hand: 'two_fingers_l' },
        duration: 1600
      };

    // 'M' - Three fingers on palm
    case 'M':
      return {
        name: 'LETTER_M',
        head: { x: 0.05, y: 0, z: 0 },
        eyes: { blink: false, gazeY: -0.05 },
        mouth: 'neutral',
        leftArm: { ...leftBase, hand: 'flat_palm' },
        rightArm: { ...rightBase, hand: 'm_three' },
        duration: 1600
      };

    // 'N' - Two fingers on palm
    case 'N':
      return {
        name: 'LETTER_N',
        head: { x: 0.05, y: 0, z: 0 },
        eyes: { blink: false, gazeY: -0.05 },
        mouth: 'neutral',
        leftArm: { ...leftBase, hand: 'flat_palm' },
        rightArm: { ...rightBase, hand: 'n_two' },
        duration: 1600
      };

    // VOWEL 'O' - Right index touches Left ring tip
    case 'O':
      return {
        name: 'LETTER_O',
        head: { x: 0.05, y: 0, z: 0 },
        eyes: { blink: false, gazeY: -0.05 },
        mouth: 'neutral',
        leftArm: { ...leftBase, hand: 'open_5_spread' },
        rightArm: { ...rightBase, shoulder: { x: 0.85, y: 0.0, z: 0.15 }, hand: 'point_index' },
        duration: 1600
      };

    // 'P' - Left index pointing up, Right loop touches top forming P
    case 'P':
      return {
        name: 'LETTER_P',
        head: { x: 0.05, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: { ...leftBase, hand: 'point_index' },
        rightArm: { ...rightBase, hand: 'pinch_o' },
        duration: 1600
      };

    // 'Q' - Left O-ring, Right index hooked through
    case 'Q':
      return {
        name: 'LETTER_Q',
        head: { x: 0.05, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: { ...leftBase, hand: 'c_curve' },
        rightArm: { ...rightBase, hand: 'hook_index' },
        duration: 1600
      };

    // 'R' - Right crossed fingers, left hand poised
    case 'R':
      return {
        name: 'LETTER_R',
        head: { x: 0, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: leftPoised,
        rightArm: { ...rightBase, hand: 'r_cross' },
        duration: 1600
      };

    // 'S' - Both pinkies locked or fists crossed
    case 'S':
      return {
        name: 'LETTER_S',
        head: { x: 0, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: { ...leftBase, hand: 'fist' },
        rightArm: { ...rightBase, hand: 'fist' },
        duration: 1600
      };

    // 'T' - Left flat hand, Right index touching bottom edge forming T
    case 'T':
      return {
        name: 'LETTER_T',
        head: { x: 0.05, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: { ...leftBase, hand: 'flat_palm' },
        rightArm: { ...rightBase, hand: 'point_index' },
        duration: 1600
      };

    // VOWEL 'U' - Right index touches Left pinky tip
    case 'U':
      return {
        name: 'LETTER_U',
        head: { x: 0.05, y: 0, z: 0 },
        eyes: { blink: false, gazeY: -0.05 },
        mouth: 'neutral',
        leftArm: { ...leftBase, hand: 'open_5_spread' },
        rightArm: { ...rightBase, shoulder: { x: 0.85, y: 0.05, z: 0.15 }, hand: 'point_index' },
        duration: 1600
      };

    // 'V' - Peace V sign, left poised
    case 'V':
      return {
        name: 'LETTER_V',
        head: { x: 0, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: leftPoised,
        rightArm: { ...rightBase, hand: 'peace_v' },
        duration: 1600
      };

    // 'W' - Three fingers spread (W), left poised
    case 'W':
      return {
        name: 'LETTER_W',
        head: { x: 0, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: leftPoised,
        rightArm: { ...rightBase, hand: 'three_fingers_w' },
        duration: 1600
      };

    // 'X' - Both index fingers crossed
    case 'X':
      return {
        name: 'LETTER_X',
        head: { x: 0.05, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: { ...leftBase, hand: 'point_index' },
        rightArm: { ...rightBase, hand: 'point_index' },
        duration: 1600
      };

    // 'Y' - Y Mudra (Thumb & Pinky), left poised
    case 'Y':
      return {
        name: 'LETTER_Y',
        head: { x: 0, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: leftPoised,
        rightArm: { ...rightBase, hand: 'y_shape' },
        duration: 1600
      };

    // 'Z' - Tracing Z, left poised
    case 'Z':
      return {
        name: 'LETTER_Z',
        head: { x: 0.05, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: leftPoised,
        rightArm: { ...rightBase, hand: 'point_index' },
        duration: 1600
      };

    // NUMBERS 0-9
    case '0':
      return {
        name: 'NUMBER_0',
        head: { x: 0, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: leftPoised,
        rightArm: { ...rightBase, hand: 'c_curve' },
        duration: 1600
      };

    case '1':
      return {
        name: 'NUMBER_1',
        head: { x: 0, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: leftPoised,
        rightArm: { ...rightBase, hand: 'point_index' },
        duration: 1600
      };

    case '2':
      return {
        name: 'NUMBER_2',
        head: { x: 0, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: leftPoised,
        rightArm: { ...rightBase, hand: 'peace_v' },
        duration: 1600
      };

    case '3':
      return {
        name: 'NUMBER_3',
        head: { x: 0, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: leftPoised,
        rightArm: { ...rightBase, hand: 'three_fingers_w' },
        duration: 1600
      };

    case '4':
      return {
        name: 'NUMBER_4',
        head: { x: 0, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: leftPoised,
        rightArm: { ...rightBase, hand: 'open_5_spread' },
        duration: 1600
      };

    case '5':
      return {
        name: 'NUMBER_5',
        head: { x: 0, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: leftPoised,
        rightArm: { ...rightBase, hand: 'open_5_spread' },
        duration: 1600
      };

    case '6':
      return {
        name: 'NUMBER_6',
        head: { x: 0, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: { ...leftBase, hand: 'point_index' },
        rightArm: { ...rightBase, hand: 'point_index' },
        duration: 1600
      };

    case '7':
      return {
        name: 'NUMBER_7',
        head: { x: 0, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: { ...leftBase, hand: 'peace_v' },
        rightArm: { ...rightBase, hand: 'point_index' },
        duration: 1600
      };

    case '8':
      return {
        name: 'NUMBER_8',
        head: { x: 0, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: { ...leftBase, hand: 'three_fingers_w' },
        rightArm: { ...rightBase, hand: 'point_index' },
        duration: 1600
      };

    case '9':
      return {
        name: 'NUMBER_9',
        head: { x: 0, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: { ...leftBase, hand: 'open_5_spread' },
        rightArm: { ...rightBase, hand: 'point_index' },
        duration: 1600
      };

    default:
      return {
        name: `LETTER_${char}`,
        head: { x: 0, y: 0, z: 0 },
        eyes: { blink: false, gazeY: 0 },
        mouth: 'neutral',
        leftArm: leftPoised,
        rightArm: { ...rightBase, hand: 'open_5_spread' },
        duration: 1600
      };
  }
}
