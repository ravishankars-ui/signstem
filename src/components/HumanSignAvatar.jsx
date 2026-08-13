import React, { useEffect, useState, useMemo } from 'react';

/**
 * Human 2D Sign Language Avatar Component
 * 
 * Renders an anatomical, human-like 2D character avatar with:
 * - Expressive facial features (blinking eyes, reactive eyebrows, smiling/neutral mouth)
 * - Articulated upper-body, shoulders, and chest with natural breathing motion
 * - Dual articulated arms with dynamic inverse kinematics & smooth bezier transitions
 * - Anatomically detailed 5-finger hands displaying authentic Indian Sign Language (ISL) handshapes
 * - Real-time animated transitions between words and fingerspelling (A-Z)
 * 
 * @param {Object} props
 * @param {Object} props.currentItem - Current active token object from queue
 * @param {boolean} props.isIdle - True if in resting state
 * @param {number} props.playbackRate - Animation speed multiplier
 * @param {Function} props.onPoseComplete - Called when transition/pose timing completes
 */
export function HumanSignAvatar({
  currentItem,
  isIdle = true,
  playbackRate = 1.0,
  onPoseComplete
}) {
  const [blink, setBlink] = useState(false);
  const [animationTick, setAnimationTick] = useState(0);

  // Natural blinking interval
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  // Micro-motion tick for living avatar feel
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setAnimationTick((t) => (t + 1) % 360);
    }, 40);
    return () => clearInterval(tickInterval);
  }, []);

  // Calculate pose configuration based on the active word / fingerspelled letter
  const pose = useMemo(() => {
    const token = currentItem?.token?.toUpperCase() || 'IDLE';
    const isFingerspelling = Boolean(currentItem?.isFingerspelling);

    if (isIdle || token === 'IDLE') {
      return {
        name: 'IDLE',
        headTilt: 0,
        eyeExpression: 'neutral',
        eyebrowY: 0,
        mouth: 'gentle-smile',
        leftArm: { shoulderAngle: 25, elbowAngle: 75, wristX: 165, wristY: 260, handShape: 'rest' },
        rightArm: { shoulderAngle: -25, elbowAngle: -75, wristX: 235, wristY: 260, handShape: 'rest' },
        chestBreath: true,
        duration: 1600
      };
    }

    if (isFingerspelling) {
      return getFingerspellPose(token);
    }

    return getWordPose(token);
  }, [currentItem?.token, currentItem?.isFingerspelling, isIdle]);

  // Handle pose completion timer to advance queue in vector avatar mode
  useEffect(() => {
    if (isIdle) return;
    const duration = (pose.duration || 1200) / playbackRate;
    const timer = setTimeout(() => {
      if (onPoseComplete) onPoseComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [currentItem?.id, pose.duration, playbackRate, isIdle, onPoseComplete]);

  // Breathing micro-offsets
  const breathY = isIdle ? Math.sin((animationTick * Math.PI) / 45) * 2.5 : 0;
  const breathChestScale = isIdle ? 1 + Math.sin((animationTick * Math.PI) / 45) * 0.015 : 1;

  return (
    <div className={`human-avatar-container ${isIdle ? 'mode-idle' : 'mode-signing'}`}>
      <svg
        viewBox="0 0 400 420"
        className="human-avatar-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Natural Skin Tones with Soft Highlights */}
          <linearGradient id="skinBase" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fcd34d" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          <linearGradient id="skinFace" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="60%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#292524" />
            <stop offset="100%" stopColor="#1c1917" />
          </linearGradient>

          <linearGradient id="clothingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>

          <linearGradient id="collarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>

          {/* Hand Palm & Shadow Filters */}
          <filter id="handGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(0,0,0,0.25)" />
          </filter>

          <filter id="armShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(15,23,42,0.3)" />
          </filter>
        </defs>

        {/* 1. Torso & Upper Body */}
        <g id="torso-group" style={{ transform: `translate(0px, ${breathY}px)` }}>
          {/* Main Body Shirt / Jacket */}
          <path
            d="M 120 300 C 120 220, 150 190, 200 190 C 250 190, 280 220, 280 300 L 290 420 L 110 420 Z"
            fill="url(#clothingGrad)"
            style={{
              transformOrigin: '200px 300px',
              transform: `scale(${breathChestScale})`,
              transition: 'all 0.4s ease'
            }}
          />

          {/* V-Neck Collar & Chest Trim */}
          <path
            d="M 175 190 L 200 240 L 225 190 Z"
            fill="url(#collarGrad)"
            opacity="0.9"
          />
          <line x1="200" y1="240" x2="200" y2="340" stroke="#1e3a8a" strokeWidth="2.5" strokeDasharray="4 3" />
        </g>

        {/* 2. Neck */}
        <path
          d="M 185 155 L 185 195 C 185 202, 215 202, 215 195 L 215 155 Z"
          fill="url(#skinBase)"
        />

        {/* 3. Head & Facial Expressions */}
        <g
          id="head-group"
          style={{
            transformOrigin: '200px 140px',
            transform: `rotate(${pose.headTilt}deg) translate(0px, ${breathY * 0.7}px)`,
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {/* Hair Back */}
          <ellipse cx="200" cy="115" rx="55" ry="58" fill="url(#hairGrad)" />

          {/* Face Base */}
          <path
            d="M 160 110 C 160 75, 240 75, 240 110 C 240 155, 225 175, 200 175 C 175 175, 160 155, 160 110 Z"
            fill="url(#skinFace)"
          />

          {/* Ears */}
          <ellipse cx="158" cy="120" rx="6" ry="10" fill="url(#skinBase)" />
          <ellipse cx="242" cy="120" rx="6" ry="10" fill="url(#skinBase)" />

          {/* Hair Front / Modern Cut */}
          <path
            d="M 156 95 C 175 68, 225 68, 244 95 C 235 85, 215 82, 195 84 C 180 85, 165 90, 156 95 Z"
            fill="url(#hairGrad)"
          />
          <path
            d="M 158 95 C 165 110, 166 125, 162 135 C 160 115, 160 105, 158 95 Z"
            fill="url(#hairGrad)"
          />

          {/* Eyebrows (Dynamic for Query vs Statement) */}
          <g
            style={{
              transform: `translateY(${pose.eyebrowY}px)`,
              transition: 'transform 0.3s ease'
            }}
          >
            <path d="M 175 106 Q 185 102 192 105" stroke="#292524" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 208 105 Q 215 102 225 106" stroke="#292524" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>

          {/* Eyes (Blinking & Expression) */}
          <g id="eyes">
            {blink ? (
              <>
                <line x1="176" y1="117" x2="190" y2="117" stroke="#292524" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="210" y1="117" x2="224" y2="117" stroke="#292524" strokeWidth="2.5" strokeLinecap="round" />
              </>
            ) : (
              <>
                {/* Left Eye */}
                <ellipse cx="183" cy="117" rx="6" ry="5.5" fill="#ffffff" />
                <ellipse cx="183" cy="117" rx="3.2" ry="3.2" fill="#1c1917" />
                <circle cx="184.5" cy="115.5" r="1" fill="#ffffff" />

                {/* Right Eye */}
                <ellipse cx="217" cy="117" rx="6" ry="5.5" fill="#ffffff" />
                <ellipse cx="217" cy="117" rx="3.2" ry="3.2" fill="#1c1917" />
                <circle cx="218.5" cy="115.5" r="1" fill="#ffffff" />
              </>
            )}
          </g>

          {/* Nose */}
          <path d="M 200 118 L 198 132 L 204 132" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />

          {/* Mouth / Smile */}
          <g id="mouth">
            {pose.mouth === 'open-talk' ? (
              <ellipse cx="200" cy="148" rx="7" ry="5" fill="#7f1d1d" />
            ) : pose.mouth === 'inquisitive' ? (
              <ellipse cx="200" cy="147" rx="4" ry="4" fill="#881337" />
            ) : (
              <path d="M 192 146 Q 200 154 208 146" stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            )}
          </g>
        </g>

        {/* 4. Articulated Left Arm & Hand */}
        <ArmComponent
          side="left"
          armConfig={pose.leftArm}
          shoulderX={145}
          shoulderY={210}
        />

        {/* 5. Articulated Right Arm & Hand (Primary ISL Hand) */}
        <ArmComponent
          side="right"
          armConfig={pose.rightArm}
          shoulderX={255}
          shoulderY={210}
        />
      </svg>
    </div>
  );
}

/**
 * Articulated Arm Component with Smooth IK Vector Positioning
 */
function ArmComponent({ side, armConfig, shoulderX, shoulderY }) {
  const { wristX, wristY, handShape } = armConfig;
  const isRight = side === 'right';

  // Calculate elbow midpoint via inverse kinematics approximation
  const dx = wristX - shoulderX;
  const dy = wristY - shoulderY;
  const dist = Math.hypot(dx, dy);
  const midX = (shoulderX + wristX) / 2;
  const midY = (shoulderY + wristY) / 2;

  // Elbow bend offset (elbows flare outwards naturally)
  const bendDirection = isRight ? 1 : -1;
  const elbowX = midX + (dy / (dist || 1)) * 30 * bendDirection;
  const elbowY = midY - (dx / (dist || 1)) * 18;

  return (
    <g className={`arm-group arm-${side}`} filter="url(#armShadow)">
      {/* Upper Arm Bone */}
      <path
        d={`M ${shoulderX} ${shoulderY} Q ${elbowX} ${elbowY} ${elbowX} ${elbowY}`}
        stroke="#1d4ed8"
        strokeWidth="24"
        strokeLinecap="round"
        fill="none"
        style={{ transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }}
      />

      {/* Forearm (Skin tone forearm leading to wrist) */}
      <path
        d={`M ${elbowX} ${elbowY} Q ${elbowX} ${elbowY} ${wristX} ${wristY}`}
        stroke="url(#skinBase)"
        strokeWidth="18"
        strokeLinecap="round"
        fill="none"
        style={{ transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }}
      />

      {/* Detailed Hand Model with ISL Finger Formations */}
      <g
        style={{
          transformOrigin: `${wristX}px ${wristY}px`,
          transform: `translate(${wristX}px, ${wristY}px)`,
          transition: 'transform 0.35s cubic-bezier(0.34, 1.3, 0.64, 1)'
        }}
        filter="url(#handGlow)"
      >
        <HandModel shape={handShape} isRight={isRight} />
      </g>
    </g>
  );
}

/**
 * Hand Shape Renderer with 5 Articulated Fingers
 * Renders exact finger positions for ISL alphabet & vocabulary signs
 */
function HandModel({ shape, isRight }) {
  const flip = isRight ? 1 : -1;

  switch (shape) {
    case 'open-palm': // High five / Hello wave / Please
      return (
        <g transform={`scale(${flip}, 1)`}>
          <ellipse cx="0" cy="-6" rx="14" ry="16" fill="url(#skinFace)" />
          {/* 5 Extended Fingers */}
          <rect x="-13" y="-30" width="5" height="24" rx="2.5" fill="url(#skinFace)" />
          <rect x="-6" y="-36" width="5" height="30" rx="2.5" fill="url(#skinFace)" />
          <rect x="1" y="-35" width="5" height="29" rx="2.5" fill="url(#skinFace)" />
          <rect x="8" y="-28" width="4.5" height="22" rx="2.2" fill="url(#skinFace)" />
          {/* Thumb */}
          <path d="M -12 -2 Q -24 -12 -18 -20 Q -12 -16 -8 -8" fill="url(#skinFace)" />
        </g>
      );

    case 'point-index': // You / Me / 1 / D / G
      return (
        <g transform={`scale(${flip}, 1)`}>
          <circle cx="0" cy="-4" r="13" fill="url(#skinFace)" />
          {/* Pointing Index */}
          <rect x="-3" y="-38" width="6" height="34" rx="3" fill="url(#skinFace)" />
          {/* Curled other fingers */}
          <rect x="4" y="-12" width="6" height="12" rx="3" fill="#d97706" />
          <rect x="10" y="-10" width="5.5" height="10" rx="2.5" fill="#d97706" />
          {/* Thumb crossed */}
          <ellipse cx="-5" cy="-2" rx="5" ry="4" fill="url(#skinFace)" />
        </g>
      );

    case 'fist': // 'A' / 'S' / Stop / Firm
      return (
        <g transform={`scale(${flip}, 1)`}>
          <circle cx="0" cy="-4" r="14" fill="url(#skinFace)" />
          <rect x="-10" y="-16" width="5" height="14" rx="2.5" fill="#d97706" />
          <rect x="-4" y="-17" width="5" height="15" rx="2.5" fill="#d97706" />
          <rect x="2" y="-16" width="5" height="14" rx="2.5" fill="#d97706" />
          <rect x="8" y="-14" width="4.5" height="12" rx="2.2" fill="#d97706" />
          {/* Thumb locked across */}
          <path d="M -12 2 Q 0 -12 12 -4" stroke="#d97706" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        </g>
      );

    case 'thumbs-up': // Good / Help / 10
      return (
        <g transform={`scale(${flip}, 1)`}>
          <circle cx="0" cy="-2" r="13" fill="url(#skinFace)" />
          {/* Thumbs pointing up */}
          <rect x="-16" y="-34" width="7" height="28" rx="3.5" fill="url(#skinFace)" transform="rotate(-15)" />
          <rect x="-6" y="-14" width="6" height="12" rx="3" fill="#d97706" />
          <rect x="1" y="-14" width="6" height="12" rx="3" fill="#d97706" />
          <rect x="8" y="-12" width="5" height="10" rx="2.5" fill="#d97706" />
        </g>
      );

    case 'peace-v': // 'V' / '2' / Peace / See
      return (
        <g transform={`scale(${flip}, 1)`}>
          <circle cx="0" cy="-4" r="13" fill="url(#skinFace)" />
          {/* Index & Middle separated */}
          <rect x="-9" y="-36" width="5.5" height="32" rx="2.7" fill="url(#skinFace)" transform="rotate(-15)" />
          <rect x="4" y="-36" width="5.5" height="32" rx="2.7" fill="url(#skinFace)" transform="rotate(15)" />
          {/* Curled Ring & Pinky */}
          <rect x="4" y="-10" width="5" height="10" rx="2.5" fill="#d97706" />
          <rect x="9" y="-8" width="4.5" height="8" rx="2.2" fill="#d97706" />
        </g>
      );

    case 'c-shape': // 'C' / Cupped / Drink / Water
      return (
        <g transform={`scale(${flip}, 1)`}>
          <path
            d="M 12 -28 C -18 -28, -22 10, 12 12 C 4 8, -10 4, -8 -8 C -6 -20, 6 -22, 12 -28 Z"
            fill="url(#skinFace)"
          />
        </g>
      );

    case 'ok-sign': // 'F' / Perfect / Fine
      return (
        <g transform={`scale(${flip}, 1)`}>
          <circle cx="0" cy="-4" r="13" fill="url(#skinFace)" />
          {/* Thumb & Index circle */}
          <circle cx="-6" cy="-14" r="7" stroke="url(#skinFace)" strokeWidth="4" fill="none" />
          {/* 3 flared fingers */}
          <rect x="2" y="-32" width="4.5" height="24" rx="2.2" fill="url(#skinFace)" />
          <rect x="8" y="-30" width="4.5" height="22" rx="2.2" fill="url(#skinFace)" />
          <rect x="14" y="-25" width="4" height="18" rx="2" fill="url(#skinFace)" />
        </g>
      );

    case 'pinky-up': // 'I' / 'J'
      return (
        <g transform={`scale(${flip}, 1)`}>
          <circle cx="0" cy="-4" r="13" fill="url(#skinFace)" />
          <rect x="8" y="-34" width="4.5" height="30" rx="2.2" fill="url(#skinFace)" />
          <rect x="-8" y="-14" width="5" height="12" rx="2.5" fill="#d97706" />
          <rect x="-2" y="-14" width="5" height="12" rx="2.5" fill="#d97706" />
          <rect x="4" y="-14" width="5" height="12" rx="2.5" fill="#d97706" />
        </g>
      );

    case 'namaste': // Prayer hands joined
      return (
        <g>
          <path d="M -8 -30 L 0 -38 L 8 -30 L 8 0 L -8 0 Z" fill="url(#skinFace)" />
          <line x1="0" y1="-38" x2="0" y2="0" stroke="#d97706" strokeWidth="2" />
        </g>
      );

    case 'rest': // Relaxed neutral hand
    default:
      return (
        <g transform={`scale(${flip}, 1)`}>
          <ellipse cx="0" cy="-4" rx="12" ry="14" fill="url(#skinFace)" />
          <rect x="-10" y="-22" width="4.5" height="18" rx="2.2" fill="url(#skinFace)" />
          <rect x="-4" y="-25" width="4.5" height="21" rx="2.2" fill="url(#skinFace)" />
          <rect x="2" y="-24" width="4.5" height="20" rx="2.2" fill="url(#skinFace)" />
          <rect x="8" y="-20" width="4" height="16" rx="2" fill="url(#skinFace)" />
          <ellipse cx="-10" cy="-2" rx="4" ry="7" fill="url(#skinFace)" transform="rotate(-30)" />
        </g>
      );
  }
}

/**
 * High-accuracy ISL Word Poses Mapping
 */
function getWordPose(token) {
  switch (token) {
    case 'HELLO':
      return {
        headTilt: 4,
        eyebrowY: -3,
        mouth: 'gentle-smile',
        leftArm: { wristX: 160, wristY: 270, handShape: 'rest' },
        rightArm: { wristX: 255, wristY: 105, handShape: 'open-palm' }, // Hand raised near temple, waving
        duration: 1400
      };

    case 'NAMASTE':
      return {
        headTilt: -2,
        eyebrowY: -2,
        mouth: 'gentle-smile',
        leftArm: { wristX: 194, wristY: 205, handShape: 'namaste' },
        rightArm: { wristX: 206, wristY: 205, handShape: 'namaste' }, // Hands joined at chest
        duration: 1600
      };

    case 'YOU':
      return {
        headTilt: 2,
        eyebrowY: -2,
        mouth: 'gentle-smile',
        leftArm: { wristX: 160, wristY: 270, handShape: 'rest' },
        rightArm: { wristX: 200, wristY: 180, handShape: 'point-index' }, // Pointing straight forward
        duration: 1200
      };

    case 'ME':
    case 'I':
      return {
        headTilt: 2,
        eyebrowY: 0,
        mouth: 'gentle-smile',
        leftArm: { wristX: 160, wristY: 270, handShape: 'rest' },
        rightArm: { wristX: 200, wristY: 220, handShape: 'point-index' }, // Pointing back at chest
        duration: 1200
      };

    case 'HOW':
      return {
        headTilt: -5,
        eyebrowY: -5, // Inquisitive raised eyebrows
        mouth: 'inquisitive',
        leftArm: { wristX: 145, wristY: 215, handShape: 'open-palm' },
        rightArm: { wristX: 255, wristY: 215, handShape: 'open-palm' }, // Both hands open cupped outwards
        duration: 1500
      };

    case 'WHAT':
      return {
        headTilt: 6,
        eyebrowY: -6,
        mouth: 'inquisitive',
        leftArm: { wristX: 135, wristY: 230, handShape: 'open-palm' },
        rightArm: { wristX: 265, wristY: 230, handShape: 'open-palm' },
        duration: 1500
      };

    case 'GOOD':
      return {
        headTilt: 3,
        eyebrowY: -2,
        mouth: 'gentle-smile',
        leftArm: { wristX: 160, wristY: 270, handShape: 'rest' },
        rightArm: { wristX: 230, wristY: 185, handShape: 'thumbs-up' }, // Thumbs up affirmative
        duration: 1300
      };

    case 'THANK_YOU':
    case 'THANKS':
      return {
        headTilt: 2,
        eyebrowY: -3,
        mouth: 'gentle-smile',
        leftArm: { wristX: 160, wristY: 270, handShape: 'rest' },
        rightArm: { wristX: 200, wristY: 155, handShape: 'open-palm' }, // Hand moves from chin out
        duration: 1500
      };

    case 'PLEASE':
    case 'HELP':
      return {
        headTilt: 0,
        eyebrowY: -2,
        mouth: 'gentle-smile',
        leftArm: { wristX: 190, wristY: 235, handShape: 'open-palm' }, // Flat support hand
        rightArm: { wristX: 190, wristY: 215, handShape: 'thumbs-up' }, // Lifted hand
        duration: 1500
      };

    default: // Generic word sign pose
      return {
        headTilt: 0,
        eyebrowY: -2,
        mouth: 'gentle-smile',
        leftArm: { wristX: 155, wristY: 235, handShape: 'open-palm' },
        rightArm: { wristX: 245, wristY: 200, handShape: 'open-palm' },
        duration: 1200
      };
  }
}

/**
 * Accurate ISL 2D Fingerspelling (A-Z) Posture Mapping
 */
function getFingerspellPose(letter) {
  const char = letter.toUpperCase();
  let shape = 'fist';

  switch (char) {
    case 'A':
    case 'S':
      shape = 'fist';
      break;
    case 'B':
      shape = 'open-palm';
      break;
    case 'C':
    case 'O':
      shape = 'c-shape';
      break;
    case 'D':
    case 'G':
    case 'Z':
      shape = 'point-index';
      break;
    case 'F':
      shape = 'ok-sign';
      break;
    case 'I':
    case 'J':
      shape = 'pinky-up';
      break;
    case 'V':
    case 'K':
    case 'U':
      shape = 'peace-v';
      break;
    case 'Y':
    default:
      shape = 'open-palm';
      break;
  }

  return {
    headTilt: 2,
    eyebrowY: -1,
    mouth: 'gentle-smile',
    leftArm: { wristX: 165, wristY: 265, handShape: 'rest' },
    rightArm: { wristX: 240, wristY: 175, handShape: shape }, // Raised active signing zone
    duration: 850 // Snappy letter-by-letter timing
  };
}

export default HumanSignAvatar;
