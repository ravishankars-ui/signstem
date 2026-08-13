import React, { useRef, useEffect, useState } from 'react';
import { RealisticHumanAvatar } from './HumanSignAvatar/RealisticHumanAvatar';

/**
 * Sign Language Player Component
 * 
 * Powered by High-Fidelity Realistic Human Avatar:
 * - Lifelike illustrated human face with almond eyes, subtle lashes, contoured nose, and natural lips
 * - Styled flowing hair with highlights
 * - Continuous anatomically-shaded arms with zero gaps
 * - Expressive 5-finger hands for ISL gestures
 * - Transparent background
 * 
 * @param {Object} props
 * @param {Object} props.currentItem - Current active token from queue
 * @param {Array} props.nextItems - Upcoming tokens
 * @param {Function} props.onEnded - Auto-advance trigger
 * @param {Function} props.onError - Error handler
 * @param {boolean} props.isPlaying - Playback state
 * @param {number} props.playbackRate - Speed multiplier
 * @param {'vector_avatar'|'video'} props.engineMode - Rendering mode
 * @param {Object} props.avatarConfig - Customization configuration
 */
export function Player({
  currentItem,
  nextItems = [],
  onEnded,
  onError,
  isPlaying = true,
  playbackRate = 1.0,
  engineMode = 'vector_avatar',
  avatarConfig
}) {
  const videoRef = useRef(null);
  const [hasVideoError, setHasVideoError] = useState(false);

  useEffect(() => {
    if (engineMode !== 'video') return;
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = playbackRate;
    if (isPlaying) {
      video.play().catch((e) => console.debug('[Player] Video play interrupted:', e));
    } else {
      video.pause();
    }
  }, [isPlaying, playbackRate, currentItem?.src, engineMode]);

  useEffect(() => {
    setHasVideoError(false);
  }, [currentItem?.src]);

  const nextAssetSrc = nextItems?.[0]?.src;

  return (
    <div className="isl-player-container" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* 1. Realistic Human Avatar Presenter */}
      {(engineMode === 'vector_avatar' || hasVideoError) && (
        <RealisticHumanAvatar
          currentItem={currentItem}
          isIdle={Boolean(currentItem?.isIdle)}
          playbackRate={playbackRate}
          onPoseComplete={onEnded}
          config={avatarConfig}
        />
      )}

      {/* 2. Transparent Video Clips (Optional fallback mode) */}
      {engineMode === 'video' && !hasVideoError && (
        <>
          {nextAssetSrc && (
            <link rel="preload" as="video" href={nextAssetSrc} type="video/webm" />
          )}
          <video
            ref={videoRef}
            key={currentItem?.id || currentItem?.src}
            src={currentItem?.src}
            className="isl-video"
            autoPlay
            muted
            playsInline
            loop={Boolean(currentItem?.isIdle)}
            onEnded={onEnded}
            onError={(e) => {
              console.warn(`[Player] Video not found at ${currentItem?.src}, falling back to avatar.`);
              setHasVideoError(true);
            }}
          />
        </>
      )}
    </div>
  );
}

export default Player;
