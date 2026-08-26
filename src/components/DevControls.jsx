import React, { useState } from 'react';

/**
 * DevControls Component
 * 
 * Testing panel for ISL sequences & trigger for the Avatar Studio Customizer
 */
export function DevControls({
  onSendSequence,
  onClear,
  isIdle,
  currentSpeed,
  onSpeedChange,
  onOpenCustomizer
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [customInput, setCustomInput] = useState('NAMASTE HELLO RAVI HOW ARE YOU');

  const presetExamples = [
    { label: '🙏 Namaste & Greeting', tokens: ['NAMASTE', 'HELLO', 'YOU'] },
    { label: '🔤 Fingerspelling: RAVI', tokens: ['NAME', 'RAVI', 'WELCOME'] },
    { label: '🔤 Alphabet A-Z Test', tokens: ['A', 'B', 'C', 'D', 'E', 'I', 'O', 'U'] },
    { label: '❓ Questions (How / What)', tokens: ['HOW', 'YOU', 'WHAT', 'NAME'] },
    { label: '🤝 Courtesy & Help', tokens: ['PLEASE', 'HELP', 'ME', 'THANK_YOU'] },
    { label: '🇮🇳 India & Language', tokens: ['INDIA', 'LEARN', 'SIGN', 'LANGUAGE'] }
  ];

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    const tokens = customInput.trim().split(/\s+/);
    onSendSequence(tokens, 'replace');
  };

  return (
    <div className={`isl-dev-controls ${isOpen ? 'open' : 'collapsed'}`}>
      <div className="top-action-bar">
        <button
          className="customizer-trigger-btn"
          onClick={onOpenCustomizer}
          title="Open Avatar Customization Studio"
        >
          🎨 Customize Avatar
        </button>
        <button
          className="dev-toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
          title="Toggle ISL Simulator Panel"
        >
          {isOpen ? '✕ Close Test Panel' : '⚡ Simulate ISL Speech'}
        </button>
      </div>

      {isOpen && (
        <div className="dev-panel-body">
          <div className="panel-header">
            <h4>ISL Speech Simulator</h4>
            <span className="badge">{isIdle ? 'IDLE' : 'SIGNING'}</span>
          </div>

          {/* Custom Input */}
          <form onSubmit={handleCustomSubmit} className="input-group">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. NAMASTE RAVI HOW ARE YOU"
              className="text-input"
            />
            <button type="submit" className="btn-primary">
              Sign
            </button>
          </form>

          {/* Presets */}
          <div className="presets-section">
            <label className="section-label">ISL Presets & Fingerspelling:</label>
            <div className="preset-chips">
              {presetExamples.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendSequence(preset.tokens, 'replace')}
                  className="preset-chip"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Speed Controls */}
          <div className="speed-section">
            <label className="section-label">Playback Speed: {currentSpeed}x</label>
            <div className="speed-buttons">
              {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                <button
                  key={rate}
                  className={`speed-btn ${currentSpeed === rate ? 'active' : ''}`}
                  onClick={() => onSpeedChange(rate)}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="action-row">
            <button onClick={onClear} className="btn-danger">
              ⏹ Stop / Reset to Idle
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DevControls;
