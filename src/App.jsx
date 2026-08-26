import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAnimationQueue } from './hooks/useAnimationQueue';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useHistory } from './hooks/useHistory';
import { useSignRecognition } from './hooks/useSignRecognition';
import { Player } from './components/Player';
import { SubtitleBar } from './components/SubtitleBar';
import { HistoryPanel } from './components/HistoryPanel';
import { QuizOverlay } from './components/QuizOverlay';
import { DEFAULT_AVATAR_CONFIG } from './constants/avatarCustomization';
import { transformToISLGrammar, detectLongWords, breakIntoFingerspelling } from './utils/islGrammarEngine';
import { autoPlayFromURL, createShareLink } from './utils/shareLink';
import { exportVideo } from './utils/videoExporter';
import { LEARNING_PATHS } from './utils/learningPaths';

const SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
const extensionApi = globalThis.chrome?.storage ? globalThis.chrome : null;

export function App() {
  const [themeMode, setThemeMode] = useState(() => {
    try {
      const saved = localStorage.getItem('isl_theme_mode');
      if (saved) return saved;
      const cfg = localStorage.getItem('isl_avatar_config');
      if (cfg) {
        const parsed = JSON.parse(cfg);
        if (parsed.themeMode) return parsed.themeMode;
      }
    } catch {}
    return 'light'; // Default to luxury Ivory White
  });

  const [avatarConfig, setAvatarConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('isl_avatar_config');
      return saved ? JSON.parse(saved) : DEFAULT_AVATAR_CONFIG;
    } catch { return DEFAULT_AVATAR_CONFIG; }
  });

  const [input, setInput] = useState('');
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [notice, setNotice] = useState('');
  const [isListeningTab, setIsListeningTab] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const [fingerModal, setFingerModal] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const inFrame = typeof window !== 'undefined' && window.self !== window.top;
  const [showPaths, setShowPaths] = useState(() => !inFrame);
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamStream, setWebcamStream] = useState(null);
  const [isLargeWebcam, setIsLargeWebcam] = useState(false);

  const tabStreamRef = useRef(null);
  const tabAudioRef = useRef(null);
  const webcamVideoRef = useRef(null);
  const webcamCanvasRef = useRef(null);
  const noticeTimer = useRef(null);

  const isLight = themeMode === 'light' || themeMode === 'ivory';

  // Apply theme class to document
  useEffect(() => {
    const rootEl = document.documentElement;
    const bodyEl = document.body;
    if (isLight) {
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
  }, [themeMode, isLight]);

  const toggleTheme = () => {
    const next = isLight ? 'dark' : 'light';
    setThemeMode(next);
    setAvatarConfig(prev => ({ ...prev, themeMode: next }));
    flash(next === 'light' ? '☀️ Ivory White Theme Activated' : '🌙 Midnight Dark Theme Activated');
  };

  const flash = useCallback((msg, ms = 2500) => {
    setNotice(msg);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(''), ms);
  }, []);

  const { history, addHistory, clearHistory, exportHistory } = useHistory(50);

  const handleTokenStart = useCallback((item, remainingCount) => {
    addHistory(item);
    try {
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'ISL_TOKEN_STARTED', token: item.token, label: item.label, remainingCount }, '*');
      }
    } catch { }
  }, [addHistory]);

  const handleSequenceComplete = useCallback(() => {
    try {
      if (window.parent !== window) window.parent.postMessage({ type: 'ISL_SEQUENCE_COMPLETED' }, '*');
    } catch { }
  }, []);

  const {
    queue, currentItem, isIdle, isPlaying, playbackRate, setPlaybackRate,
    enqueueTokens, handleAnimationEnd, handleAnimationError,
    clearQueue, skipCurrent, togglePlayPause
  } = useAnimationQueue({ onTokenStart: handleTokenStart, onSequenceComplete: handleSequenceComplete });

  useEffect(() => {
    try { if (window.parent !== window) window.parent.postMessage({ type: 'ISL_SEQUENCER_READY' }, '*'); } catch { }
  }, []);

  useEffect(() => { autoPlayFromURL(enqueueTokens); }, [enqueueTokens]);

  const processText = useCallback((text) => {
    if (!text?.trim()) return;
    const parsed = transformToISLGrammar(text.trim());
    const tokens = parsed.tokens.map(t => t.token);
    if (tokens.length > 0) enqueueTokens(tokens, 'replace');
  }, [enqueueTokens]);

  const handleFingerspell = (word) => {
    setFingerModal(null);
    const letters = breakIntoFingerspelling(word);
    if (letters.length > 0) {
      enqueueTokens(letters.map(t => t.token), 'replace');
      flash(`Fingerspelling "${word}"`);
    }
  };

  const handleDeclineFinger = () => {
    if (fingerModal) {
      const parsed = transformToISLGrammar(fingerModal.word);
      const tokens = parsed.tokens.map(t => t.token);
      if (tokens.length > 0) enqueueTokens(tokens, 'replace');
    }
    setFingerModal(null);
  };

  const toggleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      flash('Speech recognition not supported in this browser');
      return;
    }
    if (isListeningVoice) {
      setIsListeningVoice(false);
      return;
    }
    try {
      const r = new SR();
      r.continuous = false;
      r.interimResults = false;
      r.lang = 'en-IN';
      r.onstart = () => {
        setIsListeningVoice(true);
        flash('🎤 Listening to microphone... speak clearly');
      };
      r.onresult = (e) => {
        const t = e.results?.[0]?.[0]?.transcript;
        if (t) {
          setInput(t);
          flash(`Heard: "${t}"`);
          processText(t);
        }
      };
      r.onerror = (e) => {
        setIsListeningVoice(false);
        console.debug('[Voice] Recognition error:', e?.error);
        if (e?.error === 'not-allowed') {
          flash('⚠️ Mic access blocked. Allow microphone in Chrome settings.');
        } else if (e?.error === 'no-speech') {
          flash('ℹ️ No speech detected. Speak closer to microphone.');
        } else {
          flash('ℹ️ Note: For video captions, keep Sync ✦ active');
        }
      };
      r.onend = () => setIsListeningVoice(false);
      r.start();
    } catch (err) {
      setIsListeningVoice(false);
      flash('ℹ️ To translate video audio, enable Sync ✦');
    }
  };

  const startTabListen = async () => {
    if (isListeningTab) {
      stopTabListen();
      return;
    }
    try {
      if (typeof chrome === 'undefined' || !chrome?.tabCapture) {
        setIsListeningTab(true);
        flash('🎧 Live Caption Sync is active on this tab');
        return;
      }
      const stream = await new Promise((ok, no) =>
        chrome.tabCapture.capture({ audio: true, video: false }, s =>
          chrome.runtime.lastError ? no(new Error(chrome.runtime.lastError.message)) : ok(s)
        )
      );
      tabStreamRef.current = stream;
      const audio = new Audio();
      audio.srcObject = stream;
      audio.muted = true;
      tabAudioRef.current = audio;
      await audio.play();
      setIsListeningTab(true);
      flash('🎧 Listening to tab audio...');
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        const r = new SR();
        r.continuous = true;
        r.interimResults = false;
        r.lang = 'en-IN';
        r.onresult = (e) => {
          const l = e.results[e.results.length - 1];
          if (l.isFinal) {
            const t = l[0].transcript;
            setInput(t);
            processText(t);
          }
        };
        r.onend = () => {
          if (isListeningTab && tabStreamRef.current) {
            try { r.start(); } catch {}
          }
        };
        r.start();
      }
    } catch (err) {
      flash('Tab capture: ' + (err.message || 'active'));
    }
  };

  const stopTabListen = () => {
    tabStreamRef.current?.getTracks().forEach(t => t.stop());
    tabStreamRef.current = null;
    tabAudioRef.current = null;
    setIsListeningTab(false);
    flash('Tab listening stopped');
  };

  useEffect(() => () => { tabStreamRef.current?.getTracks().forEach(t => t.stop()); webcamStream?.getTracks().forEach(t => t.stop()); }, []);

  // Bind video stream once without re-triggering playback pipeline resets on re-render
  useEffect(() => {
    if (webcamVideoRef.current && webcamStream) {
      if (webcamVideoRef.current.srcObject !== webcamStream) {
        webcamVideoRef.current.srcObject = webcamStream;
        webcamVideoRef.current.play().catch(e => console.debug('Webcam play notice:', e));
      }
    }
  }, [webcamStream, webcamActive]);

  const handleLiveSignRecognized = useCallback((signData) => {
    if (!signData?.sign) return;
    flash(`✨ Recognized: ${signData.label || signData.sign}`);
    enqueueTokens([signData.sign], 'replace');
  }, [enqueueTokens, flash]);

  const {
    lastSign, fps: recFps, handDetected: recHandDetected, statusMessage: recStatus
  } = useSignRecognition({
    videoRef: webcamVideoRef,
    canvasRef: webcamCanvasRef,
    stream: webcamStream,
    isMirrored: true,
    enabled: webcamActive && !!webcamStream,
    onSignRecognized: handleLiveSignRecognized,
    confidenceThreshold: 50,
  });

  const toggleWebcam = useCallback(async () => {
    if (webcamActive) {
      webcamStream?.getTracks().forEach(t => t.stop());
      setWebcamStream(null);
      setWebcamActive(false);
      flash('Camera stopped');
    } else {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false
        });
        setWebcamStream(s);
        setWebcamActive(true);
        flash('📷 Camera Sign Recognition Active (Show signs to 3D Avatar)');
      } catch (err) {
        console.error('[App] Webcam access error:', err);
        flash('⚠️ Camera access denied. Allow camera permissions.');
      }
    }
  }, [webcamActive, webcamStream, flash]);

  const handleExport = useCallback(async () => { flash('Recording 5s...'); try { await exportVideo(5000); flash('Exported!'); } catch { flash('Export failed'); } }, []);

  const handleShare = useCallback(() => {
    const tokens = queue.length > 0 ? queue.map(q => q.token).filter(Boolean) : currentItem?.token ? [currentItem.token] : null;
    if (!tokens?.length) { flash('Nothing to share'); return; }
    const link = createShareLink(tokens);
    navigator.clipboard.writeText(link).then(() => flash('Link copied!')).catch(() => flash(link));
  }, [queue, currentItem, flash]);

  const cycleSpeed = useCallback(() => {
    const idx = SPEEDS.indexOf(playbackRate);
    setPlaybackRate(SPEEDS[(idx + 1) % SPEEDS.length]);
  }, [playbackRate, setPlaybackRate]);

  useKeyboardShortcuts({
    onPlayPause: togglePlayPause, onSkip: skipCurrent, onPrev: () => { },
    onToggleMic: toggleVoice, onCycleSpeed: cycleSpeed,
    onCloseModal: () => { setFingerModal(null); setShowHistory(false); setShowQuiz(false); },
    onClear: clearQueue, onToggleHistory: () => setShowHistory(v => !v),
    onToggleQuiz: () => setShowQuiz(v => !v), onToggleWebcam: toggleWebcam,
  });

  useEffect(() => {
    const handler = (e) => {
      let d = e.data;
      if (typeof d === 'string') try { d = JSON.parse(d); } catch { return; }
      if (!d || typeof d !== 'object') return;
      switch (d.type) {
        case 'PLAY_ISL_SEQUENCE': case 'TRANSLATE_SPEECH_TO_ISL': {
          const raw = d.tokens || d.words || d.payload;
          if (raw) {
            if (typeof raw === 'string') {
              const cleaned = raw.replace(/\[[^\]]*\]|\([^)]*\)/g, '').trim();
              if (cleaned) {
                const parsed = transformToISLGrammar(cleaned);
                const tokens = parsed.tokens.map(tk => tk.token);
                if (tokens.length > 0) {
                  enqueueTokens(tokens, d.mode || 'replace');
                }
              }
            } else if (Array.isArray(raw)) {
              enqueueTokens(raw, d.mode || 'replace');
            }
          }
          break;
        }
        case 'STOP_SEQUENCE': case 'CLEAR_QUEUE': clearQueue(); break;
        case 'SKIP_CURRENT_SIGN': skipCurrent(); break;
        case 'SET_PLAYBACK_SPEED': if (typeof d.speed === 'number') setPlaybackRate(d.speed); break;
        case 'START_TAB_LISTEN': startTabListen(); break;
        case 'STOP_TAB_LISTEN': stopTabListen(); break;
        case 'CONTROL_MINIMIZE': setIsMinimized(p => !p); break;
        case 'CONTROL_MAXIMIZE': setIsMaximized(p => !p); setIsMinimized(false); break;
        case 'CONTROL_CLOSE': setIsHidden(true); break;
        case 'CONTROL_RESTORE': setIsHidden(false); setIsMinimized(false); break;
        default: break;
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [enqueueTokens, clearQueue, skipCurrent, setPlaybackRate]);

  const submit = (e) => { e?.preventDefault(); if (input.trim()) processText(input.trim()); };

  const S = getStyles(isLight, inFrame);

  if (isHidden) return null;

  return (
    <main style={S.root}>
      {/* ─── Top Control Header ────────────────────────────── */}
      <header style={S.header}>
        <div style={S.headerBrand}>
          <div style={S.brandIcon}>✦</div>
          <span style={S.brandTitle}>SignSTEM</span>
        </div>

        <div style={S.headerActions}>
          <div style={S.syncBadge}>
            <span style={S.syncDot} />
            <span>Sync</span>
          </div>

          <button
            onClick={isListeningTab ? stopTabListen : startTabListen}
            style={{ ...S.headerBtn, color: isListeningTab ? '#10b981' : undefined }}
            title={isListeningTab ? 'Listening to Tab Audio' : 'Listen to Tab Audio'}
          >
            🎧
          </button>

          <button
            onClick={toggleTheme}
            style={S.themeToggleBtn}
            title={isLight ? 'Switch to Midnight Dark' : 'Switch to Ivory White'}
          >
            {isLight ? '🌙' : '☀️'}
          </button>

          <div style={S.windowControls}>
            <button onClick={() => setIsMinimized(v => !v)} style={S.windowBtn} title="Minimize">
              _
            </button>
            <button onClick={() => setIsMaximized(v => !v)} style={S.windowBtn} title="Maximize">
              □
            </button>
            <button onClick={() => setIsHidden(true)} style={{ ...S.windowBtn, ...S.closeBtn }} title="Close">
              ✕
            </button>
          </div>
        </div>
      </header>

      {/* ─── 3D Avatar Stage ───────────────────────────────── */}
      <div style={{ ...S.stage, minHeight: isMinimized ? 0 : undefined }}>
        {!isMinimized && (
          <div style={{ width: '100%', height: '100%', minHeight: 0, position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Player
              currentItem={currentItem}
              nextItems={queue}
              onEnded={handleAnimationEnd}
              onError={handleAnimationError}
              isPlaying={isPlaying}
              playbackRate={playbackRate}
              avatarConfig={{ ...avatarConfig, themeMode }}
            />

            {webcamActive && webcamStream && (
              <div style={isLargeWebcam ? S.webcamLarge : S.webcam}>
                <video ref={webcamVideoRef} autoPlay playsInline muted style={S.webcamVideo} />
                <canvas
                  ref={webcamCanvasRef}
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
                <div style={{ ...S.liveDot, display: 'flex', alignItems: 'center', gap: 5, zIndex: 10 }}>
                  <span style={{
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: recHandDetected ? '#10b981' : '#ef4444',
                    boxShadow: recHandDetected ? '0 0 6px #10b981' : 'none'
                  }} />
                  <span>{recHandDetected ? 'HAND TRACKED' : 'CAMERA LIVE'}</span>
                  {recFps > 0 && <span style={{ opacity: 0.85 }}>({recFps} fps)</span>}
                </div>
                {lastSign && (
                  <div style={{
                    ...S.webcamSignBadge,
                    zIndex: 10,
                    animation: 'fadeInUp 0.15s ease-out'
                  }}>
                    ✨ {lastSign.label || lastSign.sign} ({lastSign.confidence}%)
                  </div>
                )}
                <button
                  onClick={() => setIsLargeWebcam(v => !v)}
                  style={S.webcamToggleBtn}
                  title={isLargeWebcam ? 'Switch to Compact PiP' : 'Switch to Expanded View'}
                >
                  {isLargeWebcam ? '↙ Compact' : '↗ Expand'}
                </button>
              </div>
            )}
          </div>
        )}
        <HistoryPanel history={history} isOpen={showHistory} onClose={() => setShowHistory(false)} onClear={clearHistory} onExport={exportHistory} />
        <QuizOverlay isOpen={showQuiz} onClose={() => setShowQuiz(false)} onReveal={t => enqueueTokens([t], 'replace')} />
      </div>

      {/* ─── Subtitle Bar ───────────────────────────────────── */}
      {!isMinimized && <SubtitleBar currentItem={currentItem} queue={queue} isIdle={isIdle} />}

      {/* ─── Speed Ramp ─────────────────────────────────────── */}
      {!isMinimized && !isIdle && (
        <div style={S.speedBar}>
          {SPEEDS.map(s => (
            <button key={s} onClick={() => setPlaybackRate(s)} style={{ ...S.speedBtn, ...(playbackRate === s ? S.speedActive : {}) }}>
              {s}x
            </button>
          ))}
        </div>
      )}

      {/* ─── Learning Paths Carousel ───────────────────────── */}
      {!isMinimized && showPaths && isIdle && (
        <div style={S.pathsWrap}>
          <div style={S.pathsHeader}>
            <span style={S.pathsTitle}>Learning Paths</span>
            <button onClick={() => setShowPaths(false)} style={S.pathsClose}>×</button>
          </div>
          <div style={S.pathsGrid}>
            {LEARNING_PATHS.map(p => (
              <button key={p.id} onClick={() => enqueueTokens(p.tokens, 'replace')} style={S.pathBtn} title={p.desc}>
                <span style={S.pathIcon}>{p.icon}</span>
                <span style={S.pathName}>{p.name}</span>
                <span style={S.pathCount}>{p.tokens.length}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Main Input & Action Toolbar ────────────────────── */}
      {!isMinimized && (
        <div style={S.toolbar}>
          <form onSubmit={submit} style={S.inputWrap}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type a word or sentence..."
              style={S.input}
            />
            <button type="submit" style={S.signBtn}>Sign</button>
          </form>

          <div style={S.actions}>
            <ToolBtn isLight={isLight} icon={isListeningVoice ? '⏹' : '🎤'} active={isListeningVoice} onClick={toggleVoice} title="Voice Input (M)" />
            <ToolBtn isLight={isLight} icon="📷" active={webcamActive} onClick={toggleWebcam} title={webcamActive ? 'Stop Live Camera AI' : 'Start Live Camera AI (Sign to 3D Avatar)'} />
            <div style={S.divider} />
            <ToolBtn isLight={isLight} icon="🔗" onClick={handleShare} title="Share Sign Link" />
            <ToolBtn isLight={isLight} icon="💾" onClick={handleExport} title="Export Video" />
            <ToolBtn isLight={isLight} icon="📜" active={showHistory} onClick={() => setShowHistory(v => !v)} title="History (H)" />
            <ToolBtn isLight={isLight} icon="❓" active={showQuiz} onClick={() => setShowQuiz(v => !v)} title="Quiz (Q)" />
          </div>
        </div>
      )}

      {/* ─── Notice Toast ───────────────────────────────────── */}
      {notice && <div style={S.toast}>{notice}</div>}

      {/* ─── Fingerspelling Modal ───────────────────────────── */}
      {fingerModal && (
        <div style={S.modalBg}>
          <div style={S.modal}>
            <div style={S.modalIcon}>🔤</div>
            <h3 style={S.modalTitle}>Fingerspell this word?</h3>
            <p style={S.modalDesc}>
              "<strong style={{ color: isLight ? '#4f46e5' : '#a5b4fc' }}>{fingerModal.word}</strong>" — {fingerModal.length} letters, letter by letter?
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => handleFingerspell(fingerModal.word)} style={S.modalPrimary}>Yes, Fingerspell</button>
              <button onClick={handleDeclineFinger} style={S.modalSecondary}>No, Sign Whole</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function ToolBtn({ icon, active, onClick, title, isLight }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 30,
        height: 30,
        borderRadius: 9,
        border: isLight ? '1px solid rgba(215, 203, 185, 0.6)' : '1px solid rgba(255, 255, 255, 0.08)',
        background: active
          ? (isLight ? 'rgba(79, 70, 229, 0.15)' : 'rgba(99, 102, 241, 0.25)')
          : (isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.06)'),
        color: active
          ? (isLight ? '#4f46e5' : '#a5b4fc')
          : (isLight ? '#57534e' : '#cbd5e1'),
        fontSize: '13px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'inherit',
        boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.04)' : 'none',
        transition: 'all 0.2s',
      }}
    >
      {icon}
    </button>
  );
}

function getStyles(isLight, inFrame) {
  return {
    root: {
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      background: inFrame ? 'transparent' : (isLight ? '#faf8f5' : '#060913'),
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Outfit', -apple-system, sans-serif",
      color: isLight ? '#1e1b18' : '#f8fafc',
      margin: 0,
      padding: 0,
      transition: 'background-color 0.35s ease, color 0.35s ease',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 12px',
      background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(10, 14, 26, 0.95)',
      borderBottom: isLight ? '1px solid rgba(215, 203, 185, 0.65)' : '1px solid rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(12px)',
      flexShrink: 0,
      zIndex: 30,
    },
    headerBrand: {
      display: 'flex',
      alignItems: 'center',
      gap: 7,
    },
    brandIcon: {
      width: 22,
      height: 22,
      borderRadius: 7,
      background: isLight
        ? 'linear-gradient(135deg, #4f46e5, #c59b27)'
        : 'linear-gradient(135deg, #6366f1, #06b6d4)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '11px',
      fontWeight: 800,
      boxShadow: isLight ? '0 2px 8px rgba(79, 70, 229, 0.3)' : '0 2px 8px rgba(99, 102, 241, 0.4)',
    },
    brandTitle: {
      fontSize: '13px',
      fontWeight: 800,
      letterSpacing: '-0.02em',
      color: isLight ? '#1e1b18' : '#ffffff',
    },
    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    },
    syncBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      padding: '3px 8px',
      borderRadius: 20,
      background: isLight ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.15)',
      border: isLight ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(16, 185, 129, 0.25)',
      color: isLight ? '#059669' : '#34d399',
      fontSize: '10px',
      fontWeight: 700,
    },
    syncDot: {
      width: 5,
      height: 5,
      borderRadius: '50%',
      background: '#10b981',
      boxShadow: '0 0 6px #10b981',
    },
    headerBtn: {
      width: 26,
      height: 26,
      borderRadius: 7,
      border: isLight ? '1px solid rgba(215, 203, 185, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
      background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
      color: isLight ? '#57534e' : '#94a3b8',
      fontSize: '12px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.04)' : 'none',
      transition: 'all 0.15s ease',
    },
    themeToggleBtn: {
      padding: '3px 7px',
      borderRadius: 8,
      border: isLight ? '1px solid rgba(215, 203, 185, 0.8)' : '1px solid rgba(255, 255, 255, 0.15)',
      background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.08)',
      color: isLight ? '#c59b27' : '#fbbf24',
      fontSize: '11px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: isLight ? '0 2px 8px rgba(197, 155, 39, 0.2)' : '0 2px 8px rgba(251, 191, 36, 0.2)',
      fontWeight: 700,
      transition: 'all 0.15s ease',
    },
    windowControls: {
      display: 'flex',
      alignItems: 'center',
      gap: 3,
      marginLeft: 4,
    },
    windowBtn: {
      width: 22,
      height: 22,
      borderRadius: 6,
      border: 'none',
      background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)',
      color: isLight ? '#78716c' : '#94a3b8',
      fontSize: '10px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.15s ease',
    },
    closeBtn: {
      color: '#ef4444',
    },
    stage: {
      flex: 1,
      overflow: 'hidden',
      position: 'relative',
      transition: 'min-height 0.3s ease',
    },
    webcam: {
      position: 'absolute',
      bottom: 10,
      left: 10,
      width: 220,
      height: 165,
      borderRadius: 14,
      overflow: 'hidden',
      border: isLight ? '2px solid rgba(79, 70, 229, 0.5)' : '2px solid rgba(99, 102, 241, 0.4)',
      background: '#000',
      boxShadow: isLight
        ? '0 16px 40px -6px rgba(45, 30, 20, 0.35), 0 0 16px rgba(79, 70, 229, 0.2)'
        : '0 10px 32px rgba(0,0,0,0.7)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 10,
    },
    webcamLarge: {
      position: 'absolute',
      bottom: 10,
      left: 10,
      width: 340,
      height: 255,
      borderRadius: 16,
      overflow: 'hidden',
      border: isLight ? '3px solid #4f46e5' : '3px solid rgba(99, 102, 241, 0.7)',
      background: '#000',
      boxShadow: isLight
        ? '0 24px 54px -8px rgba(45, 30, 20, 0.45), 0 0 24px rgba(79, 70, 229, 0.3)'
        : '0 16px 48px rgba(0,0,0,0.85)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 20,
    },
    webcamVideo: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transform: 'scaleX(-1)',
    },
    liveDot: {
      position: 'absolute',
      top: 6,
      left: 8,
      fontSize: '8px',
      color: '#fff',
      fontWeight: 800,
      background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(4px)',
      padding: '2px 7px',
      borderRadius: 6,
    },
    webcamSignBadge: {
      position: 'absolute',
      bottom: 6,
      left: 6,
      right: 6,
      background: isLight ? 'rgba(79, 70, 229, 0.92)' : 'rgba(99, 102, 241, 0.88)',
      backdropFilter: 'blur(8px)',
      color: '#fff',
      fontSize: '10px',
      fontWeight: 700,
      padding: '4px 8px',
      borderRadius: 6,
      textAlign: 'center',
      pointerEvents: 'none',
      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
    },
    webcamToggleBtn: {
      position: 'absolute',
      top: 6,
      right: 6,
      fontSize: '9px',
      fontWeight: 700,
      background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(4px)',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.2)',
      padding: '3px 8px',
      borderRadius: 8,
      cursor: 'pointer',
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    },
    speedBar: {
      display: 'flex',
      justifyContent: 'center',
      gap: 3,
      padding: '4px 0',
      background: isLight ? 'rgba(245, 240, 230, 0.95)' : 'rgba(10, 14, 26, 0.7)',
      borderTop: isLight ? '1px solid rgba(215, 203, 185, 0.5)' : '1px solid rgba(255,255,255,0.04)',
    },
    speedBtn: {
      padding: '2px 9px',
      borderRadius: 6,
      border: 'none',
      background: 'transparent',
      color: isLight ? '#78716c' : '#64748b',
      fontSize: '9px',
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: 'inherit',
      transition: 'all 0.15s',
    },
    speedActive: {
      background: isLight ? '#4f46e5' : 'rgba(99,102,241,0.25)',
      color: isLight ? '#ffffff' : '#a5b4fc',
      boxShadow: isLight ? '0 2px 6px rgba(79, 70, 229, 0.35)' : 'none',
    },
    pathsWrap: {
      padding: '8px 10px',
      background: isLight ? '#faf8f5' : 'rgba(10, 14, 26, 0.8)',
      borderTop: isLight ? '1px solid rgba(215, 203, 185, 0.5)' : '1px solid rgba(255,255,255,0.04)',
    },
    pathsHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    pathsTitle: {
      fontSize: '9px',
      fontWeight: 800,
      color: isLight ? '#78716c' : '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.6px',
    },
    pathsClose: {
      background: 'none',
      border: 'none',
      color: isLight ? '#78716c' : '#64748b',
      fontSize: '14px',
      cursor: 'pointer',
      padding: '0 4px',
    },
    pathsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 4,
    },
    pathBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 9px',
      borderRadius: 9,
      border: isLight ? '1px solid rgba(215, 203, 185, 0.7)' : '1px solid rgba(255,255,255,0.05)',
      background: isLight ? '#ffffff' : 'rgba(255,255,255,0.03)',
      color: isLight ? '#1e1b18' : '#e2e8f0',
      fontSize: '10px',
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: 'inherit',
      textAlign: 'left',
      boxShadow: isLight ? '0 2px 6px rgba(45, 30, 20, 0.05)' : 'none',
    },
    pathIcon: { fontSize: '12px' },
    pathName: { flex: 1 },
    pathCount: {
      fontSize: '8px',
      color: isLight ? '#a8a29e' : '#475569',
      fontWeight: 600,
    },
    toolbar: {
      padding: '10px 12px',
      background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(10, 14, 26, 0.95)',
      backdropFilter: 'blur(16px)',
      borderTop: isLight ? '1px solid rgba(215, 203, 185, 0.65)' : '1px solid rgba(255, 255, 255, 0.08)',
      flexShrink: 0,
      boxShadow: isLight ? '0 -4px 18px rgba(45, 30, 20, 0.03)' : 'none',
    },
    inputWrap: {
      display: 'flex',
      gap: 6,
      marginBottom: 7,
    },
    input: {
      flex: 1,
      background: isLight ? '#ffffff' : 'rgba(255,255,255,0.06)',
      border: isLight ? '1px solid rgba(215, 203, 185, 0.85)' : '1px solid rgba(255,255,255,0.12)',
      borderRadius: 11,
      padding: '8px 12px',
      fontSize: '11px',
      color: isLight ? '#1e1b18' : '#f8fafc',
      outline: 'none',
      fontFamily: 'inherit',
      boxShadow: isLight
        ? '0 2px 6px rgba(45, 30, 20, 0.03), inset 0 1px 2px rgba(0,0,0,0.02)'
        : 'inset 0 1px 2px rgba(0,0,0,0.2)',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    signBtn: {
      padding: '0 18px',
      borderRadius: 11,
      border: 'none',
      background: isLight
        ? 'linear-gradient(135deg, #4f46e5, #6366f1)'
        : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      color: '#fff',
      fontSize: '11px',
      fontWeight: 800,
      cursor: 'pointer',
      fontFamily: 'inherit',
      boxShadow: isLight
        ? '0 4px 16px rgba(79, 70, 229, 0.4), 0 1px 3px rgba(0,0,0,0.08)'
        : '0 4px 16px rgba(99, 102, 241, 0.45)',
      transition: 'transform 0.15s, box-shadow 0.15s',
    },
    actions: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      justifyContent: 'space-between',
    },
    divider: {
      width: 1,
      height: 16,
      background: isLight ? 'rgba(215, 203, 185, 0.65)' : 'rgba(255,255,255,0.08)',
      margin: '0 2px',
    },
    toast: {
      position: 'absolute',
      bottom: 82,
      left: '50%',
      transform: 'translateX(-50%)',
      background: isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(15,20,35,0.95)',
      backdropFilter: 'blur(12px)',
      border: isLight ? '1px solid rgba(215, 203, 185, 0.85)' : '1px solid rgba(99,102,241,0.3)',
      color: isLight ? '#1e1b18' : '#e2e8f0',
      fontSize: '10px',
      fontWeight: 700,
      padding: '6px 16px',
      borderRadius: 12,
      whiteSpace: 'nowrap',
      zIndex: 35,
      boxShadow: isLight
        ? '0 14px 36px -4px rgba(45, 30, 20, 0.25), 0 4px 12px rgba(79, 70, 229, 0.15)'
        : '0 12px 32px rgba(0,0,0,0.6)',
      animation: 'fadeInUp 0.2s ease-out',
    },
    modalBg: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      zIndex: 40,
    },
    modal: {
      width: '100%',
      maxWidth: 300,
      background: isLight ? '#ffffff' : 'rgba(15,20,35,0.96)',
      border: isLight ? '1px solid rgba(215, 203, 185, 0.8)' : '1px solid rgba(99,102,241,0.2)',
      borderRadius: 18,
      padding: '20px',
      boxShadow: isLight
        ? '0 20px 50px rgba(180, 160, 140, 0.25)'
        : '0 24px 60px rgba(0,0,0,0.6)',
    },
    modalIcon: { fontSize: 26, textAlign: 'center', marginBottom: 6 },
    modalTitle: {
      fontSize: '13px',
      fontWeight: 800,
      textAlign: 'center',
      margin: '0 0 6px',
      color: isLight ? '#1e1b18' : '#f8fafc',
    },
    modalDesc: {
      fontSize: '11px',
      textAlign: 'center',
      color: isLight ? '#57534e' : '#94a3b8',
      margin: '0 0 14px',
      lineHeight: 1.5,
    },
    modalPrimary: {
      flex: 1,
      padding: '9px',
      borderRadius: 10,
      border: 'none',
      background: isLight
        ? 'linear-gradient(135deg, #4f46e5, #6366f1)'
        : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      color: '#fff',
      fontSize: '11px',
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: 'inherit',
    },
    modalSecondary: {
      flex: 1,
      padding: '9px',
      borderRadius: 10,
      border: isLight ? '1px solid rgba(215, 203, 185, 0.8)' : '1px solid rgba(255,255,255,0.12)',
      background: isLight ? '#f5f0e6' : 'rgba(255,255,255,0.05)',
      color: isLight ? '#57534e' : '#94a3b8',
      fontSize: '11px',
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'inherit',
    },
  };
}

export default App;
