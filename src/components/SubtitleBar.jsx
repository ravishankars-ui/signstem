import React from 'react';
import { ISL_WORD_POSES, getISLFingerspellPose } from '../constants/islPoseData';

export function SubtitleBar({ currentItem, queue = [], isIdle, isPlaying = true }) {
  const isFingerspelling = Boolean(currentItem?.isFingerspelling);
  const wordRef = currentItem?.wordRef || '';
  const token = currentItem?.token?.toUpperCase() || '';
  const letterIndex = currentItem?.letterIndex ?? 0;
  const queueLen = queue.length;
  const isPaused = !isPlaying && !isIdle;

  const poseData = !isIdle && token
    ? (isFingerspelling ? getISLFingerspellPose(token) : ISL_WORD_POSES[token] || ISL_WORD_POSES['HELLO'])
    : null;
  const meta = poseData?.metadata;

  return (
    <div className="subtitle-bar-wrapper" style={S.wrap}>
      {/* Main bar */}
      <div style={S.bar}>
        {/* Status */}
        <div style={S.status}>
          <div style={{
            ...S.dot,
            background: isIdle ? '#94a3b8' : isPaused ? '#f59e0b' : '#10b981',
            boxShadow: isIdle ? 'none' : isPaused ? '0 0 8px rgba(245,158,11,0.6)' : '0 0 8px rgba(16,185,129,0.6)'
          }} />
          <span style={S.statusLabel}>{isIdle ? 'Ready' : isPaused ? 'Paused' : 'Signing'}</span>
        </div>

        {/* Content */}
        <div style={S.content}>
          {isIdle ? (
            <span style={S.idle}>Waiting for input or speech...</span>
          ) : isFingerspelling ? (
            <div style={S.finger}>
              <div style={S.letters}>
                {wordRef.split('').map((ch, i) => (
                  <span key={i} style={{
                    ...S.letter,
                    color: i === letterIndex ? '#4f46e5' : i < letterIndex ? '#8c827a' : 'inherit',
                    fontWeight: i === letterIndex ? 900 : 600,
                  }}>{ch}</span>
                ))}
              </div>
              <span style={S.counter}>{letterIndex + 1}/{currentItem?.totalLetters || wordRef.length}</span>
            </div>
          ) : (
            <span style={S.word}>{currentItem?.label || currentItem?.token}</span>
          )}
        </div>

        {/* Queue */}
        {!isIdle && queueLen > 0 && (
          <div style={S.badge}>+{queueLen}</div>
        )}
      </div>

      {/* Sign details */}
      {!isIdle && meta && (
        <div style={S.details}>
          <span style={{ color: '#4f46e5', fontWeight: 700 }}>{meta.handshapeName}</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span style={{ opacity: 0.85 }}>{meta.desc}</span>
        </div>
      )}
    </div>
  );
}

const S = {
  wrap: { flexShrink: 0 },
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    background: 'var(--bg-surface-glass)',
    borderTop: '1px solid var(--border-color)',
    backdropFilter: 'blur(16px)',
    boxShadow: '0 -2px 12px rgba(45, 30, 20, 0.04)',
  },
  status: { display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 },
  dot: { width: 6, height: 6, borderRadius: '50%', transition: 'all 0.3s' },
  statusLabel: { fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' },
  content: { flex: 1, minWidth: 0, textAlign: 'center' },
  idle: { fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' },
  word: { fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.4px', textShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  finger: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 },
  letters: { display: 'flex', gap: 1 },
  letter: { fontSize: '12px', transition: 'all 0.15s', fontFamily: "'JetBrains Mono', monospace" },
  counter: { fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700 },
  badge: {
    padding: '2px 7px',
    borderRadius: 7,
    background: 'rgba(99,102,241,0.15)',
    color: 'var(--accent-primary)',
    fontSize: '9px',
    fontWeight: 800,
    flexShrink: 0,
    boxShadow: '0 1px 4px rgba(79, 70, 229, 0.15)',
  },
  details: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    padding: '3px 12px',
    background: 'var(--bg-surface-raised)',
    fontSize: '9px',
    color: 'var(--text-secondary)',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
  },
};

export default SubtitleBar;
