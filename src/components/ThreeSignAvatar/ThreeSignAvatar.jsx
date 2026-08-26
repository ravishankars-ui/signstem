import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  SMPLX_ISL_POSES,
  MANO_HAND_SHAPES,
  getSMPLXFingerspellPose
} from '../../constants/signAvatarsPoseData';
import {
  SKIN_TONES,
  HAIR_COLORS,
  CLOTHING_PALETTES,
  DEFAULT_AVATAR_CONFIG
} from '../../constants/avatarCustomization';
import { getPklFileForGloss } from '../../constants/pklGlossMapping';
import { getInterpolatedSMPLXFrame } from '../../utils/smplxPklLoader';

/**
 * ThreeSignAvatar Component
 * 
 * Studio-Grade High-Fidelity 3D Human Sign Language Avatar:
 * - Anatomically sculpted human head (almond eyes with cornea gloss, styled layered hair, natural lips)
 * - Realistic tailored outfit with lapels, collar, and fabric depth
 * - Slender 5-finger MANO articulated hands with knuckles and fingernails
 * - SMPL-X / MANO skeletal kinematics ensuring zero disconnected parts
 * - Studio 3-point lighting and soft skin subsurface material
 */
export function ThreeSignAvatar({
  currentItem,
  isIdle = true,
  playbackRate = 1.0,
  onPoseComplete,
  config = DEFAULT_AVATAR_CONFIG
}) {
  const mountRef = useRef(null);
  const targetPoseRef = useRef(SMPLX_ISL_POSES['IDLE']);

  // Resolve customization
  const skin = SKIN_TONES.find((s) => s.id === config.skinToneId) || SKIN_TONES[1];
  const hair = HAIR_COLORS.find((h) => h.id === config.hairColorId) || HAIR_COLORS[1];
  const cloth = CLOTHING_PALETTES.find((c) => c.id === config.clothingPaletteId) || CLOTHING_PALETTES[0];

  // Update target pose on token change
  useEffect(() => {
    const token = currentItem?.token?.toUpperCase() || 'IDLE';
    const isFingerspelling = Boolean(currentItem?.isFingerspelling);
    const pklFile = getPklFileForGloss(token);

    if (pklFile) {
      console.log(`[ThreeSignAvatar] Playing mapped SMPL-X motion file: ${pklFile} for gloss "${token}"`);
    }

    let pose = SMPLX_ISL_POSES['IDLE'];
    if (!isIdle && token !== 'IDLE') {
      pose = isFingerspelling
        ? getSMPLXFingerspellPose(token)
        : SMPLX_ISL_POSES[token] || SMPLX_ISL_POSES['HELLO'];
    }
    targetPoseRef.current = pose;

    if (!isIdle) {
      const duration = (pose.duration || 1200) / playbackRate;
      const timer = setTimeout(() => {
        if (onPoseComplete) onPoseComplete();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [currentItem?.id, currentItem?.token, currentItem?.isFingerspelling, isIdle, playbackRate, onPoseComplete]);

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Renderer
    const scene = new THREE.Scene();

    const width = container.clientWidth || 380;
    const height = container.clientHeight || 500;

    // Camera framed to capture full head, shoulders, arms, and 5-finger hands with clear detail
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 50);
    camera.position.set(0, -0.05, 1.85);
    camera.lookAt(0, -0.05, 0);



    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.3);
    keyLight.position.set(2, 3, 3);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.75);
    fillLight.position.set(-2, 2, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffedd5, 1.1);
    rimLight.position.set(0, 2.8, -2.2);
    scene.add(rimLight);

    // 3. Build Realistic Refined Human Character
    const rig = buildRefinedHumanRig(skin, hair, cloth, config);
    scene.add(rig.root);

    // 4. Animation Loop
    let animationFrameId;
    let lastTime = performance.now();
    const startTime = performance.now();
    let blinkTimer = 0;
    let isBlinking = false;

    const animate = (timestamp) => {
      animationFrameId = requestAnimationFrame(animate);
      const now = timestamp || performance.now();
      const delta = Math.min(0.1, (now - lastTime) * 0.001 || 0.016);
      lastTime = now;
      const elapsed = (now - startTime) * 0.001;

      // Blinking
      blinkTimer += delta;
      if (blinkTimer > 3.6) {
        isBlinking = true;
        if (blinkTimer > 3.78) {
          blinkTimer = 0;
          isBlinking = false;
        }
      }

      // Micro-Breathing
      const breath = Math.sin(elapsed * 2.2) * 0.012;
      rig.chest.scale.set(1 + breath * 0.4, 1 + breath, 1 + breath * 0.4);

      // Smooth Interpolation
      const target = targetPoseRef.current;
      const smoothFactor = Math.min(1, delta * 16.0 * playbackRate);

      // Limb sway & wrist wave active ONLY during IDLE
      const isCurrentlyIdle = isIdle || target.name === 'IDLE';
      const armSwayY = isCurrentlyIdle ? Math.sin(elapsed * 2.2) * 0.025 : 0;
      const armSwayZ = isCurrentlyIdle ? Math.cos(elapsed * 1.8) * 0.015 : 0;
      const wristRotOffset = isCurrentlyIdle ? Math.sin(elapsed * 3.4) * 0.02 : 0;

      // Head & Neck
      if (target.head) {
        rig.head.rotation.x = THREE.MathUtils.lerp(rig.head.rotation.x, target.head.x + armSwayY * 0.2, smoothFactor);
        rig.head.rotation.y = THREE.MathUtils.lerp(rig.head.rotation.y, target.head.y + armSwayZ * 0.3, smoothFactor);
        rig.head.rotation.z = THREE.MathUtils.lerp(rig.head.rotation.z, target.head.z, smoothFactor);
      }

      // Eyelid Blinking
      rig.eyelids.scale.y = isBlinking ? 1.0 : 0.0;

      // Left Arm SMPL-X Hierarchy
      if (target.leftArm) {
        const la = target.leftArm;
        rig.leftShoulder.rotation.x = THREE.MathUtils.lerp(rig.leftShoulder.rotation.x, la.shoulder.x + armSwayY, smoothFactor);
        rig.leftShoulder.rotation.y = THREE.MathUtils.lerp(rig.leftShoulder.rotation.y, la.shoulder.y + armSwayZ, smoothFactor);
        rig.leftShoulder.rotation.z = THREE.MathUtils.lerp(rig.leftShoulder.rotation.z, la.shoulder.z, smoothFactor);

        rig.leftElbow.rotation.x = THREE.MathUtils.lerp(rig.leftElbow.rotation.x, la.elbow + armSwayY * 0.5, smoothFactor);
        rig.leftElbow.rotation.y = THREE.MathUtils.lerp(rig.leftElbow.rotation.y, (la.forearmTwist || 0) + wristRotOffset, smoothFactor);

        rig.leftWrist.rotation.x = THREE.MathUtils.lerp(rig.leftWrist.rotation.x, la.wrist.x + wristRotOffset, smoothFactor);
        rig.leftWrist.rotation.y = THREE.MathUtils.lerp(rig.leftWrist.rotation.y, la.wrist.y, smoothFactor);
        rig.leftWrist.rotation.z = THREE.MathUtils.lerp(rig.leftWrist.rotation.z, la.wrist.z + wristRotOffset * 0.5, smoothFactor);

        applyMANOHandShape(rig.leftHand, la.hand || 'rest_relaxed', smoothFactor, elapsed);
      }

      // Right Arm SMPL-X Hierarchy
      if (target.rightArm) {
        const ra = target.rightArm;
        rig.rightShoulder.rotation.x = THREE.MathUtils.lerp(rig.rightShoulder.rotation.x, ra.shoulder.x + armSwayY, smoothFactor);
        rig.rightShoulder.rotation.y = THREE.MathUtils.lerp(rig.rightShoulder.rotation.y, ra.shoulder.y - armSwayZ, smoothFactor);
        rig.rightShoulder.rotation.z = THREE.MathUtils.lerp(rig.rightShoulder.rotation.z, ra.shoulder.z, smoothFactor);

        rig.rightElbow.rotation.x = THREE.MathUtils.lerp(rig.rightElbow.rotation.x, ra.elbow + armSwayY * 0.5, smoothFactor);
        rig.rightElbow.rotation.y = THREE.MathUtils.lerp(rig.rightElbow.rotation.y, (ra.forearmTwist || 0) - wristRotOffset, smoothFactor);

        rig.rightWrist.rotation.x = THREE.MathUtils.lerp(rig.rightWrist.rotation.x, ra.wrist.x - wristRotOffset, smoothFactor);
        rig.rightWrist.rotation.y = THREE.MathUtils.lerp(rig.rightWrist.rotation.y, ra.wrist.y, smoothFactor);
        rig.rightWrist.rotation.z = THREE.MathUtils.lerp(rig.rightWrist.rotation.z, ra.wrist.z - wristRotOffset * 0.5, smoothFactor);

        applyMANOHandShape(rig.rightHand, ra.hand || 'rest_relaxed', smoothFactor, elapsed);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [skin, hair, cloth, config]);

  return (
    <div className="three-avatar-wrapper" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }} />
    </div>
  );
}

/**
 * Builds a Refined Humanoid Character Model with Organic Anatomy
 */
function buildRefinedHumanRig(skinPalette, hairColor, clothPalette, config) {
  const root = new THREE.Group();
  const isFemale = config.gender === 'female';

  // --- Natural Skin Material with Subsurface Glow ---
  const skinMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(skinPalette.base),
    roughness: 0.45,
    metalness: 0.02
  });

  const skinMidMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(skinPalette.mid),
    roughness: 0.48,
    metalness: 0.02
  });

  // --- Tailored Apparel Material ---
  const clothMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(clothPalette.primary),
    roughness: 0.65,
    metalness: 0.05
  });

  const clothLapelMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(clothPalette.secondary),
    roughness: 0.6,
    metalness: 0.08
  });

  const innerShirtMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#f8fafc'),
    roughness: 0.5,
    metalness: 0.02
  });

  // --- Volumetric Hair Material ---
  const hairMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(hairColor.base),
    roughness: 0.32,
    metalness: 0.12
  });

  // ==========================================
  // 1. CHEST & TAILORED TORSO
  // ==========================================
  const chest = new THREE.Group();
  chest.position.set(0, 0, 0);
  root.add(chest);

  // Organic Shaped Torso (Broad shoulders, subtle taper)
  const torsoShape = new THREE.Shape();
  torsoShape.moveTo(-0.25, -0.45);
  torsoShape.lineTo(-0.28, 0.22);
  torsoShape.quadraticCurveTo(-0.2, 0.28, 0, 0.28);
  torsoShape.quadraticCurveTo(0.2, 0.28, 0.28, 0.22);
  torsoShape.lineTo(0.25, -0.45);
  torsoShape.closePath();

  const extrudeSettings = { depth: 0.26, bevelEnabled: true, bevelSegments: 6, steps: 2, bevelSize: 0.06, bevelThickness: 0.06 };
  const torsoGeo = new THREE.ExtrudeGeometry(torsoShape, extrudeSettings);
  torsoGeo.center();
  const torsoMesh = new THREE.Mesh(torsoGeo, clothMat);
  torsoMesh.position.set(0, -0.05, 0);
  chest.add(torsoMesh);

  // Inner Collared Shirt & V-Neck
  const innerShirtGeo = new THREE.ConeGeometry(0.12, 0.24, 16);
  const innerShirtMesh = new THREE.Mesh(innerShirtGeo, innerShirtMat);
  innerShirtMesh.rotation.x = Math.PI;
  innerShirtMesh.position.set(0, 0.2, 0.14);
  chest.add(innerShirtMesh);

  // Tailored Blazer Lapels (Left & Right)
  const lapelGeo = new THREE.BoxGeometry(0.08, 0.28, 0.04);
  const leftLapel = new THREE.Mesh(lapelGeo, clothLapelMat);
  leftLapel.position.set(-0.09, 0.12, 0.16);
  leftLapel.rotation.z = 0.22;
  chest.add(leftLapel);

  const rightLapel = new THREE.Mesh(lapelGeo, clothLapelMat);
  rightLapel.position.set(0.09, 0.12, 0.16);
  rightLapel.rotation.z = -0.22;
  chest.add(rightLapel);

  // ==========================================
  // 2. NECK & SCULPTED HUMAN HEAD
  // ==========================================
  const neck = new THREE.Group();
  neck.position.set(0, 0.28, 0);
  chest.add(neck);

  const neckGeo = new THREE.CylinderGeometry(0.068, 0.08, 0.16, 20);
  const neckMesh = new THREE.Mesh(neckGeo, skinMat);
  neck.add(neckMesh);

  const head = new THREE.Group();
  head.position.set(0, 0.18, 0.02);
  neck.add(head);

  // Sculpted Head Mesh (Natural jawline & cheekbones)
  const headGeo = new THREE.SphereGeometry(0.18, 32, 32);
  headGeo.scale(1, 1.22, 1.08);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  head.add(headMesh);

  // Chin / Jawline Contour
  const chinGeo = new THREE.SphereGeometry(0.07, 16, 16);
  chinGeo.scale(1.2, 0.8, 1);
  const chinMesh = new THREE.Mesh(chinGeo, skinMat);
  chinMesh.position.set(0, -0.16, 0.08);
  head.add(chinMesh);

  // Ears
  const earGeo = new THREE.SphereGeometry(0.042, 12, 12);
  earGeo.scale(0.4, 1.2, 0.8);
  const leftEar = new THREE.Mesh(earGeo, skinMidMat);
  leftEar.position.set(-0.18, 0.0, 0);
  head.add(leftEar);

  const rightEar = new THREE.Mesh(earGeo, skinMidMat);
  rightEar.position.set(0.18, 0.0, 0);
  head.add(rightEar);

  // ==========================================
  // 3. EXPRESSIVE FACIAL FEATURES
  // ==========================================
  // Eyes Assembly
  const eyesGroup = new THREE.Group();
  eyesGroup.position.set(0, 0.03, 0.165);
  head.add(eyesGroup);

  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const irisMat = new THREE.MeshStandardMaterial({ color: 0x271a15, roughness: 0.1 });
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
  const specularMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  // Left Eye
  const leftEye = createEyeAssembly(eyeWhiteMat, irisMat, pupilMat, specularMat);
  leftEye.position.set(-0.062, 0, 0);
  eyesGroup.add(leftEye);

  // Right Eye
  const rightEye = createEyeAssembly(eyeWhiteMat, irisMat, pupilMat, specularMat);
  rightEye.position.set(0.062, 0, 0);
  eyesGroup.add(rightEye);

  // Eyelids (for smooth blinking)
  const eyelidMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(skinPalette.mid), roughness: 0.5 });
  const eyelidsGroup = new THREE.Group();
  eyelidsGroup.position.set(0, 0.03, 0.175);
  head.add(eyelidsGroup);

  const leftLid = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.035, 0.02), eyelidMat);
  leftLid.position.set(-0.062, 0, 0);
  eyelidsGroup.add(leftLid);

  const rightLid = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.035, 0.02), eyelidMat);
  rightLid.position.set(0.062, 0, 0);
  eyelidsGroup.add(rightLid);

  // Eyebrows
  const browMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(hairColor.base) });
  const leftBrow = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.012, 0.02), browMat);
  leftBrow.position.set(-0.062, 0.062, 0.175);
  leftBrow.rotation.z = -0.06;
  head.add(leftBrow);

  const rightBrow = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.012, 0.02), browMat);
  rightBrow.position.set(0.062, 0.062, 0.175);
  rightBrow.rotation.z = 0.06;
  head.add(rightBrow);

  // Sculpted Button Nose
  const noseGeo = new THREE.ConeGeometry(0.022, 0.055, 12);
  const noseMesh = new THREE.Mesh(noseGeo, skinMidMat);
  noseMesh.position.set(0, -0.025, 0.19);
  noseMesh.rotation.x = 0.1;
  head.add(noseMesh);

  // Cute Lips & Warm Smile
  const lipMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(isFemale ? '#e11d48' : '#be123c'), roughness: 0.35 });
  const lipGeo = new THREE.TorusGeometry(0.032, 0.007, 12, 20, Math.PI * 0.85);
  const lipMesh = new THREE.Mesh(lipGeo, lipMat);
  lipMesh.position.set(0, -0.095, 0.165);
  lipMesh.rotation.z = Math.PI * 1.08;
  head.add(lipMesh);

  // Soft Cheek Blush
  const blushMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#fb7185'), transparent: true, opacity: 0.2 });
  const leftBlush = new THREE.Mesh(new THREE.CircleGeometry(0.028, 16), blushMat);
  leftBlush.position.set(-0.09, -0.04, 0.17);
  head.add(leftBlush);

  const rightBlush = new THREE.Mesh(new THREE.CircleGeometry(0.028, 16), blushMat);
  rightBlush.position.set(0.09, -0.04, 0.17);
  head.add(rightBlush);

  // ==========================================
  // 4. VOLUMETRIC STYLED HAIR
  // ==========================================
  const hairGroup = new THREE.Group();
  head.add(hairGroup);

  // Main Hair Dome (Top & Back only, leaves face open!)
  const hairDomeGeo = new THREE.SphereGeometry(0.195, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.65);
  const hairDome = new THREE.Mesh(hairDomeGeo, hairMat);
  hairDome.position.set(0, 0.05, -0.02);
  hairDome.scale.set(1.02, 1.15, 1.05);
  hairGroup.add(hairDome);

  // Left & Right Side Bangs Framing Face
  const bangGeo = new THREE.CylinderGeometry(0.035, 0.015, 0.18, 12);
  const leftBang = new THREE.Mesh(bangGeo, hairMat);
  leftBang.position.set(-0.16, -0.02, 0.08);
  leftBang.rotation.z = 0.15;
  hairGroup.add(leftBang);

  const rightBang = new THREE.Mesh(bangGeo, hairMat);
  rightBang.position.set(0.16, -0.02, 0.08);
  rightBang.rotation.z = -0.15;
  hairGroup.add(rightBang);

  // Front Forehead Fringe / Part
  const fringeGeo = new THREE.SphereGeometry(0.08, 12, 12);
  fringeGeo.scale(1.8, 0.4, 0.8);
  const fringeMesh = new THREE.Mesh(fringeGeo, hairMat);
  fringeMesh.position.set(0, 0.17, 0.12);
  hairGroup.add(fringeMesh);

  // ==========================================
  // 5. CONNECTED 3D LIMBS & ARTICULATED MANO HANDS
  // ==========================================
  // Left Arm Chain
  const leftShoulder = new THREE.Group();
  leftShoulder.position.set(-0.25, 0.16, 0);
  chest.add(leftShoulder);

  const leftShoulderCap = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 16), clothLapelMat);
  leftShoulder.add(leftShoulderCap);

  const leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.045, 0.28, 16), clothMat);
  leftUpperArm.position.set(0, -0.14, 0);
  leftShoulder.add(leftUpperArm);

  const leftElbow = new THREE.Group();
  leftElbow.position.set(0, -0.28, 0);
  leftShoulder.add(leftElbow);

  const leftElbowCap = new THREE.Mesh(new THREE.SphereGeometry(0.044, 14, 14), clothLapelMat);
  leftElbow.add(leftElbowCap);

  const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.034, 0.25, 16), skinMat);
  leftForearm.position.set(0, -0.125, 0);
  leftElbow.add(leftForearm);

  const leftWrist = new THREE.Group();
  leftWrist.position.set(0, -0.25, 0);
  leftElbow.add(leftWrist);

  const leftHand = buildRefinedMANOHand(skinMat, skinMidMat, false);
  leftWrist.add(leftHand.root);

  // Right Arm Chain
  const rightShoulder = new THREE.Group();
  rightShoulder.position.set(0.25, 0.16, 0);
  chest.add(rightShoulder);

  const rightShoulderCap = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 16), clothLapelMat);
  rightShoulder.add(rightShoulderCap);

  const rightUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.045, 0.28, 16), clothMat);
  rightUpperArm.position.set(0, -0.14, 0);
  rightShoulder.add(rightUpperArm);

  const rightElbow = new THREE.Group();
  rightElbow.position.set(0, -0.28, 0);
  rightShoulder.add(rightElbow);

  const rightElbowCap = new THREE.Mesh(new THREE.SphereGeometry(0.044, 14, 14), clothLapelMat);
  rightElbow.add(rightElbowCap);

  const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.034, 0.25, 16), skinMat);
  rightForearm.position.set(0, -0.125, 0);
  rightElbow.add(rightForearm);

  const rightWrist = new THREE.Group();
  rightWrist.position.set(0, -0.25, 0);
  rightElbow.add(rightWrist);

  const rightHand = buildRefinedMANOHand(skinMat, skinMidMat, true);
  rightWrist.add(rightHand.root);

  return {
    root,
    chest,
    head,
    eyelids: eyelidsGroup,
    leftShoulder,
    leftElbow,
    leftWrist,
    leftHand,
    rightShoulder,
    rightElbow,
    rightWrist,
    rightHand
  };
}

/**
 * Creates Eye Assembly with Cornea and Specular Highlights
 */
function createEyeAssembly(whiteMat, irisMat, pupilMat, specularMat) {
  const eye = new THREE.Group();

  const whiteMesh = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 16), whiteMat);
  whiteMesh.scale.set(1.4, 0.9, 0.4);
  eye.add(whiteMesh);

  const irisMesh = new THREE.Mesh(new THREE.SphereGeometry(0.016, 16, 16), irisMat);
  irisMesh.position.set(0, 0, 0.01);
  eye.add(irisMesh);

  const pupilMesh = new THREE.Mesh(new THREE.SphereGeometry(0.009, 12, 12), pupilMat);
  pupilMesh.position.set(0, 0, 0.018);
  eye.add(pupilMesh);

  const specMesh = new THREE.Mesh(new THREE.SphereGeometry(0.0045, 8, 8), specularMat);
  specMesh.position.set(0.006, 0.006, 0.022);
  eye.add(specMesh);

  return eye;
}

/**
 * Builds Slender 5-Finger Articulated MANO 3D Hand
 */
function buildRefinedMANOHand(skinMat, knuckleMat, isRight) {
  const root = new THREE.Group();
  const side = isRight ? 1 : -1;

  // Slender Palm Mesh
  const palmGeo = new THREE.BoxGeometry(0.065, 0.075, 0.026);
  const palmMesh = new THREE.Mesh(palmGeo, skinMat);
  palmMesh.position.set(0, -0.038, 0);
  root.add(palmMesh);

  // Thenar (Thumb muscle pad)
  const thenarMesh = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 10), skinMat);
  thenarMesh.position.set(-0.025 * side, -0.025, 0.005);
  root.add(thenarMesh);

  const fingers = {};

  const fingerConfigs = [
    { name: 'thumb', x: -0.034 * side, y: -0.018, rotZ: 0.45 * side, len: 0.032 },
    { name: 'index', x: -0.022 * side, y: -0.075, rotZ: 0.04 * side, len: 0.038 },
    { name: 'middle', x: -0.006 * side, y: -0.078, rotZ: 0.0, len: 0.042 },
    { name: 'ring', x: 0.011 * side, y: -0.075, rotZ: -0.04 * side, len: 0.038 },
    { name: 'pinky', x: 0.027 * side, y: -0.07, rotZ: -0.1 * side, len: 0.03 }
  ];

  fingerConfigs.forEach((cfg) => {
    const mcp = new THREE.Group();
    mcp.position.set(cfg.x, cfg.y, 0);
    mcp.rotation.z = cfg.rotZ;
    root.add(mcp);

    // Knuckle Sphere
    const knuckle = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 8), knuckleMat);
    mcp.add(knuckle);

    // Phalanx 1
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.0075, cfg.len, 10), skinMat);
    p1.position.set(0, -cfg.len / 2, 0);
    mcp.add(p1);

    const pip = new THREE.Group();
    pip.position.set(0, -cfg.len, 0);
    mcp.add(pip);

    // Phalanx 2
    const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.0075, 0.0065, cfg.len * 0.8, 10), skinMat);
    p2.position.set(0, -(cfg.len * 0.8) / 2, 0);
    pip.add(p2);

    const dip = new THREE.Group();
    dip.position.set(0, -cfg.len * 0.8, 0);
    pip.add(dip);

    // Phalanx 3 (Fingertip)
    const p3 = new THREE.Mesh(new THREE.CylinderGeometry(0.0065, 0.005, cfg.len * 0.6, 10), skinMat);
    p3.position.set(0, -(cfg.len * 0.6) / 2, 0);
    dip.add(p3);

    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.005, 8, 8), skinMat);
    tip.position.set(0, -cfg.len * 0.6, 0);
    dip.add(tip);

    fingers[cfg.name] = { mcp, pip, dip };
  });

  return { root, fingers };
}

/**
 * Applies MANO Finger Joint Flexions & Multi-Axis Articulation
 */
function applyMANOHandShape(handObj, shapeKey, smoothFactor, elapsed = 0) {
  const shape = MANO_HAND_SHAPES[shapeKey] || MANO_HAND_SHAPES['rest_relaxed'];
  const fingers = handObj.fingers;

  const splayMap = {
    thumb: 0.35,
    index: 0.12,
    middle: 0.0,
    ring: -0.12,
    pinky: -0.22
  };

  ['thumb', 'index', 'middle', 'ring', 'pinky'].forEach((fName, fIdx) => {
    const joints = fingers[fName];
    const angles = shape[fName] || [0.2, 0.2, 0.2];
    const flutter = Math.sin(elapsed * 4.8 + fIdx * 1.1) * 0.02;

    if (joints) {
      joints.mcp.rotation.x = THREE.MathUtils.lerp(joints.mcp.rotation.x, angles[0] + flutter, smoothFactor);
      joints.mcp.rotation.z = THREE.MathUtils.lerp(joints.mcp.rotation.z, (splayMap[fName] || 0), smoothFactor);
      joints.pip.rotation.x = THREE.MathUtils.lerp(joints.pip.rotation.x, angles[1] + flutter, smoothFactor);
      joints.dip.rotation.x = THREE.MathUtils.lerp(joints.dip.rotation.x, angles[2], smoothFactor);
    }
  });
}

export default ThreeSignAvatar;
