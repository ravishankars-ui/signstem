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
      width: '260px', zIndex: 25,
      background: 'var(--bg-surface-glass)',
      backdropFilter: 'blur(20px)',
      borderLeft: '1px solid var(--border-color)',
      boxShadow: 'var(--card-shadow)',
      display: 'flex', flexDirection: 'column',
      animation: 'slideInRight 0.25s cubic-bezier(0.4,0,0.2,1)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', borderBottom: '1px solid var(--border-color)',
      }}>
        <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-primary)' }}>
          History ({history.length})
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={onExport} title="Export" style={btnStyle}>↓</button>
          <button onClick={onClear} title="Clear" style={{ ...btnStyle, color: '#ef4444' }}>✕</button>
          <button onClick={onClose} title="Close" style={btnStyle}>×</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
        {history.length === 0 && (
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>
            No signs yet. Start signing!
          </p>
        )}
        {history.map((h, i) => (
          <div key={i} style={{
            padding: '7px 10px', marginBottom: '4px', borderRadius: '9px',
            background: 'var(--bg-surface-raised)',
            border: '1px solid var(--border-color)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {h.isFingerspelling ? '🔤 ' : ''}{h.label}
              </span>
              {h.accuracy && (
                <span style={{ fontSize: '9px', color: '#10b981', fontWeight: 700 }}>
                  {h.accuracy}%
                </span>
              )}
            </div>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{formatTime(h.timestamp)}</span>
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
  width: '24px', height: '24px', borderRadius: '7px', border: '1px solid var(--border-color)',
  background: 'var(--bg-surface-raised)', color: 'var(--text-secondary)',
  fontSize: '11px', cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
};

export default HistoryPanel;
