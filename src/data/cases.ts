import type { CaseFile } from './projects';

// Long write-ups for the case file, keyed by project id. Screenshots live in public/shots/<id>/.
// Only facts from each project's own docs and commits; no invented numbers.
// Written for someone hiring: what the product is (`why` opens the file), the few things that matter in what was built,
// the hardest problems and how they were solved, and the results. Routine features are left out.
export const CASES: Record<string, CaseFile> = {
  beonyeok: {
    role: 'Solo · product, design, app and backend',
    period: 'Mar 2026 – present',
    why: 'Beonyeok is a Korean-learning app for iOS and Android that teaches through K-pop lyrics. Learners study a song line by line, tap any word for its meaning, pronunciation and grammar, and keep what they learn in a vocabulary book with quizzes. Fans already know the songs by heart, so the words stick.',
    built: [
      'Line-by-line lyric study: tap any word for its meaning, pronunciation and grammar, then review it in a vocabulary book and quizzes',
      'Subscriptions and ads (RevenueCat, AdMob), with Pro verified on the server for the features it must enforce',
      'Five interface languages from launch, for a mostly international audience',
    ],
    hard: [
      {
        title: 'Cloud traffic that blew past the free tier',
        body: 'Supabase showed 8.31 GB of cached egress against a 5 GB limit, for a 50 MB database. Album covers were being downloaded again every hour: storage sent a one-hour cache header and the app’s image cache was too small to keep them. I fixed it with long-lived cache headers and thumbnails, disk caching, a song list cut from about 3.4 MB to 90 KB, and a 24-hour persisted query cache.',
      },
      {
        title: 'Faster song requests made users angrier',
        body: 'Choosing which songs to add was hard, so I opened song requests: one open request per user, and another once it was added. Bad ratings followed, complaining that requests were slow. I recognised loss aversion from studying nudge design: a waiting request felt like all the songs they could have asked for if I had been quicker. Limiting each user to one request in total ended the complaints.',
      },
    ],
    result: [
      'Live on the App Store and Google Play, now at version 1.1.3',
      'About 1,200 registered users and $220 in subscription revenue by October 17, 2026',
      'App Store: 45.6K impressions and 969 first-time downloads; 43% of users found it by searching the store',
      '64% use it in a language other than English: Japanese 39%, Traditional Chinese 20%',
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
    why: 'Bad Morning is an alarm app for Android and iOS that will not go quiet until you finish a wake-up mission. Snoozing is too easy; by the time the alarm stops, you are actually awake.',
    built: [
      '22 wake-up missions',
      'Android exact alarms that take over the lock screen in full screen',
      'iOS alarms on Apple’s AlarmKit through a custom native module, from the same codebase',
    ],
    hard: [
      {
        title: 'The lock-screen Stop button that skipped every mission',
        body: 'AlarmKit always adds a Stop button to the lock screen, so a sleepy user could silence the alarm without ever opening the app. I closed it in three layers: Stop now opens the app; it also schedules a second ring 15 seconds later that only the mission screen cancels; and while a mission runs, the app keeps pushing a 5-second ring into the future, so force-quitting brings the alarm back.',
      },
      {
        title: 'Alarms that multiplied',
        body: 'iOS issues a new ID every time an alarm is scheduled, and Android’s reschedule-after-ringing logic was also running on iOS, so each ring cloned the alarm. Old IDs are now cleared before scheduling and rescheduling is Android-only.',
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
    why: 'Nodt is a note-taking app for Windows built around following a thought. Every note opens into child notes in panels side by side, so instead of filing notes into folders you keep going deeper into an idea. Notes are saved as plain Markdown files.',
    built: [
      'Panels that open to the right as you follow a thought deeper',
      'Rich-text editing, with every note saved as a Markdown file on disk',
      'A Windows desktop app built with Tauri and React',
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
    why: 'PitchView is a small Windows app that shows, live, which musical notes are sounding in whatever your PC is playing. It listens to the speaker output or a microphone and marks the notes on a piano keyboard, with no files to import and no music software to open.',
    built: [
      'Listens to whatever the PC is playing through WASAPI loopback, or to a microphone',
      'A live spectrum and a piano roll that shows the detected notes on each key',
      'Shipped as a single portable .exe',
    ],
    hard: [
      {
        title: 'Notes, not overtones',
        body: 'A single piano key produces a stack of harmonics, so a plain spectrum lights up several notes at once. A Hide Harmonics mode keeps only the played notes, and threshold and tilt controls let quiet high notes still register.',
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
    why: 'FastScreenRecorder is a lightweight screen recorder for Windows: a small bar that starts recording when you press F9 and saves an MP4 to your Videos folder, with no editor, account or upload.',
    built: [
      'Record the whole screen, one window or an area, with system sound and microphone',
      'Hardware encoding on NVIDIA, Intel or AMD GPUs through FFmpeg, at 60 fps',
      'A global F9 hotkey that works even when the bar is hidden',
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
    why: 'bangusukdev.com is the website for all of my apps. It hosts each app’s landing page, the privacy and terms pages the app stores require, and checkout, from one Next.js codebase.',
    built: [
      'Landing pages for five apps, each in its own visual style, joined by one home page',
      'The privacy, terms and data-deletion pages the App Store and Google Play require',
      'Checkout (Lemon Squeezy) and analytics (GA4)',
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
