import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useScreenCapture } from '../hooks/useScreenCapture';
import { useSignRecognition } from '../hooks/useSignRecognition';

function postToContentScript(msg) {
  try {
    if (typeof chrome !== 'undefined' && chrome?.runtime) {
      chrome.runtime.sendMessage(msg);
    }
  } catch {}
}

export function LiveRecognitionPanel() {
  const { stream, isCapturing, sourceType, error, startCapture, stopCapture } = useScreenCapture();
  const [sourceMode, setSourceMode] = useState(null);
  const [recognizedHistory, setRecognizedHistory] = useState([]);
  const [autoSign, setAutoSign] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const previewRef = useRef(null);

  const handleSignRecognized = useCallback((sign) => {
    setRecognizedHistory(prev => [{ ...sign, time: Date.now() }, ...prev].slice(0, 30));
    if (autoSign) {
      postToContentScript({
        type: 'SIGN_RECOGNIZED',
        sign: sign.sign,
        label: sign.label,
        confidence: sign.confidence,
      });
    }
  }, [autoSign]);

  const {
    isRunning, lastSign, fps, handDetected,
    accuracyMetrics, statusMessage, stopDetection
  } = useSignRecognition({
    stream,
    enabled: isCapturing && sourceMode !== null,
    onSignRecognized: handleSignRecognized,
    confidenceThreshold: 50,
  });

  useEffect(() => {
    if (stream && previewRef.current) {
      previewRef.current.srcObject = stream;
      previewRef.current.play().catch(() => {});
    }
  }, [stream]);

  const handleStart = async (mode) => {
    setSourceMode(mode);
    setRecognizedHistory([]);
    await startCapture(mode);
  };

  const handleStop = () => {
    stopDetection();
    stopCapture();
    setSourceMode(null);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.headerIcon}>✦</span>
          <div>
            <h1 style={styles.headerTitle}>Live Recognition</h1>
            <p style={styles.headerSub}>MediaPipe Hands ISL Detector</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          {isRunning && (
            <span style={styles.fpsBadge}>{fps} fps</span>
          )}
          <div style={{
            ...styles.statusDot,
            background: handDetected ? '#22c55e' : '#64748b',
            boxShadow: handDetected ? '0 0 8px rgba(34,197,94,0.6)' : 'none',
          }} />
        </div>
      </div>

      {/* Source Selection or Preview */}
      {!isCapturing ? (
        <div style={styles.sourceSelect}>
          <div style={styles.sourceIcon}>📷</div>
          <p style={styles.sourceDesc}>Choose a video source for live sign recognition</p>

          <button onClick={() => handleStart('camera')} style={styles.sourceBtn}>
            <span style={styles.sourceBtnIcon}>📹</span>
            <div>
              <div style={styles.sourceBtnTitle}>Webcam</div>
              <div style={styles.sourceBtnSub}>Use your camera to recognize signs</div>
            </div>
          </button>

          <button onClick={() => handleStart('screen')} style={styles.sourceBtn}>
            <span style={styles.sourceBtnIcon}>🖥</span>
            <div>
              <div style={styles.sourceBtnTitle}>Screen Share</div>
              <div style={styles.sourceBtnSub}>Capture sign language from any video app</div>
            </div>
          </button>

          {error && (
            <div style={styles.errorBox}>{error}</div>
          )}
        </div>
      ) : (
        <div style={styles.previewArea}>
          {/* Video Preview */}
          <div style={styles.videoWrap}>
            <video
              ref={previewRef}
              autoPlay playsInline muted
              style={styles.video}
            />
            <div style={styles.liveBadge}>
              <div style={styles.liveDot} />
              <span>LIVE</span>
            </div>
            <div style={styles.handBadge}>
              {handDetected ? '✋ Hand Detected' : '🚫 No Hand'}
            </div>
          </div>

          {/* Status Bar */}
          <div style={styles.statusBar}>
            <span style={styles.statusText}>{statusMessage}</span>
            {isRunning && (
              <span style={styles.accuracyText}>
                Accuracy: {accuracyMetrics.overallScore}%
              </span>
            )}
          </div>

          {/* Controls */}
          <div style={styles.controls}>
            <button
              onClick={handleStop}
              style={styles.stopBtn}
            >
              Stop Capture
            </button>
          </div>

          {/* Auto-sign Toggle */}
          <div style={styles.toggleRow}>
            <label style={styles.toggleLabel}>
              <span>Auto-sign recognized gestures to avatar</span>
              <button
                onClick={() => setAutoSign(v => !v)}
                style={{
                  ...styles.toggle,
                  background: autoSign ? '#6366f1' : 'rgba(255,255,255,0.1)',
                }}
              >
                <div style={{
                  ...styles.toggleKnob,
                  transform: autoSign ? 'translateX(18px)' : 'translateX(0)',
                }} />
              </button>
            </label>
          </div>

          {/* Accuracy Breakdown */}
          {isRunning && (
            <div style={styles.metricsGrid}>
              <MetricBar label="Hand Shape" value={accuracyMetrics.handShapeScore} color="#6366f1" />
              <MetricBar label="Position" value={accuracyMetrics.positionScore} color="#8b5cf6" />
              <MetricBar label="Orientation" value={accuracyMetrics.orientationScore} color="#a78bfa" />
              <MetricBar label="Movement" value={accuracyMetrics.movementScore} color="#c4b5fd" />
            </div>
          )}

          {/* Latest Sign */}
          {lastSign && (
            <div style={styles.latestSign}>
              <p style={styles.latestTag}>Latest Sign</p>
              <h3 style={styles.latestLabel}>{lastSign.label}</h3>
              <p style={styles.latestMeta}>
                {lastSign.category} · {lastSign.confidence}% confidence
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recognized History */}
      {recognizedHistory.length > 0 && (
        <div style={styles.historySection}>
          <p style={styles.historyTitle}>
            Recognition History ({recognizedHistory.length})
          </p>
          <div style={styles.historyList}>
            {recognizedHistory.map((s, i) => (
              <div key={s.time + i} style={styles.historyItem}>
                <span style={styles.historyLabel}>{s.label}</span>
                <span style={styles.historyMeta}>
                  {s.confidence}% · {formatTime(s.time)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Supported Signs Guide */}
      <div style={styles.guideSection}>
        <button onClick={() => setShowGuide(v => !v)} style={styles.guideToggle}>
          <span>Supported Signs ({12} gestures)</span>
          <span style={{ transform: showGuide ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }}>▾</span>
        </button>
        {showGuide && (
          <div style={styles.guideList}>
            {SUPPORTED_SIGNS.map(s => (
              <div key={s.key} style={styles.guideItem}>
                <span style={styles.guideEmoji}>{s.emoji}</span>
                <div>
                  <span style={styles.guideName}>{s.label}</span>
                  <span style={styles.guideCat}>{s.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p style={styles.footer}>
        Recognized signs are sent to the SignSTEM avatar in real-time.
      </p>
    </div>
  );
}

function MetricBar({ label, value, color }) {
  return (
    <div style={styles.metricRow}>
      <span style={styles.metricLabel}>{label}</span>
      <div style={styles.metricTrack}>
        <div style={{ ...styles.metricFill, width: `${value}%`, background: color }} />
      </div>
      <span style={styles.metricValue}>{value}%</span>
    </div>
  );
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const SUPPORTED_SIGNS = [
  { key: 'HELLO', label: 'Hello (Open Palm)', category: 'Greeting', emoji: '✋' },
  { key: 'NAMASTE', label: 'Namaste', category: 'Greeting', emoji: '🙏' },
  { key: 'GOOD', label: 'Good (Thumbs Up)', category: 'Adjective', emoji: '👍' },
  { key: 'LOVE', label: 'Love (🤟)', category: 'Emotion', emoji: '🤟' },
  { key: 'OK', label: 'OK (👌)', category: 'Courtesy', emoji: '👌' },
  { key: 'ONE', label: 'One / Point', category: 'Number', emoji: '☝️' },
  { key: 'TWO', label: 'Two / Victory', category: 'Number', emoji: '✌️' },
  { key: 'THREE', label: 'Three / W', category: 'Number', emoji: ' three' },
  { key: 'FOUR', label: 'Four', category: 'Number', emoji: '🖐' },
  { key: 'LETTER_L', label: 'Letter L', category: 'Alphabet', emoji: 'L' },
  { key: 'LETTER_Y', label: 'Phone / Y', category: 'Alphabet', emoji: '🤙' },
  { key: 'GRAVITY', label: 'Gravity (Point Down)', category: 'Physics', emoji: '⬇️' },
];

const styles = {
  container: {
    width: '100%', height: '100vh', overflowY: 'auto',
    background: '#0a0c18', display: 'flex', flexDirection: 'column',
    fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
    padding: '12px', gap: '10px',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
  headerIcon: {
    fontSize: '18px', color: '#6366f1',
    filter: 'drop-shadow(0 0 6px rgba(99,102,241,0.5))',
  },
  headerTitle: { fontSize: '14px', fontWeight: 800, color: '#f8fafc', margin: 0 },
  headerSub: { fontSize: '9px', color: '#64748b', margin: 0 },
  headerRight: { display: 'flex', alignItems: 'center', gap: '6px' },
  fpsBadge: {
    padding: '2px 8px', borderRadius: 8,
    background: 'rgba(34,197,94,0.15)', color: '#6ee7b7',
    fontSize: '9px', fontWeight: 700,
  },
  statusDot: {
    width: '8px', height: '8px', borderRadius: '50%',
    transition: 'all 0.3s',
  },

  sourceSelect: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '12px',
    padding: '20px',
  },
  sourceIcon: { fontSize: '36px', opacity: 0.6 },
  sourceDesc: { fontSize: '11px', color: '#64748b', textAlign: 'center' },
  sourceBtn: {
    width: '100%', maxWidth: '280px', padding: '12px 16px',
    borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    color: '#f1f5f9', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '12px',
    textAlign: 'left', transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  sourceBtnIcon: { fontSize: '20px' },
  sourceBtnTitle: { fontSize: '12px', fontWeight: 700 },
  sourceBtnSub: { fontSize: '9px', color: '#64748b' },
  errorBox: {
    padding: '8px 12px', borderRadius: 10,
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
    color: '#fca5a5', fontSize: '10px',
  },

  previewArea: { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' },
  videoWrap: {
    position: 'relative', borderRadius: 14, overflow: 'hidden',
    background: '#000',
  },
  video: { width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' },
  liveBadge: {
    position: 'absolute', top: 8, left: 8,
    display: 'flex', alignItems: 'center', gap: '4px',
    padding: '3px 8px', borderRadius: 8,
    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
    fontSize: '8px', fontWeight: 700, color: '#fff',
  },
  liveDot: {
    width: '5px', height: '5px', borderRadius: '50%',
    background: '#ef4444', animation: 'pulse 1.5s infinite',
  },
  handBadge: {
    position: 'absolute', top: 8, right: 8,
    padding: '3px 8px', borderRadius: 8,
    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
    fontSize: '8px', fontWeight: 700, color: '#fff',
  },

  statusBar: {
    display: 'flex', justifyContent: 'space-between',
    padding: '4px 8px', borderRadius: 8,
    background: 'rgba(255,255,255,0.04)',
  },
  statusText: { fontSize: '9px', color: '#94a3b8' },
  accuracyText: { fontSize: '9px', color: '#6ee7b7', fontWeight: 600 },

  controls: { display: 'flex', gap: '6px' },
  stopBtn: {
    flex: 1, padding: '8px', borderRadius: 10, border: 'none',
    background: 'rgba(239,68,68,0.15)', color: '#fca5a5',
    fontSize: '11px', fontWeight: 700, cursor: 'pointer',
    fontFamily: 'inherit',
  },

  toggleRow: { padding: '4px 0' },
  toggleLabel: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    fontSize: '10px', color: '#94a3b8', cursor: 'pointer',
  },
  toggle: {
    width: '38px', height: '20px', borderRadius: 10,
    border: 'none', cursor: 'pointer', position: 'relative',
    transition: 'background 0.2s',
  },
  toggleKnob: {
    width: '16px', height: '16px', borderRadius: '50%',
    background: '#fff', position: 'absolute', top: '2px', left: '2px',
    transition: 'transform 0.2s',
  },

  metricsGrid: { display: 'flex', flexDirection: 'column', gap: '4px' },
  metricRow: { display: 'flex', alignItems: 'center', gap: '6px' },
  metricLabel: { fontSize: '9px', color: '#94a3b8', width: '70px', flexShrink: 0 },
  metricTrack: {
    flex: 1, height: '4px', borderRadius: 2,
    background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
  },
  metricFill: { height: '100%', borderRadius: 2, transition: 'width 0.3s' },
  metricValue: { fontSize: '9px', color: '#a5b4fc', fontWeight: 600, width: '30px', textAlign: 'right' },

  latestSign: {
    padding: '12px', borderRadius: 14,
    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
    textAlign: 'center',
  },
  latestTag: { fontSize: '9px', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 },
  latestLabel: { fontSize: '18px', fontWeight: 800, color: '#f8fafc', margin: '4px 0 2px' },
  latestMeta: { fontSize: '9px', color: '#94a3b8', margin: 0 },

  historySection: { borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' },
  historyTitle: { fontSize: '9px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px' },
  historyList: { display: 'flex', flexDirection: 'column', gap: '3px' },
  historyItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '5px 8px', borderRadius: 8,
    background: 'rgba(255,255,255,0.03)',
  },
  historyLabel: { fontSize: '10px', fontWeight: 600, color: '#e2e8f0' },
  historyMeta: { fontSize: '8px', color: '#64748b' },

  guideSection: { borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' },
  guideToggle: {
    width: '100%', padding: '6px 8px', borderRadius: 8, border: 'none',
    background: 'rgba(255,255,255,0.04)',
    color: '#94a3b8', fontSize: '10px', fontWeight: 600,
    cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', fontFamily: 'inherit',
  },
  guideList: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '6px' },
  guideItem: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '4px 6px', borderRadius: 6,
    background: 'rgba(255,255,255,0.03)',
  },
  guideEmoji: { fontSize: '12px' },
  guideName: { fontSize: '9px', fontWeight: 600, color: '#e2e8f0' },
  guideCat: { fontSize: '8px', color: '#64748b', marginLeft: '4px' },

  footer: { fontSize: '9px', color: '#475569', textAlign: 'center', padding: '8px 0' },
};
