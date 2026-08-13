import React from 'react';

/**
 * DetailedHandRenderer Component
 * 
 * Photorealistic Anatomical 5-Finger Hand Engine for Sign Language:
 * - Volumetric palm shading with thenar & hypothenar muscle pads
 * - 5 slender articulated fingers with MCP, PIP, and DIP joints
 * - Natural translucent fingernails with specular light catch
 * - Multi-stop skin tone gradients for true lifelike depth
 * - Anatomically accurate ISL hand formations
 */
export function DetailedHandRenderer({ shape = 'rest_relaxed', skin, isLeft = false }) {
  const flip = isLeft ? -1 : 1;
  const uid = isLeft ? 'L' : 'R';

  return (
    <g transform={`scale(${flip * 1.45}, 1.45)`} filter="drop-shadow(0 4px 8px rgba(0,0,0,0.25))">
      <defs>
        {/* Volumetric Palm Gradient */}
        <radialGradient id={`palmGrad_${uid}`} cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor={skin.base} />
          <stop offset="65%" stopColor={skin.mid} />
          <stop offset="100%" stopColor={skin.shadow} />
        </radialGradient>

        {/* Finger Cylindrical 3D Gradient */}
        <linearGradient id={`fingerGrad_${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={skin.mid} />
          <stop offset="35%" stopColor={skin.base} />
          <stop offset="70%" stopColor={skin.base} />
          <stop offset="100%" stopColor={skin.shadow} />
        </linearGradient>

        {/* Thumb Gradient */}
        <linearGradient id={`thumbGrad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={skin.base} />
          <stop offset="60%" stopColor={skin.mid} />
          <stop offset="100%" stopColor={skin.shadow} />
        </linearGradient>

        {/* Natural Translucent Fingernail Gradient */}
        <linearGradient id={`nailGrad_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.75)" />
          <stop offset="40%" stopColor="rgba(254, 205, 211, 0.5)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0.25)" />
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
  const knuckleColor = skin.shadow;

  switch (shape) {
    // 1. OPEN 5 SPREAD (Lifelike open hand with spaced articulated fingers)
    case 'open_5_spread':
      return (
        <g>
          {/* Main Palm Base */}
          <path
            d="M -13 0 C -18 12 -15 26 0 28 C 15 26 18 12 13 0 Z"
            fill={palmFill}
          />
          {/* Thenar & Hypothenar Contours */}
          <path d="M -11 8 C -15 16 -12 24 -4 26" fill="none" stroke={creaseColor} strokeWidth="0.8" opacity="0.4" />
          <path d="M -8 18 Q 0 21 8 16" fill="none" stroke={creaseColor} strokeWidth="0.8" opacity="0.35" />

          {/* Opposable Thumb */}
          <g>
            <path
              d="M -11 6 C -21 8 -25 20 -17 24 C -12 24 -8 16 -7 10 Z"
              fill={thumbFill}
              stroke={knuckleColor}
              strokeWidth="0.5"
            />
            {/* Thumb Nail */}
            <ellipse cx="-19" cy="21" rx="3.2" ry="1.8" fill={nailFill} transform="rotate(-30, -19, 21)" />
          </g>

          {/* Index Finger */}
          <g>
            <path
              d="M -11 22 L -13 42 C -13 47 -7 47 -7 42 L -5 24 Z"
              fill={fingerFill}
              stroke={knuckleColor}
              strokeWidth="0.5"
            />
            <line x1="-11" y1="31" x2="-6.5" y2="31" stroke={knuckleColor} strokeWidth="0.6" opacity="0.6" />
            <line x1="-12" y1="38" x2="-7" y2="38" stroke={knuckleColor} strokeWidth="0.6" opacity="0.6" />
            <ellipse cx="-10" cy="43.5" rx="2.5" ry="1.4" fill={nailFill} />
          </g>

          {/* Middle Finger */}
          <g>
            <path
              d="M -5 24 L -5 48 C -5 53 1 53 1 48 L 1 26 Z"
              fill={fingerFill}
              stroke={knuckleColor}
              strokeWidth="0.5"
            />
            <line x1="-5" y1="33" x2="1" y2="33" stroke={knuckleColor} strokeWidth="0.6" opacity="0.6" />
            <line x1="-5" y1="42" x2="1" y2="42" stroke={knuckleColor} strokeWidth="0.6" opacity="0.6" />
            <ellipse cx="-2" cy="49.5" rx="2.6" ry="1.5" fill={nailFill} />
          </g>

          {/* Ring Finger */}
          <g>
            <path
              d="M 1 24 L 3 44 C 3 49 9 49 9 44 L 7 24 Z"
              fill={fingerFill}
              stroke={knuckleColor}
              strokeWidth="0.5"
            />
            <line x1="3" y1="32" x2="8" y2="32" stroke={knuckleColor} strokeWidth="0.6" opacity="0.6" />
            <line x1="3" y1="40" x2="9" y2="40" stroke={knuckleColor} strokeWidth="0.6" opacity="0.6" />
            <ellipse cx="6" cy="45.5" rx="2.3" ry="1.3" fill={nailFill} />
          </g>

          {/* Pinky Finger */}
          <g>
            <path
              d="M 7 18 L 10 36 C 10 40 15 40 15 36 L 12 18 Z"
              fill={fingerFill}
              stroke={knuckleColor}
              strokeWidth="0.5"
            />
            <line x1="9" y1="26" x2="13.5" y2="26" stroke={knuckleColor} strokeWidth="0.6" opacity="0.6" />
            <ellipse cx="12.5" cy="37" rx="1.9" ry="1.1" fill={nailFill} />
          </g>
        </g>
      );

    // 2. FLAT PALM (Anjali / Namaste / Courtesy)
    case 'flat_palm':
    case 'namaste_prayer':
      return (
        <g>
          <path d="M -12 0 C -16 12 -13 26 0 28 C 13 26 16 12 12 0 Z" fill={palmFill} />
          <path d="M -9 15 Q 0 18 9 14" fill="none" stroke={creaseColor} strokeWidth="0.8" opacity="0.4" />

          {/* Grouped 4 Straight Fingers */}
          <path
            d="M -10 22 L -10 48 C -10 54 10 54 10 48 L 10 22 Z"
            fill={fingerFill}
            stroke={knuckleColor}
            strokeWidth="0.5"
          />

          {/* Finger Division & Joint Highlights */}
          <line x1="-5" y1="24" x2="-5" y2="47" stroke={knuckleColor} strokeWidth="0.7" />
          <line x1="0" y1="24" x2="0" y2="50" stroke={knuckleColor} strokeWidth="0.7" />
          <line x1="5" y1="24" x2="5" y2="47" stroke={knuckleColor} strokeWidth="0.7" />

          {/* Fingernails */}
          <ellipse cx="-7.5" cy="47" rx="2.1" ry="1.2" fill={nailFill} />
          <ellipse cx="-2.5" cy="50" rx="2.3" ry="1.3" fill={nailFill} />
          <ellipse cx="2.5" cy="50" rx="2.3" ry="1.3" fill={nailFill} />
          <ellipse cx="7.5" cy="47" rx="1.9" ry="1.1" fill={nailFill} />

          {/* Tucked Thumb */}
          <path d="M -11 6 C -18 8 -19 18 -12 20 Z" fill={thumbFill} stroke={knuckleColor} strokeWidth="0.5" />
        </g>
      );

    // 3. POINT INDEX (Single index extended, other fingers folded naturally)
    case 'point_index':
      return (
        <g>
          <path d="M -12 0 C -15 12 -12 24 0 24 C 12 24 15 12 12 0 Z" fill={palmFill} />

          {/* Extended Index Finger */}
          <g>
            <path
              d="M -8 18 L -8 50 C -8 55 -2 55 -2 50 L -2 18 Z"
              fill={fingerFill}
              stroke={knuckleColor}
              strokeWidth="0.6"
            />
            <line x1="-8" y1="30" x2="-2" y2="30" stroke={knuckleColor} strokeWidth="0.6" opacity="0.6" />
            <line x1="-8" y1="41" x2="-2" y2="41" stroke={knuckleColor} strokeWidth="0.6" opacity="0.6" />
            <ellipse cx="-5" cy="51" rx="2.5" ry="1.4" fill={nailFill} />
          </g>

          {/* Curled Middle, Ring, Pinky Knuckles */}
          <path d="M -1 18 C 6 18 11 14 11 7 C 11 2 4 4 0 6 Z" fill={skin.mid} stroke={knuckleColor} strokeWidth="0.5" />
          <line x1="3.5" y1="16" x2="3.5" y2="7" stroke={knuckleColor} strokeWidth="0.5" />
          <line x1="7.5" y1="15" x2="7.5" y2="7" stroke={knuckleColor} strokeWidth="0.5" />

          {/* Thumb Over Middle Knuckle */}
          <path d="M -10 6 C -16 8 -16 18 -8 19 C -3 19 -3 11 -6 6 Z" fill={thumbFill} stroke={knuckleColor} strokeWidth="0.5" />
        </g>
      );

    // 4. TWO FINGERS H / N (Index and Middle extended)
    case 'two_fingers_h':
      return (
        <g>
          <path d="M -12 0 C -15 12 -12 24 0 24 C 12 24 15 12 12 0 Z" fill={palmFill} />

          {/* Extended Index & Middle Pair */}
          <path
            d="M -9 20 L -9 48 C -9 53 3 53 3 48 L 3 20 Z"
            fill={fingerFill}
            stroke={knuckleColor}
            strokeWidth="0.6"
          />
          <line x1="-3" y1="22" x2="-3" y2="49" stroke={knuckleColor} strokeWidth="0.6" />
          <ellipse cx="-6" cy="49" rx="2.3" ry="1.3" fill={nailFill} />
          <ellipse cx="0" cy="49" rx="2.3" ry="1.3" fill={nailFill} />

          {/* Curled Ring & Pinky */}
          <path d="M 4 16 C 9 16 12 12 12 7 C 12 3 7 4 3 5 Z" fill={skin.mid} stroke={knuckleColor} strokeWidth="0.5" />
          {/* Thumb */}
          <path d="M -10 6 C -16 8 -16 18 -8 19 Z" fill={thumbFill} stroke={knuckleColor} strokeWidth="0.5" />
        </g>
      );

    // 5. PEACE V (Index and Middle spread)
    case 'peace_v':
      return (
        <g>
          <path d="M -12 0 C -15 12 -12 24 0 24 C 12 24 15 12 12 0 Z" fill={palmFill} />

          {/* Index Finger (Angled Left) */}
          <g>
            <path
              d="M -7 18 L -15 48 C -15 53 -9 54 -7 50 L -2 18 Z"
              fill={fingerFill}
              stroke={knuckleColor}
              strokeWidth="0.6"
            />
            <ellipse cx="-12" cy="50.5" rx="2.4" ry="1.4" fill={nailFill} transform="rotate(-18, -12, 50.5)" />
          </g>

          {/* Middle Finger (Angled Right) */}
          <g>
            <path
              d="M -1 18 L 6 49 C 8 54 14 53 14 48 L 7 18 Z"
              fill={fingerFill}
              stroke={knuckleColor}
              strokeWidth="0.6"
            />
            <ellipse cx="10" cy="50.5" rx="2.4" ry="1.4" fill={nailFill} transform="rotate(18, 10, 50.5)" />
          </g>

          {/* Curled Ring & Pinky */}
          <path d="M 7 14 C 11 14 13 10 13 5 Z" fill={skin.mid} stroke={knuckleColor} strokeWidth="0.5" />
          {/* Thumb */}
          <path d="M -10 6 C -16 8 -16 18 -8 19 Z" fill={thumbFill} stroke={knuckleColor} strokeWidth="0.5" />
        </g>
      );

    // 6. TWO FINGERS L (Upright index, horizontal thumb)
    case 'two_fingers_l':
      return (
        <g>
          <path d="M -12 0 C -15 12 -12 24 0 24 C 12 24 15 12 12 0 Z" fill={palmFill} />

          {/* Upright Index */}
          <path
            d="M -5 18 L -5 50 C -5 55 1 55 1 50 L 1 18 Z"
            fill={fingerFill}
            stroke={knuckleColor}
            strokeWidth="0.6"
          />
          <ellipse cx="-2" cy="51.5" rx="2.4" ry="1.4" fill={nailFill} />

          {/* Horizontal Thumb */}
          <path
            d="M -10 6 L -30 6 C -34 6 -34 14 -30 14 L -8 18 Z"
            fill={thumbFill}
            stroke={knuckleColor}
            strokeWidth="0.6"
          />
          <ellipse cx="-30" cy="10" rx="1.6" ry="2.4" fill={nailFill} />

          {/* Curled Middle, Ring, Pinky */}
          <path d="M 2 16 C 8 16 12 11 12 6 Z" fill={skin.mid} stroke={knuckleColor} strokeWidth="0.5" />
        </g>
      );

    // 7. THUMBS UP
    case 'thumbs_up':
      return (
        <g>
          <path d="M -12 0 C -15 12 -12 24 0 24 C 12 24 15 12 12 0 Z" fill={palmFill} />

          {/* Upright Thumb */}
          <g>
            <path
              d="M -12 6 C -22 8 -26 -16 -14 -18 C -9 -18 -7 -2 -7 6 Z"
              fill={thumbFill}
              stroke={knuckleColor}
              strokeWidth="0.6"
            />
            <ellipse cx="-18" cy="-14" rx="2.6" ry="1.6" fill={nailFill} transform="rotate(-30, -18, -14)" />
          </g>

          {/* Folded 4-Finger Fist */}
          <path d="M -6 18 C 6 18 12 13 12 5 C 12 -2 2 0 -5 4 Z" fill={skin.mid} stroke={knuckleColor} strokeWidth="0.5" />
        </g>
      );

    // 8. C-CURVE / CUPPED
    case 'c_curve':
    case 'cupped_palm_up':
      return (
        <g>
          <path d="M -12 0 C -15 12 -12 24 0 26 C 12 24 15 12 12 0 Z" fill={palmFill} />
          {/* Upper curved 4 fingers */}
          <path
            d="M -10 20 C -16 32 -8 42 3 40 C 10 38 13 30 10 22 Z"
            fill={fingerFill}
            stroke={knuckleColor}
            strokeWidth="0.6"
          />
          {/* Lower curved thumb */}
          <path d="M -10 8 C -22 10 -20 26 -8 24 Z" fill={thumbFill} stroke={knuckleColor} strokeWidth="0.5" />
        </g>
      );

    // 9. THREE FINGERS (M-letter 3-finger group)
    case 'three_fingers':
      return (
        <g>
          <path d="M -12 0 C -15 12 -12 24 0 24 C 12 24 15 12 12 0 Z" fill={palmFill} />
          <path
            d="M -10 20 L -10 44 C -10 49 8 49 8 44 L 8 20 Z"
            fill={fingerFill}
            stroke={knuckleColor}
            strokeWidth="0.6"
          />
          <line x1="-4" y1="22" x2="-4" y2="46" stroke={knuckleColor} strokeWidth="0.6" />
          <line x1="2" y1="22" x2="2" y2="46" stroke={knuckleColor} strokeWidth="0.6" />
          <ellipse cx="-7" cy="45" rx="2" ry="1.2" fill={nailFill} />
          <ellipse cx="-1" cy="45.5" rx="2" ry="1.2" fill={nailFill} />
          <ellipse cx="5" cy="45" rx="2" ry="1.2" fill={nailFill} />
          <path d="M 8 14 C 12 14 13 10 13 6 Z" fill={skin.mid} />
          <path d="M -10 6 C -16 8 -16 18 -8 19 Z" fill={thumbFill} />
        </g>
      );

    // 10. HOOK INDEX
    case 'hook_index':
      return (
        <g>
          <path d="M -12 0 C -15 12 -12 24 0 24 C 12 24 15 12 12 0 Z" fill={palmFill} />
          <path
            d="M -7 18 L -7 36 C -7 44 5 44 5 34 L 1 28 Z"
            fill={fingerFill}
            stroke={knuckleColor}
            strokeWidth="0.6"
          />
          <path d="M 2 16 C 7 16 11 11 11 6 Z" fill={skin.mid} />
          <path d="M -10 6 C -16 8 -16 18 -8 19 Z" fill={thumbFill} />
        </g>
      );

    // 11. CROSSED R
    case 'crossed_r':
      return (
        <g>
          <path d="M -12 0 C -15 12 -12 24 0 24 C 12 24 15 12 12 0 Z" fill={palmFill} />
          <path
            d="M -8 18 L 1 50 C 2 54 7 53 6 49 L -1 18 Z"
            fill={fingerFill}
            stroke={knuckleColor}
            strokeWidth="0.6"
          />
          <path
            d="M -1 18 L -10 50 C -11 54 -6 53 -5 49 L 3 18 Z"
            fill={fingerFill}
            stroke={knuckleColor}
            strokeWidth="0.6"
          />
          <path d="M 5 16 C 9 16 12 11 12 6 Z" fill={skin.mid} />
          <path d="M -10 6 C -16 8 -16 18 -8 19 Z" fill={thumbFill} />
        </g>
      );

    // 12. REST RELAXED (Natural human resting curvature at sides)
    default:
      return (
        <g>
          {/* Natural Palm Base */}
          <path
            d="M -12 0 C -16 10 -13 22 0 24 C 13 22 16 10 12 0 Z"
            fill={palmFill}
          />
          {/* Thenar Crease */}
          <path d="M -8 8 Q -3 15 -1 22" fill="none" stroke={creaseColor} strokeWidth="0.7" opacity="0.3" />

          {/* Gracefully Curved Relaxed Fingers */}
          {/* Index & Middle Curved Forefront */}
          <g>
            <path
              d="M -8 16 C -7 28 -2 33 2 30 C 4 28 3 18 0 14 Z"
              fill={fingerFill}
              stroke={knuckleColor}
              strokeWidth="0.5"
            />
            <ellipse cx="-2.5" cy="30" rx="2" ry="1.2" fill={nailFill} />
          </g>

          {/* Ring & Pinky Curved Slightly Behind */}
          <g>
            <path
              d="M 1 16 C 3 28 7 32 10 28 C 12 26 10 17 7 13 Z"
              fill={fingerFill}
              stroke={knuckleColor}
              strokeWidth="0.5"
            />
            <ellipse cx="6" cy="29" rx="1.8" ry="1.1" fill={nailFill} />
          </g>

          {/* Soft Thumb Tucked Naturally */}
          <path
            d="M -10 4 C -16 6 -16 15 -9 16 Z"
            fill={thumbFill}
            stroke={knuckleColor}
            strokeWidth="0.5"
          />
        </g>
      );
  }
}

export default DetailedHandRenderer;
