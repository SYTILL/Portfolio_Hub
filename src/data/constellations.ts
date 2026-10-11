import type { CatKey } from './projects';

// What each constellation is about, shown in the Details panel when it is open.
// `line` is the one-sentence summary used on the full-map overview; `about` holds the longer paragraphs.
export interface ConstellationInfo { line: string; about: string[]; links?: [label: string, url: string][] }

export const MAP_INTRO = 'Each constellation is a field I work in, and each star is something I made in it. Pick one to see its stars.';

export const CONSTELLATIONS: Record<CatKey, ConstellationInfo> = {
  mobile: {
    line: 'iOS and Android apps, from first prototype to the stores.',
    about: [
      'Apps I design, build and ship on my own with Expo and React Native, backed by Supabase where they need a server.',
      'Beonyeok is live on the App Store and Google Play, and Bad Morning on Google Play. Wichu and CubeBlindfolded are in progress; the rest are prototypes I learned from.',
    ],
  },
  desktop: {
    line: 'Small, focused Windows tools.',
    about: [
      'Single-purpose Windows apps that do one job quickly: notes that open into one another, a screen recorder that starts with one key, and a live view of the notes in whatever your PC is playing.',
      'Each one is built with whatever fits the job: Tauri and React, C# with FFmpeg, or Python.',
    ],
  },
  web: {
    line: 'Sites, dashboards and interactive lessons.',
    about: [
      'bangusukdev.com is the home for all my apps: landing pages, store policy pages, payments and analytics, from one Next.js codebase.',
      'Alongside it are web prototypes, from a YouTube trends treemap to interactive music theory lessons, and Cosmic Syntax, my first portfolio, whose name this map still carries.',
    ],
  },
  lab: {
    line: 'Experiments I build to explore an idea.',
    about: ['Projects made to answer a question rather than to ship: a trading bot that detects chart patterns and backtests them, and an L-system tree generator with several render styles.'],
  },
  music: {
    line: 'Electronic music, released as aonova.',
    about: [
      'I have been making music for about five years in FL Studio, and I release it on SoundCloud as aonova.',
      'Most of my releases are future riddim, with melodic dubstep and house along the way, but I can write in any genre the work calls for. The six tracks here are picks from my SoundCloud.',
      'The space ambience playing in the background of this site is mine too.',
    ],
    links: [['aonova on SoundCloud', 'https://soundcloud.com/aonova']],
  },
};
