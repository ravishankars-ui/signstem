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
 * Master Studio-Grade 2D Human Sign Language Presenter:
 * - Natural human proportions with proper neck height and sculpted clavicles
 * - Flowing layered hair with natural depth and soft face-framing strands
 * - Expressive facial features (detailed almond eyes with double speculars, blinking, soft lips)
 * - Tailored navy/charcoal blazer with structured collar and cuffs
 * - Enlarged, high-definition 5-finger hands with multi-joint phalanges, nails, and creases
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

  // Micro-breathing
  const breathY = Math.sin((breathPhase / 100) * Math.PI * 2) * 1.8;

  // Arm positions & rotations
  const leftArm = currentPose.leftArm || { wristX: 130, wristY: 360, rot: 15, handShape: 'rest_relaxed' };
  const rightArm = currentPose.rightArm || { wristX: 270, wristY: 360, rot: -15, handShape: 'rest_relaxed' };

  // Face morphing
  const face = currentPose.face || { brow: 'neutral', mouth: 'smile', headY: 0, headRot: 0 };
  const browOffset = face.brow === 'raised' ? -4 : 0;
  const isQuestionMouth = face.mouth === 'question';

  // Shoulders anchored naturally
  const shoulderL = { x: 125, y: 210 + breathY * 0.5 };
  const shoulderR = { x: 275, y: 210 + breathY * 0.5 };

  // Dynamic elbow bends
  const elbowL = {
    x: (shoulderL.x + leftArm.wristX) / 2 - 28,
    y: (shoulderL.y + leftArm.wristY) / 2 + 12
  };
  const elbowR = {
    x: (shoulderR.x + rightArm.wristX) / 2 + 28,
    y: (shoulderR.y + rightArm.wristY) / 2 + 12
  };

  const transitionDuration = `${0.36 / playbackRate}s`;

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
          {/* Natural Skin Gradients */}
          <radialGradient id="faceShading" cx="50%" cy="42%" r="58%">
            <stop offset="0%" stopColor={skin.base} />
            <stop offset="65%" stopColor={skin.mid} />
            <stop offset="100%" stopColor={skin.shadow} />
          </radialGradient>

          <linearGradient id="neckShading" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={skin.shadow} />
            <stop offset="35%" stopColor={skin.mid} />
            <stop offset="100%" stopColor={skin.base} />
          </linearGradient>

          <linearGradient id="armLShading" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={skin.base} />
            <stop offset="100%" stopColor={skin.shadow} />
          </linearGradient>

          <linearGradient id="armRShading" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={skin.base} />
            <stop offset="100%" stopColor={skin.shadow} />
          </linearGradient>

          {/* Tailored Blazer Gradients */}
          <linearGradient id="suitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={cloth.secondary} />
            <stop offset="35%" stopColor={cloth.primary} />
            <stop offset="100%" stopColor="#0c121e" />
          </linearGradient>

          <linearGradient id="lapelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={cloth.secondary} />
            <stop offset="100%" stopColor={cloth.primary} />
          </linearGradient>

          {/* Volumetric Hair Gradients */}
          <linearGradient id="hairMainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={hair.highlight} />
            <stop offset="30%" stopColor={hair.base} />
            <stop offset="100%" stopColor={hair.shadow} />
          </linearGradient>

          <linearGradient id="hairBackGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={hair.base} />
            <stop offset="100%" stopColor={hair.shadow} />
          </linearGradient>

          {/* Natural Lip Gradient */}
          <linearGradient id="lipGlossGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="50%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#9f1239" />
          </linearGradient>
        </defs>

        {/* ========================================================= */}
        {/* 1. BACK HAIR VOLUME (Natural flowing shoulder length)    */}
        {/* ========================================================= */}
        <g style={{ transform: `translateY(${breathY * 0.3}px)` }}>
          <path
            d="M 125 110 C 110 160 105 225 135 255 C 160 270 170 240 170 210 C 145 180 145 130 155 100 Z"
            fill="url(#hairBackGrad)"
          />
          <path
            d="M 275 110 C 290 160 295 225 265 255 C 240 270 230 240 230 210 C 255 180 255 130 245 100 Z"
            fill="url(#hairBackGrad)"
          />
        </g>

        {/* ========================================================= */}
        {/* 2. TAILORED SUIT & TORSO                                  */}
        {/* ========================================================= */}
        <g style={{ transform: `translateY(${breathY}px)`, transition: 'transform 0.1s linear' }}>
          {/* Main Blazer Body */}
          <path
            d="M 115 210 C 145 200 255 200 285 210 L 310 460 L 90 460 Z"
            fill="url(#suitGrad)"
          />

          {/* Inner Collared Shirt with V-Neck */}
          <path d="M 175 200 L 225 200 L 200 275 Z" fill="#ffffff" />
          <path d="M 200 225 L 200 275" stroke="#cbd5e1" strokeWidth="1.6" />

          {/* Tailored Lapels (Left & Right) */}
          <path
            d="M 135 205 L 180 285 L 155 340 L 120 225 Z"
            fill="url(#lapelGrad)"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1.2"
          />
          <path
            d="M 265 205 L 220 285 L 245 340 L 280 225 Z"
            fill="url(#lapelGrad)"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1.2"
          />
        </g>

        {/* ========================================================= */}
        {/* 3. PROPORTIONATE NECK & CLAVICLES                         */}
        {/* ========================================================= */}
        <g style={{ transform: `translateY(${breathY * 0.4}px)` }}>
          {/* Neck (Proper proportional height: 160 to 205) */}
          <path
            d="M 184 150 L 180 205 C 190 212 210 212 220 205 L 216 150 Z"
            fill="url(#neckShading)"
          />
          {/* Soft Throat & Sternocleidomastoid Shadow */}
          <path
            d="M 194 165 Q 200 185 190 205"
            fill="none"
            stroke={skin.shadow}
            strokeWidth="1.2"
            opacity="0.35"
          />
          <path
            d="M 206 165 Q 200 185 210 205"
            fill="none"
            stroke={skin.shadow}
            strokeWidth="1.2"
            opacity="0.35"
          />
          {/* Delicate Collarbone / Clavicle Line */}
          <path
            d="M 165 206 Q 200 216 235 206"
            fill="none"
            stroke={skin.shadow}
            strokeWidth="1.6"
            opacity="0.45"
          />
        </g>

        {/* ========================================================= */}
        {/* 4. SCULPTED HUMAN FACE & EXPRESSIONS                      */}
        {/* ========================================================= */}
        <g
          style={{
            transform: `translateY(${breathY * 0.4 + (face.headY || 0)}px) rotate(${face.headRot || 0}deg)`,
            transformOrigin: '200px 165px',
            transition: `transform ${transitionDuration} ease-out`
          }}
        >
          {/* Head Base (Sculpted oval jawline) */}
          <path
            d="M 142 95 C 138 45 262 45 258 95 C 258 140 236 172 200 172 C 164 172 142 140 142 95 Z"
            fill="url(#faceShading)"
          />

          {/* Ears with delicate drop shadow */}
          <ellipse cx="140" cy="102" rx="7" ry="13" fill={skin.mid} />
          <ellipse cx="260" cy="102" rx="7" ry="13" fill={skin.mid} />

          {/* Natural Cheeks Soft Rose Blush */}
          <ellipse cx="160" cy="118" rx="14" ry="7" fill="#fb7185" opacity="0.25" />
          <ellipse cx="240" cy="118" rx="14" ry="7" fill="#fb7185" opacity="0.25" />

          {/* LEFT EYE (Almond eye with double specular reflections) */}
          <g>
            <path d="M 155 100 Q 170 92 185 100 Q 170 108 155 100 Z" fill="#ffffff" />
            {!blink ? (
              <>
                <circle cx="170" cy="100" r="5.8" fill="#2d1c15" />
                <circle cx="170" cy="100" r="3.0" fill="#09090b" />
                <circle cx="168.2" cy="98" r="1.8" fill="#ffffff" />
                <circle cx="171.8" cy="101.5" r="0.9" fill="#ffffff" opacity="0.85" />
              </>
            ) : (
              <line x1="155" y1="100" x2="185" y2="100" stroke="#1c1917" strokeWidth="2.6" strokeLinecap="round" />
            )}
            <path d="M 154 99 Q 170 90 186 99" fill="none" stroke="#1c1917" strokeWidth="2.0" strokeLinecap="round" />
            {/* Natural Curved Eyebrow */}
            <path
              d={`M 152 ${88 + browOffset} Q 170 ${80 + browOffset} 188 ${86 + browOffset}`}
              fill="none"
              stroke={hair.base}
              strokeWidth="2.8"
              strokeLinecap="round"
              style={{ transition: `d ${transitionDuration} ease` }}
            />
          </g>

          {/* RIGHT EYE */}
          <g>
            <path d="M 215 100 Q 230 92 245 100 Q 230 108 215 100 Z" fill="#ffffff" />
            {!blink ? (
              <>
                <circle cx="230" cy="100" r="5.8" fill="#2d1c15" />
                <circle cx="230" cy="100" r="3.0" fill="#09090b" />
                <circle cx="228.2" cy="98" r="1.8" fill="#ffffff" />
                <circle cx="231.8" cy="101.5" r="0.9" fill="#ffffff" opacity="0.85" />
              </>
            ) : (
              <line x1="215" y1="100" x2="245" y2="100" stroke="#1c1917" strokeWidth="2.6" strokeLinecap="round" />
            )}
            <path d="M 214 99 Q 230 90 246 99" fill="none" stroke="#1c1917" strokeWidth="2.0" strokeLinecap="round" />
            {/* Natural Curved Eyebrow */}
            <path
              d={`M 212 ${86 + browOffset} Q 230 ${80 + browOffset} 248 ${88 + browOffset}`}
              fill="none"
              stroke={hair.base}
              strokeWidth="2.8"
              strokeLinecap="round"
              style={{ transition: `d ${transitionDuration} ease` }}
            />
          </g>

          {/* Sculpted Nose with Soft Shading */}
          <path
            d="M 197 96 L 200 122 L 206 122"
            fill="none"
            stroke={skin.shadow}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.6"
          />
          <ellipse cx="195" cy="123" rx="2.4" ry="1.2" fill={skin.shadow} opacity="0.4" />
          <ellipse cx="205" cy="123" rx="2.4" ry="1.2" fill={skin.shadow} opacity="0.4" />

          {/* Glossy Lips & Expression */}
          {!isQuestionMouth ? (
            <g>
              <path
                d="M 185 142 Q 192 137 200 140 Q 208 137 215 142 Q 200 154 185 142 Z"
                fill="url(#lipGlossGrad)"
              />
              <path d="M 192 140 Q 200 142 208 140" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.4" />
            </g>
          ) : (
            <g>
              <ellipse cx="200" cy="144" rx="9" ry="6" fill="#881337" />
              <path d="M 191 141 Q 200 139 209 141 Q 200 150 191 141 Z" fill="url(#lipGlossGrad)" />
            </g>
          )}

          {/* ========================================================= */}
          {/* 5. FLOWING NATURAL HAIR (Face-Framing with Sheen)         */}
          {/* ========================================================= */}
          {/* Crown & Part */}
          <path
            d="M 138 88 C 132 25 268 25 262 88 C 250 56 226 42 198 45 C 165 42 146 56 138 88 Z"
            fill="url(#hairMainGrad)"
          />
          {/* Soft Swept Front Fringe */}
          <path
            d="M 142 75 Q 170 52 208 65 Q 172 82 142 75 Z"
            fill={hair.highlight}
            opacity="0.55"
          />
          {/* Soft Face-Framing Side Strands */}
          <path
            d="M 138 82 C 132 120 142 155 148 168 C 144 142 142 110 146 82 Z"
            fill={hair.base}
          />
          <path
            d="M 262 82 C 268 120 258 155 252 168 C 256 142 258 110 254 82 Z"
            fill={hair.base}
          />
        </g>

        {/* ========================================================= */}
        {/* 6. CONTINUOUS ARTICULATED ARMS & LARGE DETAILED HANDS    */}
        {/* ========================================================= */}
        {/* LEFT ARM */}
        <g style={{ transition: `all ${transitionDuration} cubic-bezier(0.34, 1.56, 0.64, 1)` }}>
          {/* Upper Arm Sleeve with Cuff */}
          <path
            d={`M ${shoulderL.x - 22} ${shoulderL.y} Q ${elbowL.x - 20} ${elbowL.y - 10} ${elbowL.x - 14} ${elbowL.y + 10} L ${elbowL.x + 18} ${elbowL.y + 5} Q ${shoulderL.x + 20} ${shoulderL.y + 10} ${shoulderL.x + 16} ${shoulderL.y - 5} Z`}
            fill="url(#suitGrad)"
          />
          {/* Forearm (Skin) */}
          <path
            d={`M ${elbowL.x - 14} ${elbowL.y + 10} Q ${(elbowL.x + leftArm.wristX) / 2 - 8} ${(elbowL.y + leftArm.wristY) / 2} ${leftArm.wristX - 12} ${leftArm.wristY} L ${leftArm.wristX + 12} ${leftArm.wristY} Q ${(elbowL.x + leftArm.wristX) / 2 + 10} ${(elbowL.y + leftArm.wristY) / 2} ${elbowL.x + 18} ${elbowL.y + 5} Z`}
            fill="url(#armLShading)"
          />
          {/* Large High-Definition Left Hand with rotation */}
          <g
            transform={`translate(${leftArm.wristX}, ${leftArm.wristY}) rotate(${leftArm.rot || 0})`}
            style={{ transition: `transform ${transitionDuration} cubic-bezier(0.34, 1.56, 0.64, 1)` }}
          >
            <DetailedHandRenderer shape={leftArm.handShape} skin={skin} isLeft={true} />
          </g>
        </g>

        {/* RIGHT ARM */}
        <g style={{ transition: `all ${transitionDuration} cubic-bezier(0.34, 1.56, 0.64, 1)` }}>
          {/* Upper Arm Sleeve with Cuff */}
          <path
            d={`M ${shoulderR.x + 22} ${shoulderR.y} Q ${elbowR.x + 20} ${elbowR.y - 10} ${elbowR.x + 14} ${elbowR.y + 10} L ${elbowR.x - 18} ${elbowR.y + 5} Q ${shoulderR.x - 20} ${shoulderR.y + 10} ${shoulderR.x - 16} ${shoulderR.y - 5} Z`}
            fill="url(#suitGrad)"
          />
          {/* Forearm (Skin) */}
          <path
            d={`M ${elbowR.x + 14} ${elbowR.y + 10} Q ${(elbowR.x + rightArm.wristX) / 2 + 8} ${(elbowR.y + rightArm.wristY) / 2} ${rightArm.wristX + 12} ${rightArm.wristY} L ${rightArm.wristX - 12} ${rightArm.wristY} Q ${(elbowR.x + rightArm.wristX) / 2 - 10} ${(elbowR.y + rightArm.wristY) / 2} ${elbowR.x - 18} ${elbowR.y + 5} Z`}
            fill="url(#armRShading)"
          />
          {/* Large High-Definition Right Hand with rotation */}
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
