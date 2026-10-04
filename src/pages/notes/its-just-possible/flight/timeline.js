// The final push of RealPDE, for the figure "The final push, as a flight": a sequence of
// moments in order, not a clock. The plane starts at San Jose and each stop sits evenly along
// the route, so the last one lands at Pittsburgh. Each stop carries what the panel reads there
// and its messages. Quotes follow the essay's wording.
const T1 = { start: { score: '81.895', rank: 'Top 10' }, ninth: { score: '81.895', rank: '#9' }, first: { score: '82.218', rank: '#1' } };
const T2 = { start: { score: '81.993', rank: '~#7' }, second: { score: '82.194', rank: '#2' }, fifth: { score: '82.194', rank: '#5' }, first: { score: '82.491', rank: '#1' } };

// kind: 'chat' | 'fleet' | 'board'. `note` adds a change the panel shows without its own stop.
export const START = { track1: T1.start, track2: T2.start, gpus: '13' };
export const STOPS = [
  { kind: 'chat', lines: [['Agent', 'local optimum'], ['Me', 'Believe we can.']], track1: T1.start, track2: T2.start, gpus: '13' },
  { kind: 'board', lines: [['Leaderboard', 'Track 2: 82.194, second']], track1: T1.start, track2: T2.second, gpus: '13' },
  { kind: 'chat', lines: [['Me', 'Ok I am gonna leave you to it']], track1: T1.start, track2: T2.second, gpus: '15', note: '15 GPUs online' },
  { kind: 'fleet', lines: [['Fleet', 'The last push: 17 GPUs']], track1: T1.start, track2: T2.second, gpus: '17' },
  { kind: 'board', lines: [['Leaderboard', '9th on Track 1, 5th on Track 2']], track1: T1.ninth, track2: T2.fifth, gpus: '17' },
  { kind: 'chat', lines: [['Me', 'why freeze early when we can continue pushing?']], track1: T1.ninth, track2: T2.fifth, gpus: '17' },
  { kind: 'board', lines: [['Leaderboard', 'Track 1: first, 82.218']], track1: T1.first, track2: T2.fifth, gpus: '17' },
  { kind: 'board', lines: [['Leaderboard', 'Track 2: first, 82.491']], track1: T1.first, track2: T2.first, gpus: '17' },
];
export const COUNT = STOPS.length;
// The figure opens on the last stop: both tracks first.
export const OPENING = COUNT;
// Where stop i (0 = the start) sits along the route.
export const fraction = i => Math.max(0, Math.min(1, i / COUNT));
// What the screen shows at stop i (0 = the start, before the first stop).
export const stateAt = i => (i > 0 ? STOPS[i - 1] : START);

// The push as plain lines of text, for the figure's text version and the Markdown mirror.
const rankWords = rank => rank === '~#7' ? 'about 7th' : rank === 'Top 10' ? 'top 10' : rank;
export function stopLog() {
  const said = s => (s.kind === 'chat' ? s.lines.map(([who, text]) => `${who}: “${text}”`).join(' ') : `${s.lines[0][1]}.`) + (s.note ? ` (${s.note}.)` : '');
  return [`Where we start: Track 1 ${START.track1.score} (${rankWords(START.track1.rank)}), Track 2 ${START.track2.score} (${rankWords(START.track2.rank)}), ${START.gpus} GPUs online.`, ...STOPS.map(said)];
}
