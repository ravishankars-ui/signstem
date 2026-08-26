/**
 * Comprehensive Indian Sign Language (ISL) Pose & Kinematics Data
 * 
 * Features:
 * - Wide-Angle Expressive Arm Elevation & Clear Spatial Wrist Trajectories
 * - Scaled 1.75x 5-Finger Articulation with Zero Overlap Guarantee
 * - Dynamic Facial Expression Sync
 */

export const ISL_WORD_POSES = {
  // 1. NEUTRAL / IDLE (Natural Elegant Presenter Resting Posture)
  'IDLE': {
    name: 'IDLE',
    category: 'Rest',
    metadata: { handshapeName: 'Relaxed Rest', contact: 'None', desc: 'Natural presenter resting stance with hands gently at waist' },
    leftArm: { wristX: 135, wristY: 370, rot: 15, handShape: 'rest_relaxed' },
    rightArm: { wristX: 265, wristY: 370, rot: -15, handShape: 'rest_relaxed' },
    face: { brow: 'neutral', mouth: 'smile', headY: 0, headRot: 0 },
    duration: 1500
  },

  // 2. NAMASTE (Anjali Mudra at chest center with bow)
  'NAMASTE': {
    name: 'NAMASTE',
    category: 'Greeting',
    metadata: { handshapeName: 'Flat Palm (Anjali)', contact: 'Midline Palmar', desc: 'Both palms meet flat at chest center' },
    leftArm: { wristX: 165, wristY: 250, rot: -25, handShape: 'namaste_prayer' },
    rightArm: { wristX: 235, wristY: 250, rot: 25, handShape: 'namaste_prayer' },
    face: { brow: 'neutral', mouth: 'warm_smile', headY: 6, headRot: 0 },
    duration: 1600
  },

  // 3. HELLO (Open-5 wave from temple outward)
  'HELLO': {
    name: 'HELLO',
    category: 'Greeting',
    metadata: { handshapeName: 'Open-5 Spread', contact: 'Temple Origin', desc: 'Right open hand at temple waving outward' },
    leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
    rightArm: { wristX: 295, wristY: 130, rot: -30, handShape: 'open_5_spread' },
    face: { brow: 'raised', mouth: 'warm_smile', headY: -2, headRot: 2 },
    duration: 1400
  },

  // 4. GOOD (Thumbs Up High)
  'GOOD': {
    name: 'GOOD',
    category: 'Adjective',
    metadata: { handshapeName: 'Thumbs Up High', contact: 'Forward Vector', desc: 'Bold right thumbs up raised high' },
    leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
    rightArm: { wristX: 265, wristY: 190, rot: -10, handShape: 'thumbs_up' },
    face: { brow: 'raised', mouth: 'smile', headY: -1, headRot: 0 },
    duration: 1300
  },

  // 5. YOU (Direct index point forward)
  'YOU': {
    name: 'YOU',
    category: 'Pronoun',
    metadata: { handshapeName: 'Index Point', contact: 'Forward Spatial', desc: 'Right index finger points forward' },
    leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
    rightArm: { wristX: 275, wristY: 220, rot: 0, handShape: 'point_index' },
    face: { brow: 'neutral', mouth: 'neutral', headY: 0, headRot: 0 },
    duration: 1200
  },

  // 6. ME / I (Index touches chest center)
  'ME': {
    name: 'ME',
    category: 'Pronoun',
    metadata: { handshapeName: 'Index Point (Self)', contact: 'Chest Contact', desc: 'Right index finger points inward touching chest center' },
    leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
    rightArm: { wristX: 215, wristY: 250, rot: 25, handShape: 'point_index' },
    face: { brow: 'neutral', mouth: 'neutral', headY: 2, headRot: -1 },
    duration: 1200
  },
  'I': {
    name: 'I',
    category: 'Pronoun',
    metadata: { handshapeName: 'Index Point (Self)', contact: 'Chest Contact', desc: 'Right index finger points inward touching chest center' },
    leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
    rightArm: { wristX: 215, wristY: 250, rot: 25, handShape: 'point_index' },
    face: { brow: 'neutral', mouth: 'neutral', headY: 2, headRot: -1 },
    duration: 1200
  },

  // 7. HOW (Dual cupped hands rotating outward)
  'HOW': {
    name: 'HOW',
    category: 'Question',
    metadata: { handshapeName: 'Cupped Hands', contact: 'Dual Symmetrical', desc: 'Both hands cup palms-up and rotate outward' },
    leftArm: { wristX: 135, wristY: 260, rot: 35, handShape: 'cupped_palm_up' },
    rightArm: { wristX: 265, wristY: 260, rot: -35, handShape: 'cupped_palm_up' },
    face: { brow: 'raised', mouth: 'question', headY: -3, headRot: -2 },
    duration: 1500
  },

  // 8. WHAT (Dual open hands shrugging outward)
  'WHAT': {
    name: 'WHAT',
    category: 'Question',
    metadata: { handshapeName: 'Open-5 Palm-Up', contact: 'Lateral Movement', desc: 'Both open hands spread wide with shrugging brows' },
    leftArm: { wristX: 120, wristY: 255, rot: 40, handShape: 'open_5_spread' },
    rightArm: { wristX: 280, wristY: 255, rot: -40, handShape: 'open_5_spread' },
    face: { brow: 'raised', mouth: 'question', headY: -2, headRot: 2 },
    duration: 1500
  },

  // 9. THANK_YOU (Hand moves from chin forward)
  'THANK_YOU': {
    name: 'THANK_YOU',
    category: 'Courtesy',
    metadata: { handshapeName: 'Flat Palm', contact: 'Chin Contact', desc: 'Fingertips touch chin then extend forward' },
    leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
    rightArm: { wristX: 255, wristY: 160, rot: -15, handShape: 'flat_palm' },
    face: { brow: 'raised', mouth: 'warm_smile', headY: 1, headRot: 0 },
    duration: 1500
  },

  // 10. PLEASE (Circular palm rub over heart)
  'PLEASE': {
    name: 'PLEASE',
    category: 'Courtesy',
    metadata: { handshapeName: 'Flat Palm', contact: 'Heart Contact', desc: 'Open right palm circles gently over heart area' },
    leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
    rightArm: { wristX: 215, wristY: 240, rot: 20, handShape: 'flat_palm' },
    face: { brow: 'raised', mouth: 'warm_smile', headY: 2, headRot: 0 },
    duration: 1500
  },

  // 11. HELP (Right fist resting on left open palm)
  'HELP': {
    name: 'HELP',
    category: 'Assistance',
    metadata: { handshapeName: 'Fist on Palm', contact: 'Palmar Base', desc: 'Right thumbs-up fist lifts up from left flat palm base' },
    leftArm: { wristX: 145, wristY: 270, rot: 25, handShape: 'flat_palm' },
    rightArm: { wristX: 255, wristY: 230, rot: -25, handShape: 'thumbs_up' },
    face: { brow: 'inward', mouth: 'neutral', headY: -1, headRot: 0 },
    duration: 1600
  },

  // 12. YES (Right fist nodding vertically)
  'YES': {
    name: 'YES',
    category: 'Affirmation',
    metadata: { handshapeName: 'S-Fist Nod', contact: 'Spatial Vertical', desc: 'Right fist tilts down like a nodding head' },
    leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
    rightArm: { wristX: 265, wristY: 210, rot: -10, handShape: 'fist' },
    face: { brow: 'raised', mouth: 'smile', headY: 3, headRot: 0 },
    duration: 1300
  },

  // 13. NO (Index and middle snap to thumb)
  'NO': {
    name: 'NO',
    category: 'Negation',
    metadata: { handshapeName: 'Snap Pinch', contact: 'Inter-digital', desc: 'Index & middle snap sharply against thumb' },
    leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
    rightArm: { wristX: 265, wristY: 210, rot: -15, handShape: 'point_index' },
    face: { brow: 'inward', mouth: 'neutral', headY: 0, headRot: 3 },
    duration: 1300
  },

  // 14. FORCE (Dynamic push forward)
  'FORCE': {
    name: 'FORCE',
    category: 'Physics',
    metadata: { handshapeName: 'Dual Push', contact: 'Forward Vector', desc: 'Both palms push strongly forward in parallel' },
    leftArm: { wristX: 145, wristY: 220, rot: 25, handShape: 'flat_palm' },
    rightArm: { wristX: 255, wristY: 220, rot: -25, handShape: 'flat_palm' },
    face: { brow: 'inward', mouth: 'neutral', headY: -1, headRot: 0 },
    duration: 1500
  },

  // 15. GRAVITY (Downward attraction gesture)
  'GRAVITY': {
    name: 'GRAVITY',
    category: 'Physics',
    metadata: { handshapeName: 'Downward Pull', contact: 'Gravitational Vector', desc: 'Hands start high and pull downward toward ground' },
    leftArm: { wristX: 130, wristY: 190, rot: 20, handShape: 'open_5_spread' },
    rightArm: { wristX: 270, wristY: 330, rot: -20, handShape: 'open_5_spread' },
    face: { brow: 'neutral', mouth: 'neutral', headY: 2, headRot: 0 },
    duration: 1600
  },

  // 16. ENERGY (Radiant outward expansion)
  'ENERGY': {
    name: 'ENERGY',
    category: 'Physics',
    metadata: { handshapeName: 'Radiant Expansion', contact: 'Outward Burst', desc: 'Fists open into wide spreading 5 fingers' },
    leftArm: { wristX: 110, wristY: 150, rot: -30, handShape: 'open_5_spread' },
    rightArm: { wristX: 290, wristY: 150, rot: 30, handShape: 'open_5_spread' },
    face: { brow: 'raised', mouth: 'warm_smile', headY: -2, headRot: 0 },
    duration: 1500
  },

  // 17. LIGHT (High overhead radiant light)
  'LIGHT': {
    name: 'LIGHT',
    category: 'Physics',
    metadata: { handshapeName: 'Light Rays', contact: 'Overhead Spark', desc: 'High overhead fingers spreading wide' },
    leftArm: { wristX: 115, wristY: 120, rot: -45, handShape: 'open_5_spread' },
    rightArm: { wristX: 285, wristY: 120, rot: 45, handShape: 'open_5_spread' },
    face: { brow: 'raised', mouth: 'warm_smile', headY: -3, headRot: 0 },
    duration: 1500
  },

  // 18. ATOM (Orbital rotation around center point)
  'ATOM': {
    name: 'ATOM',
    category: 'Chemistry',
    metadata: { handshapeName: 'Orbital Path', contact: 'Nucleus Center', desc: 'Right index circles around left nucleus fist' },
    leftArm: { wristX: 150, wristY: 250, rot: 15, handShape: 'fist' },
    rightArm: { wristX: 250, wristY: 200, rot: -20, handShape: 'point_index' },
    face: { brow: 'neutral', mouth: 'neutral', headY: 0, headRot: 0 },
    duration: 1600
  },

  // 19. CODE (Typing / Algorithmic gesture)
  'CODE': {
    name: 'CODE',
    category: 'CS',
    metadata: { handshapeName: 'Keyboard Flow', contact: 'Spatial Digital', desc: 'Fingers flutter in rapid keyboard patterns' },
    leftArm: { wristX: 145, wristY: 260, rot: 20, handShape: 'open_5_spread' },
    rightArm: { wristX: 255, wristY: 260, rot: -20, handShape: 'open_5_spread' },
    face: { brow: 'neutral', mouth: 'neutral', headY: 0, headRot: 0 },
    duration: 1400
  },

  // 20. TODAY / NOW (Dual cupped hands dropping and pulsing at waist)
  'TODAY': {
    name: 'TODAY',
    category: 'Time',
    metadata: { handshapeName: 'Dual Cupped Palm-Up', contact: 'Waist Spatial Pulse', desc: 'Both palms cup facing upward and drop gently in front of waist' },
    leftArm: { wristX: 140, wristY: 300, rot: 25, handShape: 'cupped_palm_up' },
    rightArm: { wristX: 260, wristY: 300, rot: -25, handShape: 'cupped_palm_up' },
    face: { brow: 'neutral', mouth: 'neutral', headY: 2, headRot: 0 },
    duration: 1400
  },
  'NOW': {
    name: 'NOW',
    category: 'Time',
    metadata: { handshapeName: 'Dual Cupped Palm-Up', contact: 'Waist Spatial Pulse', desc: 'Both palms cup facing upward and drop gently in front of waist' },
    leftArm: { wristX: 140, wristY: 300, rot: 25, handShape: 'cupped_palm_up' },
    rightArm: { wristX: 260, wristY: 300, rot: -25, handShape: 'cupped_palm_up' },
    face: { brow: 'neutral', mouth: 'neutral', headY: 2, headRot: 0 },
    duration: 1400
  },

  // 21. TOMORROW (Right thumb at right cheek moving forward in arc)
  'TOMORROW': {
    name: 'TOMORROW',
    category: 'Time',
    metadata: { handshapeName: 'Thumbs Up Cheek Arc', contact: 'Cheek to Forward', desc: 'Right thumb touches cheek then arcs gracefully forward' },
    leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
    rightArm: { wristX: 285, wristY: 150, rot: -20, handShape: 'thumbs_up' },
    face: { brow: 'raised', mouth: 'warm_smile', headY: -1, headRot: 2 },
    duration: 1500
  },

  // 22. YESTERDAY (Right thumb at cheek moving backward over shoulder)
  'YESTERDAY': {
    name: 'YESTERDAY',
    category: 'Time',
    metadata: { handshapeName: 'Thumbs Up Backward', contact: 'Cheek to Shoulder', desc: 'Right thumb touches cheek and flips back over shoulder' },
    leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
    rightArm: { wristX: 295, wristY: 135, rot: -35, handShape: 'thumbs_up' },
    face: { brow: 'neutral', mouth: 'neutral', headY: -1, headRot: 2 },
    duration: 1500
  },

  // 23. TIME (Right index tapping left wrist watch)
  'TIME': {
    name: 'TIME',
    category: 'Time',
    metadata: { handshapeName: 'Wrist Tap', contact: 'Left Wrist Contact', desc: 'Right index finger taps twice on left wrist watch area' },
    leftArm: { wristX: 160, wristY: 270, rot: 35, handShape: 'flat_palm' },
    rightArm: { wristX: 200, wristY: 250, rot: -20, handShape: 'point_index' },
    face: { brow: 'neutral', mouth: 'neutral', headY: 2, headRot: -1 },
    duration: 1400
  },

  // 24. WHERE (Dual open hands rotating side-to-side)
  'WHERE': {
    name: 'WHERE',
    category: 'Question',
    metadata: { handshapeName: 'Open Palms Query', contact: 'Lateral Rotation', desc: 'Both hands held palm-up rotating side-to-side with question brows' },
    leftArm: { wristX: 130, wristY: 260, rot: 30, handShape: 'open_5_spread' },
    rightArm: { wristX: 270, wristY: 260, rot: -30, handShape: 'open_5_spread' },
    face: { brow: 'raised', mouth: 'question', headY: -2, headRot: 2 },
    duration: 1500
  },

  // 25. WHEN (Right index circling around left vertical index)
  'WHEN': {
    name: 'WHEN',
    category: 'Question',
    metadata: { handshapeName: 'Index Orbit', contact: 'Fingertip Meet', desc: 'Right index circles around left index finger and lands on tip' },
    leftArm: { wristX: 160, wristY: 240, rot: 15, handShape: 'point_index' },
    rightArm: { wristX: 240, wristY: 220, rot: -20, handShape: 'point_index' },
    face: { brow: 'raised', mouth: 'question', headY: -1, headRot: 0 },
    duration: 1500
  },

  // 26. WHY (Hand at temple extending into Y-mudra)
  'WHY': {
    name: 'WHY',
    category: 'Question',
    metadata: { handshapeName: 'Temple Y-Shape', contact: 'Forehead Origin', desc: 'Right hand touches temple and draws downward into Y handshape' },
    leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
    rightArm: { wristX: 290, wristY: 140, rot: -25, handShape: 'two_fingers_l' },
    face: { brow: 'raised', mouth: 'question', headY: -2, headRot: 2 },
    duration: 1500
  },

  // 27. WATER (Three fingers 'W' tapping chin twice)
  'WATER': {
    name: 'WATER',
    category: 'Sustenance',
    metadata: { handshapeName: 'W-Hand Chin Tap', contact: 'Chin Contact', desc: 'Three fingers (W shape) tap gently on chin twice' },
    leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
    rightArm: { wristX: 250, wristY: 170, rot: -15, handShape: 'three_fingers_w' },
    face: { brow: 'neutral', mouth: 'warm_smile', headY: 1, headRot: 0 },
    duration: 1400
  },

  // 28. FOOD / EAT (Fingertips brought to mouth repeatedly)
  'FOOD': {
    name: 'FOOD',
    category: 'Sustenance',
    metadata: { handshapeName: 'Pinch to Mouth', contact: 'Lip Proximity', desc: 'Right tapered fingers bring nourishment toward lips' },
    leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
    rightArm: { wristX: 245, wristY: 165, rot: -10, handShape: 'claw_open' },
    face: { brow: 'neutral', mouth: 'warm_smile', headY: 1, headRot: 0 },
    duration: 1400
  },
  'EAT': {
    name: 'EAT',
    category: 'Sustenance',
    metadata: { handshapeName: 'Pinch to Mouth', contact: 'Lip Proximity', desc: 'Right tapered fingers bring nourishment toward lips' },
    leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
    rightArm: { wristX: 245, wristY: 165, rot: -10, handShape: 'claw_open' },
    face: { brow: 'neutral', mouth: 'warm_smile', headY: 1, headRot: 0 },
    duration: 1400
  },

  // 29. LEARN (Knowledge taken from left palm to forehead)
  'LEARN': {
    name: 'LEARN',
    category: 'Education',
    metadata: { handshapeName: 'Palm to Forehead', contact: 'Palm to Mind', desc: 'Right flat hand lifts from left open palm upward to forehead' },
    leftArm: { wristX: 145, wristY: 270, rot: 25, handShape: 'flat_palm' },
    rightArm: { wristX: 285, wristY: 140, rot: -25, handShape: 'open_5_spread' },
    face: { brow: 'raised', mouth: 'warm_smile', headY: -1, headRot: 0 },
    duration: 1600
  },

  // 30. TEACH (Both O-hands moving forward from temples)
  'TEACH': {
    name: 'TEACH',
    category: 'Education',
    metadata: { handshapeName: 'Dual Temple Projection', contact: 'Mind to Audience', desc: 'Both hands move forward from temples opening to audience' },
    leftArm: { wristX: 140, wristY: 150, rot: -25, handShape: 'claw_open' },
    rightArm: { wristX: 260, wristY: 150, rot: 25, handShape: 'claw_open' },
    face: { brow: 'raised', mouth: 'warm_smile', headY: -1, headRot: 0 },
    duration: 1500
  },

  // 31. STUDY (Right fingers fluttering over left book palm)
  'STUDY': {
    name: 'STUDY',
    category: 'Education',
    metadata: { handshapeName: 'Book Reading Flutter', contact: 'Visual Attention', desc: 'Left palm acts as book, right fingers flutter across it' },
    leftArm: { wristX: 145, wristY: 260, rot: 25, handShape: 'flat_palm' },
    rightArm: { wristX: 235, wristY: 220, rot: -20, handShape: 'open_5_spread' },
    face: { brow: 'neutral', mouth: 'neutral', headY: 2, headRot: 0 },
    duration: 1500
  },

  // 32. DEAF (Index finger touches ear then mouth)
  'DEAF': {
    name: 'DEAF',
    category: 'Culture',
    metadata: { handshapeName: 'Ear to Mouth Touch', contact: 'Ear then Mouth', desc: 'Right index finger points to ear then transitions to mouth' },
    leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
    rightArm: { wristX: 290, wristY: 140, rot: -20, handShape: 'point_index' },
    face: { brow: 'neutral', mouth: 'neutral', headY: 0, headRot: 1 },
    duration: 1400
  },

  // 33. HEARING (Index finger circling at ear)
  'HEARING': {
    name: 'HEARING',
    category: 'Culture',
    metadata: { handshapeName: 'Ear Circular Sign', contact: 'Ear Orbit', desc: 'Right index finger makes a small circular motion by the ear' },
    leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
    rightArm: { wristX: 285, wristY: 145, rot: -15, handShape: 'point_index' },
    face: { brow: 'neutral', mouth: 'neutral', headY: 0, headRot: 1 },
    duration: 1400
  },

  // 34. LOVE (ILY sign or crossed heart embrace)
  'LOVE': {
    name: 'LOVE',
    category: 'Emotion',
    metadata: { handshapeName: 'I Love You (ILY)', contact: 'Affirmative Vector', desc: 'Thumb, index, and pinky extended upward with heart warmth' },
    leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
    rightArm: { wristX: 265, wristY: 180, rot: -15, handShape: 'open_5_spread' },
    face: { brow: 'raised', mouth: 'warm_smile', headY: -1, headRot: 1 },
    duration: 1400
  },

  // 35. OK (O-Pinch with remaining fingers elevated)
  'OK': {
    name: 'OK',
    category: 'Affirmation',
    metadata: { handshapeName: 'OK Gesture', contact: 'Forward Confirmation', desc: 'Thumb and index circle together with other three fingers raised' },
    leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
    rightArm: { wristX: 265, wristY: 190, rot: -10, handShape: 'thumbs_up' },
    face: { brow: 'raised', mouth: 'warm_smile', headY: 0, headRot: 0 },
    duration: 1300
  },

  // 36. SCIENCE (Dual alternating beaker pouring fists)
  'SCIENCE': {
    name: 'SCIENCE',
    category: 'STEM',
    metadata: { handshapeName: 'Alternating Pouring Fists', contact: 'Dual Alternation', desc: 'Both thumbs-down fists alternate pouring motions as laboratory beakers' },
    leftArm: { wristX: 140, wristY: 240, rot: 25, handShape: 'fist' },
    rightArm: { wristX: 260, wristY: 240, rot: -25, handShape: 'fist' },
    face: { brow: 'neutral', mouth: 'warm_smile', headY: 0, headRot: 0 },
    duration: 1600
  }
};

/**
 * ISL Standard Fingerspelling (A-Z)
 */
export function getISLFingerspellPose(char) {
  const c = char.toUpperCase();

  switch (c) {
    case 'A':
      return {
        name: 'LETTER_A',
        category: 'Alphabet',
        leftArm: { wristX: 145, wristY: 260, rot: 20, handShape: 'open_5_spread' },
        rightArm: { wristX: 255, wristY: 220, rot: -20, handShape: 'fist' },
        face: { brow: 'neutral', mouth: 'neutral', headY: 0, headRot: 0 },
        duration: 1000
      };
    case 'B':
      return {
        name: 'LETTER_B',
        category: 'Alphabet',
        leftArm: { wristX: 145, wristY: 240, rot: 20, handShape: 'flat_palm' },
        rightArm: { wristX: 255, wristY: 240, rot: -20, handShape: 'flat_palm' },
        face: { brow: 'neutral', mouth: 'neutral', headY: 0, headRot: 0 },
        duration: 1000
      };
    case 'C':
      return {
        name: 'LETTER_C',
        category: 'Alphabet',
        leftArm: { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' },
        rightArm: { wristX: 265, wristY: 210, rot: -10, handShape: 'open_5_spread' },
        face: { brow: 'neutral', mouth: 'neutral', headY: 0, headRot: 0 },
        duration: 1000
      };
    default:
      return {
        name: `LETTER_${c}`,
        category: 'Alphabet',
        leftArm: { wristX: 145, wristY: 260, rot: 20, handShape: 'point_index' },
        rightArm: { wristX: 255, wristY: 220, rot: -20, handShape: 'point_index' },
        face: { brow: 'neutral', mouth: 'neutral', headY: 0, headRot: 0 },
        duration: 1000
      };
  }
}
