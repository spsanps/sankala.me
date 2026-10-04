// It's just possible — an airline seatback moving map, lit like an LCD.
// The route runs from San Jose to Pittsburgh with the plane partway; the title stands where
// the map would name the destination, and the data panel reads the two leaderboard results.
import { DW, DH, TAU } from './kit.js';
import { albers, fitView, greatCircle, drawMap, drawPlane, haloText, COLORS, PLACES, CITIES } from '../../../pages/notes/its-just-possible/flight/map.js';

const F = '"Sofia Sans Condensed", "Arial Narrow", sans-serif';
const MAP_TOP = 30, MAP_BOTTOM = 404, PLANE_AT = .64;

function screen(L) {
  const x = L.bctx;
  const view = fitView(albers(), PLACES.sanJose, PLACES.pittsburgh, 62, 352, 262);
  // the map, clipped to its window on the screen
  x.save(); x.beginPath(); x.rect(0, MAP_TOP, DW, MAP_BOTTOM - MAP_TOP); x.clip();
  x.translate(0, 0); drawMap(x, view, { w: DW, h: DH, lw: .9 });
  // cities
  for (const [name, lon, lat] of CITIES) {
    const [cx, cy] = view(lon, lat); if (name === 'Omaha' || cy < MAP_TOP + 8 || cy > MAP_BOTTOM - 6 || cx < 6 || cx > DW - 6) continue;
    x.fillStyle = COLORS.label; x.strokeStyle = COLORS.halo; x.lineWidth = 1.2; x.beginPath(); x.arc(cx, cy, 1.9, 0, TAU); x.fill(); x.stroke();
    const right = cx < DW - 70;
    haloText(x, name, cx + (right ? 5 : -5), cy + 3.2, { font: `600 9.5px ${F}`, align: right ? 'left' : 'right', width: 2.6 });
  }
  // the route: flown in glowing amber, still to fly in a fine dotted line
  const route = greatCircle(PLACES.sanJose, PLACES.pittsburgh, 160).map(([lon, lat]) => view(lon, lat));
  const k = Math.round(PLANE_AT * (route.length - 1)), flown = route.slice(0, k + 1), ahead = route.slice(k);
  const line = pts => { x.beginPath(); pts.forEach(([px, py], i) => i ? x.lineTo(px, py) : x.moveTo(px, py)); };
  x.lineCap = 'round'; x.lineJoin = 'round';
  x.strokeStyle = 'rgba(6,18,40,.75)'; x.lineWidth = 6.4; line(flown); x.stroke();
  x.save(); x.shadowColor = 'rgba(255,160,30,.95)'; x.shadowBlur = 9; x.strokeStyle = COLORS.amber; x.lineWidth = 3.4; line(flown); x.stroke(); x.restore();
  x.strokeStyle = COLORS.amberHot; x.lineWidth = 1.1; line(flown); x.stroke();
  x.strokeStyle = 'rgba(6,18,40,.7)'; x.lineWidth = 3.6; x.setLineDash([.1, 5]); line(ahead); x.stroke();
  x.strokeStyle = '#ffffff'; x.lineWidth = 2; x.setLineDash([.1, 5]); line(ahead); x.stroke(); x.setLineDash([]);
  // origin and destination
  const [ox, oy] = route[0], [dx, dy] = route[route.length - 1];
  for (const [px, py] of [[ox, oy], [dx, dy]]) { x.fillStyle = COLORS.halo; x.beginPath(); x.arc(px, py, 5.2, 0, TAU); x.fill(); x.fillStyle = COLORS.label; x.beginPath(); x.arc(px, py, 3.4, 0, TAU); x.fill(); x.fillStyle = COLORS.seaDeep; x.beginPath(); x.arc(px, py, 1.4, 0, TAU); x.fill(); }
  haloText(x, 'San Jose', ox + 1, oy + 17, { font: `700 12px ${F}`, align: 'center', width: 3 });
  // the destination label: a pin from Pittsburgh up to the title
  const lx = 206, ly = 92, lw = 178, lh = 112;
  x.strokeStyle = COLORS.label; x.lineWidth = 1.1; x.beginPath(); x.moveTo(dx, dy - 5); x.lineTo(dx, ly + lh); x.stroke();
  x.save(); x.shadowColor = 'rgba(0,0,0,.45)'; x.shadowBlur = 10; x.fillStyle = 'rgba(5,14,32,.86)'; x.beginPath(); x.roundRect(lx, ly, lw, lh, 3); x.fill(); x.restore();
  x.strokeStyle = 'rgba(255,182,61,.85)'; x.lineWidth = 1; x.beginPath(); x.roundRect(lx + .5, ly + .5, lw - 1, lh - 1, 3); x.stroke();
  x.fillStyle = COLORS.amber; x.font = `700 9.5px ${F}`; x.textAlign = 'left'; x.letterSpacing = '1.6px'; x.fillText('DESTINATION', lx + 12, ly + 21); x.letterSpacing = '0px';
  x.save(); x.shadowColor = 'rgba(255,255,255,.35)'; x.shadowBlur = 6; x.fillStyle = COLORS.label; x.font = `800 41px ${F}`;
  x.fillText('It’s just', lx + 11, ly + 60); x.fillText('possible', lx + 11, ly + 98); x.restore();
  // the plane, partway
  const [px, py] = route[k], [qx, qy] = route[Math.min(route.length - 1, k + 2)];
  drawPlane(x, px, py, Math.atan2(qy - py, qx - px), 25);
  x.restore();
}

function chrome(L) {
  const x = L.bctx;
  // status strip
  x.fillStyle = '#040a16'; x.fillRect(0, 0, DW, MAP_TOP);
  x.fillStyle = COLORS.cyan; x.font = `600 10.5px ${F}`; x.letterSpacing = '1.2px'; x.textAlign = 'left'; x.fillText('SAN JOSE  —  PITTSBURGH', 16, 19.5);
  x.textAlign = 'right'; x.fillStyle = 'rgba(200,216,240,.7)'; x.fillText('NEURIPS 2026 · REALPDE', DW - 16, 19.5); x.letterSpacing = '0px';
  x.fillStyle = 'rgba(127,220,255,.35)'; x.fillRect(0, MAP_TOP - 1, DW, 1);
  // the data panel
  const g = x.createLinearGradient(0, MAP_BOTTOM, 0, DH); g.addColorStop(0, '#0b1830'); g.addColorStop(1, '#050b18');
  x.fillStyle = g; x.fillRect(0, MAP_BOTTOM, DW, DH - MAP_BOTTOM);
  x.fillStyle = 'rgba(127,220,255,.45)'; x.fillRect(0, MAP_BOTTOM, DW, 1);
  x.fillStyle = 'rgba(127,220,255,.14)'; x.fillRect(DW / 2, MAP_BOTTOM + 22, 1, 112);
  const cell = (cx, label) => {
    x.textAlign = 'left'; x.fillStyle = COLORS.cyan; x.font = `700 12px ${F}`; x.letterSpacing = '2px'; x.fillText(label, cx, MAP_BOTTOM + 42); x.letterSpacing = '0px';
    x.save(); x.shadowColor = 'rgba(255,170,40,.75)'; x.shadowBlur = 12; x.fillStyle = COLORS.amber; x.font = `800 74px ${F}`; x.fillText('#1', cx - 3, MAP_BOTTOM + 116); x.restore();
    x.fillStyle = 'rgba(200,216,240,.62)'; x.font = `600 10.5px ${F}`; x.fillText('LEADERBOARD RANK', cx, MAP_BOTTOM + 136);
  };
  cell(28, 'TRACK 1'); cell(DW / 2 + 26, 'TRACK 2');
  x.fillStyle = 'rgba(127,220,255,.14)'; x.fillRect(20, DH - 46, DW - 40, 1);
  x.font = `600 11px ${F}`; x.letterSpacing = '1.4px'; x.fillStyle = 'rgba(220,230,246,.82)'; x.textAlign = 'left'; x.fillText('SAN KALA', 28, DH - 22);
  x.textAlign = 'right'; x.fillStyle = 'rgba(200,216,240,.6)'; x.fillText('DEVELOPMENT PHASE', DW - 28, DH - 22); x.letterSpacing = '0px';
}

// LCD: faint scanlines, a vignette and a sheen of glass over the whole screen.
function glass(L) {
  const o = L.octx;
  o.fillStyle = 'rgba(0,0,0,.11)'; for (let y = 0; y < DH; y += 2.2) o.fillRect(0, y, DW, .7);
  const v = o.createRadialGradient(DW / 2, DH * .42, DH * .25, DW / 2, DH * .48, DH * .78); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.42)');
  o.fillStyle = v; o.fillRect(0, 0, DW, DH);
  const s = o.createLinearGradient(0, 0, DW * .9, DH * .6); s.addColorStop(0, 'rgba(255,255,255,.07)'); s.addColorStop(.45, 'rgba(255,255,255,.015)'); s.addColorStop(.46, 'rgba(255,255,255,0)');
  o.fillStyle = s; o.fillRect(0, 0, DW, DH);
  o.strokeStyle = 'rgba(0,0,0,.85)'; o.lineWidth = 6; o.strokeRect(0, 0, DW, DH);
}

export default {
  seed: 7, still: 0, fonts: ['sofia-sans-condensed-500-800'],
  build(L) { screen(L); chrome(L); glass(L); },
};
