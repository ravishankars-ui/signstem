import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PKL_GLOSS_MAPPING, getPklFileForGloss } from '../constants/pklGlossMapping';
import {
  SMPLX_ISL_POSES,
  MANO_HAND_SHAPES,
  getSMPLXFingerspellPose,
} from '../constants/signAvatarsPoseData';

/**
 * Helper to safely resolve asset URLs in Chrome Extension and Web contexts.
 */
function getAssetUrl(relativePath) {
  const cleanPath = relativePath.replace(/^\/+/, '');
  if (typeof globalThis.chrome !== 'undefined' && globalThis.chrome?.runtime?.getURL) {
    try {
      return globalThis.chrome.runtime.getURL(cleanPath);
    } catch (e) {
      console.debug('[ZhenjaAvatar] chrome.runtime.getURL fallback:', e);
    }
  }
  return '/' + cleanPath;
}

/**
 * 30-Joint Articulated Finger Kinematics for Ready Player Me Avatar
 */
function applyFingerShape(bones, prefix, shapeKey, sf, elapsed = 0) {
  const shape = MANO_HAND_SHAPES[shapeKey] || MANO_HAND_SHAPES['rest_poised'] || MANO_HAND_SHAPES['rest_relaxed'];
  if (!shape) return;
  const isRight = prefix.startsWith('Right');
  const sideSign = isRight ? 1 : -1;

  const fingerConfigs = [
    { name: 'thumb',  b: [prefix + 'Thumb1',  prefix + 'Thumb2',  prefix + 'Thumb3'],  splay: -0.20 * sideSign },
    { name: 'index',  b: [prefix + 'Index1',  prefix + 'Index2',  prefix + 'Index3'],  splay: 0.12 * sideSign },
    { name: 'middle', b: [prefix + 'Middle1', prefix + 'Middle2', prefix + 'Middle3'], splay: 0.0 },
    { name: 'ring',   b: [prefix + 'Ring1',   prefix + 'Ring2',   prefix + 'Ring3'],   splay: -0.12 * sideSign },
    { name: 'pinky',  b: [prefix + 'Pinky1',  prefix + 'Pinky2',  prefix + 'Pinky3'],  splay: -0.22 * sideSign },
  ];

  fingerConfigs.forEach((cfg, idx) => {
    const angles = shape[cfg.name] || [0.3, 0.3, 0.2];
    const [b1, b2, b3] = cfg.b;
    const flutter = Math.sin(elapsed * 4.8 + idx * 1.1) * 0.015;

    if (cfg.name === 'thumb') {
      const thumbFlex1 = angles[0] ?? 0.50;
      const thumbFlex2 = angles[1] ?? 0.45;
      const thumbFlex3 = angles[2] ?? 0.35;
      const isTucked = thumbFlex1 > 0.45;

      if (bones[b1]) {
        // Flexion around X axis: bends thumb inward towards palm
        bones[b1].rotation.x = THREE.MathUtils.lerp(bones[b1].rotation.x, thumbFlex1 + flutter, sf);
        // Y axis: brings thumb pad across towards fingers
        const targetY = isTucked ? -0.25 * sideSign : 0.05 * sideSign;
        bones[b1].rotation.y = THREE.MathUtils.lerp(bones[b1].rotation.y, targetY, sf);
        // Z axis: tucks thumb downward/inward along palm instead of sticking upward
        const targetZ = isTucked ? -0.45 * sideSign : -0.15 * sideSign;
        bones[b1].rotation.z = THREE.MathUtils.lerp(bones[b1].rotation.z, targetZ, sf);
      }
      if (bones[b2]) {
        // Mid-knuckle flexion: bends thumb inward
        bones[b2].rotation.x = THREE.MathUtils.lerp(bones[b2].rotation.x, thumbFlex2 + flutter, sf);
        bones[b2].rotation.y = THREE.MathUtils.lerp(bones[b2].rotation.y, 0, sf);
        bones[b2].rotation.z = THREE.MathUtils.lerp(bones[b2].rotation.z, isTucked ? -0.15 * sideSign : 0, sf);
      }
      if (bones[b3]) {
        // Distal tip flexion: curves the tip inward
        bones[b3].rotation.x = THREE.MathUtils.lerp(bones[b3].rotation.x, thumbFlex3, sf);
      }
    } else {
      if (bones[b1]) {
        bones[b1].rotation.x = THREE.MathUtils.lerp(bones[b1].rotation.x, (angles[0] || 0.2) + flutter, sf);
        bones[b1].rotation.y = THREE.MathUtils.lerp(bones[b1].rotation.y, cfg.splay * 0.5, sf);
        bones[b1].rotation.z = THREE.MathUtils.lerp(bones[b1].rotation.z, cfg.splay, sf);
      }
      if (bones[b2]) {
        bones[b2].rotation.x = THREE.MathUtils.lerp(bones[b2].rotation.x, (angles[1] || 0.2) + flutter, sf);
      }
      if (bones[b3]) {
        bones[b3].rotation.x = THREE.MathUtils.lerp(bones[b3].rotation.x, (angles[2] || 0.15), sf);
      }
    }
  });
}

/**
 * ZhenjaSignAvatar
 *
 * High-performance 3D Sign Language Avatar for Ready Player Me (zhenja.glb).
 * Plays real 30 FPS HamNoSys motion capture keyframes with posture-corrected kinematics.
 */
export function ZhenjaSignAvatar({
  signId,
  token = 'HELLO',
  isIdle = false,
  playbackRate = 1.0,
  queueLength = 0,
  onPoseComplete,
  themeMode = 'light',
}) {
  const mountRef = useRef(null);
  const [loadState, setLoadState] = useState('loading');
  const motionDataRef = useRef(null);
  const targetPoseRef = useRef(SMPLX_ISL_POSES['HELLO']);
  const bonesRef = useRef({});
  const baseHipsYRef = useRef(null);
  const animStartTimeRef = useRef(performance.now());
  const lastActiveTimeRef = useRef(performance.now());
  const prevBonesRef = useRef({});
  const transitionStartRef = useRef(0);
  const isIdleRef = useRef(isIdle);
  const playbackRateRef = useRef(playbackRate);
  const queueLengthRef = useRef(queueLength);
  const themeModeRef = useRef(themeMode);

  // Keep refs in sync with latest props
  isIdleRef.current = isIdle;
  if (!isIdle) {
    lastActiveTimeRef.current = performance.now();
  }
  playbackRateRef.current = playbackRate;
  queueLengthRef.current = queueLength;
  themeModeRef.current = themeMode;

  // ------------------------------------------------------------------
  // 1. Resolve Motion Keyframes or Fallback Pose with Dynamic Speed
  // ------------------------------------------------------------------
  useEffect(() => {
    // Snapshot current bone rotations for smooth cross-fading into the next gesture
    const currentBones = bonesRef.current;
    if (currentBones && Object.keys(currentBones).length > 0) {
      const snapshot = {};
      for (const [name, bone] of Object.entries(currentBones)) {
        if (bone && bone.rotation) {
          snapshot[name] = {
            x: bone.rotation.x,
            y: bone.rotation.y,
            z: bone.rotation.z
          };
        }
      }
      prevBonesRef.current = snapshot;
    }
    transitionStartRef.current = performance.now();
    animStartTimeRef.current = performance.now();

    const rawToken = (typeof token === 'string' ? token : token?.token || 'HELLO').toUpperCase().trim();
    const isSingleLetter = rawToken.length === 1 && /^[A-Z0-9]$/.test(rawToken);

    // Dynamic queue acceleration: keeps avatar perfectly in sync with rapid video speech
    const queueBoost = Math.min(2.8, 1.0 + (queueLength || 0) * 0.35);
    const effectiveRate = (playbackRate || 1.0) * queueBoost;

    // Fallback static pose (Optimized for snappy, lifelike signing tempo: 460ms words, 240ms letters)
    const pose = isSingleLetter
      ? getSMPLXFingerspellPose(rawToken)
      : SMPLX_ISL_POSES[rawToken] || SMPLX_ISL_POSES['HELLO'];
    targetPoseRef.current = pose;

    // Check if motion capture JSON exists using getPklFileForGloss
    const pklFile = getPklFileForGloss(rawToken) || PKL_GLOSS_MAPPING[rawToken] || (rawToken === 'HELLO' ? '10014.pkl' : null);
    let timer = null;

    if (pklFile) {
      const jsonFileName = pklFile.replace('.pkl', '.json');
      const motionUrl = getAssetUrl(`motions/${jsonFileName}`);

      fetch(motionUrl)
        .then((res) => {
          if (!res.ok) throw new Error(`Motion not found: ${motionUrl}`);
          return res.json();
        })
        .then((data) => {
          if (data && data.frames && data.frames.length > 0) {
            motionDataRef.current = data;
            animStartTimeRef.current = performance.now();
            transitionStartRef.current = performance.now();
            const motionDurationMs = Math.max(220, Math.min(((data.frames.length / 30) * 1000), 700) / effectiveRate);
            if (!isIdle && onPoseComplete) {
              timer = setTimeout(() => {
                if (onPoseComplete) onPoseComplete();
              }, motionDurationMs);
            }
          } else {
            motionDataRef.current = null;
          }
        })
        .catch((err) => {
          console.debug('[ZhenjaAvatar] Motion JSON fetch error:', err);
          motionDataRef.current = null;
          if (!isIdle && onPoseComplete) {
            const baseDuration = isSingleLetter ? 240 : 460;
            const durationMs = Math.max(180, (pose.duration ? Math.min(pose.duration, 520) : baseDuration) / effectiveRate);
            timer = setTimeout(() => {
              if (onPoseComplete) onPoseComplete();
            }, durationMs);
          }
        });
    } else {
      motionDataRef.current = null;
      if (!isIdle && onPoseComplete) {
        const baseDuration = isSingleLetter ? 240 : 460;
        const durationMs = Math.max(180, (pose.duration ? Math.min(pose.duration, 520) : baseDuration) / effectiveRate);
        timer = setTimeout(() => {
          if (onPoseComplete) onPoseComplete();
        }, durationMs);
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [signId, token, isIdle, playbackRate, queueLength, onPoseComplete]);

  // ------------------------------------------------------------------
  // 2. Setup Three.js Scene + Load zhenja.glb
  // ------------------------------------------------------------------
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 500;

    // ---- Scene ----
    const scene = new THREE.Scene();

    // ---- Animated gradient background ----
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = 512; bgCanvas.height = 512;
    const bgCtx = bgCanvas.getContext('2d');
    const bgTexture = new THREE.CanvasTexture(bgCanvas);

    function drawBackground(t) {
      const isLight = themeModeRef.current === 'light' || themeModeRef.current === 'ivory';
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.4);

      if (isLight) {
        // Luxury Warm Ivory & Studio Lighting
        const grad = bgCtx.createRadialGradient(256, 170, 20, 256, 256, 380);
        grad.addColorStop(0,   '#ffffff');
        grad.addColorStop(0.35, '#faf6ee');
        grad.addColorStop(0.75, '#f4ece0');
        grad.addColorStop(1,   '#e8ddd0');
        bgCtx.fillStyle = grad;
        bgCtx.fillRect(0, 0, 512, 512);

        // Subtle champagne warmth particles
        bgCtx.fillStyle = 'rgba(197, 155, 39, ' + (0.035 + 0.02 * pulse) + ')';
        for (let i = 0; i < 35; i++) {
          const sx = (Math.sin(i * 73.7 + t * 0.05) * 0.5 + 0.5) * 512;
          const sy = (Math.cos(i * 53.1 + t * 0.03) * 0.5 + 0.5) * 512;
          const sr = 1.0 + (i % 3) * 0.5;
          bgCtx.beginPath(); bgCtx.arc(sx, sy, sr, 0, Math.PI * 2); bgCtx.fill();
        }
      } else {
        // Deep Cosmic Midnight Radial Gradient
        const grad = bgCtx.createRadialGradient(256, 200, 30, 256, 256, 360);
        grad.addColorStop(0,   'hsl(224, 55%, 18%)');
        grad.addColorStop(0.5, 'hsl(244, 50%, 12%)');
        grad.addColorStop(1,   'hsl(240, 60%, 6%)');
        bgCtx.fillStyle = grad;
        bgCtx.fillRect(0, 0, 512, 512);

        // Subtle star particles
        bgCtx.fillStyle = 'rgba(255,255,255,' + (0.04 + 0.03 * pulse) + ')';
        for (let i = 0; i < 50; i++) {
          const sx = (Math.sin(i * 73.7 + t * 0.05) * 0.5 + 0.5) * 512;
          const sy = (Math.cos(i * 53.1 + t * 0.03) * 0.5 + 0.5) * 512;
          const sr = 0.8 + (i % 3) * 0.5;
          bgCtx.beginPath(); bgCtx.arc(sx, sy, sr, 0, Math.PI * 2); bgCtx.fill();
        }
      }
      bgTexture.needsUpdate = true;
    }
    scene.background = bgTexture;

    // ---- Camera Framing (Lowered framing to comfortably capture face, chest, and hands) ----
    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    camera.position.set(0, 1.00, 1.30);
    camera.lookAt(0, 0.90, 0);

    // ---- Renderer ----
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    container.appendChild(renderer.domElement);

    // Allow user to smoothly adjust distance in real time with scroll wheel
    const handleWheel = (e) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.001;
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + zoomDelta, 0.80, 2.0);
      camera.updateProjectionMatrix();
    };
    container.addEventListener('wheel', handleWheel, { passive: false });

    // Auto-resize observer for container
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || container.offsetWidth || 380;
      const h = container.clientHeight || container.offsetHeight || 260;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        if (w / h > 1.2) {
          camera.position.set(0, 1.00, 1.30);
          camera.lookAt(0, 0.90, 0);
        } else {
          // Direct look-ahead framing for Extension feed / portrait view
          camera.position.set(0, 1.15, 1.25);
          camera.lookAt(0, 1.05, 0);
        }
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();

    // ---- Lighting ----
    scene.add(new THREE.AmbientLight(0xffffff, 0.95));

    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.0);
    keyLight.position.set(-1.5, 2.5, 2.0);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf5efe6, 1.2);
    fillLight.position.set(1.5, 1.5, 1.5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xe8d5b5, 1.3);
    rimLight.position.set(0, 2.0, -1.8);
    scene.add(rimLight);

    // ---- 3D Ground Contact Drop Shadow ----
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256; shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    const sGrad = sCtx.createRadialGradient(128, 128, 0, 128, 128, 120);
    sGrad.addColorStop(0, 'rgba(40, 28, 15, 0.48)');
    sGrad.addColorStop(0.35, 'rgba(40, 28, 15, 0.26)');
    sGrad.addColorStop(0.70, 'rgba(50, 35, 20, 0.08)');
    sGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 256, 256);
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(1.35, 0.70);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0.85
    });
    const groundShadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    groundShadowMesh.rotation.x = -Math.PI / 2;
    groundShadowMesh.position.set(0, -0.31, 0.05);
    scene.add(groundShadowMesh);

    // ---- GLTF Avatar Load ----
    const loader = new GLTFLoader();
    const bones = {};
    const glbUrl = getAssetUrl('/zhenja.glb');

    loader.load(
      glbUrl,
      (gltf) => {
        const model = gltf.scene;
        scene.add(model);
        model.position.set(0, -0.30, 0);

        // Map bones
        const targetBoneNames = [
          'Head', 'Neck', 'Spine2', 'Spine1', 'Spine', 'Hips',
          'LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftHand',
          'RightShoulder', 'RightArm', 'RightForeArm', 'RightHand',
          'LeftHandThumb1', 'LeftHandThumb2', 'LeftHandThumb3',
          'LeftHandIndex1', 'LeftHandIndex2', 'LeftHandIndex3',
          'LeftHandMiddle1', 'LeftHandMiddle2', 'LeftHandMiddle3',
          'LeftHandRing1', 'LeftHandRing2', 'LeftHandRing3',
          'LeftHandPinky1', 'LeftHandPinky2', 'LeftHandPinky3',
          'RightHandThumb1', 'RightHandThumb2', 'RightHandThumb3',
          'RightHandIndex1', 'RightHandIndex2', 'RightHandIndex3',
          'RightHandMiddle1', 'RightHandMiddle2', 'RightHandMiddle3',
          'RightHandRing1', 'RightHandRing2', 'RightHandRing3',
          'RightHandPinky1', 'RightHandPinky2', 'RightHandPinky3',
        ];

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
          if (targetBoneNames.includes(child.name)) {
            bones[child.name] = child;
          }
        });

        if (bones['Hips']) {
          baseHipsYRef.current = bones['Hips'].position.y;
        }

        bonesRef.current = bones;
        setLoadState('ready');
        console.log('[ZhenjaAvatar] Loaded & mapped bones:', Object.keys(bones).length);
      },
      undefined,
      (err) => {
        console.error('[ZhenjaAvatar] Error loading GLB:', err);
        setLoadState('error');
      }
    );

    // ---- Animation Loop ----
    let animFrameId;
    let lastTime = performance.now();
    const startTime = performance.now();

    const animate = (timestamp) => {
      animFrameId = requestAnimationFrame(animate);

      const now = timestamp || performance.now();
      const delta = Math.min(0.1, (now - lastTime) * 0.001 || 0.016);
      lastTime = now;
      const queueBoost = Math.min(2.8, 1.0 + (queueLengthRef.current || 0) * 0.35);
      const currentPlaybackRate = (playbackRateRef.current || 1.0) * queueBoost;
      const totalElapsed = (now - startTime) * 0.001;
      const elapsed = (now - animStartTimeRef.current) * 0.001 * currentPlaybackRate;
      drawBackground(totalElapsed);

      const motionData = motionDataRef.current;
      const target = targetPoseRef.current || SMPLX_ISL_POSES['HELLO'];
      const loadedBones = bonesRef.current;
      const sf = Math.min(1, delta * 24.0 * currentPlaybackRate);

      // Fast, snappy lead-in crossfade blend factor (0 to 1 over transitionDuration)
      const transitionDuration = Math.max(0.08, 0.14 / currentPlaybackRate);
      const transitionTime = (now - transitionStartRef.current) * 0.001;
      const blendFactor = Math.min(1, Math.max(0, transitionTime / transitionDuration));
      const smoothBlend = THREE.MathUtils.smoothstep(blendFactor, 0, 1);
      const prevBones = prevBonesRef.current;

      const setBoneRotationWithBlend = (boneName, tx, ty, tz) => {
        const b = loadedBones[boneName];
        if (!b) return;
        const prev = prevBones[boneName];
        if (prev && smoothBlend < 1) {
          const blendedX = THREE.MathUtils.lerp(prev.x, tx, smoothBlend);
          const blendedY = THREE.MathUtils.lerp(prev.y, ty, smoothBlend);
          const blendedZ = THREE.MathUtils.lerp(prev.z, tz, smoothBlend);
          b.rotation.x = THREE.MathUtils.lerp(b.rotation.x, blendedX, sf);
          b.rotation.y = THREE.MathUtils.lerp(b.rotation.y, blendedY, sf);
          b.rotation.z = THREE.MathUtils.lerp(b.rotation.z, blendedZ, sf);
        } else {
          b.rotation.x = THREE.MathUtils.lerp(b.rotation.x, tx, sf);
          b.rotation.y = THREE.MathUtils.lerp(b.rotation.y, ty, sf);
          b.rotation.z = THREE.MathUtils.lerp(b.rotation.z, tz, sf);
        }
      };

      if (Object.keys(loadedBones).length > 0) {
        // Natural idle spine breathing + float bob
        const breath = Math.sin(elapsed * 2.1) * 0.015;
        if (loadedBones['Spine2']) {
          loadedBones['Spine2'].rotation.x = THREE.MathUtils.lerp(loadedBones['Spine2'].rotation.x, breath, sf * 0.4);
        }

        if (loadedBones['Hips'] && baseHipsYRef.current !== null) {
          const floatBob = Math.sin(elapsed * 1.5) * 0.003;
          loadedBones['Hips'].position.y = baseHipsYRef.current + floatBob;
        }

        // 1. Motion Capture Frames Playback (if motion JSON loaded)
        if (motionData && motionData.frames && motionData.frames.length > 0) {
          const frames = motionData.frames;
          const totalFrames = frames.length;
          const fps = 30;
          const durationSec = totalFrames / fps;
          const currentSec = elapsed % durationSec;
          const frameIdx1 = Math.floor(currentSec * fps) % totalFrames;
          const frameIdx2 = (frameIdx1 + 1) % totalFrames;
          const factor = (currentSec * fps) - frameIdx1;

          const row1 = frames[frameIdx1];
          const row2 = frames[frameIdx2];

          if (row1 && row2) {
            const getVal = (idx) => (row1[idx] || 0) + ((row2[idx] || 0) - (row1[idx] || 0)) * factor;

            // Head & Neck (SMPL-X neck: 36..38, head: 45..47)
            setBoneRotationWithBlend(
              'Head',
              (getVal(45) || 0) * 0.4 + 0.15,
              (getVal(46) || 0) * 0.4,
              (getVal(47) || 0) * 0.4
            );
            setBoneRotationWithBlend(
              'Neck',
              (getVal(36) || 0) * 0.4 + 0.10,
              (getVal(37) || 0) * 0.4,
              (getVal(38) || 0) * 0.4
            );

            // Left Arm Chain (Shoulder, Elbow, Wrist) - Verified Front Chest Signing Space
            const rawL_armX = getVal(48) || 0;
            const rawL_armY = getVal(49) || 0;
            const rawL_armZ = getVal(50) || 0;
            const targetL_rotX = 0.95 + rawL_armX * 0.15;
            const targetL_rotY = 0.10 + rawL_armY * 0.15;
            const targetL_rotZ = 0.15 + rawL_armZ * 0.15;
            setBoneRotationWithBlend('LeftArm', targetL_rotX, targetL_rotY, targetL_rotZ);

            const leftElbow = Math.min(1.8, Math.abs(getVal(55) || getVal(54) || 0.5));
            const targetL_elbowX = 1.20 + (leftElbow - 0.5) * 0.25;
            const targetL_elbowY = (getVal(54) || 0) * 0.15;
            const targetL_elbowZ = 1.30;
            setBoneRotationWithBlend('LeftForeArm', targetL_elbowX, targetL_elbowY, targetL_elbowZ);

            setBoneRotationWithBlend(
              'LeftHand',
              0.20 + (getVal(60) || 0) * 0.15,
              0.10 + (getVal(61) || 0) * 0.15,
              (getVal(62) || 0) * 0.15
            );

            // Right Arm Chain (Shoulder, Elbow, Wrist) - Verified Front Chest Signing Space
            const rawR_armX = getVal(51) || 0;
            const rawR_armY = getVal(52) || 0;
            const rawR_armZ = getVal(53) || 0;
            const targetR_rotX = 0.95 + rawR_armX * 0.15;
            const targetR_rotY = -0.10 - rawR_armY * 0.15;
            const targetR_rotZ = -0.15 - rawR_armZ * 0.15;
            setBoneRotationWithBlend('RightArm', targetR_rotX, targetR_rotY, targetR_rotZ);

            const rightElbow = Math.min(1.8, Math.abs(getVal(58) || getVal(57) || 0.5));
            const targetR_elbowX = 1.20 + (rightElbow - 0.5) * 0.25;
            const targetR_elbowY = -(getVal(57) || 0) * 0.15;
            const targetR_elbowZ = -1.30;
            setBoneRotationWithBlend('RightForeArm', targetR_elbowX, targetR_elbowY, targetR_elbowZ);

            setBoneRotationWithBlend(
              'RightHand',
              0.20 + (getVal(63) || 0) * 0.15,
              -0.10 + (getVal(64) || 0) * 0.15,
              (getVal(65) || 0) * 0.15
            );

            // MANO 15-Joint Articulated Finger Flexions (L: 66..110, R: 111..155)
            const flexL = (bName, offset) => {
              const val = Math.abs(getVal(66 + offset)) * 0.85 + 0.12;
              setBoneRotationWithBlend(bName, val, 0, 0);
            };
            const flexR = (bName, offset) => {
              const val = Math.abs(getVal(111 + offset)) * 0.85 + 0.12;
              setBoneRotationWithBlend(bName, val, 0, 0);
            };

            // Left Hand Fingers
            flexL('LeftHandThumb1', 0);  flexL('LeftHandThumb2', 3);  flexL('LeftHandThumb3', 6);
            flexL('LeftHandIndex1', 9);  flexL('LeftHandIndex2', 12); flexL('LeftHandIndex3', 15);
            flexL('LeftHandMiddle1', 18); flexL('LeftHandMiddle2', 21); flexL('LeftHandMiddle3', 24);
            flexL('LeftHandRing1', 27);  flexL('LeftHandRing2', 30);  flexL('LeftHandRing3', 33);
            flexL('LeftHandPinky1', 36); flexL('LeftHandPinky2', 39); flexL('LeftHandPinky3', 42);

            // Right Hand Fingers
            flexR('RightHandThumb1', 0);  flexR('RightHandThumb2', 3);  flexR('RightHandThumb3', 6);
            flexR('RightHandIndex1', 9);  flexR('RightHandIndex2', 12); flexR('RightHandIndex3', 15);
            flexR('RightHandMiddle1', 18); flexR('RightHandMiddle2', 21); flexR('RightHandMiddle3', 24);
            flexR('RightHandRing1', 27);  flexR('RightHandRing2', 30);  flexR('RightHandRing3', 33);
            flexR('RightHandPinky1', 36); flexR('RightHandPinky2', 39); flexR('RightHandPinky3', 42);
          }
        } else if (target) {
          // 2. Holistic Pose Kinematics Fallback (for single letters & signs without JSON)
          const timeSinceActive = (now - lastActiveTimeRef.current) * 0.001;
          const isFullyIdle = Boolean(isIdleRef.current) && timeSinceActive > 1.8;
          const isPoisedHold = Boolean(isIdleRef.current) && !isFullyIdle;

          if (!isIdleRef.current) {
            lastActiveTimeRef.current = now;
          }

          const armSwayY = isFullyIdle ? Math.sin(elapsed * 2.2) * 0.025 : Math.sin(elapsed * 2.5) * 0.012;
          const armSwayZ = isFullyIdle ? Math.cos(elapsed * 1.8) * 0.015 : Math.cos(elapsed * 2.0) * 0.008;
          const wristRotOffset = isFullyIdle ? Math.sin(elapsed * 3.4) * 0.02 : 0;

          if (target.head) {
            setBoneRotationWithBlend('Head', (target.head.x || 0) + armSwayY * 0.2, (target.head.y || 0) + armSwayZ * 0.3, target.head.z || 0);
            setBoneRotationWithBlend('Neck', (target.head.x || 0) * 0.5, (target.head.y || 0) * 0.5, 0);
          }

          if (isFullyIdle) {
            // Long pause (>1.8s): Natural relaxed resting pose along front-sides of thighs
            setBoneRotationWithBlend('LeftArm', 0.85 + armSwayY, 0.08, 0.08);
            setBoneRotationWithBlend('LeftForeArm', 0.05, 0.0, 0.25 + wristRotOffset);
            setBoneRotationWithBlend('LeftHand', 0.05, 0.0, 0.0);
            applyFingerShape(loadedBones, 'LeftHand', 'rest_relaxed', sf, elapsed);

            setBoneRotationWithBlend('RightArm', 0.85 + armSwayY, -0.08, -0.08);
            setBoneRotationWithBlend('RightForeArm', 0.05, 0.0, -0.25 - wristRotOffset);
            setBoneRotationWithBlend('RightHand', 0.05, 0.0, 0.0);
            applyFingerShape(loadedBones, 'RightHand', 'rest_relaxed', sf, elapsed);
          } else if (isPoisedHold) {
            // Co-articulation Hold (<1.8s between words/sentences): Poised signing stance in front of lower chest
            setBoneRotationWithBlend('LeftArm', 0.70 + armSwayY, 0.18, 0.10);
            setBoneRotationWithBlend('LeftForeArm', 1.10, 0.05, 1.20 + armSwayZ);
            setBoneRotationWithBlend('LeftHand', 0.10, 0.05, 0.0);
            applyFingerShape(loadedBones, 'LeftHand', 'rest_poised', sf, elapsed);

            setBoneRotationWithBlend('RightArm', 0.70 + armSwayY, -0.18, -0.10);
            setBoneRotationWithBlend('RightForeArm', 1.10, -0.05, -1.20 - armSwayZ);
            setBoneRotationWithBlend('RightHand', 0.10, -0.05, 0.0);
            applyFingerShape(loadedBones, 'RightHand', 'rest_poised', sf, elapsed);
          } else {
            // Active Signing Gesture Posture (Elevated in front of chest)
            if (target.leftArm) {
              const la = target.leftArm;
              const isArmPoised = la.hand === 'rest_poised' || la.hand === 'rest_relaxed';
              if (isArmPoised) {
                // Secondary non-signing arm stays poised ready in front of lower chest/waist
                setBoneRotationWithBlend('LeftArm', 0.70, 0.18, 0.10);
                setBoneRotationWithBlend('LeftForeArm', 1.10, 0.05, 1.20);
                setBoneRotationWithBlend('LeftHand', 0.10, 0.05, 0.0);
                applyFingerShape(loadedBones, 'LeftHand', 'rest_poised', sf, elapsed);
              } else {
                const targetL_rotX = 0.95 + (la.shoulder?.x ? (la.shoulder.x - 0.8) * 0.20 : 0);
                const targetL_rotY = 0.10 + (la.shoulder?.y ? (la.shoulder.y - 0.25) * 0.20 : 0);
                const targetL_rotZ = 0.15 + (la.shoulder?.z ? (la.shoulder.z + 0.15) * 0.20 : 0);
                setBoneRotationWithBlend('LeftArm', targetL_rotX, targetL_rotY, targetL_rotZ);

                const targetL_elbowX = 1.20 + (la.elbow ? (la.elbow - 1.35) * 0.30 : 0);
                const targetL_elbowY = (la.forearmTwist || 0) * 0.15;
                const targetL_elbowZ = 1.30;
                setBoneRotationWithBlend('LeftForeArm', targetL_elbowX, targetL_elbowY, targetL_elbowZ);

                setBoneRotationWithBlend(
                  'LeftHand',
                  0.20 + (la.wrist?.x || 0) * 0.15,
                  0.10 + (la.wrist?.y || 0) * 0.15,
                  (la.wrist?.z || 0) * 0.15
                );
                applyFingerShape(loadedBones, 'LeftHand', la.hand || 'open_5_spread', sf, elapsed);
              }
            }

            if (target.rightArm) {
              const ra = target.rightArm;
              const isArmPoised = ra.hand === 'rest_poised' || ra.hand === 'rest_relaxed';
              if (isArmPoised) {
                // Secondary non-signing arm stays poised ready in front of lower chest/waist
                setBoneRotationWithBlend('RightArm', 0.70, -0.18, -0.10);
                setBoneRotationWithBlend('RightForeArm', 1.10, -0.05, -1.20);
                setBoneRotationWithBlend('RightHand', 0.10, -0.05, 0.0);
                applyFingerShape(loadedBones, 'RightHand', 'rest_poised', sf, elapsed);
              } else {
                const targetR_rotX = 0.95 + (ra.shoulder?.x ? (ra.shoulder.x - 0.85) * 0.20 : 0);
                const targetR_rotY = -0.10 - (ra.shoulder?.y ? (ra.shoulder.y + 0.20) * 0.20 : 0);
                const targetR_rotZ = -0.15 - (ra.shoulder?.z ? (ra.shoulder.z - 0.15) * 0.20 : 0);
                setBoneRotationWithBlend('RightArm', targetR_rotX, targetR_rotY, targetR_rotZ);

                const targetR_elbowX = 1.20 + (ra.elbow ? (ra.elbow - 1.45) * 0.30 : 0);
                const targetR_elbowY = -(ra.forearmTwist || 0) * 0.15;
                const targetR_elbowZ = -1.30;
                setBoneRotationWithBlend('RightForeArm', targetR_elbowX, targetR_elbowY, targetR_elbowZ);

                setBoneRotationWithBlend(
                  'RightHand',
                  0.20 + (ra.wrist?.x || 0) * 0.15,
                  -0.10 + (ra.wrist?.y || 0) * 0.15,
                  (ra.wrist?.z || 0) * 0.15
                );
                applyFingerShape(loadedBones, 'RightHand', ra.hand || 'open_5_spread', sf, elapsed);
              }
            }
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      if (container) container.removeEventListener('wheel', handleWheel);
      if (renderer.domElement) renderer.domElement.remove();
      renderer.dispose();
    };
  }, [playbackRate]);

  return (
    <div style={{ width: '100%', height: '100%', flex: 1, minHeight: 200, position: 'relative' }} ref={mountRef}>
      {loadState === 'loading' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', background: 'rgba(15, 23, 42, 0.8)', fontSize: '14px'
        }}>
          Loading 3D Avatar (zhenja.glb)...
        </div>
      )}
    </div>
  );
}

export default ZhenjaSignAvatar;

