/**
 * SMPL-X 3D Animation Keyframe Loader for SignSTEM
 * 
 * Converts raw SMPL-X motion arrays (N_frames x 182 dims) from HamNoSys .pkl files
 * into interpolated Euler/Quaternion bone trajectories for Three.js human avatars.
 * 
 * SMPL-X 182-Dimension Layout:
 * - 0..2: Global Root Rotation (rotvec rx, ry, rz)
 * - 3..5: Pelvis / Root Translation (x, y, z)
 * - 6..68: Body Joints (Spine, Neck, Head, Clavicles, Shoulders, Elbows, Wrists - 21 joints x 3)
 * - 69..113: Left Hand MANO Pose (15 joints x 3)
 * - 114..158: Right Hand MANO Pose (15 joints x 3)
 * - 159..181: Jaw & Facial Expression Params (23 dims)
 */

const smoothstep = (t) => Math.max(0, Math.min(1, t)) * Math.max(0, Math.min(1, t)) * (3 - 2 * Math.max(0, Math.min(1, t)));
const lerp = (a, b, t) => a + (b - a) * smoothstep(t);

/**
 * Interpolates between keyframes given current animation time (ms)
 * 
 * @param {Array<SMPLXKeyframe>} frames 
 * @param {number} elapsedTimeMs 
 * @param {number} totalDurationMs 
 * @returns {SMPLXKeyframe} Interpolated keyframe pose
 */
export function getInterpolatedSMPLXFrame(frames, elapsedTimeMs, totalDurationMs) {
  if (!frames || frames.length === 0) return null;
  if (frames.length === 1) return frames[0];

  const totalFrames = frames.length;
  const progress = Math.min(1, Math.max(0, elapsedTimeMs / (totalDurationMs || 1000)));
  const exactFrameIndex = progress * (totalFrames - 1);
  const frameIdx1 = Math.floor(exactFrameIndex);
  const frameIdx2 = Math.min(totalFrames - 1, frameIdx1 + 1);
  const factor = exactFrameIndex - frameIdx1;

  const f1 = frames[frameIdx1];
  const f2 = frames[frameIdx2];

  if (!f2 || factor <= 0.001) return f1;

  return {
    head: lerpVector3(f1?.head, f2?.head, factor),
    neck: lerpVector3(f1?.neck, f2?.neck, factor),
    leftArm: {
      shoulder: lerpVector3(f1?.leftArm?.shoulder, f2?.leftArm?.shoulder, factor),
      elbow: lerp(f1?.leftArm?.elbow ?? 0.35, f2?.leftArm?.elbow ?? 0.35, factor),
      wrist: lerpVector3(f1?.leftArm?.wrist, f2?.leftArm?.wrist, factor),
      handShape: f1?.leftArm?.handShape
    },
    rightArm: {
      shoulder: lerpVector3(f1?.rightArm?.shoulder, f2?.rightArm?.shoulder, factor),
      elbow: lerp(f1?.rightArm?.elbow ?? 0.35, f2?.rightArm?.elbow ?? 0.35, factor),
      wrist: lerpVector3(f1?.rightArm?.wrist, f2?.rightArm?.wrist, factor),
      handShape: f1?.rightArm?.handShape
    }
  };
}

function lerpVector3(v1, v2, alpha) {
  if (!v1 || !v2) return v1 || v2 || { x: 0, y: 0, z: 0 };
  return {
    x: lerp(v1.x, v2.x, alpha),
    y: lerp(v1.y, v2.y, alpha),
    z: lerp(v1.z, v2.z, alpha)
  };
}

/**
 * Parses raw SMPL-X motion array into structured keyframes.
 * 
 * @param {Array<Array<number>> | Float32Array} smplxData N_frames x 182 matrix or flattened array
 * @param {number} numFrames Total frame count (default: 30 fps)
 * @returns {{ frames: Array<SMPLXKeyframe>, duration: number, frameRate: number }}
 */
export function parseSMPLXMotionData(smplxData, numFrames = null) {
  if (!smplxData) {
    return { frames: [], duration: 0, frameRate: 30 };
  }

  let matrix = smplxData;
  // If flattened array, convert to N_frames x 182 matrix
  if (Array.isArray(smplxData) && typeof smplxData[0] === 'number') {
    const total = smplxData.length;
    const fCount = numFrames || Math.floor(total / 182);
    matrix = [];
    for (let i = 0; i < fCount; i++) {
      matrix.push(smplxData.slice(i * 182, (i + 1) * 182));
    }
  }

  const framesCount = matrix.length || 0;
  const frames = [];

  for (let f = 0; f < framesCount; f++) {
    const row = matrix[f] || [];

    // Extract rotations
    const headRot = { x: row[15] || 0, y: row[16] || 0, z: row[17] || 0 };
    const neckRot = { x: row[12] || 0, y: row[13] || 0, z: row[14] || 0 };

    // Left Arm (Shoulder, Elbow, Wrist)
    const leftShoulder = {
      x: typeof row[48] === 'number' ? row[48] : 0.65,
      y: typeof row[49] === 'number' ? row[49] : 0.3,
      z: typeof row[50] === 'number' ? row[50] : -0.25
    };
    const leftElbowX = typeof row[54] === 'number' ? Math.abs(row[54]) : 1.25;
    const leftWrist = {
      x: typeof row[60] === 'number' ? row[60] : 0.2,
      y: typeof row[61] === 'number' ? row[61] : 0.3,
      z: typeof row[62] === 'number' ? row[62] : 0.1
    };

    // Right Arm (Shoulder, Elbow, Wrist)
    const rightShoulder = {
      x: typeof row[51] === 'number' ? row[51] : 0.65,
      y: typeof row[52] === 'number' ? row[52] : -0.3,
      z: typeof row[53] === 'number' ? row[53] : 0.25
    };
    const rightElbowX = typeof row[57] === 'number' ? Math.abs(row[57]) : 1.25;
    const rightWrist = {
      x: typeof row[63] === 'number' ? row[63] : 0.2,
      y: typeof row[64] === 'number' ? row[64] : -0.3,
      z: typeof row[65] === 'number' ? row[65] : -0.1
    };

    // MANO Hand Shapes (flexion averages across joints)
    const leftHandShape = extractMANOFlexions(row.slice(69, 114));
    const rightHandShape = extractMANOFlexions(row.slice(114, 159));

    frames.push({
      frameIndex: f,
      time: f / 30, // 30 FPS standard
      head: headRot,
      neck: neckRot,
      leftArm: {
        shoulder: leftShoulder,
        elbow: leftElbowX,
        wrist: leftWrist,
        handShape: leftHandShape
      },
      rightArm: {
        shoulder: rightShoulder,
        elbow: rightElbowX,
        wrist: rightWrist,
        handShape: rightHandShape
      }
    });
  }

  const frameRate = 30;
  const duration = (framesCount / frameRate) * 1000; // in ms

  return {
    frames,
    frameCount: framesCount,
    duration,
    frameRate
  };
}

/**
 * Extracts 5-finger flexions from a 45-dim MANO vector (15 joints x 3)
 */
function extractMANOFlexions(manoVec) {
  if (!manoVec || manoVec.length < 45) {
    return {
      thumb: [0.2, 0.2, 0.1],
      index: [0.3, 0.3, 0.2],
      middle: [0.3, 0.3, 0.2],
      ring: [0.3, 0.3, 0.2],
      pinky: [0.3, 0.3, 0.2]
    };
  }

  return {
    thumb: [Math.abs(manoVec[0]), Math.abs(manoVec[1]), Math.abs(manoVec[2])],
    index: [Math.abs(manoVec[9]), Math.abs(manoVec[10]), Math.abs(manoVec[11])],
    middle: [Math.abs(manoVec[18]), Math.abs(manoVec[19]), Math.abs(manoVec[20])],
    ring: [Math.abs(manoVec[27]), Math.abs(manoVec[28]), Math.abs(manoVec[29])],
    pinky: [Math.abs(manoVec[36]), Math.abs(manoVec[37]), Math.abs(manoVec[38])]
  };
}

export default parseSMPLXMotionData;

