import { useEffect, useRef, useState } from 'react'

/**
 * Live recognition panel: captures screen, runs MediaPipe Hands, shows detected signs
 */
export function RecognitionPanel({ stream, isCapturing, isRunning, lastSign, fps, handDetected, onStart, onStop, onToggleRecognition }) {
  const previewRef = useRef(null)
  const [history, setHistory] = useState([])

  useEffect(() => {
    if (!stream || !previewRef.current) return
    previewRef.current.srcObject = stream
    previewRef.current.play().catch(() => {})
  }, [stream])

  useEffect(() => {
    if (lastSign) {
      setHistory(prev => [{ ...lastSign, time: Date.now() }, ...prev].slice(0, 12))
    }
  }, [lastSign])

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="m-0 text-xs font-bold uppercase tracking-[.15em] text-teal">Live Recognition</p>
          <h2 className="mb-0 mt-1 text-lg font-black tracking-[-.05em]">Screen → Signs</h2>
        </div>
        <div className="flex items-center gap-2">
          {isRunning && (
            <span className="rounded-full bg-[#d7f5ec] px-2 py-0.5 text-[10px] font-bold text-teal">
              {fps} fps
            </span>
          )}
          <div className={'grid h-9 w-9 place-items-center rounded-xl text-lg ' + (handDetected ? 'bg-[#d7f5ec]' : 'bg-slate-100')}>
            {handDetected ? '✋' : '🚫'}
          </div>
        </div>
      </div>

      {!isCapturing ? (
        <div className="mt-5 text-center">
          <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-slate-100 text-3xl">🖥</div>
          <p className="text-sm text-slate-500">Share your screen to capture sign language from any video app</p>
          <button onClick={onStart} className="mt-4 rounded-xl bg-ink px-5 py-2.5 text-xs font-bold text-mint transition hover:scale-[1.02]">
            Start Screen Capture
          </button>
        </div>
      ) : (
        <>
          <div className="relative mt-4 overflow-hidden rounded-2xl bg-ink">
            <video ref={previewRef} className="w-full rounded-2xl" style={{ maxHeight: 220, objectFit: 'cover' }} muted playsInline />
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2 py-1 backdrop-blur">
              <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[9px] font-bold text-white uppercase">Live</span>
            </div>
            <div className="absolute right-3 top-3 rounded-full bg-black/50 px-2 py-1 backdrop-blur">
              <span className="text-[9px] font-bold text-white uppercase">{handDetected ? 'Hand Detected' : 'No Hand'}</span>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={onToggleRecognition}
              className={'flex-1 rounded-xl px-3 py-2 text-xs font-bold transition ' + (isRunning ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-mint text-ink')}
            >
              {isRunning ? 'Stop Recognition' : 'Start Recognition'}
            </button>
            <button onClick={onStop} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600">
              Stop Capture
            </button>
          </div>

          {lastSign && (
            <div className="mt-4 rounded-2xl border border-[#c7d2fe] bg-[#f1edff] p-4 text-center">
              <p className="m-0 text-[10px] font-bold uppercase tracking-wider text-indigo-600">Latest Sign</p>
              <h3 className="m-0 mt-1 text-2xl font-black tracking-[-.04em] text-ink">{lastSign.label}</h3>
              <p className="m-0 mt-0.5 text-[11px] text-slate-500">{lastSign.category} · {lastSign.confidence}% confidence</p>
            </div>
          )}

          {history.length > 0 && (
            <div className="mt-4">
              <p className="m-0 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Recent Signs</p>
              <div className="flex flex-wrap gap-1.5">
                {history.map((s, i) => (
                  <span key={s.time + i} className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                    {s.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <p className="mt-4 text-center text-[10px] text-slate-400">
        Capture any video/streaming app showing sign language. The avatar mirrors detected signs live.
      </p>
    </div>
  )
}
