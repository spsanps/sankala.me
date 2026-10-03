/* Arched window mosaic: laying the stones.
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
import { distanceField, Buckets, contours, walk } from './field.js';
import { mulberry32 } from './core.js';
import { PANEL, innerPath } from './geom.js';

export function* laySteps(regions, outlines, { W, H, q, s, seed = 7, grout = .17 }) {
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
    if (r.clip) { c.beginPath(); innerPath(c); c.clip(); }
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

  /* 2. outline rows, and the band of each that belongs to the outline stones */
  const zone = new Uint8Array(N), zoneD = new Float32Array(N).fill(1e9);
  const so = s * .9;
  for (const o of outlines) {
    const I = setOf(o.inside), A = setOf(o.against), mI = maskOf(I), dA = distanceField(maskOf(A), W, H);
    for (let p = 0; p < N; p++) if (mI[p] && dA[p] < so * .84) { zone[p] = 1; if (dA[p] < zoneD[p]) zoneD[p] = dA[p]; }
    const lines = contours(dA, W, H, so * .5, mI, boxOf(I)).sort((p, q2) => q2.length - p.length);
    for (const ln of lines) walk(ln, () => so, .86, (x, y, a) => {
      if (!I[labAt(x, y) + 1] || !free(x, y, so * .55)) return;
      add(x, y, a, so * .8, so * .66, 0, -2, so);
    });
    yield;
  }

  /* 3. rows, region by region, along the contours of distance from the region's source edges */
  for (let i = 0; i < nR; i++) {
    const r = regions[i]; if (!area[i] || r.skip) continue;
    const sR = s * (r.fine || 1);
    const src = new Uint8Array(N);
    if (r.src === 'self') { for (let p = 0; p < N; p++) src[p] = lab[p] !== i ? 1 : 0; }
    else if (r.src === 'courses') { for (let x = 0; x < W; x++) src[(Math.max(0, box[i][1] - 1)) * W + x] = 1; }   // level courses from the top
    else { const S = setOf(r.src); for (let p = 0; p < N; p++) src[p] = S[lab[p] + 1]; }
    const d = distanceField(src, W, H), m = new Uint8Array(N);
    let maxD = 0;
    for (let p = 0; p < N; p++) if (lab[p] === i) { m[p] = 1; if (d[p] > maxD) maxD = d[p]; }
    const bx = [box[i][0] - 2, box[i][1] - 2, box[i][2] + 2, box[i][3] + 2];
    for (let k = 0; (k + .5) * sR < maxD + sR * .5; k++) {
      const lines = contours(d, W, H, (k + .5) * sR, m, bx).sort((p, q2) => q2.length - p.length);
      for (const ln of lines) walk(ln, () => sR, .98, (x, y, a) => {
        if (labAt(x, y) !== i || zone[(y | 0) * W + (x | 0)] || !free(x, y, sR * .78)) return;
        add(x, y, a, sR * .94, sR * .84, 1, i, sR, k);
      });
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
  const kept = yield* fit(stones, lab, zone, W, H, s, grout);
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

function* fit(stones, lab, zone, W, H, s, grout) {
  const n = stones.length, sx = new Float64Array(n), sy = new Float64Array(n), cnt = new Int32Array(n);
  const mnU = new Float32Array(n), mxU = new Float32Array(n), mnV = new Float32Array(n), mxV = new Float32Array(n);
  const ca = new Float32Array(n), sa = new Float32Array(n), hl = new Float32Array(n), hw = new Float32Array(n);
  for (let pass = 0; pass < 3; pass++) {
    const final = pass === 2, B = new Buckets(W, H, s);
    stones.forEach((t, i) => { B.add(t.x, t.y, i); ca[i] = Math.cos(t.a); sa[i] = Math.sin(t.a); hl[i] = Math.max(.5, t.l / 2); hw[i] = Math.max(.5, t.w / 2); });
    sx.fill(0); sy.fill(0); cnt.fill(0);
    if (final) { mnU.fill(1e9); mxU.fill(-1e9); mnV.fill(1e9); mxV.fill(-1e9); }
    for (let y = 0; y < H; y++) {
      const py = y + .5, gy = Math.floor(py / B.cell);
      for (let x = 0; x < W; x++) {
        const p = y * W + x, l = lab[p]; if (l < 0) continue;
        const cls = zone[p] ? -2 : l, px = x + .5, gx = Math.floor(px / B.cell);
        let best = -1, bd = 1.9;
        for (let by = gy - 1; by <= gy + 1; by++) {
          if (by < 0 || by >= B.ch) continue;
          for (let bxx = gx - 1; bxx <= gx + 1; bxx++) {
            if (bxx < 0 || bxx >= B.cw) continue;
            const li = B.b[by * B.cw + bxx]; if (!li) continue;
            for (const id of li) {
              if (stones[id].reg !== cls) continue;
              const dx = px - stones[id].x, dy = py - stones[id].y;
              const u = (dx * ca[id] + dy * sa[id]) / hl[id], v = (-dx * sa[id] + dy * ca[id]) / hw[id];
              const dd = Math.max(Math.abs(u), Math.abs(v));
              if (dd < bd) { bd = dd; best = id; }
            }
          }
        }
        if (best < 0) continue;
        cnt[best]++; sx[best] += px; sy[best] += py;
        if (final) {
          const t = stones[best], dx = px - t.x, dy = py - t.y, u = dx * ca[best] + dy * sa[best], v = -dx * sa[best] + dy * ca[best];
          if (u < mnU[best]) mnU[best] = u; if (u > mxU[best]) mxU[best] = u; if (v < mnV[best]) mnV[best] = v; if (v > mxV[best]) mxV[best] = v;
        }
      }
    }
    if (!final) {
      for (let i = 0; i < n; i++) if (cnt[i] > 0) {
        const t = stones[i], nx = sx[i] / cnt[i], ny = sy[i] / cnt[i], m = Math.hypot(nx - t.x, ny - t.y), lim = t.s * .35, f = m > lim ? lim / m : 1;
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
