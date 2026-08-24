import React from 'react';

const SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

export function SpeedRamp({ currentSpeed, onSpeedChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '3px', padding: '4px 8px',
    }}>
      {SPEEDS.map((s) => (
        <button
          key={s}
          onClick={() => onSpeedChange(s)}
          style={{
            padding: '2px 7px', borderRadius: '6px', border: 'none',
            background: currentSpeed === s ? 'rgba(99,102,241,0.3)' : 'transparent',
            color: currentSpeed === s ? '#a5b4fc' : '#64748b',
            fontSize: '9px', fontWeight: currentSpeed === s ? 700 : 500,
            cursor: 'pointer', transition: 'all 0.15s',
            fontFamily: 'inherit',
          }}
        >
          {s}x
        </button>
      ))}
    </div>
  );
}
