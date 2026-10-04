/* The apse in mosaic: laying the architecture of a sheet and each place's conch, and colouring
   every stone. Pure (no DOM): it runs in the live layer's worker, on the main thread as a fallback,
   and in the stills script, and gives the same stones everywhere, so a still and the live mosaic
   line up. Both layers are generators that yield every few milliseconds of work, so callers can
   slice them (see runSliced). */
import { mix, clamp, fbm, mulberry32, hash2 } from './core.js';
import { RI, conchPath, sceneAnchors } from './geom.js';
import { laySteps, corners } from './lay.js';
import { ARCH_PAL, MAT, archRegions, ARCH_OUTLINES, archPreStones, finishArch } from './arch.js';
import { deskLiveKind } from './desk.js';
import { FAMILIES, SHEET_STONE, sheetOf, qOf } from './layout.js';
import sanjose from './places/sanjose.js';
import sandiego from './places/sandiego.js';
import bengaluru from './places/bengaluru.js';
import surathkal from './places/surathkal.js';

export const PLACES = [sanjose, sandiego, bengaluru, surathkal];
export { MAT, ARCH_PAL };
const FLAT_GROUPS = new Set(['sky', 'view', 'sun', 'cloud', 'city', 'robotEye']);
const GOLD_TONES = ['#c9a04a', '#d8b35c', '#b3883a', '#e0bd68', '#a77c32', '#cfa654'].map(h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);

export function shade(col, h, h2, amt = .085) {
  const f = 1 + (h - .5) * amt, tilt = (h2 - .5) * 7;
  return [clamp(col[0] * f + tilt, 0, 255), clamp(col[1] * f, 0, 255), clamp(col[2] * f - tilt, 0, 255)];
}

/* The wave that re-lays the conch from one place to the next: it runs from the conch's upper right. */
export const WAVE_W = .16, WAVE_J = .05;
export const waveD = F => 2 * RI + (RI + F) * .55;
export const waveAt = (ux, uy, F) => ((RI - ux) + (uy + RI) * .55) / waveD(F);

/** Run a laying generator in slices of `budget` ms, yielding to `pause()` between slices.
    Returns the result, or null when `alive()` turns false. */
export async function runSliced(gen, { budget = 12, pause, alive = () => true }) {
  let res = gen.next(), start = performance.now();
  while (!res.done) {
    if (performance.now() - start > budget) { await pause(); if (!alive()) return null; start = performance.now(); }
    res = gen.next();
  }
  return res.value;
}
/** Run a laying generator to the end at once (the stills script). */
export function runAll(gen) { let res = gen.next(); while (!res.done) res = gen.next(); return res.value; }

/** The wall, archivolt and cornice of a layout class's sheet. */
export function* layArch(sheetKey) {
  const S = sheetOf(sheetKey), q = qOf(S.family), s = SHEET_STONE, su = s / q;
  const panel = { x0: S.x0 - 20, y0: S.y0 - 20 };
  const W = Math.ceil((S.x1 - S.x0 + 40) * q), H = Math.ceil((S.y1 - S.y0 + 40) * q);
  const regs = archRegions(S), idx = n => regs.findIndex(r => r.name === n);
  const pre = archPreStones(S, q, s, panel, idx);
  const res = yield* laySteps(regs, ARCH_OUTLINES, { W, H, q, s, seed: 11, panel, pre });
  for (const t of res.stones) { t.ux = t.x / q + panel.x0; t.uy = t.y / q + panel.y0; }
  finishArch(res.stones, regs, S, su);
  for (const t of res.stones) t.col = shade(t.col, t.h, t.h2, t.mat === MAT.GOLD ? .12 : .07);
  return { kind: 'arch', stones: res.stones, q, panel, S };
}

/** One place's conch for a family (index into PLACES; San Jose takes a moment). */
export function* layPlace(family, index, moment) {
  const F = FAMILIES[family].F, q = qOf(family), S6 = SHEET_STONE;
  const place = PLACES[index], L = place.light(index === 0 ? moment : undefined), A = sceneAnchors(F);
  const regions = place.regions(L, A);
  const panel = { x0: -RI - 10, y0: -RI - 10 };
  const W = Math.ceil((2 * RI + 20) * q), H = Math.ceil((RI + F + 20) * q);
  // eight-pointed gold stars set into a night sky before its rows, like the wall's
  const pre = [], skyIdx = regions.findIndex(r => r.name === 'sky');
  for (const sp of (place.stars ? place.stars(L, A) : [])) {
    const sx = (sp.x - panel.x0) * q, sy = (sp.y - panel.y0) * q, a0 = sp.a ?? 0, col = sp.col;
    const put = (dx, dy, l, w, a) => pre.push({ x: sx + dx, y: sy + dy, a, l, w, reg: skyIdx, extra: { col, mat: MAT.GOLD, preStar: true } });
    put(0, 0, S6 * (sp.size ? .86 : .7), S6 * (sp.size ? .86 : .7), a0);
    if (sp.size >= 1) for (let k = 0; k < 4; k++) { const b = a0 + k * Math.PI / 2; put(Math.cos(b) * S6 * .98, Math.sin(b) * S6 * .98, S6 * .78, S6 * .5, b); }
    if (sp.size === 2) for (let k = 0; k < 4; k++) { const b = a0 + Math.PI / 4 + k * Math.PI / 2; put(Math.cos(b) * S6 * 1.02, Math.sin(b) * S6 * 1.02, S6 * .5, S6 * .4, b); }
  }
  const res = yield* laySteps(regions, place.outlines, { W, H, q, s: S6, seed: 23 + index * 17, panel, clip: conchPath(F), pre });
  const stones = res.stones, live = [], rnd = mulberry32(400 + index);
  // each region's box, for the modelling below
  const rb = regions.map(() => [1e9, 1e9, -1e9, -1e9]);
  for (const t of stones) if (t.reg >= 0) { const b = rb[t.reg], ux = t.x / q + panel.x0, uy = t.y / q + panel.y0; if (ux < b[0]) b[0] = ux; if (uy < b[1]) b[1] = uy; if (ux > b[2]) b[2] = ux; if (uy > b[3]) b[3] = uy; }
  for (const t of stones) {
    t.ux = t.x / q + panel.x0; t.uy = t.y / q + panel.y0;
    t.w8 = clamp(waveAt(t.ux, t.uy, F) + (hash2(t.x * 7 | 0, t.y * 7 | 0, 5) - .5) * 2 * WAVE_J, -WAVE_J, 1 + WAVE_J);
    if (t.k === 0) { t.col = shade(L.outline || ARCH_PAL.outline, t.h, t.h2, .12); t.mat = 0; continue; }
    const r = regions[t.reg];
    if (t.preStar) { t.col = shade(t.col, t.h, t.h2, .1); t.star = true; live.push(t); continue; }
    let col = r.fill(t.ux, t.uy), mat = r.matAt ? r.matAt(t.ux, t.uy) : (r.mat || 0);
    t.star = place.isStar(r, L, t, A);
    if (t.star) { col = rnd() < .2 ? [236, 238, 240] : GOLD_TONES[(t.h2 * 6) | 0]; mat = col[2] > 200 ? MAT.SILVER : MAT.GOLD; }
    else if (mat === MAT.GOLD) { const rowTone = hash2(t.row, index, 9); col = mix(mix(col, GOLD_TONES[(rowTone * 6) | 0], .16), GOLD_TONES[(t.h2 * 6) | 0], .12); }
    /* modelling, as mosaicists do it: a row of light just inside a thing's lit edge (light from the
       upper left), a darker row inside its shaded edge, and a lit top row on things laid in courses */
    if (!r.flat && !FLAT_GROUPS.has(r.group) && t.row >= 0 && t.row <= 1) {
      const b = rb[t.reg], cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2, hw = Math.max(4, (b[2] - b[0]) / 2), hh = Math.max(4, (b[3] - b[1]) / 2);
      const k = t.row === 0 ? 1 : .45;
      if (r.src === 'courses') { if (t.row === 0) col = mix(col, [255, 250, 236], .16); }
      else { const lit = -((t.ux - cx) / hw * .62 + (t.uy - cy) / hh * .78); col = lit > 0 ? mix(col, [255, 250, 236], .17 * k * Math.min(1, lit * 1.6)) : mix(col, [18, 14, 10], .16 * k * Math.min(1, -lit * 1.6)); }
    }
    t.col = shade(col, t.h, t.h2, mat === MAT.GOLD ? .07 : .085); t.mat = mat;
    t.kind = place.liveKind(t, r, L);
    t.liveKind = deskLiveKind(t, r);
    if (t.liveKind === 'code') t.cursor = r.name === 'code' && t.ux < A.sd * -70 && t.uy > A.deskY - 36 * A.sd;
    if (place.edgeOf) t.edge = place.edgeOf(r, t.ux, t.uy, A);
    if (t.kind || t.star || (t.liveKind && (t.liveKind !== 'code' || t.cursor))) live.push(t);
  }
  const sorted = stones.slice().sort((a, b) => a.w8 - b.w8);
  return { kind: 'place', stones: sorted, live, L, A, place, index, moment: index === 0 ? L.key : null, q, panel, F, family };
}

/* ───────── the light's copy of a set of stones (glint.js) ───────── */
export const GLINT_STRIDE = 19;   // 8 corners, centre, tilt (nx, ny), broad tilt (bx, by), colour, material, wave
/** Pack the gold, silver, gem and glass stones for the light: corners and centres in units, and each
    stone's tilt: its own random angle, a patchy drift across the wall (as hands set them) and, in the
    conch, a lean toward the middle because a conch is concave. `glassKeep` thins the glass. */
export function glintPack(stones, q, panel, conch, glassKeep = 1) {
  const q8 = new Float32Array(8), list = [];
  for (const t of stones) {
    if (!t.mat) continue;
    if (t.mat === MAT.GLASS && !t.star && glassKeep < 1 && hash2(t.x * 3 | 0, t.y * 3 | 0, 77) > glassKeep) continue;
    list.push(t);
  }
  const out = new Float32Array(list.length * GLINT_STRIDE);
  let o = 0;
  for (const t of list) {
    corners(t, q8);
    for (let k = 0; k < 8; k += 2) { out[o++] = q8[k] / q + panel.x0; out[o++] = q8[k + 1] / q + panel.y0; }
    out[o++] = t.ux; out[o++] = t.uy;
    const tilt = glintTilt(t.ux, t.uy, t.h, t.h2, conch);
    out[o++] = tilt[0]; out[o++] = tilt[1]; out[o++] = tilt[2]; out[o++] = tilt[3];
    out[o++] = t.col[0] / 255; out[o++] = t.col[1] / 255; out[o++] = t.col[2] / 255;
    out[o++] = t.mat; out[o++] = t.w8 ?? 0;
  }
  return { data: out, count: list.length };
}
export function glintTilt(ux, uy, h, h2, conch) {
  const patch = (fbm(ux / 90, uy / 90, 61, 2) - .5) * 2, patch2 = (fbm(ux / 90, uy / 90, 83, 2) - .5) * 2;
  let bx = patch * .1, by = patch2 * .1;
  if (conch) { bx += -ux / RI * .24; by += -Math.min(uy, 0) / RI * .24; }
  return [bx + (h - .5) * .44, by + (h2 - .5) * .44, bx, by];
}

/* The wall's light data is computed once by the stills script and shipped as a small binary file
   (glint-<class>.bin), so the live page never lays the wall. Per stone, 13 bytes: its centre in
   quarter units (int16 × 2), its angle, length and width (bytes; eighths of a unit), its colour,
   material and two random tilts. A twentieth of the plain lapis is kept, for the rare white glints. */
const WALL_REC = 13;
export function encodeWallGlint(stones, q) {
  const list = stones.filter(t => t.mat && (t.mat !== MAT.GLASS || t.star || hash2(t.x * 3 | 0, t.y * 3 | 0, 77) < .05));
  const buf = new ArrayBuffer(4 + list.length * WALL_REC), dv = new DataView(buf);
  dv.setUint32(0, list.length, true);
  let o = 4;
  for (const t of list) {
    const a = ((t.a % Math.PI) + Math.PI) % Math.PI;
    dv.setInt16(o, Math.round(t.ux * 4), true); dv.setInt16(o + 2, Math.round(t.uy * 4), true); o += 4;
    dv.setUint8(o++, Math.round(a / Math.PI * 255)); dv.setUint8(o++, Math.min(255, Math.round(t.l / q * 8))); dv.setUint8(o++, Math.min(255, Math.round(t.w / q * 8)));
    dv.setUint8(o++, t.col[0] | 0); dv.setUint8(o++, t.col[1] | 0); dv.setUint8(o++, t.col[2] | 0);
    dv.setUint8(o++, t.mat); dv.setUint8(o++, Math.round(t.h * 255)); dv.setUint8(o++, Math.round(t.h2 * 255));
  }
  return buf;
}
export function decodeWallGlint(buf) {
  const dv = new DataView(buf), n = dv.getUint32(0, true), out = new Float32Array(n * GLINT_STRIDE);
  let o = 4, w = 0;
  for (let i = 0; i < n; i++) {
    const cx = dv.getInt16(o, true) / 4, cy = dv.getInt16(o + 2, true) / 4; o += 4;
    const a = dv.getUint8(o++) / 255 * Math.PI, hl = dv.getUint8(o++) / 16, hw = dv.getUint8(o++) / 16, ca = Math.cos(a), sa = Math.sin(a);
    for (const [u, v] of [[-hl, -hw], [hl, -hw], [hl, hw], [-hl, hw]]) { out[w++] = cx + u * ca - v * sa; out[w++] = cy + u * sa + v * ca; }
    const r = dv.getUint8(o++), g = dv.getUint8(o++), b = dv.getUint8(o++), mat = dv.getUint8(o++), h = dv.getUint8(o++) / 255, h2 = dv.getUint8(o++) / 255;
    out[w++] = cx; out[w++] = cy;
    const tilt = glintTilt(cx, cy, h, h2, false);
    out[w++] = tilt[0]; out[w++] = tilt[1]; out[w++] = tilt[2]; out[w++] = tilt[3];
    out[w++] = r / 255; out[w++] = g / 255; out[w++] = b / 255; out[w++] = mat; out[w++] = 0;
  }
  return { data: out, count: n };
}
