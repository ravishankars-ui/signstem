import React, { useEffect, useState, useMemo } from 'react';
import { FaceFeatures } from './FaceFeatures';
import { DetailedHand } from './DetailedHand';
import { solve2BoneIK } from '../../utils/ikSolver';
import { ISL_WORD_POSES, getISLFingerspellPose } from '../../constants/islPoseData';
import {
  SKIN_TONES,
  HAIR_COLORS,
  CLOTHING_PALETTES,
  DEFAULT_AVATAR_CONFIG
} from '../../constants/avatarCustomization';

/**
 * HumanSignAvatar Master Component
 * 
 * High-precision Indian Sign Language (ISL) Avatar engine with:
 * - 2-Bone Inverse Kinematics (IK) ensuring seamless connected limbs
 * - 5-finger anatomical hand models with knuckle articulation
 * - Full customizable appearance (Skin, Hair, Outfit, Gender, Accessories)
 * - Morphing facial expressions and natural micro-physics
 */
export function HumanSignAvatar({
  currentItem,
  isIdle = true,
  playbackRate = 1.0,
  onPoseComplete,
  config = DEFAULT_AVATAR_CONFIG
}) {
  const [blink, setBlink] = useState(false);
  const [motionTick, setMotionTick] = useState(0);

  // 1. Natural Blinking Loop
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 160);
    }, 4000);
    return () => clearInterval(blinkInterval);
  }, []);

  // 2. Continuous Micro-Motion Tick
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setMotionTick((t) => (t + 1) % 360);
    }, 35);
    return () => clearInterval(tickInterval);
  }, []);

  // 3. Resolve Customization Palettes
  const skinPalette = useMemo(() => {
    return SKIN_TONES.find((s) => s.id === config.skinToneId) || SKIN_TONES[1];
  }, [config.skinToneId]);

  const hairColor = useMemo(() => {
    return HAIR_COLORS.find((h) => h.id === config.hairColorId) || HAIR_COLORS[1];
  }, [config.hairColorId]);

  const clothingPalette = useMemo(() => {
    return CLOTHING_PALETTES.find((c) => c.id === config.clothingPaletteId) || CLOTHING_PALETTES[0];
  }, [config.clothingPaletteId]);

  // 4. Resolve Dynamic ISL Pose
  const pose = useMemo(() => {
    const token = currentItem?.token?.toUpperCase() || 'IDLE';
    const isFingerspelling = Boolean(currentItem?.isFingerspelling);

    if (isIdle || token === 'IDLE') {
      return ISL_WORD_POSES['IDLE'];
    }

    if (isFingerspelling) {
      return getISLFingerspellPose(token);
    }

    return ISL_WORD_POSES[token] || ISL_WORD_POSES['HELLO'];
  }, [currentItem?.token, currentItem?.isFingerspelling, isIdle]);

  // 5. Pose Timing Auto-Advance
  useEffect(() => {
    if (isIdle) return;
    const duration = (pose.duration || 1200) / playbackRate;
    const timer = setTimeout(() => {
      if (onPoseComplete) onPoseComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [currentItem?.id, pose.duration, playbackRate, isIdle, onPoseComplete]);

  // 6. Breathing & Life Calculations
  const breathY = isIdle ? Math.sin((motionTick * Math.PI) / 45) * 2.2 : 0;
  const breathScale = isIdle ? 1 + Math.sin((motionTick * Math.PI) / 45) * 0.012 : 1;

  // Exact Anatomical Shoulder Joint Positions
  const leftShoulder = { x: 144, y: 206 + breathY };
  const rightShoulder = { x: 256, y: 206 + breathY };

  // Solve 2-Bone IK for Left and Right Arms
  const leftIK = useMemo(() => {
    const targetWrist = {
      x: pose.leftArm?.wristX ?? 135,
      y: (pose.leftArm?.wristY ?? 345) + breathY
    };
    return solve2BoneIK(leftShoulder, targetWrist, 68, 64, 'left', pose.leftArm?.rotation || 0);
  }, [pose.leftArm?.wristX, pose.leftArm?.wristY, pose.leftArm?.rotation, leftShoulder, breathY]);

  const rightIK = useMemo(() => {
    const targetWrist = {
      x: pose.rightArm?.wristX ?? 265,
      y: (pose.rightArm?.wristY ?? 345) + breathY
    };
    return solve2BoneIK(rightShoulder, targetWrist, 68, 64, 'right', pose.rightArm?.rotation || 0);
  }, [pose.rightArm?.wristX, pose.rightArm?.wristY, pose.rightArm?.rotation, rightShoulder, breathY]);

  return (
    <div className={`human-avatar-container ${isIdle ? 'mode-idle' : 'mode-signing'}`}>
      <svg
        viewBox="0 0 400 420"
        className="human-avatar-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Shading Gradients */}
          <linearGradient id="bodyShade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={clothingPalette.secondary} />
            <stop offset="100%" stopColor={clothingPalette.primary} />
          </linearGradient>

          <filter id="handShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.25)" />
          </filter>
        </defs>

        {/* --- 1. Torso & Fitted Apparel --- */}
        <g id="torso-layer" style={{ transform: `translate(0px, ${breathY}px)` }}>
          {renderOutfit(config.outfitStyleId, clothingPalette, skinPalette, breathScale)}
        </g>

        {/* --- 2. Neck & Clavicle --- */}
        <g id="neck-layer">
          <path
            d="M 185 142 L 185 194 C 185 200, 215 200, 215 194 L 215 142 Z"
            fill={skinPalette.mid}
          />
          <path
            d="M 187 142 L 187 192 C 187 197, 213 197, 213 192 L 213 142 Z"
            fill={skinPalette.base}
          />
          <path d="M 180 192 Q 194 198 200 195 Q 206 198 220 192" stroke={skinPalette.dark} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.35" />
        </g>

        {/* --- 3. Head & Facial Assembly --- */}
        <g
          id="head-layer"
          style={{
            transformOrigin: '200px 135px',
            transform: `rotate(${pose.headTilt || 0}deg) translate(0px, ${(pose.headPitch || 0) + breathY * 0.5}px)`,
            transition: 'transform 0.35s cubic-bezier(0.34, 1.4, 0.64, 1)'
          }}
        >
          <FaceFeatures
            gender={config.gender}
            skinPalette={skinPalette}
            hairStyle={config.hairStyleId}
            hairColor={hairColor}
            accessory={config.accessoryId}
            blink={blink}
            eyebrowsY={pose.eyebrows || 0}
            mouthShape={pose.mouth || 'neutral-smile'}
            headPitch={pose.headPitch || 0}
          />
        </g>

        {/* --- 4. Arm Behind Layer --- */}
        {pose.leftArm?.layer === 'behind' && (
          <RiggedArm
            side="left"
            ik={leftIK}
            handShape={pose.leftArm?.handShape}
            skinPalette={skinPalette}
            clothingPalette={clothingPalette}
            handScale={config.handScale || 1.0}
          />
        )}
        {pose.rightArm?.layer === 'behind' && (
          <RiggedArm
            side="right"
            ik={rightIK}
            handShape={pose.rightArm?.handShape}
            skinPalette={skinPalette}
            clothingPalette={clothingPalette}
            handScale={config.handScale || 1.0}
          />
        )}

        {/* --- 5. Arm Front Layer (Active Signing Foreground) --- */}
        {pose.leftArm?.layer !== 'behind' && (
          <RiggedArm
            side="left"
            ik={leftIK}
            handShape={pose.leftArm?.handShape}
            skinPalette={skinPalette}
            clothingPalette={clothingPalette}
            handScale={config.handScale || 1.0}
          />
        )}
        {pose.rightArm?.layer !== 'behind' && (
          <RiggedArm
            side="right"
            ik={rightIK}
            handShape={pose.rightArm?.handShape}
            skinPalette={skinPalette}
            clothingPalette={clothingPalette}
            handScale={config.handScale || 1.0}
          />
        )}
      </svg>
    </div>
  );
}

/**
 * RiggedArm Component
 * 
 * Renders an unbroken, anatomically continuous limb using IK solver coordinates:
 * Shoulder -> Upper Arm Sleeve -> Elbow Joint -> Forearm -> Hand
 */
function RiggedArm({ side, ik, handShape, skinPalette, clothingPalette, handScale }) {
  const isRight = side === 'right';
  const { shoulder, elbow, wrist, handAngle } = ik;

  return (
    <g className={`isl-rigged-arm arm-${side}`}>
      {/* 1. Upper Arm Sleeve (Locked to Shoulder and Elbow) */}
      <path
        d={`M ${shoulder.x} ${shoulder.y} L ${elbow.x} ${elbow.y}`}
        stroke={clothingPalette.primary}
        strokeWidth="20"
        strokeLinecap="round"
        fill="none"
        style={{ transition: 'all 0.32s cubic-bezier(0.4, 0, 0.2, 1)' }}
      />
      {/* Shoulder Deltoid Joint */}
      <circle cx={shoulder.x} cy={shoulder.y} r="10" fill={clothingPalette.secondary} />

      {/* Elbow Cuff Hem */}
      <circle cx={elbow.x} cy={elbow.y} r="8.5" fill={clothingPalette.secondary} />

      {/* 2. Forearm (Smooth taper from Elbow to Wrist) */}
      <path
        d={`M ${elbow.x} ${elbow.y} L ${wrist.x} ${wrist.y}`}
        stroke={skinPalette.mid}
        strokeWidth="15"
        strokeLinecap="round"
        fill="none"
        style={{ transition: 'all 0.32s cubic-bezier(0.4, 0, 0.2, 1)' }}
      />
      <path
        d={`M ${elbow.x} ${elbow.y} L ${wrist.x} ${wrist.y}`}
        stroke={skinPalette.base}
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
        style={{ transition: 'all 0.32s cubic-bezier(0.4, 0, 0.2, 1)' }}
      />

      {/* 3. Wrist Joint & Hand Model */}
      <g
        style={{
          transformOrigin: `${wrist.x}px ${wrist.y}px`,
          transform: `translate(${wrist.x}px, ${wrist.y}px) rotate(${handAngle}deg)`,
          transition: 'transform 0.32s cubic-bezier(0.34, 1.3, 0.64, 1)'
        }}
        filter="url(#handShadow)"
      >
        <DetailedHand
          shape={handShape}
          isRight={isRight}
          skinPalette={skinPalette}
          scale={handScale}
        />
      </g>
    </g>
  );
}

/**
 * Renders Fitted, Proportional Outfits
 */
function renderOutfit(style, palette, skin, breathScale) {
  const { primary, secondary, trim } = palette;

  switch (style) {
    case 'fitted-blazer':
      return (
        <g style={{ transformOrigin: '200px 300px', transform: `scale(${breathScale})` }}>
          {/* Inner Collared Shirt */}
          <path d="M 178 190 L 200 242 L 222 190 Z" fill="#f8fafc" />
          <line x1="200" y1="230" x2="200" y2="340" stroke="#cbd5e1" strokeWidth="1.6" />
          {/* Tailored Blazer Torso */}
          <path
            d="M 124 300 C 124 218, 146 190, 200 190 C 254 190, 276 218, 276 300 L 286 420 L 114 420 Z"
            fill={primary}
          />
          {/* Lapels */}
          <path d="M 148 194 L 178 266 L 142 276 Z" fill={secondary} />
          <path d="M 252 194 L 222 266 L 258 276 Z" fill={secondary} />
          {/* Pocket Square */}
          <rect x="144" y="284" width="18" height="3" rx="1.5" fill={trim} />
        </g>
      );

    case 'mandarin-kurta':
      return (
        <g style={{ transformOrigin: '200px 300px', transform: `scale(${breathScale})` }}>
          <path
            d="M 124 300 C 124 218, 146 190, 200 190 C 254 190, 276 218, 276 300 L 286 420 L 114 420 Z"
            fill={primary}
          />
          <path d="M 182 186 L 200 194 L 218 186 L 218 196 L 200 204 L 182 196 Z" fill={trim} />
          <rect x="196" y="204" width="8" height="90" rx="4" fill={secondary} />
          <circle cx="200" cy="218" r="2" fill={trim} />
          <circle cx="200" cy="236" r="2" fill={trim} />
          <circle cx="200" cy="254" r="2" fill={trim} />
          <circle cx="200" cy="272" r="2" fill={trim} />
        </g>
      );

    case 'smart-polo':
      return (
        <g style={{ transformOrigin: '200px 300px', transform: `scale(${breathScale})` }}>
          <path
            d="M 124 300 C 124 218, 146 190, 200 190 C 254 190, 276 218, 276 300 L 286 420 L 114 420 Z"
            fill={primary}
          />
          <path d="M 176 188 L 190 220 L 200 198 L 210 220 L 224 188 Z" fill={secondary} />
          <line x1="200" y1="198" x2="200" y2="250" stroke={trim} strokeWidth="2" strokeLinecap="round" />
          <circle cx="200" cy="212" r="1.6" fill="#ffffff" />
          <circle cx="200" cy="230" r="1.6" fill="#ffffff" />
        </g>
      );

    case 'cozy-sweater':
    default:
      return (
        <g style={{ transformOrigin: '200px 300px', transform: `scale(${breathScale})` }}>
          <path
            d="M 124 300 C 124 218, 146 190, 200 190 C 254 190, 276 218, 276 300 L 286 420 L 114 420 Z"
            fill={primary}
          />
          {/* Ribbed Crewneck Collar */}
          <path
            d="M 174 190 C 182 208, 218 208, 226 190"
            stroke={secondary}
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 176 190 C 184 206, 216 206, 224 190"
            stroke={trim}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />
        </g>
      );
  }
}

export default HumanSignAvatar;
