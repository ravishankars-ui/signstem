/**
 * Avatar Customization Presets, Palettes, Extension Themes & Mode Toggles
 */

export const THEME_MODES = {
  DARK: 'dark',
  LIGHT: 'light',
  IVORY: 'light'
};

export const EXTENSION_THEMES = [
  {
    id: 'ivory-pearl',
    name: 'Ivory Pearl & Gold',
    dark: {
      bg: '#0c101c',
      cardBg: '#13182b',
      border: 'rgba(215, 203, 185, 0.25)',
      primary: '#6366f1',
      primaryHover: '#4f46e5',
      accent: '#c59b27',
      badge: 'rgba(197, 155, 39, 0.15)',
      text: '#ffffff',
      textMuted: '#a8a29e',
      suit0: '#4f46e5', suit1: '#3730a3', suit2: '#1e1b4b'
    },
    light: {
      bg: '#faf8f5',
      cardBg: '#ffffff',
      border: 'rgba(215, 203, 185, 0.65)',
      primary: '#4f46e5',
      primaryHover: '#4338ca',
      accent: '#c59b27',
      badge: 'rgba(99, 102, 241, 0.08)',
      text: '#1e1b18',
      textMuted: '#57534e',
      suit0: '#3b82f6', suit1: '#1d4ed8', suit2: '#1e40af'
    }
  },
  {
    id: 'indigo-slate',
    name: 'Indigo Slate',
    dark: {
      bg: '#0b0f19',
      cardBg: '#131726',
      border: 'rgba(99, 102, 241, 0.3)',
      primary: '#6366f1',
      primaryHover: '#4f46e5',
      accent: '#06b6d4',
      badge: 'rgba(99, 102, 241, 0.15)',
      text: '#ffffff',
      textMuted: '#94a3b8',
      suit0: '#4f46e5', suit1: '#3730a3', suit2: '#1e1b4b'
    },
    light: {
      bg: '#faf8f5',
      cardBg: '#ffffff',
      border: 'rgba(99, 102, 241, 0.25)',
      primary: '#4f46e5',
      primaryHover: '#4338ca',
      accent: '#0891b2',
      badge: 'rgba(99, 102, 241, 0.1)',
      text: '#0f172a',
      textMuted: '#475569',
      suit0: '#3b82f6', suit1: '#1d4ed8', suit2: '#1e40af'
    }
  },
  {
    id: 'midnight-cyber',
    name: 'Midnight Cyber',
    dark: {
      bg: '#030712',
      cardBg: '#0b1329',
      border: 'rgba(16, 185, 129, 0.3)',
      primary: '#10b981',
      primaryHover: '#059669',
      accent: '#6ee7b7',
      badge: 'rgba(16, 185, 129, 0.15)',
      text: '#ffffff',
      textMuted: '#9ca3af',
      suit0: '#059669', suit1: '#047857', suit2: '#064e3b'
    },
    light: {
      bg: '#f0fdf4',
      cardBg: '#ffffff',
      border: 'rgba(16, 185, 129, 0.25)',
      primary: '#059669',
      primaryHover: '#047857',
      accent: '#10b981',
      badge: 'rgba(16, 185, 129, 0.1)',
      text: '#064e3b',
      textMuted: '#374151',
      suit0: '#10b981', suit1: '#059669', suit2: '#047857'
    }
  },
  {
    id: 'royal-amethyst',
    name: 'Royal Amethyst',
    dark: {
      bg: '#0f0d23',
      cardBg: '#1a1638',
      border: 'rgba(139, 92, 246, 0.35)',
      primary: '#8b5cf6',
      primaryHover: '#7c3aed',
      accent: '#f43f5e',
      badge: 'rgba(139, 92, 246, 0.18)',
      text: '#ffffff',
      textMuted: '#a78bfa',
      suit0: '#7c3aed', suit1: '#6d28d9', suit2: '#4c1d95'
    },
    light: {
      bg: '#faf5ff',
      cardBg: '#ffffff',
      border: 'rgba(139, 92, 246, 0.25)',
      primary: '#7c3aed',
      primaryHover: '#6d28d9',
      accent: '#e11d48',
      badge: 'rgba(139, 92, 246, 0.1)',
      text: '#2e1065',
      textMuted: '#4b5563',
      suit0: '#8b5cf6', suit1: '#7c3aed', suit2: '#6d28d9'
    }
  },
  {
    id: 'titanium-gold',
    name: 'Titanium Gold',
    dark: {
      bg: '#121215',
      cardBg: '#1c1c21',
      border: 'rgba(245, 158, 11, 0.35)',
      primary: '#f59e0b',
      primaryHover: '#d97706',
      accent: '#fbbf24',
      badge: 'rgba(245, 158, 11, 0.18)',
      text: '#ffffff',
      textMuted: '#d4d4d8',
      suit0: '#d97706', suit1: '#b45309', suit2: '#78350f'
    },
    light: {
      bg: '#fffbeb',
      cardBg: '#ffffff',
      border: 'rgba(245, 158, 11, 0.25)',
      primary: '#d97706',
      primaryHover: '#b45309',
      accent: '#f59e0b',
      badge: 'rgba(245, 158, 11, 0.1)',
      text: '#78350f',
      textMuted: '#4b5563',
      suit0: '#f59e0b', suit1: '#d97706', suit2: '#b45309'
    }
  }
];

export const SKIN_TONES = [
  { id: 'porcelain', name: 'Warm Porcelain', base: '#fce7db', mid: '#f3c4a8', dark: '#d99a77', shadow: '#ba7a58', light: '#fff5ee', blush: '#f472b6' },
  { id: 'golden', name: 'Golden Honey', base: '#fbd5ab', mid: '#eab078', dark: '#ca854d', shadow: '#a36332', light: '#ffecd4', blush: '#fb7185' },
  { id: 'amber', name: 'Warm Amber', base: '#e8a876', mid: '#cf8650', dark: '#a86130', shadow: '#80421a', light: '#f7caa6', blush: '#f43f5e' },
  { id: 'bronze', name: 'Warm Almond Bronze', base: '#c98254', mid: '#a86134', dark: '#7c411e', shadow: '#59290f', light: '#e09f74', blush: '#e11d48' },
  { id: 'mocha', name: 'Deep Espresso', base: '#8a4f2e', mid: '#6b371b', dark: '#4a220e', shadow: '#311406', light: '#a86a44', blush: '#9f1239' }
];

export const HAIR_STYLES = [
  { id: 'wavy-bob', name: 'Wavy Bob with Bangs', type: 'medium' },
  { id: 'modern-crop', name: 'Modern Textured Crop', type: 'short' },
  { id: 'slick-side', name: 'Slick Side-Part', type: 'short' },
  { id: 'neat-bun', name: 'High Topknot Bun', type: 'updo' },
  { id: 'long-layers', name: 'Long Flowing Layers', type: 'long' }
];

export const HAIR_COLORS = [
  { id: 'jet-black', name: 'Jet Black', base: '#18181b', highlight: '#3f3f46' },
  { id: 'dark-espresso', name: 'Dark Espresso', base: '#2c1e19', highlight: '#4a342c' },
  { id: 'chestnut', name: 'Chestnut Brown', base: '#451d0d', highlight: '#78350f' },
  { id: 'burgundy', name: 'Deep Burgundy', base: '#4c0519', highlight: '#881337' },
  { id: 'ash-silver', name: 'Silver Slate', base: '#475569', highlight: '#94a3b8' }
];

export const OUTFIT_STYLES = [
  { id: 'fitted-blazer', name: 'Modern Tailored Blazer' },
  { id: 'cozy-sweater', name: 'Ribbed Crewneck Sweater' },
  { id: 'smart-polo', name: 'Classic Smart Polo' },
  { id: 'mandarin-kurta', name: 'Mandarin Collar Kurta' }
];

export const CLOTHING_PALETTES = [
  { id: 'royal-navy', name: 'Royal Indigo Navy', primary: '#1e3a8a', secondary: '#3b82f6', trim: '#93c5fd' },
  { id: 'emerald-slate', name: 'Emerald Forest', primary: '#064e3b', secondary: '#059669', trim: '#6ee7b7' },
  { id: 'charcoal-noir', name: 'Charcoal Noir', primary: '#18181b', secondary: '#27272a', trim: '#71717a' },
  { id: 'burgundy-wine', name: 'Burgundy Wine', primary: '#4c0519', secondary: '#881337', trim: '#f43f5e' },
  { id: 'warm-terracotta', name: 'Warm Terracotta', primary: '#7c2d12', secondary: '#c2410c', trim: '#fdba74' }
];

export const ACCESSORIES = [
  { id: 'none', name: 'None' },
  { id: 'glasses-modern', name: 'Modern Wireframe Glasses' },
  { id: 'hearing-aid', name: 'Behind-Ear Hearing Aid' },
  { id: 'bindi', name: 'Traditional Bindi' }
];

export const DEFAULT_AVATAR_CONFIG = {
  gender: 'female',
  themeMode: 'light',
  themeId: 'ivory-pearl',
  skinToneId: 'golden',
  hairStyleId: 'wavy-bob',
  hairColorId: 'dark-espresso',
  outfitStyleId: 'fitted-blazer',
  clothingPaletteId: 'royal-navy',
  accessoryId: 'none',
  handScale: 1.0
};
