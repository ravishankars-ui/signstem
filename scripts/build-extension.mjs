import { build, mergeConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const shared = {
  base: './',
  plugins: [react(), tailwindcss()],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    modulePreload: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
};

async function buildEntry(name, globalName, emptyOutDir) {
  await build(
    mergeConfig(shared, {
      build: {
        emptyOutDir,
        rollupOptions: {
          input: resolve(root, `src/${name}.jsx`),
          output: {
            entryFileNames: `assets/${name}.js`,
            name: globalName,
          },
        },
      },
    }),
  );
}

await buildEntry('popup', 'SignSTEMPopup', true);
await buildEntry('learn', 'SignSTEMLearn', false);

console.log('Extension built in dist/ — load that folder in chrome://extensions');
