import type { CaseFile } from './projects';

// Long write-ups for the case file, keyed by project id. Screenshots live in public/shots/<id>/.
// Only facts from each project's own docs and commits; no invented numbers.
export const CASES: Record<string, CaseFile> = {
  beonyeok: {
    role: 'Solo · product, design, app, backend and content pipeline',
    period: 'Mar 2026 – present',
    why: 'K-pop fans already know the songs by heart. Beonyeok turns those lyrics into Korean lessons: read a line, tap any word, and learn it in the context of a song you love.',
    built: [
      'Line-by-line lyric study: tap a word for its meaning, pronunciation and grammar notes',
      'A vocabulary book with memorization tracking, quizzes and study streaks',
      'Song requests: users vote on the next songs, with tickets, Pro limits and refunds when a request is declined',
      'Five interface languages: English, Japanese, Traditional Chinese, Spanish and Portuguese',
      'Google sign-in, RevenueCat subscriptions, AdMob ads and push notifications for new songs',
      'A separate Python and Remotion tool that turns lyrics into study videos',
    ],
    hard: [
      {
        title: 'Cloud traffic that blew past the free tier',
        body: 'In August the Supabase dashboard showed 8.31 GB of cached egress against a 5 GB limit, for a 50 MB database. I traced it to album covers being downloaded again every hour: storage served them with a one-hour cache header, and React Native’s default image cache was too small to keep them. The fix was long-lived cache headers and thumbnails for covers, expo-image disk caching, a song list trimmed from about 3.4 MB to 90 KB (estimated for 300 songs), random picks moved into a server function, and a 24-hour persisted query cache.',
      },
      {
        title: 'A Pro check the server can trust',
        body: 'Subscriptions live in RevenueCat on the device, while promo codes live in the database, so the server only knew half the story. Features that must be enforced server-side, like song requests, verify Pro through RevenueCat’s REST API inside a Supabase Edge Function.',
      },
    ],
    result: [
      'Live on the App Store and Google Play, now at version 1.1.3',
      'About 1,200 registered users and $220 in subscription revenue by October 17, 2026',
      'On the App Store: 45.6K impressions, 3.36K product page views and 969 first-time downloads',
      'An international audience: 39% use the app in Japanese, 36% in English and 20% in Traditional Chinese',
      '43% of users say they found it by searching the App Store; TikTok, YouTube and Instagram follow',
    ],
    shots: [
      { file: '1.webp', alt: 'Home screen with recently added songs and saved songs', kind: 'phone' },
      { file: '2.webp', alt: 'Lyric study screen with Korean lines, romanization and translation', kind: 'phone' },
      { file: '3.webp', alt: 'Word details sheet with meaning, analysis and description', kind: 'phone' },
      { file: '4.webp', alt: 'Memorized words list with levels and frequency tags', kind: 'phone' },
      { file: '5.webp', alt: 'Quiz asking for the meaning of a word', kind: 'phone' },
    ],
  },

  badmorning: {
    role: 'Solo · product, design, app and native alarm modules',
    period: 'Jun 2026 – present',
    why: 'Snoozing is too easy. Bad Morning keeps ringing until you finish a wake-up mission, so by the time it goes quiet you are actually awake.',
    built: [
      '22 wake-up missions',
      'Exact alarms on Android that take over the lock screen in full screen',
      'iOS alarms on Apple’s AlarmKit through a custom native module',
      'Korean and English, onboarding and wake-up stats',
    ],
    hard: [
      {
        title: 'The lock-screen Stop button that skipped every mission',
        body: 'AlarmKit always adds a Stop button to the lock screen, so a sleepy user could silence the alarm without ever opening the app, which defeats the point of the app. I closed it in three layers: the button now opens the app; pressing it schedules a second ring 15 seconds later that only the mission screen cancels; and while a mission runs, the app keeps pushing a 5-second ring into the future, so force-quitting the app brings the alarm back.',
      },
      {
        title: 'Alarms that multiplied',
        body: 'iOS issues a new ID every time an alarm is scheduled, and Android’s reschedule-after-ringing logic was also running on iOS, so each ring cloned the alarm. Old IDs are now cleared before scheduling, rescheduling is Android-only, and a developer screen compares scheduled system alarms with enabled ones.',
      },
    ],
    result: ['Live on Google Play', 'iOS version built; App Store release waits on real-device checks and payments'],
    shots: [
      { file: '1.webp', alt: 'No more boring, repetitive missions', kind: 'poster' },
      { file: '2.webp', alt: 'Unexpected missions every morning', kind: 'poster' },
      { file: '3.webp', alt: 'See your stats after waking up', kind: 'poster' },
    ],
  },

  nodt: {
    role: 'Solo · product, design and desktop app',
    period: 'Sep 2026',
    why: 'Most note apps ask where a note should live. Nodt asks where the thought goes next: every note opens into child notes side by side, with no folders, tags or search to manage.',
    built: [
      'Panels that open to the right as you follow a thought deeper',
      'A link is a single inline symbol pointing to exactly one child note, so no note is ever orphaned',
      'Rich-text editing with Tiptap; every note is saved as a Markdown file on disk',
      'Global undo, drag to reorder, right-click menus, Korean and English, six color themes',
    ],
    hard: [
      {
        title: 'Keeping a tree a tree',
        body: 'Each note has exactly one parent, and the order of links in the parent’s text decides the order of its children. Dragging a panel therefore has to move the matching link in the parent, and deleting a link removes the whole branch beneath it. Keeping the editor, the panel layout and the files on disk in step was the core of version 0.1.',
      },
    ],
    result: ['Version 0.1 built in three days (19 commits)', 'Free download for Windows'],
    shots: [
      { file: '1.webp', alt: 'Nested note panels in the indigo dark theme', kind: 'window' },
      { file: '2.webp', alt: 'Nested note panels in the teal light theme', kind: 'window' },
      { file: '3.webp', alt: 'Nested note panels in the graphite dark theme', kind: 'window' },
    ],
  },

  pitchview: {
    role: 'Solo · design and desktop app',
    period: 'Oct 2026',
    why: 'I wanted to see which notes are sounding in a piano recording while it plays, without importing files or opening a DAW.',
    built: [
      'Listens to whatever the PC is playing through WASAPI loopback, or to a microphone',
      'A live spectrum with a draggable frequency range, threshold and tilt controls',
      'A piano roll that shows the detected notes on each key',
      'An A4 reference setting for recordings that are not tuned to 440 Hz',
      'A translucent frameless window, shipped as a portable .exe',
    ],
    hard: [
      {
        title: 'Notes, not overtones',
        body: 'A single piano key produces a stack of harmonics, so a plain spectrum lights up several notes at once. A Hide Harmonics mode keeps only the played notes, and the threshold and tilt controls let quiet high notes still register.',
      },
    ],
    result: ['Free for Windows 10 and 11'],
    shots: [
      { file: '1.webp', alt: 'Spectrum and piano roll showing detected notes', kind: 'window' },
      { file: '2.webp', alt: 'PitchView with a different color gradient', kind: 'window' },
      { file: '3.webp', alt: 'PitchView with a pink color gradient', kind: 'window' },
    ],
  },

  fsr: {
    role: 'Solo · design and desktop app',
    period: 'Oct 2026',
    why: 'Recording a quick clip shouldn’t need an editor, an account or an upload. FastScreenRecorder is a small bar: press F9, and an MP4 lands in your Videos folder.',
    built: [
      'Record the whole screen, one window or a selected area, with system sound, microphone and cursor toggles',
      'Hardware encoding on NVIDIA, Intel or AMD GPUs through FFmpeg, at a smooth 60 fps',
      'A global F9 hotkey that works even when the bar is hidden behind other windows',
      'Pause and resume as often as you like; the parts are joined losslessly into one MP4',
      'Never connects to the internet; recordings stay on your PC',
    ],
    hard: [
      {
        title: 'Pausing without re-encoding',
        body: 'Each pause closes a segment, and when you stop, the segments are joined losslessly into a single MP4 instead of being encoded again, so stopping is instant and quality does not drop.',
      },
    ],
    result: ['Version 1.0.0 built for Windows 10 and 11', 'Landing page ready; the public download opens soon'],
    shots: [{ file: '1.webp', alt: 'Landing page showing the recording bar with source, capture and save options', kind: 'window' }],
  },

  site: {
    role: 'Solo · design and web',
    period: 'May 2026 – present',
    why: 'Every app needs a home: a landing page, privacy and terms pages for the stores, and sometimes a checkout. One Next.js site serves all of them.',
    built: [
      'Landing pages for five apps, each in its own visual style, joined by a bento home page',
      'Beonyeok’s landing page in five languages',
      'Privacy, terms, refund and data-deletion pages required by the App Store and Google Play',
      'Lemon Squeezy checkout (used for Nodt before it went free) and GA4 analytics',
      'A sitemap and robots file for search',
    ],
    hard: [
      {
        title: 'One site, five brands',
        body: 'Each product keeps its own look, from pastel for Beonyeok to a cyber grid for Bad Morning and paper for FastScreenRecorder, inside a single codebase, tied together by a dark bento home page.',
      },
    ],
    result: ['Live at bangusukdev.com'],
    shots: [
      { file: '1.webp', alt: 'bangusukdev.com home page with a bento grid of apps', kind: 'window' },
      { file: '2.webp', alt: 'Nodt landing page', kind: 'window' },
    ],
  },
};
