import React, { useEffect, useState, useCallback } from 'react';
import { useAnimationQueue } from './hooks/useAnimationQueue';
import { Player } from './components/Player';
import { SubtitleBar } from './components/SubtitleBar';
import { DevControls } from './components/DevControls';
import { CustomizerModal } from './components/CustomizerModal';
import { FloatingWidget } from './components/FloatingWidget';
import { DEFAULT_AVATAR_CONFIG } from './constants/avatarCustomization';

/**
 * 2D Indian Sign Language (ISL) Sequencer App
 * 
 * Includes:
 * - Free Draggable & Resizable Floating Extension Widget (with PIP / Corner Snap / Presets)
 * - Highly Refined 2D Human ISL Character Avatar
 * - Full Customization Studio
 * - Message Listener & Auto-Sequencing
 */
export function App() {
  const [engineMode, setEngineMode] = useState('vector_avatar');
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Load saved avatar config
  const [avatarConfig, setAvatarConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('isl_avatar_config');
      return saved ? JSON.parse(saved) : DEFAULT_AVATAR_CONFIG;
    } catch {
      return DEFAULT_AVATAR_CONFIG;
    }
  });

  const handleUpdateAvatarConfig = (newConfig) => {
    setAvatarConfig(newConfig);
    try {
      localStorage.setItem('isl_avatar_config', JSON.stringify(newConfig));
    } catch (e) {
      console.debug('Failed to save to localStorage:', e);
    }
  };

  // Callback when a sign token begins playing
  const handleTokenStart = useCallback((item, remainingCount) => {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          {
            type: 'ISL_TOKEN_STARTED',
            token: item.token,
            label: item.label,
            wordRef: item.wordRef,
            isFingerspelling: item.isFingerspelling,
            remainingCount
          },
          '*'
        );
      }
    } catch (e) {
      console.debug('[App] postMessage dispatch failed:', e);
    }
  }, []);

  // Callback when the entire sequence finishes
  const handleSequenceComplete = useCallback(() => {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          {
            type: 'ISL_SEQUENCE_COMPLETED'
          },
          '*'
        );
      }
    } catch (e) {
      console.debug('[App] postMessage dispatch failed:', e);
    }
  }, []);

  const {
    queue,
    currentItem,
    isIdle,
    isPlaying,
    playbackRate,
    setPlaybackRate,
    enqueueTokens,
    handleAnimationEnd,
    handleAnimationError,
    clearQueue,
    skipCurrent
  } = useAnimationQueue({
    onTokenStart: handleTokenStart,
    onSequenceComplete: handleSequenceComplete
  });

  // Message listener for Chrome Extension iframe communication
  useEffect(() => {
    const handleMessage = (event) => {
      let data = event.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }

      if (!data || typeof data !== 'object') return;

      switch (data.type) {
        case 'PLAY_ISL_SEQUENCE':
        case 'TRANSLATE_SPEECH_TO_ISL': {
          const tokens = data.tokens || data.words || data.payload;
          const mode = data.mode || 'replace';
          if (tokens) {
            enqueueTokens(tokens, mode);
          }
          break;
        }

        case 'STOP_SEQUENCE':
        case 'CLEAR_QUEUE': {
          clearQueue();
          break;
        }

        case 'SKIP_CURRENT_SIGN': {
          skipCurrent();
          break;
        }

        case 'SET_PLAYBACK_SPEED': {
          if (typeof data.speed === 'number' && data.speed > 0) {
            setPlaybackRate(data.speed);
          }
          break;
        }

        case 'SET_RENDER_ENGINE': {
          if (data.engine === 'video' || data.engine === 'vector_avatar') {
            setEngineMode(data.engine);
          }
          break;
        }

        case 'SET_AVATAR_CONFIG': {
          if (data.config && typeof data.config === 'object') {
            handleUpdateAvatarConfig({ ...avatarConfig, ...data.config });
          }
          break;
        }

        default:
          break;
      }
    };

    window.addEventListener('message', handleMessage);

    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'ISL_SEQUENCER_READY' }, '*');
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [enqueueTokens, clearQueue, skipCurrent, setPlaybackRate, avatarConfig]);

  return (
    <main className="isl-app-root">
      {/* 1. Global Controls & Test Simulation Bar (Top Right) */}
      <DevControls
        onSendSequence={enqueueTokens}
        onClear={clearQueue}
        isIdle={isIdle}
        currentSpeed={playbackRate}
        onSpeedChange={setPlaybackRate}
        engineMode={engineMode}
        onToggleEngine={setEngineMode}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
      />

      {/* 2. Avatar Customization Studio Modal */}
      <CustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        config={avatarConfig}
        onUpdateConfig={handleUpdateAvatarConfig}
      />

      {/* 3. Draggable & Resizable Floating Extension Widget */}
      <FloatingWidget
        footer={
          <SubtitleBar
            currentItem={currentItem}
            queue={queue}
            isIdle={isIdle}
          />
        }
      >
        <section className="isl-stage">
          <Player
            currentItem={currentItem}
            nextItems={queue}
            onEnded={handleAnimationEnd}
            onError={handleAnimationError}
            isPlaying={isPlaying}
            playbackRate={playbackRate}
            engineMode={engineMode}
            avatarConfig={avatarConfig}
          />
        </section>
      </FloatingWidget>
    </main>
  );
}

export default App;
