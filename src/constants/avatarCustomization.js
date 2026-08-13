/**
 * Avatar Customization Presets & Palettes
 * 
 * Calibrated natural human skin tones with realistic highlights,
 * modern hair styles, and fitted apparel.
 */

export const SKIN_TONES = [
  {
    id: 'porcelain',
    name: 'Warm Porcelain',
    base: '#fce7db',
    mid: '#f3c4a8',
    dark: '#d99a77',
    shadow: '#ba7a58',
    light: '#fff5ee',
    blush: '#f472b6'
  },
  {
    id: 'golden',
    name: 'Golden Honey',
    base: '#fbd5ab',
    mid: '#eab078',
    dark: '#ca854d',
    shadow: '#a36332',
    light: '#ffecd4',
    blush: '#fb7185'
  },
  {
    id: 'amber',
    name: 'Warm Amber',
    base: '#e8a876',
    mid: '#cf8650',
    dark: '#a86130',
    shadow: '#80421a',
    light: '#f7caa6',
    blush: '#f43f5e'
  },
  {
    id: 'bronze',
    name: 'Warm Almond Bronze',
    base: '#c98254',
    mid: '#a86134',
    dark: '#7c411e',
    shadow: '#59290f',
    light: '#e09f74',
    blush: '#e11d48'
  },
  {
    id: 'mocha',
    name: 'Deep Espresso',
    base: '#8a4f2e',
    mid: '#6b371b',
    dark: '#4a220e',
    shadow: '#311406',
    light: '#a86a44',
    blush: '#9f1239'
  }
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
  skinToneId: 'golden',
  hairStyleId: 'wavy-bob',
  hairColorId: 'dark-espresso',
  outfitStyleId: 'fitted-blazer',
  clothingPaletteId: 'royal-navy',
  accessoryId: 'none',
  handScale: 1.0
};
