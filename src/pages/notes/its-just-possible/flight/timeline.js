// The final 72 hours of the RealPDE development phase, for the figure "The last 72 hours, as
// a flight". Times are UTC, as minutes from Friday 25 September 00:00; the phase closed at
// midnight on Sunday, so the flight lands at minute 4320. Quotes follow the essay's wording.
export const START = Date.UTC(2026, 8, 25, 0, 0);
export const SPAN = 72 * 60;
const at = (day, h, m) => (day - 25) * 1440 + h * 60 + m;

// Our best leaderboard entries and ranks as reported at the time; null where we don't know.
export const TRACK1 = [
  { t: at(25, 0, 17), score: '81.679', rank: null },
  { t: at(26, 0, 48), score: '81.895', rank: 'Top 10' },
  { t: at(27, 14, 0), score: '81.895', rank: '#9' },
  { t: at(27, 17, 50), score: '82.218', rank: '#1' },
];
export const TRACK2 = [
  { t: at(25, 20, 4), score: '81.993', rank: '~#7' },
  { t: at(26, 22, 50), score: '82.194', rank: '#2' },
  { t: at(27, 14, 0), score: '82.194', rank: '#5' },
  { t: at(27, 18, 10), score: '82.491', rank: '#1' },
];
export const GPUS = [
  { t: 0, n: '~4' }, { t: at(26, 3, 5), n: '13' }, { t: at(26, 23, 29), n: '15' }, { t: at(27, 12, 10), n: '17' },
];

// The waypoints: my messages, the agent's, and what changed. kind: 'chat' | 'fleet' | 'board'
export const WAYPOINTS = [
  { t: at(25, 17, 28), kind: 'chat', lines: [['Agent', 'No lever left… 82.3 is not reachable.']] },
  { t: at(25, 20, 6), kind: 'chat', lines: [['Me', 'there is always ways to improve… if you think can’t then you can’t']] },
  { t: at(25, 22, 28), kind: 'chat', lines: [['Agent', 'None of them is a robust #1.'], ['Me', 'stooppp!!!']] },
  { t: at(26, 3, 5), kind: 'fleet', lines: [['Fleet', 'I add 9 GPUs: 13 online']] },
  { t: at(26, 22, 47), kind: 'chat', lines: [['Agent', 'local optimum'], ['Me', 'Believe we can.']] },
  { t: at(27, 4, 11), kind: 'chat', lines: [['Me', 'Ok I am gonna leave you to it']] },
  { t: at(27, 12, 10), kind: 'fleet', lines: [['Fleet', 'The last four-hour push: 17 GPUs']] },
  { t: at(27, 14, 0), kind: 'board', lines: [['Leaderboard', '9th on Track 1, 5th on Track 2']] },
  { t: at(27, 14, 39), kind: 'chat', lines: [['Me', 'why freeze early when we can continue pushing?']] },
  { t: at(27, 17, 50), kind: 'board', lines: [['Leaderboard', 'Track 1: first, 82.218']] },
  { t: at(27, 18, 10), kind: 'board', lines: [['Leaderboard', 'Track 2: first, 82.491']] },
];
// The figure opens on the moment both tracks were first.
export const OPENING = at(27, 18, 10);

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const pad = n => String(n).padStart(2, '0');
export function clock(t) {
  const d = new Date(START + Math.round(t) * 60000);
  return { day: DAYS[d.getUTCDay()], date: `${d.getUTCDate()} Sep`, time: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}` };
}
export const stamp = t => { const c = clock(t); return `${c.day} ${c.time}`; };
export function toGo(t) { const left = Math.max(0, SPAN - Math.round(t)); return `${Math.floor(left / 60)} h ${pad(left % 60)} min`; }
const latest = (list, t) => { let v = null; for (const e of list) if (e.t <= t) v = e; return v; };

// Everything the screen shows at minute t.
export function stateAt(t) {
  let wp = -1; WAYPOINTS.forEach((w, i) => { if (w.t <= t) wp = i; });
  return { t, clock: clock(t), toGo: toGo(t), track1: latest(TRACK1, t), track2: latest(TRACK2, t), gpus: latest(GPUS, t)?.n ?? '~4', waypoint: wp };
}

// The whole weekend as plain lines of text, for the figure's text version and the Markdown mirror.
const rankWords = rank => rank === '~#7' ? 'about 7th' : rank === 'Top 10' ? 'top 10' : rank;
export function eventLog() {
  const said = w => w.kind === 'chat' ? w.lines.map(([who, text]) => `${who}: “${text}”`).join(' ') : `${w.lines[0][1]}.`;
  const lone = list => list.filter(e => !WAYPOINTS.some(w => w.t === e.t));
  return [
    ...WAYPOINTS.map(w => ({ t: w.t, text: said(w) })),
    ...lone(TRACK1).map(e => ({ t: e.t, text: `Track 1 upload: ${e.score}${e.rank ? ` (${rankWords(e.rank)})` : ''}.` })),
    ...lone(TRACK2).map(e => ({ t: e.t, text: `Track 2 upload: ${e.score}${e.rank ? ` (${rankWords(e.rank)})` : ''}.` })),
    ...lone(GPUS.slice(1)).map(e => ({ t: e.t, text: `${e.n} GPUs online.` })),
  ].sort((a, b) => a.t - b.t).map(e => ({ ...e, when: stamp(e.t) })).concat([{ t: SPAN, when: 'Mon 00:00', text: 'The development phase closes.' }]);
}
