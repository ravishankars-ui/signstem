import { useState, useRef, useCallback, useEffect } from 'react';
import { classifyGesture } from '../utils/gestureClassifier';
import { calculateSignAccuracy } from '../utils/signScorer';
import { analyzeFacialCues } from '../utils/facialCueAnalyzer';

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],       // Index
  [5, 9], [9, 10], [10, 11], [11, 12],   // Middle
  [9, 13], [13, 14], [14, 15], [15, 16], // Ring
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20] // Pinky
];

/**
 * Draw 3D Hand Tracking Skeleton onto an overlay Canvas
 */
function renderHandSkeleton(canvas, video, multiHandLandmarks, isMirrored = false) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = video?.videoWidth || canvas.clientWidth || 640;
  const height = video?.videoHeight || canvas.clientHeight || 480;

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!multiHandLandmarks || multiHandLandmarks.length === 0) return;

  ctx.save();
  if (isMirrored) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }

  for (const landmarks of multiHandLandmarks) {
    if (!Array.isArray(landmarks) || landmarks.length < 21) continue;

    // 1. Draw connecting skeleton bones
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#10b981';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(16, 185, 129, 0.7)';
    ctx.shadowBlur = 8;

    for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
      const p1 = landmarks[startIdx];
      const p2 = landmarks[endIdx];
      if (!p1 || !p2) continue;

      ctx.beginPath();
      ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
      ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
      ctx.stroke();
    }

    // 2. Draw joint landmarks
    ctx.shadowBlur = 0;
    for (let i = 0; i < landmarks.length; i++) {
      const lm = landmarks[i];
      const x = lm.x * canvas.width;
      const y = lm.y * canvas.height;
      const isTip = i === 4 || i === 8 || i === 12 || i === 16 || i === 20;
      const isWrist = i === 0;

      ctx.beginPath();
      ctx.arc(x, y, isTip ? 6.5 : isWrist ? 6 : 4, 0, 2 * Math.PI);
      ctx.fillStyle = isTip ? '#6366f1' : isWrist ? '#f59e0b' : '#34d399';
      ctx.fill();

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Hook to run MediaPipe Hands on a video stream and classify ISL gestures in real-time.
 */
export function useSignRecognition({
  videoRef,
  canvasRef,
  stream,
  isMirrored = false,
  enabled = false,
  onSignRecognized,
  confidenceThreshold = 50,
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [lastSign, setLastSign] = useState(null);
  const [fps, setFps] = useState(0);
  const [handDetected, setHandDetected] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Idle');
  const [accuracyMetrics, setAccuracyMetrics] = useState({
    handShapeScore: 92,
    positionScore: 87,
    orientationScore: 94,
    movementScore: 81,
    overallScore: 89
  });
  const [facialCues, setFacialCues] = useState({
    eyebrowRaised: false,
    headMotion: 'STILL',
    grammarMarker: 'NEUTRAL',
    expressionIntensity: 85
  });

  const handsRef = useRef(null);
  const animFrameRef = useRef(null);
  const activeRef = useRef(false);
  const isProcessingFrameRef = useRef(false);
  const cooldownRef = useRef(false);
  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(Date.now());
  const onSignRef = useRef(onSignRecognized);
  onSignRef.current = onSignRecognized;

  // Helper to ensure MediaPipe Hands script is loaded
  const ensureMediaPipeLoaded = useCallback(() => {
    return new Promise((resolve) => {
      const getHandsClass = () => window.Hands || globalThis.Hands || self?.Hands;
      if (getHandsClass()) return resolve(getHandsClass());

      const loadScript = (src) => {
        return new Promise((res, rej) => {
          let s = document.querySelector(`script[src="${src}"]`);
          if (s) {
            if (getHandsClass()) return res(getHandsClass());
            s.addEventListener('load', () => res(getHandsClass()));
            s.addEventListener('error', rej);
            return;
          }
          s = document.createElement('script');
          s.src = src;
          s.onload = () => res(getHandsClass());
          s.onerror = rej;
          document.head.appendChild(s);
        });
      };

      // Try local vendor script first, then Chrome extension URL, then CDN
      const vendorUrl = (typeof chrome !== 'undefined' && chrome?.runtime?.getURL)
        ? chrome.runtime.getURL('vendor/hands.js')
        : '/vendor/hands.js';

      loadScript(vendorUrl)
        .catch(() => loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js'))
        .catch(() => loadScript('/vendor/hands.js'))
        .then(() => {
          resolve(getHandsClass() || null);
        });
    });
  }, []);

  // Initialize MediaPipe Hands instance once
  const initMediaPipe = useCallback(async () => {
    if (handsRef.current) return handsRef.current;

    try {
      const HandsClass = await ensureMediaPipeLoaded();
      if (!HandsClass) {
        throw new Error('MediaPipe Hands library failed to load.');
      }

      const getVendorBaseUrl = () => {
        if (typeof chrome !== 'undefined' && chrome?.runtime?.getURL) {
          try {
            return chrome.runtime.getURL('vendor/');
          } catch {}
        }
        return '/vendor/';
      };

      const vendorBase = getVendorBaseUrl();

      const hands = new HandsClass({
        locateFile: (file) => `${vendorBase}${file}`,
      });

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 0, // Lite model for instant startup & high FPS
        minDetectionConfidence: 0.4,
        minTrackingConfidence: 0.4,
      });

      hands.onResults((results) => {
        frameCountRef.current++;
        const now = Date.now();
        if (now - lastFpsTimeRef.current >= 1000) {
          setFps(frameCountRef.current);
          frameCountRef.current = 0;
          lastFpsTimeRef.current = now;
        }

        const landmarks = results.multiHandLandmarks;
        const hasHands = Array.isArray(landmarks) && landmarks.length > 0;
        setHandDetected(hasHands);

        // Draw skeleton onto canvas overlay
        if (canvasRef?.current) {
          renderHandSkeleton(canvasRef.current, videoRef?.current, landmarks, isMirrored);
        }

        if (!hasHands) {
          return;
        }

        // Calculate Sign Accuracy breakdown metrics
        const metrics = calculateSignAccuracy(landmarks[0]);
        setAccuracyMetrics(metrics);

        // Analyze Facial & Non-Manual Grammar Cues
        const cues = analyzeFacialCues(null, []);
        setFacialCues(cues);

        if (cooldownRef.current) return;

        const gesture = classifyGesture(landmarks);
        if (gesture) {
          cooldownRef.current = true;
          setLastSign({ ...gesture, accuracy: metrics });
          if (onSignRef.current) {
            onSignRef.current({ ...gesture, accuracy: metrics });
          }
          // 250ms cooldown for smooth continuous recognition
          setTimeout(() => {
            cooldownRef.current = false;
          }, 250);
        }
      });

      handsRef.current = hands;
      return hands;
    } catch (err) {
      console.error('[useSignRecognition] MediaPipe init error:', err);
      setStatusMessage('MediaPipe init failed: ' + err.message);
      return null;
    }
  }, [ensureMediaPipeLoaded, canvasRef, videoRef, isMirrored]);

  const stopDetection = useCallback(() => {
    activeRef.current = false;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (canvasRef?.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    isProcessingFrameRef.current = false;
    setIsRunning(false);
    setHandDetected(false);
    setFps(0);
    setStatusMessage('Stopped');
  }, [canvasRef]);

  const startDetection = useCallback(async () => {
    const video = videoRef?.current;
    if (!video) {
      setStatusMessage('Waiting for video viewfinder...');
      return;
    }

    setStatusMessage('Loading AI Vision model...');
    const hands = await initMediaPipe();
    if (!hands) {
      return;
    }

    activeRef.current = true;
    setIsRunning(true);
    setStatusMessage('Recognition active');

    const loop = async () => {
      if (!activeRef.current) return;

      const targetVideo = videoRef?.current;
      if (
        targetVideo &&
        targetVideo.readyState >= 2 &&
        !targetVideo.paused &&
        !targetVideo.ended &&
        targetVideo.videoWidth > 0 &&
        !isProcessingFrameRef.current
      ) {
        isProcessingFrameRef.current = true;
        try {
          if (handsRef.current) {
            await handsRef.current.send({ image: targetVideo });
          }
        } catch (e) {
          console.debug('[useSignRecognition] Frame send error:', e);
        } finally {
          isProcessingFrameRef.current = false;
        }
      }

      if (activeRef.current) {
        animFrameRef.current = requestAnimationFrame(loop);
      }
    };

    animFrameRef.current = requestAnimationFrame(loop);
  }, [videoRef, initMediaPipe]);

  useEffect(() => {
    if (enabled && stream) {
      startDetection();
    } else {
      stopDetection();
    }
    return () => stopDetection();
  }, [enabled, stream, startDetection, stopDetection]);

  return {
    isRunning,
    lastSign,
    fps,
    handDetected,
    accuracyMetrics,
    facialCues,
    statusMessage,
    stopDetection,
  };
}


