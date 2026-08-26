import React, { forwardRef } from 'react';
import { FBXSignAvatar } from './FBXSignAvatar/FBXSignAvatar';
import { ZhenjaSignAvatar } from './ZhenjaSignAvatar';

/**
 * Sign Language Player Component
 *
 * Renders the active 3D avatar (Zhenja GLTF Avatar or FBX Avatar)
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
  const avatarModel = avatarConfig?.modelId || 'zhenja';
  const themeMode = avatarConfig?.themeMode || 'light';

  return (
    <div
      ref={ref}
      className="isl-player-container"
      style={{ width: '100%', height: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {avatarModel === 'fbx' ? (
        <FBXSignAvatar
          currentItem={currentItem}
          isIdle={Boolean(currentItem?.isIdle)}
          playbackRate={playbackRate}
          onPoseComplete={onEnded}
          config={avatarConfig}
        />
      ) : (
        <ZhenjaSignAvatar
          signId={currentItem?.id}
          token={currentItem?.token || 'HELLO'}
          isIdle={Boolean(currentItem?.isIdle)}
          playbackRate={playbackRate}
          queueLength={nextItems.length}
          onPoseComplete={onEnded}
          themeMode={themeMode}
        />
      )}
    </div>
  );
});

export default Player;
