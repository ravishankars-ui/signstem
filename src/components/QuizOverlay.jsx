import React, { useState, useMemo } from 'react';

const QUIZ_VOCAB = [
  { token: 'HELLO', label: 'Hello', hint: 'Wave hand at temple' },
  { token: 'NAMASTE', label: 'Namaste', hint: 'Prayer hands at chest' },
  { token: 'GOOD', label: 'Good', hint: 'Thumbs up gesture' },
  { token: 'THANK_YOU', label: 'Thank You', hint: 'Flat hand from chin forward' },
  { token: 'PLEASE', label: 'Please', hint: 'Open palm circles on chest' },
  { token: 'HELP', label: 'Help', hint: 'Fist on palm, lift upward' },
  { token: 'YES', label: 'Yes', hint: 'Fist nods like head' },
  { token: 'NO', label: 'No', hint: 'Index + middle finger snap shut' },
  { token: 'YOU', label: 'You', hint: 'Point at person' },
  { token: 'ME', label: 'Me', hint: 'Point at self' },
  { token: 'FRIEND', label: 'Friend', hint: 'Interlock index fingers' },
  { token: 'LOVE', label: 'Love', hint: 'Cross arms over chest' },
  { token: 'WATER', label: 'Water', hint: 'W handshape, chin tap' },
  { token: 'FOOD', label: 'Food', hint: 'Flattened O hand to mouth' },
  { token: 'LEARN', label: 'Learn', hint: 'Fingers to forehead, pull away' },
  { token: 'COMPUTER', label: 'Computer', hint: 'Tapped fingers on palm' },
  { token: 'GRAVITY', label: 'Gravity', hint: 'Fist drops with weight' },
  { token: 'ATOM', label: 'Atom', hint: 'Fingers circle each other' },
  { token: 'ENERGY', label: 'Energy', hint: 'Hands push outward with force' },
  { token: 'LIGHT', label: 'Light', hint: 'Flicker fingers above head' },
];

export function QuizOverlay({ isOpen, onClose, onReveal }) {
  const [quizIndex, setQuizIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [streak, setStreak] = useState(0);

  const current = useMemo(() => QUIZ_VOCAB[quizIndex % QUIZ_VOCAB.length], [quizIndex]);

  if (!isOpen) return null;

  const handleAnswer = (correct) => {
    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));
    if (correct) setStreak(s => s + 1); else setStreak(0);
    setRevealed(false);
    setQuizIndex(i => i + 1);
    if (onReveal && correct) onReveal(current.token);
  };

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 18,
      background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        width: '100%', maxWidth: '320px',
        background: 'rgba(15,20,35,0.95)',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: '20px', padding: '20px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
      }}>
        {/* Score header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '10px', color: '#94a3b8' }}>
            Score: <strong style={{ color: '#6ee7b7' }}>{score.correct}/{score.total}</strong> ({accuracy}%)
          </span>
          {streak >= 3 && (
            <span style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 700 }}>
              🔥 Streak: {streak}
            </span>
          )}
        </div>

        {/* Quiz Card */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            How do you sign this in ISL?
          </p>
          <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', margin: '0 0 4px' }}>
            {current.label}
          </h3>
          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              style={{
                marginTop: '12px', padding: '8px 20px', borderRadius: '12px', border: 'none',
                background: 'rgba(255,255,255,0.08)',
                color: '#a5b4fc', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Reveal Gesture 👁
            </button>
          ) : (
            <div style={{ marginTop: '10px' }}>
              <p style={{ fontSize: '11px', color: '#c4b5fd', fontStyle: 'italic', margin: '0 0 12px' }}>
                💡 {current.hint}
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleAnswer(true)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  I Knew It ✓
                </button>
                <button
                  onClick={() => handleAnswer(false)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Still Learning ✗
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '8px', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)',
            color: '#64748b', fontSize: '11px', cursor: 'pointer',
          }}
        >
          Close Quiz
        </button>
      </div>
    </div>
  );
}
