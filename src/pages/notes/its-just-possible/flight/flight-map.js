// The figure's moving map: "The last 72 hours, as a flight". The map, cities and the route
// still to fly are printed once per size; each frame adds the route flown so far, the
// waypoints and the plane at minute t. The plane's position is time, not GPS.
import { albers, fitView, greatCircle, drawMap, drawPlane, haloText, labelSpot, COLORS, PLACES, CITIES } from './map.js';
import { WAYPOINTS, SPAN, clock } from './timeline.js';
import { loadCoverFonts } from '../../../../components/art/covers/fonts.js';

export const DW = 900, DH = 600;   // design units, 3:2
const F = '"Sofia Sans Condensed", "Arial Narrow", sans-serif';
const TAU = Math.PI * 2;
const KIND = { chat: COLORS.amber, fleet: COLORS.cyan, board: '#ffffff' };

function routeGeometry(view) {
  const pts = greatCircle(PLACES.sanJose, PLACES.pittsburgh, 240).map(([lon, lat]) => view(lon, lat));
  const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = cum[cum.length - 1];
  // position and heading at a fraction of the way, by distance along the route
  const at = f => {
    const d = Math.max(0, Math.min(1, f)) * total; let i = 1; while (i < cum.length - 1 && cum[i] < d) i++;
    const a = pts[i - 1], b = pts[i], u = (d - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1);
    return { x: a[0] + (b[0] - a[0]) * u, y: a[1] + (b[1] - a[1]) * u, angle: Math.atan2(b[1] - a[1], b[0] - a[0]), i };
  };
  return { pts, at };
}

// small: the figure is narrow (a phone), so fewer and larger labels.
export async function createFlightMap({ canvas, width, height, small = false }) {
  await loadCoverFonts(['sofia-sans-condensed-500-800']);
  const S = width / DW;
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  const view = small ? fitView(albers({ lon0: -100 }), PLACES.sanJose, PLACES.pittsburgh, 70, 820, 300) : fitView(albers({ lon0: -100 }), PLACES.sanJose, PLACES.pittsburgh, 92, 800, 280);
  const route = routeGeometry(view);
  const k = small ? 2.1 : 1, kf = small ? 1.75 : 1;   // label and mark scale on phones

  const base = document.createElement('canvas'); base.width = width; base.height = height;
  const b = base.getContext('2d'); b.setTransform(S, 0, 0, S, 0, 0);
  drawMap(b, view, { w: DW, h: DH, lw: 1.1 });
  const cities = small ? CITIES.filter(([n]) => ['Los Angeles', 'Denver', 'Chicago', 'Dallas'].includes(n)) : CITIES;
  for (const [name, lon, lat, side] of cities) {
    const [cx, cy] = view(lon, lat); if (cx < 10 || cx > DW - 10 || cy < 10 || cy > DH - 10) continue;
    if (name === 'Omaha' || name === 'Toronto') continue;   // on the route, or under the destination
    b.fillStyle = COLORS.label; b.strokeStyle = COLORS.halo; b.lineWidth = 1.4; b.beginPath(); b.arc(cx, cy, 2.4 * kf, 0, TAU); b.fill(); b.stroke();
    const size = 13 * k, [lx, ly, align] = labelSpot(side, cx, cy, size);
    haloText(b, name, lx, ly, { font: `600 ${size}px ${F}`, align, width: 3.2 });
  }
  // the route still to fly: a fine dotted line
  const line = (c, pts) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); };
  b.lineCap = 'round'; b.lineJoin = 'round';
  b.strokeStyle = 'rgba(6,18,40,.7)'; b.lineWidth = 4.4; b.setLineDash([.1, 6.5]); line(b, route.pts); b.stroke();
  b.strokeStyle = 'rgba(255,255,255,.95)'; b.lineWidth = 2.4; line(b, route.pts); b.stroke(); b.setLineDash([]);
  // day boundaries along the route
  for (const [label, t] of [['SAT', 1440], ['SUN', 2880]]) {
    const p = route.at(t / SPAN), nx = -Math.sin(p.angle), ny = Math.cos(p.angle);
    b.strokeStyle = 'rgba(6,18,40,.85)'; b.lineWidth = 2.2; b.beginPath(); b.moveTo(p.x - nx * 7, p.y - ny * 7); b.lineTo(p.x + nx * 7, p.y + ny * 7); b.stroke();
    b.strokeStyle = '#ffffff'; b.lineWidth = 1; b.stroke();
    haloText(b, `${label} 00:00`, p.x + nx * 20, p.y + ny * 20 + 4, { font: `700 ${11 * k}px ${F}`, align: 'center', width: 3, color: '#dfe8f6' });
  }
  // origin and destination
  const o = route.at(0), d = route.at(1);
  for (const p of [o, d]) { b.fillStyle = COLORS.halo; b.beginPath(); b.arc(p.x, p.y, 7.5, 0, TAU); b.fill(); b.fillStyle = COLORS.label; b.beginPath(); b.arc(p.x, p.y, 5, 0, TAU); b.fill(); b.fillStyle = COLORS.seaDeep; b.beginPath(); b.arc(p.x, p.y, 2, 0, TAU); b.fill(); }
  haloText(b, 'San Jose', o.x, o.y + 24 * kf, { font: `700 ${15 * k}px ${F}`, align: 'center', width: 3.6 });
  // the destination flag
  // the destination flag hangs below Pittsburgh, clear of the route and the time flags above it
  const fw = 150 * kf, fh = 50 * kf, fx = Math.min(DW - fw - 14, d.x - fw * .35), fy = d.y + 46;
  b.strokeStyle = COLORS.label; b.lineWidth = 1.3; b.beginPath(); b.moveTo(d.x, d.y + 8); b.lineTo(d.x, fy); b.stroke();
  b.fillStyle = 'rgba(5,14,32,.88)'; b.beginPath(); b.roundRect(fx, fy, fw, fh, 3); b.fill();
  b.strokeStyle = 'rgba(255,182,61,.85)'; b.lineWidth = 1.1; b.stroke();
  b.textAlign = 'left'; b.fillStyle = COLORS.amber; b.font = `700 ${10 * kf}px ${F}`; b.fillText('DESTINATION · DEADLINE', fx + 10, fy + 17 * kf);
  b.fillStyle = COLORS.label; b.font = `800 ${21 * kf}px ${F}`; b.fillText('Pittsburgh', fx + 10, fy + 40 * kf);

  const marks = WAYPOINTS.map(w => ({ ...w, p: route.at(w.t / SPAN) }));
  const diamond = (x, y, r) => { ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath(); };

  return {
    draw(t, current) {
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(base, 0, 0);
      ctx.setTransform(S, 0, 0, S, 0, 0); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const plane = route.at(t / SPAN);
      const flown = route.pts.slice(0, plane.i).concat([[plane.x, plane.y]]);
      if (flown.length > 1) {
        ctx.strokeStyle = 'rgba(6,18,40,.8)'; ctx.lineWidth = 8; line(ctx, flown); ctx.stroke();
        ctx.save(); ctx.shadowColor = 'rgba(255,160,30,.95)'; ctx.shadowBlur = 12 * S; ctx.strokeStyle = COLORS.amber; ctx.lineWidth = 4.6; line(ctx, flown); ctx.stroke(); ctx.restore();
        ctx.strokeStyle = COLORS.amberHot; ctx.lineWidth = 1.5; line(ctx, flown); ctx.stroke();
      }
      marks.forEach((m, i) => {
        const passed = m.t <= t, r = (i === current ? 6.4 : 4.3) * kf;
        diamond(m.p.x, m.p.y, r + 1.8); ctx.fillStyle = 'rgba(6,18,40,.9)'; ctx.fill();
        diamond(m.p.x, m.p.y, r);
        if (passed) { ctx.fillStyle = KIND[m.kind]; ctx.fill(); } else { ctx.strokeStyle = 'rgba(235,242,255,.9)'; ctx.lineWidth = 1.4; ctx.stroke(); }
      });
      if (current >= 0) {
        const m = marks[current], c = clock(m.t), txt = `${c.day.toUpperCase()} ${c.time}`;
        ctx.strokeStyle = KIND[m.kind]; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(m.p.x, m.p.y, 13 * kf, 0, TAU); ctx.stroke();
        ctx.font = `700 ${12.5 * k}px ${F}`; const tw = ctx.measureText(txt).width + 14 * k, th = 21 * k;
        const fx2 = Math.max(6, Math.min(DW - tw - 6, m.p.x - tw / 2)), fy2 = m.p.y - 22 * k - th;   // the flag sits above, on the north side
        ctx.fillStyle = 'rgba(5,14,32,.9)'; ctx.beginPath(); ctx.roundRect(fx2, fy2, tw, th, 3); ctx.fill();
        ctx.strokeStyle = KIND[m.kind]; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.fillText(txt, fx2 + tw / 2, fy2 + th / 2 + 4.3 * k);
      }
      drawPlane(ctx, plane.x, plane.y, plane.angle, 30 * kf);
    },
  };
}
