import { APPS, BYID, CATNO, SHIPPED, SINCE } from './projects';
import { ARTIST, TRACKS } from './tracks';

// The mission log: the featured work, in the order it is told, each flown to on the map.
// `focus` is what the camera frames (a project id or a constellation key); `side` is where the card sits.
// To change what is featured, edit this list; the rest of the work is summed up after it automatically.

export interface Mission {
  id: string;
  focus: string;
  side: 'l' | 'r';
  meta: string;
  title: string;
  one: string;
  status: string;
  tiles: [value: string, label: string][];
  asOf?: string;
  block: { title: string; body: string };
  /** An optional second story, e.g. a product decision next to the technical one. */
  block2?: { title: string; body: string };
  shots?: { kind: 'phone' | 'poster' | 'wide'; project: string; files: string[] };
  tracks?: string[];
  stack?: string[];
  links: [label: string, url: string][];
  caseId?: string;
}

const beonyeok = BYID.beonyeok;

export const MISSIONS: Mission[] = [
  {
    id: 'beonyeok', focus: 'beonyeok', side: 'r',
    meta: `${CATNO.beonyeok} · Mobile · Mar 2026 – now`,
    title: 'Beonyeok', one: 'Learn Korean through K-pop lyrics.', status: 'Live on the App Store and Google Play',
    tiles: beonyeok.metrics!.items.map(([v, l]) => [v, l]),
    asOf: `As of ${beonyeok.metrics!.asOf} · Japanese 39%, English 36%, Traditional Chinese 20%`,
    block: { title: 'Hardest problem', body: 'Cloud traffic reached 8.31 GB against a 5 GB free tier, for a 50 MB database. I traced it to album covers downloading again every hour and fixed it with long cache headers, thumbnails, disk caching and a song list cut from 3.4 MB to about 90 KB.' },
    block2: { title: 'Product lesson', body: "Song requests let each user ask for one song at a time, and another once it was added. Ratings fell anyway, over slow requests. It was loss aversion, which I had studied in nudge design: every pending request read as the songs they could have asked for if I had been faster. Limiting each user to a single request ended the complaints." },
    shots: { kind: 'phone', project: 'beonyeok', files: ['1.webp', '2.webp', '3.webp'] },
    stack: beonyeok.stack,
    links: beonyeok.links!.filter(([l]) => l !== 'Website'),
    caseId: 'beonyeok',
  },
  {
    id: 'badmorning', focus: 'badmorning', side: 'l',
    meta: `${CATNO.badmorning} · Mobile · Jun 2026 – now`,
    title: 'Bad Morning', one: 'An alarm that keeps ringing until you finish a wake-up mission.', status: 'Live on Google Play · iOS built',
    tiles: [['22', 'wake-up missions'], ['2', 'platforms, one codebase'], ['2', 'languages']],
    block: { title: 'Hardest problem', body: 'iOS always puts a Stop button on the lock screen, so a sleepy user could skip the mission entirely. I closed it in three layers: Stop opens the app, a second ring follows 15 seconds later unless the mission is done, and a rolling 5-second ring brings the alarm back if the app is force-quit.' },
    shots: { kind: 'poster', project: 'badmorning', files: ['1.webp', '2.webp', '3.webp'] },
    stack: ['Expo', 'React Native', 'iOS AlarmKit', 'Android exact alarms'],
    links: BYID.badmorning.links!.filter(([l]) => l !== 'Website'),
    caseId: 'badmorning',
  },
  {
    id: 'nodt', focus: 'nodt', side: 'r',
    meta: `${CATNO.nodt} · Desktop · Sep 2026`,
    title: 'Nodt', one: 'A notes app where each thought opens into the next.', status: 'Free on Windows',
    tiles: [['3', 'days to version 0.1'], ['19', 'commits'], ['6', 'color themes']],
    block: { title: 'Hardest problem', body: "Every note has exactly one parent, and the order of links in the parent's text sets the order of its children. Dragging a panel has to move the link in the parent, and deleting a link removes the branch beneath it, with the editor, the panels and the Markdown files on disk kept in step." },
    shots: { kind: 'wide', project: 'nodt', files: ['1.webp'] },
    stack: BYID.nodt.stack,
    links: BYID.nodt.links!,
    caseId: 'nodt',
  },
  {
    id: 'aonova', focus: 'music', side: 'l',
    meta: 'AO · Music · about 5 years',
    title: ARTIST.name, one: 'Electronic music I write and release on SoundCloud.', status: '28 tracks on SoundCloud',
    tiles: [['~5', 'years producing'], ['28', 'tracks released'], ['1.3K', 'plays on Comet']],
    block: { title: 'About', body: 'I produce in FL Studio. Most of my releases are future riddim, with melodic dubstep and house along the way, and I can write in whatever genre a project needs. The ambience playing behind this page is mine too.' },
    tracks: ['comingback', 'cantsleep', 'exit82', 'comet'],
    links: [['Listen on SoundCloud', ARTIST.url]],
  },
];

// "The rest of the map": a few named projects, then a count of everything else.
export const REST_IDS = ['fsr', 'pitchview', 'site', 'wichu', 'cube'];
const featuredApps = MISSIONS.filter(m => BYID[m.focus] && !BYID[m.focus].track).length;
export const REST_MORE = APPS.length - featuredApps - REST_IDS.length;

export const LOG_FACTS: [value: string, label: string][] = [
  [String(SINCE.length), 'projects started in 2026'],
  [String(SHIPPED.length), 'shipped or live'],
  [beonyeok.metrics!.items[0][0], 'users on my biggest app'],
];

export const TRACK_BY_ID = Object.fromEntries(TRACKS.map(t => [t.id, t]));
