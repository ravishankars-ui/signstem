/**
 * Free Rigged 3D Male & Female Human Avatar Assets for SignSTEM
 * 
 * Provides open-source, CC0/MIT licensed rigged 3D human models (GLTF/GLB)
 * with standard Mixamo / Humanoid skeletal bone hierarchies:
 * 
 * 1. Xbot (Male 3D Rigged Humanoid - Three.js / Khronos Group)
 * 2. Ybot (Female/Neutral 3D Rigged Humanoid - Three.js / Khronos Group)
 * 3. Ready Player Me Male 3D Avatar (Full Rigged Skeletal Mesh)
 * 4. Ready Player Me Female 3D Avatar (Full Rigged Skeletal Mesh)
 */

export const FREE_3D_RIGGED_MODELS = {
  male: {
    id: 'xbot_male',
    name: 'Xbot Male (Standard Mixamo Rig)',
    gender: 'male',
    license: 'MIT / CC0 Open Source',
    format: 'GLTF / GLB',
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Xbot.glb',
    description: 'High-performance rigged male 3D humanoid mesh with full arm, wrist, and finger bone hierarchy.'
  },
  female: {
    id: 'ybot_female',
    name: 'Ybot Female (Standard Mixamo Rig)',
    gender: 'female',
    license: 'MIT / CC0 Open Source',
    format: 'GLTF / GLB',
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Ybot.glb',
    description: 'High-performance rigged female/neutral 3D humanoid mesh with full arm, wrist, and finger bone hierarchy.'
  },
  rpmMale: {
    id: 'rpm_male',
    name: 'Ready Player Me Male Avatar',
    gender: 'male',
    license: 'Free Commercial & Personal Use',
    format: 'GLB',
    url: 'https://models.readyplayer.me/6460d0e7a4d0e67010a0e271.glb',
    description: 'Stylized 3D male avatar with facial blendshapes and standard Mixamo humanoid skeleton.'
  },
  rpmFemale: {
    id: 'rpm_female',
    name: 'Ready Player Me Female Avatar',
    gender: 'female',
    license: 'Free Commercial & Personal Use',
    format: 'GLB',
    url: 'https://models.readyplayer.me/6460d4d8a4d0e67010a0ea5c.glb',
    description: 'Stylized 3D female avatar with facial blendshapes and standard Mixamo humanoid skeleton.'
  }
};

/**
 * Maps SMPL-X / MANO joint rotations to standard Mixamo GLTF bone names
 */
export const MIXAMO_BONE_MAPPING = {
  // Head & Neck
  'head': 'mixamorigHead',
  'neck': 'mixamorigNeck',
  
  // Left Arm & Hand
  'leftShoulder': 'mixamorigLeftArm',
  'leftElbow': 'mixamorigLeftForeArm',
  'leftWrist': 'mixamorigLeftHand',
  'leftThumb': 'mixamorigLeftHandThumb1',
  'leftIndex': 'mixamorigLeftHandIndex1',
  'leftMiddle': 'mixamorigLeftHandMiddle1',
  'leftRing': 'mixamorigLeftHandRing1',
  'leftPinky': 'mixamorigLeftHandPinky1',

  // Right Arm & Hand
  'rightShoulder': 'mixamorigRightArm',
  'rightElbow': 'mixamorigRightForeArm',
  'rightWrist': 'mixamorigRightHand',
  'rightThumb': 'mixamorigRightHandThumb1',
  'rightIndex': 'mixamorigRightHandIndex1',
  'rightMiddle': 'mixamorigRightHandMiddle1',
  'rightRing': 'mixamorigRightHandRing1',
  'rightPinky': 'mixamorigRightHandPinky1'
};

export default FREE_3D_RIGGED_MODELS;
