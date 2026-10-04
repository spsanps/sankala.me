/* San Jose's light, in a handful of designed moments.
   The apse keeps San Jose time, but the conch is drawn for one of ten moments (the sun low on the
   left, high, low on the right, dusk, night with or without the moon in one of three phases), not
   for the exact minute. Each moment has a pre-rendered still, so the first paint already shows the
   right conch, and the live mosaic lays exactly the same picture. The caption on the cornice still
   gives the real time.

   `sanJoseMoment` is self-contained (no imports, no outer names) because its source is also inlined
   into the homepage's HTML, where it runs before the first paint and picks the still. */
export function sanJoseMoment(hourParam) {
  var D = Math.PI / 180, now = new Date();
  // ?hour=0–24: today at that hour in San Jose
  if (hourParam != null && hourParam !== '' && !isNaN(+hourParam)) {
    var f = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23' });
    var o = {}; f.formatToParts(now).forEach(function (p) { o[p.type] = p.value; });
    var off = Math.round((Date.UTC(+o.year, +o.month - 1, +o.day, +o.hour, +o.minute, +o.second) - now.getTime()) / 60000);
    var hh = Math.floor(+hourParam), mm = Math.round((+hourParam - hh) * 60);
    now = new Date(Date.UTC(+o.year, +o.month - 1, +o.day, hh, mm) - off * 60000);
  }
  var jd = now.getTime() / 864e5 + 2440587.5, n = jd - 2451545, lat = 37.3382 * D, lon = -121.8863;
  function horiz(ra, dec) {
    var lst = ((280.46061837 + 360.98564736629 * n) % 360 + lon) * D, H = lst - ra;
    var el = Math.asin(Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(H));
    var az = Math.atan2(-Math.sin(H), Math.tan(dec) * Math.cos(lat) - Math.sin(lat) * Math.cos(H));
    return [el / D, ((az / D) + 360) % 360];
  }
  var g = ((357.528 + 0.9856003 * n) % 360) * D, L = (280.46 + 0.9856474 * n) % 360;
  var lam = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * D, eps = (23.439 - 4e-7 * n) * D;
  var sun = horiz(Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam)), Math.asin(Math.sin(eps) * Math.sin(lam)));
  var e = sun[0], az = sun[1];
  if (e >= 9) return az < 155 ? 'morning' : az < 205 ? 'midday' : 'afternoon';
  if (e >= -1) return az < 180 ? 'golden-am' : 'golden-pm';
  if (e >= -8) return 'twilight';
  var ml = (218.316 + 13.176396 * n) * D, mM = (134.963 + 13.064993 * n) * D, mF = (93.272 + 13.22935 * n) * D;
  var mlon = ml + 6.289 * D * Math.sin(mM), mlat = 5.128 * D * Math.sin(mF), e2 = 23.439 * D;
  var moon = horiz(Math.atan2(Math.sin(mlon) * Math.cos(e2) - Math.tan(mlat) * Math.sin(e2), Math.cos(mlon)), Math.asin(Math.sin(mlat) * Math.cos(e2) + Math.cos(mlat) * Math.sin(e2) * Math.sin(mlon)));
  var ph = (((jd - 2451550.1) / 29.530588853) % 1 + 1) % 1;
  if (moon[0] <= 0 || ph < .1 || ph > .9) return 'night';
  return ph < .375 ? 'night-wax' : ph < .625 ? 'night-full' : 'night-wane';
}

/* What each moment looks like: the sun's elevation (which sets the palette and the lamp), where
   the sun or moon stands (its azimuth, which sets its place on the arc), and the moon's phase. */
export const MOMENTS = {
  'golden-am': { e: 2.5, az: 108, label: 'early morning' },
  morning: { e: 28, az: 132, label: 'morning' },
  midday: { e: 48, az: 180, label: 'midday' },
  afternoon: { e: 28, az: 232, label: 'afternoon' },
  'golden-pm': { e: 2.5, az: 252, label: 'the golden hour' },
  twilight: { e: -5, az: 270, label: 'dusk' },
  night: { e: -30, az: 0, label: 'night' },
  'night-wax': { e: -30, az: 0, moon: { az: 222, phase: .25 }, label: 'night, the moon waxing' },
  'night-full': { e: -30, az: 0, moon: { az: 168, phase: .5 }, label: 'night, the moon full' },
  'night-wane': { e: -30, az: 0, moon: { az: 132, phase: .75 }, label: 'night, the moon waning' },
};
export const MOMENT_KEYS = Object.keys(MOMENTS);
export const DEFAULT_MOMENT = 'afternoon';
export const isMoment = key => Object.prototype.hasOwnProperty.call(MOMENTS, key);

/** The inline script for the homepage's HTML: picks the moment before the first paint and writes
    it on <html data-sj="…">, which selects the conch still in CSS. */
export function momentScript() {
  return `try{var q=new URLSearchParams(location.search).get('hour');document.documentElement.setAttribute('data-sj',(${String(sanJoseMoment)})(q))}catch(e){}`;
}

/** The time on the cornice: San Jose's real clock, e.g. "3:05 pm". */
export function clockLabel(date = new Date()) {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit' }).format(date).toLowerCase().replace(/\s/g, ' ');
}
/** "today at `hour` in San Jose" for the ?hour= review hook, else now */
export function sanJoseDate(hour) {
  const now = new Date();
  if (hour == null || Number.isNaN(hour)) return now;
  const f = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23' });
  const o = {}; for (const p of f.formatToParts(now)) o[p.type] = p.value;
  const off = Math.round((Date.UTC(+o.year, +o.month - 1, +o.day, +o.hour, +o.minute, +o.second) - now.getTime()) / 60000);
  const hh = Math.floor(hour), mm = Math.round((hour - hh) * 60);
  return new Date(Date.UTC(+o.year, +o.month - 1, +o.day, hh, mm) - off * 60000);
}
