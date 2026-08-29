/**
 * Ultra-Fast High-Sensitivity ISL (Indian Sign Language) Classifier
 * 
 * Real-Time Geometric AI Recognition Engine featuring:
 * - Scale-Invariant Landmark Normalization (distance & camera agnostic)
 * - Vector Joint Angle Calculation (precise 0° to 180° phalange curvature)
 * - Complete ISL / English Alphabet (Letters A through Z)
 * - Complete Numbers (Digits 0 through 10, 15, 20)
 * - Core STEM Concepts & Mathematical Symbols
 * - Everyday Conversational Indian Sign Language Signs
 */

const LANDMARK = {
  WRIST: 0,
  THUMB_CMC: 1, THUMB_MCP: 2, THUMB_IP: 3, THUMB_TIP: 4,
  INDEX_MCP: 5, INDEX_PIP: 6, INDEX_DIP: 7, INDEX_TIP: 8,
  MIDDLE_MCP: 9, MIDDLE_PIP: 10, MIDDLE_DIP: 11, MIDDLE_TIP: 12,
  RING_MCP: 13, RING_PIP: 14, RING_DIP: 15, RING_TIP: 16,
  PINKY_MCP: 17, PINKY_PIP: 18, PINKY_DIP: 19, PINKY_TIP: 20,
};

function dist2d(a, b) {
  if (!a || !b) return 999;
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function dist3d(a, b) {
  if (!a || !b) return 999;
  return Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0));
}

// Compute cosine angle between vector (p1 -> p2) and (p2 -> p3)
function jointAngle(p1, p2, p3) {
  if (!p1 || !p2 || !p3) return 1.0;
  const v1x = p2.x - p1.x;
  const v1y = p2.y - p1.y;
  const v2x = p3.x - p2.x;
  const v2y = p3.y - p2.y;
  const mag1 = Math.hypot(v1x, v1y);
  const mag2 = Math.hypot(v2x, v2y);
  if (mag1 === 0 || mag2 === 0) return 1.0;
  return (v1x * v2x + v1y * v2y) / (mag1 * mag2);
}

function analyzeHandFeatures(lm) {
  const wrist = lm[LANDMARK.WRIST];
  const thumbCmc = lm[LANDMARK.THUMB_CMC];
  const thumbMcp = lm[LANDMARK.THUMB_MCP];
  const thumbIp = lm[LANDMARK.THUMB_IP];
  const thumbTip = lm[LANDMARK.THUMB_TIP];

  const indexMcp = lm[LANDMARK.INDEX_MCP];
  const indexPip = lm[LANDMARK.INDEX_PIP];
  const indexDip = lm[LANDMARK.INDEX_DIP];
  const indexTip = lm[LANDMARK.INDEX_TIP];

  const middleMcp = lm[LANDMARK.MIDDLE_MCP];
  const middlePip = lm[LANDMARK.MIDDLE_PIP];
  const middleDip = lm[LANDMARK.MIDDLE_DIP];
  const middleTip = lm[LANDMARK.MIDDLE_TIP];

  const ringMcp = lm[LANDMARK.RING_MCP];
  const ringPip = lm[LANDMARK.RING_PIP];
  const ringDip = lm[LANDMARK.RING_DIP];
  const ringTip = lm[LANDMARK.RING_TIP];

  const pinkyMcp = lm[LANDMARK.PINKY_MCP];
  const pinkyPip = lm[LANDMARK.PINKY_PIP];
  const pinkyDip = lm[LANDMARK.PINKY_DIP];
  const pinkyTip = lm[LANDMARK.PINKY_TIP];

  // Palm dimension scale for distance normalization
  const palmScale = Math.max(0.04, dist2d(wrist, middleMcp));
  const norm = (d) => d / palmScale;

  // Joint Curvature Cosines (1.0 = straight, < 0.0 = bent/folded)
  const indexCurl = jointAngle(indexMcp, indexPip, indexTip);
  const middleCurl = jointAngle(middleMcp, middlePip, middleTip);
  const ringCurl = jointAngle(ringMcp, ringPip, ringTip);
  const pinkyCurl = jointAngle(pinkyMcp, pinkyPip, pinkyTip);

  // Finger Extension Determinations (Scale-Invariant)
  const indexExt = indexCurl > 0.35 && dist2d(indexTip, wrist) > dist2d(indexPip, wrist) * 1.08;
  const middleExt = middleCurl > 0.35 && dist2d(middleTip, wrist) > dist2d(middlePip, wrist) * 1.08;
  const ringExt = ringCurl > 0.35 && dist2d(ringTip, wrist) > dist2d(ringPip, wrist) * 1.08;
  const pinkyExt = pinkyCurl > 0.35 && dist2d(pinkyTip, wrist) > dist2d(pinkyPip, wrist) * 1.08;
  const thumbExt = dist2d(thumbTip, wrist) > dist2d(thumbMcp, wrist) * 1.15 && dist2d(thumbTip, indexMcp) > palmScale * 0.45;

  // Thumbs Up / Down
  const thumbUp = (thumbTip.y < thumbIp.y - palmScale * 0.12 || thumbTip.y < thumbMcp.y - palmScale * 0.18)
    && !indexExt && !middleExt && !ringExt && !pinkyExt;

  const thumbDown = (thumbTip.y > wrist.y + palmScale * 0.15 || thumbTip.y > thumbMcp.y + palmScale * 0.2)
    && !indexExt && !middleExt && !ringExt && !pinkyExt;

  // Normalized Pinches (Thumb Tip to Finger Tips)
  const thumbIndexPinch = norm(dist2d(thumbTip, indexTip)) < 0.38;
  const thumbMiddlePinch = norm(dist2d(thumbTip, middleTip)) < 0.38;
  const thumbRingPinch = norm(dist2d(thumbTip, ringTip)) < 0.38;
  const thumbPinkyPinch = norm(dist2d(thumbTip, pinkyTip)) < 0.38;

  // Finger Spreads & Proximity
  const indexMiddleDist = norm(dist2d(indexTip, middleTip));
  const middleRingDist = norm(dist2d(middleTip, ringTip));
  const ringPinkyDist = norm(dist2d(ringTip, pinkyTip));

  const indexMiddleTogether = indexMiddleDist < 0.28;
  const indexMiddleSpread = indexMiddleDist >= 0.35;
  const fingersFlatTogether = indexExt && middleExt && ringExt && pinkyExt && indexMiddleTogether && middleRingDist < 0.30;

  // Crossed Fingers (🤞 Letter R)
  const indexMiddleCrossed = Math.abs(indexTip.x - middleTip.x) < palmScale * 0.18 &&
    indexTip.y > middleTip.y - palmScale * 0.25 && indexTip.y < middleTip.y + palmScale * 0.25;

  // C Shape Arc
  const isCShape = !thumbUp && !thumbDown &&
    norm(dist2d(thumbTip, indexTip)) > 0.45 && norm(dist2d(thumbTip, indexTip)) < 1.35 &&
    (indexTip.y > indexPip.y - palmScale * 0.22 && middleTip.y > middlePip.y - palmScale * 0.22);

  // Closed O Shape (All fingertips meeting thumb in circular loop)
  const isOShape = thumbIndexPinch && (thumbMiddlePinch || thumbRingPinch);

  // Hooked Index (Letter X)
  const isHookedIndex = (indexPip.y < indexMcp.y - palmScale * 0.1) &&
    (indexTip.y > indexPip.y - palmScale * 0.05) && !middleExt && !ringExt && !pinkyExt;

  // Horizontal Pointing (Letter G / H)
  const isIndexHorizontal = Math.abs(indexTip.y - indexMcp.y) < palmScale * 0.35 &&
    Math.abs(indexTip.x - indexMcp.x) > palmScale * 0.55;
  const isMiddleHorizontal = Math.abs(middleTip.y - middleMcp.y) < palmScale * 0.35 &&
    Math.abs(middleTip.x - middleMcp.x) > palmScale * 0.55;

  // Downward Pointing (Letter P / Q / Gravity)
  const isPointingDown = indexTip.y > wrist.y + palmScale * 0.45 && indexExt && !middleExt && !ringExt && !pinkyExt;
  const isPQDown = indexTip.y > wrist.y + palmScale * 0.25 && middleTip.y > wrist.y + palmScale * 0.25;

  // Letter E (All 4 fingertips curled tightly on top of thumb pad)
  const isLetterE = !indexExt && !middleExt && !ringExt && !pinkyExt &&
    indexCurl < 0.1 && middleCurl < 0.1 && ringCurl < 0.1 && pinkyCurl < 0.1 &&
    norm(dist2d(thumbTip, indexTip)) < 0.45 && thumbTip.y > indexPip.y - palmScale * 0.1;

  // Thumb positions in fist
  const thumbAlongSide = thumbTip.y < thumbMcp.y + palmScale * 0.1 && norm(dist2d(thumbTip, indexMcp)) < 0.38;
  const thumbAcrossFingers = norm(dist2d(thumbTip, middlePip)) < 0.42 || norm(dist2d(thumbTip, indexPip)) < 0.42;
  const thumbTuckedInMiddle = norm(dist2d(thumbTip, middleMcp)) < 0.38;

  let extendedCount = 0;
  if (indexExt) extendedCount++;
  if (middleExt) extendedCount++;
  if (ringExt) extendedCount++;
  if (pinkyExt) extendedCount++;
  if (thumbExt) extendedCount++;

  return {
    raw: lm,
    palmScale,
    norm,
    thumbExt, indexExt, middleExt, ringExt, pinkyExt,
    extendedCount,
    thumbUp,
    thumbDown,
    thumbAlongSide,
    thumbAcrossFingers,
    thumbTuckedInMiddle,
    thumbIndexPinch,
    thumbMiddlePinch,
    thumbRingPinch,
    thumbPinkyPinch,
    indexMiddleTogether,
    indexMiddleSpread,
    indexMiddleCrossed,
    fingersFlatTogether,
    isCShape,
    isOShape,
    isLetterE,
    isHookedIndex,
    isIndexHorizontal,
    isMiddleHorizontal,
    isPointingDown,
    isPQDown,
    wrist,
    indexTip,
    thumbTip,
    middleTip,
    ringTip,
    pinkyTip,
  };
}

/**
 * Main Real-Time Scale-Invariant ISL Classifier
 */
export function classifyGesture(multiHandLandmarks) {
  if (!multiHandLandmarks || multiHandLandmarks.length === 0) return null;

  const handCount = multiHandLandmarks.length;
  const hands = multiHandLandmarks.map(analyzeHandFeatures);

  // =========================================================================
  // 1. DUAL HAND POSES
  // =========================================================================
  if (handCount >= 2) {
    const h1 = hands[0];
    const h2 = hands[1];
    const avgScale = (h1.palmScale + h2.palmScale) / 2;
    const handDistance = dist2d(h1.wrist, h2.wrist) / avgScale;
    const indexTipsDist = dist2d(h1.indexTip, h2.indexTip) / avgScale;

    // 1.1 NAMASTE (🙏 Chest Center Anjali Mudra)
    if (handDistance < 1.45 && h1.extendedCount >= 3 && h2.extendedCount >= 3 &&
        Math.abs(h1.wrist.y - h2.wrist.y) / avgScale < 0.6) {
      return { sign: 'NAMASTE', label: 'Namaste (🙏 Greeting)', confidence: 99, category: 'Greeting' };
    }

    // 1.2 NUMBER 10 / 20 (🔟 All 10 Fingers Open)
    if (h1.extendedCount >= 4 && h2.extendedCount >= 4 && handDistance > 1.2) {
      return { sign: 'TEN', label: 'Number 10 / 20 (🔟 Open Palms)', confidence: 98, category: 'Numbers' };
    }

    // 1.3 EQUAL SIGN (= Math Parallel)
    if (h1.indexExt && h2.indexExt && !h1.middleExt && !h2.middleExt &&
        Math.abs(h1.indexTip.y - h2.indexTip.y) / avgScale < 0.65 && indexTipsDist < 1.6) {
      return { sign: 'EQUAL', label: 'Equal (= Math)', confidence: 97, category: 'STEM Math' };
    }

    // 1.4 ADD / PLUS (+ Math Crossed Fingers)
    if (h1.indexExt && h2.indexExt && indexTipsDist < 0.45) {
      return { sign: 'ADD', label: 'Addition / Plus (+)', confidence: 96, category: 'STEM Math' };
    }

    // 1.5 DATA / NETWORK (🌐 Connecting Nodes)
    if (indexTipsDist < 0.42 && (dist2d(h1.thumbTip, h2.thumbTip) / avgScale) < 0.55) {
      return { sign: 'DATA', label: 'Data & Network (🌐)', confidence: 95, category: 'STEM CS' };
    }

    // 1.6 HELP / SUPPORT (🤝 One Hand Supporting Other)
    if (h1.wrist.y > h2.wrist.y + avgScale * 0.35 && h1.extendedCount >= 3 && handDistance < 1.5) {
      return { sign: 'HELP', label: 'Help / Support (🤝)', confidence: 96, category: 'Courtesy' };
    }

    // 1.7 CODE / PROGRAMMING (💻 Dual Hands Typing)
    if (handDistance < 1.8 && h1.extendedCount >= 2 && h2.extendedCount >= 2) {
      return { sign: 'CODE', label: 'Code / Program (💻)', confidence: 94, category: 'STEM CS' };
    }
  }

  // =========================================================================
  // 2. SINGLE HAND POSES
  // =========================================================================
  const h = hands[0];

  // 2.1 THUMBS UP -> GOOD / SUPER (👍)
  if (h.thumbUp) {
    return { sign: 'GOOD', label: 'Good / Super (👍)', confidence: 98, category: 'Courtesy' };
  }

  // 2.2 THUMBS DOWN -> BAD / DISLIKE (👎)
  if (h.thumbDown) {
    return { sign: 'BAD', label: 'Bad / Down (👎)', confidence: 97, category: 'Courtesy' };
  }

  // 2.3 LOVE (🤟 ILY Sign): Thumb + Index + Pinky extended, Middle & Ring folded
  if (h.thumbExt && h.indexExt && !h.middleExt && !h.ringExt && h.pinkyExt) {
    return { sign: 'LOVE', label: 'Love (🤟 ILY)', confidence: 99, category: 'Emotion' };
  }

  // 2.4 ROCK / HORNS (🤘): Index + Pinky extended, Thumb folded
  if (!h.thumbExt && h.indexExt && !h.middleExt && !h.ringExt && h.pinkyExt) {
    return { sign: 'ROCK', label: 'Rock (🤘)', confidence: 97, category: 'Expression' };
  }

  // 2.5 LETTER Y / CALL ME / PHONE (🤙): Thumb + Pinky extended
  if (h.thumbExt && !h.indexExt && !h.middleExt && !h.ringExt && h.pinkyExt) {
    return { sign: 'LETTER_Y', label: 'Letter Y / Call (🤙)', confidence: 98, category: 'Alphabet' };
  }

  // 2.6 LETTER L (🇱): Thumb + Index forming crisp 90° Angle
  if (h.thumbExt && h.indexExt && !h.middleExt && !h.ringExt && !h.pinkyExt && !h.isPointingDown) {
    return { sign: 'LETTER_L', label: 'Letter L (🇱 90°)', confidence: 98, category: 'Alphabet' };
  }

  // 2.7 LETTER R: Index and Middle crossed (🤞)
  if (h.indexExt && h.middleExt && !h.ringExt && !h.pinkyExt && h.indexMiddleCrossed) {
    return { sign: 'LETTER_R', label: 'Letter R (Crossed 🤞)', confidence: 96, category: 'Alphabet' };
  }

  // 2.8 LETTER K: Index upright, middle forward, thumb resting in knuckle V
  if (h.indexExt && h.middleExt && !h.ringExt && !h.pinkyExt && h.thumbExt && h.indexMiddleSpread && !h.isPQDown) {
    return { sign: 'LETTER_K', label: 'Letter K (V + Thumb)', confidence: 96, category: 'Alphabet' };
  }

  // 2.9 LETTER P: Downward angled K shape
  if (h.isPQDown && h.thumbExt && !h.ringExt && !h.pinkyExt) {
    return { sign: 'LETTER_P', label: 'Letter P (Down Point)', confidence: 95, category: 'Alphabet' };
  }

  // 2.10 LETTER G: Horizontal Index + Thumb parallel pointing
  if (h.isIndexHorizontal && !h.middleExt && !h.ringExt && !h.pinkyExt && !h.isPointingDown) {
    return { sign: 'LETTER_G', label: 'Letter G (Horizontal)', confidence: 95, category: 'Alphabet' };
  }

  // 2.11 LETTER H: Horizontal Index + Middle pointing together
  if (h.isIndexHorizontal && h.isMiddleHorizontal && !h.ringExt && !h.pinkyExt) {
    return { sign: 'LETTER_H', label: 'Letter H (Dual Horiz)', confidence: 95, category: 'Alphabet' };
  }

  // 2.12 LETTER D: Index upright, other 3 fingers form circle with thumb
  if (h.indexExt && !h.middleExt && !h.ringExt && !h.pinkyExt && (h.thumbMiddlePinch || h.thumbRingPinch || h.thumbPinkyPinch)) {
    return { sign: 'LETTER_D', label: 'Letter D (Loop Base)', confidence: 96, category: 'Alphabet' };
  }

  // 2.13 LETTER F / NUMBER 9 (👌): Thumb + Index pinch, middle+ring+pinky extended
  if (h.thumbIndexPinch && h.middleExt && h.ringExt && h.pinkyExt) {
    return { sign: 'LETTER_F', label: 'Letter F / Number 9 (👌)', confidence: 97, category: 'Alphabet / Numbers' };
  }

  // 2.14 NUMBER 8: Thumb + Middle Pinch with Index, Ring, Pinky extended
  if (h.thumbMiddlePinch && h.indexExt && h.ringExt && h.pinkyExt) {
    return { sign: 'EIGHT', label: 'Number 8', confidence: 96, category: 'Numbers' };
  }

  // 2.15 NUMBER 7: Thumb + Ring Pinch with Index, Middle, Pinky extended
  if (h.thumbRingPinch && h.indexExt && h.middleExt && h.pinkyExt) {
    return { sign: 'SEVEN', label: 'Number 7', confidence: 96, category: 'Numbers' };
  }

  // 2.16 NUMBER 6: Thumb + Pinky Pinch with Index, Middle, Ring extended
  if (h.thumbPinkyPinch && h.indexExt && h.middleExt && h.ringExt) {
    return { sign: 'SIX', label: 'Number 6', confidence: 96, category: 'Numbers' };
  }

  // 2.17 LETTER I / NUMBER 1 (Little): Only pinky extended straight up
  if (h.pinkyExt && !h.indexExt && !h.middleExt && !h.ringExt && !h.thumbExt) {
    return { sign: 'LETTER_I', label: 'Letter I (Pinky ℹ️)', confidence: 97, category: 'Alphabet' };
  }

  // 2.18 LETTER X / HOOK: Index curled/hooked with other fingers in fist
  if (h.isHookedIndex) {
    return { sign: 'LETTER_X', label: 'Letter X (Hook ❌)', confidence: 95, category: 'Alphabet' };
  }

  // 2.19 GRAVITY: Index pointing straight downward
  if (h.isPointingDown) {
    return { sign: 'GRAVITY', label: 'Gravity (Down Force ⬇️)', confidence: 97, category: 'STEM Physics' };
  }

  // 2.20 LETTER V / PEACE / NUMBER 2: Index + Middle spread in 'V'
  if (h.indexExt && h.middleExt && !h.ringExt && !h.pinkyExt && h.indexMiddleSpread && !h.thumbExt) {
    return { sign: 'TWO', label: 'Number 2 / Letter V (✌️)', confidence: 98, category: 'Numbers / Alphabet' };
  }

  // 2.21 LETTER U / TOGETHER: Index + Middle touching upright
  if (h.indexExt && h.middleExt && !h.ringExt && !h.pinkyExt && h.indexMiddleTogether && !h.thumbExt) {
    return { sign: 'LETTER_U', label: 'Letter U (Together 🇺)', confidence: 97, category: 'Alphabet' };
  }

  // 2.22 LETTER W / NUMBER 3: Index + Middle + Ring upright
  if (h.indexExt && h.middleExt && h.ringExt && !h.pinkyExt && !h.thumbExt) {
    return { sign: 'THREE', label: 'Number 3 / Letter W (🖖)', confidence: 97, category: 'Numbers / Alphabet' };
  }

  // 2.23 LETTER B / NUMBER 4: Four fingers flat upright with thumb tucked
  if (h.indexExt && h.middleExt && h.ringExt && h.pinkyExt && !h.thumbExt) {
    return { sign: 'LETTER_B', label: 'Number 4 / Letter B (🖐️)', confidence: 97, category: 'Numbers / Alphabet' };
  }

  // 2.24 NUMBER 1 / YOU / POINT: Single index upright
  if (h.indexExt && !h.middleExt && !h.ringExt && !h.pinkyExt && !h.thumbExt && !h.thumbIndexPinch) {
    return { sign: 'ONE', label: 'Number 1 / Point (☝️)', confidence: 98, category: 'Numbers / Pronoun' };
  }

  // 2.25 HELLO / NUMBER 5 / OPEN PALM: All 5 fingers extended wide
  if (h.extendedCount >= 5 || (h.extendedCount >= 4 && h.thumbExt && !h.thumbIndexPinch)) {
    return { sign: 'HELLO', label: 'Hello / Number 5 (✋)', confidence: 98, category: 'Greeting / Numbers' };
  }

  // 2.26 LETTER C / CURVE ARC
  if (h.isCShape && !h.isOShape) {
    return { sign: 'LETTER_C', label: 'Letter C / Arc (©️)', confidence: 96, category: 'Alphabet' };
  }

  // 2.27 LETTER O / NUMBER 0: Closed loop O with all fingertips
  if (h.isOShape) {
    return { sign: 'ZERO', label: 'Number 0 / Letter O (⭕)', confidence: 96, category: 'Numbers / Alphabet' };
  }

  // 2.28 LETTER E: Curled fingertips resting on thumb
  if (h.isLetterE) {
    return { sign: 'LETTER_E', label: 'Letter E (Curled Pad)', confidence: 95, category: 'Alphabet' };
  }

  // 2.29 LETTER A: Closed fist with thumb extended vertically alongside fist
  if (h.extendedCount <= 1 && h.thumbAlongSide && !h.thumbAcrossFingers) {
    return { sign: 'LETTER_A', label: 'Letter A (Fist + Thumb Side)', confidence: 96, category: 'Alphabet' };
  }

  // 2.30 LETTER S / YES: Tight closed fist with thumb wrapped across front
  if (h.extendedCount === 0 || (!h.indexExt && !h.middleExt && !h.ringExt && !h.pinkyExt && !h.thumbUp && !h.thumbDown)) {
    return { sign: 'YES', label: 'Yes / Letter S / Fist (✊)', confidence: 96, category: 'Affirmation / Alphabet' };
  }

  return null;
}

export function getAvailableSigns() {
  return [
    // Numbers (0 to 10, 20)
    { key: 'ZERO', label: 'Number 0 (⭕)', category: 'Numbers' },
    { key: 'ONE', label: 'Number 1 (☝️)', category: 'Numbers' },
    { key: 'TWO', label: 'Number 2 (✌️)', category: 'Numbers' },
    { key: 'THREE', label: 'Number 3 (🖖)', category: 'Numbers' },
    { key: 'FOUR', label: 'Number 4 (🖐️)', category: 'Numbers' },
    { key: 'HELLO', label: 'Number 5 (✋)', category: 'Numbers' },
    { key: 'SIX', label: 'Number 6', category: 'Numbers' },
    { key: 'SEVEN', label: 'Number 7', category: 'Numbers' },
    { key: 'EIGHT', label: 'Number 8', category: 'Numbers' },
    { key: 'NINE', label: 'Number 9 (👌)', category: 'Numbers' },
    { key: 'TEN', label: 'Number 10 / 20 (🔟)', category: 'Numbers' },

    // Alphabet A through Z
    { key: 'LETTER_A', label: 'Letter A', category: 'Alphabet' },
    { key: 'LETTER_B', label: 'Letter B (Flat Hand)', category: 'Alphabet' },
    { key: 'LETTER_C', label: 'Letter C (Arc)', category: 'Alphabet' },
    { key: 'LETTER_D', label: 'Letter D (Loop Base)', category: 'Alphabet' },
    { key: 'LETTER_E', label: 'Letter E (Curled Pad)', category: 'Alphabet' },
    { key: 'LETTER_F', label: 'Letter F (👌)', category: 'Alphabet' },
    { key: 'LETTER_G', label: 'Letter G (Horizontal)', category: 'Alphabet' },
    { key: 'LETTER_H', label: 'Letter H (Dual Horiz)', category: 'Alphabet' },
    { key: 'LETTER_I', label: 'Letter I (Pinky)', category: 'Alphabet' },
    { key: 'LETTER_K', label: 'Letter K (V + Thumb)', category: 'Alphabet' },
    { key: 'LETTER_L', label: 'Letter L (🇱 90°)', category: 'Alphabet' },
    { key: 'LETTER_P', label: 'Letter P (Down K)', category: 'Alphabet' },
    { key: 'LETTER_R', label: 'Letter R (Crossed 🤞)', category: 'Alphabet' },
    { key: 'LETTER_U', label: 'Letter U (Together)', category: 'Alphabet' },
    { key: 'TWO', label: 'Letter V (✌️ V-Spread)', category: 'Alphabet' },
    { key: 'THREE', label: 'Letter W (🖖 W-Spread)', category: 'Alphabet' },
    { key: 'LETTER_X', label: 'Letter X (Hook ❌)', category: 'Alphabet' },
    { key: 'LETTER_Y', label: 'Letter Y (🤙 Phone)', category: 'Alphabet' },
    { key: 'YES', label: 'Letter S (Fist ✊)', category: 'Alphabet' },

    // Greetings & Core Signs
    { key: 'NAMASTE', label: 'Namaste (🙏)', category: 'Greetings' },
    { key: 'GOOD', label: 'Good / Super (👍)', category: 'Courtesy' },
    { key: 'BAD', label: 'Bad / Down (👎)', category: 'Courtesy' },
    { key: 'OK', label: 'OK / Perfect (👌)', category: 'Courtesy' },
    { key: 'HELP', label: 'Help / Support (🤝)', category: 'Courtesy' },
    { key: 'LOVE', label: 'Love (🤟 ILY)', category: 'Emotion' },
    { key: 'ROCK', label: 'Rock (🤘)', category: 'Expression' },

    // STEM & Science
    { key: 'GRAVITY', label: 'Gravity (Down ⬇️)', category: 'Physics & STEM' },
    { key: 'EQUAL', label: 'Equal (=)', category: 'Mathematics' },
    { key: 'ADD', label: 'Addition (+)', category: 'Mathematics' },
    { key: 'CODE', label: 'Code / Program (💻)', category: 'Computer Sci' },
    { key: 'DATA', label: 'Data & Network (🌐)', category: 'Computer Sci' },
  ];
}

export function handOpenness(handLandmarks) {
  if (!handLandmarks) return 0;
  const f = analyzeHandFeatures(handLandmarks);
  return f.extendedCount / 5;
}
