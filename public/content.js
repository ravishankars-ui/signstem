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
          <button class="ss-hdr-btn" id="ss-cam" title="Live recognition">📷</button>
        </div>
        <div class="ss-window-controls">
          <button class="ss-win-btn" id="ss-min" title="Minimize">─</button>
          <button class="ss-win-btn" id="ss-max" title="Maximize">□</button>
          <button class="ss-win-btn ss-close-btn" id="ss-close" title="Close">✕</button>
        </div>
      </div>
      <div class="ss-avatar-stage" id="ss-stage">
        <iframe id="ss-frame" src="${ext?.runtime ? ext.runtime.getURL('index.html') : 'index.html'}"
          style="width:100%;height:100%;border:none;background:transparent;" allow="autoplay"></iframe>
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
    };

    // Maximize
    let expanded = false;
    const maxBtn = $('#ss-max');
    maxBtn.onmousedown = e => e.stopPropagation();
    maxBtn.onclick = (e) => {
      e.preventDefault(); e.stopPropagation();
      expanded = !expanded;
      w.classList.toggle('ss-expanded', expanded);
      maxBtn.textContent = expanded ? '❐' : '□';
    };

    // Pill restore
    pill.onclick = (e) => {
      e.preventDefault(); e.stopPropagation();
      post({ type: 'CONTROL_RESTORE' });
      w.style.display = 'flex'; pill.style.display = 'none';
      minimized = expanded = false;
      w.classList.remove('ss-minimized', 'ss-expanded');
      if (stage) stage.style.display = 'flex';
      minBtn.textContent = '─'; maxBtn.textContent = '□';
    };

    // Caption sync
    function tryEnableYT() {
      const b = document.querySelector('.ytp-subtitles-button');
      if (b?.getAttribute('aria-pressed') !== 'true') try { b?.click(); } catch {}
    }

    function getCaption() {
      let t = '';
      const yt = document.querySelectorAll('.ytp-caption-segment');
      if (yt?.length) t = [...yt].map(e => e.textContent.trim()).join(' ');
      if (!t) {
        const nets = ['.player-timedtext', '.timedtext-text', '[class*="caption-text"]',
          '[class*="subtitle"]', '.vjs-text-track-display', '.ub-captions-text',
          '.atvwebplayersdk-captions-text', '[data-testid="subtitle-text"]'];
        for (const s of nets) { const e = document.querySelector(s); if (e) { t = e.textContent.trim(); if (t) break; } }
      }
      if (!t) document.querySelectorAll('video').forEach(v => {
        if (v.textTracks) for (let i = 0; i < v.textTracks.length; i++) {
          const tr = v.textTracks[i];
          if (tr.activeCues?.length) { t = [...tr.activeCues].map(c => c.text.replace(/<[^>]*>/g, '')).join(' '); if (t) break; }
        }
      });
      return t.trim();
    }

    function sync() {
      if (!isSyncActive) return;
      tryEnableYT();
      const text = getCaption();
      if (text && text !== lastText) { lastText = text; post({ type: 'PLAY_ISL_SEQUENCE', tokens: text, mode: 'append' }); }
    }

    new MutationObserver(sync).observe(document.body, { childList: true, subtree: true, characterData: true });
    setInterval(sync, 300);

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

    // Recognition
    const camBtn = $('#ss-cam');
    camBtn.onmousedown = e => e.stopPropagation();
    camBtn.onclick = (e) => {
      e.preventDefault(); e.stopPropagation();
      if (ext?.runtime) {
        ext.runtime.sendMessage({ type: 'OPEN_RECOGNITION' });
        camBtn.classList.add('ss-active');
      } else {
        window.open('sidepanel.html', '_blank');
      }
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
