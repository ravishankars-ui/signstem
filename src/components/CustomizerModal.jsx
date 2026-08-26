import React from 'react';
import {
  EXTENSION_THEMES,
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
 * - Theme Configuration (Indigo Slate, Midnight Cyber, Royal Amethyst, Titanium Gold)
 * - Character Model, Skin Tones, Hair Styles & Colors
 * - Professional Outfits & Clothing Palettes
 * - Accessibility Accessories (Glasses, Hearing Aid, Bindi)
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
            <h3>🎨 Extension & Avatar Studio Settings</h3>
            <span className="subtitle">Customize appearance, theme palette, and character styling</span>
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
            <label className="section-title">Character Model & 3D Rigged Avatar:</label>
            <div className="chip-grid">
              <button
                className={`custom-chip ${config.modelId === 'zhenja' || !config.modelId ? 'active' : ''}`}
                onClick={() => handleChange('modelId', 'zhenja')}
              >
                ✨ Zhenja 3D Avatar (Ready Player Me GLB)
              </button>
              <button
                className={`custom-chip ${config.modelId === 'fbx' ? 'active' : ''}`}
                onClick={() => handleChange('modelId', 'fbx')}
              >
                👤 Ch33 FBX Avatar (Mixamo Rig)
              </button>
              <button
                className={`custom-chip ${config.gender === 'female' && config.modelId !== 'zhenja' ? 'active' : ''}`}
                onClick={() => { handleChange('modelId', 'ybot'); handleChange('gender', 'female'); }}
              >
                👩 Ybot Female Mesh
              </button>
              <button
                className={`custom-chip ${config.gender === 'male' && config.modelId !== 'zhenja' ? 'active' : ''}`}
                onClick={() => { handleChange('modelId', 'xbot'); handleChange('gender', 'male'); }}
              >
                👨 Xbot Male Mesh
              </button>
            </div>
          </div>


          {/* 3. Skin Tone Palette */}
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

          {/* 4. Hairstyle & Color */}
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

          {/* 5. Outfit Style & Palette */}
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

          {/* 6. Accessories */}
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
            Apply & Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomizerModal;
