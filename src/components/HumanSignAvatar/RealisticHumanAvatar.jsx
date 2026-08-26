import React, { useEffect, useState, useMemo } from 'react';
import { ISL_WORD_POSES, getISLFingerspellPose } from '../../constants/islPoseData';
import { DetailedHandRenderer } from './DetailedHandRenderer';
import {
  SKIN_TONES,
  HAIR_COLORS,
  CLOTHING_PALETTES,
  DEFAULT_AVATAR_CONFIG
} from '../../constants/avatarCustomization';

/**
 * RealisticHumanAvatar Component
 * 
 * Studio-Grade Photorealistic Human Sign Language Presenter:
 * - Thick, Muscular Proportionate Human Arms & Broad Deltoid Shoulders
 * - Male / Female Gender Selection with distinct haircuts & facial contours
 * - Fuller, Volumetric Hair (Female: Flowing Locks; Male: Styled Short Crop Cut)
 * - 5-Joint Anatomical Kinematic Rig (Shoulder, Upper Arm, Elbow, Forearm, Wrist)
 * - Detailed 5-Finger Hands with translucent fingernails and palm creases
 */
export function RealisticHumanAvatar({
  currentItem,
  isIdle = true,
  playbackRate = 1.0,
  onPoseComplete,
  config = DEFAULT_AVATAR_CONFIG
}) {
  const [blink, setBlink] = useState(false);
  const [breathPhase, setBreathPhase] = useState(0);

  // Resolve palette
  const skin = SKIN_TONES.find((s) => s.id === config.skinToneId) || SKIN_TONES[1];
  const hair = HAIR_COLORS.find((h) => h.id === config.hairColorId) || HAIR_COLORS[1];
  const cloth = CLOTHING_PALETTES.find((c) => c.id === config.clothingPaletteId) || CLOTHING_PALETTES[0];
  const isMale = config.gender === 'male';

  // Natural blinking & breathing
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 170);
    }, 3600);

    const breathInterval = setInterval(() => {
      setBreathPhase((prev) => (prev + 1) % 100);
    }, 40);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(breathInterval);
    };
  }, []);

  // Current Pose Calculation
  const currentPose = useMemo(() => {
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

  // Handle duration and auto-advance
  useEffect(() => {
    if (!isIdle && currentPose) {
      const duration = (currentPose.duration || 1200) / playbackRate;
      const timer = setTimeout(() => {
        if (onPoseComplete) onPoseComplete();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [currentItem?.id, currentItem?.token, isIdle, currentPose, playbackRate, onPoseComplete]);

  // Micro-breathing & arm movement dynamics
  const breathY = Math.sin((breathPhase / 100) * Math.PI * 2) * 1.8;
  const armSwayY = Math.sin((breathPhase / 100) * Math.PI * 2) * 2.4;
  const armSwayX = Math.cos((breathPhase / 100) * Math.PI * 2) * 1.6;

  // Arm positions & rotations with active limb movement
  const baseLeftArm = currentPose.leftArm || { wristX: 135, wristY: 375, rot: 15, handShape: 'rest_relaxed' };
  const baseRightArm = currentPose.rightArm || { wristX: 265, wristY: 375, rot: -15, handShape: 'rest_relaxed' };

  const leftArm = {
    ...baseLeftArm,
    wristX: baseLeftArm.wristX + armSwayX,
    wristY: baseLeftArm.wristY + armSwayY,
    rot: (baseLeftArm.rot || 0) + armSwayX * 0.8
  };

  const rightArm = {
    ...baseRightArm,
    wristX: baseRightArm.wristX - armSwayX,
    wristY: baseRightArm.wristY + armSwayY,
    rot: (baseRightArm.rot || 0) - armSwayX * 0.8
  };

  // Face morphing
  const face = currentPose.face || { brow: 'neutral', mouth: 'smile', headY: 0, headRot: 0 };
  const browOffset = face.brow === 'raised' ? -4 : (face.brow === 'inward' ? 3 : 0);
  const isQuestionMouth = face.mouth === 'question';

  // Dynamic Broad Shoulder Kinematics
  const shoulderElevL = Math.max(-14, Math.min(10, (leftArm.wristY - 300) * 0.08));
  const shoulderElevR = Math.max(-14, Math.min(10, (rightArm.wristY - 300) * 0.08));
  const shoulderL = { x: 120, y: 210 + breathY * 0.5 + shoulderElevL };
  const shoulderR = { x: 280, y: 210 + breathY * 0.5 + shoulderElevR };

  // Smart Anatomical Elbow Calculation (Elbows stay at sides when arms cross)
  const isLeftCrossingRight = leftArm.wristX > 180;
  const elbowLx = isLeftCrossingRight
    ? Math.min(102, shoulderL.x - 18)
    : (shoulderL.x + leftArm.wristX) / 2 - 26;
  const elbowLy = Math.max(305, (shoulderL.y + leftArm.wristY) / 2 + 10);
  const elbowL = { x: elbowLx, y: elbowLy };

  const isRightCrossingLeft = rightArm.wristX < 220;
  const elbowRx = isRightCrossingLeft
    ? Math.max(298, shoulderR.x + 18)
    : (shoulderR.x + rightArm.wristX) / 2 + 26;
  const elbowRy = Math.max(305, (shoulderR.y + rightArm.wristY) / 2 + 10);
  const elbowR = { x: elbowRx, y: elbowRy };

  const transitionDuration = `${0.32 / playbackRate}s`;

  return (
    <div className="realistic-avatar-container" style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <svg
        viewBox="0 0 400 500"
        style={{
          width: '100%',
          height: '100%',
          maxHeight: '490px',
          overflow: 'visible',
          filter: 'drop-shadow(0 16px 36px rgba(0, 0, 0, 0.45))'
        }}
      >
        <defs>
          {/* Volumetric Face Shading */}
          <radialGradient id="faceShading" cx="50%" cy="38%" r="65%">
            <stop offset="0%" stopColor={skin.light || skin.base} />
            <stop offset="55%" stopColor={skin.base} />
            <stop offset="85%" stopColor={skin.mid} />
            <stop offset="100%" stopColor={skin.shadow} />
          </radialGradient>

          {/* Smooth Neck Gradient */}
          <linearGradient id="neckShading" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={skin.shadow} />
            <stop offset="30%" stopColor={skin.base} />
            <stop offset="100%" stopColor={skin.mid} />
          </linearGradient>

          {/* Thick Muscle Arm Gradients */}
          <linearGradient id="armLShading" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={skin.base} />
            <stop offset="45%" stopColor={skin.mid} />
            <stop offset="100%" stopColor={skin.shadow} />
          </linearGradient>

          <linearGradient id="armRShading" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={skin.base} />
            <stop offset="45%" stopColor={skin.mid} />
            <stop offset="100%" stopColor={skin.shadow} />
          </linearGradient>

          {/* Tailored Blazer Gradients */}
          <linearGradient id="suitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={cloth.secondary} />
            <stop offset="40%" stopColor={cloth.primary} />
            <stop offset="100%" stopColor="#02040a" />
          </linearGradient>

          <linearGradient id="lapelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={cloth.secondary} />
            <stop offset="100%" stopColor={cloth.primary} />
          </linearGradient>

          {/* Volumetric Hair Gradients */}
          <linearGradient id="hairMainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={hair.highlight || '#71717a'} />
            <stop offset="40%" stopColor={hair.base} />
            <stop offset="100%" stopColor="#09090b" />
          </linearGradient>

          {/* Glossy Lip Gradient */}
          <linearGradient id="lipGlossGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isMale ? "#cbd5e1" : "#f472b6"} />
            <stop offset="50%" stopColor={isMale ? "#94a3b8" : "#e11d48"} />
            <stop offset="100%" stopColor={isMale ? "#475569" : "#881337"} />
          </linearGradient>
        </defs>

        {/* ========================================================= */}
        {/* 1. TAILORED HUMAN TORSO & CLOTHING                        */}
        {/* ========================================================= */}
        <g style={{ transform: `translateY(${breathY}px)`, transition: 'transform 0.1s linear' }}>
          {/* Smooth Rounded Broad Human Torso */}
          <path
            d="M 95 210 C 125 188 275 188 305 210 L 330 480 L 70 480 Z"
            fill="url(#suitGrad)"
          />

          {/* Inner White Dress Shirt with Winged Collar */}
          <path d="M 170 195 L 230 195 L 200 270 Z" fill="#ffffff" />
          <path d="M 170 195 L 188 215 L 200 200 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
          <path d="M 230 195 L 212 215 L 200 200 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />

          {/* Dapper Red Bow Tie */}
          <g id="red-bow-tie">
            <path d="M 182 204 L 198 210 L 182 216 Z" fill="#dc2626" />
            <path d="M 218 204 L 202 210 L 218 216 Z" fill="#dc2626" />
            <rect x="196" y="206" width="8" height="8" rx="2" fill="#b91c1c" />
          </g>

          {/* Tailored Lapels */}
          <path
            d="M 130 205 L 180 285 L 155 340 L 115 225 Z"
            fill="url(#lapelGrad)"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1.2"
          />
          <path
            d="M 270 205 L 220 285 L 245 340 L 285 225 Z"
            fill="url(#lapelGrad)"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1.2"
          />
        </g>

        {/* ========================================================= */}
        {/* 2. HUMAN NECK                                            */}
        {/* ========================================================= */}
        <g style={{ transform: `translateY(${breathY * 0.4}px)` }}>
          <path
            d="M 180 148 C 178 180 176 206 178 208 C 188 214 212 214 222 208 C 224 206 222 180 220 148 Z"
            fill="url(#neckShading)"
          />
          <path
            d="M 165 206 Q 200 216 235 206"
            fill="none"
            stroke={skin.shadow}
            strokeWidth="1.5"
            opacity="0.35"
          />
        </g>

        {/* ========================================================= */}
        {/* 3. REALISTIC HUMAN HEAD & FACE                            */}
        {/* ========================================================= */}
        <g
          style={{
            transform: `translateY(${breathY * 0.4 + (face.headY || 0)}px) rotate(${face.headRot || 0}deg)`,
            transformOrigin: '200px 165px',
            transition: `transform ${transitionDuration} ease-out`
          }}
        >
          <path
            d={isMale
              ? "M 144 92 C 140 38 260 38 256 92 C 256 138 238 172 200 172 C 162 172 144 138 144 92 Z"
              : "M 146 95 C 140 40 260 40 254 95 C 254 138 234 168 200 168 C 166 168 146 138 146 95 Z"
            }
            fill="url(#faceShading)"
          />

          {/* Ears */}
          <g>
            <ellipse cx="140" cy="104" rx="6.5" ry="12" fill={skin.mid} />
            <path d="M 141 98 Q 137 104 141 110" fill="none" stroke={skin.shadow} strokeWidth="1" opacity="0.5" />
            <ellipse cx="260" cy="104" rx="6.5" ry="12" fill={skin.mid} />
            <path d="M 259 98 Q 263 104 259 110" fill="none" stroke={skin.shadow} strokeWidth="1" opacity="0.5" />
          </g>

          {/* Cheeks */}
          <ellipse cx="162" cy="118" rx="14" ry="7" fill="#fb7185" opacity={isMale ? "0.15" : "0.28"} />
          <ellipse cx="238" cy="118" rx="14" ry="7" fill="#fb7185" opacity={isMale ? "0.15" : "0.28"} />

          {/* LEFT EYE */}
          <g>
            <path d="M 155 100 Q 170 91 185 100 Q 170 109 155 100 Z" fill="#ffffff" />
            {!blink ? (
              <>
                <circle cx="170" cy="100" r="5.8" fill="#1e293b" />
                <circle cx="170" cy="100" r="3.6" fill="#0f172a" />
                <circle cx="170" cy="100" r="2.0" fill="#000000" />
                <circle cx="168.2" cy="98" r="1.6" fill="#ffffff" />
                <circle cx="171.8" cy="101.5" r="0.8" fill="#ffffff" opacity="0.85" />
              </>
            ) : (
              <line x1="155" y1="100" x2="185" y2="100" stroke="#0f172a" strokeWidth="2.8" strokeLinecap="round" />
            )}
            <path d="M 154 99 Q 170 89 186 99" fill="none" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" />
            <path
              d={`M 152 ${86 + browOffset} Q 170 ${78 + browOffset} 188 ${84 + browOffset}`}
              fill="none"
              stroke={hair.base}
              strokeWidth={isMale ? "3.4" : "2.8"}
              strokeLinecap="round"
              style={{ transition: `d ${transitionDuration} ease` }}
            />
          </g>

          {/* RIGHT EYE */}
          <g>
            <path d="M 215 100 Q 230 91 245 100 Q 230 109 215 100 Z" fill="#ffffff" />
            {!blink ? (
              <>
                <circle cx="230" cy="100" r="5.8" fill="#1e293b" />
                <circle cx="230" cy="100" r="3.6" fill="#0f172a" />
                <circle cx="230" cy="100" r="2.0" fill="#000000" />
                <circle cx="228.2" cy="98" r="1.6" fill="#ffffff" />
                <circle cx="231.8" cy="101.5" r="0.8" fill="#ffffff" opacity="0.85" />
              </>
            ) : (
              <line x1="215" y1="100" x2="245" y2="100" stroke="#0f172a" strokeWidth="2.8" strokeLinecap="round" />
            )}
            <path d="M 214 99 Q 230 89 246 99" fill="none" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" />
            <path
              d={`M 212 ${84 + browOffset} Q 230 ${78 + browOffset} 248 ${86 + browOffset}`}
              fill="none"
              stroke={hair.base}
              strokeWidth={isMale ? "3.4" : "2.8"}
              strokeLinecap="round"
              style={{ transition: `d ${transitionDuration} ease` }}
            />
          </g>

          {/* Nose */}
          <g>
            <path
              d="M 198 94 Q 200 114 197 122 Q 200 124 203 122"
              fill="none"
              stroke={skin.shadow}
              strokeWidth="1.4"
              strokeLinecap="round"
              opacity="0.5"
            />
            <ellipse cx="195" cy="123" rx="2" ry="1" fill={skin.shadow} opacity="0.35" />
            <ellipse cx="205" cy="123" rx="2" ry="1" fill={skin.shadow} opacity="0.35" />
          </g>

          {/* Lips */}
          {!isQuestionMouth ? (
            <g>
              <path
                d="M 186 142 Q 193 137 200 140 Q 207 137 214 142 Q 200 153 186 142 Z"
                fill="url(#lipGlossGrad)"
              />
              <path d="M 192 140 Q 200 142 208 140" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.45" />
            </g>
          ) : (
            <g>
              <ellipse cx="200" cy="144" rx="9" ry="6" fill="#881337" />
              <path d="M 191 141 Q 200 139 209 141 Q 200 149 191 141 Z" fill="url(#lipGlossGrad)" />
            </g>
          )}

          {/* Hair */}
          {!isMale ? (
            <g>
              {/* Back Hair Shadow */}
              <path
                d="M 146 90 C 135 140 138 210 152 245 C 165 210 158 140 154 90 Z M 254 90 C 265 140 262 210 248 245 C 235 210 242 140 246 90 Z"
                fill="#09090b"
                opacity="0.85"
              />
              {/* Main Volumetric Crown */}
              <path
                d="M 140 92 C 132 25 268 25 260 92 C 248 42 228 32 200 34 C 172 32 152 42 140 92 Z"
                fill="url(#hairMainGrad)"
              />
              {/* Front Wave Layers */}
              <path
                d="M 200 34 C 165 36 142 62 138 95 C 160 82 188 74 200 34 Z"
                fill={hair.highlight || '#71717a'}
                opacity="0.5"
              />
              <path
                d="M 200 34 C 235 36 258 62 262 95 C 240 82 212 74 200 34 Z"
                fill={hair.highlight || '#71717a'}
                opacity="0.5"
              />
            </g>
          ) : (
            <g>
              <path
                d="M 138 92 L 140 116 L 144 110 L 142 88 Z M 262 92 L 260 116 L 256 110 L 258 88 Z"
                fill="url(#hairMainGrad)"
              />
              <path
                d="M 142 92 C 138 48 262 48 258 92 C 248 44 226 38 200 40 C 174 38 152 44 142 92 Z"
                fill="url(#hairMainGrad)"
              />
              <path
                d="M 200 40 C 170 42 148 64 146 88 C 170 75 190 68 200 40 Z"
                fill={hair.highlight || '#71717a'}
                opacity="0.5"
              />
              <path
                d="M 200 40 C 230 42 252 64 254 88 C 230 75 210 68 200 40 Z"
                fill={hair.highlight || '#71717a'}
                opacity="0.5"
              />
            </g>
          )}
        </g>

        {/* ========================================================= */}
        {/* 4. REALISTIC HUMAN ARMS (PERFECT ANATOMICAL KINEMATICS)   */}
        {/* ========================================================= */}

        {/* LEFT ARM ANATOMY */}
        <g style={{ transition: `all ${transitionDuration} cubic-bezier(0.34, 1.56, 0.64, 1)` }}>
          {/* BROAD DELTOID SHOULDER CAP */}
          <ellipse
            cx={shoulderL.x}
            cy={shoulderL.y}
            rx="24"
            ry="18"
            fill="url(#suitGrad)"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1.2"
          />

          {/* UPPER ARM SLEEVE SEGMENT */}
          <path
            d={`M ${shoulderL.x - 24} ${shoulderL.y} L ${elbowL.x - 22} ${elbowL.y + 8} L ${elbowL.x + 22} ${elbowL.y + 8} L ${shoulderL.x + 24} ${shoulderL.y} Z`}
            fill="url(#suitGrad)"
          />

          {/* FOREARM MUSCLE SEGMENT */}
          <path
            d={`M ${elbowL.x - 18} ${elbowL.y + 8} Q ${(elbowL.x + leftArm.wristX) / 2 - 14} ${(elbowL.y + leftArm.wristY) / 2} ${leftArm.wristX - 16} ${leftArm.wristY} L ${leftArm.wristX + 16} ${leftArm.wristY} Q ${(elbowL.x + leftArm.wristX) / 2 + 14} ${(elbowL.y + leftArm.wristY) / 2} ${elbowL.x + 18} ${elbowL.y + 8} Z`}
            fill="url(#armLShading)"
          />

          {/* HAND */}
          <g
            transform={`translate(${leftArm.wristX}, ${leftArm.wristY}) rotate(${leftArm.rot || 0})`}
            style={{ transition: `transform ${transitionDuration} cubic-bezier(0.34, 1.56, 0.64, 1)` }}
          >
            <DetailedHandRenderer shape={leftArm.handShape} skin={skin} isLeft={true} />
          </g>
        </g>

        {/* RIGHT ARM ANATOMY */}
        <g style={{ transition: `all ${transitionDuration} cubic-bezier(0.34, 1.56, 0.64, 1)` }}>
          {/* BROAD DELTOID SHOULDER CAP */}
          <ellipse
            cx={shoulderR.x}
            cy={shoulderR.y}
            rx="24"
            ry="18"
            fill="url(#suitGrad)"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1.2"
          />

          {/* UPPER ARM SLEEVE SEGMENT */}
          <path
            d={`M ${shoulderR.x + 24} ${shoulderR.y} L ${elbowR.x + 22} ${elbowR.y + 8} L ${elbowR.x - 22} ${elbowR.y + 8} L ${shoulderR.x - 24} ${shoulderR.y} Z`}
            fill="url(#suitGrad)"
          />

          {/* FOREARM MUSCLE SEGMENT */}
          <path
            d={`M ${elbowR.x + 18} ${elbowR.y + 8} Q ${(elbowR.x + rightArm.wristX) / 2 + 14} ${(elbowR.y + rightArm.wristY) / 2} ${rightArm.wristX + 16} ${rightArm.wristY} L ${rightArm.wristX - 16} ${rightArm.wristY} Q ${(elbowR.x + rightArm.wristX) / 2 - 14} ${(elbowR.y + rightArm.wristY) / 2} ${elbowR.x - 18} ${elbowR.y + 8} Z`}
            fill="url(#armRShading)"
          />

          {/* HAND */}
          <g
            transform={`translate(${rightArm.wristX}, ${rightArm.wristY}) rotate(${rightArm.rot || 0})`}
            style={{ transition: `transform ${transitionDuration} cubic-bezier(0.34, 1.56, 0.64, 1)` }}
          >
            <DetailedHandRenderer shape={rightArm.handShape} skin={skin} isLeft={false} />
          </g>
        </g>
      </svg>
    </div>
  );
}

export default RealisticHumanAvatar;
