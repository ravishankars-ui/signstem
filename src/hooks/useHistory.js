import { useState, useCallback } from 'react';

export function useHistory(maxSize = 50) {
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('isl_sign_history');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const addHistory = useCallback((item) => {
    setHistory(prev => {
      const entry = {
        token: item.token,
        label: item.label || item.token,
        isFingerspelling: item.isFingerspelling || false,
        timestamp: Date.now(),
        accuracy: item.accuracy?.overallScore || null,
      };
      const next = [entry, ...prev].slice(0, maxSize);
      try { localStorage.setItem('isl_sign_history', JSON.stringify(next)); } catch {}
      return next;
    });
  }, [maxSize]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try { localStorage.removeItem('isl_sign_history'); } catch {}
  }, []);

  const exportHistory = useCallback(() => {
    const text = history.map(h => {
      const t = new Date(h.timestamp);
      const time = t.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      return `[${time}] ${h.label}${h.isFingerspelling ? ' (finger)' : ''}${h.accuracy ? ` ${h.accuracy}%` : ''}`;
    }).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'signstem-history.txt'; a.click();
    URL.revokeObjectURL(url);
  }, [history]);

  return { history, addHistory, clearHistory, exportHistory };
}
