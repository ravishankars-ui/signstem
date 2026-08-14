import { useMemo } from 'react'

const HAND_TRANSFORMS = {
  relaxed: { rotate: 0, translateX: 0, translateY: 0 },
  point: { rotate: -18, translateX: 4, translateY: -6 },
  open5: { rotate: -28, translateX: 8, translateY: -10 },
  flat: { rotate: -8, translateX: 6, translateY: -4 },
  fistThumb: { rotate: 12, translateX: 2, translateY: -8 },
}

export const POSES = {
  IDLE: { label: 'Ready', handshape: 'Relaxed hands at rest', left: 'relaxed', right: 'relaxed' },
  YOU: { label: 'You', handshape: 'Index finger points forward', left: 'relaxed', right: 'point' },
  HELLO: { label: 'Hello', handshape: 'Open palm wave', left: 'relaxed', right: 'open5' },
  THANK: { label: 'Thank you', handshape: 'Flat hand from chin forward', left: 'relaxed', right: 'flat' },
  LEARN: { label: 'Learn', handshape: 'Flat hand taps temple', left: 'flat', right: 'relaxed' },
  SEARCH: { label: 'Search', handshape: 'Curved hand moves outward', left: 'relaxed', right: 'open5' },
  SHOW: { label: 'Show', handshape: 'Palm presents forward', left: 'relaxed', right: 'flat' },
  VIDEO: { label: 'Video', handshape: 'Frame gesture with both hands', left: 'flat', right: 'flat' },
  PROJECT: { label: 'Project', handshape: 'Both palms project forward', left: 'open5', right: 'open5' },
}

function Hand({ shape, mirror = false, className = '' }) {
  const t = HAND_TRANSFORMS[shape] ?? HAND_TRANSFORMS.relaxed
  const sx = mirror ? -1 : 1
  return (
    <g
      className={`limb ${className}`}
      transform={`translate(${mirror ? -52 : 52} 118) scale(${sx} 1) translate(${t.translateX} ${t.translateY}) rotate(${t.rotate})`}
    >
      <rect x="-8" y="0" width="16" height="28" rx="7" fill="url(#skinGrad)" />
      {shape === 'point' && <rect x="-2" y="-18" width="4" height="20" rx="2" fill="url(#skinGrad)" />}
      {shape === 'open5' && (
        <>
          <rect x="-7" y="-16" width="3.5" height="18" rx="1.8" fill="url(#skinGrad)" />
          <rect x="-2" y="-20" width="3.5" height="22" rx="1.8" fill="url(#skinGrad)" />
          <rect x="3" y="-18" width="3.5" height="20" rx="1.8" fill="url(#skinGrad)" />
          <rect x="8" y="-14" width="3" height="16" rx="1.5" fill="url(#skinGrad)" />
        </>
      )}
      {shape === 'flat' && <rect x="-9" y="-8" width="18" height="10" rx="4" fill="url(#skinGrad)" />}
      {shape === 'fistThumb' && (
        <>
          <rect x="-8" y="-2" width="16" height="14" rx="6" fill="url(#skinGrad)" />
          <rect x="2" y="-14" width="4" height="14" rx="2" fill="url(#skinGrad)" />
        </>
      )}
    </g>
  )
}

export function DynamicSignAvatar({ sign = 'YOU', isSigning = false }) {
  const pose = POSES[sign] ?? POSES.YOU
  const waveClass = useMemo(() => (isSigning ? ' wave-hand' : ''), [isSigning])

  return (
    <div className="avatar-stage sign-avatar-2d breathe">
      <div className="avatar-halo" aria-hidden="true" />
      <svg className="sign-avatar-svg" viewBox="0 0 200 260" role="img" aria-label={`Signing avatar: ${pose.label}`}>
        <defs>
          <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0c9a8" />
            <stop offset="100%" stopColor="#d9a37f" />
          </linearGradient>
          <linearGradient id="shirtGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5f6d86" />
            <stop offset="100%" stopColor="#3c465d" />
          </linearGradient>
          <radialGradient id="faceGrad" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#f5d0b3" />
            <stop offset="100%" stopColor="#d8a681" />
          </radialGradient>
        </defs>

        <ellipse cx="100" cy="228" rx="52" ry="14" fill="#00000033" />

        <path d="M62 150 Q100 138 138 150 L132 230 Q100 242 68 230 Z" fill="url(#shirtGrad)" />
        <rect x="88" y="132" width="24" height="22" rx="8" fill="url(#faceGrad)" />

        <ellipse cx="100" cy="88" rx="38" ry="44" fill="url(#faceGrad)" />
        <path d="M72 58 Q100 36 128 58" fill="#4a3428" opacity=".85" />

        <ellipse className="eyelid" cx="86" cy="86" rx="7" ry="4" fill="#fff" />
        <ellipse className="eyelid" cx="114" cy="86" rx="7" ry="4" fill="#fff" />
        <circle className="pupil" cx="86" cy="87" r="2.8" fill="#2d2118" />
        <circle className="pupil" cx="114" cy="87" r="2.8" fill="#2d2118" />
        <path d="M94 104 Q100 110 106 104" stroke="#b07a58" strokeWidth="2" fill="none" strokeLinecap="round" />

        <Hand shape={pose.left} mirror />
        <Hand shape={pose.right} className={waveClass.trim()} />
      </svg>
    </div>
  )
}
