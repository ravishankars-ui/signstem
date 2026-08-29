import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import {
  SMPLX_ISL_POSES,
  MANO_HAND_SHAPES,
  getSMPLXFingerspellPose
} from '../../constants/signAvatarsPoseData';
import { DEFAULT_AVATAR_CONFIG } from '../../constants/avatarCustomization';

/**
 * FBXSignAvatar
 *
 * Loads /Ch33_nonPBR.fbx (Mixamo Ch33 character) and drives it with
 * the existing ISL SMPL-X pose data.
 *
 * Rendering features:
 *  - Animated deep-navy -> indigo -> violet radial gradient background
 *    with 60 drifting star particles and a purple ground glow
 *  - Studio 4-point lighting: warm key, cool fill, violet rim, orange bounce
 *    + face PointLight for eye specular highlight
 *  - PCF soft shadow map
 *  - Smooth delta-lerp ISL pose animation (head, shoulders, elbows, wrists, fingers)
 *  - Idle spine breathing + subtle float bob on the whole model
 *  - Periodic eye blink (head micro-pitch)
 *  - Shimmer loading overlay with progress bar
 *  - Error overlay on FBX load failure
 */
export function FBXSignAvatar({
  currentItem,
  isIdle = true,
  isPlaying = true,
  playbackRate = 1.0,
  onPoseComplete,
  config = DEFAULT_AVATAR_CONFIG
}) {
  const mountRef = useRef(null);
  const targetPoseRef = useRef(SMPLX_ISL_POSES['IDLE']);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const [loadState, setLoadState] = useState('loading');
  const [loadProgress, setLoadProgress] = useState(0);

  // ------------------------------------------------------------------
  // 1. Resolve ISL pose from the active token
  // ------------------------------------------------------------------
  useEffect(() => {
    const token = currentItem?.token?.toUpperCase() || 'IDLE';
    const isFingerspelling = Boolean(currentItem?.isFingerspelling);
    let pose = SMPLX_ISL_POSES['IDLE'];
    if (!isIdle && isPlaying && token !== 'IDLE') {
      pose = isFingerspelling
        ? getSMPLXFingerspellPose(token)
        : SMPLX_ISL_POSES[token] || SMPLX_ISL_POSES['HELLO'];
    }
    targetPoseRef.current = pose;
    if (!isIdle && isPlaying) {
      const duration = (pose.duration || 1200) / playbackRate;
      const timer = setTimeout(() => { if (onPoseComplete) onPoseComplete(); }, duration);
      return () => clearTimeout(timer);
    }
  }, [currentItem?.id, currentItem?.token, currentItem?.isFingerspelling, isIdle, isPlaying, playbackRate, onPoseComplete]);

  // ------------------------------------------------------------------
  // 2. Three.js scene + FBX load
  // ------------------------------------------------------------------
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 380;
    const height = container.clientHeight || 500;

    // ---- Scene -------------------------------------------------------
    const scene = new THREE.Scene();

    // ---- Animated gradient background --------------------------------
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = 512; bgCanvas.height = 512;
    const bgCtx = bgCanvas.getContext('2d');
    const bgTexture = new THREE.CanvasTexture(bgCanvas);

    function drawBackground(t) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.4);
      const hue1 = Math.round(220 + pulse * 18);
      const hue2 = Math.round(260 + pulse * 20);
      const grad = bgCtx.createRadialGradient(256, 200, 30, 256, 256, 360);
      grad.addColorStop(0,   'hsl(' + hue1 + ',60%,22%)');
      grad.addColorStop(0.5, 'hsl(' + hue2 + ',55%,14%)');
      grad.addColorStop(1,   'hsl(240,70%,6%)');
      bgCtx.fillStyle = grad;
      bgCtx.fillRect(0, 0, 512, 512);
      // Star particles
      bgCtx.fillStyle = 'rgba(255,255,255,' + (0.04 + 0.03 * pulse) + ')';
      for (let i = 0; i < 60; i++) {
        const sx = (Math.sin(i * 73.7 + t * 0.05) * 0.5 + 0.5) * 512;
        const sy = (Math.cos(i * 53.1 + t * 0.03) * 0.5 + 0.5) * 512;
        const sr = 0.8 + (i % 3) * 0.6;
        bgCtx.beginPath(); bgCtx.arc(sx, sy, sr, 0, Math.PI * 2); bgCtx.fill();
      }
      // Ground glow
      const glow = bgCtx.createLinearGradient(0, 350, 0, 512);
      glow.addColorStop(0, 'rgba(100,80,200,0)');
      glow.addColorStop(1, 'rgba(80,60,200,0.18)');
      bgCtx.fillStyle = glow;
      bgCtx.fillRect(0, 350, 512, 162);
      bgTexture.needsUpdate = true;
    }
    scene.background = bgTexture;

    // ---- Camera ------------------------------------------------------
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(0, 100, 220);
    camera.lookAt(0, 90, 0);

    // ---- Renderer ----------------------------------------------------
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    // ---- Lighting ----------------------------------------------------
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));

    const keyLight = new THREE.DirectionalLight(0xfff5e0, 1.8);
    keyLight.position.set(-80, 200, 160);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1; keyLight.shadow.camera.far = 600;
    keyLight.shadow.camera.left = -150; keyLight.shadow.camera.right = 150;
    keyLight.shadow.camera.top = 220; keyLight.shadow.camera.bottom = -60;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xc0d8ff, 0.9);
    fillLight.position.set(120, 80, 140);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xb080ff, 1.2);
    rimLight.position.set(0, 160, -180);
    scene.add(rimLight);

    const bounceLight = new THREE.DirectionalLight(0xffe0b0, 0.4);
    bounceLight.position.set(0, -50, 80);
    scene.add(bounceLight);

    const facePoint = new THREE.PointLight(0xffffff, 0.6, 500);
    facePoint.position.set(0, 170, 120);
    scene.add(facePoint);

    // ---- Shadow plane ------------------------------------------------
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(300, 300),
      new THREE.ShadowMaterial({ opacity: 0.25 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // ---- State -------------------------------------------------------
    const bones = {};
    let mixer = null;
    let modelGroup = null;

    // ---- FBX Load ----------------------------------------------------
    const loader = new FBXLoader();
    const fbxUrl = (typeof globalThis.chrome !== 'undefined' && globalThis.chrome?.runtime?.getURL)
      ? globalThis.chrome.runtime.getURL('/Ch33_nonPBR.fbx')
      : '/Ch33_nonPBR.fbx';
    loader.load(
      fbxUrl,
      (fbx) => {
        modelGroup = fbx;
        console.log('[FBXSignAvatar] Model loaded. Scanning skeleton...');
        fbx.traverse((child) => {
          if (child.isBone || child.type === 'Bone') console.log('  Bone:', child.name);
          if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; }
        });

        // Scale & centre
        const box = new THREE.Box3().setFromObject(fbx);
        const modelH = box.max.y - box.min.y;
        fbx.scale.setScalar(180 / (modelH || 1));
        box.setFromObject(fbx);
        const centre = new THREE.Vector3();
        box.getCenter(centre);
        fbx.position.x -= centre.x;
        fbx.position.z -= centre.z;
        fbx.position.y -= box.min.y;
        scene.add(fbx);

        // Reframe camera to character bust
        const fb2 = new THREE.Box3().setFromObject(fbx);
        const charH = fb2.max.y - fb2.min.y;
        const focusY = fb2.min.y + charH * 0.68;
        camera.position.set(0, focusY, charH * 1.1);
        camera.lookAt(0, focusY, 0);

        // Bone mapping — Mixamo naming (mixamorig prefix)
        const boneAliases = {
          leftShoulder:  ['mixamorigLeftArm',      'LeftArm'],
          leftElbow:     ['mixamorigLeftForeArm',   'LeftForeArm'],
          leftWrist:     ['mixamorigLeftHand',      'LeftHand'],
          rightShoulder: ['mixamorigRightArm',      'RightArm'],
          rightElbow:    ['mixamorigRightForeArm',  'RightForeArm'],
          rightWrist:    ['mixamorigRightHand',     'RightHand'],
          head:          ['mixamorigHead',          'Head'],
          neck:          ['mixamorigNeck',          'Neck'],
          spine:         ['mixamorigSpine2', 'Spine2', 'Spine1', 'Spine'],
          hips:          ['mixamorigHips',          'Hips'],
          lThumb1: ['mixamorigLeftHandThumb1',  'LeftHandThumb1'],
          lThumb2: ['mixamorigLeftHandThumb2',  'LeftHandThumb2'],
          lThumb3: ['mixamorigLeftHandThumb3',  'LeftHandThumb3'],
          lIndex1: ['mixamorigLeftHandIndex1',  'LeftHandIndex1'],
          lIndex2: ['mixamorigLeftHandIndex2',  'LeftHandIndex2'],
          lIndex3: ['mixamorigLeftHandIndex3',  'LeftHandIndex3'],
          lMiddle1:['mixamorigLeftHandMiddle1', 'LeftHandMiddle1'],
          lMiddle2:['mixamorigLeftHandMiddle2', 'LeftHandMiddle2'],
          lMiddle3:['mixamorigLeftHandMiddle3', 'LeftHandMiddle3'],
          lRing1:  ['mixamorigLeftHandRing1',   'LeftHandRing1'],
          lRing2:  ['mixamorigLeftHandRing2',   'LeftHandRing2'],
          lRing3:  ['mixamorigLeftHandRing3',   'LeftHandRing3'],
          lPinky1: ['mixamorigLeftHandPinky1',  'LeftHandPinky1'],
          lPinky2: ['mixamorigLeftHandPinky2',  'LeftHandPinky2'],
          lPinky3: ['mixamorigLeftHandPinky3',  'LeftHandPinky3'],
          rThumb1: ['mixamorigRightHandThumb1',  'RightHandThumb1'],
          rThumb2: ['mixamorigRightHandThumb2',  'RightHandThumb2'],
          rThumb3: ['mixamorigRightHandThumb3',  'RightHandThumb3'],
          rIndex1: ['mixamorigRightHandIndex1',  'RightHandIndex1'],
          rIndex2: ['mixamorigRightHandIndex2',  'RightHandIndex2'],
          rIndex3: ['mixamorigRightHandIndex3',  'RightHandIndex3'],
          rMiddle1:['mixamorigRightHandMiddle1', 'RightHandMiddle1'],
          rMiddle2:['mixamorigRightHandMiddle2', 'RightHandMiddle2'],
          rMiddle3:['mixamorigRightHandMiddle3', 'RightHandMiddle3'],
          rRing1:  ['mixamorigRightHandRing1',   'RightHandRing1'],
          rRing2:  ['mixamorigRightHandRing2',   'RightHandRing2'],
          rRing3:  ['mixamorigRightHandRing3',   'RightHandRing3'],
          rPinky1: ['mixamorigRightHandPinky1',  'RightHandPinky1'],
          rPinky2: ['mixamorigRightHandPinky2',  'RightHandPinky2'],
          rPinky3: ['mixamorigRightHandPinky3',  'RightHandPinky3'],
        };

        fbx.traverse((child) => {
          for (const [key, aliases] of Object.entries(boneAliases)) {
            if (aliases.some((a) => child.name === a || child.name.endsWith(a))) {
              if (!bones[key]) bones[key] = child;
            }
          }
        });

        console.log('[FBXSignAvatar] Mapped bones:', Object.keys(bones).join(', '));

        // Play embedded clip at negligible weight (prevents T-pose snap)
        if (fbx.animations && fbx.animations.length > 0) {
          mixer = new THREE.AnimationMixer(fbx);
          const action = mixer.clipAction(fbx.animations[0]);
          action.setEffectiveWeight(0.05);
          action.play();
        }

        setLoadState('ready');
      },
      (p) => { if (p.total > 0) setLoadProgress(Math.round((p.loaded / p.total) * 100)); },
      (err) => { console.error('[FBXSignAvatar] Load error:', err); setLoadState('error'); }
    );

    // ---- Animation loop ---------------------------------------------
    let animFrameId;
    let lastTime = performance.now();
    const startTime = performance.now();
    let blinkTimer = 0;

    const animate = (timestamp) => {
      animFrameId = requestAnimationFrame(animate);
      const now = timestamp || performance.now();
      const delta = Math.min(0.1, (now - lastTime) * 0.001 || 0.016);
      lastTime = now;
      const elapsed = (now - startTime) * 0.001;

      drawBackground(elapsed);
      if (mixer) mixer.update(0);

      const target = targetPoseRef.current;
      const sf = Math.min(1, delta * 16.0 * playbackRate);

      // Blink (micro head-pitch)
      blinkTimer += delta;
      const blinking = blinkTimer > 3.5 && blinkTimer < 3.7;
      if (blinkTimer > 3.7) blinkTimer = 0;
      // Limb sway active only during active non-paused idle
      const isPaused = !isPlayingRef.current;
      const isCurrentlyIdle = isIdle || isPaused;
      const armSwayY = (isCurrentlyIdle && !isPaused) ? Math.sin(elapsed * 2.2) * 0.025 : 0;
      const armSwayZ = (isCurrentlyIdle && !isPaused) ? Math.cos(elapsed * 1.8) * 0.015 : 0;
      const wristRotOffset = 0;

      // Head & neck
      if (bones.head && target.head) {
        bones.head.rotation.x = THREE.MathUtils.lerp(bones.head.rotation.x, (target.head.x || 0) + armSwayY * 0.2, sf);
        bones.head.rotation.y = THREE.MathUtils.lerp(bones.head.rotation.y, (target.head.y || 0) + armSwayZ * 0.3, sf);
        bones.head.rotation.z = THREE.MathUtils.lerp(bones.head.rotation.z, (target.head.z || 0), sf);
      }
      if (bones.neck && target.head) {
        bones.neck.rotation.x = THREE.MathUtils.lerp(bones.neck.rotation.x, (target.head.x || 0) * 0.5, sf);
        bones.neck.rotation.y = THREE.MathUtils.lerp(bones.neck.rotation.y, (target.head.y || 0) * 0.5, sf);
      }

      // Left arm chain (shoulder, upper arm, elbow, forearm, wrist, hands)
      if (target.leftArm) {
        const la = isPaused ? { shoulder: { x: 0.2, y: 0.05, z: 0.1 }, elbow: 0.1, hand: 'rest_relaxed' } : target.leftArm;
        if (bones.leftShoulder) {
          const targetL_rotZ = -0.55 - (la.shoulder.x || 0) * 0.5;
          const targetL_rotY = 0.45 + (la.shoulder.y || 0) * 0.5;
          const targetL_rotX = (la.shoulder.z || 0) * 0.5 + armSwayY;

          bones.leftShoulder.rotation.x = THREE.MathUtils.lerp(bones.leftShoulder.rotation.x, targetL_rotX, sf);
          bones.leftShoulder.rotation.y = THREE.MathUtils.lerp(bones.leftShoulder.rotation.y, targetL_rotY, sf);
          bones.leftShoulder.rotation.z = THREE.MathUtils.lerp(bones.leftShoulder.rotation.z, targetL_rotZ, sf);
        }
        if (bones.leftElbow) {
          const targetL_elbowZ = -0.45 - (la.elbow || 0) * 0.75;
          const targetL_elbowY = (la.forearmTwist || 0) + wristRotOffset;
          bones.leftElbow.rotation.z = THREE.MathUtils.lerp(bones.leftElbow.rotation.z, targetL_elbowZ, sf);
          bones.leftElbow.rotation.y = THREE.MathUtils.lerp(bones.leftElbow.rotation.y, targetL_elbowY, sf);
        }
        if (bones.leftWrist) {
          bones.leftWrist.rotation.x = THREE.MathUtils.lerp(bones.leftWrist.rotation.x, (la.wrist?.x || 0) + wristRotOffset, sf);
          bones.leftWrist.rotation.y = THREE.MathUtils.lerp(bones.leftWrist.rotation.y, (la.wrist?.y || 0), sf);
          bones.leftWrist.rotation.z = THREE.MathUtils.lerp(bones.leftWrist.rotation.z, (la.wrist?.z || 0) + wristRotOffset * 0.5, sf);
        }
        applyFingerShape(bones, 'l', la.hand || 'rest_relaxed', sf, elapsed, isPaused || isCurrentlyIdle);
      }

      // Right arm chain (shoulder, upper arm, elbow, forearm, wrist, hands)
      if (target.rightArm) {
        const ra = isPaused ? { shoulder: { x: 0.2, y: -0.05, z: -0.1 }, elbow: 0.1, hand: 'rest_relaxed' } : target.rightArm;
        if (bones.rightShoulder) {
          const targetR_rotZ = 0.55 + (ra.shoulder.x || 0) * 0.5;
          const targetR_rotY = -0.45 + (ra.shoulder.y || 0) * 0.5;
          const targetR_rotX = (ra.shoulder.z || 0) * 0.5 + armSwayY;

          bones.rightShoulder.rotation.x = THREE.MathUtils.lerp(bones.rightShoulder.rotation.x, targetR_rotX, sf);
          bones.rightShoulder.rotation.y = THREE.MathUtils.lerp(bones.rightShoulder.rotation.y, targetR_rotY, sf);
          bones.rightShoulder.rotation.z = THREE.MathUtils.lerp(bones.rightShoulder.rotation.z, targetR_rotZ, sf);
        }
        if (bones.rightElbow) {
          const targetR_elbowZ = 0.45 + (ra.elbow || 0) * 0.75;
          const targetR_elbowY = (ra.forearmTwist || 0) - wristRotOffset;
          bones.rightElbow.rotation.z = THREE.MathUtils.lerp(bones.rightElbow.rotation.z, targetR_elbowZ, sf);
          bones.rightElbow.rotation.y = THREE.MathUtils.lerp(bones.rightElbow.rotation.y, targetR_elbowY, sf);
        }
        if (bones.rightWrist) {
          bones.rightWrist.rotation.x = THREE.MathUtils.lerp(bones.rightWrist.rotation.x, (ra.wrist?.x || 0) - wristRotOffset, sf);
          bones.rightWrist.rotation.y = THREE.MathUtils.lerp(bones.rightWrist.rotation.y, (ra.wrist?.y || 0), sf);
          bones.rightWrist.rotation.z = THREE.MathUtils.lerp(bones.rightWrist.rotation.z, (ra.wrist?.z || 0) - wristRotOffset * 0.5, sf);
        }
        applyFingerShape(bones, 'r', ra.hand || 'rest_relaxed', sf, elapsed, isPaused || isCurrentlyIdle);
      }

      // Subtle float-bob
      if (modelGroup) modelGroup.position.y = (isPaused ? 0 : Math.sin(elapsed * 1.1) * 0.6);

      renderer.render(scene, camera);
    };
    animate();

    // ---- Resize observer --------------------------------------------
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(animFrameId);
      ro.disconnect();
      renderer.dispose();
      if (mixer) mixer.stopAllAction();
    };
  }, [config]);

  // ------------------------------------------------------------------
  // 3. Render
  // ------------------------------------------------------------------
  return (
    <div
      className="fbx-avatar-wrapper"
      style={{ width: '100%', height: '100%', position: 'relative', borderRadius: '12px', overflow: 'hidden' }}
    >
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Loading overlay */}
      {loadState === 'loading' && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(160deg,#0f0c29,#1a1040,#0d0d2b)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '16px'
        }}>
          {/* Shimmer avatar silhouette */}
          <svg viewBox="0 0 90 130" width="90" height="130" fill="none">
            <ellipse cx="45" cy="28" rx="22" ry="26" fill="url(#shimA)" />
            <rect x="24" y="54" width="42" height="52" rx="8" fill="url(#shimA)" />
            <rect x="4"  y="58" width="20" height="38" rx="8" fill="url(#shimA)" />
            <rect x="66" y="58" width="20" height="38" rx="8" fill="url(#shimA)" />
            <defs>
              <linearGradient id="shimA" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.4">
                  <animate attributeName="stop-opacity" values="0.2;0.7;0.2" dur="1.4s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.2">
                  <animate attributeName="stop-opacity" values="0.6;0.2;0.6" dur="1.4s" repeatCount="indefinite" />
                </stop>
              </linearGradient>
            </defs>
          </svg>
          {/* Progress bar */}
          <div style={{ width: 140, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>
            <div style={{
              height: '100%', width: loadProgress + '%',
              background: 'linear-gradient(90deg,#6366f1,#a855f7)',
              borderRadius: 4, transition: 'width 0.3s ease'
            }} />
          </div>
          <span style={{ color: 'rgba(200,190,255,0.8)', fontSize: 11, fontFamily: 'system-ui' }}>
            Loading avatar{loadProgress > 0 ? ' \u00b7 ' + loadProgress + '%' : '\u2026'}
          </span>
        </div>
      )}

      {/* Error overlay */}
      {loadState === 'error' && (
        <div style={{
          position: 'absolute', inset: 0, background: '#0f0c29',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 8
        }}>
          <span style={{ fontSize: 32 }}>&#9888;&#65039;</span>
          <span style={{ color: '#f87171', fontSize: 12, fontFamily: 'system-ui' }}>Avatar failed to load</span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Finger Shape Helper — 30-Joint Articulated Finger Kinematics
// ---------------------------------------------------------------------------
function applyFingerShape(bones, side, shapeKey, sf, elapsed = 0, isMotionPaused = false) {
  const shape = MANO_HAND_SHAPES[shapeKey] || MANO_HAND_SHAPES['rest_relaxed'];
  if (!shape) return;
  const isRight = side === 'r';
  const sideSign = isRight ? 1 : -1;

  const fingerConfigs = [
    { name: 'thumb',  b: [side + 'Thumb1',  side + 'Thumb2',  side + 'Thumb3'],  splay: 0.35 * sideSign },
    { name: 'index',  b: [side + 'Index1',  side + 'Index2',  side + 'Index3'],  splay: 0.12 * sideSign },
    { name: 'middle', b: [side + 'Middle1', side + 'Middle2', side + 'Middle3'], splay: 0.0 },
    { name: 'ring',   b: [side + 'Ring1',   side + 'Ring2',   side + 'Ring3'],   splay: -0.12 * sideSign },
    { name: 'pinky',  b: [side + 'Pinky1',  side + 'Pinky2',  side + 'Pinky3'],  splay: -0.22 * sideSign },
  ];

  fingerConfigs.forEach((cfg, idx) => {
    const angles = shape[cfg.name] || [0.2, 0.2, 0.15];
    const [b1, b2, b3] = cfg.b;
    const flutter = isMotionPaused ? 0 : Math.sin(elapsed * 4.8 + idx * 1.1) * 0.02;

    if (cfg.name === 'thumb') {
      if (bones[b1]) {
        bones[b1].rotation.x = THREE.MathUtils.lerp(bones[b1].rotation.x, (angles[0] || 0.2) + flutter, sf);
        bones[b1].rotation.y = THREE.MathUtils.lerp(bones[b1].rotation.y, cfg.splay, sf);
        bones[b1].rotation.z = THREE.MathUtils.lerp(bones[b1].rotation.z, (angles[1] || 0.2) * sideSign, sf);
      }
      if (bones[b2]) {
        bones[b2].rotation.x = THREE.MathUtils.lerp(bones[b2].rotation.x, (angles[1] || 0.15) + flutter, sf);
      }
      if (bones[b3]) {
        bones[b3].rotation.x = THREE.MathUtils.lerp(bones[b3].rotation.x, (angles[2] || 0.1), sf);
      }
    } else {
      if (bones[b1]) {
        bones[b1].rotation.z = THREE.MathUtils.lerp(bones[b1].rotation.z, (angles[0] || 0.2) * sideSign + flutter, sf);
        bones[b1].rotation.y = THREE.MathUtils.lerp(bones[b1].rotation.y, cfg.splay, sf);
      }
      if (bones[b2]) {
        bones[b2].rotation.z = THREE.MathUtils.lerp(bones[b2].rotation.z, (angles[1] || 0.2) * sideSign + flutter, sf);
      }
      if (bones[b3]) {
        bones[b3].rotation.z = THREE.MathUtils.lerp(bones[b3].rotation.z, (angles[2] || 0.15) * sideSign, sf);
      }
    }
  });
}

export default FBXSignAvatar;
