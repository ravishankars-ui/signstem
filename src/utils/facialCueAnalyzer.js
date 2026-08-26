/**
 * Facial & Non-Manual Cue Analyzer for SignSTEM (Section 12 of Spec)
 * 
 * Analyzes non-manual signals in Sign Language:
 * 1. Eyebrow raise (Question tag / WH-query / Topic marker)
 * 2. Head nod (Affirmation / Positive assertion)
 * 3. Head shake (Negation / Negative assertion)
 * 4. Head tilt / Expression intensity
 */

/**
 * Evaluates facial landmarks or head pose parameters for ISL non-manual grammatical cues.
 * 
 * @param {Array<{x: number, y: number, z: number}>} [faceLandmarks] MediaPipe face keypoints
 * @param {Array<Object>} [historyFrames] History of past head positions
 * @returns {{
 *   eyebrowRaised: boolean,
 *   headMotion: 'NOD' | 'SHAKE' | 'STILL',
 *   grammarMarker: 'QUESTION' | 'AFFIRMATION' | 'NEGATION' | 'NEUTRAL',
 *   expressionIntensity: number
 * }}
 */
export function analyzeFacialCues(faceLandmarks = null, historyFrames = []) {
  if (!faceLandmarks || faceLandmarks.length < 10) {
    return {
      eyebrowRaised: false,
      headMotion: 'STILL',
      grammarMarker: 'NEUTRAL',
      expressionIntensity: 0
    };
  }

  // 1. Eyebrow Raise Analysis
  // Left eyebrow: landmark 70, Left eye upper: landmark 159
  // Right eyebrow: landmark 300, Right eye upper: landmark 386
  const leftEyebrowY = faceLandmarks[70]?.y || 0;
  const leftEyeY = faceLandmarks[159]?.y || 0;
  const distEyebrowEye = Math.abs(leftEyeY - leftEyebrowY);

  const eyebrowRaised = distEyebrowEye > 0.045;

  // 2. Head Motion Analysis (Nod vs Shake)
  let headMotion = 'STILL';
  if (historyFrames.length >= 4) {
    const prevY = historyFrames[historyFrames.length - 1]?.noseY || 0;
    const currY = faceLandmarks[1]?.y || 0;
    const dy = Math.abs(currY - prevY);

    const prevX = historyFrames[historyFrames.length - 1]?.noseX || 0;
    const currX = faceLandmarks[1]?.x || 0;
    const dx = Math.abs(currX - prevX);

    if (dy > 0.025 && dy > dx * 1.5) {
      headMotion = 'NOD';
    } else if (dx > 0.025 && dx > dy * 1.5) {
      headMotion = 'SHAKE';
    }
  }

  // 3. Determine ISL Non-Manual Grammar Marker
  let grammarMarker = 'NEUTRAL';
  if (eyebrowRaised) {
    grammarMarker = 'QUESTION';
  } else if (headMotion === 'NOD') {
    grammarMarker = 'AFFIRMATION';
  } else if (headMotion === 'SHAKE') {
    grammarMarker = 'NEGATION';
  }

  const expressionIntensity = Math.min(100, Math.round(distEyebrowEye * 1800));

  return {
    eyebrowRaised,
    headMotion,
    grammarMarker,
    expressionIntensity
  };
}

export default analyzeFacialCues;
