import milestones from '../../data/history.json';

// The homepage tells the history place by place, newest first. Every milestone in
// history.json appears exactly once, in San's own wording, under the place it belongs to.
const byId = Object.fromEntries(milestones.map(m => [m.id, m]));

export const ERA_LIST = [
  {
    key: 'now', place: 'San Jose', years: '2024 – now', role: 'AI research at eBay',
    ids: ['realpde', 'tartan-imu', 'eai-challenge', 'ebay-research'],
  },
  {
    key: 'sd', place: 'San Diego', years: '2022 – 2024', role: 'MS in computer science, UC San Diego',
    ids: ['ucsd-graduation', 'zinify', 'startr', 'ebay-internship', 'ebay-ml-challenge', 'ucsd-start'],
  },
  {
    key: 'blr', place: 'Bengaluru', years: '2019 – 2022', role: 'Chip design at Texas Instruments',
    ids: ['texas-instruments'],
  },
  {
    key: 'nitk', place: 'Surathkal', years: '2015 – 2019', role: 'Electrical engineering at NIT Karnataka',
    ids: ['nitk'],
  },
].map(era => ({ ...era, milestones: era.ids.map(id => byId[id]) }));

if (ERA_LIST.reduce((n, e) => n + e.milestones.length, 0) !== milestones.length || ERA_LIST.some(e => e.milestones.some(m => !m))) {
  throw new Error('Every milestone in history.json must appear on the homepage exactly once.');
}

export const monthYear = m => `${m.month} ${m.year}`;
