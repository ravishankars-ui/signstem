const DEFAULTS = { helperEnabled: true, activeSubject: 'Physics', apiBaseUrl: '' }

chrome.runtime.onInstalled.addListener(async () => {
  const saved = await chrome.storage.sync.get(DEFAULTS)
  await chrome.storage.sync.set({ ...DEFAULTS, ...saved })
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SIGNSTEM_GET_SETTINGS') {
    chrome.storage.sync.get(DEFAULTS).then(sendResponse)
    return true
  }
  if (message.type === 'SIGNSTEM_SAVE_SETTINGS') {
    chrome.storage.sync.set(message.settings).then(() => sendResponse({ ok: true }))
    return true
  }
  if (message.type === 'SIGNSTEM_ANALYZE_SIGN') {
    // Future model/API boundary. Keep camera capture and model calls opt-in.
    sendResponse({ ok: false, message: 'Recognition will be available when a model is connected.' })
  }
})
