import React from 'react';

/**
 * DetailedHandRenderer Component
 * 
 * Photorealistic Anatomical Slim Human 5-Finger Hand Engine:
 * - Slim, elegant, finely proportioned human fingers & delicate palms
 * - Tapered 3-phalange fingers with soft joint nodes & translucent fingernails
 * - 1.25x refined scale for natural human proportion with zero clunkiness
 */
export function DetailedHandRenderer({ shape = 'rest_relaxed', skin, isLeft = false }) {
  const uid = isLeft ? 'L' : 'R';
  // Refined 1.25x scale for elegant, slim human hands
  const scaleX = isLeft ? -1.25 : 1.25;
  const scaleY = 1.25;

  return (
    <g transform={`scale(${scaleX}, ${scaleY})`} filter="drop-shadow(0 3px 8px rgba(0,0,0,0.3))">
      <defs>
        {/* Volumetric Palm Gradient */}
        <radialGradient id={`palmGrad_${uid}`} cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor={skin.base} />
          <stop offset="65%" stopColor={skin.mid} />
          <stop offset="100%" stopColor={skin.shadow} />
        </radialGradient>

        {/* Slim Finger 3D Gradient */}
        <linearGradient id={`fingerGrad_${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={skin.mid} />
          <stop offset="35%" stopColor={skin.base} />
          <stop offset="70%" stopColor={skin.base} />
          <stop offset="100%" stopColor={skin.shadow} />
        </linearGradient>

        {/* Thumb Muscle Gradient */}
        <linearGradient id={`thumbGrad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={skin.base} />
          <stop offset="60%" stopColor={skin.mid} />
          <stop offset="100%" stopColor={skin.shadow} />
        </linearGradient>

        {/* Natural Translucent Fingernail Gradient */}
        <linearGradient id={`nailGrad_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.85)" />
          <stop offset="40%" stopColor="rgba(254, 205, 211, 0.6)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0.3)" />
        </linearGradient>
      </defs>

      {renderRealisticShape(shape, skin, uid)}
    </g>
  );
}

function renderRealisticShape(shape, skin, uid) {
  const palmFill = `url(#palmGrad_${uid})`;
  const fingerFill = `url(#fingerGrad_${uid})`;
  const thumbFill = `url(#thumbGrad_${uid})`;
  const nailFill = `url(#nailGrad_${uid})`;
  const creaseColor = skin.shadow;
  const strokeCol = skin.shadow;

  switch (shape) {
    // 1. OPEN 5 SPREAD (Slim, elegant open 5-finger spread)
    case 'open_5_spread':
      return (
        <g>
          {/* Slim Palm Base */}
          <path
            d="M -10 0 C -14 7 -13 18 -8 22 C -2 24 6 24 10 20 C 13 15 12 7 10 0 Z"
            fill={palmFill}
          />
          <path d="M -7 7 C -11 13 -9 19 -2 21" fill="none" stroke={creaseColor} strokeWidth="0.6" opacity="0.4" />

          {/* Slim Opposable Thumb */}
          <g>
            <path
              d="M -8 5 C -16 6 -19 16 -13 20 C -9 20 -6 13 -5 8 Z"
              fill={thumbFill}
              stroke={strokeCol}
              strokeWidth="0.4"
            />
            <ellipse cx="-15" cy="17.5" rx="2.4" ry="1.4" fill={nailFill} transform="rotate(-28, -15, 17.5)" />
          </g>

          {/* Slim Index Finger */}
          <g>
            <path
              d="M -9 18 L -11 40 C -11 44 -6 44 -5 40 L -4 19 Z"
              fill={fingerFill}
              stroke={strokeCol}
              strokeWidth="0.4"
            />
            <line x1="-9" y1="29" x2="-5.5" y2="29" stroke={creaseColor} strokeWidth="0.5" opacity="0.5" />
            <ellipse cx="-8" cy="41.5" rx="2.1" ry="1.2" fill={nailFill} />
          </g>

          {/* Slim Middle Finger */}
          <g>
            <path
              d="M -4 19 L -4 44 C -4 48 1 48 1 44 L 1 20 Z"
              fill={fingerFill}
              stroke={strokeCol}
              strokeWidth="0.4"
            />
            <line x1="-3" y1="32" x2="0.5" y2="32" stroke={creaseColor} strokeWidth="0.5" opacity="0.5" />
            <ellipse cx="-1.5" cy="45.5" rx="2.2" ry="1.3" fill={nailFill} />
          </g>

          {/* Slim Ring Finger */}
          <g>
            <path
              d="M 1 20 L 3 41 C 3 45 7 45 7 41 L 6 19 Z"
              fill={fingerFill}
              stroke={strokeCol}
              strokeWidth="0.4"
            />
            <line x1="2" y1="30" x2="5.5" y2="30" stroke={creaseColor} strokeWidth="0.5" opacity="0.5" />
            <ellipse cx="5" cy="42.5" rx="2.0" ry="1.2" fill={nailFill} />
          </g>

          {/* Slim Pinky Finger */}
          <g>
            <path
              d="M 6 16 L 9 33 C 9 36 13 36 12 33 L 9 15 Z"
              fill={fingerFill}
              stroke={strokeCol}
              strokeWidth="0.4"
            />
            <ellipse cx="10.5" cy="34" rx="1.7" ry="1.0" fill={nailFill} />
          </g>
        </g>
      );

    // 2. FLAT PALM
    case 'flat_palm':
      return (
        <g>
          <path d="M -10 0 C -13 7 -12 18 -6 20 C 0 22 6 22 10 18 C 12 14 11 7 10 0 Z" fill={palmFill} />
          <g>
            <path d="M -8 4 C -14 6 -16 15 -11 18 C -7 18 -5 12 -4 7 Z" fill={thumbFill} stroke={strokeCol} strokeWidth="0.4" />
            <ellipse cx="-13" cy="16" rx="2.2" ry="1.3" fill={nailFill} />
          </g>
          <g>
            <path d="M -8 18 L -9 39 C -9 42 -5 42 -5 39 L -4 18 Z" fill={fingerFill} stroke={strokeCol} strokeWidth="0.4" />
            <ellipse cx="-7" cy="40" rx="1.9" ry="1.1" fill={nailFill} />
            <path d="M -4 19 L -4 43 C -4 46 0 46 0 43 L 0 19 Z" fill={fingerFill} stroke={strokeCol} strokeWidth="0.4" />
            <ellipse cx="-2" cy="44" rx="2.0" ry="1.2" fill={nailFill} />
            <path d="M 0 18 L 1 39 C 1 42 5 42 5 39 L 4 18 Z" fill={fingerFill} stroke={strokeCol} strokeWidth="0.4" />
            <ellipse cx="3" cy="40" rx="1.8" ry="1.1" fill={nailFill} />
            <path d="M 4 16 L 6 33 C 6 35 9 35 9 33 L 7 15 Z" fill={fingerFill} stroke={strokeCol} strokeWidth="0.4" />
            <ellipse cx="7.5" cy="34" rx="1.5" ry="0.9" fill={nailFill} />
          </g>
        </g>
      );

    // 3. POINT INDEX
    case 'point_index':
      return (
        <g>
          <path d="M -8 0 C -12 7 -11 17 0 19 C 11 17 12 7 8 0 Z" fill={palmFill} />
          <path d="M -2 8 C 2 13 6 13 9 8 C 8 15 2 15 -2 8 Z" fill={fingerFill} stroke={strokeCol} strokeWidth="0.4" />
          <g>
            <path d="M -8 15 L -9 42 C -9 46 -4 46 -4 42 L -3 15 Z" fill={fingerFill} stroke={strokeCol} strokeWidth="0.4" />
            <ellipse cx="-6.5" cy="43" rx="2.1" ry="1.2" fill={nailFill} />
          </g>
          <path d="M -7 3 C -14 6 -12 15 -6 15 Z" fill={thumbFill} stroke={strokeCol} strokeWidth="0.4" />
        </g>
      );

    // 4. THUMBS UP
    case 'thumbs_up':
      return (
        <g>
          <path d="M -10 0 C -13 7 -11 17 0 19 C 11 17 13 7 10 0 Z" fill={palmFill} />
          <path d="M -6 8 Q 0 15 6 8 Q 0 19 -6 8 Z" fill={fingerFill} stroke={strokeCol} strokeWidth="0.4" />
          <g>
            <path d="M -8 5 C -16 2 -21 20 -15 26 C -10 26 -6 16 -5 8 Z" fill={thumbFill} stroke={strokeCol} strokeWidth="0.4" />
            <ellipse cx="-17" cy="22" rx="2.5" ry="1.4" fill={nailFill} transform="rotate(-38, -17, 22)" />
          </g>
        </g>
      );

    // 5. FIST
    case 'fist':
      return (
        <g>
          <path d="M -10 0 C -13 7 -11 17 0 19 C 11 17 13 7 10 0 Z" fill={palmFill} />
          <path d="M -8 8 Q 0 14 6 8" fill="none" stroke={creaseColor} strokeWidth="2.0" strokeLinecap="round" />
          <path d="M -9 4 C -14 7 -12 17 -5 17 Z" fill={thumbFill} stroke={strokeCol} strokeWidth="0.4" />
        </g>
      );

    // 6. NATURAL SLIM RELAXED HUMAN REST (IDLE Pose)
    case 'rest_relaxed':
    default:
      return (
        <g>
          {/* Slim Anatomical Palm */}
          <path
            d="M -10 0 C -13 7 -12 17 -7 20 C -2 22 6 22 10 18 C 13 14 12 7 9 0 Z"
            fill={palmFill}
          />
          <path d="M -6 6 C -10 12 -8 17 -2 19" fill="none" stroke={creaseColor} strokeWidth="0.5" opacity="0.4" />

          {/* Slim Opposable Thumb */}
          <g>
            <path
              d="M -8 4 C -15 6 -17 15 -11 18 C -7 18 -5 12 -4 6 Z"
              fill={thumbFill}
              stroke={strokeCol}
              strokeWidth="0.4"
            />
            <ellipse cx="-13" cy="16" rx="2.3" ry="1.3" fill={nailFill} transform="rotate(-25, -13, 16)" />
          </g>

          {/* Slim Index Finger (Gently Curled) */}
          <g>
            <path
              d="M -8 17 C -10 24 -9 33 -5 36 C -3 36 -4 31 -4 18 Z"
              fill={fingerFill}
              stroke={strokeCol}
              strokeWidth="0.4"
            />
            <ellipse cx="-6" cy="36.5" rx="1.9" ry="1.1" fill={nailFill} />
          </g>

          {/* Slim Middle Finger (Gently Curled) */}
          <g>
            <path
              d="M -4 18 C -5 27 -4 37 0 40 C 2 40 1 34 0 19 Z"
              fill={fingerFill}
              stroke={strokeCol}
              strokeWidth="0.4"
            />
            <ellipse cx="-1" cy="40.5" rx="2.0" ry="1.2" fill={nailFill} />
          </g>

          {/* Slim Ring Finger (Gently Curled) */}
          <g>
            <path
              d="M 0 18 C 0 25 2 35 4 37 C 6 37 5 32 4 18 Z"
              fill={fingerFill}
              stroke={strokeCol}
              strokeWidth="0.4"
            />
            <ellipse cx="3.5" cy="37.5" rx="1.8" ry="1.1" fill={nailFill} />
          </g>

          {/* Slim Pinky Finger (Gently Curled) */}
          <g>
            <path
              d="M 5 15 C 6 22 7 30 9 31 C 11 31 10 26 8 14 Z"
              fill={fingerFill}
              stroke={strokeCol}
              strokeWidth="0.4"
            />
            <ellipse cx="9" cy="31.5" rx="1.5" ry="0.9" fill={nailFill} />
          </g>
        </g>
      );
  }
}

export default DetailedHandRenderer;
