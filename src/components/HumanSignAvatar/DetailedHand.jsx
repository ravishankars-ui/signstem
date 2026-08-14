import React from 'react';

/**
 * DetailedHand Component
 * 
 * High-definition, gracefully proportioned 5-finger anatomical hand
 * calibrated specifically for Indian Sign Language (ISL).
 */
export function DetailedHand({ shape = 'rest_relaxed', isRight = true, skinPalette, scale = 1.0 }) {
  const flip = isRight ? 1 : -1;
  const { base, mid, dark, light, shadow } = skinPalette;

  return (
    <g
      className={`isl-detailed-hand ${isRight ? 'hand-right' : 'hand-left'}`}
      transform={`scale(${flip * scale}, ${scale})`}
    >
      {renderHandShape(shape, { base, mid, dark, light, shadow })}
    </g>
  );
}

function renderHandShape(shape, colors) {
  const { base, mid, dark, light, shadow } = colors;

  switch (shape) {
    // 1. OPEN 5 SPREAD (Hello, Morning, A-Z vowel base)
    case 'open_5_spread':
      return (
        <g id="hand-open-5">
          {/* Palm Base with anatomical contours */}
          <path
            d="M -10 0 C -12 -10, -11 -20, -7 -22 C -2 -24, 6 -24, 10 -20 C 13 -16, 12 -8, 10 0 Z"
            fill={base}
            stroke={mid}
            strokeWidth="0.8"
          />
          {/* Subtle Palm Crease */}
          <path d="M -6 -8 Q 0 -3 7 -8" stroke={dark} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.35" />

          {/* 5 Articulated Fingers */}
          {/* Pinky */}
          <g transform="translate(8, -17) rotate(14)">
            <rect x="-1.8" y="-18" width="3.6" height="20" rx="1.8" fill={base} stroke={mid} strokeWidth="0.7" />
            <ellipse cx="0" cy="-16.5" rx="1.1" ry="1.5" fill={light} opacity="0.85" />
          </g>
          {/* Ring */}
          <g transform="translate(3.2, -22) rotate(5)">
            <rect x="-1.9" y="-22" width="3.8" height="24" rx="1.9" fill={base} stroke={mid} strokeWidth="0.7" />
            <line x1="-1.5" y1="-12" x2="1.5" y2="-12" stroke={dark} strokeWidth="0.6" opacity="0.3" />
            <ellipse cx="0" cy="-20.5" rx="1.2" ry="1.7" fill={light} opacity="0.85" />
          </g>
          {/* Middle */}
          <g transform="translate(-1.8, -24) rotate(-2)">
            <rect x="-2" y="-24" width="4" height="26" rx="2" fill={base} stroke={mid} strokeWidth="0.7" />
            <line x1="-1.6" y1="-13" x2="1.6" y2="-13" stroke={dark} strokeWidth="0.6" opacity="0.3" />
            <ellipse cx="0" cy="-22.5" rx="1.3" ry="1.8" fill={light} opacity="0.85" />
          </g>
          {/* Index */}
          <g transform="translate(-6.8, -21) rotate(-10)">
            <rect x="-1.9" y="-22" width="3.8" height="24" rx="1.9" fill={base} stroke={mid} strokeWidth="0.7" />
            <line x1="-1.5" y1="-12" x2="1.5" y2="-12" stroke={dark} strokeWidth="0.6" opacity="0.3" />
            <ellipse cx="0" cy="-20.5" rx="1.2" ry="1.7" fill={light} opacity="0.85" />
          </g>
          {/* Thumb */}
          <g transform="translate(-10.5, -4) rotate(-38)">
            <rect x="-2.2" y="-17" width="4.4" height="19" rx="2.2" fill={base} stroke={mid} strokeWidth="0.7" />
            <ellipse cx="0" cy="-15.5" rx="1.3" ry="1.8" fill={light} opacity="0.85" />
          </g>
        </g>
      );

    // 2. POINT INDEX (You, Me, Vowels touch, Time)
    case 'point_index_forward':
    case 'point_index_chest':
    case 'point_index_down':
    case 'point_index_up':
      return (
        <g id="hand-point-index">
          <circle cx="0" cy="-3" r="11" fill={base} stroke={mid} strokeWidth="0.8" />

          {/* Extended Index */}
          <g transform="translate(-2, -20)">
            <rect x="-2.2" y="-28" width="4.4" height="30" rx="2.2" fill={base} stroke={mid} strokeWidth="0.7" />
            <line x1="-1.6" y1="-14" x2="1.6" y2="-14" stroke={dark} strokeWidth="0.6" opacity="0.35" />
            <ellipse cx="0" cy="-26.5" rx="1.3" ry="1.8" fill={light} opacity="0.85" />
          </g>

          {/* Curled Knuckles */}
          <rect x="2.5" y="-12" width="4.6" height="11" rx="2.3" fill={dark} />
          <rect x="6.8" y="-10" width="4.2" height="10" rx="2.1" fill={dark} />
          <rect x="10.8" y="-8" width="3.8" height="9" rx="1.9" fill={dark} />
          {/* Thumb folded over index knuckle */}
          <ellipse cx="-3" cy="-2" rx="4.5" ry="3.5" fill={base} stroke={mid} strokeWidth="0.7" />
        </g>
      );

    // 3. NAMASTE PRAYER
    case 'namaste_prayer':
      return (
        <g id="hand-namaste">
          <path d="M -7 -34 L 0 -44 L 7 -34 L 6 0 L -6 0 Z" fill={base} stroke={mid} strokeWidth="0.8" />
          <line x1="0" y1="-44" x2="0" y2="0" stroke={dark} strokeWidth="1.2" opacity="0.5" />
          <line x1="-3.5" y1="-32" x2="-3.5" y2="-12" stroke={dark} strokeWidth="0.6" opacity="0.25" />
          <line x1="3.5" y1="-32" x2="3.5" y2="-12" stroke={dark} strokeWidth="0.6" opacity="0.25" />
        </g>
      );

    // 4. THUMBS UP (Good, Help)
    case 'thumbs_up':
      return (
        <g id="hand-thumbs-up">
          <circle cx="0" cy="-2" r="11" fill={base} stroke={mid} strokeWidth="0.8" />
          {/* Thumb */}
          <g transform="translate(-11, -15) rotate(-15)">
            <rect x="-2.4" y="-24" width="4.8" height="26" rx="2.4" fill={base} stroke={mid} strokeWidth="0.7" />
            <ellipse cx="0" cy="-22.5" rx="1.5" ry="2" fill={light} opacity="0.85" />
          </g>
          {/* Folded Knuckles */}
          <rect x="-5" y="-12" width="4.6" height="11" rx="2.3" fill={dark} />
          <rect x="0" y="-12" width="4.6" height="11" rx="2.3" fill={dark} />
          <rect x="4.8" y="-11" width="4.4" height="10" rx="2.2" fill={dark} />
          <rect x="9.2" y="-9" width="4" height="9" rx="2" fill={dark} />
        </g>
      );

    // 5. FIST (Letter A, S, Yes)
    case 'fist':
      return (
        <g id="hand-fist">
          <circle cx="0" cy="-3" r="11" fill={base} stroke={mid} strokeWidth="0.8" />
          <rect x="-8.5" y="-13" width="4.4" height="13" rx="2.2" fill={dark} />
          <rect x="-3.8" y="-14" width="4.4" height="14" rx="2.2" fill={dark} />
          <rect x="1" y="-13" width="4.4" height="13" rx="2.2" fill={dark} />
          <rect x="5.8" y="-11" width="4" height="11" rx="2" fill={dark} />
          <path d="M -9.5 1 Q -2 -11 7 -4" stroke={base} strokeWidth="4.6" strokeLinecap="round" fill="none" />
          <path d="M -9.5 1 Q -2 -11 7 -4" stroke={mid} strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.4" />
        </g>
      );

    // 6. C CURVE (Letter B, C, D, Water, How)
    case 'c_curve':
    case 'cupped_palm_up':
      return (
        <g id="hand-c-curve">
          <path
            d="M 12 -28 C -15 -28, -19 10, 12 12 C 3 8, -8 3, -6 -6 C -4 -18, 5 -20, 12 -28 Z"
            fill={base}
            stroke={mid}
            strokeWidth="0.8"
          />
        </g>
      );

    // 7. PEACE 'V' (Letter V, Two, See)
    case 'peace_v':
      return (
        <g id="hand-peace-v">
          <circle cx="0" cy="-3" r="11" fill={base} stroke={mid} strokeWidth="0.8" />
          <g transform="translate(-4, -19) rotate(-16)">
            <rect x="-1.9" y="-24" width="3.8" height="26" rx="1.9" fill={base} stroke={mid} strokeWidth="0.7" />
            <ellipse cx="0" cy="-22.5" rx="1.2" ry="1.6" fill={light} opacity="0.85" />
          </g>
          <g transform="translate(4, -19) rotate(16)">
            <rect x="-1.9" y="-24" width="3.8" height="26" rx="1.9" fill={base} stroke={mid} strokeWidth="0.7" />
            <ellipse cx="0" cy="-22.5" rx="1.2" ry="1.6" fill={light} opacity="0.85" />
          </g>
          <rect x="4" y="-10" width="4.4" height="9" rx="2.2" fill={dark} />
          <rect x="8.2" y="-8" width="4" height="7.5" rx="2" fill={dark} />
          <ellipse cx="-3" cy="-2" rx="4.2" ry="3.2" fill={base} stroke={mid} strokeWidth="0.7" />
        </g>
      );

    // 8. TWO FINGERS 'H' / 'L' (Name, Letter H, L, F)
    case 'two_fingers_h':
    case 'two_fingers_l':
      return (
        <g id="hand-two-fingers">
          <circle cx="0" cy="-3" r="11" fill={base} stroke={mid} strokeWidth="0.8" />
          <g transform="translate(-1.8, -19) rotate(-4)">
            <rect x="-1.9" y="-24" width="3.8" height="26" rx="1.9" fill={base} stroke={mid} strokeWidth="0.7" />
          </g>
          <g transform="translate(3.2, -19) rotate(4)">
            <rect x="-1.9" y="-24" width="3.8" height="26" rx="1.9" fill={base} stroke={mid} strokeWidth="0.7" />
          </g>
          {shape === 'two_fingers_l' ? (
            <g transform="translate(-9.5, -2) rotate(-65)">
              <rect x="-2" y="-16" width="4" height="18" rx="2" fill={base} stroke={mid} strokeWidth="0.7" />
            </g>
          ) : (
            <ellipse cx="-3" cy="-2" rx="4.2" ry="3.2" fill={dark} />
          )}
          <rect x="5.8" y="-10" width="4.4" height="9" rx="2.2" fill={dark} />
          <rect x="10" y="-8" width="3.8" height="7.5" rx="1.9" fill={dark} />
        </g>
      );

    // 9. FLAT PALM (Salute, Thank You, Please, Help base, What)
    case 'flat_palm_salute':
    case 'flat_palm_chest':
    case 'flat_palm_up':
    case 'flat_palm_down':
    case 'flat_palm_forward':
    case 'flat_palm_vertical':
      return (
        <g id="hand-flat-palm">
          <ellipse cx="0" cy="-4" rx="11" ry="13" fill={base} stroke={mid} strokeWidth="0.8" />
          <rect x="-6.8" y="-27" width="3.5" height="24" rx="1.75" fill={base} stroke={mid} strokeWidth="0.6" />
          <rect x="-3" y="-30" width="3.7" height="27" rx="1.85" fill={base} stroke={mid} strokeWidth="0.6" />
          <rect x="1.2" y="-29" width="3.7" height="26" rx="1.85" fill={base} stroke={mid} strokeWidth="0.6" />
          <rect x="5.5" y="-24" width="3.4" height="21" rx="1.7" fill={base} stroke={mid} strokeWidth="0.6" />
          <path d="M -8.5 -2 Q -15 -8 -9 -15 Q -4 -11 -2 -4" fill={base} stroke={mid} strokeWidth="0.6" />
        </g>
      );

    // 10. HOOK INDEX (Friend, Letter R)
    case 'hook_index':
      return (
        <g id="hand-hook-index">
          <circle cx="0" cy="-3" r="11" fill={base} stroke={mid} strokeWidth="0.8" />
          <path
            d="M -2 -11 Q -2 -26 6 -22 Q 9 -17 2 -15"
            stroke={base}
            strokeWidth="4.6"
            strokeLinecap="round"
            fill="none"
          />
          <rect x="2.5" y="-10" width="4.6" height="10" rx="2.3" fill={dark} />
          <rect x="6.8" y="-8" width="4.2" height="9" rx="2.1" fill={dark} />
        </g>
      );

    // 11. PINKY EXTENDED (Letter I, J, S hook)
    case 'pinky_hook':
      return (
        <g id="hand-pinky-hook">
          <circle cx="0" cy="-3" r="11" fill={base} stroke={mid} strokeWidth="0.8" />
          <g transform="translate(8, -19) rotate(10)">
            <rect x="-1.7" y="-22" width="3.4" height="24" rx="1.7" fill={base} stroke={mid} strokeWidth="0.7" />
            <ellipse cx="0" cy="-20.5" rx="1.1" ry="1.5" fill={light} opacity="0.85" />
          </g>
          <rect x="-6.5" y="-11" width="4.4" height="11" rx="2.2" fill={dark} />
          <rect x="-1.8" y="-12" width="4.4" height="12" rx="2.2" fill={dark} />
          <rect x="2.8" y="-11" width="4.4" height="11" rx="2.2" fill={dark} />
        </g>
      );

    // 12. THREE FINGERS / TWO FINGERS DOWN (Letter M, W, N)
    case 'three_fingers_down':
    case 'three_fingers_up':
      return (
        <g id="hand-three-fingers">
          <circle cx="0" cy="-3" r="11" fill={base} stroke={mid} strokeWidth="0.8" />
          <rect x="-5.8" y="-25" width="3.6" height="25" rx="1.8" fill={base} stroke={mid} strokeWidth="0.6" />
          <rect x="-1.8" y="-27" width="3.6" height="27" rx="1.8" fill={base} stroke={mid} strokeWidth="0.6" />
          <rect x="2.2" y="-25" width="3.6" height="25" rx="1.8" fill={base} stroke={mid} strokeWidth="0.6" />
          <rect x="6.5" y="-8" width="3.4" height="7" rx="1.7" fill={dark} />
        </g>
      );

    case 'two_fingers_down':
      return (
        <g id="hand-two-fingers-down">
          <circle cx="0" cy="-3" r="11" fill={base} stroke={mid} strokeWidth="0.8" />
          <rect x="-4.2" y="-25" width="3.8" height="25" rx="1.9" fill={base} stroke={mid} strokeWidth="0.6" />
          <rect x="0.5" y="-25" width="3.8" height="25" rx="1.9" fill={base} stroke={mid} strokeWidth="0.6" />
          <rect x="5.2" y="-8" width="3.6" height="7" rx="1.8" fill={dark} />
          <rect x="9.2" y="-6" width="3.4" height="6" rx="1.7" fill={dark} />
        </g>
      );

    // 13. RELAXED RESTING HAND (Idle state at sides/lap)
    case 'rest_relaxed':
    default:
      return (
        <g id="hand-rest-relaxed">
          <ellipse cx="0" cy="-4" rx="10" ry="12" fill={base} stroke={mid} strokeWidth="0.8" />
          <rect x="-6.5" y="-21" width="3.4" height="18" rx="1.7" fill={base} stroke={mid} strokeWidth="0.6" />
          <rect x="-2.8" y="-23" width="3.6" height="20" rx="1.8" fill={base} stroke={mid} strokeWidth="0.6" />
          <rect x="1.2" y="-22" width="3.6" height="19" rx="1.8" fill={base} stroke={mid} strokeWidth="0.6" />
          <rect x="5" y="-18" width="3.2" height="15" rx="1.6" fill={base} stroke={mid} strokeWidth="0.6" />
          <ellipse cx="-6.5" cy="-2" rx="3.2" ry="5.5" fill={base} stroke={mid} strokeWidth="0.6" transform="rotate(-25)" />
        </g>
      );
  }
}

export default DetailedHand;
