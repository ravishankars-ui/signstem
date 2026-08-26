/**
 * SignSTEM Chrome Extension Build Script
 */

import { build } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import './generate-icons.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

console.log('🚀 Building SignSTEM Chrome Extension...');

try {
  await build({
    configFile: resolve(root, 'vite.config.js'),
  });

  function safeCopyFile(src, dest) {
    try {
      fs.copyFileSync(src, dest);
    } catch (e) {
      try {
        const content = fs.readFileSync(src);
        fs.writeFileSync(dest, content);
      } catch (err) {
        console.warn(`Warning copying ${src} to ${dest}:`, err.message);
      }
    }
  }

  // Explicitly sync content script, CSS & vendor libraries to dist
  safeCopyFile(resolve(root, 'public/content.js'), resolve(root, 'dist/content.js'));
  safeCopyFile(resolve(root, 'public/content.css'), resolve(root, 'dist/content.css'));
  if (fs.existsSync(resolve(root, 'public/vendor'))) {
    fs.cpSync(resolve(root, 'public/vendor'), resolve(root, 'dist/vendor'), { recursive: true });
  }

  // Verification of build outputs
  const requiredFiles = [
    'dist/manifest.json',
    'dist/index.html',
    'dist/popup.html',
    'dist/learn.html',
    'dist/sidepanel.html',
    'dist/background.js',
    'dist/content.js',
    'dist/content.css',
    'dist/icons/icon-16.png',
    'dist/icons/icon-48.png',
    'dist/icons/icon-128.png',
  ];

  let missing = 0;
  for (const relPath of requiredFiles) {
    const fullPath = resolve(root, relPath);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Missing build artifact: ${relPath}`);
      missing++;
    }
  }

  if (missing === 0) {
    console.log('\n✨ SignSTEM Chrome Extension built successfully in dist/ !');
    console.log('📦 To install in Chrome:');
    console.log('  1. Open chrome://extensions');
    console.log('  2. Enable Developer mode (top right)');
    console.log('  3. Click "Load unpacked" and choose the "dist" folder.\n');
  } else {
    process.exit(1);
  }
} catch (err) {
  console.error('❌ Build failed:', err);
  process.exit(1);
}
