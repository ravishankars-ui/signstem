import React, { forwardRef } from 'react';
import { ZhenjaSignAvatar } from './ZhenjaSignAvatar';

/**
 * Sign Language Player Component
 *
 * Renders the photorealistic Zhenja 3D sign language avatar
 * and drives sign language keyframes.
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
  const themeMode = avatarConfig?.themeMode || 'light';

  return (
    <div
      ref={ref}
      className="isl-player-container"
      style={{ width: '100%', height: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <ZhenjaSignAvatar
        signId={currentItem?.id}
        token={currentItem?.token || 'HELLO'}
        isIdle={Boolean(currentItem?.isIdle)}
        isPlaying={isPlaying}
        playbackRate={playbackRate}
        queueLength={nextItems.length}
        onPoseComplete={onEnded}
        themeMode={themeMode}
      />
    </div>
  );
});

export default Player;
