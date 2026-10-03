(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // js/core.js
  function mulberry32(a) {
    return function() {
      a |= 0;
      a = a + 1831565813 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function hash2(ix, iy, s) {
    let h = Math.imul(ix | 0, 374761393) ^ Math.imul(iy | 0, 668265263) ^ Math.imul(s | 0, 982451653);
    h = Math.imul(h ^ h >>> 13, 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  function vnoise(x, y, s = 0) {
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    const a = hash2(ix, iy, s), b = hash2(ix + 1, iy, s), c = hash2(ix, iy + 1, s), d = hash2(ix + 1, iy + 1, s);
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
  }
  function fbm(x, y, s = 0, oct = 4) {
    let v = 0, a = 0.5, f = 1, n = 0;
    for (let i = 0; i < oct; i++) {
      v += a * vnoise(x * f, y * f, s + i * 17);
      n += a;
      a *= 0.5;
      f *= 2.03;
    }
    return v / n;
  }
  function rgb(str) {
    if (str[0] !== "#") {
      const m = str.match(/rgba?\(([^)]+)\)/);
      if (m) {
        const v = m[1].split(",").map(Number);
        return [v[0], v[1], v[2], v[3] ?? 1];
      }
    }
    const h = str.replace("#", "");
    const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16);
    return [n >> 16 & 255, n >> 8 & 255, n & 255];
  }
  function mix(a, b, t) {
    const A = typeof a === "string" ? rgb(a) : a, B2 = typeof b === "string" ? rgb(b) : b;
    const out = [lerp(A[0], B2[0], t), lerp(A[1], B2[1], t), lerp(A[2], B2[2], t)];
    if (A.length > 3 || B2.length > 3) out.push(lerp(A[3] ?? 1, B2[3] ?? 1, t));
    return out;
  }
  function laParts(date) {
    const f = new Intl.DateTimeFormat("en-US", { timeZone: SJ.tz, year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric", hourCycle: "h23" });
    const o = {};
    for (const p of f.formatToParts(date)) o[p.type] = p.value;
    return { y: +o.year, m: +o.month, d: +o.day, h: +o.hour, min: +o.minute, s: +o.second };
  }
  function laOffsetMinutes(date) {
    const p = laParts(date);
    return Math.round((Date.UTC(p.y, p.m - 1, p.d, p.h, p.min, p.s) - date.getTime()) / 6e4);
  }
  function sceneDate(hour) {
    const now = /* @__PURE__ */ new Date();
    if (hour == null || Number.isNaN(hour)) return now;
    const p = laParts(now), off = laOffsetMinutes(now);
    const hh = Math.floor(hour), mm = Math.round((hour - hh) * 60);
    return new Date(Date.UTC(p.y, p.m - 1, p.d, hh, mm) - off * 6e4);
  }
  function clockLabel(date) {
    return new Intl.DateTimeFormat("en-US", { timeZone: SJ.tz, hour: "numeric", minute: "2-digit" }).format(date).toLowerCase().replace(/\s/g, " ");
  }
  function sunPosition(date) {
    const jd = date.getTime() / 864e5 + 24405875e-1, n = jd - 2451545;
    const L = (280.46 + 0.9856474 * n) % 360, g = (357.528 + 0.9856003 * n) % 360 * DEG;
    const lambda = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * DEG, eps = (23.439 - 4e-7 * n) * DEG;
    const ra = Math.atan2(Math.cos(eps) * Math.sin(lambda), Math.cos(lambda)), dec = Math.asin(Math.sin(eps) * Math.sin(lambda));
    return equatorialToHorizontal(ra, dec, jd);
  }
  function equatorialToHorizontal(ra, dec, jd) {
    const gmst = (280.46061837 + 360.98564736629 * (jd - 2451545)) % 360;
    const lst = (gmst + SJ.lon) * DEG, H = lst - ra, lat = SJ.lat * DEG;
    const el = Math.asin(Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(H));
    const az = Math.atan2(-Math.sin(H), Math.tan(dec) * Math.cos(lat) - Math.sin(lat) * Math.cos(H));
    return { el: el / DEG, az: (az / DEG + 360) % 360 };
  }
  function moonPosition(date) {
    const jd = date.getTime() / 864e5 + 24405875e-1, d = jd - 2451545;
    const L = (218.316 + 13.176396 * d) * DEG, M = (134.963 + 13.064993 * d) * DEG, F = (93.272 + 13.22935 * d) * DEG;
    const lon = L + 6.289 * DEG * Math.sin(M), lat = 5.128 * DEG * Math.sin(F), eps = 23.439 * DEG;
    const ra = Math.atan2(Math.sin(lon) * Math.cos(eps) - Math.tan(lat) * Math.sin(eps), Math.cos(lon));
    const dec = Math.asin(Math.sin(lat) * Math.cos(eps) + Math.cos(lat) * Math.sin(eps) * Math.sin(lon));
    const pos = equatorialToHorizontal(ra, dec, jd);
    return { ...pos, phase: fract((jd - 24515501e-1) / 29.530588853) };
  }
  function skyState(date) {
    const sun = sunPosition(date), moon = moonPosition(date), e = sun.el;
    return {
      sun,
      moon,
      night: smooth(-1, -14, e),
      twilight: smooth(-9, -1, e) * (1 - smooth(4, 14, e)),
      golden: smooth(-1, 3, e) * (1 - smooth(10, 22, e)),
      day: smooth(2, 18, e),
      lamp: smooth(6, -1, e),
      stars: smooth(-4, -13, e)
    };
  }
  var TAU, PI, DEG, clamp, smooth, lerp, fract, SJ;
  var init_core = __esm({
    "js/core.js"() {
      TAU = Math.PI * 2;
      PI = Math.PI;
      DEG = PI / 180;
      clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
      smooth = (a, b, v) => {
        const t = clamp((v - a) / (b - a));
        return t * t * (3 - 2 * t);
      };
      lerp = (a, b, t) => a + (b - a) * t;
      fract = (v) => v - Math.floor(v);
      SJ = { lat: 37.3382, lon: -121.8863, tz: "America/Los_Angeles" };
    }
  });

  // js/geom.js
  function layoutApse(w, h, header, headerH = 0) {
    const corners2 = header === "corners";
    const bandTarget = corners2 ? h * 0.662 : Math.min(h * 0.6, w * 1.62);
    const mt = corners2 ? Math.max(10, h * 0.014) : headerH + 6;
    const ms = corners2 ? 24 : 9;
    const uW = (w - 2 * ms) / (2 * RO);
    let u, F;
    const fW = (bandTarget - mt) / uW - (RO + C);
    if (fW >= F_MIN) {
      u = uW;
      F = Math.min(fW, F_MAX);
    } else {
      F = F_MIN;
      u = (bandTarget - mt) / (RO + F_MIN + C);
    }
    const cx = w / 2, cy = mt + RO * u, bandH = Math.ceil(cy + (F + C) * u);
    return { u, F, cx, cy, bandH, w, h, mt, corners: corners2, tall: clamp((F - F_MIN) / (760 - F_MIN)) };
  }
  function archDepth(x, y) {
    return Math.hypot(x, Math.min(y, 0)) - RI;
  }
  function archParam(x, y, F) {
    const arcLen = Math.PI * RI, total = arcLen + 2 * F;
    if (y >= 0) return x < 0 ? (F - y) / total : (F + arcLen + y) / total;
    return (F + (Math.atan2(y, x) + Math.PI) / Math.PI * arcLen) / total;
  }
  function archPoint(f, F, r = RI + B / 2) {
    const arcLen = Math.PI * r, total = arcLen + 2 * F, s = f * total;
    if (s < F) return { x: -r, y: F - s, nx: 1, ny: 0 };
    if (s < F + arcLen) {
      const a = Math.PI + (s - F) / arcLen * Math.PI;
      return { x: r * Math.cos(a), y: r * Math.sin(a), nx: -Math.cos(a), ny: -Math.sin(a) };
    }
    return { x: r, y: s - F - arcLen, nx: -1, ny: 0 };
  }
  function sceneAnchors(F) {
    const t = clamp((F - F_MIN) / (760 - F_MIN));
    const sd = lerp(1.02, 1.4, t);
    const ground = F - lerp(12, 44, t);
    const deskY = ground - LEG * sd;
    return { t, sd, ground, deskY, F };
  }
  function regionList() {
    const out = [];
    out.R = (name, group, draw, fill, o = {}) => {
      out.push({ name, group, draw, fill, clip: true, fine: 1, src: "self", ...o });
      return out;
    };
    return out;
  }
  var RI, B, C, RO, LEG, F_MIN, F_MAX, conchPath, archivoltPath, poly, disc, ell, rect, union, below, bar, blade;
  var init_geom = __esm({
    "js/geom.js"() {
      init_core();
      RI = 500;
      B = 46;
      C = 46;
      RO = RI + B;
      LEG = 150;
      F_MIN = 78;
      F_MAX = 1150;
      conchPath = (F) => (c) => {
        c.moveTo(-RI, F + 1);
        c.lineTo(-RI, 0);
        c.arc(0, 0, RI, Math.PI, 0);
        c.lineTo(RI, F + 1);
        c.closePath();
      };
      archivoltPath = (F) => (c) => {
        c.moveTo(-RO, F + 0.5);
        c.lineTo(-RO, 0);
        c.arc(0, 0, RO, Math.PI, 0);
        c.lineTo(RO, F + 0.5);
        c.lineTo(RI, F + 0.5);
        c.lineTo(RI, 0);
        c.arc(0, 0, RI, 0, Math.PI, true);
        c.lineTo(-RI, F + 0.5);
        c.closePath();
      };
      poly = (pts) => (c) => {
        c.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
        c.closePath();
      };
      disc = (x, y, r) => (c) => {
        c.moveTo(x + r, y);
        c.arc(x, y, r, 0, TAU);
        c.closePath();
      };
      ell = (x, y, rx, ry, rot = 0) => (c) => {
        c.moveTo(x + rx * Math.cos(rot), y + rx * Math.sin(rot));
        c.ellipse(x, y, rx, ry, rot, 0, TAU);
        c.closePath();
      };
      rect = (x, y, w, h) => (c) => c.rect(x, y, w, h);
      union = (...fs) => (c) => {
        for (const f of fs) if (f) f(c);
      };
      below = (fn, x0, x1, bottom, step = 5) => (c) => {
        c.moveTo(x0, bottom);
        for (let x = x0; x <= x1; x += step) c.lineTo(x, fn(x));
        c.lineTo(x1, fn(x1));
        c.lineTo(x1, bottom);
        c.closePath();
      };
      bar = (x0, y0, x1, y1, w) => {
        const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a) * w / 2, ny = Math.cos(a) * w / 2;
        return poly([[x0 + nx, y0 + ny], [x1 + nx, y1 + ny], [x1 - nx, y1 - ny], [x0 - nx, y0 - ny]]);
      };
      blade = (x0, y0, cx, cy, x1, y1, w0, w1 = 0) => (c) => {
        const N = 14, L = [], R = [];
        for (let i = 0; i <= N; i++) {
          const t = i / N, u = 1 - t;
          const x = u * u * x0 + 2 * u * t * cx + t * t * x1, y = u * u * y0 + 2 * u * t * cy + t * t * y1;
          const dx = 2 * u * (cx - x0) + 2 * t * (x1 - cx), dy = 2 * u * (cy - y0) + 2 * t * (y1 - cy), l = Math.hypot(dx, dy) || 1;
          const w = (w0 + (w1 - w0) * t) * Math.sin(Math.min(1, (t + 0.08) * 1.3) * Math.PI * 0.5 + 1e-4) / 2;
          L.push([x - dy / l * w, y + dx / l * w]);
          R.push([x + dy / l * w, y - dx / l * w]);
        }
        c.moveTo(L[0][0], L[0][1]);
        for (const p of L) c.lineTo(p[0], p[1]);
        for (let i = R.length - 1; i >= 0; i--) c.lineTo(R[i][0], R[i][1]);
        c.closePath();
      };
    }
  });

  // js/field.js
  function edt1d(f, n, d, v, z) {
    let k = 0;
    v[0] = 0;
    z[0] = -1e20;
    z[1] = 1e20;
    for (let q = 1; q < n; q++) {
      let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (s <= z[k]) {
        k--;
        s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      }
      k++;
      v[k] = q;
      z[k] = s;
      z[k + 1] = 1e20;
    }
    k = 0;
    for (let q = 0; q < n; q++) {
      while (z[k + 1] < q) k++;
      const dq = q - v[k];
      d[q] = dq * dq + f[v[k]];
    }
  }
  function distanceField(mask, W, H) {
    const INF = 1e12, N = Math.max(W, H), f = new Float64Array(N), d = new Float64Array(N), v = new Int32Array(N), z = new Float64Array(N + 1);
    const g = new Float64Array(W * H);
    for (let i = 0; i < W * H; i++) g[i] = mask[i] ? 0 : INF;
    for (let x = 0; x < W; x++) {
      for (let y = 0; y < H; y++) f[y] = g[y * W + x];
      edt1d(f, H, d, v, z);
      for (let y = 0; y < H; y++) g[y * W + x] = d[y];
    }
    const out = new Float32Array(W * H);
    for (let y = 0; y < H; y++) {
      const o = y * W;
      for (let x = 0; x < W; x++) f[x] = g[o + x];
      edt1d(f, W, d, v, z);
      for (let x = 0; x < W; x++) out[o + x] = Math.sqrt(d[x]);
    }
    return out;
  }
  function contours(F, W, H, level, mask, box) {
    const bx0 = box ? Math.max(0, box[0]) : 0, by0 = box ? Math.max(0, box[1]) : 0, bx1 = box ? Math.min(W - 1, box[2]) : W - 1, by1 = box ? Math.min(H - 1, box[3]) : H - 1;
    const segs = [], key = (x, y, vert) => (vert ? W * H : 0) + y * W + x;
    const P6 = /* @__PURE__ */ new Map();
    const pt = (x, y, vert) => {
      const k = key(x, y, vert);
      let p = P6.get(k);
      if (!p) {
        if (!vert) {
          const a = F[y * W + x], b = F[y * W + x + 1], t = (level - a) / (b - a);
          p = [x + t, y];
        } else {
          const a = F[y * W + x], b = F[(y + 1) * W + x], t = (level - a) / (b - a);
          p = [x, y + t];
        }
        P6.set(k, p);
      }
      return k;
    };
    for (let y = by0; y < by1; y++) for (let x = bx0; x < bx1; x++) {
      if (mask && !mask[y * W + x]) continue;
      const i = y * W + x, a = F[i] > level, b = F[i + 1] > level, c = F[i + W + 1] > level, d = F[i + W] > level;
      const cs = (a ? 8 : 0) | (b ? 4 : 0) | (c ? 2 : 0) | (d ? 1 : 0);
      if (cs === 0 || cs === 15) continue;
      const T = () => pt(x, y, false), R = () => pt(x + 1, y, true), Bm = () => pt(x, y + 1, false), Lf = () => pt(x, y, true);
      switch (cs) {
        case 1:
        case 14:
          segs.push([Lf(), Bm()]);
          break;
        case 2:
        case 13:
          segs.push([Bm(), R()]);
          break;
        case 3:
        case 12:
          segs.push([Lf(), R()]);
          break;
        case 4:
        case 11:
          segs.push([T(), R()]);
          break;
        case 6:
        case 9:
          segs.push([T(), Bm()]);
          break;
        case 7:
        case 8:
          segs.push([Lf(), T()]);
          break;
        case 5:
        case 10: {
          const ctr = (F[i] + F[i + 1] + F[i + W] + F[i + W + 1]) / 4 > level;
          if (cs === 5 === ctr) {
            segs.push([Lf(), T()]);
            segs.push([Bm(), R()]);
          } else {
            segs.push([Lf(), Bm()]);
            segs.push([T(), R()]);
          }
          break;
        }
      }
    }
    const at = /* @__PURE__ */ new Map();
    segs.forEach((s, i) => {
      for (const k of s) {
        const l = at.get(k);
        if (l) l.push(i);
        else at.set(k, [i]);
      }
    });
    const used = new Uint8Array(segs.length), lines = [];
    for (let i0 = 0; i0 < segs.length; i0++) {
      if (used[i0]) continue;
      used[i0] = 1;
      const chain = [segs[i0][0], segs[i0][1]];
      for (const dir of [1, 0]) {
        for (; ; ) {
          const end = dir ? chain[chain.length - 1] : chain[0];
          const nb = (at.get(end) || []).find((j) => !used[j]);
          if (nb === void 0) break;
          used[nb] = 1;
          const s = segs[nb], nxt = s[0] === end ? s[1] : s[0];
          if (dir) chain.push(nxt);
          else chain.unshift(nxt);
        }
      }
      lines.push(chain.map((k) => P6.get(k)));
    }
    return lines;
  }
  function walk(line, stepAt, k, place) {
    const n = line.length;
    if (n < 2) return;
    const L = new Float32Array(n);
    for (let i = 1; i < n; i++) L[i] = L[i - 1] + Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]);
    const total = L[n - 1];
    const pos = (d2) => {
      let lo = 0, hi = n - 1;
      while (hi - lo > 1) {
        const m = lo + hi >> 1;
        if (L[m] < d2) lo = m;
        else hi = m;
      }
      const t = (d2 - L[lo]) / Math.max(1e-6, L[hi] - L[lo]);
      return [line[lo][0] + (line[hi][0] - line[lo][0]) * t, line[lo][1] + (line[hi][1] - line[lo][1]) * t];
    };
    const s0 = stepAt(line[0][0], line[0][1]) * k;
    if (total < s0 * 0.55) return;
    const closed = Math.hypot(line[0][0] - line[n - 1][0], line[0][1] - line[n - 1][1]) < 1.5;
    const ds = [];
    let d = closed ? 0 : s0 * 0.5;
    while (d <= total) {
      ds.push(d);
      const p = pos(d);
      d += stepAt(p[0], p[1]) * k;
    }
    if (closed && ds.length > 1) {
      const sc = total / d;
      for (let i = 0; i < ds.length; i++) ds[i] *= sc;
    }
    for (const dd of ds) {
      const p = pos(dd), st = stepAt(p[0], p[1]) * k, a = pos(Math.max(0, dd - st * 0.5)), b = pos(Math.min(total, dd + st * 0.5));
      place(p[0], p[1], Math.atan2(b[1] - a[1], b[0] - a[0]), stepAt(p[0], p[1]));
    }
  }
  function contourLevels(F, W, H, step, maxK, mask) {
    const per = Array.from({ length: maxK }, () => ({ segs: [], P: /* @__PURE__ */ new Map() }));
    for (let y = 0; y < H - 1; y++) for (let x = 0; x < W - 1; x++) {
      const i = y * W + x;
      if (mask && !mask[i]) continue;
      const a0 = F[i], b0 = F[i + 1], c0 = F[i + W + 1], d0 = F[i + W];
      let lo = a0 < b0 ? a0 : b0;
      if (c0 < lo) lo = c0;
      if (d0 < lo) lo = d0;
      let hi = a0 > b0 ? a0 : b0;
      if (c0 > hi) hi = c0;
      if (d0 > hi) hi = d0;
      const k0 = Math.max(0, Math.ceil(lo / step - 0.5)), k1 = Math.min(maxK - 1, Math.floor(hi / step - 0.5));
      for (let k = k0; k <= k1; k++) {
        const level = (k + 0.5) * step, L = per[k], P6 = L.P;
        const a = a0 > level, b = b0 > level, c = c0 > level, d = d0 > level;
        const cs = (a ? 8 : 0) | (b ? 4 : 0) | (c ? 2 : 0) | (d ? 1 : 0);
        if (cs === 0 || cs === 15) continue;
        const pt = (px, py, vert) => {
          const key = (vert ? W * H : 0) + py * W + px;
          let p = P6.get(key);
          if (!p) {
            if (!vert) {
              const u = F[py * W + px], v = F[py * W + px + 1], t = (level - u) / (v - u);
              p = [px + t, py];
            } else {
              const u = F[py * W + px], v = F[(py + 1) * W + px], t = (level - u) / (v - u);
              p = [px, py + t];
            }
            P6.set(key, p);
          }
          return key;
        };
        const T = () => pt(x, y, false), R = () => pt(x + 1, y, true), Bm = () => pt(x, y + 1, false), Lf = () => pt(x, y, true);
        const S = L.segs;
        switch (cs) {
          case 1:
          case 14:
            S.push([Lf(), Bm()]);
            break;
          case 2:
          case 13:
            S.push([Bm(), R()]);
            break;
          case 3:
          case 12:
            S.push([Lf(), R()]);
            break;
          case 4:
          case 11:
            S.push([T(), R()]);
            break;
          case 6:
          case 9:
            S.push([T(), Bm()]);
            break;
          case 7:
          case 8:
            S.push([Lf(), T()]);
            break;
          case 5:
          case 10: {
            const ctr = (a0 + b0 + c0 + d0) / 4 > level;
            if (cs === 5 === ctr) {
              S.push([Lf(), T()]);
              S.push([Bm(), R()]);
            } else {
              S.push([Lf(), Bm()]);
              S.push([T(), R()]);
            }
            break;
          }
        }
      }
    }
    return per.map(({ segs, P: P6 }) => {
      const at = /* @__PURE__ */ new Map();
      segs.forEach((s, i) => {
        for (const k of s) {
          const l = at.get(k);
          if (l) l.push(i);
          else at.set(k, [i]);
        }
      });
      const used = new Uint8Array(segs.length), lines = [];
      for (let i0 = 0; i0 < segs.length; i0++) {
        if (used[i0]) continue;
        used[i0] = 1;
        const chain = [segs[i0][0], segs[i0][1]];
        for (const dir of [1, 0]) {
          for (; ; ) {
            const end = dir ? chain[chain.length - 1] : chain[0];
            const nb = (at.get(end) || []).find((j) => !used[j]);
            if (nb === void 0) break;
            used[nb] = 1;
            const s = segs[nb], nxt = s[0] === end ? s[1] : s[0];
            if (dir) chain.push(nxt);
            else chain.unshift(nxt);
          }
        }
        lines.push(chain.map((k) => P6.get(k)));
      }
      return lines.sort((p, q) => q.length - p.length);
    });
  }
  var Buckets;
  var init_field = __esm({
    "js/field.js"() {
      Buckets = class {
        constructor(W, H, cell) {
          this.cell = cell;
          this.cw = Math.ceil(W / cell) + 1;
          this.ch = Math.ceil(H / cell) + 1;
          this.b = new Array(this.cw * this.ch);
          this.xs = [];
          this.ys = [];
        }
        add(x, y, id) {
          const k = Math.floor(y / this.cell) * this.cw + Math.floor(x / this.cell);
          (this.b[k] || (this.b[k] = [])).push(id);
          this.xs[id] = x;
          this.ys[id] = y;
        }
        near(x, y, r) {
          const c = this.cell, x0 = Math.floor((x - r) / c), x1 = Math.floor((x + r) / c), y0 = Math.floor((y - r) / c), y1 = Math.floor((y + r) / c), r2 = r * r;
          for (let gy = Math.max(0, y0); gy <= Math.min(this.ch - 1, y1); gy++) for (let gx = Math.max(0, x0); gx <= Math.min(this.cw - 1, x1); gx++) {
            const l = this.b[gy * this.cw + gx];
            if (!l) continue;
            for (const id of l) {
              const dx = this.xs[id] - x, dy = this.ys[id] - y;
              if (dx * dx + dy * dy < r2) return true;
            }
          }
          return false;
        }
      };
    }
  });

  // js/lay.js
  function* laySteps(regions5, outlines, { W, H, q, s, seed = 7, grout = 0.17, panel, clip, pre = [] }) {
    const PANEL = panel;
    const N = W * H, nR = regions5.length, rnd = mulberry32(seed);
    const lab = new Int16Array(N).fill(-1);
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    const c = cv.getContext("2d", { willReadFrequently: true });
    for (let i = 0; i < nR; i++) {
      const r = regions5[i];
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, W, H);
      c.setTransform(q, 0, 0, q, -PANEL.x0 * q, -PANEL.y0 * q);
      c.save();
      if (r.clip && clip) {
        c.beginPath();
        clip(c);
        c.clip();
      }
      c.beginPath();
      r.draw(c);
      c.fillStyle = "#000";
      c.fill();
      c.lineWidth = 1.4 / q;
      c.lineJoin = "round";
      c.strokeStyle = "#000";
      c.stroke();
      c.restore();
      const a = c.getImageData(0, 0, W, H).data;
      for (let p = 0; p < N; p++) if (a[p * 4 + 3] >= 128) lab[p] = i;
      if (i % 4 === 3) yield;
    }
    const box = regions5.map(() => [W, H, -1, -1]), area = new Int32Array(nR);
    for (let p = 0; p < N; p++) {
      const l = lab[p];
      if (l < 0) continue;
      area[l]++;
      const x = p % W, y = p / W | 0, b = box[l];
      if (x < b[0]) b[0] = x;
      if (y < b[1]) b[1] = y;
      if (x > b[2]) b[2] = x;
      if (y > b[3]) b[3] = y;
    }
    yield;
    const setOf = (names) => {
      const S = new Uint8Array(nR + 1);
      for (const n of names) {
        if (n === "outside") S[0] = 1;
        regions5.forEach((r, i) => {
          if (r.name === n || r.group === n) S[i + 1] = 1;
        });
      }
      return S;
    };
    const maskOf = (S) => {
      const m = new Uint8Array(N);
      for (let p = 0; p < N; p++) m[p] = S[lab[p] + 1];
      return m;
    };
    const boxOf = (S) => {
      const b = [W, H, -1, -1];
      regions5.forEach((r, i) => {
        if (S[i + 1] && area[i]) {
          const o = box[i];
          b[0] = Math.min(b[0], o[0]);
          b[1] = Math.min(b[1], o[1]);
          b[2] = Math.max(b[2], o[2]);
          b[3] = Math.max(b[3], o[3]);
        }
      });
      return [b[0] - 2, b[1] - 2, b[2] + 2, b[3] + 2];
    };
    const stones = [], B2 = new Buckets(W, H, s);
    const free = (x, y, r) => !B2.near(x, y, r);
    const add = (x, y, a, l, w, k, reg, ls, row = 0) => {
      const id = stones.length;
      stones.push({ x, y, a, l, w, k, reg, s: ls, row, h: rnd(), h2: rnd() });
      B2.add(x, y, id);
      return id;
    };
    const labAt = (x, y) => lab[Math.min(H - 1, Math.max(0, y | 0)) * W + Math.min(W - 1, Math.max(0, x | 0))];
    for (const p of pre) {
      const r0 = s * 0.7;
      if ([[0, 0], [r0, 0], [-r0, 0], [0, r0], [0, -r0]].some(([dx, dy]) => labAt(p.x + dx, p.y + dy) !== p.reg) || !free(p.x, p.y, Math.min(p.l, p.w) * 0.7)) continue;
      const id = add(p.x, p.y, p.a, p.l, p.w, 2, p.reg, p.s || s, -1);
      Object.assign(stones[id], p.extra || {});
    }
    const zone = new Uint8Array(N), zoneD = new Float32Array(N).fill(1e9);
    const so = s * 0.9;
    for (const o of outlines) {
      const I = setOf(o.inside), A = setOf(o.against), bI = boxOf(I);
      if (bI[2] < bI[0]) continue;
      const M = Math.ceil(s * 3), cx0 = Math.max(0, bI[0] - M), cy0 = Math.max(0, bI[1] - M), cx1 = Math.min(W - 1, bI[2] + M), cy1 = Math.min(H - 1, bI[3] + M);
      const cw = cx1 - cx0 + 1, ch = cy1 - cy0 + 1, CN = cw * ch, mA = new Uint8Array(CN), mI = new Uint8Array(CN);
      for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
        const l = lab[(y + cy0) * W + x + cx0];
        mA[y * cw + x] = A[l + 1];
        mI[y * cw + x] = I[l + 1];
      }
      const dA = distanceField(mA, cw, ch);
      for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
        const k = y * cw + x, p = (y + cy0) * W + x + cx0;
        if (mI[k] && dA[k] < so * 0.84) {
          zone[p] = 1;
          if (dA[k] < zoneD[p]) zoneD[p] = dA[k];
        }
      }
      const lines = contours(dA, cw, ch, so * 0.5, mI, null).sort((p, q2) => q2.length - p.length);
      for (const ln0 of lines) walk(ln0.map(([x, y]) => [x + cx0, y + cy0]), () => so, 0.86, (x, y, a) => {
        if (!I[labAt(x, y) + 1] || !free(x, y, so * 0.55)) return;
        add(x, y, a, so * 0.8, so * 0.66, 0, -2, so);
      });
      yield;
    }
    for (let i = 0; i < nR; i++) {
      const r = regions5[i];
      if (!area[i] || r.skip) continue;
      const sR = s * (r.fine || 1);
      const M = Math.ceil(r.src === "self" || r.src === "courses" ? s * 2 : s * 14);
      const cx0 = Math.max(0, box[i][0] - M), cy0 = Math.max(0, box[i][1] - M), cx1 = Math.min(W - 1, box[i][2] + M), cy1 = Math.min(H - 1, box[i][3] + M);
      const cw = cx1 - cx0 + 1, ch = cy1 - cy0 + 1, CN = cw * ch;
      const src = new Uint8Array(CN), m = new Uint8Array(CN);
      const S = Array.isArray(r.src) ? setOf(r.src) : null;
      for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
        const l = lab[(y + cy0) * W + x + cx0], k = y * cw + x;
        if (l === i) m[k] = 1;
        if (r.src === "self") src[k] = l !== i ? 1 : 0;
        else if (S) src[k] = S[l + 1];
      }
      if (r.src === "self") {
        for (let x = 0; x < cw; x++) {
          src[x] = 1;
          src[CN - cw + x] = 1;
        }
        for (let y = 0; y < ch; y++) {
          src[y * cw] = 1;
          src[y * cw + cw - 1] = 1;
        }
      }
      if (r.src === "courses") {
        const yy = Math.max(0, box[i][1] - 1 - cy0);
        for (let x = 0; x < cw; x++) src[yy * cw + x] = 1;
      }
      let any = 0;
      for (let k = 0; k < CN; k++) if (src[k]) {
        any = 1;
        break;
      }
      if (!any) for (let k = 0; k < CN; k++) src[k] = m[k] ? 0 : 1;
      if (r.halo) {
        const hs = new Uint8Array(CN);
        for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
          const l = lab[(y + cy0) * W + x + cx0];
          hs[y * cw + x] = l !== i && l >= 0 ? 1 : 0;
        }
        const dh = distanceField(hs, cw, ch);
        for (let k = 0; k < r.halo; k++) {
          const lines = contours(dh, cw, ch, (k + 0.5) * sR, m, null).sort((p, q2) => q2.length - p.length);
          for (const ln0 of lines) walk(ln0.map(([x, y]) => [x + cx0, y + cy0]), () => sR, 0.98, (x, y, a) => {
            if (labAt(x, y) !== i || zone[(y | 0) * W + (x | 0)] || !free(x, y, sR * 0.78)) return;
            add(x, y, a, sR * 0.94, sR * 0.84, 1, i, sR, -10 - k);
          });
        }
        yield;
      }
      const d = distanceField(src, cw, ch);
      let maxD = 0;
      for (let k = 0; k < CN; k++) if (m[k] && d[k] > maxD) maxD = d[k];
      const nK = Math.ceil(maxD / sR + 0.5), levels = contourLevels(d, cw, ch, sR, nK, m);
      for (let k = 0; k < nK; k++) {
        const lines = levels[k];
        for (const ln0 of lines) {
          const ln = ln0.map(([x, y]) => [x + cx0, y + cy0]);
          walk(ln, () => sR, 0.98, (x, y, a) => {
            if (labAt(x, y) !== i || zone[(y | 0) * W + (x | 0)] || !free(x, y, sR * 0.78)) return;
            add(x, y, a, sR * 0.94, sR * 0.84, 1, i, sR, k);
          });
        }
        if (k % 6 === 5) yield;
      }
      yield;
    }
    const nearAngle = (x, y, R) => {
      let best = -1, bd = 1e9;
      const cell = B2.cell, gx = Math.floor(x / cell), gy = Math.floor(y / cell);
      for (let yy = gy - 1; yy <= gy + 1; yy++) for (let xx = gx - 1; xx <= gx + 1; xx++) {
        if (xx < 0 || yy < 0 || xx >= B2.cw || yy >= B2.ch) continue;
        const l = B2.b[yy * B2.cw + xx];
        if (!l) continue;
        for (const id of l) {
          const st = stones[id];
          if (st.reg !== R) continue;
          const dd = (st.x - x) ** 2 + (st.y - y) ** 2;
          if (dd < bd) {
            bd = dd;
            best = id;
          }
        }
      }
      return best >= 0 ? stones[best].a : 0;
    };
    for (const [size, gap] of [[0.72, 0.58], [0.52, 0.42]]) {
      const cov = coverage(stones, W, H, 1.04);
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
        const p = y * W + x, l = lab[p];
        if (l < 0 || cov[p] || !zone[p] && regions5[l].skip) continue;
        if (zone[p]) {
          if (zoneD[p] < so * 0.6 && free(x + 0.5, y + 0.5, so * 0.74) && B2.near(x + 0.5, y + 0.5, so * 1.7)) add(x + 0.5, y + 0.5, nearAngle(x, y, -2), so * 0.8, so * 0.66, 0, -2, so);
          continue;
        }
        const sR = s * (regions5[l].fine || 1);
        if (!free(x + 0.5, y + 0.5, sR * gap)) continue;
        add(x + 0.5, y + 0.5, nearAngle(x, y, l), sR * size, sR * size * 0.9, 3, l, sR, 99);
      }
      yield;
    }
    const kept = yield* fit(stones, lab, zone, W, H, s, grout, Uint8Array.from(regions5, (r) => r.skip ? 1 : 0));
    for (const t of kept) {
      t.j = new Float32Array(8);
      for (let k2 = 0; k2 < 8; k2++) t.j[k2] = (rnd() - 0.5) * t.s * (t.k === 0 ? 0.05 : 0.075);
    }
    return { stones: kept, lab, W, H };
  }
  function coverage(stones, W, H, grow) {
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    const c = cv.getContext("2d", { willReadFrequently: true });
    c.fillStyle = "#000";
    for (const t of stones) {
      c.save();
      c.translate(t.x, t.y);
      c.rotate(t.a);
      c.fillRect(-t.l * grow / 2, -t.w * grow / 2, t.l * grow, t.w * grow);
      c.restore();
    }
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
      const final = pass === PASSES - 1, B2 = new Buckets(W, H, s);
      stones.forEach((t, i) => {
        B2.add(t.x, t.y, i);
        ca[i] = Math.cos(t.a);
        sa[i] = Math.sin(t.a);
        ihl[i] = 1 / Math.max(0.5, t.l / 2);
        ihw[i] = 1 / Math.max(0.5, t.w / 2);
        px0[i] = t.x;
        py0[i] = t.y;
        rg[i] = t.reg;
      });
      sx.fill(0);
      sy.fill(0);
      cnt.fill(0);
      if (final) {
        mnU.fill(1e9);
        mxU.fill(-1e9);
        mnV.fill(1e9);
        mxV.fill(-1e9);
      }
      const cell = B2.cell, cw = B2.cw, chh = B2.ch, bk = B2.b;
      for (let y = 0; y < H; y++) {
        const py = y + 0.5, gy = Math.floor(py / cell);
        for (let x = 0; x < W; x++) {
          const p = y * W + x, l = lab[p];
          if (l < 0 || skipLab[l] && !zone[p]) continue;
          const cls = zone[p] ? -2 : l, px = x + 0.5, gx = Math.floor(px / cell);
          let best = -1, bd = 1.9;
          for (let by = gy - 1; by <= gy + 1; by++) {
            if (by < 0 || by >= chh) continue;
            for (let bxx = gx - 1; bxx <= gx + 1; bxx++) {
              if (bxx < 0 || bxx >= cw) continue;
              const li = bk[by * cw + bxx];
              if (!li) continue;
              for (let q = 0; q < li.length; q++) {
                const id = li[q];
                if (rg[id] !== cls) continue;
                const dx = px - px0[id], dy = py - py0[id];
                const u = Math.abs((dx * ca[id] + dy * sa[id]) * ihl[id]), v = Math.abs((-dx * sa[id] + dy * ca[id]) * ihw[id]);
                const dd = u > v ? u : v;
                if (dd < bd) {
                  bd = dd;
                  best = id;
                }
              }
            }
          }
          if (best < 0) continue;
          cnt[best]++;
          sx[best] += px;
          sy[best] += py;
          if (final) {
            const dx = px - px0[best], dy = py - py0[best], u = dx * ca[best] + dy * sa[best], v = -dx * sa[best] + dy * ca[best];
            if (u < mnU[best]) mnU[best] = u;
            if (u > mxU[best]) mxU[best] = u;
            if (v < mnV[best]) mnV[best] = v;
            if (v > mxV[best]) mxV[best] = v;
          }
        }
      }
      if (!final) {
        for (let i = 0; i < n; i++) if (cnt[i] > 0) {
          const t = stones[i], nx = sx[i] / cnt[i], ny = sy[i] / cnt[i], m = Math.hypot(nx - t.x, ny - t.y), lim = t.s * 0.4, f = m > lim ? lim / m : 1;
          t.x += (nx - t.x) * f;
          t.y += (ny - t.y) * f;
        }
      }
      yield;
    }
    const out = [];
    for (let i = 0; i < n; i++) {
      if (cnt[i] < 2) continue;
      const t = stones[i], ls = t.s, g = ls * grout;
      const L = Math.min(mxU[i] - mnU[i] + 1 - g, ls * (t.k === 0 ? 0.86 : 1.28)), Wd = Math.min(mxV[i] - mnV[i] + 1 - g, ls * (t.k === 0 ? 0.72 : 1.08));
      if (L < ls * 0.24 || Wd < ls * 0.2) continue;
      const cu = (mxU[i] + mnU[i]) / 2, cvv = (mxV[i] + mnV[i]) / 2;
      t.x += cu * ca[i] - cvv * sa[i];
      t.y += cu * sa[i] + cvv * ca[i];
      t.l = L;
      t.w = Wd;
      out.push(t);
    }
    return out;
  }
  function corners(t, out) {
    const c = Math.cos(t.a), s = Math.sin(t.a), hl = t.l / 2, hw = t.w / 2, j = t.j;
    const P6 = [-hl, -hw, hl, -hw, hl, hw, -hl, hw];
    for (let k = 0; k < 4; k++) {
      const lx = P6[k * 2] + j[k * 2], ly = P6[k * 2 + 1] + j[k * 2 + 1];
      out[k * 2] = t.x + c * lx - s * ly;
      out[k * 2 + 1] = t.y + s * lx + c * ly;
    }
    return out;
  }
  var init_lay = __esm({
    "js/lay.js"() {
      init_field();
      init_core();
    }
  });

  // js/arch.js
  function archRegions(G) {
    const F = G.F, X0 = -G.cx / G.u - 20, X1 = (G.w - G.cx) / G.u + 20, Y0 = -G.cy / G.u - 20, Y1 = (G.h - G.cy) / G.u + 20;
    const gems = gemList(F);
    const P6 = ARCH_PAL;
    return [
      { name: "wall", group: "wall", clip: false, fine: 1.04, src: ["archivolt", "cornice"], draw: (c) => c.rect(X0, Y0, X1 - X0, Y1 - Y0), fill: () => P6.lapis },
      { name: "cornice", group: "cornice", clip: false, fine: 0.9, src: "courses", draw: (c) => c.rect(X0, F, X1 - X0, C), fill: () => P6.lapisBand },
      { name: "conch", group: "conch", clip: false, skip: true, draw: conchPath(F), fill: () => P6.gold[0] },
      { name: "archivolt", group: "archivolt", clip: false, fine: 0.86, src: ["conch"], draw: archivoltPath(F), fill: () => P6.gold[0] },
      { name: "gems", group: "archivolt", clip: false, fine: 0.62, src: "self", draw: (c) => {
        for (const g of gems) gemPath(c, g);
      }, fill: () => P6.gems[0] }
    ];
  }
  function gemList(F) {
    const total = Math.PI * (RI + B / 2) + 2 * F, n = Math.max(6, Math.round(total / GEM_STEP)), out = [];
    for (let i = 0; i < n; i++) {
      const f = (i + 0.5) / n, p = archPoint(f, F);
      if (p.y > F - 14) continue;
      out.push({ ...p, f, i, kind: i % 2, col: i % 3 });
    }
    return out;
  }
  function gemPath(c, g) {
    const a = Math.atan2(g.ny, g.nx);
    if (g.kind === 0) {
      c.moveTo(g.x + 9 * Math.cos(a), g.y + 9 * Math.sin(a));
      c.ellipse(g.x, g.y, 9, 14, a, 0, Math.PI * 2);
      c.closePath();
    } else {
      const r = 12.5;
      for (let k = 0; k < 4; k++) {
        const b = a + k * Math.PI / 2;
        const x = g.x + r * Math.cos(b), y = g.y + r * Math.sin(b);
        k ? c.lineTo(x, y) : c.moveTo(x, y);
      }
      c.closePath();
    }
  }
  function archPreStones(G, q, s, panel, regionIndex, ex) {
    const rnd = mulberry32(31), out = [], F = G.F, P6 = ARCH_PAL;
    const toS = (x, y) => [(x - panel.x0) * q, (y - panel.y0) * q];
    const su = s / q;
    const X0 = -G.cx / G.u, X1 = (G.w - G.cx) / G.u, Y0 = -G.cy / G.u, Y1 = (G.h - G.cy) / G.u;
    const wall = regionIndex("wall"), av = regionIndex("archivolt");
    const step = Math.max(64, su * 11.5);
    for (let gy = Y0 + step * 0.4; gy < Y1; gy += step * 0.87) for (let gx = X0 + step * 0.3; gx < X1; gx += step) {
      const x = gx + (rnd() - 0.5) * step * 0.8 + Math.round(gy / step) % 2 * step * 0.5, y = gy + (rnd() - 0.5) * step * 0.6;
      const dArch = y < F ? y < 0 ? Math.hypot(x, y) - RO : Math.abs(x) - RO : 1e9;
      if (y < F + C + su * 2 && y > F - su * 2) continue;
      if (y < F && dArch < su * 2.6) continue;
      if (ex.some((r) => x > r[0] && x < r[2] && y > r[1] && y < r[3])) continue;
      const roll = rnd(), size = roll < 0.36 ? 2 : roll < 0.6 ? 1 : 0;
      const col = rnd() < 0.06 ? P6.pearl : P6.gold[rnd() * 4 | 0], a0 = rnd() * Math.PI;
      const [sx, sy] = toS(x, y);
      const put = (dx, dy, l, w, a, c2 = col) => out.push({ x: sx + dx, y: sy + dy, a, l, w, reg: wall, extra: { col: c2, mat: c2 === P6.pearl ? MAT.SILVER : MAT.GOLD, star: true } });
      put(0, 0, s * (size ? 0.86 : 0.7), s * (size ? 0.86 : 0.7), a0);
      if (size >= 1) for (let k = 0; k < 4; k++) {
        const b = a0 + k * Math.PI / 2;
        put(Math.cos(b) * s * 0.98, Math.sin(b) * s * 0.98, s * 0.78, s * 0.5, b);
      }
      if (size === 2) for (let k = 0; k < 4; k++) {
        const b = a0 + Math.PI / 4 + k * Math.PI / 2;
        put(Math.cos(b) * s * 1.02, Math.sin(b) * s * 1.02, s * 0.5, s * 0.4, b);
      }
    }
    const gems = gemList(F), total = Math.PI * (RI + B / 2) + 2 * F;
    for (let i = 0; i < gems.length; i++) {
      const g = gems[i], f = g.f + 0.5 / Math.max(6, Math.round(total / GEM_STEP));
      const p = archPoint(f, F);
      if (p.y > F - 10) continue;
      const [sx, sy] = toS(p.x, p.y);
      out.push({ x: sx, y: sy, a: Math.atan2(p.ny, p.nx), l: s * 0.8, w: s * 0.8, reg: av, extra: { col: P6.pearl, mat: MAT.SILVER, pearl: true } });
    }
    return out;
  }
  function finishArch(stones, regions5, G, su) {
    const P6 = ARCH_PAL, F = G.F, rnd = mulberry32(77);
    const gems = gemList(F);
    for (const t of stones) {
      if (t.col) continue;
      if (t.k === 0) {
        t.col = P6.outline;
        t.mat = MAT.NONE;
        continue;
      }
      const r = regions5[t.reg], x = t.ux, y = t.uy;
      if (r.name === "wall") {
        const d = y < F ? y < 0 ? Math.hypot(x, y) - RO : Math.abs(x) - RO : (y - F - C) * 1.4 + 40;
        let c = mix(P6.lapisLit, P6.lapis, smooth(0, 150, d));
        c = mix(c, P6.lapisDeep, smooth(150, 700, d) * 0.7 + smooth(0.55, 0.8, fbm(x / 160, y / 160, 3, 3)) * 0.25);
        if (rnd() < 0.05) c = mix(c, rgb("#3a56a8"), 0.5);
        else if (rnd() < 0.05) c = mix(c, P6.lapisDeep, 0.6);
        t.col = c;
        t.mat = MAT.GLASS;
      } else if (r.name === "cornice") {
        const v = (y - F) / C;
        if (v < 0.2 || v > 0.8) {
          t.col = P6.gold[t.h * 4 | 0];
          t.mat = MAT.GOLD;
        } else {
          t.col = mix(P6.lapisBand, P6.lapisDeep, 0.25 * t.h2);
          t.mat = MAT.GLASS;
        }
      } else if (r.name === "gems") {
        let g = gems[0], bd = 1e9;
        for (const o of gems) {
          const dd = (o.x - x) ** 2 + (o.y - y) ** 2;
          if (dd < bd) {
            bd = dd;
            g = o;
          }
        }
        t.col = mix(P6.gems[g.col], [255, 255, 255], t.h > 0.8 ? 0.18 : 0);
        t.mat = MAT.GEM;
      } else if (r.name === "archivolt") {
        const d = archDepth(x, y < F ? y : Math.min(y, 0));
        const dd = y >= 0 ? Math.abs(x) - RI : d;
        if (dd > B - su * 1.05) {
          t.col = mix(P6.cream, P6.creamShade, t.h2 * 0.6);
          t.mat = MAT.NONE;
        } else {
          t.col = P6.gold[t.h * 4 | 0];
          t.mat = MAT.GOLD;
        }
      } else {
        t.col = P6.lapis;
        t.mat = MAT.GLASS;
      }
    }
    return stones;
  }
  var ARCH_PAL, MAT, GEM_STEP, ARCH_OUTLINES;
  var init_arch = __esm({
    "js/arch.js"() {
      init_core();
      init_geom();
      ARCH_PAL = {
        lapis: rgb("#213573"),
        lapisLit: rgb("#2c4590"),
        lapisDeep: rgb("#152250"),
        lapisBand: rgb("#1b2c63"),
        gold: [rgb("#cfa148"), rgb("#ddb75e"), rgb("#b5883a"), rgb("#e6c672")],
        outline: rgb("#231d18"),
        cream: rgb("#efe5cc"),
        creamShade: rgb("#d8cbac"),
        red: rgb("#9e2f2a"),
        gems: [rgb("#b8262f"), rgb("#257a58"), rgb("#2a56a8")],
        pearl: rgb("#f4efe2"),
        grout: rgb("#4a4438")
      };
      MAT = { NONE: 0, GOLD: 1, GLASS: 2, SILVER: 3, GEM: 4 };
      GEM_STEP = 74;
      ARCH_OUTLINES = [
        { inside: ["archivolt", "gems"], against: ["conch"] },
        { inside: ["cornice"], against: ["conch", "archivolt", "wall"] }
      ];
    }
  });

  // js/desk.js
  function deskLayout(A) {
    const s = A.sd, t = A.t;
    const X = (lx) => lx * s, Y = (ly) => A.deskY + ly * s;
    const P6 = (lx, ly) => [X(lx), Y(ly)];
    const pts = (arr) => arr.map(([a, b]) => P6(a, b));
    const th = lerp(52, 60, t) * Math.PI / 180, mount = [lerp(266, 258, t), -112], len = lerp(132, 128, t);
    const d = [Math.cos(th), -Math.sin(th)];
    const E = [mount[0] - d[0] * 56, mount[1] - d[1] * 56], O = [mount[0] + d[0] * len, mount[1] + d[1] * len];
    const at = (k) => [mount[0] + d[0] * k, mount[1] + d[1] * k];
    const lampHead = [-156, -262], sh = (() => {
      const a = [0.3, 1], l = Math.hypot(...a);
      return [a[0] / l, a[1] / l];
    })();
    const shN = [-sh[1], sh[0]], mouth = [lampHead[0] + sh[0] * 74, lampHead[1] + sh[1] * 74];
    return { s, X, Y, P: P6, pts, d, E, O, at, mount, th, lampHead, sh, shN, mouth };
  }
  function deskRegions(R, L, A) {
    const D = DESK_PAL, K = deskLayout(A), { X, Y, P: P6, pts, d } = K, s = A.sd;
    const tint = (c) => [c[0] * L.tint[0], c[1] * L.tint[1], c[2] * L.tint[2]].map((v) => Math.min(255, v));
    const lamp = L.lamp || 0;
    const lampPool = (x, y) => lamp * (1 - smooth(30 * s, 250 * s, Math.hypot(x - X(K.mouth[0]), (y - Y(-20)) * 1.8)));
    const warm = (c, x, y) => mix(tint(c), [255, 206, 128], 0.5 * lampPool(x, y));
    const local = (x, y) => [x / s, (y - A.deskY) / s];
    R(
      "deskLegs",
      "desk",
      union(poly(pts([[-324, 44], [-296, 44], [-299, LEG], [-319, LEG]])), poly(pts([[296, 44], [324, 44], [319, LEG], [299, LEG]]))),
      (x, y) => warm(mix(D.leg, D.walnutDeep, smooth(-12, 14, Math.abs(local(x, y)[0]) - 310)), x, y),
      { fine: 0.8, src: "courses" }
    );
    R("deskApron", "desk", rect(X(-326), Y(17), X(652), 30 * s), (x, y) => {
      const [lx, ly] = local(x, y);
      if (Math.hypot(lx, ly - 33) < 5.5) return tint(D.brass);
      if (Math.abs(lx) < 84 && Math.abs(lx) > 76 || Math.abs(lx) < 84 && (ly < 23 || ly > 43)) return warm(D.walnutDeep, x, y);
      return warm(mix(D.walnutFront, D.walnutDeep, 0.25), x, y);
    }, { fine: 0.76, src: "courses" });
    R("deskFront", "desk", rect(X(-344), Y(0), X(688), 18 * s), (x, y) => warm(D.walnutFront, x, y), { fine: 0.76, src: "courses" });
    R("deskTop", "desk", poly(pts([[-356, -15], [356, -15], [344, 0.5], [-344, 0.5]])), (x, y) => {
      const [lx] = local(x, y);
      return warm(mix(D.walnutTopLit, D.walnutTop, smooth(-300, 300, lx) * 0.6), x, y);
    }, { fine: 0.74, src: "courses" });
    if (lamp > 0.5) {
      const m0 = K.mouth, rays = [];
      for (let k = -2; k <= 2; k++) {
        const a = Math.atan2(K.sh[1], K.sh[0]) + k * 0.2, len = 150 + 40 * (1 - Math.abs(k) / 2);
        const ex = m0[0] + Math.cos(a) * len, ey = Math.min(-4, m0[1] + Math.sin(a) * len);
        rays.push(bar(...P6(m0[0] + Math.cos(a) * 14, m0[1] + Math.sin(a) * 14), ...P6(ex, ey), (9 - Math.abs(k) * 1.5) * s));
      }
      R("lampRays", "rays", union(...rays), (x, y) => mix(C2("#f6d77e"), C2("#e9b54e"), smooth(Y(K.mouth[1]), Y(0), y)), { fine: 0.55, mat: MAT.GOLD, flat: true, live: "bulb" });
    }
    const CH = -16;
    R("chairBase", "chair", union(bar(...P6(CH - 4, 127), ...P6(CH - 86, 141), 8 * s), bar(...P6(CH + 4, 127), ...P6(CH + 82, 141), 8 * s), bar(...P6(CH, 126), ...P6(CH, 143), 8 * s), rect(X(CH - 8), Y(96), 16 * s, 32 * s)), () => tint(D.frame), { fine: 0.56 });
    R("chairWheels", "chair", union(disc(...P6(CH - 88, 144), 7 * s), disc(...P6(CH + 84, 144), 7 * s), disc(...P6(CH, 146), 7 * s)), () => tint(D.chrome), { fine: 0.5 });
    R("chairSeat", "chair", union(poly(pts([[CH - 96, 80], [CH + 96, 80], [CH + 90, 100], [CH - 90, 100]])), rect(X(CH - 104), Y(54), 10 * s, 34 * s), rect(X(CH + 94), Y(54), 10 * s, 34 * s)), (x, y) => warm(mix(D.meshLit, D.mesh, smooth(Y(80), Y(100), y)), x, y), { fine: 0.6 });
    R("chairBack", "chair", (c) => {
      const x0 = X(CH - 82), x1 = X(CH + 82), y0 = Y(10), y1 = Y(74), r = 18 * s;
      c.moveTo(x0 + r, y0);
      c.lineTo(x1 - r, y0);
      c.quadraticCurveTo(x1, y0, x1, y0 + r);
      c.lineTo(x1 - 6 * s, y1);
      c.lineTo(x0 + 6 * s, y1);
      c.lineTo(x0, y0 + r);
      c.quadraticCurveTo(x0, y0, x0 + r, y0);
      c.closePath();
    }, (x, y) => {
      const [lx, ly] = local(x, y), edge = Math.min(lx - (CH - 82), CH + 82 - lx, ly - 10, 74 - ly);
      if (edge < 7) return tint(D.frame);
      return warm(mix(D.meshLit, D.mesh, smooth(-60, 60, lx - CH) * 0.6 + (Math.floor(lx / 9) + Math.floor(ly / 9)) % 2 * 0.12), x, y);
    }, { fine: 0.6 });
    const BOOKS = [[-238, -112, -21, 0, 0], [-228, -118, -39, -21, 1], [-242, -122, -57, -39, 2], [-224, -132, -72, -57, 3]];
    const bookAt = (x, y) => {
      const [lx, ly] = local(x, y);
      return [lx, ly, BOOKS.find(([, , y0, y1]) => ly >= y0 - 0.5 && ly <= y1 + 0.5) || BOOKS[0]];
    };
    const gilt = (x, y) => {
      const [lx, ly, b] = bookAt(x, y);
      return Math.abs(ly - (b[2] + b[3]) / 2) < 2.8 && lx > b[0] + 12 && lx < b[1] - 12;
    };
    R("books", "books", union(...BOOKS.map(([x0, x1, y0, y1]) => poly(pts([[x0, y0], [x1, y0], [x1, y1], [x0, y1]])))), (x, y) => {
      const [lx, , b] = bookAt(x, y);
      if (gilt(x, y)) return tint(D.brass);
      return warm(mix(D.books[b[4]], [20, 18, 22], smooth(b[0] + 70, b[1] + 6, lx) * 0.3), x, y);
    }, { fine: 0.56, src: "courses", flat: true, matAt: (x, y) => gilt(x, y) ? MAT.GOLD : 0 });
    R("lampBase", "lamp", union(poly(pts([[-324, 0.5], [-240, 0.5], [-248, -10], [-316, -10]])), disc(...P6(-282, -12), 12 * s)), (x, y) => warm(mix(D.redDeep, D.red, 0.35), x, y), { fine: 0.7 });
    R("lampArms", "lamp", union(bar(...P6(-282, -12), ...P6(-244, -226), 12 * s), bar(...P6(-244, -226), ...K.lampHead.map((v, i) => i ? Y(v) : X(v)), 11 * s)), (x, y) => warm(mix(D.red, D.redDeep, 0.2), x, y), { fine: 0.62 });
    R("lampJoints", "lamp", union(disc(...P6(-244, -226), 10 * s), disc(...P6(...K.lampHead), 9 * s)), () => tint(D.iron), { fine: 0.58 });
    const sp = (k, w) => [K.lampHead[0] + K.sh[0] * k + K.shN[0] * w, K.lampHead[1] + K.sh[1] * k + K.shN[1] * w];
    R("lampShade", "lamp", poly(pts([sp(2, 18), sp(2, -18), sp(74, -45), sp(74, 45)])), (x, y) => {
      const [lx, ly] = local(x, y), v = (lx - K.lampHead[0]) * K.shN[0] + (ly - K.lampHead[1]) * K.shN[1];
      return tint(mix(D.redLit, D.redDeep, smooth(-30, 40, -v)));
    }, { fine: 0.66 });
    R("lampBulb", "lamp", poly(pts([sp(70, -42), sp(70, 42), sp(80, 34), sp(80, -34)])), () => lamp > 0.2 ? mix(D.bulb, [255, 255, 255], 0.2 * lamp) : tint(D.redDeep), { fine: 0.5, live: lamp > 0.2 ? "bulb" : null, flat: true });
    R("laptopBase", "laptop", poly(pts([[-120, 0.5], [120, 0.5], [110, -10], [-110, -10]])), (x, y) => warm(mix(D.aluLit, D.aluShade, smooth(-120, 120, local(x, y)[0]) * 0.7), x, y), { fine: 0.6, src: "courses" });
    R("laptopLid", "laptop", rect(X(-104), Y(-154), 208 * s, 144 * s), (x, y) => {
      const [lx, ly] = local(x, y);
      if (lx < -95 || lx > 95 || ly < -145 || ly > -18) return tint(D.bezel);
      return mix(mix(D.screen, D.screenDeep, smooth(-145, -18, ly) * 0.5), C2("#2c5394"), 0.5 * (L.night || 0));
    }, { fine: 0.66, src: "courses" });
    const codeRects = [];
    CODE.forEach((line, i) => line.forEach(([a, b, col]) => codeRects.push([-86 + a, -136 + i * 14.5, Math.min(b - a, 176 - a), 7.5, col])));
    R("code", "laptop", union(...codeRects.map(([x0, y0, w, h]) => rect(X(x0), Y(y0), w * s, h * s))), (x, y) => {
      const [lx, ly] = local(x, y);
      const r = codeRects.find(([x0, y0, w, h]) => lx >= x0 - 1 && lx <= x0 + w + 1 && ly >= y0 - 1.5 && ly <= y0 + h + 1.5) || codeRects[0];
      return mix(D.code[r[4]], [255, 255, 255], 0.08 + 0.12 * (L.night || 0));
    }, { fine: 0.5, src: "courses", live: "code", flat: true });
    R("robotLegs", "robot", union(rect(X(156), Y(-30), 14 * s, 30.5 * s), rect(X(184), Y(-30), 14 * s, 30.5 * s)), () => tint(D.cobaltDeep), { fine: 0.56 });
    R("robotArms", "robot", union(rect(X(132), Y(-78), 12 * s, 38 * s), rect(X(210), Y(-78), 12 * s, 38 * s)), () => tint(D.cobaltDeep), { fine: 0.56 });
    R("robotBody", "robot", rect(X(144), Y(-84), 66 * s, 56 * s), (x, y) => {
      const [lx, ly] = local(x, y);
      if (lx > 164 && lx < 190 && ly > -70 && ly < -48) return tint(mix(D.eye, D.cobaltLit, 0.25));
      return tint(mix(D.cobaltLit, D.cobalt, smooth(150, 200, lx)));
    }, { fine: 0.6 });
    R("robotHead", "robot", rect(X(126), Y(-158), 92 * s, 72 * s), (x, y) => warm(mix(D.cobaltLit, D.cobalt, smooth(140, 210, local(x, y)[0]) * 0.9), x, y), { fine: 0.6 });
    R("robotEar", "robot", rect(X(218), Y(-134), 11 * s, 26 * s), () => tint(D.ear), { fine: 0.5 });
    R("robotEyes", "robotEye", union(disc(...P6(150, -122), 14.5 * s), disc(...P6(192, -122), 14.5 * s)), () => tint(D.eye), { fine: 0.5, live: "eye", flat: true });
    R("robotPupils", "robotEye", union(disc(...P6(153, -120), 6.5 * s), disc(...P6(195, -120), 6.5 * s)), () => D.pupil, { fine: 0.48, live: "eye", flat: true });
    const legTop = K.mount;
    R("teleLegs", "tele", union(bar(...P6(...legTop), ...P6(legTop[0] - 40, 0), 7 * s), bar(...P6(...legTop), ...P6(legTop[0] + 36, 0), 7 * s), bar(...P6(...legTop), ...P6(legTop[0] + 4, 0), 6 * s)), () => tint(D.iron), { fine: 0.54 });
    const tubeFill = (x, y) => {
      const [lx, ly] = local(x, y), v = (lx - K.mount[0]) * -d[1] + (ly - K.mount[1]) * -d[0];
      return warm(v < -8 ? mix(D.tubeLit, D.tube, smooth(-16, -8, v)) : mix(D.tube, D.tubeShade, smooth(-4, 16, v)), x, y);
    };
    R("teleTube", "tele", bar(...P6(...K.E), ...P6(...K.at(K.O === null ? 0 : Math.hypot(K.O[0] - K.mount[0], K.O[1] - K.mount[1]) - 28)), 32 * s), tubeFill, { fine: 0.6 });
    const lenO = Math.hypot(K.O[0] - K.mount[0], K.O[1] - K.mount[1]);
    R("teleCap", "tele", bar(...P6(...K.at(lenO - 30)), ...P6(...K.at(lenO)), 40 * s), tubeFill, { fine: 0.6 });
    R("teleBrass", "teleB", union(bar(...P6(...K.at(-36)), ...P6(...K.at(-28)), 34 * s), bar(...P6(...K.at(-6)), ...P6(...K.at(6)), 35 * s), bar(...P6(...K.at(-70)), ...P6(...K.at(-56)), 15 * s)), () => tint(D.brass), { fine: 0.5, mat: MAT.GOLD, flat: true });
    R("teleLens", "teleB", bar(...P6(...K.at(lenO)), ...P6(...K.at(lenO + 4)), 38 * s), () => D.lens, { fine: 0.5, mat: MAT.GLASS, flat: true });
    return K;
  }
  function deskShadow(A, x, y) {
    const s = A.sd, gy = A.ground;
    const under = smooth(330 * s, 280 * s, Math.abs(x)) * smooth(gy - 70 * s, gy - 4 * s, y) * smooth(gy + 14 * s, gy + 2 * s, y);
    const chair = Math.exp(-(((x + 16 * s) / (110 * s)) ** 2) - ((y - gy) / (9 * s)) ** 2);
    return Math.min(1, under * 0.55 + chair * 0.45);
  }
  function deskOutlines(behind) {
    return [
      { inside: ["desk"], against: behind },
      { inside: ["books"], against: [...behind, "desk", "lamp", "rays"] },
      { inside: ["lamp"], against: [...behind, "desk", "rays"] },
      { inside: ["laptop"], against: [...behind, "desk"] },
      { inside: ["robot"], against: [...behind, "desk", "laptop"] },
      { inside: ["tele", "teleB"], against: [...behind, "desk", "robot"] },
      { inside: ["chair"], against: [...behind, "desk"] }
    ];
  }
  function deskLive(s, F, L) {
    if (s.liveKind === "eye") {
      const ph = (F.time + 1.3) % 5.2;
      if (ph < 0.16) return DESK_PAL.cobalt;
      return null;
    }
    if (s.liveKind === "code" && s.cursor) return Math.sin(F.time * 5.2) > 0 ? null : DESK_PAL.screen;
    if (s.liveKind === "bulb") return mix(s.col, [255, 255, 255], 0.12 * (0.5 + 0.5 * Math.sin(F.time * 1.7 + s.h * 9)));
    return null;
  }
  var C2, DESK_PAL, CODE, deskLiveKind;
  var init_desk = __esm({
    "js/desk.js"() {
      init_core();
      init_geom();
      init_arch();
      C2 = (s) => rgb(s);
      DESK_PAL = {
        walnutTop: C2("#a8743f"),
        walnutTopLit: C2("#c48c52"),
        walnutFront: C2("#6b4428"),
        walnutDeep: C2("#4b2f1c"),
        leg: C2("#5e3c24"),
        brass: C2("#d9a948"),
        brassDark: C2("#9a7128"),
        alu: C2("#d3d6da"),
        aluShade: C2("#a9aeb5"),
        aluLit: C2("#eceef0"),
        bezel: C2("#26292f"),
        screen: C2("#132447"),
        screenDeep: C2("#0e1a35"),
        code: [C2("#e8c46a"), C2("#63c6b4"), C2("#ea8f8a"), C2("#d4dcea")],
        mesh: C2("#2c2f36"),
        meshLit: C2("#474c56"),
        frame: C2("#1b1d21"),
        chrome: C2("#9aa1aa"),
        cobalt: C2("#2f62bf"),
        cobaltLit: C2("#4f84dc"),
        cobaltDeep: C2("#1f448f"),
        eye: C2("#f6f2e6"),
        pupil: C2("#17191e"),
        ear: C2("#d64a35"),
        tube: C2("#2f6f80"),
        tubeShade: C2("#1b4452"),
        tubeLit: C2("#5aa0ad"),
        iron: C2("#3b3431"),
        lens: C2("#2a4a6a"),
        red: C2("#cf452c"),
        redLit: C2("#ea6a45"),
        redDeep: C2("#962f1d"),
        bulb: C2("#ffe7a6"),
        books: [C2("#2c4f92"), C2("#d29e3a"), C2("#a7342b"), C2("#3b6c4f")],
        pages: C2("#efe4c8")
      };
      CODE = [
        // [x0, x1, colour] from the screen's left edge, one line each
        [[0, 56, 0], [64, 118, 3]],
        [[14, 52, 1], [60, 136, 3]],
        [[28, 78, 2], [86, 150, 3]],
        [[28, 104, 3]],
        [[14, 44, 1], [52, 112, 0]],
        [[28, 128, 3]],
        [[0, 34, 0], [42, 76, 3]],
        [[0, 9, 3]]
      ];
      deskLiveKind = (t, r) => {
        if (r.live === "eye") return "eye";
        if (r.live === "bulb") return "bulb";
        if (r.live === "code") {
          const lx = t.ux;
          return "code";
        }
        return null;
      };
    }
  });

  // js/glint.js
  function createGlint(canvas) {
    let gl = null;
    try {
      gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false, preserveDrawingBuffer: false });
    } catch (e) {
      gl = null;
    }
    if (!gl) return null;
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram();
    try {
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog);
    } catch (e) {
      console.warn(e);
      return null;
    }
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);
    const A = (n) => gl.getAttribLocation(prog, n), U = (n) => gl.getUniformLocation(prog, n);
    const at = { pos: A("aPos"), cen: A("aCen"), n: A("aN"), b: A("aB"), col: A("aCol"), mat: A("aMat") };
    const un = { res: U("uRes"), mode: U("uMode"), lo: U("uLo"), hi: U("uHi"), light: U("uLight"), view: U("uView"), gain: U("uGain") };
    const bufs = /* @__PURE__ */ new Map();
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const STRIDE = 13;
    return {
      /** stones: [{ c: Float32Array(8) corners in device px, cx, cy, nx, ny, col: [r,g,b], mat, w8 }] */
      upload(key, stones) {
        const old = bufs.get(key);
        if (old) gl.deleteBuffer(old.buf);
        const data = new Float32Array(stones.length * 6 * STRIDE);
        let o = 0;
        for (const s of stones) {
          const c = s.c;
          for (const k of [0, 1, 2, 0, 2, 3]) {
            data[o++] = c[k * 2];
            data[o++] = c[k * 2 + 1];
            data[o++] = s.cx;
            data[o++] = s.cy;
            data[o++] = s.nx;
            data[o++] = s.ny;
            data[o++] = s.bx;
            data[o++] = s.by;
            data[o++] = s.col[0] / 255;
            data[o++] = s.col[1] / 255;
            data[o++] = s.col[2] / 255;
            data[o++] = s.mat;
            data[o++] = s.w8 ?? 0;
          }
        }
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        bufs.set(key, { buf, n: stones.length * 6 });
      },
      drop(key) {
        const b = bufs.get(key);
        if (b) {
          gl.deleteBuffer(b.buf);
          bufs.delete(key);
        }
      },
      clearAll() {
        for (const k of [...bufs.keys()]) this.drop(k);
      },
      /** light: [x, y, z] device px; draws: [{ key, mode, lo, hi }] */
      draw(light5, view, draws, gain = 1) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(un.res, canvas.width, canvas.height);
        gl.uniform3f(un.light, light5[0], light5[1], light5[2]);
        gl.uniform3f(un.view, view[0], view[1], view[2]);
        gl.uniform1f(un.gain, gain);
        for (const d of draws) {
          const b = bufs.get(d.key);
          if (!b) continue;
          gl.bindBuffer(gl.ARRAY_BUFFER, b.buf);
          const F = 4 * STRIDE;
          gl.enableVertexAttribArray(at.pos);
          gl.vertexAttribPointer(at.pos, 2, gl.FLOAT, false, F, 0);
          gl.enableVertexAttribArray(at.cen);
          gl.vertexAttribPointer(at.cen, 2, gl.FLOAT, false, F, 8);
          gl.enableVertexAttribArray(at.n);
          gl.vertexAttribPointer(at.n, 2, gl.FLOAT, false, F, 16);
          gl.enableVertexAttribArray(at.b);
          gl.vertexAttribPointer(at.b, 2, gl.FLOAT, false, F, 24);
          gl.enableVertexAttribArray(at.col);
          gl.vertexAttribPointer(at.col, 3, gl.FLOAT, false, F, 32);
          gl.enableVertexAttribArray(at.mat);
          gl.vertexAttribPointer(at.mat, 2, gl.FLOAT, false, F, 44);
          gl.uniform1i(un.mode, d.mode || 0);
          gl.uniform1f(un.lo, d.lo ?? 0);
          gl.uniform1f(un.hi, d.hi ?? 0);
          gl.drawArrays(gl.TRIANGLES, 0, b.n);
        }
      },
      lost: () => gl.isContextLost()
    };
  }
  var VS, FS;
  var init_glint = __esm({
    "js/glint.js"() {
      VS = `
attribute vec2 aPos; attribute vec2 aCen; attribute vec2 aN; attribute vec2 aB; attribute vec3 aCol; attribute vec2 aMat;
uniform vec2 uRes; uniform int uMode; uniform float uLo; uniform float uHi;
varying vec2 vCen; varying vec2 vN; varying vec2 vB; varying vec3 vCol; varying float vMat; varying vec2 vPos;
void main() {
  bool hide = (uMode == 1 && aMat.y <= uHi) || (uMode == 2 && aMat.y >= uLo);
  vec2 p = hide ? vec2(-9.0) : (aPos / uRes * 2.0 - 1.0) * vec2(1.0, -1.0);
  vCen = aCen; vN = aN; vB = aB; vCol = aCol; vMat = aMat.x; vPos = aPos;
  gl_Position = vec4(p, 0.0, 1.0);
}`;
      FS = `
precision mediump float;
uniform vec3 uLight; uniform vec3 uView; uniform float uGain;
varying vec2 vCen; varying vec2 vN; varying vec2 vB; varying vec3 vCol; varying float vMat; varying vec2 vPos;
void main() {
  // the sheen follows the wall's broad shape (the concave conch, the patchy setting); the glint
  // follows each stone's own tilt, plus a hair of unevenness across its face
  vec2 wob = (vPos - vCen) * 0.010;
  vec3 N = normalize(vec3(vN + wob, 1.0)), NB = normalize(vec3(vB, 1.0));
  vec3 P = vec3(vCen, 0.0);
  vec3 L = normalize(uLight - P), V = normalize(uView - P), H = normalize(L + V);
  float d = max(dot(N, H), 0.0), db = max(dot(NB, H), 0.0);
  float zone = pow(db, 60.0);                        // the pool of light where the wall reflects the light
  float sheen = pow(db, 170.0);                      // its bright core
  float glint = pow(d, 700.0) * (0.1 + 0.9 * zone);  // single stones flaring, mostly inside the pool
  vec4 o = vec4(0.0);
  if (vMat < 1.5) {            // gold: a warm glow, warm flares, the far gold a little deeper
    vec3 hi = mix(vec3(1.0, 0.82, 0.42), vec3(1.0, 0.95, 0.78), clamp(glint * 1.2, 0.0, 1.0));
    float I = clamp(zone * 0.26 + sheen * 0.3 + glint * 0.95, 0.0, 0.96) * uGain;
    float dk = (1.0 - zone) * 0.24;
    vec3 dark = vCol * vec3(0.5, 0.4, 0.26);
    o = vec4(hi * I + dark * dk * (1.0 - I), I + dk * (1.0 - I));
  } else if (vMat < 2.5) {     // glass: rare, small, white
    float I = clamp(pow(d, 1600.0) * 0.7 * (0.3 + 0.7 * zone) + sheen * 0.04, 0.0, 1.0) * uGain;
    o = vec4(vec3(0.9, 0.94, 1.0) * I, I);
  } else if (vMat < 3.5) {     // silver
    float I = clamp(zone * 0.22 + sheen * 0.3 + glint * 0.9, 0.0, 0.95) * uGain;
    float dk = (1.0 - zone) * 0.16;
    o = vec4(vec3(0.95, 0.97, 1.0) * I + vec3(0.25, 0.28, 0.36) * dk * (1.0 - I), I + dk * (1.0 - I));
  } else {                     // gems: a sharp star of light now and then
    float I = clamp(pow(d, 380.0) * 0.9 * (0.3 + 0.7 * zone) + sheen * 0.1, 0.0, 1.0) * uGain;
    o = vec4(vec3(1.0) * I, I);
  }
  gl_FragColor = o;
}`;
    }
  });

  // js/places/sky.js
  function groundColour(L, v, glow = 0) {
    const S = SKY;
    let gold = mix(S.goldLit, S.gold, smooth(0, 1, v) * 0.5);
    gold = mix(gold, S.goldWarm, (L.golden || 0) * smooth(0.2, 1, v) * 0.8);
    const night = mix(S.lapisTop, mix(S.lapis, S.lapisLow, smooth(0.5, 1, v)), smooth(0, 0.45, v));
    const dusk = v < 0.35 ? mix(S.lapisTop, S.lapis, v / 0.35) : v < 0.55 ? mix(S.lapis, S.violet, (v - 0.35) / 0.2) : v < 0.72 ? mix(S.violet, S.rose, (v - 0.55) / 0.17) : v < 0.86 ? mix(S.rose, S.coral, (v - 0.72) / 0.14) : mix(S.coral, S.goldWarm, (v - 0.86) / 0.14);
    let c = gold;
    if (L.dusk) c = mix(c, dusk, L.dusk);
    if (L.night) c = mix(c, night, L.night);
    if (glow) c = mix(c, S.goldLit, glow);
    return c;
  }
  function groundMat(L, v) {
    const goldness = (1 - (L.night || 0)) * (1 - (L.dusk || 0) * smooth(0.86, 0.6, v));
    return goldness > 0.5 ? MAT.GOLD : MAT.GLASS;
  }
  function starField(A, below2, avoid = [], seed = 5, density = 1) {
    let a = seed * 9301 + 49297;
    const rnd = () => (a = a * 16807 % 2147483647) / 2147483647;
    const out = [], step = 64 / Math.sqrt(density), gold = [rgb("#e2bb5c"), rgb("#f0d488"), rgb("#cfa148"), rgb("#f4e6c0")];
    for (let gy = -RI2 + step * 0.4; gy < 1200; gy += step * 0.86) for (let gx = -RI2; gx < RI2; gx += step) {
      const x = gx + (rnd() - 0.5) * step * 0.8 + Math.round(gy / step) % 2 * step * 0.5, y = gy + (rnd() - 0.5) * step * 0.6;
      if (Math.hypot(x, Math.min(y, 0)) > RI2 - 26 || y > below2(x) - 14) continue;
      if (avoid.some(([ax, ay, ar]) => Math.hypot(x - ax, y - ay) < ar)) continue;
      const roll = rnd();
      out.push({ x, y, size: roll < 0.22 ? 2 : roll < 0.6 ? 1 : 0, a: rnd() * Math.PI, col: gold[rnd() * 4 | 0] });
    }
    return out;
  }
  var SKY, RI2;
  var init_sky = __esm({
    "js/places/sky.js"() {
      init_core();
      init_arch();
      SKY = {
        gold: rgb("#c49540"),
        goldLit: rgb("#d9ae55"),
        goldWarm: rgb("#cf9040"),
        goldDeep: rgb("#a87c34"),
        rose: rgb("#c9776e"),
        coral: rgb("#e0935e"),
        violet: rgb("#5c4f8c"),
        lapisTop: rgb("#1c2c62"),
        lapis: rgb("#26397a"),
        lapisLow: rgb("#3d5898")
      };
      RI2 = 500;
    }
  });

  // js/places/life.js
  function birdsAt(t, specs) {
    return specs.map(([i, period, y0, size]) => {
      const ph = (t + i * 13) % period / period, x = lerp(IN_X0 - 120, IN_X1 + 120, ph), y = y0 + 22 * Math.sin(ph * 6.28 + i);
      return { x, y, size, flap: 0.5 + 0.5 * Math.sin(t * (1.6 + i * 0.3) + i) };
    });
  }
  function inBird(b, x, y) {
    const dx = x - b.x, dy = y - b.y, s = b.size;
    if (Math.abs(dx) > s * 1.1 || Math.abs(dy) > s * 0.6) return false;
    const u = Math.abs(dx) / s, lift = 0.18 + 0.2 * b.flap;
    const wingY = -lift * Math.sin(Math.min(1, u) * Math.PI) * s * 0.9 + u * u * s * 0.22 * (1 - b.flap * 0.5);
    return u <= 1 && Math.abs(dy - wingY) < Math.max(s * 0.07, s * (0.16 - 0.09 * u));
  }
  function kitesAt(t, specs) {
    return specs.map((k) => ({ ...k, x: k.x + 16 * Math.sin(t * 0.7 + k.ph) + 6 * Math.sin(t * 1.9 + k.ph * 2), y: k.y + 10 * Math.sin(t * 0.9 + k.ph * 1.3), a: 0.18 * Math.sin(t * 1.1 + k.ph) }));
  }
  function inKite(k, x, y) {
    const c = Math.cos(-k.a), s = Math.sin(-k.a), dx = x - k.x, dy = y - k.y, u = dx * c - dy * s, v = dx * s + dy * c, w = k.size * 0.62, h = k.size;
    if (Math.abs(u) / w + Math.abs(v + h * 0.1) / h < 1) return u < 0 ? 1 : 2;
    for (let i = 1; i <= 3; i++) {
      const tx = Math.sin(i * 1.3 + k.ph) * 10, ty = h * 0.9 + i * k.size * 0.42;
      if (Math.abs(u - tx) < k.size * 0.16 && Math.abs(v - ty) < k.size * 0.11) return 3;
    }
    const ex = k.strX - k.x, ey = k.strY - k.y, l = Math.hypot(ex, ey), along = (dx * ex + dy * ey) / l;
    if (along > 0 && along < l) {
      const off = Math.abs(dx * ey - dy * ex) / l;
      if (off < 4.5) return 4;
    }
    return 0;
  }
  var IN_X0, IN_X1;
  var init_life = __esm({
    "js/places/life.js"() {
      init_core();
      init_geom();
      IN_X0 = -RI;
      IN_X1 = RI;
    }
  });

  // js/places/sanjose.js
  function blend(a, b, t) {
    const o = {};
    for (const k of Object.keys(a)) o[k] = k === "tint" ? a[k].map((v, i) => lerp(v, b[k][i], t)) : mix(a[k], b[k], t);
    return o;
  }
  function light(hour) {
    const date = sceneDate(hour), sky = skyState(date), e = sky.sun.el, { D, G, T, N } = PALS;
    const pal = e >= 22 ? D : e >= 6 ? blend(G, D, smooth(6, 22, e)) : e >= -1 ? G : e >= -7 ? blend(G, T, smooth(-1, -7, e)) : e >= -13 ? blend(T, N, smooth(-7, -13, e)) : N;
    const label = clockLabel(date);
    const night = smooth(-6, -14, e), dusk = smooth(3, -2.5, e) * (1 - night);
    return {
      pal,
      tint: pal.tint,
      label,
      caption: `San Jose \xB7 ${label}`,
      clock: label,
      day: smooth(6, 20, e),
      golden: smooth(-1, 4, e) * (1 - smooth(9, 22, e)),
      dusk,
      night,
      sunUp: e > -1.5,
      sunAz: sky.sun.az,
      moonUp: e <= -1.5 && sky.moon.el > 0 && night + dusk > 0.35,
      moonAz: sky.moon.az,
      phase: sky.moon.phase,
      stars: sky.stars,
      lamps: smooth(-2, -8, e),
      lamp: smooth(1, -5, e)
    };
  }
  function arcPos(az, A) {
    const th = Math.PI * lerp(0.88, 0.12, clamp((az - 95) / 170));
    const cy = lerp(-150, 40, A.t), ax = lerp(352, 300, A.t), ay = lerp(240, 400, A.t);
    return [ax * Math.cos(th), cy - ay * Math.sin(th)];
  }
  function layout(A) {
    const t = A.t, k = lerp(1, 1.5, t);
    const S = { x: lerp(-352, -6, t), y: lerp(-232, A.deskY - 218 * A.sd, t) };
    const foot = lerp(-150, A.deskY - 128 * A.sd, t);
    const ridgeY = (x) => {
      const off = Math.abs(x - S.x) - 58 * k;
      const fall = off > 0 ? x < S.x ? off * 0.62 : off * 0.34 - 34 * Math.exp(-(((x - (S.x + 250 * k)) / 60) ** 2)) * k : 0;
      return Math.min(foot - 4, S.y + fall + 3.5 * Math.sin(x / 23 + 1));
    };
    const hillY = (x) => foot + lerp(12, 22, t) + 8 * Math.sin(x / 86 + 0.6) + 5 * Math.sin(x / 33 + 2);
    const nearY = (x) => A.ground - lerp(22, 30, t) * A.sd + 4 * Math.sin(x / 50 + 1);
    const big = { x: S.x + 6 * k, top: S.y - 36 * k, half: 26 * k, r: 34 * k };
    const small = { x: S.x - 50 * k, top: S.y - 18 * k, half: 15 * k, r: 19 * k };
    const shane = { x: S.x + 66 * k, top: S.y - 12 * k, half: 18 * k, r: 22 * k };
    const hall = { x0: small.x + 8 * k, x1: big.x - 16 * k, top: S.y - 16 * k };
    const oakR = lerp(1, 1.2, t);
    const bigOak = { x: lerp(430, 372, t), y: lerp(A.ground - 26, A.deskY - 40 * A.sd, t), rx: lerp(66, 72, t), ry: lerp(46, 48, t) };
    return { t, k, S, foot, ridgeY, hillY, nearY, big, small, shane, hall, oakR, bigOak };
  }
  function regions(L, A) {
    const P6 = L.pal, out = regionList(), R = out.R, Y = layout(A), F = A.F;
    const tint = (c) => [c[0] * P6.tint[0], c[1] * P6.tint[1], c[2] * P6.tint[2]].map((v) => Math.min(255, v));
    const sun = L.sunUp ? arcPos(L.sunAz, A) : null, moon = L.moonUp ? arcPos(L.moonAz, A) : null;
    const sunSide = sun ? sun[0] < 0 ? -1 : 1 : moon ? moon[0] < 0 ? -1 : 1 : 1;
    const sr = lerp(44, 56, A.t);
    const vOf = (x, y) => clamp((y + RI) / (Y.ridgeY(x) + RI));
    R("sky", "sky", (c) => c.rect(-RI - 4, -RI - 4, 2 * RI + 8, RI + F + 8), (x, y) => {
      const glow = sun ? 0.32 * (1 - smooth(sr, sr * 4.5, Math.hypot(x - sun[0], y - sun[1]))) * (1 - L.night) : moon ? 0 : 0;
      let c = groundColour(L, vOf(x, y), glow);
      if (L.night > 0.1) c = mix(c, mix(rgb("#5d4f8e"), rgb("#b07a8a"), smooth(0.8, 1, vOf(x, y))), 0.55 * L.night * L.lamps * smooth(0.62, 1, vOf(x, y)));
      if (moon) c = mix(c, [120, 140, 190], 0.22 * (1 - smooth(40, 200, Math.hypot(x - moon[0], y - moon[1]))));
      return c;
    }, { live: "sky", matAt: (x, y) => groundMat(L, vOf(x, y)), fine: 1.02, src: ["outside"], halo: 2 });
    if (sun) {
      const [sx, sy] = sun;
      R(
        "rays",
        "sun",
        (c) => {
          for (let i = 0; i < 16; i++) {
            const a = i / 16 * Math.PI * 2, r1 = sr * (i % 2 ? 1.36 : 1.62), w = 0.16;
            c.moveTo(sx + Math.cos(a - w) * sr * 0.9, sy + Math.sin(a - w) * sr * 0.9);
            c.lineTo(sx + Math.cos(a) * r1, sy + Math.sin(a) * r1);
            c.lineTo(sx + Math.cos(a + w) * sr * 0.9, sy + Math.sin(a + w) * sr * 0.9);
            c.closePath();
          }
        },
        () => mix(rgb("#d9572f"), rgb("#e98a3c"), 0.3 + 0.4 * L.golden),
        { fine: 0.6, mat: MAT.GOLD, live: "rays" }
      );
      R("sun", "sun", disc(sx, sy, sr), (x, y) => {
        const d = Math.hypot(x - sx, y - sy) / sr;
        return d > 0.8 ? rgb("#d65a33") : d > 0.55 ? mix(rgb("#f2b44e"), rgb("#e98a3c"), L.golden) : mix(rgb("#fff6d6"), rgb("#f8dc8a"), smooth(0, 0.55, d));
      }, { fine: 0.64, mat: MAT.GOLD, live: "sun" });
    }
    if (moon) {
      const [mx, my] = moon, ph = L.phase, r = sr * 0.9, c2 = Math.cos(ph * Math.PI * 2);
      R("moon", "sun", disc(mx, my, r), (x, y) => {
        const dx = x - mx, w = Math.sqrt(Math.max(0, r * r - (y - my) ** 2)), lit = ph < 0.5 ? dx > c2 * w : -dx > c2 * w;
        return lit ? mix(rgb("#f1f2ee"), rgb("#cfd5de"), smooth(0.4, 0.75, vnoise(x / 16, y / 16, 13)) * 0.7) : rgb("#33477f");
      }, { fine: 0.66, mat: MAT.SILVER });
    }
    R("ridge", "view", below(Y.ridgeY, -RI - 4, RI + 4, F + 2), (x, y) => {
      const d = y - Y.ridgeY(x), slope = (Y.ridgeY(x + 6) - Y.ridgeY(x - 6)) / 12;
      const lit = clamp(0.45 - slope * 2.2 * sunSide + Math.sin((x - (y + 200) * 0.9 * Math.sign(x - Y.S.x)) / 40) * 0.16) * (1 - smooth(10, 120, d) * 0.5);
      let c = mix(P6.mtn, P6.mtnLit, lit);
      if (d < 7) c = mix(P6.mtnLit, [255, 248, 236], 0.28 * (1 - L.night * 0.6));
      if (vnoise(x / 30, y / 20, 12) > 0.63 && d > 10) c = mix(c, P6.chap, 0.5);
      return mix(c, P6.haze, 0.2 * smooth(30, 110, d));
    }, { src: ["sky", "sun"] });
    R("town", "view", below((x) => Y.foot, -RI - 4, RI + 4, F + 2), (x, y) => {
      const h = hash2(x / 9 | 0, y / 9 | 0, 21);
      let c = h < 0.55 ? P6.townTree : h < 0.84 ? mix(P6.townTree, P6.haze, 0.5) : mix(P6.town, [255, 255, 255], h > 0.95 ? 0.3 : 0);
      c = mix(c, P6.haze, 0.5 - 0.35 * L.lamps);
      if (L.lamps > 0 && hash2(x / 9 | 0, y / 9 | 0, 33) > 0.48) c = mix(c, h > 0.7 ? [236, 240, 255] : [255, 204, 118], L.lamps * 0.85);
      return c;
    }, { src: ["ridge", "obs"], live: "town", fine: 0.78 });
    const { big, small, shane, hall, k } = Y;
    const onGround = (x0, x1, top) => (c) => {
      c.moveTo(x0, top);
      c.lineTo(x1, top);
      for (let x = x1; x >= x0; x -= 3) c.lineTo(x, Y.ridgeY(x) + 6);
      c.lineTo(x0, Y.ridgeY(x0) + 6);
      c.closePath();
    };
    const stucco = (x, cx, half) => mix(P6.stucco, P6.stuccoShade, smooth(-0.3, 0.8, (x - cx) / half * sunSide) * 0.85);
    R("towers", "obs", union(onGround(small.x - small.half, small.x + small.half, small.top), onGround(big.x - big.half, big.x + big.half, big.top), onGround(shane.x - shane.half, shane.x + shane.half, shane.top)), (x, y) => {
      const T = Math.abs(x - small.x) < small.half + 1 ? small : Math.abs(x - big.x) < big.half + 1 ? big : shane;
      return y < T.top + 5 * k ? mix(P6.stucco, [255, 255, 255], 0.2) : stucco(x, T.x, T.half);
    }, { fine: 0.66, src: "courses", flat: true });
    R("hall", "obs", onGround(hall.x0, hall.x1, hall.top), (x, y) => y < hall.top + 5 * k ? mix(P6.stucco, [255, 255, 255], 0.15) : mix(P6.stucco, P6.stuccoShade, 0.3), { fine: 0.62, src: "courses" });
    R("domes", "obs", (c) => {
      for (const D of [small, big, shane]) {
        c.moveTo(D.x + D.r, D.top + 1);
        c.arc(D.x, D.top + 1, D.r, 0, Math.PI, true);
        c.closePath();
      }
    }, (x, y) => {
      const D = Math.abs(x - small.x) < small.r + 1 ? small : Math.abs(x - big.x) < big.r + 1 ? big : shane, nx = (x - D.x) / D.r, ny = (y - D.top) / D.r;
      if (D !== shane && Math.abs(nx + 0.14 * sunSide) < 0.13 && ny < -0.1) return D === big && L.lamps > 0.2 ? mix(P6.domeSlit, P6.slitGlow, L.lamps) : P6.domeSlit;
      return mix(P6.domeLit, P6.domeShade, smooth(-0.2, 0.8, nx * sunSide * 0.9 - ny * 0.3));
    }, { fine: 0.6, live: "slit", flat: true });
    const OAKS = oakList(Y, A);
    R("hills", "view", below(Y.hillY, -RI - 4, RI + 4, F + 2), (x, y) => {
      const d = y - Y.hillY(x), slope = (Y.hillY(x + 5) - Y.hillY(x - 5)) / 10;
      let c = mix(P6.hillLit, P6.hill, clamp(0.45 + slope * 3 * sunSide) * 0.7 + smooth(0, 80, d) * 0.3);
      for (const o of OAKS) {
        const s = Math.hypot((x - o.x - o.r * 0.35 * -sunSide) / (o.r * 1.3), (y - o.y - 3) / (o.ry * 0.5));
        if (s < 1) c = mix(c, P6.shadow, 0.5 * (1 - s * s));
      }
      c = mix(c, P6.shadow, smooth(0.58, 0.8, vnoise(x / 40, y / 7, 9)) * 0.3);
      return mix(c, P6.shadow, deskShadow(A, x, y) * 0.7);
    }, { src: ["town", "ridge", "obs"] });
    const grove = (list) => (x, y) => {
      let o = list[0], bd = 1e9;
      for (const g of list) {
        const d = Math.hypot((x - g.x) / g.r, (y - (g.y - g.ry * 0.8)) / g.ry);
        if (d < bd) {
          bd = d;
          o = g;
        }
      }
      const nx = (x - o.x) / o.r, ny = (y - (o.y - o.ry * 0.8)) / o.ry;
      return mix(mix(mix(P6.oak, P6.oakDeep, o.k * 0.35), P6.oakLit, smooth(0.3, -0.8, nx * -sunSide * 0.7 + ny * 0.8)), P6.oakDeep, smooth(0.1, 0.95, ny) * 0.5);
    };
    R("oaks", "tree", union(...OAKS.map((o) => ell(o.x, o.y - o.ry * 0.8, o.r, o.ry))), grove(OAKS), { fine: 0.7, flat: true });
    R("near", "view", below(Y.nearY, -RI - 4, RI + 4, F + 2), (x, y) => {
      const d = y - Y.nearY(x);
      if (hash2(x / 8 | 0, y / 8 | 0, 71) > 0.9 && d > 4) return mix(mix(rgb("#e8731f"), rgb("#f2a33a"), hash2(x / 8 | 0, y / 8 | 0, 72)), P6.near, 0.7 * L.night + 0.3 * L.dusk);
      let c = mix(P6.nearLit, P6.near, smooth(0, 40, d) * 0.5 + 0.2 * vnoise(x / 30, y / 10, 6));
      return mix(mix(c, P6.shadow, smooth(0.58, 0.8, vnoise(x / 40, y / 8, 10)) * 0.3), P6.shadow, deskShadow(A, x, y) * 0.7);
    }, { src: "courses", fine: 0.9 });
    const bo = Y.bigOak;
    R("bigTrunk", "tree", union(poly([[bo.x - 9, bo.y + 2], [bo.x - 5, bo.y - 34], [bo.x + 5, bo.y - 34], [bo.x + 10, bo.y + 2]]), bar(bo.x - 2, bo.y - 26, bo.x - 26, bo.y - 50, 8), bar(bo.x + 2, bo.y - 26, bo.x + 28, bo.y - 46, 8)), () => tint(P6.trunk), { fine: 0.6 });
    R("bigOak", "tree", union(ell(bo.x, bo.y - 30 - bo.ry * 0.78, bo.rx, bo.ry * 0.72), ell(bo.x - bo.rx * 0.45, bo.y - 30 - bo.ry * 0.55, bo.rx * 0.58, bo.ry * 0.6), ell(bo.x + bo.rx * 0.5, bo.y - 30 - bo.ry * 0.58, bo.rx * 0.55, bo.ry * 0.58), ell(bo.x + bo.rx * 0.05, bo.y - 30 - bo.ry * 1.18, bo.rx * 0.55, bo.ry * 0.5)), (x, y) => {
      const cy = bo.y - 30 - bo.ry, lit = smooth(0.25, -0.95, (x - bo.x) / bo.rx * -sunSide + (y - cy) / bo.ry * 0.9);
      return mix(mix(P6.oak, P6.oakLit, clamp(lit + (vnoise(x / 26, y / 20, 8) - 0.5) * 0.5)), P6.oakDeep, smooth(cy + bo.ry * 0.3, cy + bo.ry * 1.05, y) * 0.6);
    }, { fine: 0.72 });
    deskRegions(R, L, A);
    return out;
  }
  function oakList(Y, A) {
    let a = 91;
    const rnd = () => (a = a * 16807 % 2147483647) / 2147483647;
    const out = [], t = Y.t;
    const bands = [[Y.hillY(0) + lerp(12, 20, t), lerp(13, 18, t), 12], [lerp(-40, A.deskY + 70 * A.sd, t), lerp(17, 23, t), 8], [lerp(40, A.deskY + 150 * A.sd, t), lerp(22, 28, t), 6]];
    bands.forEach(([y0, r0, n], bi) => {
      for (let i = 0; i < n; i++) {
        const x = -RI + (i + 0.3 + rnd() * 0.5) * (2 * RI / n);
        const y = bi === 0 ? Y.hillY(x) + lerp(10, 18, t) + rnd() * 6 : y0 + (rnd() - 0.5) * 26;
        if (y > Y.nearY(x) - 6) continue;
        out.push({ x, y, r: r0 * (0.8 + rnd() * 0.45) * Y.oakR, ry: 0, k: rnd() });
      }
    });
    for (const o of out) o.ry = o.r * 0.72;
    return out;
  }
  function liveKind(t, r, L) {
    if (r.live === "sky") return "sky";
    if (r.live === "sun" || r.live === "rays") return "sun";
    if (r.live === "slit" && L.lamps > 0.2) return "slit";
    if (r.live === "town" && L.lamps > 0.1 && t.h > 0.8) return "town";
    return null;
  }
  function frameState(time, L) {
    return { birds: L.night < 0.5 && L.dusk < 0.5 ? birdsAt(time, [[0, 34, -330, 22], [1, 42, -290, 18]]) : [], time };
  }
  function liveColour(s, F, L) {
    if (s.kind === "sky") {
      for (const bd of F.birds) if (inBird(bd, s.ux * 1 + 0, s.uy)) return mix(s.col, rgb("#3a2f28"), 0.85);
      if (s.star) {
        const tw = 0.55 + 0.45 * Math.sin(F.time * (1.3 + s.h2 * 2) + s.h * 40);
        return mix(s.col, [255, 248, 222], L.stars * tw * 0.6);
      }
      return null;
    }
    if (s.kind === "town") {
      const tw = Math.sin(F.time * (1.5 + s.h2 * 2) + s.h * 60);
      return tw > 0.3 ? mix(s.col, [255, 244, 220], (tw - 0.3) * 0.5 * L.lamps) : null;
    }
    if (s.kind === "slit") return mix(s.col, [255, 220, 150], 0.25 * (0.8 + 0.2 * Math.sin(F.time * 0.7 + s.uy * 0.05)) * L.lamps);
    return null;
  }
  var DAY, GOLDEN, TWILIGHT, NIGHT, asRGB, PALS, isStar, sanjose_default;
  var init_sanjose = __esm({
    "js/places/sanjose.js"() {
      init_core();
      init_geom();
      init_desk();
      init_sky();
      init_arch();
      init_life();
      DAY = {
        mtn: "#8a92ad",
        mtnLit: "#aeb6c8",
        chap: "#727e8c",
        hill: "#c7a066",
        hillLit: "#e0c288",
        near: "#cda56a",
        nearLit: "#e4c68c",
        shadow: "#8e7850",
        town: "#d9dcd8",
        townTree: "#7f9180",
        haze: "#bcc4cc",
        oak: "#4c6a3d",
        oakLit: "#738e50",
        oakDeep: "#33492e",
        trunk: "#4e3b2a",
        domeLit: "#fbf8f1",
        domeShade: "#c4c9d1",
        domeSlit: "#4c535d",
        stucco: "#f3ead6",
        stuccoShade: "#d3c6a8",
        window: "#66707a",
        slitGlow: "#4c535d",
        tint: [1, 1, 1]
      };
      GOLDEN = {
        mtn: "#857a92",
        mtnLit: "#bc968a",
        chap: "#6a6478",
        hill: "#c48e52",
        hillLit: "#e8b672",
        near: "#cc9a58",
        nearLit: "#ecbf7a",
        shadow: "#86643c",
        town: "#e9d7c0",
        townTree: "#7b7f62",
        haze: "#cbb6a6",
        oak: "#3f5a35",
        oakLit: "#66803f",
        oakDeep: "#2b4029",
        trunk: "#4a3626",
        domeLit: "#fdf1dd",
        domeShade: "#c2b8c4",
        domeSlit: "#4b4650",
        stucco: "#f6e2bf",
        stuccoShade: "#cfb48e",
        window: "#5f5a62",
        slitGlow: "#4b4650",
        tint: [1.04, 0.99, 0.93]
      };
      TWILIGHT = {
        mtn: "#5a628c",
        mtnLit: "#7e7ca6",
        chap: "#4b527a",
        hill: "#90806a",
        hillLit: "#ae9774",
        near: "#988468",
        nearLit: "#b69c78",
        shadow: "#6e6158",
        town: "#8a87a0",
        townTree: "#57606a",
        haze: "#8d90b0",
        oak: "#344632",
        oakLit: "#4a5c40",
        oakDeep: "#26352a",
        trunk: "#3a2e2a",
        domeLit: "#ece6e6",
        domeShade: "#a7a6bd",
        domeSlit: "#45435a",
        stucco: "#ddd0c4",
        stuccoShade: "#b2a6a2",
        window: "#f2c66a",
        slitGlow: "#e9a95a",
        tint: [0.92, 0.9, 0.97]
      };
      NIGHT = {
        mtn: "#3a4d80",
        mtnLit: "#566a9e",
        chap: "#33446f",
        hill: "#5f6d8a",
        hillLit: "#7d8ba6",
        near: "#6a7793",
        nearLit: "#8895ae",
        shadow: "#4c5873",
        town: "#3c4768",
        townTree: "#2e3958",
        haze: "#4c5c86",
        oak: "#283652",
        oakLit: "#3d4e70",
        oakDeep: "#1e2a43",
        trunk: "#242d42",
        domeLit: "#e6ebf3",
        domeShade: "#a3aec4",
        domeSlit: "#3a4258",
        stucco: "#c4c9d6",
        stuccoShade: "#9aa1b6",
        window: "#f5c35a",
        slitGlow: "#f2b45a",
        tint: [0.8, 0.83, 0.96]
      };
      asRGB = (p) => {
        const o = {};
        for (const k of Object.keys(p)) o[k] = typeof p[k] === "string" ? rgb(p[k]) : p[k];
        return o;
      };
      PALS = { D: asRGB(DAY), G: asRGB(GOLDEN), T: asRGB(TWILIGHT), N: asRGB(NIGHT) };
      isStar = (r, L, t, A) => r.name === "sky" && L.stars > 0.05 && t.h > 0.985 && t.uy < layout(A).S.y - 30;
      sanjose_default = {
        key: "now",
        place: "San Jose",
        light,
        regions,
        liveKind,
        frameState,
        liveColour,
        isStar,
        stars: (L, A) => {
          if (L.stars < 0.35) return [];
          const Y = layout(A), m = L.moonUp ? arcPos(L.moonAz, A) : null;
          return starField(A, (x) => Y.ridgeY(x) - 20, m ? [[m[0], m[1], 100]] : [], 3, L.stars);
        },
        outlines: [
          ...deskOutlines(["sky", "sun", "view", "obs", "tree", "rays"]),
          { inside: ["obs"], against: ["sky", "sun", "view"] }
        ],
        birdsBox: () => null,
        alt: (L) => `The apse, laid in mosaic: San\u2019s desk with its red lamp, a stack of books, the laptop, the blue paper robot and a telescope, and behind it Mt Hamilton with the white domes of the Lick Observatory above golden foothills and valley oaks; it is ${L.label} in San Jose, and the conch is ${L.night > 0.5 ? "lapis with stars" : L.dusk > 0.5 ? "rows of dusk colour" : "gold"}.`
      };
    }
  });

  // js/places/sandiego.js
  function light2() {
    return { pal: P, tint: [1.02, 1, 0.97], caption: "San Diego \xB7 a clear morning", label: "a clear morning", day: 1, golden: 0.15, dusk: 0, night: 0, lamp: 0, stars: 0 };
  }
  function layout2(A) {
    const t = A.t, sd = A.sd;
    const hor = lerp(-152, A.deskY - 205 * sd, t);
    const lib = { x: lerp(-352, 20, t), g: lerp(-62, A.deskY - 170 * sd, t), s: lerp(0.47, 0.6, t) };
    const coast = (x) => hor + lerp(24, 34, t) + 5 * Math.sin(x / 40);
    const lawnY = (x) => hor + lerp(46, 64, t) + 4 * Math.sin(x / 60 + 2);
    const bx = lerp(272, 250, t), bluffTop = hor - lerp(56, 64, t);
    const bluffY = (x) => x < bx ? 1e9 : bluffTop + 6 * Math.sin(x / 19) + 10 * smooth(bx + 40, bx, x) * 3;
    const pine = { x: lerp(430, 400, t), y: bluffTop + 2, s: lerp(1, 1.3, t) };
    const sun = [lerp(-232, -250, t), lerp(-372, -330, t)];
    return { t, hor, lib, coast, lawnY, bx, bluffTop, bluffY, pine, sun };
  }
  function regions2(L, A) {
    const out = regionList(), R = out.R, Y = layout2(A), F = A.F;
    const T = (x, y) => [Y.lib.x + (x - LX0) * Y.lib.s, Y.lib.g + (y - G0) * Y.lib.s];
    const TI = (x, y) => [LX0 + (x - Y.lib.x) / Y.lib.s, G0 + (y - Y.lib.g) / Y.lib.s];
    const tpoly = (pts) => poly(pts.map(([x, y]) => T(x, y)));
    const vOf = (x, y) => clamp((y + RI) / (Y.hor + RI));
    const [sx, sy] = Y.sun, sr = lerp(42, 52, A.t);
    R(
      "sky",
      "sky",
      (c) => c.rect(-RI - 4, -RI - 4, 2 * RI + 8, RI + F + 8),
      (x, y) => groundColour(L, vOf(x, y), 0.3 * (1 - smooth(sr, sr * 4.5, Math.hypot(x - sx, y - sy)))),
      { live: "sky", matAt: (x, y) => groundMat(L, vOf(x, y)), fine: 1.02, src: ["outside"], halo: 2 }
    );
    R(
      "rays",
      "sun",
      (c) => {
        for (let i = 0; i < 16; i++) {
          const a = i / 16 * Math.PI * 2, r1 = sr * (i % 2 ? 1.36 : 1.62), w = 0.16;
          c.moveTo(sx + Math.cos(a - w) * sr * 0.9, sy + Math.sin(a - w) * sr * 0.9);
          c.lineTo(sx + Math.cos(a) * r1, sy + Math.sin(a) * r1);
          c.lineTo(sx + Math.cos(a + w) * sr * 0.9, sy + Math.sin(a + w) * sr * 0.9);
          c.closePath();
        }
      },
      () => C3("#e9873a"),
      { fine: 0.6, mat: MAT.GOLD, live: "rays" }
    );
    R("sun", "sun", disc(sx, sy, sr), (x, y) => {
      const d = Math.hypot(x - sx, y - sy) / sr;
      return d > 0.8 ? C3("#e07a35") : mix(C3("#fff7dc"), C3("#f6d27a"), smooth(0, 0.8, d));
    }, { fine: 0.64, mat: MAT.GOLD, live: "sun" });
    R("sea", "view", below(() => Y.hor, -RI - 4, RI + 4, F + 2), (x, y) => {
      const d = y - Y.hor, row = Math.floor(d / 7);
      let c = mix(P.seaFar, P.sea, smooth(0, 30, d));
      if (row % 3 === 1 && hash2(x / 22 | 0, row, 3) > 0.55) c = mix(c, P.crest, 0.45);
      return c;
    }, { src: "courses", live: "sea", fine: 0.9 });
    R("bluff", "view", (c) => {
      c.moveTo(Y.bx, F + 2);
      for (let x = Y.bx; x <= RI + 4; x += 4) c.lineTo(x, Y.bluffY(x));
      c.lineTo(RI + 4, F + 2);
      c.closePath();
    }, (x, y) => {
      const d = y - Y.bluffY(x), face = x < Y.bx + 26;
      if (d < 7) return mix(P.scrub, P.pine, hash2(x / 10 | 0, 1, 9) * 0.4);
      const band = Math.floor((d + 4 * Math.sin(x / 30)) / 11) % 3;
      return face ? mix(P.bluffShade, P.bluff, 0.3 + band * 0.1) : mix(band === 1 ? P.bluffLit : P.bluff, P.bluffShade, smooth(0, 90, d) * 0.35);
    }, { src: "courses" });
    R("coast", "view", below(Y.coast, -RI - 4, RI + 4, F + 2), (x, y) => mix(P.scrub, P.lawnDark, smooth(0, 30, y - Y.coast(x)) * 0.5 + 0.2 * vnoise(x / 30, y / 12, 5)), { src: ["sea", "bluff"] });
    R("lawn", "view", below(Y.lawnY, -RI - 4, RI + 4, F + 2), (x, y) => {
      const h = hash2(x / 8 | 0, y / 8 | 0, 41), d = y - Y.lawnY(x);
      if (h > 0.955 && d > 10 && vnoise(x / 60, y / 40, 8) > 0.45 && deskShadow(A, x, y) < 0.2) return P.flowers[hash2(x / 8 | 0, y / 8 | 0, 42) * 4 | 0];
      const c = mix(mix(P.lawnLit, P.lawn, smooth(0, 40, d)), P.lawnDark, smooth(0.55, 0.8, vnoise(x / 34, y / 14, 7)) * 0.4);
      return mix(c, mix(P.lawnDark, [20, 40, 20], 0.35), deskShadow(A, x, y) * 0.75);
    }, { src: "courses", fine: 0.92 });
    const pn = Y.pine, k = pn.s;
    R("pineTrunk", "tree", union(blade(pn.x, pn.y + 4, pn.x - 6 * k, pn.y - 30 * k, pn.x + 10 * k, pn.y - 58 * k, 10 * k, 6 * k), blade(pn.x - 2 * k, pn.y - 30 * k, pn.x - 22 * k, pn.y - 44 * k, pn.x - 38 * k, pn.y - 50 * k, 6 * k, 3 * k)), () => P.bark, { fine: 0.6 });
    R("pine", "tree", union(ell(pn.x + 12 * k, pn.y - 70 * k, 40 * k, 14 * k, -0.08), ell(pn.x - 34 * k, pn.y - 56 * k, 26 * k, 10 * k, 0.1), ell(pn.x + 30 * k, pn.y - 50 * k, 24 * k, 9 * k)), (x, y) => mix(P.pineLit, P.pine, smooth(pn.y - 84 * k, pn.y - 50 * k, y)), { fine: 0.66 });
    const facet = (lx, f) => {
      const u = (lx - LX0) / (f[2] / 2);
      return u < -0.8 ? -1 : u > 0.8 ? 1 : 0;
    };
    const floorAt = (ly) => {
      for (const f of [...FLOORS, ROOF]) if (ly >= f[0] && ly < f[1] + 0.5) return f;
      return null;
    };
    R("libCore", "lib", tpoly([[LX0 - 112, FLOORS[0][1] - 2], [LX0 + 112, FLOORS[0][1] - 2], [LX0 + 112, POD.top + 2], [LX0 - 112, POD.top + 2]]), (x, y) => mix(P.glassDeep, P.glass, smooth(FLOORS[0][1], POD.top, TI(x, y)[1]) * 0.5), { fine: 0.6, src: "courses" });
    R("podium", "lib", tpoly([[LX0 - POD.w / 2, POD.top], [LX0 + POD.w / 2, POD.top], [LX0 + POD.w / 2, G0 + 1], [LX0 - POD.w / 2, G0 + 1]]), (x, y) => {
      const [lx, ly] = TI(x, y);
      if (ly < POD.top + 9) return lx > LX0 + POD.w * 0.3 ? P.concreteShade : P.concrete;
      return mix(Math.abs((lx - LX0) / 22 % 1) < 0.18 ? P.concreteShade : P.glassLit, P.glass, smooth(POD.top + 9, G0, ly) * 0.7);
    }, { fine: 0.6, src: "courses" });
    R("piers", "lib", union(...PIERS.map(([sd, b, tt, yt, w]) => {
      const x0 = LX0 + sd * b, x1 = LX0 + sd * tt, a = Math.atan2(yt - POD.top, x1 - x0), nx = -Math.sin(a), ny = Math.cos(a);
      return tpoly([[x0 + nx * 8, POD.top + 4 + ny * 8], [x1 + nx * w / 2, yt + ny * w / 2], [x1 - nx * w / 2, yt - ny * w / 2], [x0 - nx * 8, POD.top + 4 - ny * 8]]);
    })), (x, y) => {
      const [lx, ly] = TI(x, y);
      return mix(P.concrete, P.concreteShade, lx < LX0 ? 0.08 + 0.2 * smooth(POD.top, 700, ly) : 0.55);
    }, { fine: 0.6 });
    R("library", "lib", (c) => {
      for (const f of [...FLOORS, ROOF]) {
        const hw = f[2] / 2, ch = Math.min(26, hw * 0.14);
        const pts = [[LX0 - hw + ch, f[0]], [LX0 + hw - ch, f[0]], [LX0 + hw, f[0] + 3], [LX0 + hw, f[1] + 0.8], [LX0 - hw, f[1] + 0.8], [LX0 - hw, f[0] + 3]].map(([x, y]) => T(x, y));
        c.moveTo(...pts[0]);
        for (const p of pts.slice(1)) c.lineTo(...p);
        c.closePath();
      }
    }, (x, y) => {
      const [lx, ly] = TI(x, y), f = floorAt(ly);
      if (!f) return P.concrete;
      const side = facet(lx, f), ledge = ly > f[1] - 12 || f === ROOF;
      if (ledge) return side > 0 ? P.concreteShade : side < 0 ? mix(P.concrete, [255, 255, 255], 0.3) : mix(P.concrete, P.concreteShade, 0.14);
      let c = mix(P.glassLit, P.glass, smooth(0.05, 0.85, (ly - f[0]) / (f[1] - 12 - f[0])));
      if (side > 0) c = mix(c, P.glassDeep, 0.55);
      else if (side < 0) c = mix(c, P.glassLit, 0.35);
      return c;
    }, { fine: 0.6, src: "courses" });
    deskRegions(R, L, A);
    return out;
  }
  function liveKind2(t, r) {
    return r.live === "sky" ? "sky" : r.live === "sea" ? "sea" : null;
  }
  function frameState2(time, L, A) {
    const t = A ? A.t : 0;
    return { birds: birdsAt(time, [[0, 26, lerp(-300, -150, t), 26], [1, 33, lerp(-262, -110, t), 20], [2, 41, lerp(-340, -220, t), 18]]), time };
  }
  function liveColour2(s, F) {
    if (s.kind === "sky") {
      for (const bd of F.birds) if (inBird(bd, s.ux, s.uy)) return mix(s.col, P.bird, 0.86);
      return null;
    }
    if (s.kind === "sea") {
      const v = Math.sin(s.uy * 0.2 - F.time * 1.1 + Math.sin(s.ux / 70) * 0.8);
      let c = v > 0.88 ? mix(s.col, P.crest, (v - 0.88) / 0.12 * 0.5) : null;
      const g = Math.max(0, Math.sin(F.time * 2.4 + s.h * 61)) ** 30;
      if (g > 0.05) c = mix(c || s.col, [255, 255, 245], g * 0.6);
      return c;
    }
    return null;
  }
  var C3, P, LX0, G0, POD, FLOORS, ROOF, PIERS, sandiego_default;
  var init_sandiego = __esm({
    "js/places/sandiego.js"() {
      init_core();
      init_geom();
      init_desk();
      init_sky();
      init_arch();
      init_life();
      C3 = (s) => rgb(s);
      P = {
        sea: C3("#2d6f9f"),
        seaFar: C3("#5b9fc6"),
        crest: C3("#e8f4f6"),
        bluff: C3("#dcaa7c"),
        bluffLit: C3("#ecc79c"),
        bluffShade: C3("#b07a52"),
        scrub: C3("#8f9a5e"),
        pine: C3("#3f5e3a"),
        pineLit: C3("#62824f"),
        bark: C3("#5a4632"),
        lawn: C3("#5f8a43"),
        lawnLit: C3("#79a253"),
        lawnDark: C3("#466f35"),
        path: C3("#e6dcc2"),
        concrete: C3("#ece6d8"),
        concreteShade: C3("#c9c0b0"),
        glass: C3("#3c5866"),
        glassLit: C3("#7397a8"),
        glassDeep: C3("#2c4250"),
        bird: C3("#3a3330"),
        flowers: [C3("#f3efe4"), C3("#f2d36a"), C3("#d9573c"), C3("#efe7d6")]
      };
      LX0 = 520;
      G0 = 862;
      POD = { top: 808, w: 224 };
      FLOORS = [[680, 716, 290], [644, 680, 358], [608, 644, 412], [574, 608, 420], [541, 574, 378], [510, 541, 326]];
      ROOF = [497, 510, 278];
      PIERS = [[22, 52, 716, 26], [58, 110, 716, 27], [96, 180, 680, 27]].flatMap((p) => [[-1, ...p], [1, ...p]]);
      sandiego_default = {
        key: "sd",
        place: "San Diego",
        light: light2,
        regions: regions2,
        liveKind: liveKind2,
        frameState: frameState2,
        liveColour: liveColour2,
        isStar: () => false,
        outlines: [
          ...deskOutlines(["rays", "sky", "sun", "view", "lib", "tree"]),
          { inside: ["lib"], against: ["sky", "sun", "view"] }
        ],
        alt: () => "The apse, laid in mosaic: San\u2019s desk with its red lamp, a stack of books, the laptop, the blue paper robot and a telescope, and behind it, on a clear San Diego morning, the stepped glass floors of the Geisel Library, the Pacific, the sandstone bluffs of Torrey Pines with a Torrey pine, and a lawn full of flowers, under a gold conch with the morning sun."
      };
    }
  });

  // js/places/bengaluru.js
  function light3() {
    return { pal: P2, tint: [1.03, 0.98, 0.93], caption: "Bengaluru \xB7 a monsoon afternoon", label: "a monsoon afternoon", day: 1, golden: 0.35, dusk: 0, night: 0, lamp: 0, stars: 0 };
  }
  function layout3(A) {
    const t = A.t, sd = A.sd, k = lerp(1, 1.35, t);
    const hor = lerp(-150, A.deskY - 172 * sd, t);
    const blocks = [];
    let x = -RI - 10, i = 0;
    while (x < RI + 10) {
      const w = (54 + 40 * hash2(i, 1, 5)) * k, h = (20 + 52 * hash2(i, 2, 5)) * k;
      blocks.push([x, x + w, hor - h + 30 * k, i]);
      x += w;
      i++;
    }
    const tanks = blocks.filter((b) => hash2(b[3], 3, 5) > 0.45).map((b) => [b[0] + (b[1] - b[0]) * (0.3 + 0.4 * hash2(b[3], 4, 5)), b[2], (0.7 + 0.3 * hash2(b[3], 6, 5)) * k]);
    const parapetY = (x2) => hor + lerp(34, 44, t) * k + 0 * x2;
    const terraceY = (x2) => parapetY(x2) + lerp(30, 40, t) * k;
    const tree = { x: lerp(-392, -300, t), y: lerp(-240, A.deskY - 300 * sd, t), k: lerp(1, 1.25, t) };
    const clouds = A.t < 0.5 ? [[-170, -404, 170, 20], [-10, -350, 150, 16], [210, -322, 160, 18], [70, -446, 120, 14], [300, -404, 90, 12], [-300, -300, 110, 13]] : [[-160, -330, 200, 24], [170, -260, 210, 24], [30, -410, 170, 18], [-220, -180, 150, 16], [240, -380, 120, 15], [-40, -110, 190, 18]];
    return { t, k, hor, blocks, tanks, terraceY, parapetY, tree, clouds };
  }
  function regions3(L, A) {
    const out = regionList(), R = out.R, Y = layout3(A), F = A.F;
    const vOf = (x, y) => clamp((y + RI) / (Y.hor + RI));
    R("sky", "sky", (c) => c.rect(-RI - 4, -RI - 4, 2 * RI + 8, RI + F + 8), (x, y) => groundColour(L, vOf(x, y), 0), { live: "sky", matAt: (x, y) => groundMat(L, vOf(x, y)), fine: 1.02, src: ["outside"], halo: 2 });
    Y.clouds.forEach(([cx, cy, rx, ry], n) => {
      const lens = (c) => {
        const N = 24;
        for (let i = 0; i <= N; i++) {
          const u = i / N, x = cx - rx + 2 * rx * u, h = Math.sin(Math.PI * u) ** 0.8;
          i ? c.lineTo(x, cy - ry * h * 1.25) : c.moveTo(x, cy);
        }
        for (let i = N; i >= 0; i--) {
          const u = i / N, x = cx - rx + 2 * rx * u, h = Math.sin(Math.PI * u) ** 1.4;
          c.lineTo(x, cy + ry * h * 0.55);
        }
        c.closePath();
      };
      R("cloud" + n, "cloud", lens, (x, y) => {
        const v = clamp((y - (cy - ry * 1.25)) / (ry * 1.8));
        return v < 0.3 ? P2.cloudLit : v < 0.55 ? P2.cloud : v < 0.78 ? P2.cloudShade : P2.rose;
      }, { fine: 0.74, src: "courses", live: "cloud" });
    });
    R("city", "city", (c) => {
      for (const [x0, x1, top] of Y.blocks) c.rect(x0, top, x1 - x0, F + 4 - top);
    }, (x, y) => {
      const b = Y.blocks.find(([x02, x12]) => x >= x02 && x < x12) || Y.blocks[0], wall = WALLS[b[3] % WALLS.length];
      const [x0, x1, top] = b, k2 = Y.k;
      if (y < top + 7 * k2) return mix(wall, [255, 255, 255], 0.3);
      const col = Math.floor((x - x0 - 10 * k2) / (24 * k2)), row = Math.floor((y - top - 18 * k2) / (30 * k2)), wx = x - x0 - 10 * k2 - col * 24 * k2, wy = y - top - 18 * k2 - row * 30 * k2;
      if (col >= 0 && x < x1 - 12 * k2 && row >= 0 && wx < 12 * k2 && wy < 15 * k2) return mix(wall, [40, 44, 52], 0.55);
      return mix(wall, [60, 60, 70], x > x1 - 14 * k2 ? 0.16 : 0);
    }, { fine: 0.8, src: "courses" });
    R("tanks", "city", (c) => {
      for (const [x, roof, z] of Y.tanks) {
        const w = 20 * z, h = 22 * z;
        c.rect(x - w, roof - h, 2 * w, h + 1);
        c.moveTo(x + w, roof - h);
        c.ellipse(x, roof - h, w, 5 * z, 0, 0, Math.PI * 2);
        c.closePath();
      }
    }, (x, y) => {
      let best = Y.tanks[0];
      for (const tk of Y.tanks) if (Math.abs(tk[0] - x) < Math.abs(best[0] - x)) best = tk;
      const dy = (best[1] - y) / best[2];
      if (dy > 20) return P2.tankLit;
      const rib = Math.abs(dy - 14) < 2.5 || Math.abs(dy - 6) < 2.5;
      return mix(rib ? P2.tankLit : P2.tank, [20, 20, 24], smooth(-6, 20, x - best[0]) * 0.5);
    }, { fine: 0.6, flat: true });
    const T = Y.tree, k = T.k;
    const CROWN = [[0, 0, 96, 40], [-62, 22, 60, 30], [64, 18, 66, 30], [6, 34, 84, 26], [-20, -26, 56, 24], [44, -20, 46, 20]].map(([dx, dy, rx, ry]) => [T.x + dx * k, T.y + dy * k, rx * k, ry * k]);
    R("trunk", "tree", union(blade(T.x + 10 * k, F + 4, T.x + 4 * k, T.y + 140 * k, T.x - 4 * k, T.y + 36 * k, 18 * k, 10 * k), blade(T.x - 2 * k, T.y + 80 * k, T.x - 30 * k, T.y + 60 * k, T.x - 60 * k, T.y + 30 * k, 8 * k, 4 * k), blade(T.x + 2 * k, T.y + 70 * k, T.x + 34 * k, T.y + 50 * k, T.x + 62 * k, T.y + 26 * k, 8 * k, 4 * k)), () => P2.bark, { fine: 0.62 });
    R("crown", "tree", union(...CROWN.map(([x, y, rx, ry]) => ell(x, y, rx, ry))), (x, y) => {
      const n = vnoise(x / 26, y / 22, 7), n2 = vnoise(x / 12, y / 12, 11);
      if (n2 > 0.74 && n < 0.5) return P2.leaf;
      const top = smooth(T.y + 50 * k, T.y - 40 * k, y) * 0.6 + smooth(T.x - 60 * k, T.x + 80 * k, x) * 0.3;
      return mix(P2.bloomDeep, mix(P2.bloom, P2.bloomLit, top), 0.5 + 0.5 * n);
    }, { fine: 0.74 });
    R("parapet", "view", below(Y.parapetY, -RI - 4, RI + 4, F + 4), (x, y) => y < Y.parapetY(x) + 8 ? mix(P2.parapet, [255, 255, 255], 0.3) : mix(P2.parapet, C4("#cfc6b6"), smooth(Y.parapetY(x), Y.terraceY(x), y) * 0.6), { src: "courses", fine: 0.9 });
    R("terrace", "view", below(Y.terraceY, -RI - 4, RI + 4, F + 4), (x, y) => {
      const d = y - Y.terraceY(x), k2 = Y.k, tile = 46 * k2 * (1 + d / 260);
      const gx = Math.abs((x / tile % 1 + 1) % 1 - 0.5), gy = Math.abs((d + 12) / (tile * 0.5) % 1 - 0.5);
      const sh = deskShadow(A, x, y) * 0.7;
      if (gx > 0.45 || gy > 0.42) return mix(C4("#7a2f27"), [40, 20, 16], sh * 0.5);
      return mix(mix(mix(P2.terraceLit, P2.terrace, smooth(0, 60, d)), P2.terraceDeep, smooth(0.55, 0.8, vnoise(x / 40, y / 10, 3)) * 0.3), C4("#5e2822"), sh);
    }, { src: "courses", fine: 0.92 });
    const px = lerp(410, 360, Y.t), pk = lerp(1, 1.3, Y.t), pg = A.ground - 4;
    R("pot", "pot", poly([[px - 30 * pk, pg - 50 * pk], [px + 30 * pk, pg - 50 * pk], [px + 22 * pk, pg], [px - 22 * pk, pg]]), (x, y) => y < pg - 42 * pk ? C4("#c8603e") : mix(C4("#b5543a"), C4("#86391f"), smooth(px - 20 * pk, px + 30 * pk, x)), { fine: 0.6, src: "courses" });
    R("tulsi", "pot", union(ell(px, pg - 82 * pk, 38 * pk, 30 * pk), ell(px - 24 * pk, pg - 68 * pk, 22 * pk, 18 * pk), ell(px + 24 * pk, pg - 70 * pk, 22 * pk, 18 * pk), ell(px, pg - 112 * pk, 20 * pk, 16 * pk)), (x, y) => {
      const n = vnoise(x / 9, y / 9, 31);
      if (n > 0.78) return C4("#7a4a6a");
      return mix(C4("#6f9a46"), C4("#3f6a32"), smooth(0.3, 0.7, n) * 0.6 + smooth(pg - 120 * pk, pg - 60 * pk, y) * 0.4);
    }, { fine: 0.6 });
    deskRegions(R, L, A);
    return out;
  }
  function kiteSpecs(A) {
    const t = A ? A.t : 0;
    return [
      { x: lerp(60, 60, t), y: lerp(-262, -170, t), size: lerp(34, 40, t), ph: 0, c1: C4("#d4337a"), c2: C4("#f2c230"), strX: lerp(420, 330, t), strY: lerp(-120, 200, t) },
      { x: lerp(-60, 250, t), y: lerp(-430, -40, t), size: lerp(26, 32, t), ph: 2.1, c1: C4("#2f7fd0"), c2: C4("#f08a2c"), strX: lerp(470, 420, t), strY: lerp(-130, 230, t) }
    ];
  }
  function liveKind3(t, r) {
    return r.live === "sky" ? "sky" : r.live === "cloud" ? "cloud" : null;
  }
  function frameState3(time, L, A) {
    return { kites: kitesAt(time, kiteSpecs(A)), time };
  }
  function liveColour3(s, F) {
    for (const k of F.kites) {
      const part = inKite(k, s.ux, s.uy);
      if (part === 1) return k.c1;
      if (part === 2) return k.c2;
      if (part === 3) return mix(k.c1, [255, 255, 255], 0.2);
      if (part === 4 && s.kind === "sky") return mix(s.col, [52, 50, 56], 0.5);
    }
    if (s.kind === "cloud" && s.edge) {
      const g = Math.max(0, Math.sin(F.time * 0.5 - s.ux * 0.012 + s.h * 2)) ** 6;
      return g > 0.05 ? mix(s.col, [255, 250, 232], g * 0.35) : null;
    }
    return null;
  }
  var C4, P2, WALLS, bengaluru_default;
  var init_bengaluru = __esm({
    "js/places/bengaluru.js"() {
      init_core();
      init_geom();
      init_desk();
      init_sky();
      init_life();
      C4 = (s) => rgb(s);
      P2 = {
        cloudLit: C4("#fbf3e2"),
        cloud: C4("#c9d2dc"),
        cloudShade: C4("#8796aa"),
        cloudBase: C4("#5d6c84"),
        rose: C4("#d99a8c"),
        tank: C4("#2c2e33"),
        tankLit: C4("#5a5f68"),
        parapet: C4("#f1ebe0"),
        bloom: C4("#e0462a"),
        bloomLit: C4("#f27d3c"),
        bloomDeep: C4("#b5321f"),
        leaf: C4("#5f7a3a"),
        bark: C4("#4a3426"),
        terrace: C4("#a8463a"),
        terraceDeep: C4("#8c3a30"),
        terraceLit: C4("#bd5a46")
      };
      WALLS = ["#eadcc0", "#e2aa9f", "#d9a64f", "#a9c2ce", "#b8d0b2", "#eadcc0", "#d9b48a", "#c8b7d0", "#e8c9a8", "#b9cbb8"].map(C4);
      bengaluru_default = {
        key: "blr",
        place: "Bengaluru",
        light: light3,
        regions: regions3,
        liveKind: liveKind3,
        frameState: frameState3,
        liveColour: liveColour3,
        isStar: () => false,
        edgeOf: (r, ux, uy) => r.live === "cloud" && hash2(ux | 0, uy | 0, 3) > 0.4,
        outlines: [
          ...deskOutlines(["rays", "sky", "cloud", "view", "city", "tree", "pot"]),
          { inside: ["pot"], against: ["view", "city", "tree"] },
          { inside: ["city"], against: ["sky", "cloud"] },
          { inside: ["tree"], against: ["sky", "cloud", "city"] }
        ],
        alt: () => "The apse, laid in mosaic: San\u2019s desk with its red lamp, a stack of books, the laptop, the blue paper robot and a telescope, on a red-oxide terrace in Bengaluru on a monsoon afternoon; behind it flat pastel roofs with black water tanks, a gulmohar in flower and two kites, under a gold conch streaked with monsoon clouds."
      };
    }
  });

  // js/places/surathkal.js
  function light4() {
    return { pal: P3, tint: [0.82, 0.86, 0.99], caption: "Surathkal \xB7 a night by the sea", label: "a night by the sea", day: 0, golden: 0, dusk: 0, night: 1, lamp: 1, stars: 1 };
  }
  function layout4(A) {
    const t = A.t, sd = A.sd, k = lerp(1, 1.3, t);
    const hor = lerp(-150, A.deskY - 176 * sd, t);
    const moon = [lerp(-150, -120, t), lerp(-382, -300, t)], mr = lerp(44, 56, t);
    const beach = (x) => hor + lerp(52, 92, t) + 6 * Math.sin(x / 60 + 1);
    const lh = { x: lerp(-372, -330, t), base: hor - lerp(20, 30, t), top: hor - lerp(132, 190, t), w: lerp(19, 24, t) };
    const headX = lerp(-250, -190, t);
    const headY = (x) => x > headX ? 1e9 : lh.base + 4 + 26 * smooth(lh.x + 20, headX, x) + 3 * Math.sin(x / 17);
    const palm = { root: [lerp(330, 300, t), beach(330) + lerp(26, 40, t)], crown: [lerp(430, 380, t), lerp(-232, A.deskY - 300 * sd, t)], s: lerp(1, 1.25, t) };
    return { t, k, hor, moon, mr, beach, lh, headX, headY, palm };
  }
  function regions4(L, A) {
    const out = regionList(), R = out.R, Y = layout4(A), F = A.F, [mx, my] = Y.moon;
    const vOf = (x, y) => clamp((y + RI) / (Y.hor + RI));
    R(
      "sky",
      "sky",
      (c) => c.rect(-RI - 4, -RI - 4, 2 * RI + 8, RI + F + 8),
      (x, y) => mix(groundColour(L, vOf(x, y), 0), C5("#6f8cc4"), 0.5 * (1 - smooth(Y.mr, Y.mr + 170, Math.hypot(x - mx, y - my)))),
      { live: "sky", mat: MAT.GLASS, fine: 1.02, src: ["outside"], halo: 2 }
    );
    R("moon", "sun", disc(mx, my, Y.mr), (x, y) => mix(C5("#f4f2ea"), C5("#cfd6e2"), smooth(0.42, 0.72, vnoise(x / 16, y / 16, 13)) * 0.8), { fine: 0.64, mat: MAT.SILVER });
    R("sea", "view", below(() => Y.hor, -RI - 4, RI + 4, F + 4), (x, y) => {
      const d = y - Y.hor, w2 = 10 + d * 0.5;
      let c = mix(P3.seaFar, P3.sea, smooth(0, 60, d));
      return mix(c, P3.path, 0.62 * (1 - smooth(w2 * 0.35, w2, Math.abs(x - mx - d * 0.05))));
    }, { src: "courses", live: "sea", fine: 0.9 });
    R(
      "head",
      "view",
      (c) => {
        c.moveTo(-RI - 4, F + 4);
        for (let x = -RI - 4; x <= Y.headX; x += 4) c.lineTo(x, Math.min(Y.headY(x), Y.beach(x) + 20));
        c.lineTo(Y.headX, F + 4);
        c.closePath();
      },
      (x, y) => {
        const c = mix(P3.headLit, P3.head, smooth(0, 70, y - Y.headY(x)));
        return vnoise(x / 26, y / 16, 19) > 0.62 ? mix(c, P3.scrub, 0.55) : c;
      },
      { src: ["sky", "sea"] }
    );
    R("sand", "view", below(Y.beach, -RI - 4, RI + 4, F + 4), (x, y) => {
      const d = y - Y.beach(x);
      if (d < 6) return P3.foam;
      if (d < 30) {
        const w2 = 14 + d * 0.4;
        return mix(P3.sandWet, P3.path, 0.5 * (1 - smooth(w2 * 0.3, w2, Math.abs(x - mx - (Y.hor - my) * 0 - d * 0.05))));
      }
      return mix(mix(mix(P3.sandLit, P3.sand, smooth(30, 70, d)), P3.sandWet, smooth(0.6, 0.82, vnoise(x / 50, y / 9, 4)) * 0.35), C5("#4c5470"), deskShadow(A, x, y) * 0.7);
    }, { src: "courses", live: "foam", fine: 0.92 });
    const lh = Y.lh, w = lh.w, H = lh.base - lh.top;
    R("tower", "lh", poly([[lh.x - w * 1.25, lh.base + 4], [lh.x - w * 0.8, lh.top], [lh.x + w * 0.8, lh.top], [lh.x + w * 1.25, lh.base + 4]]), (x, y) => {
      const v = (y - lh.top) / H, band = v > 0.22 && v < 0.38 || v > 0.58 && v < 0.74, shade2 = x > lh.x + 2;
      return band ? shade2 ? P3.redShade : P3.red : shade2 ? P3.towerShade : P3.tower;
    }, { fine: 0.62, src: "courses" });
    R("gallery", "lh", (c) => c.rect(lh.x - w * 1.15, lh.top - 7, w * 2.3, 8), () => P3.iron, { fine: 0.54 });
    R("lantern", "lh", (c) => c.rect(lh.x - w * 0.62, lh.top - 7 - w * 1.3, w * 1.24, w * 1.3), (x) => Math.abs(x - lh.x) % 9 < 2 ? mix(P3.lamp, P3.iron, 0.5) : P3.lamp, { fine: 0.5, live: "lamp", mat: MAT.GOLD });
    R("cap", "lh", (c) => {
      const r = w * 0.78, cy2 = lh.top - 7 - w * 1.3;
      c.moveTo(lh.x + r, cy2);
      c.arc(lh.x, cy2, r, 0, Math.PI, true);
      c.closePath();
    }, () => P3.cap, { fine: 0.54 });
    const pm = Y.palm, s = pm.s, [cx, cy] = pm.crown;
    R("palmTrunk", "palm", blade(...pm.root, pm.root[0] + 60 * s, (pm.root[1] + cy) / 2, cx, cy + 6, 18 * s, 11 * s), (x, y) => mix(P3.palmLit, P3.palm, 0.5 + 0.5 * smooth(-4, 8, x - (pm.root[0] + cx) / 2)), { fine: 0.6 });
    const FR = [[-150, 40, 50], [-128, -40, 46], [-70, -96, 36], [10, -108, 30], [84, -80, 36], [136, -14, 44], [128, 64, 48], [-60, 92, 30], [52, 96, 30]];
    R("fronds", "palm", union(...FR.map(([dx, dy, lift]) => blade(cx, cy, cx + dx * 0.5 * s, cy + (dy * 0.5 - lift) * s, cx + dx * s, cy + dy * s, 22 * s + 4, 2)), disc(cx, cy + 6, 13 * s)), (x, y) => mix(P3.palm, P3.palmLit, 0.55 * smooth(0, -100, (x - cx) * -0.4 + (y - cy) * 0.9)), { fine: 0.6 });
    if (Y.t < 0.4) {
      const bx = -412, by = Y.beach(-412) + 38, L2 = 78;
      const hull = (c) => {
        c.moveTo(bx - L2 - 14, by - 26);
        c.quadraticCurveTo(bx - L2 + 10, by + 4, bx - L2 + 30, by + 8);
        c.lineTo(bx + L2 - 30, by + 8);
        c.quadraticCurveTo(bx + L2 - 10, by + 4, bx + L2 + 14, by - 26);
        c.lineTo(bx + L2 - 4, by - 14);
        c.lineTo(bx - L2 + 4, by - 14);
        c.closePath();
      };
      R("boat", "boat", hull, (x, y) => y < by - 8 ? C5("#b8432f") : y < by - 3 ? C5("#e9e3d2") : mix(C5("#4a3d36"), C5("#2e2723"), smooth(by - 3, by + 8, y)), { fine: 0.6, src: "courses" });
    }
    deskRegions(R, L, A);
    return out;
  }
  function liveKind4(t, r) {
    return r.live === "sky" ? "sky" : r.live === "sea" ? "sea" : r.live === "lamp" ? "lamp" : r.live === "foam" ? "foam" : null;
  }
  function frameState4(time, L, A) {
    const Y = layout4(A), ph = time * 0.5, cx = Math.cos(ph);
    return { time, Y, beam: { side: Math.sign(cx) || 1, len: 640 * Math.pow(Math.abs(cx), 0.6), b: Math.pow(Math.abs(cx), 0.5) }, flare: Math.max(0, Math.sin(ph)) ** 8 };
  }
  function liveColour4(s, F) {
    const Y = F.Y, lamp = [Y.lh.x, Y.lh.top - 7 - Y.lh.w * 0.65];
    if (s.kind === "sky" || s.kind === "sea") {
      let col = null;
      const dx = s.ux - lamp[0], dy = s.uy - lamp[1];
      if (Math.sign(dx) === F.beam.side && Math.abs(dx) < F.beam.len) {
        const ang = Math.abs(Math.atan2(-dy - Math.abs(dx) * 0.02, Math.abs(dx))), spread = 0.07 + Math.abs(dx) * 12e-5;
        const b = Math.exp(-((ang / spread) ** 2)) * (1 - Math.abs(dx) / F.beam.len) * F.beam.b;
        if (b > 0.03) col = mix(s.col, [255, 226, 150], b * 0.6);
      }
      if (s.star) {
        const tw = 0.5 + 0.5 * Math.sin(F.time * (1.2 + s.h2 * 2.4) + s.h * 50);
        col = mix(col || s.col, [255, 246, 214], 0.2 + 0.45 * tw);
      }
      if (s.kind === "sea") {
        const d = s.uy - Y.hor, w = 10 + d * 0.5, inPath = 1 - smooth(w * 0.35, w * 1.1, Math.abs(s.ux - Y.moon[0] - d * 0.05));
        const g = Math.max(0, Math.sin(F.time * 2.6 + s.h * 70)) ** 18 * inPath;
        if (g > 0.05) col = mix(col || s.col, [255, 252, 236], g * 0.8);
      }
      return col;
    }
    if (s.kind === "lamp") return F.flare > 0.05 ? mix(s.col, [255, 252, 236], F.flare * 0.7) : null;
    if (s.kind === "foam" && s.uy - Y.beach(s.ux) < 8) {
      const f = Math.sin(F.time * 0.9 - s.ux * 0.03);
      return f > 0.4 ? mix(s.col, [236, 242, 250], (f - 0.4) * 0.9) : null;
    }
    return null;
  }
  var C5, P3, surathkal_default;
  var init_surathkal = __esm({
    "js/places/surathkal.js"() {
      init_core();
      init_geom();
      init_desk();
      init_sky();
      init_arch();
      C5 = (s) => rgb(s);
      P3 = {
        sea: C5("#34578f"),
        seaFar: C5("#4669a3"),
        path: C5("#c9d6ec"),
        foam: C5("#dde4f0"),
        head: C5("#3f5487"),
        headLit: C5("#6a82b0"),
        scrub: C5("#4f6690"),
        sand: C5("#868a92"),
        sandLit: C5("#9b9d9f"),
        sandWet: C5("#5f6a8a"),
        tower: C5("#f4f0e6"),
        towerShade: C5("#bcc2d2"),
        red: C5("#cc4e3c"),
        redShade: C5("#9e3a2e"),
        iron: C5("#2c3240"),
        lamp: C5("#fadb84"),
        cap: C5("#8e3226"),
        palm: C5("#2c4473"),
        palmLit: C5("#6b88bd"),
        outline: C5("#231d18")
      };
      surathkal_default = {
        key: "nitk",
        place: "Surathkal",
        light: light4,
        regions: regions4,
        liveKind: liveKind4,
        frameState: frameState4,
        liveColour: liveColour4,
        stars: (L, A) => {
          const Y = layout4(A);
          return starField(A, () => Y.hor - 10, [[Y.moon[0], Y.moon[1], Y.mr + 52], [Y.lh.x, Y.lh.top - 20, 40]], 7, 1.1);
        },
        isStar: (r, L, t, A) => {
          if (r.name !== "sky" || t.h <= 0.982) return false;
          const Y = layout4(A);
          return t.uy < Y.hor - 24 && Math.hypot(t.ux - Y.moon[0], t.uy - Y.moon[1]) > Y.mr + 46;
        },
        outlines: [
          ...deskOutlines(["rays", "sky", "sun", "view", "lh", "palm", "boat"]),
          { inside: ["boat"], against: ["view", "palm"] },
          { inside: ["lh"], against: ["sky", "sea", "view"] }
        ],
        alt: () => "The apse, laid in mosaic: San\u2019s desk with its lit red lamp, a stack of books, the glowing laptop, the blue paper robot and a telescope aimed at the stars, and behind it Surathkal at night: the Arabian Sea under a silver full moon, the red-and-white lighthouse on its headland with its beam sweeping, and a coconut palm, under a lapis conch full of gold stars."
      };
    }
  });

  // js/stage.js
  var stage_exports = {};
  __export(stage_exports, {
    PLACES: () => PLACES,
    createStage: () => createStage,
    smooth: () => smooth
  });
  function shade(col, h, h2, amt = 0.085) {
    const f = 1 + (h - 0.5) * amt, tilt = (h2 - 0.5) * 7;
    return [clamp(col[0] * f + tilt, 0, 255), clamp(col[1] * f, 0, 255), clamp(col[2] * f - tilt, 0, 255)];
  }
  function paintStone(c, t, col, k, ox, oy, flat = false, squash = 1) {
    if (squash < 1) corners({ ...t, w: t.w * Math.max(0.04, squash) }, q8);
    else corners(t, q8);
    c.beginPath();
    c.moveTo(q8[0] * k + ox, q8[1] * k + oy);
    for (let i = 1; i < 4; i++) c.lineTo(q8[i * 2] * k + ox, q8[i * 2 + 1] * k + oy);
    c.closePath();
    c.fillStyle = `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`;
    c.fill();
    if (flat) return;
    const dark = col[0] + col[1] + col[2] < 200;
    c.lineWidth = Math.max(0.7, k * 0.5);
    c.strokeStyle = dark ? "rgba(255,250,236,.16)" : "rgba(255,253,244,.26)";
    c.beginPath();
    c.moveTo(q8[6] * k + ox, q8[7] * k + oy);
    c.lineTo(q8[0] * k + ox, q8[1] * k + oy);
    c.lineTo(q8[2] * k + ox, q8[3] * k + oy);
    c.stroke();
    c.strokeStyle = "rgba(30,22,12,.2)";
    c.beginPath();
    c.moveTo(q8[2] * k + ox, q8[3] * k + oy);
    c.lineTo(q8[4] * k + ox, q8[5] * k + oy);
    c.lineTo(q8[6] * k + ox, q8[7] * k + oy);
    c.stroke();
  }
  async function runSliced(gen, alive) {
    let res = gen.next(), start2 = performance.now();
    while (!res.done) {
      if (performance.now() - start2 > 14) {
        await new Promise((r) => setTimeout(r, 0));
        if (!alive()) return null;
        start2 = performance.now();
      }
      res = gen.next();
    }
    return res.value;
  }
  async function createStage({ root, wallCanvas, archCanvas, conchCanvas, glintCanvas, frontEl, backEl, laneEl, sections, header, captionEl, hooks = {}, still = false, onChange, onReady, onLayout }) {
    let disposed = false, raf = 0, building = 0, resizeTimer = 0, visible = true, lastT = -1, lastPos = -1, lastKey = "", lastW = 0;
    const st = { eras: [], pos: 0, light: null, target: null, pointerAt: -1e9, tilt: null };
    const t0 = performance.now();
    const glint = createGlint(glintCanvas);
    const scrollPos = () => {
      if (hooks.pos != null) return hooks.pos;
      const G = st.G;
      if (!G) return 0;
      const vh = G.h, zone = vh - G.bandH, ref = scrollY + G.bandH + zone * 0.62, span = Math.max(150, zone * 0.75);
      const tops = sections.map((s) => s.getBoundingClientRect().top + scrollY);
      let pos = 0;
      for (let k = 1; k < tops.length; k++) {
        const a = tops[k] - span, b = tops[k];
        if (ref >= b) pos = k;
        else if (ref > a) {
          pos = k - 1 + (ref - a) / span;
          break;
        } else break;
      }
      return clamp(pos, 0, 3);
    };
    const waveD = () => 2 * RI + (RI + st.G.F) * 0.55;
    const waveAt = (ux, uy) => (RI - ux + (uy + RI) * 0.55) / waveD();
    const WAVE_W = 0.16, WAVE_J = 0.05;
    async function buildEra(i, alive) {
      if (st.eras[i]) return;
      st.eras[i] = "pending";
      const G = st.G, Z = st.Z, place = PLACES[i], L = place.light(hooks.hour), A = sceneAnchors(G.F);
      const regions5 = place.regions(L, A);
      const pre = [], skyIdx = regions5.findIndex((r) => r.name === "sky"), S6 = SHEET_STONE;
      for (const sp of place.stars ? place.stars(L, A) : []) {
        const sx = (sp.x - Z.panel.x0) * Z.q, sy = (sp.y - Z.panel.y0) * Z.q, a0 = sp.a ?? 0, col = sp.col;
        const put = (dx, dy, l, w, a) => pre.push({ x: sx + dx, y: sy + dy, a, l, w, reg: skyIdx, extra: { col, mat: MAT.GOLD, preStar: true } });
        put(0, 0, S6 * (sp.size ? 0.86 : 0.7), S6 * (sp.size ? 0.86 : 0.7), a0);
        if (sp.size >= 1) for (let k = 0; k < 4; k++) {
          const b = a0 + k * Math.PI / 2;
          put(Math.cos(b) * S6 * 0.98, Math.sin(b) * S6 * 0.98, S6 * 0.78, S6 * 0.5, b);
        }
        if (sp.size === 2) for (let k = 0; k < 4; k++) {
          const b = a0 + Math.PI / 4 + k * Math.PI / 2;
          put(Math.cos(b) * S6 * 1.02, Math.sin(b) * S6 * 1.02, S6 * 0.5, S6 * 0.4, b);
        }
      }
      const res = await runSliced(laySteps(regions5, place.outlines, { W: Z.W, H: Z.H, q: Z.q, s: SHEET_STONE, seed: 23 + i * 17, panel: Z.panel, clip: conchPath(G.F), pre }), alive);
      if (!res) {
        st.eras[i] = void 0;
        return;
      }
      const stones = res.stones, live = [], rnd = mulberry32(400 + i);
      const rb = regions5.map(() => [1e9, 1e9, -1e9, -1e9]);
      for (const t of stones) if (t.reg >= 0) {
        const b = rb[t.reg], ux = t.x / Z.q + Z.panel.x0, uy = t.y / Z.q + Z.panel.y0;
        if (ux < b[0]) b[0] = ux;
        if (uy < b[1]) b[1] = uy;
        if (ux > b[2]) b[2] = ux;
        if (uy > b[3]) b[3] = uy;
      }
      for (const t of stones) {
        t.ux = t.x / Z.q + Z.panel.x0;
        t.uy = t.y / Z.q + Z.panel.y0;
        t.w8 = clamp(waveAt(t.ux, t.uy) + (hash2(t.x * 7 | 0, t.y * 7 | 0, 5) - 0.5) * 2 * WAVE_J, -WAVE_J, 1 + WAVE_J);
        if (t.k === 0) {
          t.col = shade(L.outline || ARCH_PAL.outline, t.h, t.h2, 0.12);
          t.mat = 0;
          continue;
        }
        const r = regions5[t.reg];
        if (t.preStar) {
          t.col = shade(t.col, t.h, t.h2, 0.1);
          t.star = true;
          live.push(t);
          continue;
        }
        let col = r.fill(t.ux, t.uy), mat = r.matAt ? r.matAt(t.ux, t.uy) : r.mat || 0;
        t.star = place.isStar(r, L, t, A);
        if (t.star) {
          col = rnd() < 0.2 ? [236, 238, 240] : GOLD_TONES[t.h2 * 6 | 0];
          mat = col[2] > 200 ? MAT.SILVER : MAT.GOLD;
        } else if (mat === MAT.GOLD) {
          const rowTone = hash2(t.row, i, 9);
          col = mix(mix(col, GOLD_TONES[rowTone * 6 | 0], 0.16), GOLD_TONES[t.h2 * 6 | 0], 0.12);
        }
        if (!r.flat && !FLAT_GROUPS.has(r.group) && t.row >= 0 && t.row <= 1) {
          const b = rb[t.reg], cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2, hw = Math.max(4, (b[2] - b[0]) / 2), hh = Math.max(4, (b[3] - b[1]) / 2);
          const k = t.row === 0 ? 1 : 0.45;
          if (r.src === "courses") {
            if (t.row === 0) col = mix(col, [255, 250, 236], 0.16);
          } else {
            const lit = -((t.ux - cx) / hw * 0.62 + (t.uy - cy) / hh * 0.78);
            col = lit > 0 ? mix(col, [255, 250, 236], 0.17 * k * Math.min(1, lit * 1.6)) : mix(col, [18, 14, 10], 0.16 * k * Math.min(1, -lit * 1.6));
          }
        }
        t.col = shade(col, t.h, t.h2, mat === MAT.GOLD ? 0.07 : 0.085);
        t.mat = mat;
        t.kind = place.liveKind(t, r, L);
        t.liveKind = deskLiveKind(t, r);
        if (t.liveKind === "code") t.cursor = r.name === "code" && t.ux < A.sd * -70 && t.uy > A.deskY - 36 * A.sd;
        if (place.edgeOf) t.edge = place.edgeOf(r, t.ux, t.uy, A);
        if (t.kind || t.star || t.liveKind && (t.liveKind !== "code" || t.cursor)) live.push(t);
      }
      const cv = document.createElement("canvas");
      cv.width = Z.cw;
      cv.height = Z.ch;
      const c = cv.getContext("2d"), gr = ARCH_PAL.grout;
      c.save();
      c.setTransform(G.u * Z.dpr, 0, 0, G.u * Z.dpr, G.cx * Z.dpr - Z.cx0, G.cy * Z.dpr - Z.cy0);
      c.beginPath();
      conchPath(G.F)(c);
      c.restore();
      c.save();
      c.clip();
      c.fillStyle = `rgb(${gr.join(",")})`;
      c.fillRect(0, 0, cv.width, cv.height);
      for (const t of stones) paintStone(c, grouted(t), mix(gr, t.col, 0.5), Z.kk, Z.ox, Z.oy, true);
      for (const t of stones) paintStone(c, t, t.col, Z.kk, Z.ox, Z.oy);
      c.restore();
      if (!alive()) {
        st.eras[i] = void 0;
        return;
      }
      const sorted = stones.slice().sort((a, b) => a.w8 - b.w8);
      st.eras[i] = { cv, stones: sorted, live, L, place, A };
      uploadGlint("era" + i, stones.filter((t) => t.mat), Z, true);
    }
    function uploadGlint(key, list, Z, conch) {
      if (!glint) return;
      const G = st.G, dpr = Z.dpr, out = [];
      for (const t of list) {
        corners(t, q8);
        const cc = new Float32Array(8);
        for (let k = 0; k < 4; k++) {
          cc[k * 2] = q8[k * 2] * Z.kk + Z.gx;
          cc[k * 2 + 1] = q8[k * 2 + 1] * Z.kk + Z.gy;
        }
        const cx = t.x * Z.kk + Z.gx, cy = t.y * Z.kk + Z.gy;
        if (!conch && cy > G.bandH * dpr + 4) continue;
        const patch = (fbm(t.ux / 90, t.uy / 90, 61, 2) - 0.5) * 2, patch2 = (fbm(t.ux / 90, t.uy / 90, 83, 2) - 0.5) * 2;
        let bx = patch * 0.1, by = patch2 * 0.1;
        if (conch) {
          bx += -t.ux / RI * 0.24;
          by += -Math.min(t.uy, 0) / RI * 0.24;
        }
        const nx = bx + (t.h - 0.5) * 0.44, ny = by + (t.h2 - 0.5) * 0.44;
        out.push({ c: cc, cx, cy, nx, ny, bx, by, col: t.col, mat: t.mat, w8: t.w8 });
      }
      glint.upload(key, out);
    }
    const build = async () => {
      const id = ++building, alive = () => !disposed && id === building;
      const w = document.documentElement.clientWidth, h = backEl.clientHeight || innerHeight;
      const corner = w >= 980 && w / h >= 1.22;
      root.classList.toggle("is-corners", corner);
      root.classList.toggle("is-band", !corner);
      const headerH = header ? header.getBoundingClientRect().height : 0;
      const G = layoutApse(w, h, corner ? "corners" : "band", headerH);
      const dpr = Math.min(2, devicePixelRatio || 1);
      st.G = G;
      st.dpr = dpr;
      st.ready = false;
      st.eras = [];
      lastW = w;
      glint?.clearAll();
      onLayout?.(G);
      const stonePx = clamp(G.u * 1e3 / 132, 4.6, 7.4), q = SHEET_STONE * G.u / stonePx, su = SHEET_STONE / q;
      st.su = su;
      const panel = { x0: -G.cx / G.u - 20, y0: -G.cy / G.u - 20 };
      const AW = Math.ceil((w / G.u + 40) * q), AH = Math.ceil((h / G.u + 40) * q);
      const regs = archRegions(G), idx = (n) => regs.findIndex((r) => r.name === n);
      const ex = [];
      if (header) for (const el of header.querySelectorAll("a, .wordmark")) {
        const r = el.getBoundingClientRect(), fr = frontEl.getBoundingClientRect();
        ex.push([(r.left - fr.left - G.cx - 26) / G.u, (r.top - fr.top - G.cy - 16) / G.u, (r.right - fr.left - G.cx + 26) / G.u, (r.bottom - fr.top - G.cy + 18) / G.u]);
      }
      const pre = archPreStones(G, q, SHEET_STONE, panel, idx, ex);
      const ares = await runSliced(laySteps(regs, ARCH_OUTLINES, { W: AW, H: AH, q, s: SHEET_STONE, seed: 11, panel, pre }), alive);
      if (!ares) return;
      for (const t of ares.stones) {
        t.ux = t.x / q + panel.x0;
        t.uy = t.y / q + panel.y0;
      }
      finishArch(ares.stones, regs, G, su);
      const kk = G.u * dpr / q, aox = (panel.x0 * G.u + G.cx) * dpr, aoy = (panel.y0 * G.u + G.cy) * dpr;
      wallCanvas.width = Math.round(w * dpr);
      wallCanvas.height = Math.round(h * dpr);
      const wc = wallCanvas.getContext("2d"), gr = ARCH_PAL.grout;
      wc.fillStyle = `rgb(${mix(gr, ARCH_PAL.lapisDeep, 0.5).map((v) => v | 0).join(",")})`;
      wc.fillRect(0, 0, wallCanvas.width, wallCanvas.height);
      for (const t of ares.stones) {
        t.col = shade(t.col, t.h, t.h2, t.mat === MAT.GOLD ? 0.12 : 0.07);
        paintStone(wc, grouted(t), mix(gr, t.col, 0.45), kk, aox, aoy, true);
      }
      for (const t of ares.stones) paintStone(wc, t, t.col, kk, aox, aoy, t.mat === MAT.GLASS && !t.star);
      archCanvas.width = Math.round(w * dpr);
      archCanvas.height = Math.round(G.bandH * dpr);
      archCanvas.getContext("2d").drawImage(wallCanvas, 0, 0);
      glintCanvas.width = archCanvas.width;
      glintCanvas.height = archCanvas.height;
      uploadGlint("arch", ares.stones.filter((t) => t.mat), { kk, gx: aox, gy: aoy, dpr }, false);
      if (!alive()) return;
      const cx0 = Math.floor((G.cx - (RI + 6) * G.u) * dpr), cy0 = Math.floor((G.cy - (RI + 6) * G.u) * dpr);
      const cw = Math.ceil((2 * RI + 12) * G.u * dpr), ch = Math.ceil((RI + G.F + 12) * G.u * dpr);
      conchCanvas.width = cw;
      conchCanvas.height = ch;
      Object.assign(conchCanvas.style, { left: cx0 / dpr + "px", top: cy0 / dpr + "px", width: cw / dpr + "px", height: ch / dpr + "px" });
      const zp = { x0: -RI - 10, y0: -RI - 10 };
      const Z = {
        q,
        dpr,
        panel: zp,
        W: Math.ceil((2 * RI + 20) * q),
        H: Math.ceil((RI + G.F + 20) * q),
        kk,
        cw,
        ch,
        cx0,
        cy0,
        ox: (zp.x0 * G.u + G.cx) * dpr - cx0,
        oy: (zp.y0 * G.u + G.cy) * dpr - cy0,
        gx: (zp.x0 * G.u + G.cx) * dpr,
        gy: (zp.y0 * G.u + G.cy) * dpr
      };
      st.Z = Z;
      st.cc = conchCanvas.getContext("2d");
      const first = Math.min(3, Math.round(hooks.era != null ? hooks.era : scrollPos()));
      const need = hooks.all ? [0, 1, 2, 3] : hooks.pos != null ? [Math.floor(hooks.pos), Math.min(3, Math.ceil(hooks.pos))] : [first];
      for (const i of need) {
        await buildEra(i, alive);
        if (!alive()) return;
      }
      st.ready = true;
      lastPos = -1;
      lastKey = "";
      window.__apsePerf = { firstFrame: performance.now() - t0 };
      render(hooks.t != null ? hooks.t : 0);
      drawGlint(hooks.t != null ? hooks.t : 0, true);
      onReady?.(PLACES[0].light(hooks.hour));
      if (hooks.t == null) {
        for (const i of [first + 1, first - 1, first + 2, first - 2, first + 3, first - 3]) if (i >= 0 && i < 4) {
          await buildEra(i, alive);
          if (!alive()) return;
        }
        lastPos = -1;
        kick();
        if (window.__apsePerf) window.__apsePerf.allPlaces = performance.now() - t0;
      }
    };
    function caption(E) {
      const key = E.place.key + E.L.caption;
      if (key === lastKey) return;
      lastKey = key;
      onChange?.({ place: E.place.place, caption: E.L.caption, alt: E.place.alt(E.L), L: E.L, key: E.place.key });
      if (captionEl) captionEl.textContent = E.L.caption;
    }
    function drawLive(E, time) {
      const c = st.cc, Z = st.Z, F = E.place.frameState(time, E.L, E.A);
      for (const s of E.live) {
        let col = null;
        if (s.liveKind) col = deskLive(s, F, E.L);
        if (!col && (s.kind || s.star)) col = E.place.liveColour(s, F, E.L);
        if (col) paintStone(c, s, col, Z.kk, Z.ox, Z.oy);
      }
    }
    function render(time) {
      const c = st.cc, Z = st.Z;
      if (!c || !Z) return;
      const pos = clamp(st.pos = scrollPos(), 0, 3);
      let i = Math.min(2, Math.floor(pos)), tau = pos >= 3 ? 1 : pos - i;
      if (still) {
        i = Math.min(3, Math.round(pos));
        tau = 0;
      }
      const A = st.eras[i], B2 = st.eras[Math.min(3, i + 1)];
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, Z.cw, Z.ch);
      const okA = A && A !== "pending", okB = B2 && B2 !== "pending";
      st.wave = null;
      if (tau < 1e-3 || tau > 0.999 || !okA || !okB) {
        const E = tau > 0.999 && okB ? B2 : okA ? A : okB ? B2 : null;
        st.shown = E ? [E === A ? i : i + 1] : [];
        if (E) {
          c.drawImage(E.cv, 0, 0);
          caption(E);
          if (!(still && hooks.t == null)) drawLive(E, time);
        }
        return;
      }
      const fw = -WAVE_J + tau * (1 + 2 * WAVE_J + WAVE_W);
      st.wave = { a: i, b: i + 1, fw };
      const G = st.G, toDev = ([ux, uy]) => [(G.cx + ux * G.u) * Z.dpr - Z.cx0, (G.cy + uy * G.u) * Z.dpr - Z.cy0];
      const box = [[-RI - 8, -RI - 8], [RI + 8, -RI - 8], [RI + 8, G.F + 8], [-RI - 8, G.F + 8]];
      const half = (pts, a, keepBelow) => {
        const f = ([x, y]) => (waveAt(x, y) - a) * (keepBelow ? 1 : -1), out = [];
        for (let k = 0; k < pts.length; k++) {
          const p = pts[k], qq = pts[(k + 1) % pts.length], fp = f(p), fq = f(qq);
          if (fp <= 0) out.push(p);
          if (fp <= 0 !== fq <= 0) {
            const t = fp / (fp - fq);
            out.push([p[0] + (qq[0] - p[0]) * t, p[1] + (qq[1] - p[1]) * t]);
          }
        }
        return out;
      };
      const poly2 = (pts) => {
        if (pts.length < 3) return false;
        c.beginPath();
        pts.map(toDev).forEach(([x, y], k) => k ? c.lineTo(x, y) : c.moveTo(x, y));
        c.closePath();
        return true;
      };
      c.drawImage(A.cv, 0, 0);
      c.save();
      if (poly2(half(box, fw - WAVE_W - WAVE_J - 0.012, true))) {
        c.clip();
        c.drawImage(B2.cv, 0, 0);
      }
      c.restore();
      const lo = fw - WAVE_W - WAVE_J - 0.03, hi = fw + WAVE_J + 0.03;
      c.save();
      if (poly2(half(half(box, hi, true), lo, false))) {
        c.clip();
        c.save();
        c.setTransform(G.u * Z.dpr, 0, 0, G.u * Z.dpr, G.cx * Z.dpr - Z.cx0, G.cy * Z.dpr - Z.cy0);
        c.beginPath();
        conchPath(G.F)(c);
        c.restore();
        c.fillStyle = `rgb(${ARCH_PAL.grout.join(",")})`;
        c.fill();
        for (const E of [A, B2]) {
          const isA = E === A, S = E.stones;
          let a = 0, b = S.length;
          while (a < b) {
            const m = a + b >> 1;
            if (S[m].w8 < lo - 0.02) a = m + 1;
            else b = m;
          }
          for (let k = a; k < S.length && S[k].w8 <= hi + 0.02; k++) {
            const t = S[k], u = clamp((fw - t.w8) / WAVE_W);
            const sq = isA ? u < 0.5 ? Math.cos(u * Math.PI) : 0 : u > 0.5 ? -Math.cos(u * Math.PI) : 0;
            if (sq <= 0.02) continue;
            paintStone(c, t, mix(t.col, [30, 26, 22], (1 - sq) * 0.3), Z.kk, Z.ox, Z.oy, sq < 0.98, sq);
          }
        }
      }
      c.restore();
      caption(tau < 0.5 ? A : B2);
    }
    function lightAt(time) {
      const G = st.G, w = G.w, bh = G.bandH;
      const drift = [w * (0.5 + 0.3 * Math.sin(time * 0.11 - 0.4)), bh * (0.32 + 0.14 * Math.sin(time * 0.083 - 0.6))];
      let target = drift;
      if (hooks.light) target = [w * hooks.light[0], bh * hooks.light[1]];
      else if (st.tilt) target = [w * clamp(0.5 + st.tilt[0] / 50, -0.1, 1.1), bh * clamp(0.4 + st.tilt[1] / 60, -0.1, 1.1)];
      else if (st.target && performance.now() - st.pointerAt < 9e3) target = [w / 2 + (st.target[0] - w / 2) * 1.15, bh * 0.45 + (st.target[1] - bh * 0.45) * 1.15];
      if (!st.light || hooks.t != null || still) st.light = target.slice();
      else {
        st.light[0] += (target[0] - st.light[0]) * 0.07;
        st.light[1] += (target[1] - st.light[1]) * 0.07;
      }
      return st.light;
    }
    let lastLight = null;
    function drawGlint(time, force) {
      if (!glint || !st.G) return;
      const G = st.G, d = st.dpr, Lp = lightAt(time);
      const moved = !lastLight || Math.hypot(Lp[0] - lastLight[0], Lp[1] - lastLight[1]) > 0.25;
      if (!force && !moved && !st.wave && st.lastWave == null) return;
      st.lastWave = st.wave ? 1 : null;
      lastLight = Lp.slice();
      const draws = [{ key: "arch" }];
      if (st.wave) {
        draws.push({ key: "era" + st.wave.a, mode: 1, hi: st.wave.fw });
        draws.push({ key: "era" + st.wave.b, mode: 2, lo: st.wave.fw - WAVE_W });
      } else for (const k of st.shown || []) draws.push({ key: "era" + k });
      if (hooks.noGlint) return glint.draw([0, 0, 1], [0, 0, 1], [], 0);
      glint.draw([Lp[0] * d, Lp[1] * d, G.w * 0.5 * d], [G.w * 0.5 * d, G.bandH * 0.5 * d, G.w * 2.4 * d], draws, 1);
    }
    const frame = (now) => {
      raf = 0;
      if (disposed || document.hidden || !st.ready || !visible) return;
      const t = (now - t0) / 1e3, pos = scrollPos();
      const a = performance.now();
      if (pos !== lastPos || t - lastT > 1 / 15) {
        render(t);
        lastT = t;
        lastPos = pos;
      }
      drawGlint(t);
      if (window.__apsePerf) (window.__apsePerf.frames || (window.__apsePerf.frames = [])).push(performance.now() - a);
      raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!still && !raf && st.ready && !disposed && !document.hidden && visible && hooks.t == null) raf = requestAnimationFrame(frame);
    };
    const onScroll = () => {
      if (still && st.ready) {
        const p = Math.round(scrollPos());
        if (p !== lastPos) {
          lastPos = p;
          render(0);
          drawGlint(0, true);
        }
      } else kick();
    };
    const onVis = () => {
      if (!document.hidden) kick();
    };
    const onPointer = (e) => {
      if (e.pointerType === "touch" && !st.touchLight) return;
      st.target = [e.clientX, e.clientY];
      st.pointerAt = performance.now();
      kick();
    };
    const onTilt = (e) => {
      if (e.gamma == null) return;
      st.tilt = [e.gamma, (e.beta ?? 45) - 45];
      kick();
    };
    document.addEventListener("visibilitychange", onVis);
    addEventListener("scroll", onScroll, { passive: true });
    if (!still) addEventListener("pointermove", onPointer, { passive: true });
    const io = new IntersectionObserver((es) => {
      visible = es[0].isIntersecting;
      kick();
    });
    io.observe(frontEl);
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (Math.abs(document.documentElement.clientWidth - lastW) > 1 || Math.abs((backEl.clientHeight || innerHeight) - st.G.h) > 120) build();
      }, 220);
    };
    addEventListener("resize", onResize);
    await build();
    if (hooks.t != null) window.__light = (x, y) => {
      hooks.light = [x, y];
      drawGlint(0, true);
    };
    if (hooks.t != null) window.__renderAt = (t, pos) => {
      if (pos != null) hooks.pos = pos;
      const a = performance.now();
      render(t);
      drawGlint(t, true);
      return performance.now() - a;
    };
    return {
      /** device tilt (only after permission where a browser asks for it) */
      enableTilt() {
        if (still) return;
        addEventListener("deviceorientation", onTilt);
      },
      glintOk: !!glint,
      destroy() {
        disposed = true;
        cancelAnimationFrame(raf);
        io.disconnect();
        removeEventListener("resize", onResize);
        removeEventListener("scroll", onScroll);
        removeEventListener("pointermove", onPointer);
        removeEventListener("deviceorientation", onTilt);
        document.removeEventListener("visibilitychange", onVis);
      }
    };
  }
  var PLACES, SHEET_STONE, FLAT_GROUPS, q8, GOLD_TONES, grouted;
  var init_stage = __esm({
    "js/stage.js"() {
      init_core();
      init_geom();
      init_lay();
      init_arch();
      init_desk();
      init_glint();
      init_sanjose();
      init_sandiego();
      init_bengaluru();
      init_surathkal();
      PLACES = [sanjose_default, sandiego_default, bengaluru_default, surathkal_default];
      SHEET_STONE = 6;
      FLAT_GROUPS = /* @__PURE__ */ new Set(["sky", "view", "sun", "cloud", "city", "robotEye"]);
      q8 = new Float32Array(8);
      GOLD_TONES = ["#c9a04a", "#d8b35c", "#b3883a", "#e0bd68", "#a77c32", "#cfa654"].map((h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
      grouted = (t) => ({ ...t, l: t.l + t.s * 0.2, w: t.w + t.s * 0.2 });
    }
  });

  // js/tablet.js
  var tablet_exports = {};
  __export(tablet_exports, {
    clamp: () => clamp,
    paintTablet: () => paintTablet
  });
  function outline(c, x0, x1, h, ansae, ear) {
    c.moveTo(x0, 0);
    c.lineTo(x1, 0);
    if (ansae) {
      const cy = h / 2, n = h * 0.2, m = h * 0.36;
      c.lineTo(x1, cy - n);
      c.lineTo(x1 + ear, cy - m);
      c.lineTo(x1 + ear, cy + m);
      c.lineTo(x1, cy + n);
    }
    c.lineTo(x1, h);
    c.lineTo(x0, h);
    if (ansae) {
      const cy = h / 2, n = h * 0.2, m = h * 0.36;
      c.lineTo(x0, cy + n);
      c.lineTo(x0 - ear, cy + m);
      c.lineTo(x0 - ear, cy - m);
      c.lineTo(x0, cy - n);
    }
    c.closePath();
  }
  async function paintTablet(target, w, h, { ansae = false, ear = 0, stonePx = 6.6, rows = 4, seed = 3, dpr = 1 } = {}) {
    const pad = ansae ? ear : 0, W = w + 2 * pad;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(h * dpr);
    const c = canvas.getContext("2d");
    const frameW = stonePx * rows;
    const m = marbleSlab(seed);
    c.save();
    c.scale(dpr, dpr);
    c.beginPath();
    outline(c, pad, pad + w, h, ansae, ear);
    c.fillStyle = `rgb(${P4.grout.join(",")})`;
    c.fill();
    c.save();
    c.beginPath();
    c.rect(pad + frameW, frameW, w - 2 * frameW, h - 2 * frameW);
    c.clip();
    c.imageSmoothingQuality = "high";
    const sw = m.width * 2, sh = m.height * 2, cxm = pad + w / 2;
    for (let y0 = 0, flip = false; y0 < h; y0 += sh, flip = !flip) {
      for (const side of [-1, 1]) {
        c.save();
        c.translate(cxm, y0 + (flip ? sh : 0));
        c.scale(side, flip ? -1 : 1);
        c.drawImage(m, -1.5, -1.5, sw + 1.5, sh + 3);
        c.restore();
      }
    }
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "rgba(255,252,240,.18)");
    g.addColorStop(1, "rgba(120,100,70,.06)");
    c.fillStyle = g;
    c.fillRect(0, 0, W, h);
    c.restore();
    c.restore();
    const q = SHEET_STONE2 / stonePx, panel = { x0: -4, y0: -4 };
    const regions5 = [
      { name: "frame", group: "frame", clip: false, fine: 1, src: ["outside"], draw: (cc) => outline(cc, pad, pad + w, h, ansae, ear), fill: () => P4.gold[0] },
      { name: "field", group: "field", clip: false, skip: true, draw: (cc) => cc.rect(pad + frameW - 0.5, frameW - 0.5, w - 2 * frameW + 1, h - 2 * frameW + 1), fill: () => P4.marble }
    ];
    const gen = laySteps(regions5, [{ inside: ["frame"], against: ["outside"] }], { W: Math.ceil((W + 8) * q), H: Math.ceil((h + 8) * q), q, s: SHEET_STONE2, seed, panel });
    let res = gen.next(), t0 = performance.now();
    while (!res.done) {
      if (performance.now() - t0 > 12) {
        await new Promise((r) => setTimeout(r, 0));
        t0 = performance.now();
      }
      res = gen.next();
    }
    const rnd = mulberry32(seed * 13);
    const kk = dpr / q, ox = panel.x0 * dpr, oy = panel.y0 * dpr;
    const depth = (x, y) => {
      const xr = Math.min(x - pad, pad + w - x), yr = Math.min(y, h - y);
      if (x < pad || x > pad + w) return Math.min(yr, Math.abs(x < pad ? x - pad + ear : pad + w + ear - x), Math.abs(Math.abs(y - h / 2) - h * 0.36 * (1 - 0)) + 0);
      return Math.min(xr, yr);
    };
    for (const t of res.value.stones) {
      const x = t.x / q + panel.x0, y = t.y / q + panel.y0;
      if (t.k === 0) {
        t.col = P4.outline;
        continue;
      }
      const r = Math.floor(depth(x, y) / stonePx);
      t.col = r <= 1 ? P4.gold[rnd() * 4 | 0] : r === 2 ? mix(P4.red, P4.redLit, rnd() * 0.6) : P4.gold[rnd() * 4 | 0];
      if (x < pad || x > pad + w) t.col = t.row % 3 === 1 ? mix(P4.red, P4.redLit, rnd() * 0.6) : P4.gold[rnd() * 4 | 0];
    }
    for (const t of res.value.stones) paint(c, { ...t, l: t.l + t.s * 0.2, w: t.w + t.s * 0.2 }, mix(P4.grout, t.col, 0.45), kk, ox, oy, true);
    for (const t of res.value.stones) paint(c, t, t.col, kk, ox, oy, false);
    target.width = canvas.width;
    target.height = canvas.height;
    target.style.width = W + "px";
    target.style.height = h + "px";
    target.style.left = -pad + "px";
    target.getContext("2d").drawImage(canvas, 0, 0);
  }
  function marbleSlab(seed) {
    const key = seed % 3;
    if (slabs.has(key)) return slabs.get(key);
    const mw = 340, mh = 260, m = document.createElement("canvas");
    m.width = mw;
    m.height = mh;
    const mc = m.getContext("2d"), img = mc.createImageData(mw, mh), d = img.data;
    for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) {
      const X = x * 2, Y = y * 2;
      const warp = fbm(X / 210, Y / 210, key + 3, 3) * 4.2;
      const v = Math.abs(Math.sin((X * 6e-3 + Y * 0.011 + warp) * 3.1));
      const v2 = Math.abs(Math.sin((X * 0.013 - Y * 4e-3 + warp * 1.7) * 2.3));
      let col = mix(P4.marble, P4.warm, fbm(X / 300, Y / 260, key + 12, 2) * 0.7);
      col = mix(col, P4.vein, (1 - smooth(0, 0.06, v)) * 0.45);
      col = mix(col, P4.vein2, (1 - smooth(0, 0.02, v2)) * 0.22);
      const k = (y * mw + x) * 4;
      d[k] = col[0];
      d[k + 1] = col[1];
      d[k + 2] = col[2];
      d[k + 3] = 255;
    }
    mc.putImageData(img, 0, 0);
    slabs.set(key, m);
    return m;
  }
  function paint(c, t, col, k, ox, oy, flat) {
    corners(t, q82);
    c.beginPath();
    c.moveTo(q82[0] * k + ox, q82[1] * k + oy);
    for (let i = 1; i < 4; i++) c.lineTo(q82[i * 2] * k + ox, q82[i * 2 + 1] * k + oy);
    c.closePath();
    c.fillStyle = `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`;
    c.fill();
    if (flat) return;
    c.lineWidth = Math.max(0.7, k * 0.5);
    c.strokeStyle = "rgba(255,253,244,.28)";
    c.beginPath();
    c.moveTo(q82[6] * k + ox, q82[7] * k + oy);
    c.lineTo(q82[0] * k + ox, q82[1] * k + oy);
    c.lineTo(q82[2] * k + ox, q82[3] * k + oy);
    c.stroke();
  }
  var P4, SHEET_STONE2, q82, slabs;
  var init_tablet = __esm({
    "js/tablet.js"() {
      init_core();
      init_lay();
      P4 = {
        marble: rgb("#f7f2e6"),
        vein: rgb("#dcd2bf"),
        vein2: rgb("#cbbfa7"),
        warm: rgb("#f3e8d2"),
        gold: [rgb("#d9ad4f"), rgb("#e8c46a"), rgb("#c0913a"), rgb("#f0d488")],
        red: rgb("#8e2c27"),
        redLit: rgb("#a8392f"),
        outline: rgb("#231d18"),
        grout: rgb("#3e392f"),
        lapis: rgb("#1e2f66")
      };
      SHEET_STONE2 = 6;
      q82 = new Float32Array(8);
      slabs = /* @__PURE__ */ new Map();
    }
  });

  // js/frieze.js
  var frieze_exports = {};
  __export(frieze_exports, {
    paintFrieze: () => paintFrieze
  });
  async function paintFrieze(canvas, stonePx, dpr) {
    const w = canvas.getBoundingClientRect().width || document.documentElement.clientWidth;
    const band = Math.round(stonePx * 7), loose = Math.round(stonePx * 6), h = band + loose;
    canvas.style.height = h + "px";
    canvas.style.background = "transparent";
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const c = canvas.getContext("2d");
    c.fillStyle = `rgb(${P5.plaster.join(",")})`;
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = `rgb(${P5.grout.join(",")})`;
    c.fillRect(0, 0, canvas.width, band * dpr);
    const S = 6, q = S / stonePx, panel = { x0: -4, y0: -4 };
    const regions5 = [{ name: "band", group: "band", clip: false, fine: 1, src: "courses", draw: (cc) => cc.rect(-4, -2, w + 8, band + 2), fill: () => P5.gold[0] }];
    const gen = laySteps(regions5, [], { W: Math.ceil((w + 8) * q), H: Math.ceil((band + 8) * q), q, s: S, seed: 9, panel });
    let res = gen.next();
    while (!res.done) res = gen.next();
    const rnd = mulberry32(19), kk = dpr / q, ox = panel.x0 * dpr, oy = panel.y0 * dpr;
    for (const t of res.value.stones) {
      const y = t.y / q + panel.y0, row = Math.floor(y / stonePx);
      t.col = row <= 1 ? mix(P5.lapis, P5.lapisDeep, rnd() * 0.6) : row === 2 || row === 6 ? P5.outline : row === 4 ? P5.red : P5.gold[rnd() * 4 | 0];
    }
    const extra = [];
    for (let x = stonePx * 0.5; x < w; x += stonePx * 1.15) for (let d = 0; d < loose; d += stonePx) {
      const p = 1 - d / loose;
      if (rnd() > p * p * 0.55) continue;
      const s = stonePx * (0.55 + 0.3 * rnd()) * (0.75 + 0.25 * p);
      extra.push({ x: (x + (rnd() - 0.5) * stonePx * 0.8 - panel.x0) * q, y: (band + d + stonePx * 0.5 + (rnd() - 0.5) * stonePx * 0.6 - panel.y0) * q, a: (rnd() - 0.5) * 0.9, l: s * q, w: s * q * 0.85, s: stonePx * q, j: new Float32Array(8).map(() => (rnd() - 0.5) * stonePx * q * 0.1), col: rnd() < 0.45 ? P5.gold[rnd() * 4 | 0] : rnd() < 0.5 ? mix(P5.lapis, P5.lapisDeep, rnd()) : P5.cream });
    }
    for (const t of res.value.stones) paint2(c, { ...t, l: t.l + t.s * 0.2, w: t.w + t.s * 0.2 }, mix(P5.grout, t.col, 0.45), kk, ox, oy, true);
    for (const t of [...res.value.stones, ...extra]) paint2(c, t, t.col, kk, ox, oy, false);
  }
  function paint2(c, t, col, k, ox, oy, flat) {
    corners(t, q83);
    c.beginPath();
    c.moveTo(q83[0] * k + ox, q83[1] * k + oy);
    for (let i = 1; i < 4; i++) c.lineTo(q83[i * 2] * k + ox, q83[i * 2 + 1] * k + oy);
    c.closePath();
    c.fillStyle = `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`;
    c.fill();
    if (flat) return;
    c.lineWidth = Math.max(0.7, k * 0.5);
    c.strokeStyle = "rgba(255,253,244,.25)";
    c.beginPath();
    c.moveTo(q83[6] * k + ox, q83[7] * k + oy);
    c.lineTo(q83[0] * k + ox, q83[1] * k + oy);
    c.lineTo(q83[2] * k + ox, q83[3] * k + oy);
    c.stroke();
  }
  var P5, q83;
  var init_frieze = __esm({
    "js/frieze.js"() {
      init_core();
      init_lay();
      P5 = { lapis: rgb("#1f3170"), lapisDeep: rgb("#142152"), gold: [rgb("#d9ad4f"), rgb("#e8c46a"), rgb("#c0913a"), rgb("#f0d488")], red: rgb("#8e2c27"), outline: rgb("#231d18"), grout: rgb("#3e392f"), plaster: rgb("#efe8d9"), cream: rgb("#e9dfc8") };
      q83 = new Float32Array(8);
    }
  });

  // js/history-data.js
  var history_data_default = [
    {
      "year": "2025",
      "title": "First place at the NeurIPS EAI Challenge",
      "description": "[Chin](https://chin.bio) and I won first place in the NeurIPS 2025 Embodied Agent Interface Challenge, as team AxisTilted2. We built language-model agents that reason about physical tasks in simulated environments.",
      "id": "eai-challenge",
      "month": "December",
      "location": "San Diego, CA",
      "category": "Competition",
      "images": [
        {
          "src": "/images/awards/uist-2023-presentation.jpg",
          "alt": "San and Chin receiving first place at NeurIPS 2025.",
          "caption": "First place at NeurIPS 2025"
        }
      ],
      "links": [
        [
          "/notes/eai-challenge",
          "Read the account"
        ],
        [
          "https://openreview.net/pdf?id=gABfrJI5ni",
          "Research paper"
        ],
        [
          "/documents/certificates/award_certificate_AxisTilted2.pdf",
          "Award certificate"
        ]
      ],
      "date": "2025-12"
    },
    {
      "year": "2024",
      "title": "Joined eBay as an AI researcher",
      "description": "I joined eBay\u2019s Knowledge Extraction team in April 2024, where I research and build language-model systems for information extraction. I was promoted in October 2025.",
      "id": "ebay-research",
      "month": "April",
      "location": "San Jose, CA",
      "category": "Work",
      "images": [
        {
          "src": "/images/history/ebay-headquarters.webp",
          "alt": "San outside eBay headquarters.",
          "caption": "eBay headquarters, San Jose"
        }
      ],
      "links": [
        [
          "/resume",
          "Current work"
        ]
      ],
      "date": "2024-04"
    },
    {
      "year": "2024",
      "title": "Completed my MS at UC San Diego",
      "description": "I completed an MS in computer science at UC San Diego, working with Julian McAuley\u2019s group on AI music and language models and TA\u2019ing recommender systems and data mining.",
      "id": "ucsd-graduation",
      "month": "March",
      "location": "San Diego, CA",
      "category": "Education",
      "images": [
        {
          "src": "/images/history/research-group.webp",
          "alt": "The UC San Diego research group outdoors in 2023.",
          "caption": "With Julian McAuley\u2019s research group, 2023"
        }
      ],
      "links": [],
      "date": "2024-03"
    },
    {
      "year": "2023",
      "title": "A UIST award for turning papers into zines",
      "description": "ZINify, which [Jaidev Shriram](https://jaidevshriram.com/) and I built, received an Honorable Mention at the UIST Student Innovation Contest. It uses language models to turn research papers into illustrated zines.",
      "id": "zinify",
      "month": "October",
      "location": "San Francisco, CA",
      "category": "Research",
      "images": [
        {
          "src": "/images/history/uist-award.webp",
          "alt": "San and Jaidev Shriram holding the UIST 2023 award.",
          "caption": "With Jaidev Shriram at UIST 2023"
        }
      ],
      "links": [
        [
          "https://jaidevshriram.com/zinify-uist/",
          "See ZINify"
        ],
        [
          "https://dl.acm.org/doi/abs/10.1145/3586182.3625118",
          "Research paper"
        ],
        [
          "/documents/certificates/Certificate%20UIST%20ACM%20-%20Hon%20Mention.pdf",
          "Award certificate"
        ]
      ],
      "date": "2023-10"
    },
    {
      "year": "2023",
      "title": "A writing-assistant startup at UCSD\u2019s StartR accelerator",
      "description": "I co-founded Glyp, a writing assistant for novelists, and took it through UCSD\u2019s StartR Rady accelerator. It didn\u2019t make it to market, and I wrote about what went wrong.",
      "id": "startr",
      "month": "October",
      "location": "San Diego, CA",
      "category": "Startup",
      "images": [],
      "links": [
        [
          "/notes/startr-postmortem",
          "Read the post-mortem"
        ]
      ],
      "date": "2023-10"
    },
    {
      "year": "2023",
      "title": "A summer research internship at eBay",
      "description": "I spent the summer researching information extraction at scale with eBay\u2019s Knowledge Extraction team.",
      "id": "ebay-internship",
      "month": "June",
      "location": "San Jose, CA",
      "category": "Work",
      "images": [
        {
          "src": "/images/history/ebay-intern.webp",
          "alt": "San beside the planted eBay sign during his internship.",
          "caption": "The summer research internship, 2023"
        }
      ],
      "links": [],
      "date": "2023-06"
    },
    {
      "year": "2023",
      "title": "Won the eBay ML Challenge: first of 591 teams",
      "description": "I placed first of 591 teams in the eBay University Machine Learning Challenge, extracting named entities from product titles with DeBERTa-v3 and K-fold ensembling. The result, announced in January 2023, led to the summer research internship.",
      "id": "ebay-ml-challenge",
      "month": "January",
      "location": "San Diego, CA",
      "category": "Competition",
      "images": [],
      "links": [
        [
          "https://innovation.ebayinc.com/stories/ebay-announces-winners-of-4th-annual-machine-learning-challenge/",
          "The announcement"
        ],
        [
          "/documents/certificates/eBay%20ML%20Challenge%20Letter.pdf",
          "Award letter"
        ]
      ],
      "date": "2023-01"
    },
    {
      "year": "2022",
      "title": "Moved from chip design to computer science at UCSD",
      "description": "I started the MS at UC San Diego after three years in chip design.",
      "id": "ucsd-start",
      "month": "September",
      "location": "San Diego, CA",
      "category": "Education",
      "images": [
        {
          "src": "/images/history/ucsd-library.webp",
          "alt": "San outside Geisel Library at UC San Diego.",
          "caption": "Starting at UC San Diego, 2022"
        }
      ],
      "links": [],
      "date": "2022-09"
    },
    {
      "year": "2019",
      "title": "Three years designing chips at Texas Instruments",
      "description": "I spent 2019\u20132022 on ASIC digital design at Texas Instruments: physical design, RTL, and getting actual chips out the door.",
      "id": "texas-instruments",
      "month": "July",
      "location": "Bengaluru, India",
      "category": "Work",
      "images": [
        {
          "src": "/images/locations/ti-bangalore.jpg",
          "alt": "San outside the Texas Instruments office in Bengaluru.",
          "caption": "Texas Instruments, Bengaluru"
        }
      ],
      "links": [
        [
          "/resume",
          "Engineering background"
        ]
      ],
      "date": "2019-07"
    },
    {
      "year": "2019",
      "title": "Electrical engineering at NIT Karnataka",
      "description": "I graduated in electrical and electronics engineering. I got into deep learning through Kaggle, earning silver and bronze medals. My thesis on power-quality classification won a best-paper award at IEEE DISCOVER, and the Amateur Astronomy Club gave me a place to explore astronomy.",
      "id": "nitk",
      "month": "May",
      "location": "Karnataka, India",
      "category": "Education",
      "images": [
        {
          "src": "/images/history/nitk-lab.webp",
          "alt": "An oscilloscope showing a signal in the NITK electronics laboratory.",
          "caption": "The electronics lab at NITK"
        }
      ],
      "links": [
        [
          "/documents/certificates/24_DISCOVER_BestPaper%20(2).pdf",
          "Best paper certificate"
        ],
        [
          "https://kaggle.com/spsanps",
          "Kaggle profile"
        ]
      ],
      "date": "2019-05"
    }
  ];

  // js/eras.js
  var byId = Object.fromEntries(history_data_default.map((m) => [m.id, m]));
  var PHOTOS = {
    "neurips-award": "photos/neurips-award.jpg",
    "ebay-headquarters": "photos/ebay-headquarters.jpg",
    "ucsd-library": "photos/ucsd-library.jpg",
    "research-group": "photos/research-group.jpg",
    "uist-award": "photos/uist-award.jpg",
    "ebay-intern": "photos/ebay-intern.webp",
    "ti-bengaluru": "photos/ti-bengaluru.jpg",
    "nitk-lab": "photos/nitk-lab.jpg"
  };
  var LOCAL = {
    "/images/awards/uist-2023-presentation.jpg": PHOTOS["neurips-award"],
    "/images/history/ebay-headquarters.webp": PHOTOS["ebay-headquarters"],
    "/images/history/research-group.webp": PHOTOS["research-group"],
    "/images/history/uist-award.webp": PHOTOS["uist-award"],
    "/images/history/ebay-intern.webp": PHOTOS["ebay-intern"],
    "/images/history/ucsd-library.webp": PHOTOS["ucsd-library"],
    "/images/locations/ti-bangalore.jpg": PHOTOS["ti-bengaluru"],
    "/images/history/nitk-lab.webp": PHOTOS["nitk-lab"]
  };
  var localImage = (src) => LOCAL[src] || src;
  var ERA_LIST = [
    { key: "now", place: "San Jose", years: "2024 \u2013 now", role: "AI research at eBay", ids: ["eai-challenge", "ebay-research"] },
    { key: "sd", place: "San Diego", years: "2022 \u2013 2024", role: "MS in computer science, UC San Diego", ids: ["ucsd-graduation", "zinify", "startr", "ebay-internship", "ebay-ml-challenge", "ucsd-start"] },
    { key: "blr", place: "Bengaluru", years: "2019 \u2013 2022", role: "Chip design at Texas Instruments", ids: ["texas-instruments"] },
    { key: "nitk", place: "Surathkal", years: "2015 \u2013 2019", role: "Electrical engineering at NIT Karnataka", ids: ["nitk"] }
  ].map((era) => ({ ...era, milestones: era.ids.map((id) => byId[id]) }));
  if (ERA_LIST.reduce((n, e) => n + e.milestones.length, 0) !== history_data_default.length || ERA_LIST.some((e) => e.milestones.some((m) => !m))) {
    throw new Error("Every milestone in history.json must appear exactly once.");
  }
  var monthYear = (m) => `${m.month} ${m.year}`;

  // js/main.js
  var esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  var SITE = "https://www.sankala.me";
  var href = (h) => h.startsWith("/") ? SITE + h : h;
  function withLinks(text) {
    return text.split(/(\[[^\]]+\]\(https?:\/\/[^)\s]+\))/).map((part) => {
      const m = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
      return m ? `<a href="${esc(m[2])}">${esc(m[1])}</a>` : esc(part);
    }).join("");
  }
  var num = (p, k) => p.has(k) && !Number.isNaN(parseFloat(p.get(k))) ? parseFloat(p.get(k)) : void 0;
  var WORKS = [
    ["nobody-owes-anything-now", "Nobody Owes Anything Now", "Poem", 2026, "/notes/nobody-owes-anything-now"],
    ["capricious-god", "How to Please a Capricious God", "Film", 2026, "https://www.paperrobots.studio/films/capricious-god/"],
    ["another-sky", "Another Sky", "Experiment", 2026, "https://dysonswarm.com/another-sky/"],
    ["eai-challenge", "Winning by Overfitting", "Essay / note", 2026, "/notes/eai-challenge"],
    ["a-clauiet-life", "A Clauiet Life", "Experiment", 2026, "/toys/bee-sim/index.html"],
    ["gpt7-will-have-arms", "GPT-7 Will Have Arms", "Essay / note", 2025, "/essays/gpt7-will-have-arms"],
    ["startr-postmortem", "Glyp: A Post-Mortem", "Essay / note", 2025, "/notes/startr-postmortem"],
    ["dyson-swarm", "Dyson Swarm", "Experiment", 2024, "https://dysonswarm.com/swarm/"],
    ["zinify", "ZINify: research to zines", "Research", 2023, "/notes/zinify"],
    ["power-quality", "Power quality event classification with LSTMs", "Research", 2019, "/notes/power-quality"]
  ];
  function lane(still) {
    const intro = `<section class="tab tab-intro" aria-labelledby="hello"><canvas class="tab-art" aria-hidden="true"></canvas><div class="tab-text">
      <h1 id="hello">Hi, I\u2019m San.</h1>
      <p class="lede">I work on language models at eBay. Before that: computer science at UC San Diego, chip design at Texas Instruments, and electrical engineering at NIT Karnataka. Along the way I co-founded <a href="${SITE}/notes/startr-postmortem">a startup that didn\u2019t make&nbsp;it</a>. I also write, make things, and sometimes turn an idea into a film.</p>
      <p class="more"><a href="${SITE}/about">More about me</a><span class="mail">san@sankala.me</span>${still ? '<a href="?">Living version</a>' : '<a href="?plain=1">Still version</a>'}</p>
    </div></section>
    <p class="wall-note">The apse is laid in stones, in code. In San Jose it keeps the real time; scroll, and it is re-laid for each place I\u2019ve lived and worked.<span class="clock"></span><button type="button" class="tilt" hidden>Tilt your phone to catch the light</button></p>
    <h2 class="path" id="history">My path so far</h2>`;
    return intro + ERA_LIST.map((era, index) => `<section class="tab place" data-frame="${era.key}" aria-labelledby="place-${era.key}"><canvas class="tab-art" aria-hidden="true"></canvas><div class="tab-text">
    <header class="place-head"><span class="years">${esc(era.years)}</span><h2 id="place-${era.key}">${esc(era.place)}</h2><span class="role">${esc(era.role)}</span></header>
    <ol class="entries">${era.milestones.map((m) => `<li id="history-${m.id}" class="${m.images.length ? "has-print" : ""}">
      <div><time datetime="${m.date}">${esc(monthYear(m))}</time><h3>${esc(m.title)}</h3><p>${withLinks(m.description)}</p>
      ${m.links.length ? `<p class="links">${m.links.map(([h, l]) => `<a href="${esc(href(h))}">${esc(l)}</a>`).join("")}</p>` : ""}</div>
      ${m.images.map((im) => `<a class="print" href="${esc(localImage(im.src))}" data-caption="${esc(im.caption)}" aria-label="Enlarge photograph: ${esc(im.caption)}"><img src="${esc(localImage(im.src))}" alt="${esc(im.alt)}" loading="lazy" decoding="async"></a>`).join("")}
    </li>`).join("")}</ol>
  </div></section>`).join("");
  }
  async function start() {
    const params = new URLSearchParams(location.search);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const still = params.get("plain") === "1" || reduce;
    const root = document.querySelector(".apse");
    const laneEl = root.querySelector(".apse-lane");
    laneEl.innerHTML = lane(still);
    document.querySelector(".covers").innerHTML = WORKS.map(([slug, title, kind, year, url]) => `<li><a class="cover" href="${esc(href(url))}"><span class="cover-art"><img src="covers/${slug}-360.webp" alt="" width="360" height="540" loading="lazy" decoding="async"></span><span class="cover-title">${esc(title)}</span></a><span class="cover-meta">${esc(kind)} \xB7 ${year}</span></li>`).join("");
    const dlg = root.querySelector(".lightbox");
    laneEl.addEventListener("click", (e) => {
      const a = e.target.closest(".print");
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      dlg.querySelector("figure").innerHTML = `<img src="${a.getAttribute("href")}" alt="${esc(a.querySelector("img").alt)}"><figcaption>${esc(a.dataset.caption)}</figcaption>`;
      dlg.showModal();
    });
    dlg.addEventListener("click", (e) => {
      if (e.target === dlg || e.target.closest(".lightbox-close")) dlg.close();
    });
    const [{ createStage: createStage2 }, { paintTablet: paintTablet2 }, { paintFrieze: paintFrieze2 }] = await Promise.all([Promise.resolve().then(() => (init_stage(), stage_exports)), Promise.resolve().then(() => (init_tablet(), tablet_exports)), Promise.resolve().then(() => (init_frieze(), frieze_exports))]);
    const ERA_KEYS = ["now", "sd", "blr", "nitk"];
    const hooks = { t: num(params, "t"), hour: num(params, "hour"), pos: num(params, "pos"), era: ERA_KEYS.includes(params.get("era")) ? ERA_KEYS.indexOf(params.get("era")) : void 0 };
    if (hooks.era != null && hooks.pos == null) hooks.pos = hooks.era;
    hooks.all = params.get("all") === "1";
    if (hooks.t != null) document.documentElement.classList.add("is-frozen");
    if (params.has("light")) hooks.light = params.get("light").split(",").map(Number);
    hooks.noGlint = params.get("glint") === "0";
    const clock = laneEl.querySelector(".clock");
    const tablets = [...laneEl.querySelectorAll(".tab")];
    let stonePx = 6.6, wide = true, tabletsDone = Promise.resolve();
    const dpr = Math.min(2, devicePixelRatio || 1);
    const paintOne = (el, i) => {
      const intro = el.classList.contains("tab-intro"), r = el.getBoundingClientRect();
      return paintTablet2(el.querySelector(".tab-art"), r.width, r.height, { ansae: intro && wide, ear: intro ? Math.min(46, stonePx * 7) : 0, stonePx, rows: 4, seed: 3 + i * 7, dpr }).then(() => el.classList.add("is-painted"));
    };
    const paintAll = async (firstOnly) => {
      await paintOne(tablets[0], 0);
      const rest = () => Promise.all(tablets.slice(1).map((el, k) => paintOne(el, k + 1))).then(() => paintFrieze2(document.querySelector(".frieze"), stonePx, dpr));
      if (firstOnly) {
        tabletsDone = new Promise((res) => setTimeout(() => rest().then(res), 30));
        return;
      }
      tabletsDone = rest();
      return tabletsDone;
    };
    let lastWidths = "";
    const ro = new ResizeObserver(() => {
      const key = tablets.map((t) => `${Math.round(t.getBoundingClientRect().width)}x${Math.round(t.getBoundingClientRect().height)}`).join(",");
      if (key !== lastWidths) {
        lastWidths = key;
        clearTimeout(ro.t);
        ro.t = setTimeout(() => paintAll(false), 160);
      }
    });
    const stage = await createStage2({
      root,
      wallCanvas: root.querySelector(".apse-wall"),
      archCanvas: root.querySelector(".apse-arch"),
      conchCanvas: root.querySelector(".apse-conch"),
      glintCanvas: root.querySelector(".apse-glint"),
      frontEl: root.querySelector(".apse-front"),
      backEl: root.querySelector(".apse-back"),
      laneEl,
      sections: [...laneEl.querySelectorAll(".place")],
      header: document.querySelector(".site-header"),
      captionEl: root.querySelector(".apse-caption"),
      hooks,
      still,
      onLayout: (G) => {
        const s = document.documentElement.style, u = G.u;
        s.setProperty("--band", G.bandH + "px");
        s.setProperty("--conch-w", Math.round(2 * 500 * u) + "px");
        s.setProperty("--tab-w", Math.round(2 * 530 * u) + "px");
        s.setProperty("--cornice-y", G.cy + G.F * u + "px");
        s.setProperty("--cornice-h", 46 * u + "px");
        stonePx = Math.max(4.6, Math.min(7.4, u * 1e3 / 132));
        wide = G.corners;
        s.setProperty("--stone", stonePx + "px");
      },
      onChange: (info) => {
        root.querySelector(".apse-conch").setAttribute("aria-label", info.alt);
      },
      onReady: async (light5) => {
        clock.textContent = `It\u2019s ${light5.label} in San Jose now.`;
        await document.fonts.ready;
        await paintAll(hooks.t == null);
        if (hooks.t != null) await tabletsDone;
        lastWidths = tablets.map((t) => `${Math.round(t.getBoundingClientRect().width)}x${Math.round(t.getBoundingClientRect().height)}`).join(",");
        tablets.forEach((t) => ro.observe(t));
        root.classList.add("is-live");
        setTimeout(() => {
          window.__ready = true;
        }, hooks.t != null ? 80 : 0);
      }
    });
    const tiltBtn = laneEl.querySelector(".tilt");
    if (!still && matchMedia("(pointer: coarse)").matches && "DeviceOrientationEvent" in window) {
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        tiltBtn.hidden = false;
        tiltBtn.addEventListener("click", async () => {
          try {
            if (await DeviceOrientationEvent.requestPermission() === "granted") {
              stage.enableTilt();
              tiltBtn.hidden = true;
            }
          } catch (e) {
            tiltBtn.hidden = true;
          }
        });
      } else stage.enableTilt();
    }
  }
  start();
})();
