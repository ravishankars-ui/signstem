export function createShareLink(tokens) {
  const q = Array.isArray(tokens) ? tokens.join(',') : tokens;
  const base = 'https://signstem.app/play';
  return `${base}?q=${encodeURIComponent(q)}`;
}

export function parseShareLink(url) {
  try {
    const u = new URL(url);
    const q = u.searchParams.get('q');
    if (!q) return null;
    return q.split(',').map(t => t.trim().toUpperCase()).filter(Boolean);
  } catch { return null; }
}

export function autoPlayFromURL(enqueueTokens) {
  try {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      const tokens = q.split(',').map(t => t.trim().toUpperCase()).filter(Boolean);
      if (tokens.length > 0) {
        setTimeout(() => enqueueTokens(tokens, 'replace'), 500);
      }
    }
  } catch {}
}
