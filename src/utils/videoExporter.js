export async function exportVideo(durationMs = 5000) {
  const canvas = document.querySelector('canvas');
  if (!canvas) {
    alert('No canvas found. The avatar must be visible to export.');
    return null;
  }

  const stream = canvas.captureStream(30);
  const chunks = [];
  const recorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 2500000,
  });

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `signstem-export-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
      resolve(blob);
    };

    recorder.start();
    setTimeout(() => recorder.stop(), durationMs);
  });
}
