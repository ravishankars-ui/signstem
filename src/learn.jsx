import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RealisticHumanAvatar } from './components/HumanSignAvatar/RealisticHumanAvatar';
import { useAnimationQueue } from './hooks/useAnimationQueue';
import { useScreenCapture } from './hooks/useScreenCapture';
import { useSignRecognition } from './hooks/useSignRecognition';
import { CustomizerModal } from './components/CustomizerModal';
import { DEFAULT_AVATAR_CONFIG, EXTENSION_THEMES } from './constants/avatarCustomization';
import { ISL_WORD_POSES } from './constants/islPoseData';
import { transformToISLGrammar, detectLongWords, breakIntoFingerspelling } from './utils/islGrammarEngine';
import { importCustomAnimation } from './utils/animationFileImporter';

const extensionApi = globalThis.chrome?.storage ? globalThis.chrome : null;

// STEM Vocabulary & Categories
const STEM_CATEGORIES = {
  'ALL': 'All Concepts',
  'PHYSICS': '⚛ Physics & Energy',
  'MATH': '∑ Mathematics',
  'CHEMISTRY': '⚗ Chemistry & Matter',
  'BIOLOGY': '🧬 Biology & Life',
  'CS': '💻 Computer Science',
  'GREETINGS': '👋 Greetings & Courtesy',
  'ALPHABET': '🔤 Alphabet A-Z',
  'NUMBERS': '🔢 Numbers 0-9'
};

const VOCABULARY_LIST = [
  // Physics
  { token: 'MOTION', label: 'Motion', category: 'PHYSICS', desc: 'Continuous change in position of an object' },
  { token: 'FORCE', label: 'Force', category: 'PHYSICS', desc: 'Push or pull acting upon an object' },
  { token: 'GRAVITY', label: 'Gravity', category: 'PHYSICS', desc: 'Universal attractive force between masses' },
  { token: 'ENERGY', label: 'Energy', category: 'PHYSICS', desc: 'Capacity for doing work or producing heat' },
  { token: 'LIGHT', label: 'Light', category: 'PHYSICS', desc: 'Electromagnetic radiation visible to human eye' },
  { token: 'WAVE', label: 'Wave', category: 'PHYSICS', desc: 'Oscillating disturbance traveling through medium' },
  { token: 'VELOCITY', label: 'Velocity', category: 'PHYSICS', desc: 'Speed of an object in a given direction' },
  { token: 'ACCELERATION', label: 'Acceleration', category: 'PHYSICS', desc: 'Rate of change of velocity over time' },
  { token: 'MASS', label: 'Mass', category: 'PHYSICS', desc: 'Quantity of matter in a physical body' },

  // Mathematics
  { token: 'NUMBER', label: 'Number', category: 'MATH', desc: 'Mathematical object used to count and measure' },
  { token: 'EQUAL', label: 'Equal (=)', category: 'MATH', desc: 'Identical in value, quantity, or degree' },
  { token: 'ADD', label: 'Addition (+)', category: 'MATH', desc: 'Combining numbers into a single sum' },
  { token: 'SUBTRACT', label: 'Subtraction (-)', category: 'MATH', desc: 'Taking one quantity away from another' },
  { token: 'MULTIPLY', label: 'Multiply (×)', category: 'MATH', desc: 'Repeated addition of numbers' },
  { token: 'DIVIDE', label: 'Division (÷)', category: 'MATH', desc: 'Splitting into equal parts' },
  { token: 'CIRCLE', label: 'Circle', category: 'MATH', desc: 'Round plane figure with equidistant boundary' },
  { token: 'TRIANGLE', label: 'Triangle', category: 'MATH', desc: 'Three-sided closed polygon' },
  { token: 'ANGLE', label: 'Angle', category: 'MATH', desc: 'Figure formed by two rays meeting at vertex' },

  // Chemistry
  { token: 'ATOM', label: 'Atom', category: 'CHEMISTRY', desc: 'Basic unit of a chemical element' },
  { token: 'MOLECULE', label: 'Molecule', category: 'CHEMISTRY', desc: 'Group of bonded atoms' },
  { token: 'ELEMENT', label: 'Element', category: 'CHEMISTRY', desc: 'Pure substance consisting of only one atom type' },
  { token: 'REACTION', label: 'Reaction', category: 'CHEMISTRY', desc: 'Process that transforms chemical substances' },
  { token: 'LIQUID', label: 'Liquid', category: 'CHEMISTRY', desc: 'Fluid state of matter with definite volume' },
  { token: 'GAS', label: 'Gas', category: 'CHEMISTRY', desc: 'State of matter expanding freely to fill container' },
  { token: 'SOLID', label: 'Solid', category: 'CHEMISTRY', desc: 'Firm, stable state of matter' },

  // Biology
  { token: 'CELL', label: 'Cell', category: 'BIOLOGY', desc: 'Smallest structural and functional unit of life' },
  { token: 'DNA', label: 'DNA', category: 'BIOLOGY', desc: 'Carrier of genetic information in living organisms' },
  { token: 'HEART', label: 'Heart', category: 'BIOLOGY', desc: 'Muscular organ pumping blood throughout body' },
  { token: 'BRAIN', label: 'Brain', category: 'BIOLOGY', desc: 'Central organ of human nervous system' },
  { token: 'PLANT', label: 'Plant', category: 'BIOLOGY', desc: 'Photosynthetic multicellular organism' },

  // Computer Science
  { token: 'COMPUTER', label: 'Computer', category: 'CS', desc: 'Electronic device for processing data' },
  { token: 'CODE', label: 'Code', category: 'CS', desc: 'Program instructions written for execution' },
  { token: 'ALGORITHM', label: 'Algorithm', category: 'CS', desc: 'Step-by-step process for problem-solving' },
  { token: 'DATA', label: 'Data', category: 'CS', desc: 'Quantities, characters, or symbols processed by computer' },
  { token: 'NETWORK', label: 'Network', category: 'CS', desc: 'Interconnected system of computing devices' },

  // Greetings & Core Signs
  { token: 'NAMASTE', label: 'Namaste', category: 'GREETINGS', desc: 'Traditional Indian greeting of respect' },
  { token: 'HELLO', label: 'Hello', category: 'GREETINGS', desc: 'Friendly greeting wave' },
  { token: 'GOOD', label: 'Good', category: 'GREETINGS', desc: 'Thumbs up affirmative gesture' },
  { token: 'THANK_YOU', label: 'Thank You', category: 'GREETINGS', desc: 'Expression of gratitude' },
  { token: 'PLEASE', label: 'Please', category: 'GREETINGS', desc: 'Polite request gesture' },
  { token: 'HELP', label: 'Help', category: 'GREETINGS', desc: 'Request for assistance' },
  { token: 'YES', label: 'Yes', category: 'GREETINGS', desc: 'Affirmative nod gesture' },
  { token: 'NO', label: 'No', category: 'GREETINGS', desc: 'Negation gesture' },
  { token: 'LOVE', label: 'Love', category: 'GREETINGS', desc: 'Affection gesture (🤟)' },
  { token: 'OK', label: 'OK', category: 'GREETINGS', desc: 'Agreement approval gesture (👌)' },
  { token: 'YOU', label: 'You', category: 'GREETINGS', desc: 'Pointing to second person' },
  { token: 'ME', label: 'Me / I', category: 'GREETINGS', desc: 'Pointing to oneself' },
  { token: 'FRIEND', label: 'Friend', category: 'GREETINGS', desc: 'Interlocking index fingers' },
  { token: 'LEARN', label: 'Learn', category: 'GREETINGS', desc: 'Absorbing knowledge to mind' },
  { token: 'STUDY', label: 'Study', category: 'GREETINGS', desc: 'Reading & focusing on knowledge' },
  { token: 'WORK', label: 'Work', category: 'GREETINGS', desc: 'Labor and activity gesture' },
  { token: 'JOB', label: 'Job', category: 'GREETINGS', desc: 'Professional role gesture' },
  { token: 'SIGN', label: 'Sign Language', category: 'GREETINGS', desc: 'Rotating expressive hands' },
  { token: 'STOP', label: 'Stop', category: 'GREETINGS', desc: 'Hand down on open palm' }
];

// Add Alphabet A-Z
for (let i = 65; i <= 90; i++) {
  const char = String.fromCharCode(i);
  VOCABULARY_LIST.push({
    token: char,
    label: `Letter ${char}`,
    category: 'ALPHABET',
    desc: `ISL fingerspelling sign for letter ${char}`
  });
}

// Add Numbers 0-9
for (let i = 0; i <= 9; i++) {
  VOCABULARY_LIST.push({
    token: `${i}`,
    label: `Number ${i}`,
    category: 'NUMBERS',
    desc: `ISL numerical sign for digit ${i}`
  });
}

function StudioApp() {
  const [activeTab, setActiveTab] = useState('learn'); // 'learn' | 'practise' | 'recognize'
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [customInputText, setCustomInputText] = useState('');
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Practice Mode State
  const [quizIndex, setQuizIndex] = useState(0);
  const [isQuizRevealed, setIsQuizRevealed] = useState(false);
  const [practiceScore, setPracticeScore] = useState({ correct: 0, total: 0 });

  // Practice Quiz Items
  const practiceItems = useMemo(() => {
    return VOCABULARY_LIST.filter(v => v.category !== 'ALPHABET' && v.category !== 'NUMBERS');
  }, []);

  const currentQuizItem = practiceItems[quizIndex % practiceItems.length];

  const handleNextQuiz = useCallback((known = true) => {
    setPracticeScore(prev => ({
      correct: prev.correct + (known ? 1 : 0),
      total: prev.total + 1
    }));
    setIsQuizRevealed(false);
    setQuizIndex(prev => prev + 1);
  }, []);

  // Camera & Recognition State
  const [recogSource, setRecogSource] = useState('camera'); // 'camera' | 'screen'
  const [recogActive, setRecogActive] = useState(false);
  const [recogHistory, setRecogHistory] = useState([]);
  const [isCameraExpanded, setIsCameraExpanded] = useState(false);
  const [videoFitMode, setVideoFitMode] = useState('contain'); // 'contain' | 'cover'

  // Avatar Configuration & Theme Mode
  const [avatarConfig, setAvatarConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('isl_avatar_config');
      return saved ? JSON.parse(saved) : DEFAULT_AVATAR_CONFIG;
    } catch {
      return DEFAULT_AVATAR_CONFIG;
    }
  });

  const isLightMode = avatarConfig.themeMode === 'light';

  // Apply theme class to body and HTML dynamically for smooth transition
  useEffect(() => {
    const rootClassList = document.documentElement.classList;
    const bodyClassList = document.body.classList;
    if (isLightMode) {
      rootClassList.add('theme-light');
      bodyClassList.add('theme-light');
    } else {
      rootClassList.remove('theme-light');
      bodyClassList.remove('theme-light');
    }
  }, [isLightMode]);

  const handleUpdateAvatarConfig = (newConfig) => {
    setAvatarConfig(newConfig);
    try {
      localStorage.setItem('isl_avatar_config', JSON.stringify(newConfig));
      if (extensionApi?.storage?.sync) {
        extensionApi.storage.sync.set({
          themeMode: newConfig.themeMode,
          themeId: newConfig.themeId
        });
      }
    } catch (e) {
      console.debug('Failed to save config:', e);
    }
  };

  const toggleThemeMode = () => {
    const nextMode = isLightMode ? 'dark' : 'light';
    handleUpdateAvatarConfig({ ...avatarConfig, themeMode: nextMode });
  };

  // Animation Queue for Avatar
  const {
    queue,
    currentItem,
    isIdle,
    playbackRate,
    setPlaybackRate,
    enqueueTokens,
    handleAnimationEnd,
    clearQueue,
    skipCurrent
  } = useAnimationQueue();

  // Screen/Webcam Capture Hook
  const {
    stream,
    isCapturing,
    sourceType,
    error: captureError,
    startCapture,
    stopCapture
  } = useScreenCapture();

  // Voice ASR & Speech Notice State
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [speechNotice, setSpeechNotice] = useState('');

  // Live Gesture Callback (ISL -> Text & Voice Output)
  const handleSignRecognized = useCallback((gesture) => {
    setRecogHistory((prev) => [{ ...gesture, time: Date.now() }, ...prev].slice(0, 10));
    enqueueTokens(gesture.sign, 'replace');

    // ISL -> Voice (Speech Synthesis)
    if ('speechSynthesis' in window && gesture.sign) {
      try {
        window.speechSynthesis.cancel(); // Stop any pending utterance
        const utterance = new SpeechSynthesisUtterance(gesture.sign);
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.debug('TTS Error:', e);
      }
    }

    // Auto-verify Practice Challenge Quiz answers
    if (activeTab === 'practice' && currentQuizItem && (gesture.token === currentQuizItem.token || gesture.sign === currentQuizItem.token)) {
      setSpeechNotice(`🎉 Excellent! You correctly signed "${currentQuizItem.label}" with ${gesture.accuracy?.overallScore || 90}% accuracy!`);
      handleNextQuiz(true);
    }
  }, [enqueueTokens, activeTab, currentQuizItem]);


  // MediaPipe AI Gesture Recognition Hook
  const {
    isRunning,
    lastSign,
    fps,
    handDetected,
    accuracyMetrics,
    facialCues,
    statusMessage: recogStatus
  } = useSignRecognition({
    stream,
    enabled: recogActive && Boolean(stream),
    onSignRecognized: handleSignRecognized,
    confidenceThreshold: 50
  });


  // Filtered Vocabulary
  const filteredVocab = useMemo(() => {
    return VOCABULARY_LIST.filter((item) => {
      const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
      const matchesSearch = !searchQuery ||
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Long Word Detection & Interactive Fingerspelling Permission State
  const [detectedLongWords, setDetectedLongWords] = useState([]);
  const [activeFingerspellingWord, setActiveFingerspellingWord] = useState(null);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [pendingPermissionWord, setPendingPermissionWord] = useState(null);

  // Trigger Fingerspelling Letter-by-Letter for a target word
  const handleFingerspellWord = (word) => {
    setActiveFingerspellingWord(word);
    setIsPermissionModalOpen(false);
    const letterTokens = breakIntoFingerspelling(word);
    if (letterTokens.length > 0) {
      enqueueTokens(letterTokens.map(t => t.token), 'replace');
      setSpeechNotice(`🔤 Practicing letter-by-letter fingerspelling for "${word}"`);
    }
  };

  const handleDeclineFingerspelling = () => {
    setIsPermissionModalOpen(false);
    if (pendingPermissionWord) {
      const parsed = transformToISLGrammar(customInputText.trim());
      const tokensToPlay = parsed.tokens.map(t => t.token);
      if (tokensToPlay.length > 0) {
        enqueueTokens(tokensToPlay, 'replace');
      }
    }
  };

  // Voice ASR Speech Input (Voice -> ISL)
  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition API is not supported in this browser. Please use Google Chrome.');
      return;
    }

    if (isListeningVoice) {
      setIsListeningVoice(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListeningVoice(true);
        setSpeechNotice('🎙 Listening... Speak your sentence now!');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSpeechNotice(`Heard: "${transcript}"`);
        setCustomInputText(transcript);

        // Detect Long Words & Ask Permission
        const longWords = detectLongWords(transcript, 6);
        setDetectedLongWords(longWords);
        if (longWords.length > 0) {
          setPendingPermissionWord(longWords[0]);
          setIsPermissionModalOpen(true);
        } else {
          // Pass through ISL Grammar Engine (SVO -> SOV) & Enqueue
          const parsed = transformToISLGrammar(transcript);
          const tokensToPlay = parsed.tokens.map(t => t.token);
          if (tokensToPlay.length > 0) {
            enqueueTokens(tokensToPlay, 'replace');
          }
        }
      };

      recognition.onerror = (e) => {
        setSpeechNotice(`Speech error: ${e.error}`);
        setIsListeningVoice(false);
      };

      recognition.onend = () => {
        setIsListeningVoice(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListeningVoice(false);
    }
  };

  // Handle playing custom text sequence with ISL Grammar Transformation & Long Word Permission
  const handlePlayCustomText = (e) => {
    e?.preventDefault();
    if (!customInputText.trim()) return;

    // Check for Long Words (>= 6 characters)
    const longWords = detectLongWords(customInputText.trim(), 6);
    setDetectedLongWords(longWords);

    if (longWords.length > 0) {
      setPendingPermissionWord(longWords[0]);
      setIsPermissionModalOpen(true);
      return;
    }

    // Pass through ISL Grammar Engine (SVO -> SOV)
    const parsed = transformToISLGrammar(customInputText.trim());
    const tokensToPlay = parsed.tokens.map(t => t.token);
    if (tokensToPlay.length > 0) {
      enqueueTokens(tokensToPlay, 'replace');
    } else {
      enqueueTokens(customInputText.trim(), 'replace');
    }
  };

  // Handle Custom Animation File Upload (.json, .glb, .vrm)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      const res = importCustomAnimation(content, 'json');
      if (res.success) {
        alert(`Success! Registered custom animation signs: ${res.registeredSigns.join(', ')}`);
        if (res.registeredSigns.length > 0) {
          enqueueTokens(res.registeredSigns[0], 'replace');
        }
      } else {
        alert(`Import Error: ${res.error}`);
      }
    };
    reader.readAsText(file);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== 'recognize' && isCapturing) {
      setRecogActive(false);
      stopCapture();
    }
  };

  const handleStartRecogSession = (type) => {
    setRecogSource(type);
    startCapture(type);
    setRecogActive(true);
  };

  return (
    <div className={`isl-app-root min-h-screen flex flex-col transition-colors duration-400 ${
      isLightMode ? 'bg-slate-50 text-slate-900' : 'bg-[#0b0f19] text-white'
    }`}>
      {/* ─── Top Studio Navigation Bar ───────────────────────────────────────── */}
      <header className={`border-b backdrop-blur-xl px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 transition-colors duration-400 ${
        isLightMode ? 'bg-white/80 border-slate-200 shadow-sm' : 'bg-slate-900/80 border-white/10'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-teal-400 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/25">
            ✦
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-lg font-black tracking-tight m-0 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                3D SignSTEM Studio
              </h1>
              <span className="bg-emerald-500/20 text-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                ISL 2.0
              </span>
            </div>
            <p className={`text-xs m-0 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Indian Sign Language Learning, Sequencer & Live AI Recognition
            </p>
          </div>
        </div>

        {/* Studio Modes Switcher */}
        <div className={`flex items-center border rounded-2xl p-1 gap-1 transition-colors duration-400 ${
          isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'
        }`}>
          <button
            onClick={() => handleTabChange('learn')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'learn'
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/30'
                : isLightMode ? 'text-slate-600 hover:text-slate-900 hover:bg-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>📚</span> Learn & Sequence
          </button>
          <button
            onClick={() => handleTabChange('practise')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'practise'
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/30'
                : isLightMode ? 'text-slate-600 hover:text-slate-900 hover:bg-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🎯</span> Practice Challenge
          </button>
          <button
            onClick={() => handleTabChange('recognize')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'recognize'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/30'
                : isLightMode ? 'text-slate-600 hover:text-slate-900 hover:bg-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>⚡</span> Live AI Recognition
          </button>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2.5">
          {/* Gender Switcher Button */}
          <button
            onClick={() => {
              setAvatarConfig(prev => ({
                ...prev,
                gender: prev.gender === 'male' ? 'female' : 'male'
              }));
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
              isLightMode
                ? 'bg-slate-200 border-slate-300 text-slate-800 hover:bg-slate-300'
                : 'bg-white/10 border-white/15 text-indigo-300 hover:bg-white/20'
            }`}
            title="Toggle Female / Male Avatar"
          >
            <span>{avatarConfig.gender === 'male' ? '👨 Male Presenter' : '👩 Female Presenter'}</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleThemeMode}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
              isLightMode
                ? 'bg-slate-200 border-slate-300 text-slate-800 hover:bg-slate-300'
                : 'bg-white/10 border-white/15 text-yellow-300 hover:bg-white/20'
            }`}
            title="Toggle Light / Dark Theme Mode"
          >
            <span>{isLightMode ? '🌙 Dark Mode' : '☀️ Light Mode'}</span>
          </button>

          {/* Custom Animation File Importer */}
          <label className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            isLightMode
              ? 'bg-slate-200 border-slate-300 text-slate-800 hover:bg-slate-300'
              : 'bg-white/10 border-white/15 text-teal-300 hover:bg-white/20'
          }`} title="Upload Custom Animation File (.json, .glb, .vrm)">
            <span>📁 Import Animation</span>
            <input
              type="file"
              accept=".json,.glb,.vrm,.bvh"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setIsCustomizerOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors duration-400 ${
              isLightMode
                ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
            }`}
            title="Customize Avatar & Themes"
          >
            <span>🎨</span>
            <span>Avatar Studio</span>
          </button>

          <button
            onClick={() => window.close()}
            className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </header>

      {/* ─── Studio Main Workspace ─────────────────────────────────────────── */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-6">
        
        {/* ─── LEFT COLUMN: Realistic Signing Avatar Presenter ─────────────── */}
        <div className="flex flex-col gap-4">
          <div className={`relative h-[520px] rounded-[28px] border shadow-2xl overflow-hidden flex flex-col transition-all duration-400 ${
            isLightMode
              ? 'bg-gradient-to-b from-slate-100 via-slate-200/50 to-slate-100 border-slate-300 shadow-slate-200/50'
              : 'bg-gradient-to-b from-slate-900 via-[#111625] to-[#0d121f] border-white/10 shadow-2xl'
          }`}>
            
            {/* Stage Ambient Glow & Indicators */}
            <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
              isLightMode ? 'bg-indigo-400/20' : 'bg-indigo-500/15'
            }`} />
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                {isIdle ? 'Ready · Resting' : `Signing: ${currentItem?.label || ''}`}
              </span>
            </div>

            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <span className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border ${
                isLightMode ? 'bg-white/80 text-slate-700 border-slate-300' : 'bg-black/40 text-slate-400 border-white/5'
              }`}>
                Speed: {playbackRate}x
              </span>
            </div>

            {/* Realistic Human Avatar Presenter */}
            <div className="flex-1 w-full h-full flex items-center justify-center p-2 relative z-10">
              <RealisticHumanAvatar
                currentItem={currentItem}
                isIdle={isIdle}
                playbackRate={playbackRate}
                onPoseComplete={handleAnimationEnd}
                config={avatarConfig}
              />
            </div>

            {/* Subtitle & Progress Bar */}
            <div className={`p-4 backdrop-blur border-t z-20 transition-colors duration-400 ${
              isLightMode ? 'bg-white/90 border-slate-200' : 'bg-slate-950/80 border-white/10'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                  {currentItem?.isFingerspelling ? '🔤 ISL Fingerspelling' : '🤟 ISL Concept Pose'}
                </span>
                <span className={`text-[10px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  {queue.length > 0 ? `+${queue.length} tokens queued` : 'Queue empty'}
                </span>
              </div>
              <div className={`text-lg font-black tracking-tight flex items-center gap-2 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                <span>{currentItem?.label || 'Ready to Sign'}</span>
                {currentItem?.isFingerspelling && (
                  <span className="text-xs text-indigo-600 font-mono bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Letter {currentItem.token}
                  </span>
                )}
              </div>
              
              {/* Playback Speed Strip */}
              <div className={`mt-3 flex items-center justify-between pt-2 border-t text-xs ${
                isLightMode ? 'border-slate-200' : 'border-white/5'
              }`}>
                <div className="flex items-center gap-1.5">
                  {[0.75, 1.0, 1.25, 1.5].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackRate(spd)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                        playbackRate === spd
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : isLightMode ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={skipCurrent}
                    disabled={isIdle}
                    className={`px-2.5 py-1 rounded disabled:opacity-40 text-[11px] font-bold transition ${
                      isLightMode ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    Skip ⏭
                  </button>
                  <button
                    onClick={clearQueue}
                    disabled={isIdle && queue.length === 0}
                    className={`px-2.5 py-1 rounded disabled:opacity-40 text-[11px] font-bold transition ${
                      isLightMode ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    Clear ⌫
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Sentence / Phrase Input with ISL Grammar & Voice ASR */}
          <div className="flex flex-col gap-1.5">
            <form onSubmit={handlePlayCustomText} className={`rounded-2xl border p-3 flex items-center gap-2 transition-colors duration-400 ${
              isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-white/10'
            }`}>
              <input
                type="text"
                value={customInputText}
                onChange={(e) => setCustomInputText(e.target.value)}
                placeholder="Type or speak any sentence (e.g. Tomorrow I am going to school)..."
                className={`flex-1 border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500 transition-colors ${
                  isLightMode ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400' : 'bg-black/40 border-white/10 text-white placeholder:text-slate-500'
                }`}
              />

              {/* Voice ASR Mic Button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                  isListeningVoice
                    ? 'bg-red-500 text-white animate-pulse border-red-400 shadow-md shadow-red-500/30'
                    : isLightMode
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    : 'bg-white/10 hover:bg-white/15 text-slate-200 border-white/10'
                }`}
                title="Speak sentence using Voice ASR"
              >
                <span>{isListeningVoice ? '🔴 Stop' : '🎙️ Voice'}</span>
              </button>

              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-md shadow-indigo-600/30 flex items-center gap-1"
                title="Translate with ISL Grammar & Sign"
              >
                <span>Sign It 🤟</span>
              </button>
            </form>

            {/* Interactive Long Word Fingerspelling Prompt Banner */}
            {detectedLongWords.length > 0 && (
              <div className="p-3 bg-gradient-to-r from-amber-500/15 via-indigo-500/15 to-teal-500/15 border border-amber-500/30 rounded-2xl flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <span>🔤</span>
                    <span>Long concept detected ({detectedLongWords.length}):</span>
                  </span>
                  <button onClick={() => setDetectedLongWords([])} className="text-slate-400 hover:text-white text-xs font-bold">
                    Dismiss ✕
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {detectedLongWords.map((item) => (
                    <button
                      key={item.word}
                      onClick={() => handleFingerspellWord(item.word)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-black transition flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Fingerspell "{item.word}" ({item.length} letters) 🔤</span>
                      <span className="text-amber-400">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Speech / Grammar Feedback Notice */}
            {speechNotice && (
              <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[11px] font-bold text-indigo-400 flex items-center justify-between">
                <span>{speechNotice}</span>
                <button onClick={() => setSpeechNotice('')} className="text-slate-400 hover:text-white text-xs">✕</button>
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Dynamic Workspace ────────────────────────────── */}
        <div className="flex flex-col">
          
          {/* TAB 1: LEARN & SEQUENCE (Dictionary Explorer) */}
          {activeTab === 'learn' && (
            <div className={`h-full rounded-[28px] border p-6 flex flex-col transition-colors duration-400 ${
              isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-white/10'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className={`text-xl font-black tracking-tight m-0 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                    ISL STEM Dictionary
                  </h2>
                  <p className={`text-xs m-0 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Click any concept or letter to see the avatar sign it with accurate hand kinematics
                  </p>
                </div>
                {/* Search Bar */}
                <div className="relative min-w-[220px]">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 100+ signs..."
                    className={`w-full border rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-indigo-500 transition-colors ${
                      isLightMode ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400' : 'bg-black/40 border-white/10 text-white placeholder:text-slate-500'
                    }`}
                  />
                  <span className="absolute left-2.5 top-2.5 text-xs text-slate-400">🔍</span>
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-thin">
                {Object.entries(STEM_CATEGORIES).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition ${
                      activeCategory === key
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : isLightMode
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Cards Grid */}
              <div className="flex-1 overflow-y-auto max-h-[460px] grid grid-cols-2 sm:grid-cols-3 gap-2.5 pr-1">
                {filteredVocab.map((item) => (
                  <button
                    key={item.token}
                    onClick={() => enqueueTokens(item.token, 'replace')}
                    className={`group text-left p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                      isLightMode
                        ? 'bg-slate-50/80 hover:bg-indigo-50 border-slate-200 hover:border-indigo-300'
                        : 'bg-white/[0.03] hover:bg-indigo-600/20 border-white/5 hover:border-indigo-500/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-black group-hover:text-indigo-600 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                          {item.label}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isLightMode ? 'bg-slate-200 text-slate-600' : 'bg-white/5 text-slate-500'
                        }`}>
                          {item.category}
                        </span>
                      </div>
                      <p className={`text-[10px] leading-tight m-0 line-clamp-2 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {item.desc}
                      </p>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-indigo-500 font-bold opacity-0 group-hover:opacity-100 transition">
                      <span>Sign now</span>
                      <span>→</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PRACTISE CHALLENGE */}
          {activeTab === 'practise' && (
            <div className={`h-full rounded-[28px] border p-6 flex flex-col justify-between transition-colors duration-400 ${
              isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-white/10'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Interactive Quiz</span>
                    <h2 className={`text-2xl font-black tracking-tight m-0 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                      Sign Language Challenge
                    </h2>
                  </div>
                  <div className={`border rounded-2xl px-4 py-2 text-right ${
                    isLightMode ? 'bg-indigo-50 border-indigo-200' : 'bg-indigo-500/10 border-indigo-500/20'
                  }`}>
                    <span className="text-[10px] font-bold uppercase text-indigo-600 block">Mastery Score</span>
                    <strong className={`text-lg font-black ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                      {practiceScore.correct} / {practiceScore.total}
                    </strong>
                  </div>
                </div>

                {/* Challenge Card */}
                <div className={`rounded-3xl border p-8 text-center relative overflow-hidden transition-colors ${
                  isLightMode
                    ? 'bg-gradient-to-br from-indigo-50/50 via-slate-50 to-white border-indigo-200'
                    : 'bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-slate-950 border-indigo-500/30'
                }`}>
                  <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest block mb-2">
                    How do you sign this in ISL?
                  </span>
                  <h3 className={`text-4xl font-black tracking-tight m-0 mb-3 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                    "{currentQuizItem.label}"
                  </h3>
                  <p className={`text-sm max-w-md mx-auto mb-6 ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                    {currentQuizItem.desc}
                  </p>

                  {!isQuizRevealed ? (
                    <button
                      onClick={() => {
                        setIsQuizRevealed(true);
                        enqueueTokens(currentQuizItem.token, 'replace');
                      }}
                      className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-black transition shadow-lg shadow-indigo-600/30"
                    >
                      Reveal Gesture & Demonstrate 👁️
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 font-bold text-xs">
                        ✓ Demonstrating "{currentQuizItem.label}" on the avatar now. Did you get it right?
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleNextQuiz(true)}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/30"
                        >
                          I Knew It! (+1)
                        </button>
                        <button
                          onClick={() => handleNextQuiz(false)}
                          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition border ${
                            isLightMode ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-white/10'
                          }`}
                        >
                          Still Practicing
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className={`mt-6 flex items-center justify-between text-xs pt-4 border-t ${
                isLightMode ? 'text-slate-500 border-slate-200' : 'text-slate-400 border-white/10'
              }`}>
                <span>Practicing ISL Vocabulary</span>
                <button
                  onClick={() => enqueueTokens(currentQuizItem.token, 'replace')}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Replay Demonstration ↺
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE AI RECOGNITION */}
          {activeTab === 'recognize' && (
            <div className={`h-full rounded-[28px] border p-6 flex flex-col justify-between transition-colors duration-400 ${
              isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-white/10'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-500">MediaPipe Hands AI</span>
                    <h2 className={`text-xl font-black tracking-tight m-0 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                      Live ISL Recognition
                    </h2>
                  </div>
                  {isRunning && (
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full">
                        {fps} FPS
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        handDetected ? 'bg-indigo-500/20 text-indigo-600 border border-indigo-500/30' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {handDetected ? '✋ Hands Tracked' : 'Searching for hands...'}
                      </span>
                    </div>
                  )}
                </div>

                {!isCapturing ? (
                  <div className={`rounded-3xl border p-8 text-center my-4 transition-colors ${
                    isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-white/10'
                  }`}>
                    <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-3xl text-teal-500">
                      📹
                    </div>
                    <h3 className={`text-lg font-bold mb-1 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                      Start Live Recognition
                    </h3>
                    <p className={`text-xs max-w-sm mx-auto mb-6 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                      Practice signing in front of your camera, or capture video from educational lectures. The avatar mirrors detected signs in real-time.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        onClick={() => handleStartRecogSession('camera')}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2"
                      >
                        <span>📷</span> Use Webcam (Selfie Camera)
                      </button>
                      <button
                        onClick={() => handleStartRecogSession('screen')}
                        className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold transition border ${
                          isLightMode ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300' : 'bg-white/10 hover:bg-white/15 text-white border-white/10'
                        }`}
                      >
                        <span>🖥</span> Share Screen / Video Tab
                      </button>
                    </div>
                    {captureError && (
                      <p className="mt-4 text-xs text-red-500 bg-red-500/10 p-2 rounded-xl border border-red-500/20">
                        {captureError}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Large Wide-Angle Live Stream Viewfinder */}
                    <div className={`relative rounded-3xl bg-slate-950 overflow-hidden border border-teal-500/30 transition-all duration-300 ${
                      isCameraExpanded ? 'fixed inset-4 z-50 shadow-2xl flex flex-col justify-center items-center bg-slate-950/95 backdrop-blur-xl' : 'w-full h-[380px] sm:h-[440px] shadow-lg'
                    }`}>
                      <video
                        ref={(ref) => {
                          if (ref && stream && ref.srcObject !== stream) {
                            ref.srcObject = stream;
                            ref.play().catch(() => {});
                          }
                        }}
                        className={`w-full h-full ${videoFitMode === 'contain' ? 'object-contain' : 'object-cover'}`}
                        muted
                        playsInline
                      />
                      {/* Top Overlay Badges & Controls */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
                        <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[11px] font-black text-white uppercase tracking-wider">
                            16:9 Widescreen HD · {sourceType === 'camera' ? 'Selfie Camera' : 'Screen Share'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setVideoFitMode(prev => prev === 'contain' ? 'cover' : 'contain')}
                            className="bg-black/75 hover:bg-black/90 text-white text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/15 backdrop-blur-md transition"
                            title="Toggle Fit Mode (Full Frame vs Crop)"
                          >
                            📐 {videoFitMode === 'contain' ? 'Wide Fit' : 'Crop Fill'}
                          </button>
                          <button
                            onClick={() => setIsCameraExpanded(prev => !prev)}
                            className="bg-indigo-600/90 hover:bg-indigo-500 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full border border-indigo-400/40 backdrop-blur-md transition shadow-md"
                          >
                            {isCameraExpanded ? '↙ Exit Fullscreen' : '⤢ Expand View'}
                          </button>
                        </div>
                      </div>

                      {/* Bottom Floating Control Bar */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
                        <div className="bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-[11px] text-slate-300">
                          {handDetected ? '✋ Hands Detected in Frame' : '📍 Position hands inside the wide frame'}
                        </div>
                        <button
                          onClick={() => {
                            setRecogActive(false);
                            stopCapture();
                            setIsCameraExpanded(false);
                          }}
                          className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-lg shadow-red-600/30 flex items-center gap-1.5"
                        >
                          <span>⏹</span> Stop Camera
                        </button>
                      </div>
                    </div>

                    {/* Detected Sign Output Box */}
                    {lastSign ? (
                      <div className="rounded-2xl bg-gradient-to-r from-teal-950/60 to-indigo-950/60 border border-teal-500/30 p-4 text-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400">Detected Sign</span>
                        <h4 className="text-2xl font-black text-white mt-1 mb-0.5">{lastSign.label}</h4>
                        <p className="text-[11px] text-slate-300 m-0">
                          {lastSign.category} · <strong className="text-teal-400">{lastSign.confidence}% confidence</strong>
                        </p>
                      </div>
                    ) : (
                      <div className={`rounded-2xl border p-4 text-center text-xs ${
                        isLightMode ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-950 border-white/5 text-slate-500'
                      }`}>
                        {recogStatus || 'Perform a sign toward the camera (e.g. Hello, Thank You, Namaste)...'}
                      </div>
                    )}

                    {/* Sign Accuracy Breakdown Panel (Section 15 of Spec) */}
                    {handDetected && accuracyMetrics && (
                      <div className={`rounded-2xl border p-4 transition-colors ${
                        isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-white/10'
                      }`}>
                        <div className={`flex items-center justify-between mb-3 border-b pb-2 ${
                          isLightMode ? 'border-slate-200' : 'border-white/10'
                        }`}>
                          <span className="text-[10px] font-black uppercase tracking-widest text-teal-500">
                            SIGN ACCURACY SCORING
                          </span>
                          <span className="text-xs font-black text-indigo-500">
                            Overall: {accuracyMetrics.overallScore}%
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                          <div className={`p-2 rounded-xl border ${
                            isLightMode ? 'bg-white border-slate-200' : 'bg-white/5 border-white/5'
                          }`}>
                            <span className={`text-[10px] block font-semibold ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Hand Shape</span>
                            <strong className="text-sm font-black text-emerald-500">{accuracyMetrics.handShapeScore}%</strong>
                          </div>
                          <div className={`p-2 rounded-xl border ${
                            isLightMode ? 'bg-white border-slate-200' : 'bg-white/5 border-white/5'
                          }`}>
                            <span className={`text-[10px] block font-semibold ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Position</span>
                            <strong className="text-sm font-black text-indigo-500">{accuracyMetrics.positionScore}%</strong>
                          </div>
                          <div className={`p-2 rounded-xl border ${
                            isLightMode ? 'bg-white border-slate-200' : 'bg-white/5 border-white/5'
                          }`}>
                            <span className={`text-[10px] block font-semibold ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Orientation</span>
                            <strong className="text-sm font-black text-teal-500">{accuracyMetrics.orientationScore}%</strong>
                          </div>
                          <div className={`p-2 rounded-xl border ${
                            isLightMode ? 'bg-white border-slate-200' : 'bg-white/5 border-white/5'
                          }`}>
                            <span className={`text-[10px] block font-semibold ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Movement</span>
                            <strong className="text-sm font-black text-amber-500">{accuracyMetrics.movementScore}%</strong>
                          </div>
                        </div>

                        {/* Facial & Non-Manual Grammar Cues (Section 12 of Spec) */}
                        {facialCues && (
                          <div className={`mt-3 rounded-2xl border p-3 flex items-center justify-between transition-colors ${
                            isLightMode ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950' : 'bg-indigo-950/40 border-indigo-500/30 text-white'
                          }`}>
                            <div className="flex items-center gap-2.5">
                              <span className="text-base">😃</span>
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider block text-indigo-400">
                                  Non-Manual Cue Marker
                                </span>
                                <strong className="text-xs font-bold">
                                  {facialCues.eyebrowRaised ? '🤨 Eyebrow Raise (Question Tag)' :
                                   facialCues.headMotion === 'NOD' ? '👍 Head Nod (Affirmation)' :
                                   facialCues.headMotion === 'SHAKE' ? '👎 Head Shake (Negation)' :
                                   '😐 Neutral Expression'}
                                </strong>
                              </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                              Intensity: {facialCues.expressionIntensity}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}



                    {/* Recognition History */}
                    {recogHistory.length > 0 && (
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider block mb-2 ${
                          isLightMode ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          Recent Detected Gestures
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {recogHistory.map((item, i) => (
                            <span
                              key={item.time + i}
                              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${
                                isLightMode ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-white/5 border-white/10 text-teal-300'
                              }`}
                            >
                              {item.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className={`mt-4 pt-4 border-t flex items-center justify-between text-xs ${
                isLightMode ? 'border-slate-200 text-slate-500' : 'border-white/10 text-slate-500'
              }`}>
                <span>Model: MediaPipe Hands v0.4</span>
                <span>Self-contained offline processing</span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ─── Long Word Fingerspelling Permission Modal ────────────────────── */}
      {isPermissionModalOpen && pendingPermissionWord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl transition-colors ${
            isLightMode ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-white/10 text-white'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl text-amber-500">
                🔤
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight m-0">Fingerspelling Permission</h3>
                <p className={`text-xs m-0 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Long or complex technical concept detected
                </p>
              </div>
            </div>

            <p className={`text-sm leading-relaxed mb-6 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
              The word <strong className="text-amber-500 font-black">"{pendingPermissionWord.word}"</strong> has <strong>{pendingPermissionWord.length} letters</strong>. Would you like SignSTEM to fingerspell it letter-by-letter in Indian Sign Language?
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => handleFingerspellWord(pendingPermissionWord.word)}
                className="w-full sm:w-auto flex-1 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-amber-500/20"
              >
                Yes, Fingerspell 🔤
              </button>
              <button
                onClick={handleDeclineFingerspelling}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl border text-xs font-bold transition ${
                  isLightMode ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' : 'bg-white/10 hover:bg-white/15 text-slate-300 border-white/10'
                }`}
              >
                No, Regular Sign 🤟
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Avatar Customizer Modal ────────────────────────────────────────── */}
      <CustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        config={avatarConfig}
        onUpdateConfig={handleUpdateAvatarConfig}
      />
    </div>
  );
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<StudioApp />);
}
