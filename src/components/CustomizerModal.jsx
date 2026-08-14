import React from 'react';
import {
  SKIN_TONES,
  HAIR_STYLES,
  HAIR_COLORS,
  OUTFIT_STYLES,
  CLOTHING_PALETTES,
  ACCESSORIES,
  DEFAULT_AVATAR_CONFIG
} from '../constants/avatarCustomization';

/**
 * CustomizerModal Component
 * 
 * Interactive Avatar Studio for live personalization of:
 * - Character Model, Skin Tones, Hair Styles & Colors
 * - Professional Outfits & Palettes
 * - Accessibility Accessories (Hearing Aid, Glasses, Bindi)
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
            <h3>🎨 Avatar Studio</h3>
            <span className="subtitle">Customize your Indian Sign Language Avatar</span>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close Customizer">✕</button>
        </div>

        <div className="customizer-body">
          {/* 1. Character Identity */}
          <div className="config-section">
            <label className="section-title">Character Model:</label>
            <div className="chip-group">
              <button
                className={`custom-chip ${config.gender === 'female' ? 'active' : ''}`}
                onClick={() => handleChange('gender', 'female')}
              >
                👩 Priya (Female)
              </button>
              <button
                className={`custom-chip ${config.gender === 'male' ? 'active' : ''}`}
                onClick={() => handleChange('gender', 'male')}
              >
                👨 Aarav (Male)
              </button>
            </div>
          </div>

          {/* 2. Skin Tone Palette */}
          <div className="config-section">
            <label className="section-title">Skin Tone:</label>
            <div className="swatch-group">
              {SKIN_TONES.map((tone) => (
                <button
                  key={tone.id}
                  className={`swatch-btn ${config.skinToneId === tone.id ? 'active' : ''}`}
                  style={{ background: tone.base }}
                  onClick={() => handleChange('skinToneId', tone.id)}
                  title={tone.name}
                >
                  {config.skinToneId === tone.id && <span className="check">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Hairstyle & Color */}
          <div className="config-section">
            <label className="section-title">Hairstyle:</label>
            <div className="chip-grid">
              {HAIR_STYLES.map((style) => (
                <button
                  key={style.id}
                  className={`custom-chip ${config.hairStyleId === style.id ? 'active' : ''}`}
                  onClick={() => handleChange('hairStyleId', style.id)}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>

          <div className="config-section">
            <label className="section-title">Hair Color:</label>
            <div className="swatch-group">
              {HAIR_COLORS.map((hc) => (
                <button
                  key={hc.id}
                  className={`swatch-btn ${config.hairColorId === hc.id ? 'active' : ''}`}
                  style={{ background: hc.base }}
                  onClick={() => handleChange('hairColorId', hc.id)}
                  title={hc.name}
                >
                  {config.hairColorId === hc.id && <span className="check">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Outfit Style & Palette */}
          <div className="config-section">
            <label className="section-title">Outfit Style:</label>
            <div className="chip-grid">
              {OUTFIT_STYLES.map((outfit) => (
                <button
                  key={outfit.id}
                  className={`custom-chip ${config.outfitStyleId === outfit.id ? 'active' : ''}`}
                  onClick={() => handleChange('outfitStyleId', outfit.id)}
                >
                  {outfit.name}
                </button>
              ))}
            </div>
          </div>

          <div className="config-section">
            <label className="section-title">Clothing Color:</label>
            <div className="swatch-group">
              {CLOTHING_PALETTES.map((cp) => (
                <button
                  key={cp.id}
                  className={`swatch-btn ${config.clothingPaletteId === cp.id ? 'active' : ''}`}
                  style={{ background: cp.primary }}
                  onClick={() => handleChange('clothingPaletteId', cp.id)}
                  title={cp.name}
                >
                  {config.clothingPaletteId === cp.id && <span className="check">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Accessories */}
          <div className="config-section">
            <label className="section-title">Accessories & Accessibility:</label>
            <div className="chip-grid">
              {ACCESSORIES.map((acc) => (
                <button
                  key={acc.id}
                  className={`custom-chip ${config.accessoryId === acc.id ? 'active' : ''}`}
                  onClick={() => handleChange('accessoryId', acc.id)}
                >
                  {acc.name}
                </button>
              ))}
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
            Apply & Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomizerModal;
