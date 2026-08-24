import React from 'react';

export function HistoryPanel({ history, isOpen, onClose, onClear, onExport }) {
  if (!isOpen) return null;

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, bottom: 0,
      width: '260px', zIndex: 15,
      background: 'rgba(10,12,24,0.92)',
      backdropFilter: 'blur(20px)',
      borderLeft: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', flexDirection: 'column',
      animation: 'slideInRight 0.25s cubic-bezier(0.4,0,0.2,1)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#a5b4fc' }}>
          History ({history.length})
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={onExport} title="Export" style={btnStyle}>↓</button>
          <button onClick={onClear} title="Clear" style={{ ...btnStyle, color: '#f87171' }}>✕</button>
          <button onClick={onClose} title="Close" style={btnStyle}>×</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
        {history.length === 0 && (
          <p style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', marginTop: '40px' }}>
            No signs yet. Start signing!
          </p>
        )}
        {history.map((h, i) => (
          <div key={i} style={{
            padding: '6px 8px', marginBottom: '3px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.04)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#f1f5f9' }}>
                {h.isFingerspelling ? '🔤 ' : ''}{h.label}
              </span>
              {h.accuracy && (
                <span style={{ fontSize: '9px', color: '#6ee7b7', fontWeight: 600 }}>
                  {h.accuracy}%
                </span>
              )}
            </div>
            <span style={{ fontSize: '9px', color: '#64748b' }}>{formatTime(h.timestamp)}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

const btnStyle = {
  width: '22px', height: '22px', borderRadius: '6px', border: 'none',
  background: 'rgba(255,255,255,0.08)', color: '#94a3b8',
  fontSize: '11px', cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
};
