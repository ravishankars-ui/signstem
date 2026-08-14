# SignSTEM Chrome Extension

SignSTEM is a Manifest V3 learning companion designed around accessible STEM learning and a future Indian Sign Language (ISL) recognition experience.

## What is included

- **Popup dashboard** — fast entry point with STEM subject selection, learning progress, and helper switch.
- **Learning Studio** — a full extension page for ISL practice and recognition. It avoids camera permissions until a model has been connected.
- **In-page helper** — a small, dismissible assistant on web pages. It can surface selected text for a simple explanation or save the selection locally.
- **MV3 service worker** — centralized settings and a model/API message boundary (`SIGNSTEM_ANALYZE_SIGN`).
- **Minimal permissions** — `storage` for settings/saved concepts. The helper runs only on ordinary HTTP(S) webpages; no camera or browsing-history permission is requested.

## Development

```powershell
npm.cmd install
npm.cmd run build
```

The ready-to-load extension is generated in `dist/`.

## Install in Chrome

1. Open `chrome://extensions`.
2. Turn on **Developer mode** (top-right).
3. Select **Load unpacked**.
4. Choose the project's `dist` folder.
5. Pin **SignSTEM** from Chrome’s Extensions menu, then open any normal webpage to use the page helper.

After a source change, run `npm.cmd run build` and press the extension's reload button on `chrome://extensions`.

## Adding the ISL model / API

`public/background.js` is the integration seam. Replace the placeholder response inside the `SIGNSTEM_ANALYZE_SIGN` handler with your authenticated API call or locally packaged model path. Only then add the smallest necessary permissions (for example, `camera` is requested at runtime by the extension page rather than declared as a broad manifest permission).

## Scene.mp4

No `Scene.mp4` was included in the supplied workspace. The popup intentionally uses a tiny animated illustration; the Studio page has a visual placeholder where an optimized, muted, short video can later be introduced. Put a compressed file under `public/assets/` and reference it only from `learn.jsx`—not the popup—to avoid slowing the extension’s most frequent surface.

## Avatar source

The signing avatar is a self-contained 2D SVG component (`src/components/DynamicSignAvatar.jsx`) — no external engine, no 3D/WebGL, and no dependency outside this project. It renders a layered vector figure with gradient shading, natural blinking and gaze drift, a subtle breathing loop, and smooth CSS-driven transitions between hand shapes (`relaxed`, `point`, `open5`, `flat`, `fistThumb`) for each pose in `POSES`. Because it's plain SVG + CSS, it's lightweight, fully editable, and needs no build-time asset outside the extension itself.
