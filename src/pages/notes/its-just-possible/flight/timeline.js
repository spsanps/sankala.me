// The final weekend of the RealPDE development phase, for the figure "The final weekend, as a
// flight": from Saturday 26 September 07:00 UTC to Sunday 18:10 UTC, when both tracks were
// first. Times are minutes from the start; the plane lands at Pittsburgh at the end. The
// figure covers only these hours. Quotes follow the essay's wording.
export const START = Date.UTC(2026, 8, 26, 7, 0);
const DEADLINE = Date.UTC(2026, 8, 28, 0, 0);
const at = (day, h, m) => (Date.UTC(2026, 8, day, h, m) - START) / 60000;
export const SPAN = at(27, 18, 10);

// Our best leaderboard entries and ranks as reported at the time.
export const TRACK1 = [
  { t: 0, score: '81.895', rank: 'Top 10' },
  { t: at(27, 14, 0), score: '81.895', rank: '#9' },
  { t: at(27, 17, 50), score: '82.218', rank: '#1' },
];
export const TRACK2 = [
  { t: 0, score: '81.993', rank: '~#7' },
  { t: at(26, 22, 50), score: '82.194', rank: '#2' },
  { t: at(27, 14, 0), score: '82.194', rank: '#5' },
  { t: at(27, 18, 10), score: '82.491', rank: '#1' },
];
export const GPUS = [{ t: 0, n: '13' }, { t: at(26, 23, 29), n: '15' }, { t: at(27, 12, 10), n: '17' }];

// The waypoints: my messages, the agent's, and what changed. kind: 'chat' | 'fleet' | 'board'
export const WAYPOINTS = [
  { t: at(26, 22, 47), kind: 'chat', lines: [['Agent', 'local optimum'], ['Me', 'Believe we can.']] },
  { t: at(26, 22, 50), kind: 'board', lines: [['Leaderboard', 'Track 2: 82.194, second']] },
  { t: at(27, 4, 11), kind: 'chat', lines: [['Me', 'Ok I am gonna leave you to it']] },
  { t: at(27, 12, 10), kind: 'fleet', lines: [['Fleet', 'The last four-hour push: 17 GPUs']] },
  { t: at(27, 14, 0), kind: 'board', lines: [['Leaderboard', '9th on Track 1, 5th on Track 2']] },
  { t: at(27, 14, 39), kind: 'chat', lines: [['Me', 'why freeze early when we can continue pushing?']] },
  { t: at(27, 17, 50), kind: 'board', lines: [['Leaderboard', 'Track 1: first, 82.218']] },
  { t: at(27, 18, 10), kind: 'board', lines: [['Leaderboard', 'Track 2: first, 82.491']] },
];
// The figure opens on the moment both tracks were first.
export const OPENING = SPAN;
// The day boundary inside the weekend, for the route and the scrubber.
export const SUNDAY = at(27, 0, 0);

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const pad = n => String(n).padStart(2, '0');
export function clock(t) {
  const d = new Date(START + Math.round(t) * 60000);
  return { day: DAYS[d.getUTCDay()], date: `${d.getUTCDate()} Sep`, time: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}` };
}
export const stamp = t => { const c = clock(t); return `${c.day} ${c.time}`; };
export function toGo(t) { const left = Math.max(0, Math.round((DEADLINE - START) / 60000 - t)); return `${Math.floor(left / 60)} h ${pad(left % 60)} min`; }
const latest = (list, t) => { let v = list[0]; for (const e of list) if (e.t <= t) v = e; return v; };

// Everything the screen shows at minute t.
export function stateAt(t) {
  let wp = -1; WAYPOINTS.forEach((w, i) => { if (w.t <= t) wp = i; });
  return { t, clock: clock(t), toGo: toGo(t), track1: latest(TRACK1, t), track2: latest(TRACK2, t), gpus: latest(GPUS, t).n, waypoint: wp };
}

// The weekend as plain lines of text, for the figure's text version and the Markdown mirror.
const rankWords = rank => rank === '~#7' ? 'about 7th' : rank === 'Top 10' ? 'top 10' : rank;
export function eventLog() {
  const said = w => w.kind === 'chat' ? w.lines.map(([who, text]) => `${who}: “${text}”`).join(' ') : `${w.lines[0][1]}.`;
  const lone = list => list.filter(e => e.t > 0 && !WAYPOINTS.some(w => w.t === e.t));
  return [
    { t: 0, text: `Where we start: Track 1 ${TRACK1[0].score} (${rankWords(TRACK1[0].rank)}), Track 2 ${TRACK2[0].score} (${rankWords(TRACK2[0].rank)}), ${GPUS[0].n} GPUs online.` },
    ...WAYPOINTS.map(w => ({ t: w.t, text: said(w) })),
    ...lone(TRACK1).map(e => ({ t: e.t, text: `Track 1: ${e.score} (${rankWords(e.rank)}).` })),
    ...lone(TRACK2).map(e => ({ t: e.t, text: `Track 2: ${e.score} (${rankWords(e.rank)}).` })),
    ...lone(GPUS).map(e => ({ t: e.t, text: `${e.n} GPUs online.` })),
  ].sort((a, b) => a.t - b.t).map(e => ({ ...e, when: stamp(e.t) }));
}
