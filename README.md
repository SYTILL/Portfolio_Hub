# Cosmic Syntax · Portfolio Hub

Junsang Yoon's portfolio, drawn as a star atlas: every project is a star, every field a constellation.

**Live:** https://sytill.github.io/Portfolio_Hub/

- Gold stars are shipped projects; blue stars are in progress or experiments.
- The full map shows only constellation names. Click one (or a project in the list) to open it, draw its lines and label its stars.
- Panels collapse, and can be dragged between the left and right dock. The layout is remembered in the browser.

## Stack

Vite · React 19 · TypeScript · three.js · React Three Fiber 9. No UI framework; styles live in `src/styles/atlas.css`.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173/Portfolio_Hub/  (tuning panel on)
npm run build    # type-check + production build into dist/
npm run lint
```

## Where things are

| Path | What |
|---|---|
| `src/data/projects.ts` | The projects. Add one entry and its star, label, list row and catalog number follow. |
| `src/data/profile.ts` | Name, tagline, links. Leave `email` or `resumeUrl` empty to hide that row. |
| `src/config.ts` | Every animation and look value (`DEFAULTS`), the global speed and the entry timeline. |
| `src/scene/` | The 3D map: background stars, armillary rings, constellations, camera, labels, meteors. |
| `src/ui/` | Docks and panels (drag, collapse, FLIP motion), terminal, entry animation. |
| `src/dev/Tuner.tsx` | Live tuning panel. |

## Tuning

The tuning panel opens in `npm run dev`, or on the live site with `?tune` in the URL
(https://sytill.github.io/Portfolio_Hub/?tune). Changes apply instantly and are saved in that browser only.
"Copy values" gives a JSON you can paste into `DEFAULTS` in `src/config.ts` to make it permanent.

## Deploy

Every push to `main` builds and publishes to GitHub Pages through `.github/workflows/deploy.yml`.
The site is served under `/Portfolio_Hub/` (see `base` in `vite.config.ts`).
