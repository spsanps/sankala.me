// It's just possible — an airline seatback moving map, lit like an LCD.
// The route runs from San Jose to Pittsburgh with the plane partway; the title stands where
// the map would name the destination, and the data panel reads the two leaderboard results.
// Living detail: the plane inches along, the dots ahead march toward Pittsburgh, and the
// panel's readouts flicker now and then like a refreshing screen.
import { DW, DH, TAU } from './kit.js';
import { albers, fitView, greatCircle, drawMap, drawPlane, haloText, labelSpot, COLORS, PLACES, CITIES } from '../../../pages/notes/its-just-possible/flight/map.js';

const F = '"Sofia Sans Condensed", "Arial Narrow", sans-serif';
const MAP_TOP = 30, MAP_BOTTOM = 408;
const P0 = .585, P1 = .655, PERIOD = 36;           // the plane inches from P0 to P1, then starts again
const view = fitView(albers({ lon0: -100 }), PLACES.sanJose, PLACES.pittsburgh, 46, 338, 276);
const ROUTE = greatCircle(PLACES.sanJose, PLACES.pittsburgh, 200).map(([lon, lat]) => view(lon, lat));
const CUM = ROUTE.reduce((acc, p, i) => { acc.push(i ? acc[i - 1] + Math.hypot(p[0] - ROUTE[i - 1][0], p[1] - ROUTE[i - 1][1]) : 0); return acc; }, []);
function along(f) {   // the route up to fraction f, and the point and heading there
  const d = f * CUM[CUM.length - 1]; let i = 1; while (i < CUM.length - 1 && CUM[i] < d) i++;
  const a = ROUTE[i - 1], b = ROUTE[i], u = (d - CUM[i - 1]) / ((CUM[i] - CUM[i - 1]) || 1), p = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  return { pts: ROUTE.slice(0, i).concat([p]), rest: [p].concat(ROUTE.slice(i)), p, angle: Math.atan2(b[1] - a[1], b[0] - a[0]) };
}
const line = (x, pts) => { x.beginPath(); pts.forEach(([px, py], i) => i ? x.lineTo(px, py) : x.moveTo(px, py)); };
function flownStroke(x, pts, alpha = 1) {
  x.save(); x.globalAlpha = alpha; x.lineCap = 'round'; x.lineJoin = 'round';
  x.strokeStyle = 'rgba(6,18,40,.8)'; x.lineWidth = 8; line(x, pts); x.stroke();
  x.shadowColor = 'rgba(255,160,30,.95)'; x.shadowBlur = 14; x.strokeStyle = COLORS.amber; x.lineWidth = 4.6; line(x, pts); x.stroke();
  x.shadowBlur = 0; x.strokeStyle = COLORS.amberHot; x.lineWidth = 1.5; line(x, pts); x.stroke();
  x.restore();
}
// the two rank readouts, drawn live so they can flicker
const CELLS = [28, DW / 2 + 26];
function ranks(x, t) {
  CELLS.forEach((cx, i) => {
    const phase = (t + i * 2.2) % 4.4, dip = phase < .14 ? .62 : phase < .22 ? .85 : 1;
    x.save(); x.globalAlpha = dip; x.shadowColor = 'rgba(255,170,40,.8)'; x.shadowBlur = 16 + 3 * Math.sin(t * 1.3 + i);
    x.fillStyle = COLORS.amber; x.font = `800 70px ${F}`; x.textAlign = 'left'; x.fillText('#1', cx - 3, MAP_BOTTOM + 112); x.restore();
  });
}

function screen(L) {
  const x = L.bctx;
  x.save(); x.beginPath(); x.rect(0, MAP_TOP, DW, MAP_BOTTOM - MAP_TOP); x.clip();
  drawMap(x, view, { w: DW, h: DH, lw: .9 });
  for (const [name, lon, lat, side] of CITIES) {
    const [cx, cy] = view(lon, lat); if (['Omaha', 'Toronto', 'Minneapolis', 'New York'].includes(name) || cy < MAP_TOP + 10 || cy > MAP_BOTTOM - 8 || cx < 8 || cx > DW - 8) continue;
    x.fillStyle = COLORS.label; x.strokeStyle = COLORS.halo; x.lineWidth = 1.2; x.beginPath(); x.arc(cx, cy, 1.9, 0, TAU); x.fill(); x.stroke();
    const [lx, ly, align] = labelSpot(side, cx, cy, 9.5);
    haloText(x, name, lx, ly, { font: `600 9.5px ${F}`, align, width: 2.6 });
  }
  flownStroke(x, along(P0).pts);
  // origin and destination
  const [ox, oy] = ROUTE[0], [dx, dy] = ROUTE[ROUTE.length - 1];
  for (const [px, py] of [[ox, oy], [dx, dy]]) { x.fillStyle = COLORS.halo; x.beginPath(); x.arc(px, py, 5.6, 0, TAU); x.fill(); x.fillStyle = COLORS.label; x.beginPath(); x.arc(px, py, 3.7, 0, TAU); x.fill(); x.fillStyle = COLORS.seaDeep; x.beginPath(); x.arc(px, py, 1.5, 0, TAU); x.fill(); }
  haloText(x, 'San Jose', ox + 2, oy + 18, { font: `700 12.5px ${F}`, align: 'center', width: 3 });
  // the destination label: a pin from Pittsburgh up to the title
  const lx = 194, ly = 82, lw = 190, lh = 122;
  x.strokeStyle = COLORS.label; x.lineWidth = 1.2; x.beginPath(); x.moveTo(dx, dy - 6); x.lineTo(dx, ly + lh); x.stroke();
  x.save(); x.shadowColor = 'rgba(0,0,0,.5)'; x.shadowBlur = 12; x.fillStyle = 'rgba(5,14,32,.9)'; x.beginPath(); x.roundRect(lx, ly, lw, lh, 3); x.fill(); x.restore();
  x.strokeStyle = 'rgba(255,182,61,.9)'; x.lineWidth = 1.2; x.beginPath(); x.roundRect(lx + .6, ly + .6, lw - 1.2, lh - 1.2, 3); x.stroke();
  x.fillStyle = COLORS.amber; x.font = `700 10px ${F}`; x.textAlign = 'left'; x.letterSpacing = '1.8px'; x.fillText('DESTINATION', lx + 13, ly + 22); x.letterSpacing = '0px';
  x.save(); x.shadowColor = 'rgba(255,255,255,.35)'; x.shadowBlur = 6; x.fillStyle = COLORS.label; x.font = `800 45px ${F}`;
  x.fillText('It’s just', lx + 12, ly + 66); x.fillText('possible', lx + 12, ly + 107); x.restore();
  x.restore();
}

function chrome(L) {
  const x = L.bctx;
  x.fillStyle = '#040a16'; x.fillRect(0, 0, DW, MAP_TOP);
  x.fillStyle = COLORS.cyan; x.font = `600 10.5px ${F}`; x.letterSpacing = '1.2px'; x.textAlign = 'left'; x.fillText('SAN JOSE  —  PITTSBURGH', 16, 19.5);
  x.textAlign = 'right'; x.fillStyle = 'rgba(200,216,240,.7)'; x.fillText('NEURIPS 2026 · REALPDE', DW - 16, 19.5); x.letterSpacing = '0px';
  x.fillStyle = 'rgba(127,220,255,.35)'; x.fillRect(0, MAP_TOP - 1, DW, 1);
  const g = x.createLinearGradient(0, MAP_BOTTOM, 0, DH); g.addColorStop(0, '#0b1830'); g.addColorStop(1, '#050b18');
  x.fillStyle = g; x.fillRect(0, MAP_BOTTOM, DW, DH - MAP_BOTTOM);
  x.fillStyle = 'rgba(127,220,255,.45)'; x.fillRect(0, MAP_BOTTOM, DW, 1);
  x.fillStyle = 'rgba(127,220,255,.14)'; x.fillRect(DW / 2, MAP_BOTTOM + 22, 1, 108);
  for (const [i, cx] of CELLS.entries()) {
    x.textAlign = 'left'; x.fillStyle = COLORS.cyan; x.font = `700 12px ${F}`; x.letterSpacing = '2px'; x.fillText(`TRACK ${i + 1}`, cx, MAP_BOTTOM + 40); x.letterSpacing = '0px';
    x.fillStyle = 'rgba(200,216,240,.62)'; x.font = `600 10.5px ${F}`; x.letterSpacing = '.8px'; x.fillText('LEADERBOARD RANK', cx, MAP_BOTTOM + 132); x.letterSpacing = '0px';
  }
  x.fillStyle = 'rgba(127,220,255,.14)'; x.fillRect(20, DH - 46, DW - 40, 1);
  x.font = `600 11px ${F}`; x.letterSpacing = '1.4px'; x.fillStyle = 'rgba(220,230,246,.82)'; x.textAlign = 'left'; x.fillText('SAN KALA', 28, DH - 22);
  x.textAlign = 'right'; x.fillStyle = 'rgba(200,216,240,.6)'; x.fillText('DEVELOPMENT PHASE', DW - 28, DH - 22); x.letterSpacing = '0px';
}

// LCD: faint scanlines, a vignette and a sheen of glass over the whole screen.
function glass(L) {
  const o = L.octx;
  o.fillStyle = 'rgba(0,0,0,.1)'; for (let y = 0; y < DH; y += 2.2) o.fillRect(0, y, DW, .7);
  const v = o.createRadialGradient(DW / 2, DH * .42, DH * .25, DW / 2, DH * .48, DH * .78); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.4)');
  o.fillStyle = v; o.fillRect(0, 0, DW, DH);
  const s = o.createLinearGradient(0, 0, DW * .9, DH * .6); s.addColorStop(0, 'rgba(255,255,255,.07)'); s.addColorStop(.45, 'rgba(255,255,255,.015)'); s.addColorStop(.46, 'rgba(255,255,255,0)');
  o.fillStyle = s; o.fillRect(0, 0, DW, DH);
  o.strokeStyle = 'rgba(0,0,0,.85)'; o.lineWidth = 6; o.strokeRect(0, 0, DW, DH);
}

// The live box: the route from the base's flown end to Pittsburgh (with room for the plane and
// glow), down through the two rank readouts.
const xs = ROUTE.filter((_, i) => CUM[i] >= (P0 - .03) * CUM[CUM.length - 1]);
const BOX_Y0 = Math.min(...xs.map(p => p[1])) - 26;
const BOX = [14, BOX_Y0, DW - 28, MAP_BOTTOM + 122 - BOX_Y0];

export default {
  seed: 7, still: 21.6, fonts: ['sofia-sans-condensed-500-800'],
  build(L) { screen(L); chrome(L); glass(L); },
  live: {
    box: BOX, fps: 20,
    draw(ctx, t) {
      const c = t % PERIOD, f = P0 + (P1 - P0) * (c / PERIOD), fade = Math.max(0, Math.min(1, c / .9, (PERIOD - c) / .9));
      const here = along(f);
      ctx.save(); ctx.beginPath(); ctx.rect(0, MAP_TOP, DW, MAP_BOTTOM - MAP_TOP); ctx.clip();
      const ext = along(f).pts.filter((_, i, arr) => i === arr.length - 1 || CUM[i] >= P0 * CUM[CUM.length - 1] - 1);
      if (ext.length > 1) flownStroke(ctx, [along(P0).p, ...ext], fade);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash([.1, 5.2]); ctx.lineDashOffset = -(t * 5.2) % 10.4;
      ctx.strokeStyle = 'rgba(6,18,40,.7)'; ctx.lineWidth = 3.8; line(ctx, here.rest); ctx.stroke();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.2; line(ctx, here.rest); ctx.stroke(); ctx.setLineDash([]);
      const [dx, dy] = ROUTE[ROUTE.length - 1];   // the destination dot stays on top of the dots
      ctx.fillStyle = COLORS.halo; ctx.beginPath(); ctx.arc(dx, dy, 5.6, 0, TAU); ctx.fill(); ctx.fillStyle = COLORS.label; ctx.beginPath(); ctx.arc(dx, dy, 3.7, 0, TAU); ctx.fill(); ctx.fillStyle = COLORS.seaDeep; ctx.beginPath(); ctx.arc(dx, dy, 1.5, 0, TAU); ctx.fill();
      ctx.globalAlpha = fade; drawPlane(ctx, here.p[0], here.p[1], here.angle, 27); ctx.globalAlpha = 1;
      ctx.restore();
      ranks(ctx, t);
    },
  },
};
