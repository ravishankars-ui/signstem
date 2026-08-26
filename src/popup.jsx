import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { EXTENSION_THEMES } from './constants/avatarCustomization';
import { ZhenjaSignAvatar } from './components/ZhenjaSignAvatar';

const extensionApi = globalThis.chrome?.storage ? globalThis.chrome : null;

const STEM_SUBJECTS = [
  { id: 'Physics', name: 'Physics', icon: '⚛', desc: 'Motion, Force & Energy', color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400' },
  { id: 'Mathematics', name: 'Mathematics', icon: '∑', desc: 'Numbers, Geometry & Algebra', color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400' },
  { id: 'Chemistry', name: 'Chemistry', icon: '⚗', desc: 'Atoms, Reactions & Matter', color: 'from-teal-500/20 to-emerald-500/20 border-teal-500/30 text-teal-400' },
  { id: 'Biology', name: 'Biology', icon: '🧬', desc: 'Cells, Genetics & Anatomy', color: 'from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-400' },
  { id: 'CS', name: 'Computer Sci', icon: '💻', desc: 'Algorithms, Code & Data', color: 'from-purple-500/20 to-violet-500/20 border-purple-500/30 text-purple-400' },
];

const POPULAR_SIGNS = ['NAMASTE', 'GRAVITY', 'ATOM', 'EQUAL', 'ENERGY', 'HELLO', 'HELP', 'CODE'];

function PopupApp() {
  const [settings, setSettings] = useState({
    helperEnabled: true,
    activeSubject: 'Physics',
    themeId: 'ivory-pearl',
    themeMode: 'light' // Default to Ivory White
  });
  const [activeSign, setActiveSign] = useState('HELLO');
  const [inputText, setInputText] = useState('');
  const [notice, setNotice] = useState('');

  const isLightMode = settings.themeMode === 'light' || settings.themeMode === 'ivory';

  useEffect(() => {
    if (extensionApi?.storage?.sync) {
      extensionApi.storage.sync.get({ helperEnabled: true, activeSubject: 'Physics', themeId: 'ivory-pearl', themeMode: 'light' }, (saved) => {
        if (saved) setSettings((prev) => ({ ...prev, ...saved }));
      });
    }
  }, []);

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
  }, [isLightMode]);

  const toggleHelper = () => {
    const next = !settings.helperEnabled;
    setSettings((prev) => ({ ...prev, helperEnabled: next }));
    if (extensionApi?.storage?.sync) {
      extensionApi.storage.sync.set({ helperEnabled: next });
    }
    if (extensionApi?.runtime) {
      extensionApi.runtime.sendMessage({ type: 'TOGGLE_IN_PAGE_WIDGET' });
    }
    setNotice(next ? '✓ In-page helper active on tab.' : 'In-page helper hidden.');
    setTimeout(() => setNotice(''), 3000);
  };

  const toggleThemeMode = () => {
    const nextMode = isLightMode ? 'dark' : 'light';
    setSettings((prev) => ({ ...prev, themeMode: nextMode }));
    if (extensionApi?.storage?.sync) {
      extensionApi.storage.sync.set({ themeMode: nextMode });
    }
    try {
      localStorage.setItem('isl_theme_mode', nextMode);
    } catch {}
  };

  const handleSelectTheme = (themeId) => {
    setSettings((prev) => ({ ...prev, themeId }));
    if (extensionApi?.storage?.sync) {
      extensionApi.storage.sync.set({ themeId });
    }
  };

  const openSidePanel = () => {
    if (extensionApi?.runtime) {
      extensionApi.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
      setNotice('📌 Opened in Side Panel (Docked & Pinned)');
    } else {
      window.open('/sidepanel.html', '_blank');
    }
    setTimeout(() => setNotice(''), 3000);
  };

  const openPopoutWindow = () => {
    if (extensionApi?.runtime) {
      extensionApi.runtime.sendMessage({
        type: 'OPEN_POPOUT_WINDOW',
        page: 'index.html',
        width: 420,
        height: 660,
      });
      setNotice('🗔 Opened in Frozen Standalone Window');
    } else {
      window.open('/index.html', '_blank', 'width=420,height=660');
    }
    setTimeout(() => setNotice(''), 3000);
  };

  const toggleInPageWidget = () => {
    if (extensionApi?.runtime) {
      extensionApi.runtime.sendMessage({ type: 'TOGGLE_IN_PAGE_WIDGET' });
      setNotice('🪟 In-page floating avatar toggled');
    }
    setTimeout(() => setNotice(''), 3000);
  };

  const openStudio = (subject = null) => {
    const targetSubject = subject || settings.activeSubject;
    if (subject && extensionApi?.storage?.sync) {
      extensionApi.storage.sync.set({ activeSubject: subject });
    }

    if (extensionApi?.tabs) {
      const url = extensionApi.runtime.getURL('learn.html');
      extensionApi.tabs.create({ url });
    } else {
      window.open('/learn.html', '_blank');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      const signWord = inputText.trim().toUpperCase();
      setActiveSign(signWord);
      setNotice(`Signing: ${inputText.trim()}`);
      if (extensionApi?.tabs) {
        extensionApi.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            extensionApi.tabs.sendMessage(tabs[0].id, {
              type: 'PLAY_ISL_SEQUENCE',
              tokens: [signWord],
              mode: 'replace',
            }).catch(() => {});
          }
        });
      }
      setTimeout(() => setNotice(''), 3000);
    }
  };

  return (
    <main className={`w-[390px] min-h-[640px] p-4 flex flex-col justify-between font-sans transition-colors duration-400 ${
      isLightMode ? 'bg-[#faf8f5] text-[#1e1b18]' : 'bg-[#060913] text-white'
    }`}>
      <div>
        {/* ─── Header ─────────────────────────────────────────── */}
        <header className={`flex items-center justify-between pb-3 border-b transition-colors duration-400 ${
          isLightMode ? 'border-[#e8e2d8]' : 'border-white/10'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 flex items-center justify-center text-lg shadow-md shadow-indigo-500/20 text-white font-bold">
              ✦
            </div>
            <div>
              <h1 className={`text-sm font-black tracking-tight m-0 ${isLightMode ? 'text-[#1e1b18]' : 'text-white'}`}>
                3D SignSTEM
              </h1>
              <p className={`text-[10px] m-0 ${isLightMode ? 'text-[#78716c]' : 'text-slate-400'}`}>
                ISL 3D Avatar Companion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleThemeMode}
              className={`p-1.5 rounded-lg border text-xs transition font-bold ${
                isLightMode
                  ? 'bg-white border-[#dcd4c8] text-[#c59b27] shadow-sm hover:bg-[#f5f0e6]'
                  : 'bg-white/10 border-white/15 text-yellow-300 hover:bg-white/15'
              }`}
              title={isLightMode ? 'Switch to Midnight Dark' : 'Switch to Ivory White'}
            >
              {isLightMode ? '🌙' : '☀️'}
            </button>

            <button
              onClick={toggleHelper}
              className={`px-2.5 py-1.5 rounded-full text-[10px] font-bold transition flex items-center gap-1 border ${
                settings.helperEnabled
                  ? (isLightMode ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm' : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400')
                  : (isLightMode ? 'bg-white border-[#dcd4c8] text-[#78716c]' : 'bg-white/5 border-white/10 text-slate-400')
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${settings.helperEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              {settings.helperEnabled ? 'Helper On' : 'Helper Off'}
            </button>
          </div>
        </header>

        {/* ─── Stay-Open / Freeze Mode Action Bar ──────────────── */}
        <section className="mt-2.5 flex items-center gap-1.5">
          <button
            onClick={openSidePanel}
            className={`flex-1 py-1.5 px-2 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 shadow-sm border ${
              isLightMode
                ? 'bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-indigo-600/15 hover:bg-indigo-600/30 border-indigo-500/30 text-indigo-300 hover:text-white'
            }`}
            title="Docks avatar on browser side panel — stays open permanently while you browse"
          >
            <span>📌</span>
            <span>Live Camera</span>
          </button>

          <button
            onClick={openPopoutWindow}
            className={`flex-1 py-1.5 px-2 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 shadow-sm border ${
              isLightMode
                ? 'bg-white hover:bg-purple-50 border-purple-200 text-purple-700'
                : 'bg-purple-600/15 hover:bg-purple-600/30 border-purple-500/30 text-purple-300 hover:text-white'
            }`}
            title="Opens avatar in a standalone detached window that never auto-closes"
          >
            <span>🗔</span>
            <span>Freeze Window</span>
          </button>

          <button
            onClick={toggleInPageWidget}
            className={`flex-1 py-1.5 px-2 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 shadow-sm border ${
              isLightMode
                ? 'bg-white hover:bg-teal-50 border-teal-200 text-teal-700'
                : 'bg-teal-600/15 hover:bg-teal-600/30 border-teal-500/30 text-teal-300 hover:text-white'
            }`}
            title="Toggles floating draggable avatar directly inside the current webpage"
          >
            <span>🪟</span>
            <span>Float on Page</span>
          </button>
        </section>

        {/* ─── LIVE 3D AVATAR VIEW ───────────────────────────── */}
        <section className={`mt-2.5 rounded-2xl overflow-hidden shadow-xl relative h-[230px] flex flex-col justify-between border ${
          isLightMode ? 'border-[#dcd4c8] bg-[#f5f0e6]' : 'border-indigo-500/30 bg-[#0f172a]'
        }`}>
          <div className="w-full h-full absolute inset-0">
            <ZhenjaSignAvatar token={activeSign} playbackRate={1.0} themeMode={settings.themeMode} />
          </div>

          {/* Active Sign Overlay Badge */}
          <div className="relative z-10 p-2.5 flex items-center justify-between pointer-events-none">
            <span className="bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
              Signing: {activeSign}
            </span>
            <button
              onClick={() => openStudio()}
              className="pointer-events-auto bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20 transition flex items-center gap-1 shadow"
            >
              <span>Full Studio</span>
              <span>↗</span>
            </button>
          </div>
        </section>

        {/* ─── Sign Search Input ──────────────────────────────── */}
        <form onSubmit={handleSearchSubmit} className="mt-2.5 flex items-center gap-1.5">
          <input
            type="text"
            placeholder="Type any word or sign (e.g. Gravity)..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className={`flex-1 px-3 py-2 rounded-xl text-xs border outline-none transition ${
              isLightMode
                ? 'bg-white border-[#dcd4c8] text-[#1e1b18] placeholder-[#a8a29e] focus:border-indigo-500 shadow-sm'
                : 'bg-white/5 border-white/15 text-white focus:border-indigo-400'
            }`}
          />
          <button
            type="submit"
            className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/30"
          >
            Sign
          </button>
        </form>

        {/* ─── Quick Sign Buttons ─────────────────────────────── */}
        <section className="mt-2.5">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`text-xs font-black uppercase tracking-wider m-0 ${isLightMode ? 'text-[#57534e]' : 'text-slate-200'}`}>
              Quick Signs
            </h3>
            <span className="text-[10px] text-indigo-600 font-bold">Live 3D Preview</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {POPULAR_SIGNS.map((sign) => (
              <button
                key={sign}
                onClick={() => {
                  setActiveSign(sign);
                  if (extensionApi?.tabs) {
                    extensionApi.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                      if (tabs[0]?.id) {
                        extensionApi.tabs.sendMessage(tabs[0].id, {
                          type: 'PLAY_ISL_SEQUENCE',
                          tokens: [sign],
                          mode: 'replace',
                        }).catch(() => {});
                      }
                    });
                  }
                }}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition ${
                  activeSign === sign
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : isLightMode
                      ? 'bg-white hover:bg-indigo-50 border-[#e0d8cc] text-[#292524] shadow-xs'
                      : 'bg-white/5 hover:bg-indigo-600/30 border-white/10 text-slate-300'
                }`}
              >
                {sign}
              </button>
            ))}
          </div>
        </section>

        {/* ─── Theme Selector Bar ─────────────────────────────── */}
        <section className={`mt-2.5 border rounded-xl p-2 transition-colors duration-400 ${
          isLightMode ? 'bg-white border-[#e8e2d8] shadow-xs' : 'bg-white/5 border-white/10'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isLightMode ? 'text-[#78716c]' : 'text-slate-300'}`}>
              Theme Palette
            </span>
            <button onClick={() => openStudio()} className="text-[9px] text-indigo-600 font-bold hover:underline">
              Open Full Studio →
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            {EXTENSION_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleSelectTheme(theme.id)}
                className={`flex-1 py-1 rounded-lg border text-[10px] font-bold transition flex items-center justify-center gap-1 ${
                  settings.themeId === theme.id
                    ? (isLightMode ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'bg-indigo-600/20 border-indigo-500 text-indigo-400')
                    : isLightMode ? 'bg-[#fcfaf7] border-[#e8e2d8] text-[#57534e]' : 'bg-black/30 border-white/10 text-slate-400'
                }`}
                title={theme.name}
              >
                <span className="h-2 w-2 rounded-full inline-block" style={{ background: isLightMode ? theme.light.primary : theme.dark.primary }} />
                <span>{theme.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* ─── Footer Notice & Status ───────────────────────────── */}
      <footer className={`mt-2.5 pt-2 border-t text-center ${isLightMode ? 'border-[#e8e2d8]' : 'border-white/10'}`}>
        {notice ? (
          <p className="text-[10px] text-emerald-600 font-bold m-0 animate-pulse">{notice}</p>
        ) : (
          <p className={`text-[10px] m-0 ${isLightMode ? 'text-[#8c827a]' : 'text-slate-400'}`}>
            3D SignSTEM Extension v1.2 · Ivory White Studio
          </p>
        )}
      </footer>
    </main>
  );
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<PopupApp />);
}
