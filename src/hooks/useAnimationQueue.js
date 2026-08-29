import { useState, useCallback, useRef, useEffect } from 'react';
import { IDLE_ASSET, resolveTokensToQueue } from '../constants/signDictionary';

/**
 * Custom React Hook for Managing 2D Sign Language Animation Sequencing
 * 
 * Features:
 * - Sequential queue execution with auto-advance upon clip completion (`onEnded`).
 * - Seamless fallback to looping IDLE state when queue is empty.
 * - Queue operations: append, replace (flush & play), skip, clear, pause/resume.
 * - Double-buffering & preload hints for smooth transition between clips.
 * - Notifies external listeners (e.g., Chrome Extension iframe bridge).
 * 
 * @param {Object} options
 * @param {Function} [options.onTokenStart] - Called when a new sign begins playing
 * @param {Function} [options.onSequenceComplete] - Called when the entire queue finishes
 */
export function useAnimationQueue({ onTokenStart, onSequenceComplete } = {}) {
  const [queue, setQueue] = useState([]);
  const [currentItem, setCurrentItem] = useState(IDLE_ASSET);
  const [isIdle, setIsIdle] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [history, setHistory] = useState([]);

  // Keep refs for callbacks and current state to avoid stale closures in event listeners
  const queueRef = useRef(queue);
  queueRef.current = queue;

  const currentItemRef = useRef(currentItem);
  currentItemRef.current = currentItem;

  const isIdleRef = useRef(isIdle);
  isIdleRef.current = isIdle;

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const onTokenStartRef = useRef(onTokenStart);
  onTokenStartRef.current = onTokenStart;

  const onSequenceCompleteRef = useRef(onSequenceComplete);
  onSequenceCompleteRef.current = onSequenceComplete;

  /**
   * Advances the player to the next sign in the queue.
   * If the queue is depleted, transitions back to the IDLE loop.
   */
  const advanceNext = useCallback(() => {
    setQueue((prevQueue) => {
      if (prevQueue.length > 0) {
        const [nextItem, ...remaining] = prevQueue;
        
        // Update history (keep last 5 for context UI)
        setHistory((prevHist) => [
          ...prevHist.slice(-4),
          currentItemRef.current
        ]);

        setCurrentItem(nextItem);
        setIsIdle(false);

        if (onTokenStartRef.current) {
          onTokenStartRef.current(nextItem, remaining.length);
        }

        return remaining;
      } else {
        // Queue is finished -> Return to idle loop
        const wasActive = !isIdleRef.current;
        setCurrentItem(IDLE_ASSET);
        setIsIdle(true);

        if (wasActive && onSequenceCompleteRef.current) {
          onSequenceCompleteRef.current();
        }

        return [];
      }
    });
  }, []);

  /**
   * Enqueue a new set of tokens (words/letters)
   * 
   * @param {string[]|string} tokens - e.g. ['HELLO', 'YOU', 'HOW']
   * @param {'append'|'replace'} [mode='append'] - 'replace' flushes current queue immediately
   */
  const enqueueTokens = useCallback((tokens, mode = 'append') => {
    const resolvedItems = resolveTokensToQueue(tokens);
    if (!resolvedItems || resolvedItems.length === 0) return;

    setQueue((prevQueue) => {
      if (mode === 'replace') {
        // Flush everything and start fresh
        const [firstItem, ...rest] = resolvedItems;
        setCurrentItem(firstItem);
        setIsIdle(false);

        if (onTokenStartRef.current) {
          onTokenStartRef.current(firstItem, rest.length);
        }

        return rest;
      } else {
        // Mode = 'append'
        if (isIdleRef.current) {
          // If currently resting in idle, immediately activate the first incoming sign
          const [firstItem, ...rest] = resolvedItems;
          setCurrentItem(firstItem);
          setIsIdle(false);

          if (onTokenStartRef.current) {
            onTokenStartRef.current(firstItem, rest.length);
          }

          return rest;
        } else {
          // Append to end of ongoing sequence
          return [...prevQueue, ...resolvedItems];
        }
      }
    });
  }, []);

  /**
   * Handler invoked when the current video/animation completes (e.g. video `onEnded`).
   */
  const handleAnimationEnd = useCallback(() => {
    if (isIdleRef.current || !isPlayingRef.current) {
      // Do not advance if idle or paused
      return;
    }
    advanceNext();
  }, [advanceNext]);

  /**
   * Gracefully handle video playback errors (e.g. missing .webm file),
   * ensuring the sequencer never gets stuck.
   */
  const handleAnimationError = useCallback((error) => {
    console.warn(`[ISL Sequencer] Playback error on "${currentItemRef.current?.token}":`, error);
    // Automatically skip forward so the user isn't stuck on a broken frame
    advanceNext();
  }, [advanceNext]);

  /**
   * Clears the entire queue and immediately returns to the neutral IDLE state.
   */
  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentItem(IDLE_ASSET);
    setIsIdle(true);
    if (onSequenceCompleteRef.current) {
      onSequenceCompleteRef.current();
    }
  }, []);

  /**
   * Skips the current playing sign immediately.
   */
  const skipCurrent = useCallback(() => {
    advanceNext();
  }, [advanceNext]);

  /**
   * Toggle Pause / Play
   */
  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  return {
    queue,
    currentItem,
    isIdle,
    isPlaying,
    history,
    playbackRate,
    setPlaybackRate,
    enqueueTokens,
    handleAnimationEnd,
    handleAnimationError,
    advanceNext,
    skipCurrent,
    clearQueue,
    togglePlayPause,
    setIsPlaying
  };
}
