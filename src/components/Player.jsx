import React, { forwardRef } from 'react';
import { FBXSignAvatar } from './FBXSignAvatar/FBXSignAvatar';

/**
 * Sign Language Player Component
 *
 * Wraps FBXSignAvatar and exposes the canvas via ref for video export.
 */
export const Player = forwardRef(function Player({
  currentItem,
  nextItems = [],
  onEnded,
  onError,
  isPlaying = true,
  playbackRate = 1.0,
  avatarConfig
}, ref) {
  return (
    <div
      ref={ref}
      className="isl-player-container"
      style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <FBXSignAvatar
        currentItem={currentItem}
        isIdle={Boolean(currentItem?.isIdle)}
        playbackRate={playbackRate}
        onPoseComplete={onEnded}
        config={avatarConfig}
      />
    </div>
  );
});

export default Player;
