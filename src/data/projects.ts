import { CASES } from './cases';

export type CatKey = 'mobile' | 'desktop' | 'web' | 'lab';
export type Status = 'live' | 'wip' | 'proto' | 'lab';

export interface Project {
  id: string;
  name: string;
  cat: CatKey;
  /** Month the project started, YYYY-MM. Drives the ignition order and catalog numbers. */
  start: string;
  status: Status;
  statusText: string;
  one: string;
  stack: string[];
  points?: string[];
  links?: [label: string, url: string][];
  /** The long write-up shown in the case file. */
  case?: CaseFile;
}

export interface Shot { file: string; alt: string; kind: 'phone' | 'poster' | 'window' }
export interface CaseFile {
  role: string;
  period: string;
  why: string;
  built: string[];
  hard: { title: string; body: string }[];
  result: string[];
  shots: Shot[];
}

export const CATS: Record<CatKey, { label: string }> = {
  mobile: { label: 'Mobile' },
  desktop: { label: 'Desktop' },
  web: { label: 'Web' },
  lab: { label: 'Lab' },
};
export const CAT_KEYS = Object.keys(CATS) as CatKey[];

// To add a project, add one entry here. Its star, label, list row and catalog number follow automatically.
export const PROJECTS: Project[] = [
  { id: 'beonyeok', name: 'Beonyeok', cat: 'mobile', start: '2026-03', status: 'live', statusText: 'Live on App Store & Google Play',
    one: 'Learn Korean through K-pop lyrics', stack: ['Expo', 'React Native', 'Supabase', 'RevenueCat', 'AdMob'],
    points: ['Tap any word for its meaning, pronunciation and grammar; quizzes and study streaks', 'Google sign-in, subscriptions (RevenueCat) and ads (AdMob)', 'Landing pages in English, Japanese, Spanish, Portuguese and Chinese', 'Built a separate lyric-video tool with Python and Remotion'],
    links: [['App Store', 'https://apps.apple.com/us/app/beonyeok-learn-korean-kpop/id6762500645'], ['Google Play', 'https://play.google.com/store/apps/details?id=com.bangusuk.beonyeok'], ['Website', 'https://bangusukdev.com/beonyeok']] },
  { id: 'badmorning', name: 'Bad Morning', cat: 'mobile', start: '2026-06', status: 'live', statusText: 'Live on Google Play · iOS in progress',
    one: 'An alarm you can only stop by solving a puzzle', stack: ['Expo', 'React Native', 'iOS AlarmKit', 'Android alarms'],
    points: ['Android alarms verified on real devices; iOS built on AlarmKit', '22 wake-up missions, in Korean and English', 'Closed the loophole where the lock-screen stop button skipped the mission'],
    links: [['Google Play', 'https://play.google.com/store/apps/details?id=com.bangusukdev.badmorning'], ['Website', 'https://bangusukdev.com/bad-morning']] },
  { id: 'nodt', name: 'Nodt', cat: 'desktop', start: '2026-09', status: 'live', statusText: 'Free on Windows',
    one: 'A minimal notes app where each thought opens into the next', stack: ['Tauri 2', 'React', 'TypeScript', 'Tiptap'],
    points: ['Notes nest endlessly and are saved as Markdown files', 'v0.1 in three days and 19 commits', 'Wired up Lemon Squeezy checkout, then switched to a free release'],
    links: [['Website', 'https://bangusukdev.com/nodt']] },
  { id: 'fsr', name: 'FastScreenRecorder', cat: 'desktop', start: '2026-10', status: 'wip', statusText: 'v1.0.0 built · release coming soon',
    one: 'A tiny bar that starts recording the moment you press it', stack: ['C#', '.NET', 'FFmpeg'],
    points: ['60 fps hardware encoding on NVIDIA, Intel and AMD GPUs', 'Global F9 hotkey to start and stop from anywhere', 'Paused segments are joined losslessly into one MP4'],
    links: [['Website', 'https://bangusukdev.com/fastscreenrecorder']] },
  { id: 'pitchview', name: 'PitchView', cat: 'desktop', start: '2026-10', status: 'live', statusText: 'Free on Windows',
    one: 'Shows the spectrum and note names of whatever your PC is playing, live', stack: ['Python', 'PyInstaller'],
    points: ['Listens to speaker output directly, or to a microphone', 'Shows detected notes on a piano keyboard'],
    links: [['Website', 'https://bangusukdev.com/pitchview']] },
  { id: 'site', name: 'bangusukdev.com', cat: 'web', start: '2026-05', status: 'live', statusText: 'Live',
    one: 'The hub for my apps’ landing and policy pages', stack: ['Next.js', 'Tailwind', 'GA4', 'Lemon Squeezy'],
    points: ['Landing pages for five apps, Beonyeok in five languages', 'Payments and analytics wired in, with a sitemap for search'],
    links: [['Visit', 'https://bangusukdev.com']] },
  { id: 'wichu', name: 'Wichu', cat: 'mobile', start: '2026-09', status: 'wip', statusText: 'In progress',
    one: 'A widget app for long-distance couples to share what they’re doing right now', stack: ['Expo', 'Supabase', 'RevenueCat'],
    points: ['23 statuses, color-coded into 7 categories', 'All writes go through RPCs, so clients can’t edit tables directly', 'Android home-screen widget and push notifications'] },
  { id: 'cube', name: 'CubeBlindfolded', cat: 'mobile', start: '2026-09', status: 'wip', statusText: 'In progress',
    one: 'A practice app for blindfolded Rubik’s Cube solving', stack: ['Expo', 'three.js'],
    points: ['M2 and Orozco methods with Speffz lettering', '52 commits in one week'] },
  { id: 'knocku', name: 'Knocku', cat: 'mobile', start: '2026-04', status: 'proto', statusText: 'Prototype', one: 'Send your partner a quick “knock” message', stack: ['Expo'] },
  { id: 'kids', name: 'LearningAppForKid', cat: 'mobile', start: '2026-03', status: 'proto', statusText: 'Prototype', one: 'A learning app with separate kid and parent views', stack: ['Expo', 'Supabase'] },
  { id: 'workout', name: 'Workout Timer', cat: 'mobile', start: '2026-03', status: 'proto', statusText: 'Prototype', one: 'A workout timer app', stack: ['Expo'] },
  { id: 'heattrend', name: 'HeatTrend', cat: 'web', start: '2026-03', status: 'proto', statusText: 'Prototype', one: 'YouTube trending videos as a treemap', stack: ['Next.js', 'Prisma', 'Vercel'] },
  { id: 'theory', name: 'Music Theory Fundamentals', cat: 'web', start: '2026-10', status: 'proto', statusText: 'Prototype', one: 'Music theory basics as interactive web lessons', stack: ['React', 'Vite'] },
  { id: 'cosmic', name: 'Cosmic Syntax', cat: 'web', start: '2024-12', status: 'proto', statusText: 'First portfolio', one: 'My first portfolio, built with three.js', stack: ['React Three Fiber', 'three.js'] },
  { id: 'chart', name: 'Chart Pattern Bot', cat: 'lab', start: '2026-03', status: 'lab', statusText: 'Lab', one: 'Detects order blocks, fair value gaps and trendlines, with backtests', stack: ['Python'] },
  { id: 'oxroot', name: '0xRoot', cat: 'lab', start: '2026-04', status: 'lab', statusText: 'Lab', one: 'An L-system tree generator with CRT, pixel and paper render styles', stack: ['JavaScript', 'Canvas'] },
];

for (const p of PROJECTS) if (CASES[p.id]) p.case = CASES[p.id];

export const BYID: Record<string, Project> = Object.fromEntries(PROJECTS.map(p => [p.id, p]));
export const byStart = (a: Project, b: Project) => (a.start < b.start ? -1 : a.start > b.start ? 1 : a.id < b.id ? -1 : 1);
export const newest = (a: Project, b: Project) => byStart(b, a);
export const CHRONO = [...PROJECTS].sort(byStart);
export const ORDER: Record<string, number> = Object.fromEntries(CHRONO.map((p, i) => [p.id, i]));
// Catalog number in the order projects were started, like a star catalog.
export const CATNO: Record<string, string> = Object.fromEntries(CHRONO.map((p, i) => [p.id, 'JY-' + String(i + 1).padStart(2, '0')]));

export const FIRST_YEAR = '2026';
export const SINCE = PROJECTS.filter(p => p.start >= `${FIRST_YEAR}-01`);
export const SHIPPED = PROJECTS.filter(p => p.status === 'live');
export const MONTHS = ['2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'];
export const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const ym = (s: string) => `${MON[+s.slice(5) - 1]} ${s.slice(0, 4)}`;
export const TAG: Record<Status, string> = { live: 'Shipped', wip: 'In progress', proto: 'Prototype', lab: 'Lab' };

export const GOLD = '#e3c98c';
export const BLUE = '#a8c6ea';
