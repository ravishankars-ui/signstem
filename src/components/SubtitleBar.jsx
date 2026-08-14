import React from 'react';
import { ISL_WORD_POSES, getISLFingerspellPose } from '../constants/islPoseData';

/**
 * SubtitleBar Component
 * 
 * Displays:
 * - Current word/phrase being signed.
 * - For fingerspelling: highlights the active letter within the complete word.
 * - Rich ISL Sign Details (Handshape, Contact location, Motion description).
 * - Queue depth counter and signing state indicators.
 */
export function SubtitleBar({ currentItem, queue = [], isIdle }) {
  const isFingerspelling = Boolean(currentItem?.isFingerspelling);
  const wordRef = currentItem?.wordRef || '';
  const currentToken = currentItem?.token?.toUpperCase() || '';
  const letterIndex = currentItem?.letterIndex ?? 0;
  const queueLength = queue.length;

  // Resolve ISL Sign Details
  const poseData = !isIdle && currentToken
    ? (isFingerspelling ? getISLFingerspellPose(currentToken) : ISL_WORD_POSES[currentToken] || ISL_WORD_POSES['HELLO'])
    : null;

  const metadata = poseData?.metadata;

  return (
    <div className="isl-subtitle-wrapper">
      <div className={`isl-subtitle-bar ${isIdle ? 'is-idle' : 'is-signing'}`}>
        
        {/* Status Indicator Dot */}
        <div className="status-indicator">
          <span className={`status-dot ${isIdle ? 'idle-dot' : 'live-dot'}`} />
          <span className="status-label">{isIdle ? 'Ready' : 'Signing'}</span>
        </div>

        {/* Center Main Subtitle Text */}
        <div className="subtitle-content">
          {isIdle ? (
            <span className="idle-text">Listening for speech...</span>
          ) : isFingerspelling ? (
            <div className="fingerspell-display">
              <span className="fingerspell-tag">SPELLING:</span>
              <div className="letters-container">
                {wordRef.split('').map((char, idx) => {
                  const isCurrent = idx === letterIndex;
                  const isDone = idx < letterIndex;
                  return (
                    <span
                      key={`${wordRef}-${idx}`}
                      className={`letter-char ${isCurrent ? 'active' : ''} ${isDone ? 'completed' : ''}`}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
              <span className="letter-counter">({letterIndex + 1}/{currentItem?.totalLetters || wordRef.length})</span>
            </div>
          ) : (
            <span className="word-text">{currentItem?.label || currentItem?.token}</span>
          )}
        </div>

        {/* Queue Counter Badge */}
        {!isIdle && queueLength > 0 && (
          <div className="queue-badge" title={`${queueLength} signs remaining in queue`}>
            <span>+{queueLength}</span>
          </div>
        )}
      </div>

      {/* Rich ISL Sign Details Pill */}
      {!isIdle && metadata && (
        <div className="isl-sign-details-pill animate-slide-up">
          <span className="isl-pill-tag">ISL Sign:</span>
          <span className="isl-pill-shape">{metadata.handshapeName}</span>
          <span className="isl-pill-divider">•</span>
          <span className="isl-pill-desc">{metadata.desc}</span>
        </div>
      )}
    </div>
  );
}

export default SubtitleBar;
