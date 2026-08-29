import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useScreenCapture } from '../hooks/useScreenCapture';
import { useSignRecognition } from '../hooks/useSignRecognition';

const extensionApi = globalThis.chrome?.storage ? globalThis.chrome : null;

function postToContentScript(msg) {
  try {
    if (typeof chrome !== 'undefined' && chrome?.runtime) {
      chrome.runtime.sendMessage(msg);
    }
  } catch {}
}

const EXTENDED_GESTURES = [
  // Numbers 0 to 10, 20
  { key: 'ZERO', label: 'Number 0 (Zero)', category: 'Numbers', emoji: '0️⃣', desc: 'All fingertips curved inward to touch thumb forming an O' },
  { key: 'ONE', label: 'Number 1 / Point', category: 'Numbers', emoji: '1️⃣', desc: 'Single index finger extended straight upright' },
  { key: 'TWO', label: 'Number 2 / Peace (V)', category: 'Numbers', emoji: '2️⃣', desc: 'Index and middle fingers extended in a V shape' },
  { key: 'THREE', label: 'Number 3 / W', category: 'Numbers', emoji: '3️⃣', desc: 'Index, middle, and ring fingers extended upright' },
  { key: 'FOUR', label: 'Number 4', category: 'Numbers', emoji: '4️⃣', desc: 'Four fingers upright with thumb tucked in across palm' },
  { key: 'HELLO', label: 'Number 5 / Open Palm', category: 'Numbers', emoji: '5️⃣', desc: 'All 5 fingers fully extended and spread' },
  { key: 'SIX', label: 'Number 6', category: 'Numbers', emoji: '6️⃣', desc: 'Thumb touching pinky tip with remaining 3 fingers upright' },
  { key: 'SEVEN', label: 'Number 7', category: 'Numbers', emoji: '7️⃣', desc: 'Thumb touching ring tip with remaining 3 fingers upright' },
  { key: 'EIGHT', label: 'Number 8', category: 'Numbers', emoji: '8️⃣', desc: 'Thumb touching middle tip with remaining 3 fingers upright' },
  { key: 'NINE', label: 'Number 9', category: 'Numbers', emoji: '9️⃣', desc: 'Thumb touching index tip with remaining 3 fingers upright' },
  { key: 'TEN', label: 'Number 10 / 20', category: 'Numbers', emoji: '🔟', desc: 'Both hands open with all 10 fingers extended' },

  // Alphabet ISL Fingerspelling (A to Z)
  { key: 'LETTER_A', label: 'Letter A', category: 'Alphabet', emoji: '🅰️', desc: 'Closed fist with thumb extended vertically alongside index finger' },
  { key: 'LETTER_B', label: 'Letter B', category: 'Alphabet', emoji: '🅱️', desc: '4 fingers flat together straight up, thumb tucked across palm' },
  { key: 'LETTER_C', label: 'Letter C', category: 'Alphabet', emoji: '©️', desc: 'All fingers curved in a smooth C-shaped arc' },
  { key: 'LETTER_D', label: 'Letter D', category: 'Alphabet', emoji: '🇩', desc: 'Index finger straight up, other fingers forming an O loop with thumb' },
  { key: 'LETTER_E', label: 'Letter E', category: 'Alphabet', emoji: '🇪', desc: 'All 4 fingertips curled tight resting on thumb pad' },
  { key: 'LETTER_F', label: 'Letter F (👌)', category: 'Alphabet', emoji: '🇫', desc: 'Index and thumb forming a circle, middle, ring, pinky extended' },
  { key: 'LETTER_G', label: 'Letter G', category: 'Alphabet', emoji: '🇬', desc: 'Index finger pointing horizontally forward with thumb parallel' },
  { key: 'LETTER_H', label: 'Letter H', category: 'Alphabet', emoji: '🇭', desc: 'Index and middle fingers extended horizontally together' },
  { key: 'LETTER_I', label: 'Letter I', category: 'Alphabet', emoji: 'ℹ️', desc: 'Pinky finger extended straight upright, other fingers folded' },
  { key: 'LETTER_K', label: 'Letter K', category: 'Alphabet', emoji: '🇰', desc: 'Index upright, middle forward, thumb resting between them' },
  { key: 'LETTER_L', label: 'Letter L', category: 'Alphabet', emoji: '🇱', desc: 'Thumb and index extended at a right 90° angle' },
  { key: 'LETTER_P', label: 'Letter P', category: 'Alphabet', emoji: '🇵', desc: 'Downward angled K shape with index pointing down' },
  { key: 'LETTER_R', label: 'Letter R', category: 'Alphabet', emoji: '🤞', desc: 'Index and middle fingers crossed over each other' },
  { key: 'LETTER_U', label: 'Letter U', category: 'Alphabet', emoji: '🇺', desc: 'Index and middle fingers held close together upright' },
  { key: 'TWO', label: 'Letter V', category: 'Alphabet', emoji: '✌️', desc: 'Index and middle fingers extended apart in a V shape' },
  { key: 'THREE', label: 'Letter W', category: 'Alphabet', emoji: '🖖', desc: 'Index, middle, and ring fingers spread apart in a W shape' },
  { key: 'LETTER_X', label: 'Letter X', category: 'Alphabet', emoji: '❌', desc: 'Index finger hooked/curled with remaining fingers in fist' },
  { key: 'LETTER_Y', label: 'Letter Y', category: 'Alphabet', emoji: '🤙', desc: 'Thumb and pinky extended with middle 3 fingers curled' },
  { key: 'YES', label: 'Letter S / Fist', category: 'Alphabet', emoji: '✊', desc: 'Tight closed fist with thumb wrapped across front of fingers' },

  // Greetings & Core Expressions
  { key: 'NAMASTE', label: 'Namaste', category: 'Greetings', emoji: '🙏', desc: 'Both palms pressed flat together at chest center' },
  { key: 'GOOD', label: 'Good / Super (👍)', category: 'Courtesy', emoji: '👍', desc: 'Closed fist with thumb upright and firm' },
  { key: 'BAD', label: 'Bad / Down (👎)', category: 'Courtesy', emoji: '👎', desc: 'Closed fist with thumb pointing down below wrist' },
  { key: 'OK', label: 'OK / Perfect (👌)', category: 'Courtesy', emoji: '👌', desc: 'Thumb and index forming an O with remaining fingers raised' },
  { key: 'HELP', label: 'Help / Support', category: 'Courtesy', emoji: '🤝', desc: 'One flat hand supporting the other' },
  { key: 'LOVE', label: 'Love (🤟 ILY)', category: 'Emotion', emoji: '🤟', desc: 'Thumb, index, and pinky extended with middle/ring folded' },
  { key: 'ROCK', label: 'Rock (🤘)', category: 'Expression', emoji: '🤘', desc: 'Index and pinky extended with thumb folded' },

  // STEM & Sciences
  { key: 'GRAVITY', label: 'Gravity (Down Force)', category: 'Physics & STEM', emoji: '⬇️', desc: 'Index pointing directly downwards representing gravity' },
  { key: 'EQUAL', label: 'Equal Sign (=)', category: 'Mathematics', emoji: '🟰', desc: 'Both index fingers held horizontal and parallel' },
  { key: 'ADD', label: 'Addition / Plus (+)', category: 'Mathematics', emoji: '➕', desc: 'Crossed index fingers forming a plus math sign' },
  { key: 'CODE', label: 'Computer Code', category: 'Computer Sci', emoji: '💻', desc: 'Both hands typing in programming posture' },
  { key: 'DATA', label: 'Data & Network', category: 'Computer Sci', emoji: '🌐', desc: 'Fingertips of both hands touching together' },
  { key: 'ATOM', label: 'Atom & Molecule', category: 'Physics & STEM', emoji: '⚛️', desc: 'Curved finger arc forming orbital ring' },
];

export function LiveRecognitionPanel() {
  const { stream, isCapturing, sourceType, error, startCapture, stopCapture } = useScreenCapture();
  const [sourceMode, setSourceMode] = useState(null);
  const [recognizedHistory, setRecognizedHistory] = useState([]);
  const [autoSign, setAutoSign] = useState(true);
  const [activeTab, setActiveTab] = useState('studio'); // 'studio' | 'dictionary' | 'history' | 'settings'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isMirrored, setIsMirrored] = useState(true);
  const [showHUDTarget, setShowHUDTarget] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(50);
  const [copyNotice, setCopyNotice] = useState('');
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [themeMode, setThemeMode] = useState(() => {
    try {
      const saved = localStorage.getItem('isl_theme_mode');
      if (saved) return saved;
    } catch {}
    return 'light'; // Default to luxury Ivory White
  });

  const isLightMode = themeMode === 'light' || themeMode === 'ivory';
  const previewRef = useRef(null);
  const canvasRef = useRef(null);

  // Sync theme class to document
  useEffect(() => {
    const rootEl = document.documentElement;
    const bodyEl = document.body;
    if (isLightMode) {
      rootEl.classList.add('theme-light', 'theme-ivory');
      bodyEl.classList.add('theme-light', 'theme-ivory');
    } else {
      rootEl.classList.remove('theme-light', 'theme-ivory');
      bodyEl.classList.remove('theme-light', 'theme-ivory');
    }
    try {
      localStorage.setItem('isl_theme_mode', themeMode);
      if (extensionApi?.storage?.sync) {
        extensionApi.storage.sync.set({ themeMode });
      }
    } catch {}
  }, [themeMode, isLightMode]);

  const toggleTheme = () => {
    setThemeMode(prev => (prev === 'light' || prev === 'ivory' ? 'dark' : 'light'));
  };

  // Session duration timer
  useEffect(() => {
    let timer = null;
    if (isCapturing) {
      setSessionStartTime(Date.now());
      timer = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
      setSessionStartTime(null);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isCapturing]);

  const handleSignRecognized = useCallback((sign) => {
    if (!sign || !sign.label) return;
    setRecognizedHistory(prev => [{ ...sign, time: Date.now(), id: Math.random().toString(36).substr(2, 9) }, ...prev].slice(0, 50));
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
    videoRef: previewRef,
    canvasRef,
    stream,
    isMirrored,
    enabled: isCapturing && sourceMode !== null,
    onSignRecognized: handleSignRecognized,
    confidenceThreshold,
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

  const copyToClipboard = (text, msg = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text);
    setCopyNotice(msg);
    setTimeout(() => setCopyNotice(''), 2500);
  };

  const syncSignToAvatar = (signKey) => {
    postToContentScript({
      type: 'PLAY_ISL_SEQUENCE',
      tokens: [signKey],
      mode: 'replace',
    });
    setCopyNotice(`Sent "${signKey}" to avatar!`);
    setTimeout(() => setCopyNotice(''), 2500);
  };

  const filteredGestures = EXTENDED_GESTURES.filter(g => {
    const matchesSearch = g.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          g.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          g.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || g.category.toUpperCase().includes(selectedCategory.toUpperCase());
    return matchesSearch && matchesCat;
  });

  const categories = ['ALL', 'GREETINGS', 'PHYSICS & STEM', 'MATHEMATICS', 'COMPUTER SCI', 'NUMBERS', 'ALPHABET'];

  const formatSessionDuration = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const S = getStyles(isLightMode);

  return (
    <div style={S.container}>
      {/* ─── Top Studio Header & AI Engine Status ─────────── */}
      <header style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.aiLogo}>✦</div>
          <div>
            <div style={S.headerTitleRow}>
              <h1 style={S.headerTitle}>SignSTEM Live Vision AI</h1>
              <span style={S.engineVersionBadge}>v2.0 Neural</span>
            </div>
            <p style={S.headerSub}>MediaPipe Hands · 3D Kinematics Studio</p>
          </div>
        </div>

        <div style={S.headerRight}>
          {isRunning && (
            <div style={S.fpsPill}>
              <span style={S.fpsPillDot} />
              <span>{fps} FPS</span>
            </div>
          )}

          <div
            style={{
              ...S.statusPill,
              borderColor: handDetected ? 'rgba(16,185,129,0.5)' : isLightMode ? 'rgba(215,203,185,0.7)' : 'rgba(255,255,255,0.1)',
              background: handDetected ? (isLightMode ? '#ecfdf5' : 'rgba(16,185,129,0.15)') : 'transparent',
              color: handDetected ? '#059669' : (isLightMode ? '#78716c' : '#94a3b8')
            }}
            title={handDetected ? 'Hand Tracked in Real-Time' : 'Searching for Hand...'}
          >
            <span>{handDetected ? '✋ Hand Tracked' : '● Standby'}</span>
          </div>

          <button
            onClick={toggleTheme}
            style={S.themeBtn}
            title={isLightMode ? 'Switch to Dark Mode' : 'Switch to Ivory White'}
          >
            {isLightMode ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      {/* ─── Navigation Tabs Bar ────────────────────────────── */}
      <nav style={S.tabsNav}>
        <button
          onClick={() => setActiveTab('studio')}
          style={{ ...S.tabBtn, ...(activeTab === 'studio' ? S.tabBtnActive : {}) }}
        >
          <span>📹 Vision Studio</span>
        </button>
        <button
          onClick={() => setActiveTab('dictionary')}
          style={{ ...S.tabBtn, ...(activeTab === 'dictionary' ? S.tabBtnActive : {}) }}
        >
          <span>📖 Gesture Guide</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{ ...S.tabBtn, ...(activeTab === 'history' ? S.tabBtnActive : {}) }}
        >
          <span>📜 History {recognizedHistory.length > 0 && `(${recognizedHistory.length})`}</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          style={{ ...S.tabBtn, ...(activeTab === 'settings' ? S.tabBtnActive : {}) }}
        >
          <span>⚙️ Calibration</span>
        </button>
      </nav>

      {/* Toast Notice */}
      {copyNotice && <div style={S.toast}>{copyNotice}</div>}

      {/* ─── TAB 1: VISION STUDIO (MAIN CAMERA / HUD) ──────── */}
      {activeTab === 'studio' && (
        <div style={S.studioContent}>
          {!isCapturing ? (
            /* ─── Pre-Capture Launch Deck ─── */
            <div style={S.preCaptureWrap}>
              <div style={S.heroBanner}>
                <div style={S.heroTag}>REAL-TIME ISL INTERPRETER</div>
                <h2 style={S.heroHeading}>Professional Computer Vision Studio</h2>
                <p style={S.heroDescription}>
                  Capture hands directly from your webcam or live screen shares. Detected signs are classified with sub-20ms latency and synchronized to the 3D SignSTEM avatar.
                </p>
              </div>

              {/* Source Cards Grid */}
              <div style={S.sourceGrid}>
                {/* 1. Webcam Studio Card */}
                <div style={S.sourceCard}>
                  <div style={S.sourceCardHeader}>
                    <div style={{ ...S.sourceCardIcon, background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}>
                      📹
                    </div>
                    <div>
                      <div style={S.sourceCardTitle}>Webcam Vision Studio</div>
                      <div style={S.sourceCardBadge}>HD 60FPS Hand Tracking</div>
                    </div>
                  </div>
                  <p style={S.sourceCardBody}>
                    Analyze your own hand gestures in real-time with 21 articulated 3D hand joints and posture evaluation.
                  </p>
                  <button onClick={() => handleStart('camera')} style={S.sourceCardLaunchBtn}>
                    <span>Launch Webcam Studio</span>
                    <span>→</span>
                  </button>
                </div>

                {/* 2. Screen Share Capture Card */}
                <div style={S.sourceCard}>
                  <div style={S.sourceCardHeader}>
                    <div style={{ ...S.sourceCardIcon, background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                      🖥️
                    </div>
                    <div>
                      <div style={S.sourceCardTitle}>Screen / Stream Capture</div>
                      <div style={S.sourceCardBadge}>Zoom · Meet · YouTube</div>
                    </div>
                  </div>
                  <p style={S.sourceCardBody}>
                    Interpret sign language from video calls, recorded webinars, or online classes with live avatar translation.
                  </p>
                  <button onClick={() => handleStart('screen')} style={{ ...S.sourceCardLaunchBtn, ...S.screenBtn }}>
                    <span>Capture Screen Stream</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              {error && <div style={S.errorBox}>⚠️ {error}</div>}

              {/* ─── Pre-Capture Interactive Gesture Guide ─── */}
              <div style={{ ...S.dictionaryWrap, marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: isLightMode ? '#1e1b18' : '#ffffff', letterSpacing: '-0.02em' }}>
                    📖 Interactive Gesture Guide & Practice Concepts
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: isLightMode ? '#78716c' : '#94a3b8' }}>
                    {filteredGestures.length} signs · Click to Sign in 3D
                  </span>
                </div>

                {/* Search & Category Filter */}
                <div style={S.searchHeader}>
                  <input
                    type="text"
                    placeholder="Search sign concepts (e.g. Gravity, Atom, Namaste, A-Z)..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={S.searchInput}
                  />
                </div>

                {/* Category Filter Chips */}
                <div style={S.categoryPills}>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      style={{ ...S.categoryPill, ...(selectedCategory === cat ? S.categoryPillActive : {}) }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Gestures Grid */}
                <div style={S.gesturesGrid}>
                  {filteredGestures.map(g => (
                    <div key={g.key} style={S.gestureCard}>
                      <div style={S.gestureCardTop}>
                        <span style={S.gestureEmoji}>{g.emoji}</span>
                        <span style={S.gestureCategory}>{g.category}</span>
                      </div>
                      <h4 style={S.gestureTitle}>{g.label}</h4>
                      <p style={S.gestureDesc}>{g.desc}</p>
                      <div style={S.gestureCardActions}>
                        <button onClick={() => syncSignToAvatar(g.key)} style={S.gestureSyncBtn}>
                          <span>Sign in 3D</span>
                          <span>↗</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ─── Active Camera HUD & Real-Time Telemetry ─── */
            <div style={S.activeCaptureWrap}>
              {/* Pro Cyber Viewfinder with HUD Overlay */}
              <div style={S.viewfinderContainer}>
                <video
                  ref={previewRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    ...S.videoFeed,
                    transform: isMirrored ? 'scaleX(-1)' : 'none'
                  }}
                />

                {/* Real-Time Hand Tracking Skeleton Canvas Overlay */}
                <canvas
                  ref={canvasRef}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 6,
                    objectFit: 'cover'
                  }}
                />

                {/* HUD Corner Brackets */}
                {showHUDTarget && (
                  <div style={S.hudBrackets}>
                    <div style={{ ...S.hudCorner, top: 12, left: 12, borderTop: '2px solid #4f46e5', borderLeft: '2px solid #4f46e5' }} />
                    <div style={{ ...S.hudCorner, top: 12, right: 12, borderTop: '2px solid #4f46e5', borderRight: '2px solid #4f46e5' }} />
                    <div style={{ ...S.hudCorner, bottom: 12, left: 12, borderBottom: '2px solid #4f46e5', borderLeft: '2px solid #4f46e5' }} />
                    <div style={{ ...S.hudCorner, bottom: 12, right: 12, borderBottom: '2px solid #4f46e5', borderRight: '2px solid #4f46e5' }} />
                    <div style={S.hudCenterTarget} />
                  </div>
                )}

                {/* Top Viewfinder Badges */}
                <div style={S.viewfinderTopBadges}>
                  <div style={S.liveFeedBadge}>
                    <span style={S.recDot} />
                    <span>REC · LIVE FEED</span>
                  </div>
                  <div style={S.feedInfoBadge}>
                    <span>⏱ {formatSessionDuration(elapsedSeconds)}</span>
                    <span>·</span>
                    <span>{sourceType === 'camera' ? 'Webcam 720p' : 'Screen Stream'}</span>
                  </div>
                </div>

                {/* Live Real-Time Detected Sign Pill Badge Over Video */}
                {lastSign && (
                  <div style={{
                    position: 'absolute',
                    bottom: 56,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(79, 70, 229, 0.95)',
                    backdropFilter: 'blur(12px)',
                    color: '#ffffff',
                    padding: '8px 22px',
                    borderRadius: 30,
                    boxShadow: '0 8px 28px rgba(79, 70, 229, 0.45), 0 0 0 1px rgba(255,255,255,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    zIndex: 10,
                    fontWeight: 800,
                    fontSize: '13px',
                    pointerEvents: 'none'
                  }}>
                    <span style={{ fontSize: '18px' }}>{lastSign.category === 'Greeting' ? '🙏' : lastSign.sign === 'GOOD' ? '👍' : '✨'}</span>
                    <span>{lastSign.label}</span>
                    <span style={{
                      background: 'rgba(255,255,255,0.22)',
                      padding: '2px 8px',
                      borderRadius: 10,
                      fontSize: '10px',
                      fontWeight: 700
                    }}>{lastSign.confidence}%</span>
                  </div>
                )}

                {/* Bottom Viewfinder Quick Action Bar */}
                <div style={S.viewfinderControls}>
                  <button
                    onClick={() => setIsMirrored(v => !v)}
                    style={S.viewfinderActionBtn}
                    title={isMirrored ? 'Disable Mirror' : 'Enable Mirror'}
                  >
                    🪞 {isMirrored ? 'Mirrored' : 'Normal'}
                  </button>
                  <button
                    onClick={() => setShowHUDTarget(v => !v)}
                    style={S.viewfinderActionBtn}
                    title="Toggle HUD Brackets"
                  >
                    🎯 {showHUDTarget ? 'HUD On' : 'HUD Off'}
                  </button>
                  <button onClick={handleStop} style={S.stopCaptureBtn}>
                    ⏹ Stop Capture
                  </button>
                </div>
              </div>

              {/* ─── Real-Time Recognition Hero Card ─── */}
              <div style={S.telemetryCard}>
                <div style={S.telemetryHeader}>
                  <span style={S.telemetryTag}>LIVE GESTURE RECOGNITION</span>
                  <span style={S.telemetryStatus}>{statusMessage}</span>
                </div>

                {lastSign ? (
                  <div style={S.lastSignContainer}>
                    <div style={S.lastSignRow}>
                      <div>
                        <div style={S.lastSignCategoryBadge}>{lastSign.category || 'ISL Concept'}</div>
                        <h3 style={S.lastSignHeading}>{lastSign.label}</h3>
                      </div>
                      <div style={S.confidenceGauge}>
                        <span style={S.confidenceNumber}>{lastSign.confidence}%</span>
                        <span style={S.confidenceLabel}>Confidence</span>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div style={S.lastSignActions}>
                      <button onClick={() => syncSignToAvatar(lastSign.sign || lastSign.label)} style={S.syncActionBtn}>
                        ⇄ Send to 3D Avatar
                      </button>
                      <button onClick={() => copyToClipboard(lastSign.label, `Copied "${lastSign.label}"`)} style={S.copyActionBtn}>
                        📋 Copy Text
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={S.waitingPlaceholder}>
                    <span style={S.waitingIcon}>✋</span>
                    <span style={S.waitingText}>
                      {handDetected ? 'Analyzing hand gesture trajectory...' : 'Position hand inside target zone to begin recognizing'}
                    </span>
                  </div>
                )}
              </div>

              {/* ─── Vision Studio Interactive Gesture Guide ─── */}
              <div style={{ ...S.dictionaryWrap, marginTop: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: isLightMode ? '#1e1b18' : '#ffffff', letterSpacing: '-0.02em' }}>
                    📖 Interactive Gesture Guide & Practice Concepts
                  </span>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: isLightMode ? '#78716c' : '#94a3b8' }}>
                    {filteredGestures.length} signs · Click to Sign in 3D
                  </span>
                </div>

                {/* Search & Category Filter */}
                <div style={S.searchHeader}>
                  <input
                    type="text"
                    placeholder="Search sign concepts (e.g. Gravity, Atom, Namaste, A-Z)..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={S.searchInput}
                  />
                </div>

                {/* Category Filter Chips */}
                <div style={S.categoryPills}>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      style={{ ...S.categoryPill, ...(selectedCategory === cat ? S.categoryPillActive : {}) }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Gestures Grid */}
                <div style={S.gesturesGrid}>
                  {filteredGestures.map(g => (
                    <div key={g.key} style={S.gestureCard}>
                      <div style={S.gestureCardTop}>
                        <span style={S.gestureEmoji}>{g.emoji}</span>
                        <span style={S.gestureCategory}>{g.category}</span>
                      </div>
                      <h4 style={S.gestureTitle}>{g.label}</h4>
                      <p style={S.gestureDesc}>{g.desc}</p>
                      <div style={S.gestureCardActions}>
                        <button onClick={() => syncSignToAvatar(g.key)} style={S.gestureSyncBtn}>
                          <span>Sign in 3D</span>
                          <span>↗</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: GESTURE DICTIONARY & GUIDE ─────────────── */}
      {activeTab === 'dictionary' && (
        <div style={S.dictionaryWrap}>
          {/* Search & Category Filter */}
          <div style={S.searchHeader}>
            <input
              type="text"
              placeholder="Search sign concepts (e.g. Gravity, Atom, Namaste)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={S.searchInput}
            />
          </div>

          {/* Category Filter Chips */}
          <div style={S.categoryPills}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{ ...S.categoryPill, ...(selectedCategory === cat ? S.categoryPillActive : {}) }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Gestures Grid */}
          <div style={S.gesturesGrid}>
            {filteredGestures.map(g => (
              <div key={g.key} style={S.gestureCard}>
                <div style={S.gestureCardTop}>
                  <span style={S.gestureEmoji}>{g.emoji}</span>
                  <span style={S.gestureCategory}>{g.category}</span>
                </div>
                <h4 style={S.gestureTitle}>{g.label}</h4>
                <p style={S.gestureDesc}>{g.desc}</p>
                <div style={S.gestureCardActions}>
                  <button onClick={() => syncSignToAvatar(g.key)} style={S.gestureSyncBtn}>
                    <span>Sign in 3D</span>
                    <span>↗</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 3: RECOGNITION HISTORY & STATS ─────────────── */}
      {activeTab === 'history' && (
        <div style={S.historyWrap}>
          {/* Stats Bar */}
          <div style={S.statsBar}>
            <div style={S.statBox}>
              <span style={S.statVal}>{recognizedHistory.length}</span>
              <span style={S.statLabel}>Total Gestures</span>
            </div>
            <div style={S.statBox}>
              <span style={S.statVal}>
                {recognizedHistory.length > 0
                  ? Math.round(recognizedHistory.reduce((a, b) => a + (b.confidence || 85), 0) / recognizedHistory.length)
                  : 0}%
              </span>
              <span style={S.statLabel}>Avg Accuracy</span>
            </div>
            <div style={S.statBox}>
              <span style={S.statVal}>{formatSessionDuration(elapsedSeconds)}</span>
              <span style={S.statLabel}>Active Time</span>
            </div>
          </div>

          {/* History Timeline */}
          {recognizedHistory.length === 0 ? (
            <div style={S.emptyState}>
              <span style={S.emptyStateIcon}>📜</span>
              <p style={S.emptyStateTitle}>No gestures recorded yet</p>
              <p style={S.emptyStateSubtitle}>Launch the Webcam or Screen capture studio and start signing to record live telemetry.</p>
            </div>
          ) : (
            <div style={S.historyList}>
              {recognizedHistory.map((item, idx) => (
                <div key={item.id || idx} style={S.historyCard}>
                  <div style={S.historyCardLeft}>
                    <span style={S.historyIndex}>#{recognizedHistory.length - idx}</span>
                    <div>
                      <div style={S.historySignTitle}>{item.label || item.sign}</div>
                      <div style={S.historySignTime}>{new Date(item.time).toLocaleTimeString()}</div>
                    </div>
                  </div>
                  <div style={S.historyCardRight}>
                    <span style={S.historyConfBadge}>{item.confidence || 90}% Match</span>
                    <button onClick={() => syncSignToAvatar(item.sign || item.label)} style={S.historyReplayBtn} title="Replay in 3D">
                      Replay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 4: CALIBRATION & SENSOR SETTINGS ──────────── */}
      {activeTab === 'settings' && (
        <div style={S.settingsWrap}>
          <div style={S.settingSection}>
            <h4 style={S.settingSectionTitle}>Computer Vision Calibration</h4>

            {/* Confidence Threshold */}
            <div style={S.settingRow}>
              <div>
                <div style={S.settingLabel}>Recognition Confidence Threshold</div>
                <div style={S.settingSub}>Filters out ambiguous or partial gestures</div>
              </div>
              <div style={S.sliderWrap}>
                <input
                  type="range"
                  min="30"
                  max="90"
                  value={confidenceThreshold}
                  onChange={e => setConfidenceThreshold(Number(e.target.value))}
                  style={S.rangeSlider}
                />
                <span style={S.sliderValue}>{confidenceThreshold}%</span>
              </div>
            </div>

            {/* Auto-Sign Toggle */}
            <div style={S.settingRow}>
              <div>
                <div style={S.settingLabel}>Auto-Sign to 3D Avatar</div>
                <div style={S.settingSub}>Instantly drives companion avatar gestures upon detection</div>
              </div>
              <button
                onClick={() => setAutoSign(v => !v)}
                style={{
                  ...S.toggleBtn,
                  background: autoSign ? '#4f46e5' : isLightMode ? '#e8e2d8' : 'rgba(255,255,255,0.1)'
                }}
              >
                <div style={{ ...S.toggleKnob, transform: autoSign ? 'translateX(18px)' : 'translateX(0)' }} />
              </button>
            </div>

            {/* Camera Mirror Toggle */}
            <div style={S.settingRow}>
              <div>
                <div style={S.settingLabel}>Mirror Video Feed</div>
                <div style={S.settingSub}>Flips preview horizontally for intuitive hand alignment</div>
              </div>
              <button
                onClick={() => setIsMirrored(v => !v)}
                style={{
                  ...S.toggleBtn,
                  background: isMirrored ? '#4f46e5' : isLightMode ? '#e8e2d8' : 'rgba(255,255,255,0.1)'
                }}
              >
                <div style={{ ...S.toggleKnob, transform: isMirrored ? 'translateX(18px)' : 'translateX(0)' }} />
              </button>
            </div>
          </div>

          <div style={S.settingSection}>
            <h4 style={S.settingSectionTitle}>Diagnostic Engine Telemetry</h4>
            <div style={S.diagnosticGrid}>
              <div style={S.diagItem}>
                <span style={S.diagLabel}>MediaPipe Pipeline:</span>
                <span style={S.diagVal}>Hands v0.4 (Active)</span>
              </div>
              <div style={S.diagItem}>
                <span style={S.diagLabel}>Hardware Acceleration:</span>
                <span style={S.diagVal}>WebGL 2.0 GPU</span>
              </div>
              <div style={S.diagItem}>
                <span style={S.diagLabel}>Kinematic Joint Count:</span>
                <span style={S.diagVal}>21 3D Coordinates</span>
              </div>
              <div style={S.diagItem}>
                <span style={S.diagLabel}>Avatar Bridge:</span>
                <span style={{ ...S.diagVal, color: '#10b981' }}>Connected (WebSocket/PostMsg)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Bottom Footer ─────────────────────────────────── */}
      <footer style={S.footer}>
        <span>SignSTEM AI Vision Studio · Ready Player Me 3D Interpreter</span>
      </footer>
    </div>
  );
}

function TelemetryBar({ label, value, color, isLight }) {
  return (
    <div style={telemetryStyles.row}>
      <div style={telemetryStyles.top}>
        <span style={{ ...telemetryStyles.label, color: isLight ? '#57534e' : '#94a3b8' }}>{label}</span>
        <span style={{ ...telemetryStyles.val, color: isLight ? '#1e1b18' : '#f8fafc' }}>{value}%</span>
      </div>
      <div style={{ ...telemetryStyles.track, background: isLight ? 'rgba(215, 203, 185, 0.4)' : 'rgba(255, 255, 255, 0.08)' }}>
        <div style={{ ...telemetryStyles.fill, width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

const telemetryStyles = {
  row: { display: 'flex', flexDirection: 'column', gap: 3 },
  top: { display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 700 },
  label: { fontSize: '10px' },
  val: { fontSize: '10px', fontWeight: 800 },
  track: { height: 5, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3, transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)' },
};

function getStyles(isLight) {
  return {
    container: {
      width: '100%',
      minHeight: '100vh',
      background: isLight ? '#faf8f5' : '#060913',
      color: isLight ? '#1e1b18' : '#f8fafc',
      fontFamily: "'Outfit', -apple-system, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      padding: '12px 14px',
      gap: 12,
      boxSizing: 'border-box',
      transition: 'background-color 0.35s ease, color 0.35s ease',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 10,
      borderBottom: isLight ? '1px solid rgba(215, 203, 185, 0.65)' : '1px solid rgba(255,255,255,0.08)',
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
    },
    aiLogo: {
      width: 32,
      height: 32,
      borderRadius: 10,
      background: isLight
        ? 'linear-gradient(135deg, #4f46e5, #c59b27)'
        : 'linear-gradient(135deg, #6366f1, #06b6d4)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '15px',
      fontWeight: 800,
      boxShadow: isLight ? '0 4px 14px rgba(79, 70, 229, 0.3)' : '0 4px 14px rgba(99, 102, 241, 0.4)',
    },
    headerTitleRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    },
    headerTitle: {
      fontSize: '14px',
      fontWeight: 800,
      margin: 0,
      letterSpacing: '-0.02em',
      color: isLight ? '#1e1b18' : '#ffffff',
    },
    engineVersionBadge: {
      fontSize: '9px',
      fontWeight: 800,
      padding: '1px 5px',
      borderRadius: 5,
      background: isLight ? 'rgba(79, 70, 229, 0.1)' : 'rgba(99, 102, 241, 0.2)',
      color: isLight ? '#4f46e5' : '#a5b4fc',
    },
    headerSub: {
      fontSize: '10px',
      color: isLight ? '#78716c' : '#94a3b8',
      margin: 0,
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    },
    fpsPill: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      padding: '3px 8px',
      borderRadius: 12,
      background: isLight ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.2)',
      color: isLight ? '#059669' : '#34d399',
      fontSize: '10px',
      fontWeight: 800,
    },
    fpsPillDot: {
      width: 5,
      height: 5,
      borderRadius: '50%',
      background: '#10b981',
      animation: 'pulseGlow 1.5s infinite',
    },
    statusPill: {
      padding: '3px 9px',
      borderRadius: 12,
      border: '1px solid',
      fontSize: '10px',
      fontWeight: 700,
      transition: 'all 0.2s',
    },
    themeBtn: {
      padding: '4px 8px',
      borderRadius: 8,
      border: isLight ? '1px solid rgba(215, 203, 185, 0.8)' : '1px solid rgba(255,255,255,0.15)',
      background: isLight ? '#ffffff' : 'rgba(255,255,255,0.08)',
      color: isLight ? '#c59b27' : '#fbbf24',
      fontSize: '12px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
    },
    tabsNav: {
      display: 'flex',
      gap: 4,
      padding: 3,
      background: isLight ? '#f3ede2' : 'rgba(255,255,255,0.04)',
      borderRadius: 12,
      border: isLight ? '1px solid rgba(215, 203, 185, 0.6)' : '1px solid rgba(255,255,255,0.06)',
    },
    tabBtn: {
      flex: 1,
      padding: '7px 6px',
      borderRadius: 9,
      border: 'none',
      background: 'transparent',
      color: isLight ? '#78716c' : '#94a3b8',
      fontSize: '11px',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontFamily: 'inherit',
      textAlign: 'center',
      whiteSpace: 'nowrap',
    },
    tabBtnActive: {
      background: isLight ? '#ffffff' : 'rgba(99,102,241,0.25)',
      color: isLight ? '#4f46e5' : '#ffffff',
      boxShadow: isLight ? '0 2px 8px rgba(180, 160, 140, 0.2)' : '0 2px 8px rgba(0,0,0,0.3)',
    },
    studioContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    },
    preCaptureWrap: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    },
    heroBanner: {
      padding: '16px 18px',
      borderRadius: 18,
      background: isLight
        ? 'linear-gradient(135deg, #ffffff 0%, #faf5ec 100%)'
        : 'linear-gradient(135deg, #0e1322 0%, #151b2e 100%)',
      border: isLight ? '1px solid rgba(215, 203, 185, 0.7)' : '1px solid rgba(255,255,255,0.08)',
      boxShadow: isLight ? '0 8px 30px rgba(180, 160, 140, 0.12)' : '0 8px 30px rgba(0,0,0,0.4)',
    },
    heroTag: {
      fontSize: '9px',
      fontWeight: 800,
      letterSpacing: '1px',
      color: isLight ? '#4f46e5' : '#818cf8',
      marginBottom: 4,
    },
    heroHeading: {
      fontSize: '16px',
      fontWeight: 800,
      letterSpacing: '-0.02em',
      margin: '0 0 6px',
      color: isLight ? '#1e1b18' : '#ffffff',
    },
    heroDescription: {
      fontSize: '11px',
      lineHeight: 1.5,
      color: isLight ? '#57534e' : '#94a3b8',
      margin: 0,
    },
    sourceGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10,
    },
    sourceCard: {
      padding: '14px 16px',
      borderRadius: 16,
      background: isLight ? '#ffffff' : '#0e1322',
      border: isLight ? '1px solid rgba(215, 203, 185, 0.65)' : '1px solid rgba(255,255,255,0.08)',
      boxShadow: isLight ? '0 4px 20px rgba(180, 160, 140, 0.08)' : '0 4px 20px rgba(0,0,0,0.3)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: 10,
    },
    sourceCardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
    },
    sourceCardIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      color: '#fff',
      flexShrink: 0,
    },
    sourceCardTitle: {
      fontSize: '12px',
      fontWeight: 800,
      color: isLight ? '#1e1b18' : '#ffffff',
    },
    sourceCardBadge: {
      fontSize: '9px',
      fontWeight: 700,
      color: isLight ? '#4f46e5' : '#818cf8',
    },
    sourceCardBody: {
      fontSize: '10px',
      color: isLight ? '#78716c' : '#94a3b8',
      lineHeight: 1.4,
      margin: 0,
    },
    sourceCardLaunchBtn: {
      padding: '9px 12px',
      borderRadius: 10,
      border: 'none',
      background: isLight
        ? 'linear-gradient(135deg, #4f46e5, #6366f1)'
        : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      color: '#fff',
      fontSize: '11px',
      fontWeight: 800,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontFamily: 'inherit',
      boxShadow: isLight ? '0 3px 12px rgba(79, 70, 229, 0.3)' : '0 3px 12px rgba(99, 102, 241, 0.35)',
      transition: 'transform 0.15s',
    },
    screenBtn: {
      background: isLight
        ? 'linear-gradient(135deg, #059669, #10b981)'
        : 'linear-gradient(135deg, #10b981, #059669)',
      boxShadow: isLight ? '0 3px 12px rgba(5, 150, 105, 0.3)' : '0 3px 12px rgba(16, 185, 129, 0.35)',
    },
    errorBox: {
      padding: '10px 14px',
      borderRadius: 12,
      background: 'rgba(239,68,68,0.1)',
      border: '1px solid rgba(239,68,68,0.3)',
      color: '#ef4444',
      fontSize: '11px',
      fontWeight: 600,
    },
    framingGuideCard: {
      padding: '14px 16px',
      borderRadius: 16,
      background: isLight ? '#ffffff' : '#0e1322',
      border: isLight ? '1px solid rgba(215, 203, 185, 0.65)' : '1px solid rgba(255,255,255,0.08)',
      boxShadow: isLight ? '0 4px 16px rgba(180, 160, 140, 0.06)' : '0 4px 16px rgba(0,0,0,0.2)',
    },
    guideHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    guideTitle: {
      fontSize: '11px',
      fontWeight: 800,
      color: isLight ? '#1e1b18' : '#ffffff',
    },
    guideSub: {
      fontSize: '9px',
      fontWeight: 700,
      color: isLight ? '#059669' : '#34d399',
    },
    guideGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 10,
    },
    guideItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 7,
    },
    guideIcon: {
      fontSize: '14px',
      marginTop: 2,
    },
    guideText: {
      display: 'flex',
      flexDirection: 'column',
      fontSize: '9px',
      color: isLight ? '#57534e' : '#94a3b8',
      lineHeight: 1.35,
    },
    quickBar: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 12px',
      borderRadius: 12,
      background: isLight ? '#f5efe4' : 'rgba(255,255,255,0.03)',
      border: isLight ? '1px solid rgba(215, 203, 185, 0.5)' : '1px solid rgba(255,255,255,0.05)',
      overflowX: 'auto',
    },
    quickBarLabel: {
      fontSize: '10px',
      fontWeight: 800,
      color: isLight ? '#78716c' : '#64748b',
      whiteSpace: 'nowrap',
    },
    quickChipsRow: {
      display: 'flex',
      gap: 4,
      flexWrap: 'nowrap',
    },
    quickChip: {
      padding: '3px 8px',
      borderRadius: 8,
      background: isLight ? '#ffffff' : 'rgba(255,255,255,0.06)',
      border: isLight ? '1px solid rgba(215, 203, 185, 0.6)' : '1px solid rgba(255,255,255,0.08)',
      fontSize: '10px',
      fontWeight: 700,
      color: isLight ? '#1e1b18' : '#cbd5e1',
      whiteSpace: 'nowrap',
    },
    activeCaptureWrap: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    },
    viewfinderContainer: {
      position: 'relative',
      borderRadius: 18,
      overflow: 'hidden',
      background: '#000',
      border: isLight ? '2px solid #4f46e5' : '2px solid rgba(99,102,241,0.5)',
      boxShadow: isLight ? '0 12px 36px rgba(180, 160, 140, 0.35)' : '0 12px 36px rgba(0,0,0,0.8)',
    },
    videoFeed: {
      width: '100%',
      minHeight: 280,
      maxHeight: 460,
      objectFit: 'cover',
      display: 'block',
    },
    hudBrackets: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
    },
    hudCorner: {
      position: 'absolute',
      width: 24,
      height: 24,
    },
    hudCenterTarget: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 140,
      height: 140,
      border: '1px dashed rgba(255,255,255,0.3)',
      borderRadius: 16,
    },
    viewfinderTopBadges: {
      position: 'absolute',
      top: 10,
      left: 10,
      right: 10,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    liveFeedBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      padding: '4px 9px',
      borderRadius: 8,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(6px)',
      fontSize: '9px',
      fontWeight: 800,
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.15)',
    },
    recDot: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: '#ef4444',
      animation: 'pulseGlow 1.5s infinite',
    },
    feedInfoBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      padding: '4px 9px',
      borderRadius: 8,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(6px)',
      fontSize: '9px',
      fontWeight: 700,
      color: '#e2e8f0',
      border: '1px solid rgba(255,255,255,0.15)',
    },
    viewfinderControls: {
      position: 'absolute',
      bottom: 10,
      left: 10,
      right: 10,
      display: 'flex',
      gap: 6,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    viewfinderActionBtn: {
      padding: '5px 10px',
      borderRadius: 8,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(6px)',
      border: '1px solid rgba(255,255,255,0.2)',
      color: '#fff',
      fontSize: '10px',
      fontWeight: 700,
      cursor: 'pointer',
    },
    stopCaptureBtn: {
      padding: '6px 14px',
      borderRadius: 9,
      background: 'rgba(239,68,68,0.9)',
      border: 'none',
      color: '#fff',
      fontSize: '11px',
      fontWeight: 800,
      cursor: 'pointer',
      boxShadow: '0 2px 10px rgba(239,68,68,0.4)',
    },
    telemetryCard: {
      padding: '14px 16px',
      borderRadius: 16,
      background: isLight ? '#ffffff' : '#0e1322',
      border: isLight ? '1px solid rgba(215, 203, 185, 0.7)' : '1px solid rgba(255,255,255,0.08)',
      boxShadow: isLight ? '0 6px 24px rgba(180, 160, 140, 0.12)' : '0 6px 24px rgba(0,0,0,0.4)',
    },
    telemetryHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    telemetryTag: {
      fontSize: '9px',
      fontWeight: 800,
      color: isLight ? '#4f46e5' : '#818cf8',
      letterSpacing: '0.8px',
    },
    telemetryStatus: {
      fontSize: '9px',
      fontWeight: 700,
      color: isLight ? '#78716c' : '#94a3b8',
    },
    lastSignContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    },
    lastSignRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    lastSignCategoryBadge: {
      fontSize: '9px',
      fontWeight: 800,
      textTransform: 'uppercase',
      color: isLight ? '#c59b27' : '#fbbf24',
      marginBottom: 2,
    },
    lastSignHeading: {
      fontSize: '22px',
      fontWeight: 900,
      letterSpacing: '-0.03em',
      margin: 0,
      color: isLight ? '#1e1b18' : '#ffffff',
    },
    confidenceGauge: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '6px 12px',
      borderRadius: 12,
      background: isLight ? 'rgba(79, 70, 229, 0.1)' : 'rgba(99, 102, 241, 0.15)',
      border: isLight ? '1px solid rgba(79, 70, 229, 0.25)' : '1px solid rgba(99, 102, 241, 0.3)',
    },
    confidenceNumber: {
      fontSize: '16px',
      fontWeight: 900,
      color: isLight ? '#4f46e5' : '#a5b4fc',
    },
    confidenceLabel: {
      fontSize: '8px',
      fontWeight: 700,
      color: isLight ? '#78716c' : '#94a3b8',
      textTransform: 'uppercase',
    },
    lastSignActions: {
      display: 'flex',
      gap: 6,
    },
    syncActionBtn: {
      flex: 1,
      padding: '8px 12px',
      borderRadius: 10,
      border: 'none',
      background: isLight
        ? 'linear-gradient(135deg, #4f46e5, #6366f1)'
        : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      color: '#fff',
      fontSize: '11px',
      fontWeight: 800,
      cursor: 'pointer',
      boxShadow: isLight ? '0 2px 8px rgba(79, 70, 229, 0.3)' : 'none',
    },
    copyActionBtn: {
      padding: '8px 14px',
      borderRadius: 10,
      border: isLight ? '1px solid rgba(215, 203, 185, 0.8)' : '1px solid rgba(255,255,255,0.15)',
      background: isLight ? '#f5efe4' : 'rgba(255,255,255,0.06)',
      color: isLight ? '#1e1b18' : '#e2e8f0',
      fontSize: '11px',
      fontWeight: 700,
      cursor: 'pointer',
    },
    waitingPlaceholder: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '14px',
      borderRadius: 12,
      background: isLight ? '#fbf8f2' : 'rgba(255,255,255,0.03)',
      border: isLight ? '1px dashed rgba(215, 203, 185, 0.8)' : '1px dashed rgba(255,255,255,0.1)',
    },
    waitingIcon: {
      fontSize: '22px',
    },
    waitingText: {
      fontSize: '11px',
      color: isLight ? '#78716c' : '#94a3b8',
      lineHeight: 1.4,
    },
    kinematicsCard: {
      padding: '14px 16px',
      borderRadius: 16,
      background: isLight ? '#ffffff' : '#0e1322',
      border: isLight ? '1px solid rgba(215, 203, 185, 0.7)' : '1px solid rgba(255,255,255,0.08)',
      boxShadow: isLight ? '0 4px 16px rgba(180, 160, 140, 0.08)' : '0 4px 16px rgba(0,0,0,0.3)',
    },
    kinematicsHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '11px',
      fontWeight: 800,
      color: isLight ? '#1e1b18' : '#ffffff',
      marginBottom: 10,
    },
    overallScoreBadge: {
      fontSize: '9px',
      fontWeight: 800,
      color: isLight ? '#059669' : '#34d399',
    },
    kinematicsGrid: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7,
    },
    dictionaryWrap: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    },
    searchHeader: {
      display: 'flex',
      gap: 6,
    },
    searchInput: {
      flex: 1,
      padding: '9px 14px',
      borderRadius: 12,
      border: isLight ? '1px solid rgba(215, 203, 185, 0.85)' : '1px solid rgba(255,255,255,0.12)',
      background: isLight ? '#ffffff' : '#0e1322',
      color: isLight ? '#1e1b18' : '#ffffff',
      fontSize: '11px',
      outline: 'none',
      fontFamily: 'inherit',
      boxShadow: isLight ? 'inset 0 1px 3px rgba(0,0,0,0.03)' : 'none',
    },
    categoryPills: {
      display: 'flex',
      gap: 4,
      overflowX: 'auto',
      paddingBottom: 2,
    },
    categoryPill: {
      padding: '4px 10px',
      borderRadius: 14,
      border: isLight ? '1px solid rgba(215, 203, 185, 0.65)' : '1px solid rgba(255,255,255,0.08)',
      background: isLight ? '#ffffff' : 'rgba(255,255,255,0.04)',
      color: isLight ? '#57534e' : '#94a3b8',
      fontSize: '10px',
      fontWeight: 700,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      transition: 'all 0.15s',
    },
    categoryPillActive: {
      background: isLight ? '#4f46e5' : '#6366f1',
      color: '#fff',
      borderColor: isLight ? '#4f46e5' : '#6366f1',
    },
    gesturesGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 8,
      maxHeight: 480,
      overflowY: 'auto',
    },
    gestureCard: {
      padding: '12px 14px',
      borderRadius: 14,
      background: isLight ? '#ffffff' : '#0e1322',
      border: isLight ? '1px solid rgba(215, 203, 185, 0.65)' : '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: 6,
      boxShadow: isLight ? '0 2px 10px rgba(180, 160, 140, 0.06)' : 'none',
    },
    gestureCardTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    gestureEmoji: {
      fontSize: '18px',
    },
    gestureCategory: {
      fontSize: '8px',
      fontWeight: 800,
      color: isLight ? '#c59b27' : '#fbbf24',
      textTransform: 'uppercase',
    },
    gestureTitle: {
      fontSize: '12px',
      fontWeight: 800,
      margin: 0,
      color: isLight ? '#1e1b18' : '#ffffff',
    },
    gestureDesc: {
      fontSize: '10px',
      color: isLight ? '#78716c' : '#94a3b8',
      lineHeight: 1.35,
      margin: 0,
    },
    gestureCardActions: {
      marginTop: 4,
    },
    gestureSyncBtn: {
      width: '100%',
      padding: '6px 10px',
      borderRadius: 8,
      border: isLight ? '1px solid rgba(79, 70, 229, 0.25)' : '1px solid rgba(99, 102, 241, 0.3)',
      background: isLight ? 'rgba(79, 70, 229, 0.08)' : 'rgba(99, 102, 241, 0.15)',
      color: isLight ? '#4f46e5' : '#a5b4fc',
      fontSize: '10px',
      fontWeight: 800,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    historyWrap: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    },
    statsBar: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 8,
    },
    statBox: {
      padding: '10px',
      borderRadius: 12,
      background: isLight ? '#ffffff' : '#0e1322',
      border: isLight ? '1px solid rgba(215, 203, 185, 0.65)' : '1px solid rgba(255,255,255,0.08)',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    },
    statVal: {
      fontSize: '16px',
      fontWeight: 900,
      color: isLight ? '#4f46e5' : '#a5b4fc',
    },
    statLabel: {
      fontSize: '8px',
      fontWeight: 700,
      color: isLight ? '#78716c' : '#94a3b8',
      textTransform: 'uppercase',
    },
    emptyState: {
      padding: '40px 20px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
    },
    emptyStateIcon: { fontSize: '32px', opacity: 0.6 },
    emptyStateTitle: { fontSize: '13px', fontWeight: 800, margin: 0 },
    emptyStateSubtitle: { fontSize: '11px', color: isLight ? '#78716c' : '#94a3b8', maxWidth: 280, margin: 0 },
    historyList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 5,
      maxHeight: 460,
      overflowY: 'auto',
    },
    historyCard: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 12px',
      borderRadius: 10,
      background: isLight ? '#ffffff' : '#0e1322',
      border: isLight ? '1px solid rgba(215, 203, 185, 0.6)' : '1px solid rgba(255,255,255,0.06)',
    },
    historyCardLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    historyIndex: {
      fontSize: '9px',
      fontWeight: 800,
      color: isLight ? '#8c827a' : '#64748b',
    },
    historySignTitle: {
      fontSize: '12px',
      fontWeight: 800,
      color: isLight ? '#1e1b18' : '#ffffff',
    },
    historySignTime: {
      fontSize: '9px',
      color: isLight ? '#78716c' : '#94a3b8',
    },
    historyCardRight: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    },
    historyConfBadge: {
      fontSize: '9px',
      fontWeight: 800,
      color: isLight ? '#059669' : '#34d399',
    },
    historyReplayBtn: {
      padding: '3px 8px',
      borderRadius: 6,
      border: isLight ? '1px solid rgba(79, 70, 229, 0.2)' : '1px solid rgba(99, 102, 241, 0.3)',
      background: isLight ? 'rgba(79, 70, 229, 0.08)' : 'rgba(99, 102, 241, 0.15)',
      color: isLight ? '#4f46e5' : '#a5b4fc',
      fontSize: '9px',
      fontWeight: 700,
      cursor: 'pointer',
    },
    settingsWrap: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    },
    settingSection: {
      padding: '14px 16px',
      borderRadius: 16,
      background: isLight ? '#ffffff' : '#0e1322',
      border: isLight ? '1px solid rgba(215, 203, 185, 0.65)' : '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    },
    settingSectionTitle: {
      fontSize: '11px',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.6px',
      color: isLight ? '#4f46e5' : '#818cf8',
      margin: 0,
    },
    settingRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    settingLabel: {
      fontSize: '11px',
      fontWeight: 800,
      color: isLight ? '#1e1b18' : '#ffffff',
    },
    settingSub: {
      fontSize: '9px',
      color: isLight ? '#78716c' : '#94a3b8',
    },
    sliderWrap: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    rangeSlider: {
      width: 90,
      accentColor: '#4f46e5',
      cursor: 'pointer',
    },
    sliderValue: {
      fontSize: '10px',
      fontWeight: 800,
      color: isLight ? '#4f46e5' : '#a5b4fc',
      width: 28,
      textAlign: 'right',
    },
    toggleBtn: {
      width: 38,
      height: 20,
      borderRadius: 10,
      border: 'none',
      cursor: 'pointer',
      position: 'relative',
      transition: 'background 0.2s',
    },
    toggleKnob: {
      width: 16,
      height: 16,
      borderRadius: '50%',
      background: '#fff',
      position: 'absolute',
      top: 2,
      left: 2,
      transition: 'transform 0.2s',
      boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
    },
    diagnosticGrid: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    },
    diagItem: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '10px',
    },
    diagLabel: {
      color: isLight ? '#78716c' : '#94a3b8',
    },
    diagVal: {
      fontWeight: 700,
      color: isLight ? '#1e1b18' : '#f8fafc',
    },
    toast: {
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '7px 18px',
      borderRadius: 12,
      background: isLight ? '#ffffff' : '#13182b',
      border: isLight ? '1px solid rgba(215, 203, 185, 0.9)' : '1px solid rgba(99, 102, 241, 0.4)',
      color: isLight ? '#1e1b18' : '#ffffff',
      fontSize: '11px',
      fontWeight: 800,
      boxShadow: isLight ? '0 8px 30px rgba(180, 160, 140, 0.3)' : '0 8px 30px rgba(0,0,0,0.7)',
      zIndex: 100,
    },
    footer: {
      marginTop: 'auto',
      padding: '8px 0',
      textAlign: 'center',
      fontSize: '9px',
      color: isLight ? '#8c827a' : '#64748b',
      borderTop: isLight ? '1px solid rgba(215, 203, 185, 0.5)' : '1px solid rgba(255,255,255,0.05)',
    },
  };
}

export default LiveRecognitionPanel;
