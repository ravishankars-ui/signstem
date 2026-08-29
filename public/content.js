/**
 * SignSTEM — Clean In-Page Overlay Shell
 */
(function () {
  'use strict';

  const WIDGET_ID = 'signstem-isl-widget';
  if (document.getElementById(WIDGET_ID)) return;

  const ext = globalThis.chrome?.storage ? globalThis.chrome : null;

  function init(settings) {
    if (!settings.helperEnabled) return;
    let isSyncActive = true;
    let lastText = '';

    // Shell
    const w = document.createElement('div');
    w.id = WIDGET_ID;
    w.innerHTML = `
      <div class="ss-widget-header">
        <div class="ss-widget-title">
          <span class="ss-title-icon">✦</span>
          <span>SignSTEM</span>
        </div>
        <div class="ss-header-center">
          <button class="ss-hdr-btn ss-sync-active" id="ss-sync" title="Auto-sync captions">
            <span class="ss-sync-dot" id="ss-sync-dot"></span>
            <span id="ss-sync-label">Sync</span>
          </button>
          <button class="ss-hdr-btn" id="ss-tab" title="Listen tab audio">🎧</button>
          <button class="ss-hdr-btn" id="ss-cam" title="Toggle Live Camera AI">📷</button>
          <button class="ss-hdr-btn" id="ss-theme" title="Toggle Dark / Ivory Theme">🌙</button>
        </div>
        <div class="ss-window-controls">
          <button class="ss-win-btn" id="ss-min" title="Minimize">─</button>
          <button class="ss-win-btn" id="ss-max" title="Maximize">□</button>
          <button class="ss-win-btn ss-close-btn" id="ss-close" title="Close">✕</button>
        </div>
      </div>
      <div class="ss-avatar-stage" id="ss-stage">
        <iframe id="ss-frame" src="${ext?.runtime ? ext.runtime.getURL('index.html') : 'index.html'}"
          style="width:100%;height:100%;border:none;background:transparent;" allow="autoplay; camera; microphone; display-capture"></iframe>
      </div>`;
    document.body.appendChild(w);

    const pill = document.createElement('button');
    pill.id = 'signstem-isl-pill';
    pill.innerHTML = '<span class="ss-pill-icon">✦</span><span>SignSTEM</span>';
    document.body.appendChild(pill);

    const $ = (s) => w.querySelector(s);
    const frame = $('#ss-frame');
    const stage = $('#ss-stage');
    const post = (msg) => { try { frame?.contentWindow?.postMessage(msg, '*'); } catch {} };

    // Close
    const closeBtn = $('#ss-close');
    closeBtn.onmousedown = e => e.stopPropagation();
    closeBtn.onclick = (e) => {
      e.preventDefault(); e.stopPropagation();
      post({ type: 'CONTROL_CLOSE' });
      w.style.display = 'none'; pill.style.display = 'flex';
    };

    // Minimize
    let minimized = false;
    const minBtn = $('#ss-min');
    minBtn.onmousedown = e => e.stopPropagation();
    minBtn.onclick = (e) => {
      e.preventDefault(); e.stopPropagation();
      minimized = !minimized;
      w.classList.toggle('ss-minimized', minimized);
      if (stage) stage.style.display = minimized ? 'none' : 'flex';
      minBtn.textContent = minimized ? '┼' : '─';
      minBtn.title = minimized ? 'Restore Window' : 'Minimize';
      post({ type: minimized ? 'CONTROL_MINIMIZE' : 'CONTROL_RESTORE' });
    };

    // Maximize
    let expanded = false;
    const maxBtn = $('#ss-max');
    maxBtn.onmousedown = e => e.stopPropagation();
    maxBtn.onclick = (e) => {
      e.preventDefault(); e.stopPropagation();
      if (minimized) {
        minimized = false;
        w.classList.remove('ss-minimized');
        if (stage) stage.style.display = 'flex';
        minBtn.textContent = '─';
        minBtn.title = 'Minimize';
      }
      expanded = !expanded;
      w.classList.toggle('ss-expanded', expanded);
      maxBtn.textContent = expanded ? '❐' : '□';
      maxBtn.title = expanded ? 'Restore Size' : 'Maximize';
      post({ type: expanded ? 'CONTROL_MAXIMIZE' : 'CONTROL_RESTORE' });
    };

    // Pill restore
    pill.onclick = (e) => {
      e.preventDefault(); e.stopPropagation();
      w.style.display = 'flex'; pill.style.display = 'none';
      minimized = expanded = false;
      w.classList.remove('ss-minimized', 'ss-expanded');
      if (stage) stage.style.display = 'flex';
      minBtn.textContent = '─'; minBtn.title = 'Minimize';
      maxBtn.textContent = '□'; maxBtn.title = 'Maximize';
      post({ type: 'CONTROL_RESTORE' });
    };

    // Video Playback & Pause State Tracker
    let isVideoPaused = false;
    const watchedVideos = new WeakSet();

    function findPrimaryVideo() {
      // 1. YouTube main video player
      const ytVideo = document.querySelector('video.html5-main-video') || document.querySelector('.video-stream.html5-main-video');
      if (ytVideo) return ytVideo;

      // 2. All video elements on page
      const allVideos = Array.from(document.querySelectorAll('video'));
      if (allVideos.length === 0) return null;
      if (allVideos.length === 1) return allVideos[0];

      // Find active playing video
      const playing = allVideos.find(v => !v.paused && v.readyState > 1);
      if (playing) return playing;

      // Return largest video element by rendered surface area
      return allVideos.reduce((best, cur) => {
        const r1 = best ? (best.offsetWidth * best.offsetHeight) : 0;
        const r2 = cur.offsetWidth * cur.offsetHeight;
        return r2 > r1 ? cur : best;
      }, allVideos[0]);
    }

    function handleVideoState(video) {
      if (!video) return;
      const paused = Boolean(video.paused || video.ended);
      if (isVideoPaused !== paused) {
        isVideoPaused = paused;
        post({
          type: paused ? 'VIDEO_PAUSE' : 'VIDEO_PLAY',
          isPaused: paused,
          currentTime: video.currentTime
        });
      }
    }

    function bindVideoEvents() {
      const videos = document.querySelectorAll('video');
      videos.forEach(v => {
        if (!watchedVideos.has(v)) {
          watchedVideos.add(v);
          const update = () => {
            const primary = findPrimaryVideo();
            if (primary) handleVideoState(primary);
          };
          v.addEventListener('pause', update);
          v.addEventListener('play', update);
          v.addEventListener('playing', update);
          v.addEventListener('ended', update);
          v.addEventListener('waiting', update);
          v.addEventListener('seeking', () => {
            lastCaptionFull = '';
            update();
          });
          v.addEventListener('seeked', update);
          v.addEventListener('ratechange', () => {
            post({ type: 'SET_PLAYBACK_SPEED', speed: v.playbackRate });
          });
        }
      });
    }

    // Live Video Caption Streamer
    let lastCaptionFull = '';

    function tryEnableYT() {
      const b = document.querySelector('.ytp-subtitles-button');
      if (b && b.getAttribute('aria-pressed') !== 'true') {
        try { b.click(); } catch {}
      }
    }

    function getCaption() {
      let t = '';
      // 1. YouTube Subtitles (.ytp-caption-segment)
      const yt = document.querySelectorAll('.ytp-caption-segment');
      if (yt && yt.length > 0) {
        t = Array.from(yt).map(e => e.textContent.trim()).filter(Boolean).join(' ');
      }
      // 2. Generic Video Player Subtitles & Web Streaming
      if (!t) {
        const nets = [
          '.player-timedtext', '.timedtext-text', '[class*="caption-text"]',
          '[class*="subtitle"]', '.vjs-text-track-display', '.ub-captions-text',
          '.atvwebplayersdk-captions-text', '[data-testid="subtitle-text"]',
          '.captions-text', '.jw-text-track-cue'
        ];
        for (const s of nets) {
          const e = document.querySelector(s);
          if (e && e.textContent.trim()) {
            t = e.textContent.trim();
            break;
          }
        }
      }
      // 3. HTML5 Video TextTracks
      if (!t) {
        document.querySelectorAll('video').forEach(v => {
          if (v.textTracks) {
            for (let i = 0; i < v.textTracks.length; i++) {
              const tr = v.textTracks[i];
              if (tr.activeCues && tr.activeCues.length > 0) {
                t = Array.from(tr.activeCues).map(c => c.text.replace(/<[^>]*>/g, '')).join(' ');
                if (t) break;
              }
            }
          }
        });
      }
      return t.trim();
    }

    function sync() {
      bindVideoEvents();
      const primaryVideo = findPrimaryVideo();
      if (primaryVideo) {
        handleVideoState(primaryVideo);
        // When video is paused or ended, halt caption streaming and keep avatar rested
        if (primaryVideo.paused || primaryVideo.ended) {
          return;
        }
      }

      if (!isSyncActive) return;
      tryEnableYT();
      const raw = getCaption();
      if (!raw) return;

      // Strip audio brackets like [Music], (Laughter), [Applause]
      const text = raw.replace(/\[[^\]]*\]|\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
      if (!text || text === lastCaptionFull) return;

      // Smart delta streaming: if current line continues previous line, only append new words
      if (text.startsWith(lastCaptionFull) && lastCaptionFull.length > 0) {
        const delta = text.slice(lastCaptionFull.length).trim();
        lastCaptionFull = text;
        if (delta.length > 0) {
          post({ type: 'PLAY_ISL_SEQUENCE', tokens: delta, mode: 'append', isLiveCaption: true });
        }
      } else {
        // New sentence or replaced cue -> Immediately switch to new sentence
        lastCaptionFull = text;
        post({ type: 'PLAY_ISL_SEQUENCE', tokens: text, mode: 'replace', isLiveCaption: true });
      }
    }

    new MutationObserver(sync).observe(document.body, { childList: true, subtree: true, characterData: true });
    setInterval(sync, 250);

    const syncBtn = $('#ss-sync');
    const syncDot = $('#ss-sync-dot');
    const syncLabel = $('#ss-sync-label');
    syncBtn.onmousedown = e => e.stopPropagation();
    syncBtn.onclick = (e) => {
      e.preventDefault(); e.stopPropagation();
      isSyncActive = !isSyncActive;
      syncDot.classList.toggle('ss-sync-off', !isSyncActive);
      syncLabel.textContent = isSyncActive ? 'Sync' : 'Off';
      syncBtn.classList.toggle('ss-sync-active', isSyncActive);
      if (isSyncActive) {
        lastCaptionFull = '';
        sync();
      }
    };

    // Tab audio
    let tabOn = false;
    const tabBtn = $('#ss-tab');
    tabBtn.onmousedown = e => e.stopPropagation();
    tabBtn.onclick = (e) => {
      e.preventDefault(); e.stopPropagation();
      tabOn = !tabOn;
      tabBtn.classList.toggle('ss-active', tabOn);
      post({ type: tabOn ? 'START_TAB_LISTEN' : 'STOP_TAB_LISTEN' });
    };

    // Live Camera AI Toggle
    let camOn = false;
    const camBtn = $('#ss-cam');
    camBtn.onmousedown = e => e.stopPropagation();
    camBtn.onclick = (e) => {
      e.preventDefault(); e.stopPropagation();
      camOn = !camOn;
      camBtn.classList.toggle('ss-active', camOn);
      post({ type: 'TOGGLE_CAMERA' });
    };

    // Theme Mode Toggle
    let isLightMode = true;
    const themeBtn = $('#ss-theme');
    themeBtn.onmousedown = e => e.stopPropagation();
    themeBtn.onclick = (e) => {
      e.preventDefault(); e.stopPropagation();
      isLightMode = !isLightMode;
      themeBtn.textContent = isLightMode ? '🌙' : '☀️';
      post({ type: 'TOGGLE_THEME' });
    };

    // Toggle from icon
    ext?.runtime?.onMessage?.addListener((msg) => {
      if (msg.type === 'TOGGLE_ISL_WIDGET') {
        const vis = w.style.display !== 'none';
        post({ type: vis ? 'CONTROL_CLOSE' : 'CONTROL_RESTORE' });
        w.style.display = vis ? 'none' : 'flex';
        pill.style.display = vis ? 'flex' : 'none';
      }
      if (msg.type === 'PLAY_ISL_SEQUENCE' && msg.tokens) {
        post(msg);
        if (w.style.display === 'none') {
          post({ type: 'CONTROL_RESTORE' });
          w.style.display = 'flex'; pill.style.display = 'none';
        }
      }
    });

    // Drag
    let drag = false, ox = 0, oy = 0;
    const header = w.querySelector('.ss-widget-header');
    header.onmousedown = (e) => {
      if (e.target.closest('button')) return;
      drag = true;
      const r = w.getBoundingClientRect();
      ox = e.clientX - r.left; oy = e.clientY - r.top;
      w.style.cursor = 'grabbing';
    };
    document.addEventListener('mousemove', (e) => {
      if (!drag) return;
      w.style.left = Math.min(Math.max(0, e.clientX - ox), innerWidth - w.offsetWidth) + 'px';
      w.style.top = Math.min(Math.max(0, e.clientY - oy), innerHeight - w.offsetHeight) + 'px';
      w.style.right = w.style.bottom = 'auto';
    });
    document.addEventListener('mouseup', () => { drag = false; w.style.cursor = 'default'; });

    // Auto-sign selection
    let selTimer;
    document.addEventListener('mouseup', () => {
      clearTimeout(selTimer);
      selTimer = setTimeout(() => {
        const sel = getSelection()?.toString().trim();
        if (sel && sel.length > 1 && sel.length < 200 && !sel.includes('\n'))
          post({ type: 'PLAY_ISL_SEQUENCE', tokens: sel, mode: 'replace' });
      }, 150);
    });

    // URL auto-play
    try {
      const q = new URLSearchParams(location.search).get('q');
      if (q) { const t = q.split(',').map(s => s.trim().toUpperCase()).filter(Boolean); if (t.length) post({ type: 'PLAY_ISL_SEQUENCE', tokens: t, mode: 'replace' }); }
    } catch {}
  }

  if (ext?.storage?.sync) ext.storage.sync.get({ helperEnabled: true }, init);
  else init({ helperEnabled: true });
})();
