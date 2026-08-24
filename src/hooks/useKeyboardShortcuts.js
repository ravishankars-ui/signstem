import { useEffect } from 'react';

export function useKeyboardShortcuts({
  onPlayPause, onSkip, onPrev, onToggleMic, onCycleSpeed,
  onCloseModal, onClear, onToggleHistory, onToggleQuiz, onToggleWebcam
}) {
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      switch (e.key) {
        case ' ': e.preventDefault(); onPlayPause?.(); break;
        case 'ArrowRight': e.preventDefault(); onSkip?.(); break;
        case 'ArrowLeft': e.preventDefault(); onPrev?.(); break;
        case 'm': case 'M': onToggleMic?.(); break;
        case 's': case 'S': onCycleSpeed?.(); break;
        case 'Escape': onCloseModal?.(); break;
        case 'r': case 'R': onClear?.(); break;
        case 'h': case 'H': onToggleHistory?.(); break;
        case 'q': case 'Q': onToggleQuiz?.(); break;
        case 'w': case 'W': onToggleWebcam?.(); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onPlayPause, onSkip, onPrev, onToggleMic, onCycleSpeed, onCloseModal, onClear, onToggleHistory, onToggleQuiz, onToggleWebcam]);
}
