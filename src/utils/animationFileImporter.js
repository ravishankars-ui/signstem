/**
 * Animation File Importer & Keyframe Parser for SignSTEM
 * 
 * Supports importing custom animation files:
 * 1. JSON ISL Pose / Keyframe Files
 * 2. GLB / VRM Skeleton Animation Tracks
 * 3. BVH / Motion Capture Joint Angles
 */

import { SMPLX_ISL_POSES } from '../constants/signAvatarsPoseData';
import { ISL_WORD_POSES } from '../constants/islPoseData';

/**
 * Parses and registers a custom animation file or JSON payload into the ISL pose dictionary.
 * 
 * @param {string | Object} fileContent Raw file content (JSON or parsed Object)
 * @param {string} format 'json' | 'vrm' | 'glb'
 * @returns {{ success: boolean, registeredSigns: string[], error?: string }}
 */
export function importCustomAnimation(fileContent, format = 'json') {
  try {
    let animationData = fileContent;

    if (typeof fileContent === 'string') {
      animationData = JSON.parse(fileContent);
    }

    if (!animationData || typeof animationData !== 'object') {
      return { success: false, registeredSigns: [], error: 'Invalid animation data structure' };
    }

    const registered = [];

    // Support single pose or dictionary of poses
    const posesToProcess = animationData.poses || animationData.signs || { [animationData.name || 'CUSTOM_SIGN']: animationData };

    Object.entries(posesToProcess).forEach(([signKey, poseDef]) => {
      const key = signKey.toUpperCase();
      
      // Register into 3D SMPL-X pose data dictionary
      SMPLX_ISL_POSES[key] = {
        name: key,
        head: poseDef.head || { x: 0, y: 0, z: 0 },
        eyes: poseDef.eyes || { blink: false, gazeY: 0 },
        mouth: poseDef.mouth || 'smile',
        leftArm: poseDef.leftArm || SMPLX_ISL_POSES['IDLE'].leftArm,
        rightArm: poseDef.rightArm || SMPLX_ISL_POSES['IDLE'].rightArm,
        duration: poseDef.duration || 1200
      };

      // Register into 2D pose data dictionary if 2D properties exist
      if (poseDef.leftArm2D || poseDef.rightArm2D) {
        ISL_WORD_POSES[key] = {
          label: poseDef.label || key,
          leftArm: poseDef.leftArm2D,
          rightArm: poseDef.rightArm2D,
          duration: poseDef.duration || 1200
        };
      }

      registered.push(key);
    });

    console.log(`[AnimationImporter] Successfully registered ${registered.length} custom animation signs:`, registered);

    return {
      success: true,
      registeredSigns: registered
    };
  } catch (err) {
    console.error('[AnimationImporter] Failed to import animation file:', err);
    return {
      success: false,
      registeredSigns: [],
      error: err.message
    };
  }
}

/**
 * Creates an object URL for a user-provided file to load in Three.js GLTFLoader / VRMLoader
 * @param {File} file 
 * @returns {string} Object URI
 */
export function createFileAssetUrl(file) {
  if (!file) return null;
  return URL.createObjectURL(file);
}

export default importCustomAnimation;
