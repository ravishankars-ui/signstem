import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Hook for capturing video stream via Webcam (getUserMedia) or Screen/Tab (getDisplayMedia).
 * Features 16:9 Wide-Angle High-Definition camera constraints for full hand visibility.
 */
export function useScreenCapture() {
  const [stream, setStream] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [sourceType, setSourceType] = useState(null); // 'camera' | 'screen' | null
  const [error, setError] = useState(null);
  const streamRef = useRef(null);

  const stopCapture = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.debug('Error stopping track:', e);
        }
      });
      streamRef.current = null;
    }
    setStream(null);
    setIsCapturing(false);
    setSourceType(null);
  }, []);

  const startCapture = useCallback(async (type = 'camera') => {
    try {
      setError(null);

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      let mediaStream = null;

      if (type === 'screen') {
        if (!navigator.mediaDevices?.getDisplayMedia) {
          throw new Error('Screen capture is not supported in this browser.');
        }
        mediaStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always',
            width: { ideal: 1920, max: 2560 },
            height: { ideal: 1080, max: 1440 },
            frameRate: { ideal: 60, max: 60 }
          },
          audio: false,
        });
      } else {
        // Resilient HD camera request with automatic fallback
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Camera access is not supported in this browser.');
        }
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user',
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: { ideal: 30 }
            },
            audio: false,
          });
        } catch (constraintErr) {
          console.warn('[useScreenCapture] HD constraints rejected, trying basic camera:', constraintErr);
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      }

      if (!mediaStream || mediaStream.getVideoTracks().length === 0) {
        throw new Error('No video track available from the selected device.');
      }

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setIsCapturing(true);
      setSourceType(type);

      const videoTrack = mediaStream.getVideoTracks()[0];
      videoTrack.onended = () => {
        setIsCapturing(false);
        setStream(null);
        setSourceType(null);
        streamRef.current = null;
      };
    } catch (err) {
      if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
        setError(err.message || 'Capture failed to start');
      } else if (err.name === 'NotAllowedError') {
        setError('Permission denied. Please grant camera/screen permission.');
      }
      setIsCapturing(false);
      setSourceType(null);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return {
    stream,
    isCapturing,
    sourceType,
    error,
    startCapture,
    stopCapture,
  };
}
