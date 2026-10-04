// The seatback moving map for "It's just possible": an Albers conic view of North America in
// the in-flight map's colours (deep navy sea, flat sand land, thin graticule), a glowing
// great-circle route and a small plane. Shared by the cover and the essay's figure.
import { LAND, LAKES, BORDERS, STATES } from './geo.js';

const RAD = Math.PI / 180;
export const COLORS = {
  sea: '#0a2142', seaDeep: '#06142a', shelf: '#123563', land: '#d6c49a', landShade: '#c9b68a', coast: '#8f7b55',
  state: 'rgba(120,98,62,.42)', border: 'rgba(96,74,40,.85)', lake: '#0f2d58', grid: 'rgba(120,190,255,.16)', gridLand: 'rgba(60,70,90,.13)',
  amber: '#ffb63d', amberHot: '#ffe2a0', cyan: '#7fdcff', label: '#f4f6fb', halo: 'rgba(4,12,28,.85)', remain: 'rgba(235,242,255,.78)',
};
export const PLACES = {
  sanJose: [-121.89, 37.34], pittsburgh: [-79.996, 40.44],
};
export const CITIES = [
  ['Seattle', -122.33, 47.61], ['Los Angeles', -118.24, 34.05], ['Las Vegas', -115.14, 36.17], ['Salt Lake City', -111.89, 40.76],
  ['Denver', -104.99, 39.74], ['Dallas', -96.80, 32.78], ['Omaha', -95.93, 41.26], ['Chicago', -87.63, 41.88],
  ['Toronto', -79.38, 43.65], ['New York', -74.01, 40.71], ['Atlanta', -84.39, 33.75], ['Minneapolis', -93.27, 44.98],
];

// Albers equal-area conic, standard parallels 29.5° and 45.5° (the usual United States map).
export function albers({ lon0 = -98, lat0 = 37.5, p1 = 29.5, p2 = 45.5 } = {}) {
  const n = (Math.sin(p1 * RAD) + Math.sin(p2 * RAD)) / 2, C = Math.cos(p1 * RAD) ** 2 + 2 * n * Math.sin(p1 * RAD);
  const rho0 = Math.sqrt(C - 2 * n * Math.sin(lat0 * RAD)) / n;
  return (lon, lat) => { const rho = Math.sqrt(C - 2 * n * Math.sin(lat * RAD)) / n, th = n * (lon - lon0) * RAD; return [rho * Math.sin(th), rho0 - rho * Math.cos(th)]; };
}
// A view: a projection scaled and placed in canvas units. fit = [lonA, latA, lonB, latB, xA, xB, yMid]
export function makeView(project, { scale, cx, cy, ox = 0, oy = 0 }) {
  const [x0, y0] = project(ox, oy);
  return (lon, lat) => { const [x, y] = project(lon, lat); return [cx + (x - x0) * scale, cy - (y - y0) * scale]; };
}
export function fitView(project, a, b, xA, xB, y) {
  const pa = project(...a), pb = project(...b), scale = (xB - xA) / (pb[0] - pa[0]);
  const mid = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2];
  return (lon, lat) => { const [x, yy] = project(lon, lat); return [(xA + xB) / 2 + (x - mid[0]) * scale, y - (yy - mid[1]) * scale]; };
}

// Points along the great circle from a to b ([lon, lat]), as [lon, lat].
export function greatCircle(a, b, n = 120) {
  const v = ([lon, lat]) => [Math.cos(lat * RAD) * Math.cos(lon * RAD), Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD)];
  const A = v(a), B = v(b), d = Math.acos(A[0] * B[0] + A[1] * B[1] + A[2] * B[2]), out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, s1 = Math.sin((1 - t) * d) / Math.sin(d), s2 = Math.sin(t * d) / Math.sin(d);
    const x = s1 * A[0] + s2 * B[0], y = s1 * A[1] + s2 * B[1], z = s1 * A[2] + s2 * B[2];
    out.push([Math.atan2(y, x) / RAD, Math.atan2(z, Math.hypot(x, y)) / RAD]);
  }
  return out;
}

const decode = flat => { const out = []; let x = flat[0], y = flat[1]; out.push([x / 100, y / 100]); for (let i = 2; i < flat.length; i += 2) { x += flat[i]; y += flat[i + 1]; out.push([x / 100, y / 100]); } return out; };
const geo = { land: LAND.map(decode), lakes: LAKES.map(decode), borders: BORDERS.map(decode), states: STATES.map(decode) };
function trace(ctx, view, pts, close) { pts.forEach(([lon, lat], i) => { const [x, y] = view(lon, lat); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }); if (close) ctx.closePath(); }

// The map itself, in canvas units: sea, the lighter shelf along the coasts, land, lakes,
// state and country lines, and the graticule. lw scales the hairlines.
export function drawMap(ctx, view, { w, h, lw = 1 }) {
  const sea = ctx.createRadialGradient(w * .45, h * .42, 0, w * .45, h * .42, Math.hypot(w, h) * .62);
  sea.addColorStop(0, COLORS.sea); sea.addColorStop(1, COLORS.seaDeep);
  ctx.fillStyle = sea; ctx.fillRect(0, 0, w, h);
  // continental shelf: a soft lighter band hugging every coast
  ctx.save(); ctx.strokeStyle = COLORS.shelf; ctx.lineJoin = 'round';
  for (const [width, alpha] of [[16, .18], [9, .28], [4, .4]]) { ctx.globalAlpha = alpha; ctx.lineWidth = width * lw; ctx.beginPath(); for (const r of geo.land) trace(ctx, view, r, true); ctx.stroke(); }
  ctx.restore();
  ctx.fillStyle = COLORS.land; ctx.beginPath(); for (const r of geo.land) trace(ctx, view, r, true); ctx.fill('evenodd');
  ctx.fillStyle = COLORS.lake; ctx.beginPath(); for (const r of geo.lakes) trace(ctx, view, r, true); ctx.fill();
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.strokeStyle = COLORS.state; ctx.lineWidth = .5 * lw; ctx.beginPath(); for (const l of geo.states) trace(ctx, view, l); ctx.stroke();
  ctx.strokeStyle = COLORS.border; ctx.lineWidth = .8 * lw; ctx.setLineDash([2.2 * lw, 1.6 * lw]); ctx.beginPath(); for (const l of geo.borders) trace(ctx, view, l); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = COLORS.coast; ctx.lineWidth = .55 * lw; ctx.beginPath(); for (const r of geo.land) trace(ctx, view, r, true); for (const r of geo.lakes) trace(ctx, view, r, true); ctx.stroke();
  // graticule every 5°
  ctx.strokeStyle = COLORS.grid; ctx.lineWidth = .6 * lw; ctx.beginPath();
  for (let lon = -170; lon <= -40; lon += 5) { const pts = []; for (let lat = 5; lat <= 75; lat += 1) pts.push([lon, lat]); trace(ctx, view, pts); }
  for (let lat = 10; lat <= 70; lat += 5) { const pts = []; for (let lon = -170; lon <= -40; lon += 1) pts.push([lon, lat]); trace(ctx, view, pts); }
  ctx.stroke();
}

// A small airliner seen from above, nose along +x, about `size` long.
export function drawPlane(ctx, x, y, angle, size, { fill = '#ffffff', glow = 'rgba(255,255,255,.55)' } = {}) {
  const s = size / 20;
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.scale(s, s);
  const shape = () => {
    ctx.beginPath();
    ctx.moveTo(10, 0); ctx.bezierCurveTo(10, -1.1, 8.6, -1.5, 7, -1.5);
    ctx.lineTo(2.2, -1.5); ctx.lineTo(-2.4, -9.6); ctx.lineTo(-4.1, -9.6); ctx.lineTo(-1.9, -1.5);
    ctx.lineTo(-6.6, -1.4); ctx.lineTo(-8.4, -4.4); ctx.lineTo(-9.6, -4.4); ctx.lineTo(-8.7, -.9); ctx.lineTo(-9.4, 0);
    ctx.lineTo(-8.7, .9); ctx.lineTo(-9.6, 4.4); ctx.lineTo(-8.4, 4.4); ctx.lineTo(-6.6, 1.4);
    ctx.lineTo(-1.9, 1.5); ctx.lineTo(-4.1, 9.6); ctx.lineTo(-2.4, 9.6); ctx.lineTo(2.2, 1.5);
    ctx.lineTo(7, 1.5); ctx.bezierCurveTo(8.6, 1.5, 10, 1.1, 10, 0); ctx.closePath();
  };
  ctx.shadowColor = glow; ctx.shadowBlur = 6; shape(); ctx.fillStyle = fill; ctx.fill();
  ctx.shadowBlur = 0; ctx.lineWidth = .7; ctx.strokeStyle = 'rgba(6,16,36,.9)'; ctx.stroke();
  ctx.restore();
}

// Label text with the map's dark halo.
export function haloText(ctx, text, x, y, { font, color = COLORS.label, halo = COLORS.halo, width = 3, align = 'left' }) {
  ctx.font = font; ctx.textAlign = align; ctx.lineJoin = 'round';
  ctx.strokeStyle = halo; ctx.lineWidth = width; ctx.strokeText(text, x, y);
  ctx.fillStyle = color; ctx.fillText(text, x, y);
}
