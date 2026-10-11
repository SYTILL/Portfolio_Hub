import type { Project } from './projects';

// Music released as aonova on SoundCloud: a few chosen tracks, shown as the Music constellation.
// Release month, genre and length come from each track's SoundCloud page.
const SC = 'https://soundcloud.com/aonova/';
const track = (id: string, slug: string, name: string, start: string, genre: string, length: string): Project => ({
  id, name, cat: 'music', start, status: 'live', statusText: 'Released on SoundCloud',
  one: `${genre} · ${length}`, stack: [genre],
  links: [['SoundCloud', SC + slug]],
  track: { url: SC + slug, genre, length },
});

export const TRACKS: Project[] = [
  track('comet', 'comet', 'Comet', '2024-08', 'Melodic Dubstep', '2:24'),
  track('guidinglight', 'guiding-light', 'Guiding Light', '2024-12', 'House', '2:47'),
  track('scattered', 'scatteredpieceofyourmemory', 'scattered piece of your memory', '2025-10', 'Future Riddim', '3:49'),
  track('exit82', 'exit-82', 'exit 82', '2025-11', 'Future Riddim', '3:57'),
  track('cantsleep', 'cant-sleep-without-you', 'cant sleep without you', '2026-05', 'Future Riddim', '3:43'),
  track('comingback', 'coming-back-to-you', 'coming back to you', '2026-06', 'Future Riddim', '4:03'),
];

export const ARTIST = { name: 'aonova', url: 'https://soundcloud.com/aonova' };
