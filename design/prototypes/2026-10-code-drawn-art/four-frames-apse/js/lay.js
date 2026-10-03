/* The apse in mosaic: laying the stones (the engine of the arched-window study, generalised:
   the sheet's panel and clip are options, and each region's distance field is computed only in
   its own box, so a layout with many small regions stays cheap).
   The way a mosaicist lays a panel, in order:
     1. the shapes are rasterised into a label map (one label per region, later shapes on top);
     2. dark outline rows are walked along the few edges that get one (panel edge, inner arch,
        sill line, robot silhouette, domes against the sky);
     3. every region is laid in rows that follow its own edges: the rows sit on the contours of
        the distance from the region's chosen "source" edges (the sky from all its edges, so it
        hugs the arch, the sun and the robot; the hills from the edge above them; the frame from
        the arch; the sill from its top, which gives courses);
     4. gaps are filled with smaller cut stones;
     5. every stone is fitted to its cell (each pixel goes to the nearest stone of its own
        region) and cut to fill it, less a pale grout joint.
   A region marked `skip` is labelled (so outlines can be laid against it) but gets no stones:
   the frame is laid against the window without laying the view. */
import { distanceField, Buckets, contours, contourLevels, walk } from './field.js';
import { mulberry32 } from './core.js';

/** regions: [{ name, group, draw(c), fill, clip, fine, src, skip }]; panel: the sheet's origin and
    size in units ({ x0, y0 }); clip(c): the path every `clip: true` region is clipped to;
    pre: stones laid before anything else ({ x, y, a, l, w, reg, col } in sheet px). */
export function* laySteps(regions, outlines, { W, H, q, s, seed = 7, grout = .17, panel, clip, pre = [] }) {
  const PANEL = panel;
  const N = W * H, nR = regions.length, rnd = mulberry32(seed);
  /* 1. labels */
  const lab = new Int16Array(N).fill(-1);
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d', { willReadFrequently: true });
  for (let i = 0; i < nR; i++) {
    const r = regions[i];
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
    c.setTransform(q, 0, 0, q, -PANEL.x0 * q, -PANEL.y0 * q);
    c.save();
    if (r.clip && clip) { c.beginPath(); clip(c); c.clip(); }
    // a hair of overlap, so shared edges between shapes leave no seam of what lies beneath
    c.beginPath(); r.draw(c); c.fillStyle = '#000'; c.fill(); c.lineWidth = 1.4 / q; c.lineJoin = 'round'; c.strokeStyle = '#000'; c.stroke();
    c.restore();
    const a = c.getImageData(0, 0, W, H).data;
    for (let p = 0; p < N; p++) if (a[p * 4 + 3] >= 128) lab[p] = i;
    if (i % 4 === 3) yield;
  }
  const box = regions.map(() => [W, H, -1, -1]), area = new Int32Array(nR);
  for (let p = 0; p < N; p++) { const l = lab[p]; if (l < 0) continue; area[l]++; const x = p % W, y = (p / W) | 0, b = box[l]; if (x < b[0]) b[0] = x; if (y < b[1]) b[1] = y; if (x > b[2]) b[2] = x; if (y > b[3]) b[3] = y; }
  yield;
  /* sets of regions by name or group; 'outside' is everything beyond the panel */
  const setOf = names => {
    const S = new Uint8Array(nR + 1);
    for (const n of names) { if (n === 'outside') S[0] = 1; regions.forEach((r, i) => { if (r.name === n || r.group === n) S[i + 1] = 1; }); }
    return S;
  };
  const maskOf = S => { const m = new Uint8Array(N); for (let p = 0; p < N; p++) m[p] = S[lab[p] + 1]; return m; };
  const boxOf = S => { const b = [W, H, -1, -1]; regions.forEach((r, i) => { if (S[i + 1] && area[i]) { const o = box[i]; b[0] = Math.min(b[0], o[0]); b[1] = Math.min(b[1], o[1]); b[2] = Math.max(b[2], o[2]); b[3] = Math.max(b[3], o[3]); } }); return [b[0] - 2, b[1] - 2, b[2] + 2, b[3] + 2]; };

  const stones = [], B = new Buckets(W, H, s);
  const free = (x, y, r) => !B.near(x, y, r);
  const add = (x, y, a, l, w, k, reg, ls, row = 0) => { const id = stones.length; stones.push({ x, y, a, l, w, k, reg, s: ls, row, h: rnd(), h2: rnd() }); B.add(x, y, id); return id; };
  const labAt = (x, y) => lab[Math.min(H - 1, Math.max(0, y | 0)) * W + Math.min(W - 1, Math.max(0, x | 0))];
  for (const p of pre) {
    // a pre-placed stone only goes where its own region is (with a stone's margin), and not on another
    const r0 = s * .7;
    if ([[0, 0], [r0, 0], [-r0, 0], [0, r0], [0, -r0]].some(([dx, dy]) => labAt(p.x + dx, p.y + dy) !== p.reg) || !free(p.x, p.y, Math.min(p.l, p.w) * .7)) continue;
    const id = add(p.x, p.y, p.a, p.l, p.w, 2, p.reg, p.s || s, -1); Object.assign(stones[id], p.extra || {});
  }

  /* 2. outline rows, and the band of each that belongs to the outline stones */
  const zone = new Uint8Array(N), zoneD = new Float32Array(N).fill(1e9);
  const so = s * .9;
  for (const o of outlines) {
    const I = setOf(o.inside), A = setOf(o.against), bI = boxOf(I);
    if (bI[2] < bI[0]) continue;
    const M = Math.ceil(s * 3), cx0 = Math.max(0, bI[0] - M), cy0 = Math.max(0, bI[1] - M), cx1 = Math.min(W - 1, bI[2] + M), cy1 = Math.min(H - 1, bI[3] + M);
    const cw = cx1 - cx0 + 1, ch = cy1 - cy0 + 1, CN = cw * ch, mA = new Uint8Array(CN), mI = new Uint8Array(CN);
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) { const l = lab[(y + cy0) * W + x + cx0]; mA[y * cw + x] = A[l + 1]; mI[y * cw + x] = I[l + 1]; }
    const dA = distanceField(mA, cw, ch);
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
      const k = y * cw + x, p = (y + cy0) * W + x + cx0;
      if (mI[k] && dA[k] < so * .84) { zone[p] = 1; if (dA[k] < zoneD[p]) zoneD[p] = dA[k]; }
    }
    const lines = contours(dA, cw, ch, so * .5, mI, null).sort((p, q2) => q2.length - p.length);
    for (const ln0 of lines) walk(ln0.map(([x, y]) => [x + cx0, y + cy0]), () => so, .86, (x, y, a) => {
      if (!I[labAt(x, y) + 1] || !free(x, y, so * .55)) return;
      add(x, y, a, so * .8, so * .66, 0, -2, so);
    });
    yield;
  }

  /* 3. rows, region by region, along the contours of distance from the region's source edges.
     Each field is computed in the region's box plus a margin (wider when the sources are other
     regions, which may lie further off), and the rows are walked there. */
  for (let i = 0; i < nR; i++) {
    const r = regions[i]; if (!area[i] || r.skip) continue;
    const sR = s * (r.fine || 1);
    const M = Math.ceil(r.src === 'self' || r.src === 'courses' ? s * 2 : s * 14);
    const cx0 = Math.max(0, box[i][0] - M), cy0 = Math.max(0, box[i][1] - M), cx1 = Math.min(W - 1, box[i][2] + M), cy1 = Math.min(H - 1, box[i][3] + M);
    const cw = cx1 - cx0 + 1, ch = cy1 - cy0 + 1, CN = cw * ch;
    const src = new Uint8Array(CN), m = new Uint8Array(CN);
    const S = Array.isArray(r.src) ? setOf(r.src) : null;
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
      const l = lab[(y + cy0) * W + x + cx0], k = y * cw + x;
      if (l === i) m[k] = 1;
      if (r.src === 'self') src[k] = l !== i ? 1 : 0;
      else if (S) src[k] = S[l + 1];
    }
    if (r.src === 'self') { for (let x = 0; x < cw; x++) { src[x] = 1; src[CN - cw + x] = 1; } for (let y = 0; y < ch; y++) { src[y * cw] = 1; src[y * cw + cw - 1] = 1; } }
    if (r.src === 'courses') { const yy = Math.max(0, box[i][1] - 1 - cy0); for (let x = 0; x < cw; x++) src[yy * cw + x] = 1; }
    // a region whose sources all lie outside its crop falls back to its own edges
    let any = 0; for (let k = 0; k < CN; k++) if (src[k]) { any = 1; break; }
    if (!any) for (let k = 0; k < CN; k++) src[k] = m[k] ? 0 : 1;
    /* halo rows: a gold ground hugs each figure with a row or two, then its rows follow the arch */
    if (r.halo) {
      const hs = new Uint8Array(CN);
      for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) { const l = lab[(y + cy0) * W + x + cx0]; hs[y * cw + x] = l !== i && l >= 0 ? 1 : 0; }
      const dh = distanceField(hs, cw, ch);
      for (let k = 0; k < r.halo; k++) {
        const lines = contours(dh, cw, ch, (k + .5) * sR, m, null).sort((p, q2) => q2.length - p.length);
        for (const ln0 of lines) walk(ln0.map(([x, y]) => [x + cx0, y + cy0]), () => sR, .98, (x, y, a) => {
          if (labAt(x, y) !== i || zone[(y | 0) * W + (x | 0)] || !free(x, y, sR * .78)) return;
          add(x, y, a, sR * .94, sR * .84, 1, i, sR, -10 - k);
        });
      }
      yield;
    }
    const d = distanceField(src, cw, ch);
    let maxD = 0;
    for (let k = 0; k < CN; k++) if (m[k] && d[k] > maxD) maxD = d[k];
    const nK = Math.ceil(maxD / sR + .5), levels = contourLevels(d, cw, ch, sR, nK, m);
    for (let k = 0; k < nK; k++) {
      const lines = levels[k];
      for (const ln0 of lines) {
        const ln = ln0.map(([x, y]) => [x + cx0, y + cy0]);
        walk(ln, () => sR, .98, (x, y, a) => {
          if (labAt(x, y) !== i || zone[(y | 0) * W + (x | 0)] || !free(x, y, sR * .78)) return;
          add(x, y, a, sR * .94, sR * .84, 1, i, sR, k);
        });
      }
      if (k % 6 === 5) yield;
    }
    yield;
  }

  /* 4. fill what is left with smaller stones, turned like their nearest neighbour */
  const nearAngle = (x, y, R) => {
    let best = -1, bd = 1e9; const cell = B.cell, gx = Math.floor(x / cell), gy = Math.floor(y / cell);
    for (let yy = gy - 1; yy <= gy + 1; yy++) for (let xx = gx - 1; xx <= gx + 1; xx++) {
      if (xx < 0 || yy < 0 || xx >= B.cw || yy >= B.ch) continue;
      const l = B.b[yy * B.cw + xx]; if (!l) continue;
      for (const id of l) { const st = stones[id]; if (st.reg !== R) continue; const dd = (st.x - x) ** 2 + (st.y - y) ** 2; if (dd < bd) { bd = dd; best = id; } }
    }
    return best >= 0 ? stones[best].a : 0;
  };
  for (const [size, gap] of [[.72, .58], [.52, .42]]) {
    const cov = coverage(stones, W, H, 1.04);
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const p = y * W + x, l = lab[p]; if (l < 0 || cov[p] || (!zone[p] && regions[l].skip)) continue;
      if (zone[p]) {  // a break in an outline row is closed with another dark stone
        if (zoneD[p] < so * .6 && free(x + .5, y + .5, so * .74) && B.near(x + .5, y + .5, so * 1.7)) add(x + .5, y + .5, nearAngle(x, y, -2), so * .8, so * .66, 0, -2, so);
        continue;
      }
      const sR = s * (regions[l].fine || 1);
      if (!free(x + .5, y + .5, sR * gap)) continue;
      add(x + .5, y + .5, nearAngle(x, y, l), sR * size, sR * size * .9, 3, l, sR, 99);
    }
    yield;
  }

  /* 5. fit every stone to its cell and cut it, less the grout */
  const kept = yield* fit(stones, lab, zone, W, H, s, grout, Uint8Array.from(regions, r => r.skip ? 1 : 0));
  void q;
  for (const t of kept) { t.j = new Float32Array(8); for (let k2 = 0; k2 < 8; k2++) t.j[k2] = (rnd() - .5) * t.s * (t.k === 0 ? .05 : .075); }
  return { stones: kept, lab, W, H };
}

function coverage(stones, W, H, grow) {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d', { willReadFrequently: true }); c.fillStyle = '#000';
  for (const t of stones) { c.save(); c.translate(t.x, t.y); c.rotate(t.a); c.fillRect(-t.l * grow / 2, -t.w * grow / 2, t.l * grow, t.w * grow); c.restore(); }
  const a = c.getImageData(0, 0, W, H).data, out = new Uint8Array(W * H);
  for (let p = 0; p < W * H; p++) out[p] = a[p * 4 + 3] > 60 ? 1 : 0;
  return out;
}

function* fit(stones, lab, zone, W, H, s, grout, skipLab) {
  const n = stones.length, sx = new Float64Array(n), sy = new Float64Array(n), cnt = new Int32Array(n);
  const mnU = new Float32Array(n), mxU = new Float32Array(n), mnV = new Float32Array(n), mxV = new Float32Array(n);
  const ca = new Float32Array(n), sa = new Float32Array(n), ihl = new Float32Array(n), ihw = new Float32Array(n);
  const px0 = new Float32Array(n), py0 = new Float32Array(n), rg = new Int32Array(n);
  const PASSES = 2;
  for (let pass = 0; pass < PASSES; pass++) {
    const final = pass === PASSES - 1, B = new Buckets(W, H, s);
    stones.forEach((t, i) => { B.add(t.x, t.y, i); ca[i] = Math.cos(t.a); sa[i] = Math.sin(t.a); ihl[i] = 1 / Math.max(.5, t.l / 2); ihw[i] = 1 / Math.max(.5, t.w / 2); px0[i] = t.x; py0[i] = t.y; rg[i] = t.reg; });
    sx.fill(0); sy.fill(0); cnt.fill(0);
    if (final) { mnU.fill(1e9); mxU.fill(-1e9); mnV.fill(1e9); mxV.fill(-1e9); }
    const cell = B.cell, cw = B.cw, chh = B.ch, bk = B.b;
    for (let y = 0; y < H; y++) {
      const py = y + .5, gy = Math.floor(py / cell);
      for (let x = 0; x < W; x++) {
        const p = y * W + x, l = lab[p]; if (l < 0 || (skipLab[l] && !zone[p])) continue;
        const cls = zone[p] ? -2 : l, px = x + .5, gx = Math.floor(px / cell);
        let best = -1, bd = 1.9;
        for (let by = gy - 1; by <= gy + 1; by++) {
          if (by < 0 || by >= chh) continue;
          for (let bxx = gx - 1; bxx <= gx + 1; bxx++) {
            if (bxx < 0 || bxx >= cw) continue;
            const li = bk[by * cw + bxx]; if (!li) continue;
            for (let q = 0; q < li.length; q++) {
              const id = li[q];
              if (rg[id] !== cls) continue;
              const dx = px - px0[id], dy = py - py0[id];
              const u = Math.abs((dx * ca[id] + dy * sa[id]) * ihl[id]), v = Math.abs((-dx * sa[id] + dy * ca[id]) * ihw[id]);
              const dd = u > v ? u : v;
              if (dd < bd) { bd = dd; best = id; }
            }
          }
        }
        if (best < 0) continue;
        cnt[best]++; sx[best] += px; sy[best] += py;
        if (final) {
          const dx = px - px0[best], dy = py - py0[best], u = dx * ca[best] + dy * sa[best], v = -dx * sa[best] + dy * ca[best];
          if (u < mnU[best]) mnU[best] = u; if (u > mxU[best]) mxU[best] = u; if (v < mnV[best]) mnV[best] = v; if (v > mxV[best]) mxV[best] = v;
        }
      }
    }
    if (!final) {
      for (let i = 0; i < n; i++) if (cnt[i] > 0) {
        const t = stones[i], nx = sx[i] / cnt[i], ny = sy[i] / cnt[i], m = Math.hypot(nx - t.x, ny - t.y), lim = t.s * .4, f = m > lim ? lim / m : 1;
        t.x += (nx - t.x) * f; t.y += (ny - t.y) * f;
      }
    }
    yield;
  }
  const out = [];
  for (let i = 0; i < n; i++) {
    if (cnt[i] < 2) continue;
    const t = stones[i], ls = t.s, g = ls * grout;
    const L = Math.min(mxU[i] - mnU[i] + 1 - g, ls * (t.k === 0 ? .86 : 1.28)), Wd = Math.min(mxV[i] - mnV[i] + 1 - g, ls * (t.k === 0 ? .72 : 1.08));
    if (L < ls * .24 || Wd < ls * .2) continue;
    const cu = (mxU[i] + mnU[i]) / 2, cvv = (mxV[i] + mnV[i]) / 2;
    t.x += cu * ca[i] - cvv * sa[i]; t.y += cu * sa[i] + cvv * ca[i];
    t.l = L; t.w = Wd;
    out.push(t);
  }
  return out;
}

/** the four corners of a stone in sheet pixels */
export function corners(t, out) {
  const c = Math.cos(t.a), s = Math.sin(t.a), hl = t.l / 2, hw = t.w / 2, j = t.j;
  const P = [-hl, -hw, hl, -hw, hl, hw, -hl, hw];
  for (let k = 0; k < 4; k++) { const lx = P[k * 2] + j[k * 2], ly = P[k * 2 + 1] + j[k * 2 + 1]; out[k * 2] = t.x + c * lx - s * ly; out[k * 2 + 1] = t.y + s * lx + c * ly; }
  return out;
}
