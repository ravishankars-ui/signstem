import React, { useState } from 'react';
import { LEARNING_PATHS } from '../utils/learningPaths';

export function LearningPaths({ onSelect }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ padding: '0 8px' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%', padding: '5px 8px', borderRadius: '8px', border: 'none',
          background: 'rgba(255,255,255,0.05)',
          color: '#94a3b8', fontSize: '10px', fontWeight: 600, cursor: 'pointer',
          textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: 'inherit',
        }}
      >
        <span>📚 Learning Paths</span>
        <span style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }}>▾</span>
      </button>

      {expanded && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px',
          marginTop: '4px', padding: '4px',
        }}>
          {LEARNING_PATHS.map((path) => (
            <button
              key={path.id}
              onClick={() => onSelect(path.tokens)}
              title={path.desc}
              style={{
                padding: '6px 8px', borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.04)',
                color: '#e2e8f0', fontSize: '10px', fontWeight: 600,
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.15s', fontFamily: 'inherit',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(99,102,241,0.15)';
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
              }}
            >
              <div>{path.icon} {path.name}</div>
              <div style={{ fontSize: '8px', color: '#64748b', marginTop: '1px' }}>
                {path.tokens.length} signs
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
