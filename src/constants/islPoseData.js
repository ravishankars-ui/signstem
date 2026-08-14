/**
 * Comprehensive Indian Sign Language (ISL) Pose & Kinematics Data
 * 
 * Features:
 * - Exact wrist coordinates (wristX, wristY) and rotation (rot)
 * - Anatomical hand shape identifier
 * - Dynamic facial expressions (eyebrows: 'neutral'|'raised'|'inward', mouth: 'smile'|'neutral'|'open', headBow: number)
 * - ISL linguistic metadata (handshapeName, contactType, movementDescription)
 */

export const ISL_WORD_POSES = {
  // 1. NEUTRAL / IDLE (Resting at sides/lap)
  'IDLE': {
    name: 'IDLE',
    category: 'Rest',
    metadata: { handshapeName: 'Relaxed Rest', contact: 'None', desc: 'Neutral resting posture at sides' },
    leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
    rightArm: { wristX: 265, wristY: 375, rot: -15, handShape: 'rest_relaxed' },
    face: { brow: 'neutral', mouth: 'smile', headY: 0, headRot: 0 },
    duration: 1500
  },

  // 2. NAMASTE (Anjali Mudra at chest center with respectful bow)
  'NAMASTE': {
    name: 'NAMASTE',
    category: 'Greeting',
    metadata: { handshapeName: 'Flat Palm (Anjali)', contact: 'Midline Palmar', desc: 'Both palms meet flat at chest with gentle head bow' },
    leftArm: { wristX: 188, wristY: 285, rot: -25, handShape: 'namaste_prayer' },
    rightArm: { wristX: 212, wristY: 285, rot: 25, handShape: 'namaste_prayer' },
    face: { brow: 'neutral', mouth: 'warm_smile', headY: 6, headRot: 0 },
    duration: 1600
  },

  // 3. HELLO (Open-5 wave from temple outward)
  'HELLO': {
    name: 'HELLO',
    category: 'Greeting',
    metadata: { handshapeName: 'Open-5 Spread', contact: 'Temple Origin', desc: 'Right open hand at temple waving outward with eye contact' },
    leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
    rightArm: { wristX: 280, wristY: 150, rot: -20, handShape: 'open_5_spread' },
    face: { brow: 'raised', mouth: 'warm_smile', headY: -2, headRot: 2 },
    duration: 1400
  },

  // 4. YOU (Direct index point forward)
  'YOU': {
    name: 'YOU',
    category: 'Pronoun',
    metadata: { handshapeName: 'Index Point (1-Hand)', contact: 'Forward Spatial', desc: 'Right index finger points forward toward viewer' },
    leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
    rightArm: { wristX: 235, wristY: 260, rot: 0, handShape: 'point_index' },
    face: { brow: 'neutral', mouth: 'neutral', headY: 0, headRot: 0 },
    duration: 1200
  },

  // 5. ME / I (Index touches chest center)
  'ME': {
    name: 'ME',
    category: 'Pronoun',
    metadata: { handshapeName: 'Index Point (Self)', contact: 'Chest Contact', desc: 'Right index finger points inward touching chest center' },
    leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
    rightArm: { wristX: 200, wristY: 265, rot: 35, handShape: 'point_index' },
    face: { brow: 'neutral', mouth: 'neutral', headY: 2, headRot: -1 },
    duration: 1200
  },
  'I': {
    name: 'I',
    category: 'Pronoun',
    metadata: { handshapeName: 'Index Point (Self)', contact: 'Chest Contact', desc: 'Right index finger points inward touching chest center' },
    leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
    rightArm: { wristX: 200, wristY: 265, rot: 35, handShape: 'point_index' },
    face: { brow: 'neutral', mouth: 'neutral', headY: 2, headRot: -1 },
    duration: 1200
  },

  // 6. HOW (Dual cupped hands rotating outward)
  'HOW': {
    name: 'HOW',
    category: 'Question',
    metadata: { handshapeName: 'Cupped Hands (Curved-5)', contact: 'Dual Symmetrical', desc: 'Both hands cup palms-up and rotate outward with questioning brows' },
    leftArm: { wristX: 150, wristY: 290, rot: 35, handShape: 'cupped_palm_up' },
    rightArm: { wristX: 250, wristY: 290, rot: -35, handShape: 'cupped_palm_up' },
    face: { brow: 'raised', mouth: 'question', headY: -3, headRot: -2 },
    duration: 1500
  },

  // 7. WHAT (Dual open hands shrugging outward)
  'WHAT': {
    name: 'WHAT',
    category: 'Question',
    metadata: { handshapeName: 'Open-5 Palm-Up', contact: 'Lateral Movement', desc: 'Both open hands shake gently side-to-side with shrugging brows' },
    leftArm: { wristX: 130, wristY: 285, rot: 40, handShape: 'open_5_spread' },
    rightArm: { wristX: 270, wristY: 285, rot: -40, handShape: 'open_5_spread' },
    face: { brow: 'raised', mouth: 'question', headY: -2, headRot: 2 },
    duration: 1500
  },

  // 8. THANK_YOU (Hand moves from chin forward)
  'THANK_YOU': {
    name: 'THANK_YOU',
    category: 'Courtesy',
    metadata: { handshapeName: 'Flat-B Palm', contact: 'Chin Origin', desc: 'Right flat fingertips touch chin and sweep forward towards viewer' },
    leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
    rightArm: { wristX: 215, wristY: 195, rot: 15, handShape: 'flat_palm' },
    face: { brow: 'neutral', mouth: 'warm_smile', headY: 2, headRot: 0 },
    duration: 1500
  },
  'THANKS': {
    name: 'THANKS',
    category: 'Courtesy',
    metadata: { handshapeName: 'Flat-B Palm', contact: 'Chin Origin', desc: 'Right flat fingertips touch chin and sweep forward towards viewer' },
    leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
    rightArm: { wristX: 215, wristY: 195, rot: 15, handShape: 'flat_palm' },
    face: { brow: 'neutral', mouth: 'warm_smile', headY: 2, headRot: 0 },
    duration: 1500
  },

  // 9. PLEASE (Flat hand circular rub on chest)
  'PLEASE': {
    name: 'PLEASE',
    category: 'Courtesy',
    metadata: { handshapeName: 'Flat Palm Rub', contact: 'Chest Contact', desc: 'Right flat hand rubs gently in circular motion over heart' },
    leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
    rightArm: { wristX: 200, wristY: 270, rot: 25, handShape: 'flat_palm' },
    face: { brow: 'raised', mouth: 'warm_smile', headY: 1, headRot: 1 },
    duration: 1450
  },

  // 10. HELP (Left flat support, right thumbs-up rising)
  'HELP': {
    name: 'HELP',
    category: 'Assistance',
    metadata: { handshapeName: 'Thumbs-Up on Base Palm', contact: 'Palmar Base', desc: 'Right thumbs-up sits on left open base palm, both lifting upward' },
    leftArm: { wristX: 185, wristY: 300, rot: 20, handShape: 'flat_palm' },
    rightArm: { wristX: 215, wristY: 280, rot: -10, handShape: 'thumbs_up' },
    face: { brow: 'neutral', mouth: 'neutral', headY: 0, headRot: 0 },
    duration: 1500
  },

  // 11. GOOD (Thumbs-up affirmative forward)
  'GOOD': {
    name: 'GOOD',
    category: 'Adjective',
    metadata: { handshapeName: 'Thumbs-Up (Affirmative)', contact: 'Forward Thrust', desc: 'Right thumbs up thrusts forward with nodding head' },
    leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
    rightArm: { wristX: 245, wristY: 250, rot: -15, handShape: 'thumbs_up' },
    face: { brow: 'neutral', mouth: 'warm_smile', headY: 3, headRot: 0 },
    duration: 1300
  },

  // 12. NAME (Two fingers H tap across chest)
  'NAME': {
    name: 'NAME',
    category: 'Noun',
    metadata: { handshapeName: 'H-Handshape Dual Tap', contact: 'Cross-Finger Contact', desc: 'Both H-hands (index+middle extended) tap across each other' },
    leftArm: { wristX: 185, wristY: 275, rot: 15, handShape: 'two_fingers_h' },
    rightArm: { wristX: 215, wristY: 275, rot: -15, handShape: 'two_fingers_h' },
    face: { brow: 'neutral', mouth: 'neutral', headY: 0, headRot: 0 },
    duration: 1400
  },

  // 13. FRIEND (Index hooks interlock)
  'FRIEND': {
    name: 'FRIEND',
    category: 'Noun',
    metadata: { handshapeName: 'X-Hook Interlock', contact: 'Interlocked Index', desc: 'Both hooked index fingers link together twice' },
    leftArm: { wristX: 190, wristY: 270, rot: -15, handShape: 'hook_index' },
    rightArm: { wristX: 210, wristY: 270, rot: 15, handShape: 'hook_index' },
    face: { brow: 'neutral', mouth: 'warm_smile', headY: 0, headRot: 1 },
    duration: 1500
  },

  // 14. SIGN / LANGUAGE
  'SIGN': {
    name: 'SIGN',
    category: 'Verb',
    metadata: { handshapeName: 'Index Alternate Revolving', contact: 'Air Kinematics', desc: 'Both index fingers circle alternately backward near chest' },
    leftArm: { wristX: 170, wristY: 260, rot: 25, handShape: 'point_index' },
    rightArm: { wristX: 230, wristY: 260, rot: -25, handShape: 'point_index' },
    face: { brow: 'neutral', mouth: 'warm_smile', headY: 0, headRot: 0 },
    duration: 1500
  },
  'LANGUAGE': {
    name: 'LANGUAGE',
    category: 'Noun',
    metadata: { handshapeName: 'L-Hand Undulating', contact: 'Lateral Path', desc: 'Both L-hands move outward with undulating wavy path' },
    leftArm: { wristX: 160, wristY: 265, rot: 30, handShape: 'two_fingers_l' },
    rightArm: { wristX: 240, wristY: 265, rot: -30, handShape: 'two_fingers_l' },
    face: { brow: 'neutral', mouth: 'warm_smile', headY: 0, headRot: 0 },
    duration: 1500
  },

  // 15. INDIA
  'INDIA': {
    name: 'INDIA',
    category: 'Proper Noun',
    metadata: { handshapeName: 'Forehead Tilak Point', contact: 'Forehead Center', desc: 'Right thumb touches center of forehead and moves upward' },
    leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
    rightArm: { wristX: 200, wristY: 105, rot: -10, handShape: 'point_index' },
    face: { brow: 'neutral', mouth: 'warm_smile', headY: 1, headRot: 0 },
    duration: 1500
  }
};

/**
 * High-Accuracy ISL 26-Letter Fingerspelling System (A–Z)
 */
export function getISLFingerspellPose(letter) {
  const char = (letter || 'A').toUpperCase();

  switch (char) {
    // VOWEL 'A' - Right index touches Left Thumb tip
    case 'A':
      return {
        name: 'LETTER_A',
        category: 'Vowel',
        metadata: { handshapeName: 'Vowel-A Touch', contact: 'Left Thumb Tip', desc: 'Right index touches the tip of left open thumb' },
        leftArm: { wristX: 175, wristY: 275, rot: 30, handShape: 'open_5_spread' },
        rightArm: { wristX: 205, wristY: 270, rot: -25, handShape: 'point_index' },
        face: { brow: 'neutral', mouth: 'neutral', headY: 1, headRot: 0 },
        duration: 950
      };

    // 'B' - Double C hands touching
    case 'B':
      return {
        name: 'LETTER_B',
        category: 'Consonant',
        metadata: { handshapeName: 'Dual C-Shape', contact: 'Fingertip-to-Fingertip', desc: 'Both hands form C-shapes touching index-to-index and thumb-to-thumb' },
        leftArm: { wristX: 185, wristY: 270, rot: 15, handShape: 'c_curve' },
        rightArm: { wristX: 215, wristY: 270, rot: -15, handShape: 'c_curve' },
        face: { brow: 'neutral', mouth: 'neutral', headY: 0, headRot: 0 },
        duration: 950
      };

    // 'C' - Right hand single C
    case 'C':
      return {
        name: 'LETTER_C',
        category: 'Consonant',
        metadata: { handshapeName: 'Single C-Shape', contact: 'Spatial', desc: 'Right hand forms a curved C-shape facing left' },
        leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
        rightArm: { wristX: 240, wristY: 260, rot: -15, handShape: 'c_curve' },
        face: { brow: 'neutral', mouth: 'neutral', headY: 0, headRot: 0 },
        duration: 950
      };

    // 'D' - Right index points up, left C joins base
    case 'D':
      return {
        name: 'LETTER_D',
        category: 'Consonant',
        metadata: { handshapeName: 'Index Stem + C-Loop', contact: 'Left Index to Right Stem', desc: 'Right index points up, left hand curves to form the loop of D' },
        leftArm: { wristX: 180, wristY: 270, rot: 25, handShape: 'c_curve' },
        rightArm: { wristX: 210, wristY: 250, rot: 0, handShape: 'point_index' },
        face: { brow: 'neutral', mouth: 'neutral', headY: 0, headRot: 0 },
        duration: 950
      };

    // VOWEL 'E' - Right index touches Left Index tip
    case 'E':
      return {
        name: 'LETTER_E',
        category: 'Vowel',
        metadata: { handshapeName: 'Vowel-E Touch', contact: 'Left Index Tip', desc: 'Right index touches the tip of left index finger' },
        leftArm: { wristX: 175, wristY: 275, rot: 30, handShape: 'open_5_spread' },
        rightArm: { wristX: 210, wristY: 260, rot: -25, handShape: 'point_index' },
        face: { brow: 'neutral', mouth: 'neutral', headY: 1, headRot: 0 },
        duration: 950
      };

    // 'F' - Cross index fingers
    case 'F':
      return {
        name: 'LETTER_F',
        category: 'Consonant',
        metadata: { handshapeName: 'Two-Finger Cross', contact: 'Crossed Index/Middle', desc: 'Two fingers of right hand placed across two fingers of left hand' },
        leftArm: { wristX: 185, wristY: 270, rot: 20, handShape: 'two_fingers_h' },
        rightArm: { wristX: 215, wristY: 265, rot: -70, handShape: 'two_fingers_h' },
        face: { brow: 'neutral', mouth: 'neutral', headY: 0, headRot: 0 },
        duration: 950
      };

    // 'G' - Two fists stacked
    case 'G':
      return {
        name: 'LETTER_G',
        category: 'Consonant',
        metadata: { handshapeName: 'Stacked Fists', contact: 'Fist Base to Top', desc: 'Right fist placed vertically on top of left fist' },
        leftArm: { wristX: 200, wristY: 290, rot: 0, handShape: 'fist' },
        rightArm: { wristX: 200, wristY: 240, rot: 0, handShape: 'fist' },
        face: { brow: 'neutral', mouth: 'neutral', headY: 0, headRot: 0 },
        duration: 950
      };

    // 'H' - Right flat palm slides across Left flat palm
    case 'H':
      return {
        name: 'LETTER_H',
        category: 'Consonant',
        metadata: { handshapeName: 'Flat Palm Stroke', contact: 'Palmar Slide', desc: 'Right open palm strokes from wrist to fingers of left flat palm' },
        leftArm: { wristX: 180, wristY: 280, rot: 45, handShape: 'flat_palm' },
        rightArm: { wristX: 210, wristY: 260, rot: -30, handShape: 'flat_palm' },
        face: { brow: 'neutral', mouth: 'neutral', headY: 0, headRot: 0 },
        duration: 950
      };

    // VOWEL 'I' - Right index touches Left Middle tip
    case 'I':
      return {
        name: 'LETTER_I',
        category: 'Vowel',
        metadata: { handshapeName: 'Vowel-I Touch', contact: 'Left Middle Tip', desc: 'Right index touches the tip of left middle finger' },
        leftArm: { wristX: 175, wristY: 275, rot: 30, handShape: 'open_5_spread' },
        rightArm: { wristX: 215, wristY: 255, rot: -25, handShape: 'point_index' },
        face: { brow: 'neutral', mouth: 'neutral', headY: 1, headRot: 0 },
        duration: 950
      };

    // 'L' - Right hand L-shape
    case 'L':
      return {
        name: 'LETTER_L',
        category: 'Consonant',
        metadata: { handshapeName: 'Single L-Shape', contact: 'Spatial', desc: 'Right index and thumb extended in upright L-shape' },
        leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
        rightArm: { wristX: 245, wristY: 240, rot: -10, handShape: 'two_fingers_l' },
        face: { brow: 'neutral', mouth: 'neutral', headY: 0, headRot: 0 },
        duration: 950
      };

    // 'M' - Three fingers of right hand placed on left palm
    case 'M':
      return {
        name: 'LETTER_M',
        category: 'Consonant',
        metadata: { handshapeName: '3-Finger Palm Tap', contact: 'Palmar Surface', desc: 'Three right fingers (index, middle, ring) rest on left open palm' },
        leftArm: { wristX: 180, wristY: 285, rot: 40, handShape: 'flat_palm' },
        rightArm: { wristX: 205, wristY: 260, rot: -20, handShape: 'three_fingers' },
        face: { brow: 'neutral', mouth: 'neutral', headY: 0, headRot: 0 },
        duration: 950
      };

    // 'N' - Two fingers of right hand placed on left palm
    case 'N':
      return {
        name: 'LETTER_N',
        category: 'Consonant',
        metadata: { handshapeName: '2-Finger Palm Tap', contact: 'Palmar Surface', desc: 'Two right fingers (index, middle) rest on left open palm' },
        leftArm: { wristX: 180, wristY: 285, rot: 40, handShape: 'flat_palm' },
        rightArm: { wristX: 205, wristY: 260, rot: -20, handShape: 'two_fingers_h' },
        face: { brow: 'neutral', mouth: 'neutral', headY: 0, headRot: 0 },
        duration: 950
      };

    // VOWEL 'O' - Right index touches Left Ring tip
    case 'O':
      return {
        name: 'LETTER_O',
        category: 'Vowel',
        metadata: { handshapeName: 'Vowel-O Touch', contact: 'Left Ring Tip', desc: 'Right index touches the tip of left ring finger' },
        leftArm: { wristX: 175, wristY: 275, rot: 30, handShape: 'open_5_spread' },
        rightArm: { wristX: 218, wristY: 260, rot: -25, handShape: 'point_index' },
        face: { brow: 'neutral', mouth: 'neutral', headY: 1, headRot: 0 },
        duration: 950
      };

    // 'R' - Crossed fingers resting on left palm
    case 'R':
      return {
        name: 'LETTER_R',
        category: 'Consonant',
        metadata: { handshapeName: 'R-Crossed Fingers', contact: 'Left Palm Base', desc: 'Right index and middle fingers crossed and placed on left palm' },
        leftArm: { wristX: 180, wristY: 285, rot: 40, handShape: 'flat_palm' },
        rightArm: { wristX: 205, wristY: 260, rot: -20, handShape: 'crossed_r' },
        face: { brow: 'neutral', mouth: 'neutral', headY: 0, headRot: 0 },
        duration: 950
      };

    // VOWEL 'U' - Right index touches Left Pinky tip
    case 'U':
      return {
        name: 'LETTER_U',
        category: 'Vowel',
        metadata: { handshapeName: 'Vowel-U Touch', contact: 'Left Pinky Tip', desc: 'Right index touches the tip of left pinky finger' },
        leftArm: { wristX: 175, wristY: 275, rot: 30, handShape: 'open_5_spread' },
        rightArm: { wristX: 222, wristY: 265, rot: -25, handShape: 'point_index' },
        face: { brow: 'neutral', mouth: 'neutral', headY: 1, headRot: 0 },
        duration: 950
      };

    // 'V' - Peace V resting on left palm
    case 'V':
      return {
        name: 'LETTER_V',
        category: 'Consonant',
        metadata: { handshapeName: 'V-Peace Spread', contact: 'Left Palm Base', desc: 'Right V-fingers (index + middle spread) placed on left palm' },
        leftArm: { wristX: 180, wristY: 285, rot: 40, handShape: 'flat_palm' },
        rightArm: { wristX: 205, wristY: 255, rot: -20, handShape: 'peace_v' },
        face: { brow: 'neutral', mouth: 'neutral', headY: 0, headRot: 0 },
        duration: 950
      };

    default:
      return {
        name: `LETTER_${char}`,
        category: 'Fingerspelling',
        metadata: { handshapeName: `ISL-${char}`, contact: 'Spatial', desc: `ISL Fingerspelling sign for letter ${char}` },
        leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
        rightArm: { wristX: 245, wristY: 245, rot: -15, handShape: 'open_5_spread' },
        face: { brow: 'neutral', mouth: 'neutral', headY: 0, headRot: 0 },
        duration: 950
      };
  }
}
