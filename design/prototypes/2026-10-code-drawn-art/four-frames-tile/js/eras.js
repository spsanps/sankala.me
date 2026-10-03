/* The homepage's places and milestones, newest first: every milestone in history.json exactly
   once, in San's own wording (copied from src/pages/home/eras.js for this standalone page). */
import milestones from './history-data.js';

const byId = Object.fromEntries(milestones.map(m => [m.id, m]));

/* the real photographs, local to this prototype */
export const PHOTOS = {
  'neurips-award': 'photos/neurips-award.jpg',
  'ebay-headquarters': 'photos/ebay-headquarters.jpg',
  'ucsd-library': 'photos/ucsd-library.jpg',
  'research-group': 'photos/research-group.jpg',
  'uist-award': 'photos/uist-award.jpg',
  'ebay-intern': 'photos/ebay-intern.webp',
  'ti-bengaluru': 'photos/ti-bengaluru.jpg',
  'nitk-lab': 'photos/nitk-lab.jpg',
};
const LOCAL = {
  '/images/awards/uist-2023-presentation.jpg': PHOTOS['neurips-award'],
  '/images/history/ebay-headquarters.webp': PHOTOS['ebay-headquarters'],
  '/images/history/research-group.webp': PHOTOS['research-group'],
  '/images/history/uist-award.webp': PHOTOS['uist-award'],
  '/images/history/ebay-intern.webp': PHOTOS['ebay-intern'],
  '/images/history/ucsd-library.webp': PHOTOS['ucsd-library'],
  '/images/locations/ti-bangalore.jpg': PHOTOS['ti-bengaluru'],
  '/images/history/nitk-lab.webp': PHOTOS['nitk-lab'],
};
export const localImage = src => LOCAL[src] || src;

export const ERA_LIST = [
  { key: 'now', place: 'San Jose', years: '2024 – now', role: 'AI research at eBay', ids: ['eai-challenge', 'ebay-research'],
    alt: 'San’s desk in San Jose, painted in cobalt on glazed tiles: a window onto the valley and Mt Hamilton with the Lick Observatory domes, a laptop, a small paper robot and a telescope on the desk, books on the shelf, and two photographs on the pinboard.' },
  { key: 'sd', place: 'San Diego', years: '2022 – 2024', role: 'MS in computer science, UC San Diego', ids: ['ucsd-graduation', 'zinify', 'startr', 'ebay-internship', 'ebay-ml-challenge', 'ucsd-start'],
    alt: 'The same tiled desk in San Diego on a clear morning: the Geisel Library and eucalyptus through the window, papers, a zine and a laptop on the desk, four photographs on the pinboard.' },
  { key: 'blr', place: 'Bengaluru', years: '2019 – 2022', role: 'Chip design at Texas Instruments', ids: ['texas-instruments'],
    alt: 'The same tiled desk in Bengaluru, late afternoon before the rain: rooftops, coconut palms and a flame tree through the window, a monitor showing a chip layout, a loupe and a packaged chip, one photograph on the pinboard.' },
  { key: 'nitk', place: 'Surathkal', years: '2015 – 2019', role: 'Electrical engineering at NIT Karnataka', ids: ['nitk'],
    alt: 'The same tiled desk in Surathkal after dark: palms, the sea and the lighthouse through the window, an oscilloscope showing a square wave, a breadboard and a star chart, and the photograph from the NITK lab.' },
].map(era => ({ ...era, milestones: era.ids.map(id => byId[id]) }));

if (ERA_LIST.reduce((n, e) => n + e.milestones.length, 0) !== milestones.length || ERA_LIST.some(e => e.milestones.some(m => !m))) {
  throw new Error('Every milestone in history.json must appear exactly once.');
}
export const monthYear = m => `${m.month} ${m.year}`;
