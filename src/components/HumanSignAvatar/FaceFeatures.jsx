import React from 'react';

/**
 * FaceFeatures Component
 * 
 * High-definition facial features with:
 * - Expressive almond eyes, blinking eyelids, specular light catch
 * - Morphing eyebrows (interrogative raise, empathetic tilt, neutral)
 * - Morphing lips (warm smile, question 'O', open talk, firm)
 * - Multiple hair styles & dynamic hair colors
 * - Optional accessories (Glasses, Hearing Aid, Bindi)
 */
export function FaceFeatures({
  gender = 'female',
  skinPalette,
  hairStyle = 'wavy-bob',
  hairColor,
  accessory = 'none',
  blink = false,
  eyebrowsY = 0,
  mouthShape = 'neutral-smile',
  headPitch = 0
}) {
  const isFemale = gender === 'female';
  const { base, mid, dark, light } = skinPalette;
  const hairBase = hairColor?.base || '#271c19';
  const hairHighlight = hairColor?.highlight || '#44322d';

  return (
    <g id="avatar-face-assembly">
      {/* 1. Hair Silhouette (Behind Head) */}
      {renderHairBack(hairStyle, hairBase, hairHighlight)}

      {/* 2. Ears */}
      <g id="ears">
        <ellipse cx="154" cy="122" rx="7" ry="11" fill={mid} />
        <ellipse cx="155" cy="122" rx="4.5" ry="7.5" fill={base} />
        <ellipse cx="246" cy="122" rx="7" ry="11" fill={mid} />
        <ellipse cx="245" cy="122" rx="4.5" ry="7.5" fill={base} />

        {/* Digital Hearing Aid Accessory */}
        {accessory === 'hearing-aid' && (
          <g transform="translate(244, 112)">
            <path d="M 2 0 C 8 -5, 8 14, 2 11" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <circle cx="5" cy="4" r="2.2" fill="#3b82f6" />
            <path d="M 2 11 Q -2 11 -4 7" stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          </g>
        )}
      </g>

      {/* 3. Face Base & Jawline */}
      <path
        d={
          isFemale
            ? "M 158 102 C 158 64, 242 64, 242 102 C 242 144, 224 170, 200 170 C 176 170, 158 144, 158 102 Z"
            : "M 156 100 C 156 62, 244 62, 244 100 C 244 145, 228 172, 200 172 C 172 172, 156 145, 156 100 Z"
        }
        fill={base}
        stroke={mid}
        strokeWidth="1"
      />

      {/* Soft Cheek Glow */}
      <ellipse cx="172" cy="130" rx="9" ry="5" fill="#f43f5e" opacity="0.14" />
      <ellipse cx="228" cy="130" rx="9" ry="5" fill="#f43f5e" opacity="0.14" />

      {/* 4. Forehead Bindi */}
      {accessory === 'bindi' && (
        <circle cx="200" cy="98" r="3" fill="#be123c" stroke="#fbbf24" strokeWidth="0.6" />
      )}

      {/* 5. Eyebrows */}
      <g
        id="eyebrows"
        style={{
          transform: `translateY(${eyebrowsY}px)`,
          transition: 'transform 0.25s ease'
        }}
      >
        {isFemale ? (
          <>
            <path d="M 172 101 Q 183 95 192 100" stroke={hairBase} strokeWidth="2.4" strokeLinecap="round" fill="none" />
            <path d="M 208 100 Q 217 95 228 101" stroke={hairBase} strokeWidth="2.4" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <path d="M 170 102 Q 183 98 193 102" stroke={hairBase} strokeWidth="3.2" strokeLinecap="round" fill="none" />
            <path d="M 207 102 Q 217 98 230 102" stroke={hairBase} strokeWidth="3.2" strokeLinecap="round" fill="none" />
          </>
        )}
      </g>

      {/* 6. Expressive Eyes & Eyelids */}
      <g id="eyes">
        {blink ? (
          <>
            <path d="M 172 116 Q 182 121 192 116" stroke={dark} strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M 208 116 Q 218 121 228 116" stroke={dark} strokeWidth="2.2" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            {/* Left Eye */}
            <path d="M 172 116 Q 182 108 192 116 Q 182 122 172 116 Z" fill="#ffffff" />
            <ellipse cx="182" cy="115" rx="3.4" ry="3.4" fill="#1c1917" />
            <ellipse cx="182" cy="115" rx="1.8" ry="1.8" fill="#0f172a" />
            <circle cx="183.5" cy="113.8" r="1.1" fill="#ffffff" />
            <circle cx="181" cy="116.5" r="0.5" fill="#ffffff" />
            <path d="M 171 115 Q 182 108 193 115" stroke="#1c1917" strokeWidth={isFemale ? "1.6" : "1.1"} strokeLinecap="round" fill="none" />

            {/* Right Eye */}
            <path d="M 208 116 Q 218 108 228 116 Q 218 122 208 116 Z" fill="#ffffff" />
            <ellipse cx="218" cy="115" rx="3.4" ry="3.4" fill="#1c1917" />
            <ellipse cx="218" cy="115" rx="1.8" ry="1.8" fill="#0f172a" />
            <circle cx="219.5" cy="113.8" r="1.1" fill="#ffffff" />
            <circle cx="217" cy="116.5" r="0.5" fill="#ffffff" />
            <path d="M 207 115 Q 218 108 229 115" stroke="#1c1917" strokeWidth={isFemale ? "1.6" : "1.1"} strokeLinecap="round" fill="none" />
          </>
        )}
      </g>

      {/* 7. Glasses Accessories */}
      {accessory === 'glasses-modern' && (
        <g id="glasses-modern">
          <rect x="168" y="106" width="28" height="18" rx="4" fill="rgba(255,255,255,0.12)" stroke="#334155" strokeWidth="2" />
          <rect x="204" y="106" width="28" height="18" rx="4" fill="rgba(255,255,255,0.12)" stroke="#334155" strokeWidth="2" />
          <line x1="196" y1="113" x2="204" y2="113" stroke="#334155" strokeWidth="2" />
        </g>
      )}

      {accessory === 'glasses-round' && (
        <g id="glasses-round">
          <circle cx="182" cy="115" r="11" fill="rgba(255,255,255,0.12)" stroke="#b45309" strokeWidth="1.8" />
          <circle cx="218" cy="115" r="11" fill="rgba(255,255,255,0.12)" stroke="#b45309" strokeWidth="1.8" />
          <line x1="193" y1="115" x2="207" y2="115" stroke="#b45309" strokeWidth="1.8" />
        </g>
      )}

      {/* 8. Nose */}
      <g id="nose">
        <path d="M 200 112 L 198 128 L 203 128" stroke={dark} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8" />
      </g>

      {/* 9. Expressive Mouth */}
      {renderMouth(mouthShape, isFemale)}

      {/* 10. Hair Foreground Styles */}
      {renderHairFront(hairStyle, hairBase, hairHighlight, isFemale)}
    </g>
  );
}

function renderHairBack(style, hairBase, hairHighlight) {
  switch (style) {
    case 'neat-bun':
      return (
        <g>
          <ellipse cx="200" cy="112" rx="52" ry="54" fill={hairBase} />
          <circle cx="200" cy="54" r="20" fill={hairBase} />
          <circle cx="200" cy="54" r="14" fill={hairHighlight} opacity="0.3" />
        </g>
      );
    case 'long-layers':
      return (
        <g>
          <path d="M 142 105 C 134 160, 138 230, 148 255 L 252 255 C 262 230, 266 160, 258 105 Z" fill={hairBase} />
          <ellipse cx="200" cy="112" rx="54" ry="56" fill={hairBase} />
        </g>
      );
    case 'wavy-bob':
      return (
        <path d="M 144 105 C 136 145, 140 180, 152 195 L 248 195 C 260 180, 264 145, 256 105 Z" fill={hairBase} />
      );
    case 'modern-crop':
    case 'slick-side':
    default:
      return <ellipse cx="200" cy="112" rx="52" ry="54" fill={hairBase} />;
  }
}

function renderHairFront(style, hairBase, hairHighlight, isFemale) {
  switch (style) {
    case 'modern-crop':
      return (
        <g>
          <path
            d="M 152 88 C 170 64, 230 64, 248 88 C 236 80, 216 76, 198 78 C 180 80, 164 84, 152 88 Z"
            fill={hairBase}
          />
          <path d="M 154 88 C 160 102, 162 115, 158 125 C 155 112, 155 100, 154 88 Z" fill={hairBase} />
          <path d="M 246 88 C 240 102, 238 115, 242 125 C 245 112, 245 100, 246 88 Z" fill={hairBase} />
        </g>
      );

    case 'slick-side':
      return (
        <g>
          <path
            d="M 150 90 C 165 70, 235 66, 250 86 C 235 76, 205 74, 175 82 Z"
            fill={hairBase}
          />
          <path d="M 175 82 Q 215 78 245 88" stroke={hairHighlight} strokeWidth="1.5" fill="none" opacity="0.6" />
        </g>
      );

    case 'neat-bun':
      return (
        <g>
          <path
            d="M 154 92 C 172 72, 228 72, 246 92 C 232 82, 212 80, 196 82 C 180 83, 166 87, 154 92 Z"
            fill={hairBase}
          />
        </g>
      );

    case 'long-layers':
      return (
        <g>
          <path
            d="M 152 88 C 175 66, 225 66, 248 88 C 236 80, 215 78, 198 80 C 180 81, 165 85, 152 88 Z"
            fill={hairBase}
          />
          <path d="M 154 88 C 162 115, 158 160, 150 185 C 146 160, 148 115, 154 88 Z" fill={hairBase} />
          <path d="M 246 88 C 238 115, 242 160, 250 185 C 254 160, 252 115, 246 88 Z" fill={hairBase} />
        </g>
      );

    case 'wavy-bob':
    default:
      return (
        <g>
          <path
            d="M 152 90 C 174 66, 226 66, 248 90 C 236 80, 216 78, 198 80 C 180 81, 165 85, 152 90 Z"
            fill={hairBase}
          />
          <path d="M 154 90 C 164 112, 160 142, 150 162 C 146 142, 148 112, 154 90 Z" fill={hairBase} />
          <path d="M 246 90 C 236 112, 240 142, 250 162 C 254 142, 252 112, 246 90 Z" fill={hairBase} />
        </g>
      );
  }
}

function renderMouth(shape, isFemale) {
  const lipColor = isFemale ? '#be123c' : '#991b1b';

  switch (shape) {
    case 'warm-smile':
      return (
        <g id="mouth">
          <path d="M 190 142 Q 200 152 210 142" stroke={lipColor} strokeWidth="2.4" strokeLinecap="round" fill="none" />
        </g>
      );

    case 'question_o':
      return (
        <g id="mouth">
          <ellipse cx="200" cy="144" rx="4.5" ry="5" fill="#881337" stroke={lipColor} strokeWidth="1.4" />
        </g>
      );

    case 'firm':
      return (
        <g id="mouth">
          <line x1="192" y1="144" x2="208" y2="144" stroke={lipColor} strokeWidth="2.2" strokeLinecap="round" />
        </g>
      );

    case 'neutral-smile':
    default:
      return (
        <g id="mouth">
          <path d="M 192 143 Q 200 149 208 143" stroke={lipColor} strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>
      );
  }
}

export default FaceFeatures;
