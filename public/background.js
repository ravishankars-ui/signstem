/**
 * SignSTEM Chrome Extension Service Worker (Manifest V3)
 */

const DEFAULTS = {
  helperEnabled: true,
  activeSubject: 'Physics',
  apiBaseUrl: '',
};

// Handle extension action icon click -> Toggle widget on demand
chrome.action.onClicked.addListener(async (tab) => {
  if (tab?.id) {
    try {
      chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_ISL_WIDGET' });
    } catch (e) {
      console.debug('[SignSTEM] Action click send notice:', e);
    }
  }
});

// Initialize default storage settings on install / update
chrome.runtime.onInstalled.addListener(async () => {
  try {
    const saved = await chrome.storage.sync.get(DEFAULTS);
    await chrome.storage.sync.set({ ...DEFAULTS, ...saved });
    console.log('[SignSTEM] Extension initialized with settings:', { ...DEFAULTS, ...saved });
  } catch (err) {
    console.debug('[SignSTEM] Init error:', err);
  }
});


// Centralized message router
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      switch (message.type) {
        case 'SIGNSTEM_GET_SETTINGS': {
          const settings = await chrome.storage.sync.get(DEFAULTS);
          sendResponse({ ok: true, settings });
          break;
        }

        case 'SIGNSTEM_SAVE_SETTINGS': {
          if (message.settings && typeof message.settings === 'object') {
            await chrome.storage.sync.set(message.settings);
            sendResponse({ ok: true });
          } else {
            sendResponse({ ok: false, error: 'Invalid settings payload' });
          }
          break;
        }

        case 'SIGNSTEM_OPEN_STUDIO': {
          const url = chrome.runtime.getURL('learn.html');
          const tab = await chrome.tabs.create({ url });
          sendResponse({ ok: true, tabId: tab.id });
          break;
        }

        case 'OPEN_RECOGNITION': {
          // Open side panel for live recognition
          try {
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (activeTab?.id) {
              await chrome.sidePanel.open({ tabId: activeTab.id });
              sendResponse({ ok: true });
            } else {
              sendResponse({ ok: false, error: 'No active tab' });
            }
          } catch (err) {
            // Fallback: open as a new tab if side panel not supported
            const url = chrome.runtime.getURL('sidepanel.html');
            const tab = await chrome.tabs.create({ url });
            sendResponse({ ok: true, fallback: true, tabId: tab.id });
          }
          break;
        }

        case 'SIGN_RECOGNIZED': {
          // Relay recognized sign from side panel to the content script widget
          const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
          if (tabs[0]?.id) {
            try {
              chrome.tabs.sendMessage(tabs[0].id, {
                type: 'PLAY_ISL_SEQUENCE',
                tokens: [message.sign],
                mode: 'replace',
              });
            } catch (e) {
              console.debug('[SignSTEM] Relay to content script failed:', e);
            }
          }
          sendResponse({ ok: true });
          break;
        }

        case 'SIGNSTEM_ANALYZE_SIGN': {
          // Extension model boundary: Returns local MediaPipe ready status
          sendResponse({
            ok: true,
            model: 'MediaPipe Hands v0.4 (Local Engine)',
            ready: true,
          });
          break;
        }

        default:
          sendResponse({ ok: false, message: `Unhandled message type: ${message.type}` });
          break;
      }
    } catch (err) {
      console.error('[SignSTEM SW] Error handling message:', err);
      sendResponse({ ok: false, error: err.message });
    }
  })();

  return true; // Keeps async message response port open
});
