import React from 'react';
import {
  EXTENSION_THEMES,
  DEFAULT_AVATAR_CONFIG
} from '../constants/avatarCustomization';

/**
 * CustomizerModal Component
 * 
 * Interactive Studio for live personalization of:
 * - Theme Configuration (Ivory Pearl & Gold, Indigo Slate, Midnight Cyber, Royal Amethyst, Titanium Gold)
 * - Active 3D Avatar Model (Zhenja GLB)
 */
export function CustomizerModal({ isOpen, onClose, config, onUpdateConfig }) {
  if (!isOpen) return null;

  const handleChange = (key, value) => {
    onUpdateConfig({ ...config, [key]: value });
  };

  return (
    <div className="customizer-overlay" onClick={onClose}>
      <div className="customizer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="customizer-header">
          <div className="title-area">
            <h3>🎨 Extension & Theme Settings</h3>
            <span className="subtitle">Customize appearance and theme palette</span>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close Customizer">✕</button>
        </div>

        <div className="customizer-body">
          {/* 1. Professional Theme Configuration */}
          <div className="config-section">
            <label className="section-title">Professional Extension Theme:</label>
            <div className="chip-grid">
              {EXTENSION_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  className={`custom-chip flex items-center gap-2 ${config.themeId === theme.id ? 'active' : ''}`}
                  onClick={() => handleChange('themeId', theme.id)}
                >
                  <span
                    className="h-3 w-3 rounded-full border border-white/20 inline-block"
                    style={{ background: theme.primary }}
                  />
                  <span>{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Character Model & Rigged 3D Asset */}
          <div className="config-section">
            <label className="section-title">Active 3D Avatar:</label>
            <div className="chip-grid">
              <button
                className={`custom-chip ${config.modelId === 'zhenja' || !config.modelId ? 'active' : ''}`}
                onClick={() => handleChange('modelId', 'zhenja')}
              >
                ✨ Zhenja 3D Avatar (Photorealistic GLB)
              </button>
            </div>
          </div>
        </div>

        <div className="customizer-footer">
          <button
            className="reset-btn"
            onClick={() => onUpdateConfig(DEFAULT_AVATAR_CONFIG)}
          >
            Reset to Defaults
          </button>
          <button className="done-btn" onClick={onClose}>
            Apply & Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomizerModal;
