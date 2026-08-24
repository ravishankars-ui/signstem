import React from 'react';
import { ISL_WORD_POSES, getISLFingerspellPose } from '../constants/islPoseData';

export function SubtitleBar({ currentItem, queue = [], isIdle }) {
  const isFingerspelling = Boolean(currentItem?.isFingerspelling);
  const wordRef = currentItem?.wordRef || '';
  const token = currentItem?.token?.toUpperCase() || '';
  const letterIndex = currentItem?.letterIndex ?? 0;
  const queueLen = queue.length;

  const poseData = !isIdle && token
    ? (isFingerspelling ? getISLFingerspellPose(token) : ISL_WORD_POSES[token] || ISL_WORD_POSES['HELLO'])
    : null;
  const meta = poseData?.metadata;

  return (
    <div style={S.wrap}>
      {/* Main bar */}
      <div style={S.bar}>
        {/* Status */}
        <div style={S.status}>
          <div style={{ ...S.dot, background: isIdle ? '#475569' : '#22c55e', boxShadow: isIdle ? 'none' : '0 0 6px rgba(34,197,94,0.5)' }} />
          <span style={S.statusLabel}>{isIdle ? 'Ready' : 'Signing'}</span>
        </div>

        {/* Content */}
        <div style={S.content}>
          {isIdle ? (
            <span style={S.idle}>Waiting for input...</span>
          ) : isFingerspelling ? (
            <div style={S.finger}>
              <div style={S.letters}>
                {wordRef.split('').map((ch, i) => (
                  <span key={i} style={{
                    ...S.letter,
                    color: i === letterIndex ? '#a5b4fc' : i < letterIndex ? '#475569' : '#e2e8f0',
                    fontWeight: i === letterIndex ? 800 : 500,
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
          <span style={{ color: '#a5b4fc', fontWeight: 600 }}>{meta.handshapeName}</span>
          <span style={{ color: '#475569' }}>·</span>
          <span style={{ color: '#94a3b8' }}>{meta.desc}</span>
        </div>
      )}
    </div>
  );
}

const S = {
  wrap: { flexShrink: 0 },
  bar: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '6px 10px',
    background: 'rgba(0,0,0,0.25)',
    borderTop: '1px solid rgba(255,255,255,0.04)',
  },
  status: { display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 },
  dot: { width: 5, height: 5, borderRadius: '50%', transition: 'all 0.3s' },
  statusLabel: { fontSize: '9px', color: '#64748b', fontWeight: 600 },
  content: { flex: 1, minWidth: 0, textAlign: 'center' },
  idle: { fontSize: '10px', color: '#475569', fontStyle: 'italic' },
  word: { fontSize: '13px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.3px' },
  finger: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 },
  letters: { display: 'flex', gap: 1 },
  letter: { fontSize: '12px', transition: 'all 0.15s', fontFamily: "'JetBrains Mono', monospace" },
  counter: { fontSize: '8px', color: '#475569' },
  badge: {
    padding: '1px 6px', borderRadius: 6,
    background: 'rgba(99,102,241,0.15)', color: '#a5b4fc',
    fontSize: '8px', fontWeight: 700, flexShrink: 0,
  },
  details: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
    padding: '3px 10px',
    background: 'rgba(0,0,0,0.15)',
    fontSize: '9px',
  },
};

export default SubtitleBar;
