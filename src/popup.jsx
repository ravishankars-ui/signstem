import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const extensionApi = globalThis.chrome?.storage ? globalThis.chrome : null

const subjects = [
  ['Physics', '⚛', 'Motion & energy', 'bg-lilac'],
  ['Mathematics', '∑', 'Numbers & patterns', 'bg-[#ffe0b6]'],
  ['Chemistry', '⚗', 'Matter & reactions', 'bg-[#cceee6]'],
]

function App() {
  const [settings, setSettings] = useState({ helperEnabled: true, activeSubject: 'Physics' })
  const [notice, setNotice] = useState('')
  useEffect(() => { extensionApi?.storage.sync.get(settings, saved => setSettings({ ...settings, ...saved })) }, [])
  const toggleHelper = () => {
    const next = !settings.helperEnabled
    setSettings({ ...settings, helperEnabled: next })
    extensionApi?.storage.sync.set({ helperEnabled: next })
    setNotice(next ? 'Page helper enabled. Refresh any open pages to apply.' : 'Page helper disabled.')
  }
  const openStudio = () => extensionApi?.tabs ? extensionApi.tabs.create({ url: extensionApi.runtime.getURL('learn.html') }) : window.open('/learn.html', '_blank')
  return <main className="min-h-[560px] w-[390px] overflow-hidden bg-mist p-5">
    <header className="flex items-center justify-between fade-up"><div className="flex items-center gap-2"><div className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-lg text-mint">✦</div><div><h1 className="m-0 text-base font-black tracking-[-.05em]">SignSTEM</h1><p className="m-0 text-[11px] text-slate-500">Learn. Sign. Understand.</p></div></div><button onClick={toggleHelper} className={'rounded-full px-3 py-1.5 text-[11px] font-bold transition ' + (settings.helperEnabled ? 'bg-[#d7f5ec] text-teal' : 'bg-slate-200 text-slate-500')}>{settings.helperEnabled ? 'Helper on' : 'Helper off'}</button></header>
    <section className="relative mt-5 overflow-hidden rounded-[22px] bg-ink p-5 text-white fade-up" style={{animationDelay:'80ms'}}>
      <div className="absolute -right-5 -top-6 h-32 w-32 rounded-full bg-mint/20 blur-2xl"/><p className="relative m-0 text-[10px] font-bold tracking-[.16em] text-mint uppercase">Your study companion</p><h2 className="relative mb-2 mt-2 max-w-[230px] text-[25px] font-black leading-[1.05] tracking-[-.07em]">STEM speaks every language.</h2><p className="relative m-0 max-w-[220px] text-xs leading-relaxed text-slate-300">Explore concepts your way, with Indian Sign Language at the center.</p><div className="breathe absolute bottom-3 right-4 grid h-20 w-20 place-items-center rounded-[28px] border border-white/15 bg-white/10 text-3xl backdrop-blur">🤟</div><button onClick={openStudio} className="relative mt-5 rounded-xl bg-mint px-4 py-2.5 text-xs font-extrabold text-ink transition hover:scale-[1.02]">Open learning studio →</button></section>
    <section className="mt-5 fade-up" style={{animationDelay:'140ms'}}><div className="mb-2 flex items-center justify-between"><h2 className="m-0 text-sm font-extrabold tracking-[-.04em]">Continue learning</h2><button onClick={openStudio} className="border-0 bg-transparent text-[11px] font-bold text-teal">View all</button></div><div className="grid grid-cols-3 gap-2">{subjects.map(([name, icon, desc, color]) => <button key={name} onClick={() => { setSettings({...settings, activeSubject:name}); extensionApi?.storage.sync.set({activeSubject:name}); openStudio() }} className="rounded-2xl border border-slate-200/60 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5"><div className={'grid h-9 w-9 place-items-center rounded-xl text-lg '+color}>{icon}</div><strong className="mt-2 block text-[11px]">{name}</strong><span className="mt-0.5 block text-[9px] leading-tight text-slate-500">{desc}</span></button>)}</div></section>
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 fade-up" style={{animationDelay:'200ms'}}><div className="flex items-center justify-between"><div><p className="m-0 text-[10px] font-bold uppercase tracking-wider text-teal">ISL recognition</p><h2 className="mb-0 mt-1 text-sm font-extrabold tracking-[-.04em]">Ready when you are</h2></div><div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f1edff] text-xl">⌁</div></div><p className="mb-3 mt-1 text-[11px] leading-relaxed text-slate-500">Practice a sign using your camera in the full studio.</p><button onClick={openStudio} className="w-full rounded-xl border border-ink bg-white px-3 py-2 text-xs font-bold text-ink">Start a recognition session</button></section>
    {notice && <p className="mt-3 text-center text-[10px] text-teal">{notice}</p>}
  </main>
}
createRoot(document.getElementById('root')).render(<App />)
