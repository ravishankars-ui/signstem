const ROOT_ID = 'signstem-root'

function explain(text) {
  const trimmed = text.trim()
  if (!trimmed) return 'Select text on the page to get a simple explanation.'
  if (trimmed.length > 120) return `This passage covers "${trimmed.slice(0, 48)}…" — break it into smaller ideas and look up any unfamiliar terms.`
  return `"${trimmed}" is a core concept. Try restating it in your own words, then connect it to an example you already know.`
}

function mount() {
  if (document.getElementById(ROOT_ID)) return

  chrome.storage.sync.get({ helperEnabled: true, savedConcepts: [] }, ({ helperEnabled }) => {
    if (!helperEnabled) return

    const root = document.createElement('div')
    root.id = ROOT_ID
    document.documentElement.appendChild(root)

    const launcher = document.createElement('button')
    launcher.className = 'ss-launcher'
    launcher.innerHTML = '<span class="ss-mark">✦</span> SignSTEM helper'

    const panel = document.createElement('div')
    panel.className = 'ss-panel'
    panel.innerHTML = `
      <div class="ss-head">
        <span class="ss-mark">✦</span>
        <div><strong>SignSTEM helper</strong><small>Explain or save selected text</small></div>
        <button class="ss-close" aria-label="Close">×</button>
      </div>
      <div class="ss-body">
        <p class="ss-kicker">Selected concept</p>
        <h2>Understand this idea</h2>
        <p class="ss-copy">Highlight text on the page, then use the buttons below.</p>
        <div class="ss-selected">Nothing selected yet.</div>
        <div class="ss-actions">
          <button data-action="explain">Explain</button>
          <button class="secondary" data-action="save">Save concept</button>
        </div>
        <p class="ss-note">Saved concepts stay on this device only.</p>
      </div>`

    root.appendChild(launcher)
    root.appendChild(panel)

    const selectedEl = panel.querySelector('.ss-selected')
    const copyEl = panel.querySelector('.ss-copy')
    let selection = ''

    const refreshSelection = () => {
      selection = window.getSelection()?.toString().trim() ?? ''
      selectedEl.textContent = selection || 'Nothing selected yet.'
    }

    const setOpen = open => panel.classList.toggle('open', open)

    launcher.addEventListener('click', () => {
      refreshSelection()
      setOpen(!panel.classList.contains('open'))
    })

    panel.querySelector('.ss-close').addEventListener('click', () => setOpen(false))

    panel.querySelector('[data-action="explain"]').addEventListener('click', () => {
      refreshSelection()
      copyEl.textContent = explain(selection)
    })

    panel.querySelector('[data-action="save"]').addEventListener('click', () => {
      refreshSelection()
      if (!selection) {
        copyEl.textContent = 'Select some text before saving.'
        return
      }
      chrome.storage.sync.get({ savedConcepts: [] }, ({ savedConcepts }) => {
        const next = [{ text: selection, savedAt: Date.now(), page: location.hostname }, ...savedConcepts].slice(0, 20)
        chrome.storage.sync.set({ savedConcepts: next }, () => {
          copyEl.textContent = 'Saved locally. Open the learning studio to revisit it later.'
        })
      })
    })

    document.addEventListener('mouseup', refreshSelection)
    document.addEventListener('keyup', refreshSelection)
  })
}

mount()
