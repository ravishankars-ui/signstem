import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAnimationQueue } from './hooks/useAnimationQueue';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useHistory } from './hooks/useHistory';
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

export function App() {
  const [avatarConfig] = useState(() => {
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
  const [showPaths, setShowPaths] = useState(true);
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamStream, setWebcamStream] = useState(null);

  const tabStreamRef = useRef(null);
  const tabAudioRef = useRef(null);
  const noticeTimer = useRef(null);

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
    } catch {}
  }, [addHistory]);

  const handleSequenceComplete = useCallback(() => {
    try {
      if (window.parent !== window) window.parent.postMessage({ type: 'ISL_SEQUENCE_COMPLETED' }, '*');
    } catch {}
  }, []);

  const {
    queue, currentItem, isIdle, isPlaying, playbackRate, setPlaybackRate,
    enqueueTokens, handleAnimationEnd, handleAnimationError,
    clearQueue, skipCurrent, togglePlayPause
  } = useAnimationQueue({ onTokenStart: handleTokenStart, onSequenceComplete: handleSequenceComplete });

  useEffect(() => {
    try { if (window.parent !== window) window.parent.postMessage({ type: 'ISL_SEQUENCER_READY' }, '*'); } catch {}
  }, []);

  useEffect(() => { autoPlayFromURL(enqueueTokens); }, [enqueueTokens]);

  const processText = useCallback((text) => {
    if (!text?.trim()) return;
    const longWords = detectLongWords(text.trim(), 6);
    if (longWords.length > 0) { setFingerModal(longWords[0]); return; }
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
    if (!SR) { flash('Speech not supported in this browser'); return; }
    if (isListeningVoice) { setIsListeningVoice(false); return; }
    const r = new SR();
    r.continuous = false; r.interimResults = false; r.lang = 'en-IN';
    r.onstart = () => { setIsListeningVoice(true); flash('Listening...'); };
    r.onresult = (e) => { const t = e.results[0][0].transcript; setInput(t); flash(`Heard: "${t}"`); processText(t); };
    r.onerror = () => { setIsListeningVoice(false); flash('Voice error'); };
    r.onend = () => setIsListeningVoice(false);
    try { r.start(); } catch { setIsListeningVoice(false); }
  };

  const startTabListen = async () => {
    try {
      if (typeof chrome === 'undefined' || !chrome?.tabCapture) { flash('Tab capture needs the extension'); return; }
      const stream = await new Promise((ok, no) => chrome.tabCapture.capture({ audio: true, video: false }, s => chrome.runtime.lastError ? no(new Error(chrome.runtime.lastError.message)) : ok(s)));
      tabStreamRef.current = stream;
      const audio = new Audio(); audio.srcObject = stream; audio.muted = true;
      tabAudioRef.current = audio; await audio.play();
      setIsListeningTab(true); flash('Listening to tab audio...');
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        const r = new SR(); r.continuous = true; r.interimResults = false; r.lang = 'en-IN';
        r.onresult = (e) => { const l = e.results[e.results.length - 1]; if (l.isFinal) { const t = l[0].transcript; setInput(t); processText(t); } };
        r.onend = () => { if (isListeningTab && tabStreamRef.current) try { r.start(); } catch {} };
        r.start();
      }
    } catch (err) { flash('Tab capture failed: ' + (err.message || 'denied')); }
  };

  const stopTabListen = () => {
    tabStreamRef.current?.getTracks().forEach(t => t.stop()); tabStreamRef.current = null;
    tabAudioRef.current = null; setIsListeningTab(false); flash('Tab listening stopped');
  };

  useEffect(() => () => { tabStreamRef.current?.getTracks().forEach(t => t.stop()); webcamStream?.getTracks().forEach(t => t.stop()); }, []);

  const toggleWebcam = useCallback(async () => {
    if (webcamActive) { webcamStream?.getTracks().forEach(t => t.stop()); setWebcamStream(null); setWebcamActive(false); }
    else { try { const s = await navigator.mediaDevices.getUserMedia({ video: { width: 160, height: 120, facingMode: 'user' }, audio: false }); setWebcamStream(s); setWebcamActive(true); } catch { flash('Webcam denied'); } }
  }, [webcamActive, webcamStream]);

  const handleExport = useCallback(async () => { flash('Recording 5s...'); try { await exportVideo(5000); flash('Exported!'); } catch { flash('Export failed'); } }, []);

  const handleShare = useCallback(() => {
    const tokens = queue.length > 0 ? queue.map(q => q.token).filter(Boolean) : currentItem?.token ? [currentItem.token] : null;
    if (!tokens?.length) { flash('Nothing to share'); return; }
    const link = createShareLink(tokens);
    navigator.clipboard.writeText(link).then(() => flash('Link copied!')).catch(() => flash(link));
  }, [queue, currentItem]);

  const cycleSpeed = useCallback(() => {
    const idx = speeds.indexOf(playbackRate);
    setPlaybackRate(speeds[(idx + 1) % speeds.length]);
  }, [playbackRate, setPlaybackRate]);

  useKeyboardShortcuts({
    onPlayPause: togglePlayPause, onSkip: skipCurrent, onPrev: () => {},
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
          const t = d.tokens || d.words || d.payload;
          if (t) enqueueTokens(t, d.mode || 'replace'); break;
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

  if (isHidden) return null;

  const inFrame = window.self !== window.top;

  if (inFrame) {
    return (
      <main style={S.root}>
        {/* Avatar */}
        <div style={{ ...S.stage, minHeight: isMinimized ? 0 : undefined }}>
          {!isMinimized && (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <Player currentItem={currentItem} nextItems={queue} onEnded={handleAnimationEnd} onError={handleAnimationError} isPlaying={isPlaying} playbackRate={playbackRate} avatarConfig={avatarConfig} />
              {webcamActive && webcamStream && (
                <div style={S.webcam}>
                  <video ref={el => { if (el) el.srcObject = webcamStream; }} autoPlay playsInline muted style={S.webcamVideo} />
                  <span style={S.liveDot}>● LIVE</span>
                </div>
              )}
            </div>
          )}
          <HistoryPanel history={history} isOpen={showHistory} onClose={() => setShowHistory(false)} onClear={clearHistory} onExport={exportHistory} />
          <QuizOverlay isOpen={showQuiz} onClose={() => setShowQuiz(false)} onReveal={t => enqueueTokens([t], 'replace')} />
        </div>

        {/* Subtitle */}
        {!isMinimized && <SubtitleBar currentItem={currentItem} queue={queue} isIdle={isIdle} />}

        {/* Speed + Learning Paths */}
        {!isMinimized && !isIdle && (
          <div style={S.speedBar}>
            {SPEEDS.map(s => (
              <button key={s} onClick={() => setPlaybackRate(s)} style={{ ...S.speedBtn, ...(playbackRate === s ? S.speedActive : {}) }}>{s}x</button>
            ))}
          </div>
        )}

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

        {/* Toolbar */}
        {!isMinimized && (
          <div style={S.toolbar}>
            <form onSubmit={submit} style={S.inputWrap}>
              <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Type a word or sentence..." style={S.input} />
              <button type="submit" style={S.signBtn}>Sign</button>
            </form>
            <div style={S.actions}>
              <ToolBtn icon={isListeningVoice ? '⏹' : '🎤'} active={isListeningVoice} onClick={toggleVoice} title="Voice (M)" />
              <ToolBtn icon="📷" onClick={() => { flash('Open recognition side panel'); }} title="Live Recognition" />
              <div style={S.divider} />
              <ToolBtn icon="🔗" onClick={handleShare} title="Share" />
              <ToolBtn icon="💾" onClick={handleExport} title="Export" />
              <ToolBtn icon="📹" active={webcamActive} onClick={toggleWebcam} title="Webcam (W)" />
              <ToolBtn icon="📜" active={showHistory} onClick={() => setShowHistory(v => !v)} title="History (H)" />
              <ToolBtn icon="❓" active={showQuiz} onClick={() => setShowQuiz(v => !v)} title="Quiz (Q)" />
            </div>
          </div>
        )}

        {/* Notice Toast */}
        {notice && <div style={S.toast}>{notice}</div>}

        {/* Fingerspelling Modal */}
        {fingerModal && (
          <div style={S.modalBg}>
            <div style={S.modal}>
              <div style={S.modalIcon}>🔤</div>
              <h3 style={S.modalTitle}>Fingerspell this word?</h3>
              <p style={S.modalDesc}>"<strong style={{ color: '#a5b4fc' }}>{fingerModal.word}</strong>" — {fingerModal.length} letters, letter by letter?</p>
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

  return (
    <main style={S.rootFull}>
      <Player currentItem={currentItem} nextItems={queue} onEnded={handleAnimationEnd} onError={handleAnimationError} isPlaying={isPlaying} playbackRate={playbackRate} avatarConfig={avatarConfig} />
    </main>
  );
}

function ToolBtn({ icon, active, onClick, title }) {
  return <button onClick={onClick} title={title} style={{ ...S.toolBtn, background: active ? 'rgba(99,102,241,0.2)' : undefined, color: active ? '#a5b4fc' : undefined }}>{icon}</button>;
}

const S = {
  root: {
    width: '100%', height: '100%', overflow: 'hidden', background: 'transparent',
    display: 'flex', flexDirection: 'column', fontFamily: "'Outfit', -apple-system, sans-serif",
    color: '#f1f5f9', margin: 0, padding: 0,
  },
  rootFull: {
    width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#02040a',
  },
  stage: { flex: 1, overflow: 'hidden', position: 'relative', transition: 'min-height 0.3s ease' },

  webcam: {
    position: 'absolute', bottom: 10, left: 10, width: 120, height: 90, borderRadius: 12,
    overflow: 'hidden', border: '2px solid rgba(99,102,241,0.3)', background: '#000',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
  },
  webcamVideo: { width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' },
  liveDot: { position: 'absolute', top: 4, left: 6, fontSize: '7px', color: '#ef4444', fontWeight: 700 },

  speedBar: {
    display: 'flex', justifyContent: 'center', gap: 2, padding: '4px 0',
    background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.04)',
  },
  speedBtn: {
    padding: '2px 8px', borderRadius: 6, border: 'none', background: 'transparent',
    color: '#64748b', fontSize: '9px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  },
  speedActive: { background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' },

  pathsWrap: { padding: '6px 8px', borderTop: '1px solid rgba(255,255,255,0.04)' },
  pathsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  pathsTitle: { fontSize: '9px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' },
  pathsClose: { background: 'none', border: 'none', color: '#64748b', fontSize: '14px', cursor: 'pointer', padding: '0 4px' },
  pathsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 },
  pathBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.03)',
    color: '#e2e8f0', fontSize: '10px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
  },
  pathIcon: { fontSize: '12px' },
  pathName: { flex: 1 },
  pathCount: { fontSize: '8px', color: '#475569', fontWeight: 500 },

  toolbar: {
    padding: '8px 10px', background: 'rgba(10,12,24,0.85)', backdropFilter: 'blur(16px)',
    borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0,
  },
  inputWrap: { display: 'flex', gap: 6, marginBottom: 6 },
  input: {
    flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '7px 12px', fontSize: '11px', color: '#f8fafc',
    outline: 'none', fontFamily: 'inherit',
  },
  signBtn: {
    padding: '0 16px', borderRadius: 10, border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
  },
  actions: { display: 'flex', alignItems: 'center', gap: 2 },
  toolBtn: {
    width: 28, height: 28, borderRadius: 8, border: 'none',
    background: 'rgba(255,255,255,0.06)', fontSize: '12px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit',
  },
  divider: { width: 1, height: 16, background: 'rgba(255,255,255,0.08)', margin: '0 3px' },

  toast: {
    position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
    background: 'rgba(15,20,35,0.92)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0',
    fontSize: '10px', fontWeight: 600, padding: '5px 14px', borderRadius: 10,
    whiteSpace: 'nowrap', zIndex: 10, animation: 'fadeInUp 0.2s ease-out',
  },

  modalBg: {
    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 20,
  },
  modal: {
    width: '100%', maxWidth: 300, background: 'rgba(15,20,35,0.96)',
    border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16, padding: '20px',
    boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
  },
  modalIcon: { fontSize: 24, textAlign: 'center', marginBottom: 6 },
  modalTitle: { fontSize: '13px', fontWeight: 700, textAlign: 'center', margin: '0 0 6px', color: '#f8fafc' },
  modalDesc: { fontSize: '11px', textAlign: 'center', color: '#94a3b8', margin: '0 0 14px', lineHeight: 1.5 },
  modalPrimary: {
    flex: 1, padding: '9px', borderRadius: 10, border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
  },
  modalSecondary: {
    flex: 1, padding: '9px', borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)',
    color: '#94a3b8', fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  },
};

export default App;
