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
    const A = typeof a === "string" ? rgb(a) : a, B = typeof b === "string" ? rgb(b) : b;
    const out = [lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)];
    if (A.length > 3 || B.length > 3) out.push(lerp(A[3] ?? 1, B[3] ?? 1, t));
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
  function outerDepth(x, y) {
    if (y >= CY) return Math.min(x, 1e3 - x);
    return R_OUT - Math.hypot(x - CX, y - CY);
  }
  function innerDepth(x, y) {
    return Math.hypot(x - CX, Math.min(y, CY) - CY) - R_IN;
  }
  function frameParam(x, y) {
    const arcLen = Math.PI * R_OUT, side = SILL - CY, total = arcLen + 2 * side;
    if (y >= CY) return x < CX ? (SILL - y) / total : (side + arcLen + (y - CY)) / total;
    const a = Math.atan2(y - CY, x - CX);
    return (side + (a + Math.PI) / Math.PI * arcLen) / total;
  }
  function segDist(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, t = clamp(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1));
    return Math.hypot(px - ax - dx * t, py - ay - dy * t);
  }
  function regionList() {
    const out = [];
    out.R = (name, group, draw, fill, o = {}) => {
      out.push({ name, group, draw, fill, clip: true, fine: 1, src: "self", ...o });
      return out;
    };
    return out;
  }
  var CX, CY, R_IN, R_OUT, IN_X0, IN_X1, SILL, SILL_B, PANEL, FIT, outerPath, innerPath, sillPath, poly, disc, ell, union, below, bar, blade, nearest;
  var init_geom = __esm({
    "js/geom.js"() {
      init_core();
      CX = 500;
      CY = 500;
      R_IN = 430;
      R_OUT = 500;
      IN_X0 = 70;
      IN_X1 = 930;
      SILL = 1e3;
      SILL_B = 1086;
      PANEL = { x0: -40, y0: -14, w: 1080, h: 1114 };
      FIT = { x0: -86, y0: -78, w: 1172, h: 1178 };
      outerPath = (c) => {
        c.moveTo(0, SILL + 1);
        c.lineTo(0, CY);
        c.arc(CX, CY, R_OUT, Math.PI, 0);
        c.lineTo(1e3, SILL + 1);
        c.closePath();
      };
      innerPath = (c) => {
        c.moveTo(IN_X0, SILL + 1);
        c.lineTo(IN_X0, CY);
        c.arc(CX, CY, R_IN, Math.PI, 0);
        c.lineTo(IN_X1, SILL + 1);
        c.closePath();
      };
      sillPath = (c) => c.rect(-26, SILL, 1052, SILL_B - SILL);
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
      union = (...fs) => (c) => {
        for (const f of fs) f(c);
      };
      below = (fn, x0 = IN_X0 - 4, x1 = IN_X1 + 4, step = 5) => (c) => {
        c.moveTo(x0, SILL + 1);
        for (let x = x0; x <= x1; x += step) c.lineTo(x, fn(x));
        c.lineTo(x1, fn(x1));
        c.lineTo(x1, SILL + 1);
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
      nearest = (arr, x, y) => arr.reduce((a, b) => (b.x - x) ** 2 + ((b.y ?? y) - y) ** 2 < (a.x - x) ** 2 + ((a.y ?? y) - y) ** 2 ? b : a);
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
    const P4 = /* @__PURE__ */ new Map();
    const pt = (x, y, vert) => {
      const k = key(x, y, vert);
      let p = P4.get(k);
      if (!p) {
        if (!vert) {
          const a = F[y * W + x], b = F[y * W + x + 1], t = (level - a) / (b - a);
          p = [x + t, y];
        } else {
          const a = F[y * W + x], b = F[(y + 1) * W + x], t = (level - a) / (b - a);
          p = [x, y + t];
        }
        P4.set(k, p);
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
      lines.push(chain.map((k) => P4.get(k)));
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
  function* laySteps(regions5, outlines5, { W, H, q, s, seed = 7, grout = 0.17 }) {
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
      if (r.clip) {
        c.beginPath();
        innerPath(c);
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
    const stones = [], B = new Buckets(W, H, s);
    const free = (x, y, r) => !B.near(x, y, r);
    const add = (x, y, a, l, w, k, reg, ls, row = 0) => {
      const id = stones.length;
      stones.push({ x, y, a, l, w, k, reg, s: ls, row, h: rnd(), h2: rnd() });
      B.add(x, y, id);
      return id;
    };
    const labAt = (x, y) => lab[Math.min(H - 1, Math.max(0, y | 0)) * W + Math.min(W - 1, Math.max(0, x | 0))];
    const zone = new Uint8Array(N), zoneD = new Float32Array(N).fill(1e9);
    const so = s * 0.9;
    for (const o of outlines5) {
      const I = setOf(o.inside), A = setOf(o.against), mI = maskOf(I), dA = distanceField(maskOf(A), W, H);
      for (let p = 0; p < N; p++) if (mI[p] && dA[p] < so * 0.84) {
        zone[p] = 1;
        if (dA[p] < zoneD[p]) zoneD[p] = dA[p];
      }
      const lines = contours(dA, W, H, so * 0.5, mI, boxOf(I)).sort((p, q2) => q2.length - p.length);
      for (const ln of lines) walk(ln, () => so, 0.86, (x, y, a) => {
        if (!I[labAt(x, y) + 1] || !free(x, y, so * 0.55)) return;
        add(x, y, a, so * 0.8, so * 0.66, 0, -2, so);
      });
      yield;
    }
    for (let i = 0; i < nR; i++) {
      const r = regions5[i];
      if (!area[i] || r.skip) continue;
      const sR = s * (r.fine || 1);
      const src = new Uint8Array(N);
      if (r.src === "self") {
        for (let p = 0; p < N; p++) src[p] = lab[p] !== i ? 1 : 0;
      } else if (r.src === "courses") {
        for (let x = 0; x < W; x++) src[Math.max(0, box[i][1] - 1) * W + x] = 1;
      } else {
        const S = setOf(r.src);
        for (let p = 0; p < N; p++) src[p] = S[lab[p] + 1];
      }
      const d = distanceField(src, W, H), m = new Uint8Array(N);
      let maxD = 0;
      for (let p = 0; p < N; p++) if (lab[p] === i) {
        m[p] = 1;
        if (d[p] > maxD) maxD = d[p];
      }
      const bx = [box[i][0] - 2, box[i][1] - 2, box[i][2] + 2, box[i][3] + 2];
      for (let k = 0; (k + 0.5) * sR < maxD + sR * 0.5; k++) {
        const lines = contours(d, W, H, (k + 0.5) * sR, m, bx).sort((p, q2) => q2.length - p.length);
        for (const ln of lines) walk(ln, () => sR, 0.98, (x, y, a) => {
          if (labAt(x, y) !== i || zone[(y | 0) * W + (x | 0)] || !free(x, y, sR * 0.78)) return;
          add(x, y, a, sR * 0.94, sR * 0.84, 1, i, sR, k);
        });
        if (k % 6 === 5) yield;
      }
      yield;
    }
    const nearAngle = (x, y, R) => {
      let best = -1, bd = 1e9;
      const cell = B.cell, gx = Math.floor(x / cell), gy = Math.floor(y / cell);
      for (let yy = gy - 1; yy <= gy + 1; yy++) for (let xx = gx - 1; xx <= gx + 1; xx++) {
        if (xx < 0 || yy < 0 || xx >= B.cw || yy >= B.ch) continue;
        const l = B.b[yy * B.cw + xx];
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
          if (zoneD[p] < so * 0.6 && free(x + 0.5, y + 0.5, so * 0.74) && B.near(x + 0.5, y + 0.5, so * 1.7)) add(x + 0.5, y + 0.5, nearAngle(x, y, -2), so * 0.8, so * 0.66, 0, -2, so);
          continue;
        }
        const sR = s * (regions5[l].fine || 1);
        if (!free(x + 0.5, y + 0.5, sR * gap)) continue;
        add(x + 0.5, y + 0.5, nearAngle(x, y, l), sR * size, sR * size * 0.9, 3, l, sR, 99);
      }
      yield;
    }
    const kept = yield* fit(stones, lab, zone, W, H, s, grout);
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
  function* fit(stones, lab, zone, W, H, s, grout) {
    const n = stones.length, sx = new Float64Array(n), sy = new Float64Array(n), cnt = new Int32Array(n);
    const mnU = new Float32Array(n), mxU = new Float32Array(n), mnV = new Float32Array(n), mxV = new Float32Array(n);
    const ca = new Float32Array(n), sa = new Float32Array(n), hl = new Float32Array(n), hw = new Float32Array(n);
    for (let pass = 0; pass < 3; pass++) {
      const final = pass === 2, B = new Buckets(W, H, s);
      stones.forEach((t, i) => {
        B.add(t.x, t.y, i);
        ca[i] = Math.cos(t.a);
        sa[i] = Math.sin(t.a);
        hl[i] = Math.max(0.5, t.l / 2);
        hw[i] = Math.max(0.5, t.w / 2);
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
      for (let y = 0; y < H; y++) {
        const py = y + 0.5, gy = Math.floor(py / B.cell);
        for (let x = 0; x < W; x++) {
          const p = y * W + x, l = lab[p];
          if (l < 0) continue;
          const cls = zone[p] ? -2 : l, px = x + 0.5, gx = Math.floor(px / B.cell);
          let best = -1, bd = 1.9;
          for (let by = gy - 1; by <= gy + 1; by++) {
            if (by < 0 || by >= B.ch) continue;
            for (let bxx = gx - 1; bxx <= gx + 1; bxx++) {
              if (bxx < 0 || bxx >= B.cw) continue;
              const li = B.b[by * B.cw + bxx];
              if (!li) continue;
              for (const id of li) {
                if (stones[id].reg !== cls) continue;
                const dx = px - stones[id].x, dy = py - stones[id].y;
                const u = (dx * ca[id] + dy * sa[id]) / hl[id], v = (-dx * sa[id] + dy * ca[id]) / hw[id];
                const dd = Math.max(Math.abs(u), Math.abs(v));
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
            const t = stones[best], dx = px - t.x, dy = py - t.y, u = dx * ca[best] + dy * sa[best], v = -dx * sa[best] + dy * ca[best];
            if (u < mnU[best]) mnU[best] = u;
            if (u > mxU[best]) mxU[best] = u;
            if (v < mnV[best]) mnV[best] = v;
            if (v > mxV[best]) mxV[best] = v;
          }
        }
      }
      if (!final) {
        for (let i = 0; i < n; i++) if (cnt[i] > 0) {
          const t = stones[i], nx = sx[i] / cnt[i], ny = sy[i] / cnt[i], m = Math.hypot(nx - t.x, ny - t.y), lim = t.s * 0.35, f = m > lim ? lim / m : 1;
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
    const P4 = [-hl, -hw, hl, -hw, hl, hw, -hl, hw];
    for (let k = 0; k < 4; k++) {
      const lx = P4[k * 2] + j[k * 2], ly = P4[k * 2 + 1] + j[k * 2 + 1];
      out[k * 2] = t.x + c * lx - s * ly;
      out[k * 2 + 1] = t.y + s * lx + c * ly;
    }
    return out;
  }
  var init_lay = __esm({
    "js/lay.js"() {
      init_field();
      init_core();
      init_geom();
    }
  });

  // js/frame.js
  function frameRegions() {
    const P4 = FRAME_PAL;
    return [
      {
        name: "frame",
        group: "frame",
        draw: outerPath,
        clip: false,
        fine: 1,
        src: ["window"],
        fill: (x, y) => {
          const t = clamp(innerDepth(x, y) / (R_OUT - 430));
          return mix(P4.marble, P4.marbleShade, 0.22 + 0.5 * Math.abs(t - 0.45) * 2);
        }
      },
      { name: "window", group: "window", draw: innerPath, clip: false, skip: true, fill: () => P4.grout },
      {
        name: "sill",
        group: "sill",
        draw: sillPath,
        clip: false,
        fine: 1.05,
        src: ["window", "frame"],
        fill: (x, y) => y < SILL + 34 ? P4.sill : P4.sillFront
      }
    ];
  }
  function edgePoint(f, depth) {
    const arcLen = Math.PI * R_OUT, side = SILL - CY, total = arcLen + 2 * side, s = f * total;
    if (s < side) return [depth, SILL - s];
    if (s < side + arcLen) {
      const a = (s - side) / arcLen * Math.PI - Math.PI;
      return [CX + (R_OUT - depth) * Math.cos(a), CY + (R_OUT - depth) * Math.sin(a)];
    }
    return [1e3 - depth, CY + (s - side - arcLen)];
  }
  function finishFrame(stones, regions5, q, su, rnd) {
    const P4 = FRAME_PAL, out = [];
    for (const t of stones) {
      const ux = t.x / q + PANEL.x0, uy = t.y / q + PANEL.y0;
      t.ux = ux;
      t.uy = uy;
      if (t.k === 0) {
        t.col = P4.outline;
        out.push(t);
        continue;
      }
      const r = regions5[t.reg];
      if (r.name === "frame") {
        const od = outerDepth(ux, uy), f = frameParam(ux, uy), eat = su * (0.15 + 1.75 * ragged(f)) * fade(f);
        if (od < eat && rnd() > 0.18) continue;
        const id = innerDepth(ux, uy);
        if (id > su * 2.05 && id < su * 3.05) {
          t.gold = true;
          t.col = P4.gold[t.h < 0.45 ? 0 : t.h < 0.8 ? 1 : 2];
          out.push(t);
          continue;
        }
        t.col = r.fill(ux, uy);
        if (od < su * 2.2 && t.h2 > 0.7) t.col = mix(t.col, P4.marbleWarm, 0.6);
      } else t.col = r.fill(ux, uy);
      out.push(t);
    }
    return out;
  }
  function looseStones(q, su, rnd, kept) {
    const P4 = FRAME_PAL, out = [], arcLen = Math.PI * R_OUT, total = arcLen + 2 * (SILL - CY);
    const near = (x, y, r) => kept.some((o) => (o.x - x) ** 2 + (o.y - y) ** 2 < r * r);
    const step = su * 1.08;
    for (let s = step * 0.5; s < total; s += step) {
      const f = s / total, fd = fade(f);
      if (fd < 0.05) continue;
      const L = su * (1.2 + 5.2 * reach(f)) * fd, E2 = su * (0.15 + 1.75 * ragged(f)) * fd;
      for (let d = E2; d > -L; d -= su * (1 + rnd() * 0.25)) {
        const p = clamp((d + L) / (L + E2)), keep = Math.pow(p, 1.7) * 0.82;
        if (rnd() > keep) continue;
        const jit = d < 0 ? su * 0.35 : su * 0.12;
        const [ux, uy] = edgePoint(clamp(f + (rnd() - 0.5) * step * 0.5 / total), d);
        const x = (ux + (rnd() - 0.5) * jit - PANEL.x0) * q, y = (uy + (rnd() - 0.5) * jit - PANEL.y0) * q;
        if (uy > SILL - su * 0.5) continue;
        const sz = su * q * (0.62 + rnd() * 0.3);
        if (near(x, y, sz * 0.78)) continue;
        const a = Math.atan2(uy - CY, ux - CX) + Math.PI / 2 + (rnd() - 0.5) * (d < 0 ? 1.4 : 0.3);
        const t = { x, y, a, l: sz, w: sz * (0.78 + rnd() * 0.2), k: 4, s: su * q, h: rnd(), h2: rnd(), loose: true };
        t.j = new Float32Array(8);
        for (let k = 0; k < 8; k++) t.j[k] = (rnd() - 0.5) * t.s * 0.1;
        t.col = rnd() < 0.04 ? P4.gold[rnd() * 3 | 0] : mix(P4.marble, rnd() < 0.5 ? P4.marbleShade : P4.marbleWarm, rnd() * 0.7);
        t.gold = t.col === P4.gold[0] || t.col === P4.gold[1] || t.col === P4.gold[2];
        t.ux = ux;
        t.uy = uy;
        out.push(t);
        kept.push(t);
      }
    }
    return out;
  }
  function bedPath(c, toPx) {
    const N = 220;
    c.beginPath();
    for (let i = 0; i <= N; i++) {
      const f = i / N, fd = fade(f), L = (36 + 70 * reach(f)) * fd;
      const [ux, uy] = edgePoint(f, -L * (0.55 + 0.25 * fbm(f * 31, 2.2, 77, 2)));
      const [px, py] = toPx(ux, uy);
      if (i === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    }
    for (let i = N; i >= 0; i--) {
      const [ux, uy] = edgePoint(i / N, 30);
      const [px, py] = toPx(ux, uy);
      c.lineTo(px, py);
    }
    c.closePath();
  }
  function groutPath(c, toPx, su) {
    const N = 260;
    c.beginPath();
    for (let i = 0; i <= N; i++) {
      const f = i / N, E2 = su * (0.15 + 1.75 * ragged(f)) * fade(f) + su * 0.55;
      const [px, py] = toPx(...edgePoint(f, E2));
      if (i === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    }
    c.closePath();
  }
  var FRAME_PAL, FRAME_OUTLINES, ragged, reach, fade;
  var init_frame = __esm({
    "js/frame.js"() {
      init_core();
      init_geom();
      FRAME_PAL = {
        marble: rgb("#efe7d2"),
        marbleShade: rgb("#ddd0b3"),
        marbleWarm: rgb("#e6d6b6"),
        sill: rgb("#ebe2cb"),
        sillFront: rgb("#cfc2a3"),
        outline: rgb("#2b2925"),
        grout: rgb("#ddd6c6"),
        bed: rgb("#e2dacb"),
        gold: [rgb("#d6aa48"), rgb("#e9c66c"), rgb("#b8892f")]
      };
      FRAME_OUTLINES = [
        { inside: ["frame"], against: ["window"] },
        { inside: ["sill"], against: ["window", "frame"] }
      ];
      ragged = (f) => smooth(0.25, 0.75, fbm(f * 15, 3.1, 41, 3));
      reach = (f) => 0.35 + 0.65 * smooth(0.2, 0.8, fbm(f * 9, 7.7, 57, 3));
      fade = (f) => smooth(0, 0.07, f) * smooth(1, 0.93, f);
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
    const ex = k.strX - k.x, ey = k.strY - k.y, l = Math.hypot(ex, ey), along2 = (dx * ex + dy * ey) / l;
    if (along2 > 0 && along2 < l) {
      const off = Math.abs(dx * ey - dy * ex) / l;
      if (off < 4.5) return 4;
    }
    return 0;
  }
  var init_life = __esm({
    "js/places/life.js"() {
      init_core();
      init_geom();
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
    const pal = e >= 24 ? D : e >= 6 ? blend(G, D, smooth(6, 24, e)) : e >= -1 ? G : e >= -7 ? blend(G, T, smooth(-1, -7, e)) : e >= -13 ? blend(T, N, smooth(-7, -13, e)) : N;
    const sunUp = e > -1.5, moonUp = sky.moon.el > 0 && sky.night + sky.twilight > 0.35;
    const label = clockLabel(date);
    return {
      pal,
      sky,
      label,
      caption: `San Jose \xB7 ${label}`,
      clock: label,
      sun: sunUp ? arcPos(sky.sun.az) : null,
      moon: !sunUp && moonUp ? { at: arcPos(sky.moon.az), phase: sky.moon.phase } : null,
      stars: sky.stars,
      night: sky.night
    };
  }
  function regions(L) {
    const P4 = L.pal, out = regionList(), R = out.R;
    const tint = (c) => [c[0] * P4.tint[0], c[1] * P4.tint[1], c[2] * P4.tint[2]].map((v) => Math.min(255, v));
    const warm = (c) => tint(L.sun ? mix(c, [255, 236, 200], 0.07 * (1 - L.night)) : c);
    R("sky", "view", (c) => {
      c.rect(IN_X0 - 4, 60, IN_X1 - IN_X0 + 8, SILL - 60);
    }, (x, y) => {
      const t = clamp((y - 70) / (ridgeY(x) - 70));
      let c = t < 0.45 ? mix(P4.skyTop, P4.skyMid, t / 0.45) : t < 0.78 ? mix(P4.skyMid, P4.skyLow, (t - 0.45) / 0.33) : mix(P4.skyLow, P4.skyHor, (t - 0.78) / 0.22);
      if (L.sun) c = mix(c, P4.sunIn, 0.36 * (1 - smooth(60, 240, Math.hypot(x - L.sun[0], y - L.sun[1]))) * (1 - L.night));
      return c;
    }, { live: "sky" });
    if (L.sun) {
      const [sx, sy] = L.sun;
      R("sun", "view", disc(sx, sy, 64), (x, y) => mix(P4.sunIn, P4.sunOut, smooth(8, 62, Math.hypot(x - sx, y - sy))), { live: "sun", fine: 0.9 });
    }
    if (L.moon) {
      const [mx, my] = L.moon.at, ph = L.moon.phase, r = 50, c2 = Math.cos(ph * Math.PI * 2);
      R("moon", "view", disc(mx, my, r), (x, y) => {
        const dx = x - mx, w = Math.sqrt(Math.max(0, r * r - (y - my) ** 2)), lit = ph < 0.5 ? dx > c2 * w : -dx > c2 * w;
        return lit ? rgb("#f1ead2") : mix(P4.skyMid, P4.skyTop, 0.5);
      }, { live: "moon", fine: 0.9 });
    }
    R("ridge", "view", below(ridgeY), (x, y) => mix(P4.ridgeRim, P4.ridge, smooth(0, 80, y - ridgeY(x))), { src: ["sky", "sun", "moon"] });
    R("domes", "view", (c) => {
      for (const d of DOMES) {
        const base = ridgeY(d.x) + 10;
        c.moveTo(d.x - d.r * 0.92, base);
        c.lineTo(d.x - d.r * 0.92, base - d.drum);
        c.lineTo(d.x + d.r * 0.92, base - d.drum);
        c.lineTo(d.x + d.r * 0.92, base);
        c.closePath();
        c.moveTo(d.x + d.r, base - d.drum);
        c.arc(d.x, base - d.drum, d.r, 0, Math.PI, true);
        c.closePath();
      }
    }, (x, y) => {
      const d = nearest(DOMES, x, 0), base = ridgeY(d.x) + 10;
      if (y > base - d.drum) return mix(P4.drum, P4.domeShade, smooth(-0.2, 0.9, (x - d.x) / d.r) * 0.7);
      const nx = (x - d.x) / d.r, ny = (y - (base - d.drum)) / d.r;
      if (d.slit && Math.abs(nx + 0.12) < 0.1 && ny < -0.12) return P4.domeSlit;
      return mix(P4.domeLit, P4.domeShade, smooth(-0.15, 0.65, nx * 0.9 - ny * 0.25));
    }, { fine: 0.78 });
    R("foothills", "view", below(footY), (x, y) => mix(P4.footLit, P4.foot, smooth(0, 70, y - footY(x))), { src: ["ridge", "domes"] });
    R("cypress", "view", (c) => {
      for (const t of CYPRESS) {
        const b = BASE + 8;
        c.moveTo(t.x, b - t.h);
        c.bezierCurveTo(t.x + t.w * 0.7, b - t.h * 0.62, t.x + t.w * 0.62, b - t.h * 0.12, t.x + t.w * 0.4, b);
        c.lineTo(t.x - t.w * 0.4, b);
        c.bezierCurveTo(t.x - t.w * 0.62, b - t.h * 0.12, t.x - t.w * 0.7, b - t.h * 0.62, t.x, b - t.h);
        c.closePath();
      }
    }, (x) => {
      const t = nearest(CYPRESS, x, 0);
      return mix(P4.footLit, P4.cypress, 0.6 + 0.4 * smooth(-0.5, 0.5, (x - t.x) / t.w));
    }, { fine: 0.8 });
    R("walls", "view", (c) => {
      for (const h of HOUSES) c.rect(h.x - h.w / 2, BASE - h.h, h.w, h.h + 4);
    }, (x) => {
      const h = nearest(HOUSES, x, 0);
      return x > h.x + h.w * 0.18 ? P4.wallShade : P4.wall;
    }, { fine: 0.8 });
    R("windows", "view", (c) => {
      for (const h of HOUSES) for (const f of [-0.24, 0.22]) c.rect(h.x + f * h.w - 9, BASE - h.h * 0.64, 18, 16);
    }, () => P4.window, { fine: 0.7, live: "window" });
    R(
      "roofs",
      "view",
      (c) => {
        for (const h of HOUSES) {
          const y = BASE - h.h;
          c.moveTo(h.x - h.w * 0.62, y + 2);
          c.lineTo(h.x - h.w * 0.3, y - 32);
          c.lineTo(h.x + h.w * 0.3, y - 32);
          c.lineTo(h.x + h.w * 0.62, y + 2);
          c.closePath();
        }
      },
      (x) => {
        const h = nearest(HOUSES, x, 0);
        return x > h.x + h.w * 0.05 ? P4.roofDark : P4.roof;
      },
      { fine: 0.8 }
    );
    R("hedge", "view", below(hedgeY), (x, y) => mix(P4.hedgeLit, P4.hedge, smooth(0, 40, y - hedgeY(x)) * 0.8 + 0.2 * hash2(x / 22 | 0, y / 22 | 0, 3)), { src: ["foothills", "walls", "cypress", "roofs"] });
    const brass = rgb("#c9973f"), brassLit = rgb("#ecc970"), brassDark = rgb("#8f6a26"), wood = rgb("#6e4a2c"), woodLit = rgb("#93643c"), woodDark = rgb("#4d321e");
    const tubeShade = (x, y) => {
      const ax = O[0] - E[0], ay = O[1] - E[1], l = Math.hypot(ax, ay), v = ((x - E[0]) * -ay + (y - E[1]) * ax) / l;
      return warm(mix(brassLit, brassDark, smooth(-TW * 0.45, TW * 0.5, -v)), x);
    };
    R(
      "tsStand",
      "still",
      poly([[PIV[0] - 56, 960], [PIV[0] + 56, 960], [PIV[0] + 82, SILL + 1], [PIV[0] - 82, SILL + 1]]),
      (x, y) => tint(mix(woodLit, woodDark, smooth(-40, 80, x - PIV[0]) * 0.7 + smooth(960, 1e3, y) * 0.3)),
      { fine: 0.74 }
    );
    R("tsPillar", "still", poly([[PIV[0] - 16, PIV[1]], [PIV[0] + 16, PIV[1]], [PIV[0] + 16, 962], [PIV[0] - 16, 962]]), (x) => tint(mix(wood, woodDark, smooth(-10, 16, x - PIV[0]))), { fine: 0.7 });
    R("tsTube", "still", bar(...along(0.04), ...along(0.82), TW), (x, y) => {
      const c = tubeShade(x, y), t = ((x - E[0]) * (O[0] - E[0]) + (y - E[1]) * (O[1] - E[1])) / ((O[0] - E[0]) ** 2 + (O[1] - E[1]) ** 2);
      return Math.abs(t - 0.3) < 0.025 || Math.abs(t - 0.58) < 0.025 ? mix(c, brassDark, 0.55) : c;
    }, { fine: 0.7 });
    R("tsCap", "still", bar(...along(0.8), ...O, TW + 16), tubeShade, { fine: 0.7 });
    R("tsLens", "still", bar(...along(0.985), ...along(1.005), TW + 8), () => tint(rgb("#2f4a5a")), { fine: 0.64 });
    R("tsEye", "still", bar(...along(-0.12), ...along(0.06), 22), () => tint(mix(brassDark, woodDark, 0.4)), { fine: 0.66 });
    const blue = rgb("#3a62c4"), deep = rgb("#22408f");
    R("rBody", "still", poly([rob(16, 358), rob(16, 232), rob(34, 206), rob(158, 206), rob(176, 232), rob(176, 358)]), (x, y) => warm(mix(blue, deep, smooth(220, 360, (y - RB.y) / RS) * 0.55 + smooth(80, 180, (x - RB.x) / RS) * 0.3), x), { fine: 0.68, src: "courses" });
    R("rNeck", "still", poly([rob(68, 210), rob(68, 176), rob(124, 176), rob(124, 210)]), () => tint(rgb("#1d3478")), { fine: 0.66 });
    R("rTop", "still", poly([rob(4, 28), rob(32, 0), rob(194, 0), rob(166, 28)]), (x) => warm(rgb("#5b82cc"), x), { fine: 0.66 });
    R("rSide", "still", poly([rob(166, 28), rob(194, 0), rob(194, 150), rob(166, 178)]), () => tint(deep), { fine: 0.66 });
    R("rFront", "still", poly([rob(4, 28), rob(122, 28), rob(166, 72), rob(166, 178), rob(4, 178)]), (x, y) => warm(mix(rgb("#3460c2"), rgb("#2a4ea8"), smooth(40, 170, (y - RB.y) / RS)), x), { fine: 0.64 });
    R("rFold", "still", poly([rob(122, 28), rob(166, 28), rob(166, 72)]), () => tint(rgb("#f2e9d4")), { fine: 0.6 });
    R("rEarRim", "still", disc(...rob(184, 102), 31 * RS), () => tint(rgb("#f2e6cc")), { fine: 0.6 });
    R("rEar", "still", disc(...rob(184, 102), 23 * RS), () => tint(rgb("#e0502f")), { fine: 0.6 });
    for (const [k, ex] of [["L", 44], ["R", 116]]) {
      R("rEye" + k, "still", disc(...rob(ex, 104), 30 * RS), () => tint(rgb("#f8f3e6")), { fine: 0.56 });
      R("rPupil" + k, "still", disc(...rob(ex + 9, 106), 13 * RS), () => rgb("#1f1c1a"), { fine: 0.54 });
    }
    const terra = rgb("#c2653a"), terraLit = rgb("#dc8454"), terraDark = rgb("#9a4a29");
    R(
      "pot",
      "still",
      poly([[POT.x - POT.topW / 2, POT.rimY + POT.rimH], [POT.x + POT.topW / 2, POT.rimY + POT.rimH], [POT.x + POT.botW / 2, SILL + 1], [POT.x - POT.botW / 2, SILL + 1]]),
      (x) => warm(mix(terraLit, terraDark, smooth(-50, 60, x - POT.x)), x),
      { fine: 0.72, src: "courses" }
    );
    R(
      "potRim",
      "still",
      poly([[POT.x - POT.rimW / 2, POT.rimY], [POT.x + POT.rimW / 2, POT.rimY], [POT.x + POT.rimW / 2, POT.rimY + POT.rimH], [POT.x - POT.rimW / 2, POT.rimY + POT.rimH]]),
      (x) => warm(mix(terraLit, terra, smooth(-40, 66, x - POT.x)), x),
      { fine: 0.66 }
    );
    const leafCol = [rgb("#7aa58d"), rgb("#9cc2a6"), rgb("#5f8a73")], blush = rgb("#d08a8c");
    R("succulent", "still", union(...LEAVES.map((l) => {
      const [tx, ty] = leafTip(l);
      return blade(ROS.x, ROS.y + 4, (ROS.x + tx) / 2, (ROS.y + ty) / 2 - 6, tx, ty, l.w, 2);
    })), (x, y) => {
      let best = 0, bd = 1e9;
      LEAVES.forEach((l2, i) => {
        const [tx, ty] = leafTip(l2), d = Math.abs(Math.atan2(y - ROS.y, x - ROS.x) - Math.atan2(ty - ROS.y, tx - ROS.x)) * (1 + 2e-3 * Math.abs(Math.hypot(x - ROS.x, y - ROS.y) - l2.len * 0.6));
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      const l = LEAVES[best], r = Math.hypot(x - ROS.x, (y - ROS.y) / 0.82) / l.len;
      let c = leafCol[(best * 2 + (l.len < 70 ? 1 : 0)) % 3];
      c = mix(c, blush, smooth(0.72, 0.98, r) * 0.75);
      return warm(c, x);
    }, { fine: 0.62 });
    return out;
  }
  function liveKind(t, r, L) {
    if (r.live === "sky") return "sky";
    if (r.live === "sun") return "sun";
    if (r.live === "window" && L.night > 0.3) return "window";
    return null;
  }
  function frameState(time, L) {
    return { birds: L.night < 0.5 ? birdsAt(time, [[0, 26, 230, 70], [1, 34, 320, 54]]) : [], band: time * 38 % 1500 - 250, time };
  }
  function liveColour(s, F, L) {
    const P4 = L.pal;
    if (s.kind === "sky") {
      let col = s.col, changed = false;
      const b = Math.exp(-(((s.ux - F.band + (s.uy - 300) * 0.35) / 90) ** 2)) * (1 - L.night * 0.7);
      if (b > 0.03) {
        col = mix(col, [255, 252, 238], b * 0.13);
        changed = true;
      }
      for (const bd of F.birds) if (inBird(bd, s.ux, s.uy)) {
        col = mix(s.col, P4.bird, 0.88);
        changed = true;
        break;
      }
      if (s.star) {
        const tw = 0.55 + 0.45 * Math.sin(F.time * (1.3 + s.h2 * 2) + s.h * 40);
        col = mix(col, [255, 246, 214], L.stars * tw);
        changed = true;
      }
      return changed ? col : null;
    }
    if (s.kind === "sun" && L.sun) {
      const a = Math.atan2(s.uy - L.sun[1], s.ux - L.sun[0]), gl = Math.max(0, Math.cos(a - F.time * 0.45 - s.row * 0.6)) ** 12;
      return gl > 0.02 ? mix(s.col, [255, 250, 230], gl * 0.35) : null;
    }
    if (s.kind === "window") {
      const fl = 0.85 + 0.15 * Math.sin(F.time * 2.1 + s.h * 30);
      return mix(s.col, [255, 214, 120], 0.25 * fl);
    }
    return null;
  }
  var DAY, GOLDEN, TWILIGHT, NIGHT, asRGB, PALS, ARC_R, arcPos, ridgeY, footY, hedgeY, DOMES, HOUSES, BASE, CYPRESS, E, O, TW, along, PIV, RS, RB, rob, POT, ROS, LEAVES, leafTip, outlines, isStar, sanjose_default;
  var init_sanjose = __esm({
    "js/places/sanjose.js"() {
      init_core();
      init_geom();
      init_life();
      DAY = {
        skyTop: "#2c8fa0",
        skyMid: "#6fbcc4",
        skyLow: "#b5dfdc",
        skyHor: "#e9f0d8",
        ridge: "#3f7480",
        ridgeRim: "#6a9aa0",
        foot: "#7f9a54",
        footLit: "#a9b867",
        hedge: "#3f5c36",
        hedgeLit: "#5f7f45",
        wall: "#f2ead6",
        wallShade: "#ddd0b3",
        roof: "#c96b42",
        roofDark: "#a8522f",
        cypress: "#2f4b31",
        window: "#5a6f78",
        sunOut: "#f2b44e",
        sunIn: "#fbefc4",
        domeLit: "#f6f1e4",
        domeShade: "#c9cdd2",
        drum: "#e9e3d4",
        domeSlit: "#59606a",
        tint: [1, 1, 1],
        bird: "#33383d"
      };
      GOLDEN = {
        skyTop: "#25868a",
        skyMid: "#62b0aa",
        skyLow: "#b7dcc9",
        skyHor: "#f2c675",
        ridge: "#1f5864",
        ridgeRim: "#4f7f86",
        foot: "#7f8f4a",
        footLit: "#c9b65c",
        hedge: "#3a5331",
        hedgeLit: "#6f7a3c",
        wall: "#f3e2c0",
        wallShade: "#dcc8a3",
        roof: "#c8643a",
        roofDark: "#a14b2b",
        cypress: "#2c462d",
        window: "#57606a",
        sunOut: "#e2702f",
        sunIn: "#fae6a0",
        domeLit: "#fbecd0",
        domeShade: "#b9b4bf",
        drum: "#efdcbc",
        domeSlit: "#5b5560",
        tint: [1.05, 0.99, 0.93],
        bird: "#2f3036"
      };
      TWILIGHT = {
        skyTop: "#26406e",
        skyMid: "#4b5d8f",
        skyLow: "#9a86a6",
        skyHor: "#e7a07a",
        ridge: "#273650",
        ridgeRim: "#3f4d6c",
        foot: "#4a5640",
        footLit: "#6a6a4a",
        hedge: "#26332a",
        hedgeLit: "#34402f",
        wall: "#cbbca6",
        wallShade: "#b5a88c",
        roof: "#8d4c3a",
        roofDark: "#6f3a2c",
        cypress: "#22332a",
        window: "#f2c66a",
        sunOut: "#e4683a",
        sunIn: "#f6c58c",
        domeLit: "#d9d2d6",
        domeShade: "#8f8ca3",
        drum: "#cbc3c4",
        domeSlit: "#3c3a48",
        tint: [0.8, 0.8, 0.92],
        bird: "#22242c"
      };
      NIGHT = {
        skyTop: "#101b3a",
        skyMid: "#172a54",
        skyLow: "#22396a",
        skyHor: "#354c78",
        ridge: "#141d2e",
        ridgeRim: "#26324a",
        foot: "#1f2a26",
        footLit: "#2a3530",
        hedge: "#141d18",
        hedgeLit: "#1c2620",
        wall: "#5c5a62",
        wallShade: "#4a4952",
        roof: "#3f2c2c",
        roofDark: "#33232a",
        cypress: "#142019",
        window: "#f5c35a",
        sunOut: "#e4683a",
        sunIn: "#f6c58c",
        domeLit: "#b9c0cf",
        domeShade: "#6c7590",
        drum: "#9aa1b2",
        domeSlit: "#2a2f3e",
        tint: [0.66, 0.68, 0.84],
        bird: "#0e1220"
      };
      asRGB = (p) => {
        const o = {};
        for (const k of Object.keys(p)) o[k] = typeof p[k] === "string" ? rgb(p[k]) : p[k];
        return o;
      };
      PALS = { D: asRGB(DAY), G: asRGB(GOLDEN), T: asRGB(TWILIGHT), N: asRGB(NIGHT) };
      ARC_R = 300;
      arcPos = (az) => {
        const th = Math.PI + Math.PI * clamp((az - 95) / 170);
        return [CX + ARC_R * Math.cos(th), CY + ARC_R * Math.sin(th) - 20];
      };
      ridgeY = (x) => 786 - 146 * Math.exp(-(((x - 690) / 240) ** 2)) - 40 * Math.exp(-(((x - 205) / 125) ** 2));
      footY = (x) => 852 + 16 * Math.sin(x / 110 + 0.8) + 7 * Math.sin(x / 47 + 2);
      hedgeY = (x) => 936 + 7 * Math.sin(x / 38 + 1.3) + 5 * Math.sin(x / 17);
      DOMES = [{ x: 572, r: 46, drum: 26 }, { x: 690, r: 60, drum: 34, slit: true }, { x: 812, r: 46, drum: 26 }];
      HOUSES = [{ x: 466, w: 96, h: 42 }, { x: 576, w: 86, h: 38 }];
      BASE = 930;
      CYPRESS = [{ x: 520, w: 38, h: 128 }, { x: 628, w: 34, h: 112 }];
      E = [140, 884];
      O = [392, 754];
      TW = 50;
      along = (t) => [lerp(E[0], O[0], t), lerp(E[1], O[1], t)];
      PIV = along(0.42);
      RS = 0.62;
      RB = { x: 722 - 96 * RS, y: SILL - 358 * RS };
      rob = (dx, dy) => [RB.x + dx * RS, RB.y + dy * RS];
      POT = { x: 862, rimY: 906, rimH: 20, topW: 118, botW: 90, rimW: 130 };
      ROS = { x: 862, y: 896 };
      LEAVES = [
        [-172, 72, 34],
        [-150, 86, 38],
        [-128, 92, 40],
        [-106, 96, 40],
        [-84, 98, 40],
        [-62, 94, 40],
        [-40, 88, 38],
        [-14, 76, 34],
        [-139, 56, 30],
        [-112, 62, 32],
        [-86, 64, 32],
        [-60, 60, 30],
        [-34, 52, 28],
        [-96, 34, 24],
        [-72, 34, 24]
      ].map(([deg, len, w]) => ({ a: deg * Math.PI / 180, len, w }));
      leafTip = (l) => [ROS.x + Math.cos(l.a) * l.len, ROS.y + Math.sin(l.a) * l.len * 0.82];
      outlines = [
        { inside: ["still"], against: ["view"] },
        { inside: ["domes"], against: ["sky", "sun", "moon"] }
      ];
      isStar = (r, L, t, uy) => r.name === "sky" && L.stars > 0.05 && t.h > 0.985 && t.h2 > 0.25 && uy < 600;
      sanjose_default = {
        key: "now",
        place: "San Jose",
        light,
        regions,
        outlines,
        liveKind,
        frameState,
        liveColour,
        isStar,
        alt: (L) => `The window onto San Jose at ${L.label}: Mt Hamilton with the three Lick Observatory domes, foothills, two valley houses and cypresses; on the sill a brass telescope aimed at the domes, the small blue paper robot and a potted succulent.`
      };
    }
  });

  // js/places/sandiego.js
  function light2() {
    return { pal: P, sun: [232, 236], caption: "San Diego \xB7 a clear morning", label: "a clear morning", night: 0, stars: 0 };
  }
  function regions2(L) {
    const out = regionList(), R = out.R;
    R("sky", "view", (c) => c.rect(IN_X0 - 4, 60, IN_X1 - IN_X0 + 8, HORIZON + 4 - 60), (x, y) => {
      const t = clamp((y - 70) / (HORIZON - 70));
      let c = t < 0.55 ? mix(P.skyTop, P.skyMid, t / 0.55) : mix(P.skyMid, P.skyHor, (t - 0.55) / 0.45);
      return mix(c, P.sunIn, 0.3 * (1 - smooth(50, 220, Math.hypot(x - L.sun[0], y - L.sun[1]))));
    }, { live: "sky" });
    R("sun", "view", disc(...L.sun, 50), (x, y) => mix(P.sunIn, P.sunOut, smooth(6, 48, Math.hypot(x - L.sun[0], y - L.sun[1]))), { live: "sun", fine: 0.9 });
    R("sea", "view", below(() => HORIZON), (x, y) => mix(P.seaFar, P.sea, smooth(HORIZON, HORIZON + 60, y)), { src: "courses", live: "sea" });
    R("land", "view", below(LAND), (x, y) => mix(P.scrub, P.scrubDark, smooth(0, 140, y - LAND(x)) * 0.6 + 0.25 * vnoise(x / 40, y / 30, 5)), { src: ["sea"] });
    R("lawn", "view", below((x) => GROUND - 2 + 3 * Math.sin(x / 50)), (x, y) => {
      if (Math.abs(x - LX - (y - GROUND) * 0.9) < 26 && y > GROUND) return P.path;
      return mix(P.lawn, P.lawnDark, smooth(GROUND, SILL, y) * 0.7);
    }, { src: "courses" });
    R("library", "lib", (c) => {
      TIERS.forEach(([top, w], i) => {
        const bot = i ? TIERS[i - 1][0] : GROUND;
        c.rect(LX - w / 2, top, w, bot - top + 1);
      });
      c.rect(LX - ROOF[1] / 2, ROOF[0], ROOF[1], TIERS[TIERS.length - 1][0] - ROOF[0] + 1);
    }, (x, y) => {
      if (y < TIERS[TIERS.length - 1][0]) return P.concrete;
      const T = tierAt(y);
      if (!T) return P.concrete;
      const slab = y > T.bot - 11;
      const shade2 = x > LX + T.w * 0.2;
      if (slab) return shade2 ? P.concreteShade : P.concrete;
      const g = (y - T.top) / (T.bot - 11 - T.top);
      let c = mix(P.glassLit, P.glass, smooth(0, 0.7, g));
      if (shade2) c = mix(c, P.glassDeep, 0.45);
      return c;
    }, { fine: 0.72, src: "courses" });
    R("piers", "lib", union(...PIERS.map(([side, b, t]) => bar(LX + side * b, GROUND - 80, LX + side * t, 648, 26))), (x) => x > LX ? P.concreteShade : P.concrete, { fine: 0.68 });
    for (const [n, T] of TREES.entries()) {
      const [a, m, b] = T.trunk;
      R(
        "trunk" + n,
        "tree",
        union(blade(a[0], a[1], m[0], m[1], b[0], b[1], 30, 14), blade(...T.fork[0], (T.fork[0][0] + T.fork[1][0]) / 2, T.fork[0][1] - 30, ...T.fork[1], 16, 8)),
        (x, y) => mix(P.bark, P.barkShade, 0.35 * vnoise(x / 18, y / 26, 9) + 0.4 * smooth(-4, 10, x - a[0])),
        { fine: 0.7 }
      );
      R("crown" + n, "tree", union(...T.crowns.map(([x, y, rx, ry, rot]) => ell(x, y, rx, ry, rot)), ...T.strands.map(([x, y, len]) => blade(x, y - 10, x + 6, y + len * 0.5, x - 4, y + len, 22, 4))), (x, y) => {
        const k = T.crowns.reduce((acc, [cx, cy, rx, ry]) => Math.min(acc, Math.hypot((x - cx) / rx, (y - cy) / ry)), 9);
        return mix(mix(P.eucLit, P.euc, smooth(0.1, 0.9, k)), P.eucDeep, smooth(0, 1, (y - 430) / 230) * 0.5 + 0.22 * vnoise(x / 22, y / 18, 3));
      }, { fine: 0.74 });
    }
    const pages = C("#efe6d2"), pageShade = C("#d9cdb3"), covers = [C("#4f86c6"), C("#f0c64a"), C("#e5839c")];
    [[0, 980, 1001], [1, 962, 980], [2, 946, 962]].forEach(([i, top, bot]) => {
      const dx = [0, 10, -6][i];
      R("zine" + i, "still", poly([[ZX0 + dx, top], [ZX1 + dx, top], [ZX1 + dx + 2, bot], [ZX0 + dx - 2, bot]]), (x, y) => y < top + 6 ? covers[i] : mix(pages, pageShade, smooth(ZX0, ZX1, x) * 0.5), { fine: 0.62, src: "courses" });
    });
    const pink = C("#e5839c"), yellow = C("#f4cb48"), ink = C("#2a2626");
    R("zineUp", "still", poly(ZINE_UP), (x, y) => {
      if (Math.hypot(x - 206, y - 832) < 40) return yellow;
      const zy = (y - 870) / 40, zx = (x - 206) / 52;
      if (zy > 0 && zy < 1 && (Math.abs(zy) < 0.17 || Math.abs(zy - 1) < 0.17 || Math.abs(zx + (zy - 0.5) * 1.7) < 0.2) && Math.abs(zx) < 0.9) return ink;
      return mix(pink, C("#cc6f88"), smooth(150, 290, x) * 0.5);
    }, { fine: 0.6 });
    const white = C("#f4efe6"), whiteShade = C("#d6cdbf"), teal = C("#3b8f8a");
    R("saucer", "still", ell(CUPX, 986, 86, 15), (x) => mix(white, whiteShade, smooth(CUPX - 40, CUPX + 90, x)), { fine: 0.62 });
    R("cup", "still", (c) => {
      c.moveTo(CUPX - 54, 896);
      c.lineTo(CUPX + 54, 896);
      c.bezierCurveTo(CUPX + 52, 960, CUPX + 40, 982, CUPX, 982);
      c.bezierCurveTo(CUPX - 40, 982, CUPX - 52, 960, CUPX - 54, 896);
      c.closePath();
      c.moveTo(CUPX + 88, 932);
      c.ellipse(CUPX + 64, 932, 24, 28, 0, 0, Math.PI * 2);
      c.closePath();
      c.moveTo(CUPX + 76, 932);
      c.ellipse(CUPX + 64, 932, 12, 15, 0, 0, Math.PI * 2, true);
      c.closePath();
    }, (x, y) => {
      if (y < 905 && Math.abs(x - CUPX) < 48) return y < 900 ? C("#a87750") : C("#5a3a26");
      if (y > 914 && y < 926 && x < CUPX + 52) return teal;
      return mix(white, whiteShade, smooth(CUPX - 30, CUPX + 70, x));
    }, { fine: 0.6 });
    const gw = C("#f5f3ee"), gShade = C("#d6dadb"), grey = C("#98a3ab"), black = C("#2b2f33"), leg = C("#e3925a");
    R("gullLegs", "still", union(bar(GULL.x - 18, SILL + 1, GULL.x - 12, GULL.y + 30, 9), bar(GULL.x + 6, SILL + 1, GULL.x + 2, GULL.y + 30, 9)), () => leg, { fine: 0.56 });
    R("gullBody", "still", union(ell(GULL.x, GULL.y, 64, 33, -0.12), disc(GULL.x - 52, GULL.y - 34, 26)), (x, y) => mix(gw, gShade, smooth(GULL.y - 4, GULL.y + 30, y) * 0.8), { fine: 0.6 });
    R("gullWing", "still", blade(GULL.x - 30, GULL.y - 20, GULL.x + 30, GULL.y - 28, GULL.x + 92, GULL.y - 2, 30, 8), (x) => x > GULL.x + 58 ? black : grey, { fine: 0.56 });
    R("gullBeak", "still", poly([[GULL.x - 74, GULL.y - 40], [GULL.x - 104, GULL.y - 31], [GULL.x - 74, GULL.y - 26]]), (x, y) => x < GULL.x - 92 && y > GULL.y - 33 ? C("#d0452e") : C("#f0c23a"), { fine: 0.52 });
    R("gullEye", "still", disc(GULL.x - 58, GULL.y - 40, 5), () => black, { fine: 0.5 });
    return out;
  }
  function liveKind2(t, r) {
    return r.live === "sky" ? "sky" : r.live === "sun" ? "sun" : r.live === "sea" ? "sea" : null;
  }
  function frameState2(time) {
    return { birds: birdsAt(time, [[0, 24, 300, 62], [1, 31, 380, 50], [2, 40, 214, 44]]), band: time * 30 % 1500 - 250, time };
  }
  function liveColour2(s, F, L) {
    if (s.kind === "sky") {
      for (const bd of F.birds) if (inBird(bd, s.ux, s.uy)) return mix(s.col, P.bird, 0.86);
      return null;
    }
    if (s.kind === "sun") {
      const a = Math.atan2(s.uy - L.sun[1], s.ux - L.sun[0]), gl = Math.max(0, Math.cos(a - F.time * 0.4 - s.row * 0.6)) ** 12;
      return gl > 0.02 ? mix(s.col, [255, 252, 236], gl * 0.35) : null;
    }
    if (s.kind === "sea") {
      const d = s.uy - HORIZON, v = Math.sin(d * 0.11 - F.time * 1.15 + Math.sin(s.ux / 90) * 0.8);
      let c = null;
      if (v > 0.86) c = mix(s.col, P.crest, (v - 0.86) / 0.14 * 0.55 * smooth(0, 60, d));
      const glit = Math.max(0, Math.sin(F.time * 2.6 + s.h * 61)) ** 30 * (1 - smooth(0, 70, Math.abs(s.ux - L.sun[0] - 40) - 40));
      if (glit > 0.05) c = mix(c || s.col, [255, 255, 245], glit * 0.7);
      return c;
    }
    return null;
  }
  var C, P, LX, GROUND, TIERS, ROOF, tierAt, PIERS, HORIZON, LAND, TREES, ZX0, ZX1, ZINE_UP, CUPX, GULL, outlines2, sandiego_default;
  var init_sandiego = __esm({
    "js/places/sandiego.js"() {
      init_core();
      init_geom();
      init_life();
      C = (s) => rgb(s);
      P = {
        skyTop: C("#3c8ed0"),
        skyMid: C("#8cc4e8"),
        skyHor: C("#e6f2f2"),
        sunIn: C("#fffbe8"),
        sunOut: C("#f7dc8c"),
        sea: C("#2d6f9f"),
        seaFar: C("#5b9fc6"),
        crest: C("#e8f4f6"),
        scrub: C("#b9b27a"),
        scrubDark: C("#8e9461"),
        lawn: C("#7fa45a"),
        lawnDark: C("#5f8a44"),
        path: C("#e2d7bd"),
        concrete: C("#e6dfd1"),
        concreteShade: C("#c9c0b0"),
        glass: C("#3c5866"),
        glassLit: C("#7397a8"),
        glassDeep: C("#2c4250"),
        euc: C("#6f9488"),
        eucLit: C("#a4c2b2"),
        eucDeep: C("#4d7268"),
        bark: C("#e1d9c8"),
        barkShade: C("#b9ad96"),
        bird: C("#3a4248"),
        outline: C("#2b2925")
      };
      LX = 522;
      GROUND = 902;
      TIERS = [[862, 160], [822, 172], [778, 254], [734, 318], [690, 374], [646, 414], [604, 394], [564, 350]];
      ROOF = [550, 362];
      tierAt = (y) => {
        for (let i = 0; i < TIERS.length; i++) {
          const top = TIERS[i][0], bot = i ? TIERS[i - 1][0] : GROUND;
          if (y >= top && y < bot) return { i, top, bot, w: TIERS[i][1] };
        }
        return null;
      };
      PIERS = [[46, 88], [60, 140], [76, 188]].flatMap(([b, t]) => [[-1, b, t], [1, b, t]]);
      HORIZON = 652;
      LAND = (x) => 726 + 8 * Math.sin(x / 70);
      TREES = [
        {
          trunk: [[160, 912], [170, 760], [200, 600]],
          fork: [[180, 712], [118, 600]],
          crowns: [[124, 540, 70, 56, -0.3], [204, 486, 76, 58, 0.2], [254, 552, 52, 44, 0.4], [160, 430, 52, 40, 0], [92, 600, 40, 34, 0.1]],
          strands: [[86, 590, 70], [122, 590, 62], [176, 530, 56], [226, 530, 66], [272, 586, 50], [150, 470, 44]]
        },
        {
          trunk: [[864, 912], [854, 760], [826, 610]],
          fork: [[846, 700], [904, 600]],
          crowns: [[872, 530, 64, 54, 0.3], [802, 478, 68, 54, -0.2], [764, 552, 46, 40, -0.4], [846, 420, 50, 38, 0], [912, 600, 34, 30, 0.2]],
          strands: [[904, 566, 70], [866, 576, 60], [808, 520, 56], [768, 586, 52], [912, 504, 44]]
        }
      ];
      ZX0 = 104;
      ZX1 = 300;
      ZINE_UP = [[132, 770], [270, 756], [282, 940], [140, 946]];
      CUPX = 604;
      GULL = { x: 836, y: 924 };
      outlines2 = [
        { inside: ["still"], against: ["view", "lib", "tree"] },
        { inside: ["lib"], against: ["sky", "sea", "land", "lawn"] }
      ];
      sandiego_default = {
        key: "sd",
        place: "San Diego",
        light: light2,
        regions: regions2,
        outlines: outlines2,
        liveKind: liveKind2,
        frameState: frameState2,
        liveColour: liveColour2,
        isStar: () => false,
        alt: () => "The window onto San Diego on a clear morning: the Geisel Library, its glass floors stepping out over splayed concrete piers, eucalyptus on either side and the Pacific behind; on the sill a stack of zines with one standing up, a coffee cup on its saucer and a gull."
      };
    }
  });

  // js/places/bengaluru.js
  function light3() {
    return { pal: P2, caption: "Bengaluru \xB7 a monsoon afternoon", label: "a monsoon afternoon", night: 0, stars: 0 };
  }
  function regions3() {
    const out = regionList(), R = out.R;
    R("sky", "view", (c) => c.rect(IN_X0 - 4, 60, IN_X1 - IN_X0 + 8, SILL - 60), (x, y) => {
      const t = clamp((y - 70) / 660);
      return t < 0.6 ? mix(P2.skyTop, P2.skyMid, t / 0.6) : mix(P2.skyMid, P2.skyHor, smooth(0.6, 1, t));
    }, { live: "sky" });
    for (const [n, cl] of CLOUDS.entries()) {
      R("cloud" + n, "cloud", union(...cl.parts.map(([x, y, r]) => disc(x, y, r))), (x, y) => {
        let lit = 0;
        for (const [cx, cy, r] of cl.parts) {
          const d = Math.hypot(x - cx, y - cy) / r;
          if (d < 1) lit = Math.max(lit, (1 - d) * 0.4 + clamp(((x - cx) * 0.7 - (y - cy) * 0.7) / r) * 0.9);
        }
        const base = smooth(400, 540, y);
        let c = lit > 0.7 ? mix(P2.cloud, P2.cloudLit, smooth(0.7, 1.05, lit)) : mix(P2.cloudShade, P2.cloud, smooth(0.15, 0.7, lit));
        return mix(c, P2.cloudBase, base * 0.75);
      }, { live: "cloud", fine: 0.9 });
    }
    R("city", "city", (c) => {
      for (const [x0, x1, top] of BLOCKS) c.rect(x0, top, x1 - x0, SILL + 1 - top);
    }, (x, y) => {
      const i = BLOCKS.findIndex(([x02, x12]) => x >= x02 && x < x12), b = BLOCKS[Math.max(0, i)], wall = WALLS[Math.max(0, i) % WALLS.length];
      const [x0, x1, top] = b;
      if (y < top + 10) return mix(wall, [255, 255, 255], 0.25);
      const col = Math.floor((x - x0 - 14) / 34), row = Math.floor((y - top - 28) / 46), wx = x - x0 - 14 - col * 34, wy = y - top - 28 - row * 46;
      if (col >= 0 && x < x1 - 16 && row >= 0 && wx < 18 && wy < 24) return mix(wall, [40, 44, 52], 0.55);
      return mix(wall, [60, 60, 70], x > x1 - 22 ? 0.16 : 0);
    }, { fine: 0.8, src: "courses" });
    R(
      "tanks",
      "city",
      (c) => {
        for (const [x, roof, z] of TANKS) {
          const w = 42 * z, h = 32 * z;
          c.rect(x - w, roof - h, 2 * w, h + 1);
          c.moveTo(x + w, roof - h);
          c.ellipse(x, roof - h, w, 8 * z, 0, 0, Math.PI * 2);
          c.closePath();
        }
      },
      (x, y) => {
        const t = nearest(TANKS.map(([tx, ty]) => ({ x: tx, y: ty })), x, y), dy = (t.y - y) / TANKS.find(([tx]) => tx === t.x)[2];
        if (dy > 29) return P2.tankLit;
        const rib = Math.abs(dy - 20) < 3.5 || Math.abs(dy - 9) < 3.5;
        return mix(rib ? P2.tankLit : P2.tank, [20, 20, 24], smooth(-10, 30, x - t.x) * 0.5);
      },
      { fine: 0.64 }
    );
    R("trunk", "tree", union(blade(214, SILL + 1, 206, 820, 196, 640, 34, 18), blade(200, 720, 170, 680, 130, 640, 14, 6), blade(204, 700, 240, 660, 280, 630, 14, 6)), () => P2.bark, { fine: 0.7 });
    R("crown", "tree", union(...CROWN.map(([x, y, rx, ry]) => ell(x, y, rx, ry))), (x, y) => {
      const n = vnoise(x / 30, y / 26, 7), n2 = vnoise(x / 14, y / 14, 11);
      if (n2 > 0.72 && n < 0.55) return P2.leaf;
      const top = smooth(700, 540, y) * 0.6 + smooth(100, 300, x) * 0.3;
      return mix(P2.bloomDeep, mix(P2.bloom, P2.bloomLit, top), 0.5 + 0.5 * n);
    }, { fine: 0.76 });
    const glass = C2("#dfe7e6"), tea = C2("#c27a3a"), teaDeep = C2("#93552a"), foam = C2("#e6c18c");
    R("chai", "still", poly([[GLX - 42, 884], [GLX + 42, 884], [GLX + 33, SILL + 1], [GLX - 33, SILL + 1]]), (x, y) => {
      const flute = Math.floor((x - GLX + 42) / 15) % 2 === 0;
      if (y < 896) return glass;
      if (y < 908) return foam;
      if (y > 986) return mix(glass, tea, 0.35);
      return mix(mix(tea, teaDeep, smooth(908, 986, y) * 0.6 + smooth(GLX - 20, GLX + 40, x) * 0.25), [255, 238, 210], flute ? 0.1 : 0);
    }, { fine: 0.58 });
    const chip = C2("#1f2124"), chipLit = C2("#3a3d42"), pin = C2("#c9ced2"), wood = C2("#6e4a2c"), woodLit = C2("#93643c");
    R("stand", "still", union(poly([[CHX - 96, 972], [CHX + 96, 972], [CHX + 104, SILL + 1], [CHX - 104, SILL + 1]]), bar(CHX + 30, 972, CHX + 54, 840, 18)), (x) => mix(woodLit, wood, smooth(CHX - 80, CHX + 100, x)), { fine: 0.66 });
    const S = 142, CY0 = 818;
    R("pins", "still", (c) => {
      for (let i = 0; i < 6; i++) {
        const o = -S / 2 + 19 + i * 21;
        c.rect(CHX + o - 5, CY0 - 14, 10, 15);
        c.rect(CHX + o - 5, CY0 + S, 10, 15);
        c.rect(CHX - S / 2 - 14, CY0 + S / 2 + o - 5, 15, 10);
        c.rect(CHX + S / 2, CY0 + S / 2 + o - 5, 15, 10);
      }
    }, () => pin, { fine: 0.52 });
    R("chip", "still", (c) => c.rect(CHX - S / 2, CY0, S, S), (x, y) => {
      if (Math.hypot(x - (CHX - S / 2 + 22), y - (CY0 + 22)) < 9) return C2("#d9dcdc");
      return mix(chipLit, chip, smooth(-60, 60, x - CHX + (y - CY0 - S / 2)));
    }, { fine: 0.6, src: "courses" });
    return out;
  }
  function liveKind3(t, r) {
    return r.live === "sky" ? "sky" : r.live === "cloud" ? "cloud" : null;
  }
  function frameState3(time) {
    return { kites: kitesAt(time, KITES), time };
  }
  function liveColour3(s, F) {
    for (const k of F.kites) {
      const part = inKite(k, s.ux, s.uy);
      if (part === 1) return k.c1;
      if (part === 2) return k.c2;
      if (part === 3) return mix(k.c1, [255, 255, 255], 0.2);
      if (part === 4) return mix(s.col, [52, 50, 56], 0.55);
    }
    if (s.kind === "cloud" && s.edge) {
      const g = Math.max(0, Math.sin(F.time * 0.55 - s.ux * 0.012 + s.h * 2)) ** 6;
      return g > 0.05 ? mix(s.col, [255, 248, 228], g * 0.4) : null;
    }
    return null;
  }
  var C2, P2, WALLS, CLOUDS, BLOCKS, TANKS, CROWN, GLX, CHX, outlines3, KITES, bengaluru_default;
  var init_bengaluru = __esm({
    "js/places/bengaluru.js"() {
      init_core();
      init_geom();
      init_life();
      C2 = (s) => rgb(s);
      P2 = {
        skyTop: C2("#55697b"),
        skyMid: C2("#8796a2"),
        skyHor: C2("#e8cf9e"),
        cloudLit: C2("#f7efdf"),
        cloud: C2("#d8d4cc"),
        cloudShade: C2("#9aa2aa"),
        cloudBase: C2("#6c7682"),
        tank: C2("#34373c"),
        tankLit: C2("#5d636b"),
        outline: C2("#2b2925"),
        bloom: C2("#e0462a"),
        bloomLit: C2("#f27d3c"),
        bloomDeep: C2("#b5321f"),
        leaf: C2("#5f7a3a"),
        bark: C2("#4a3426")
      };
      WALLS = ["#eadcc0", "#e2aa9f", "#d9a64f", "#a9c2ce", "#b8d0b2", "#eadcc0", "#d9b48a", "#c8b7d0"].map(C2);
      CLOUDS = [
        { parts: [[300, 360, 112], [376, 284, 104], [452, 350, 96], [232, 440, 84], [330, 450, 108], [436, 446, 92], [516, 452, 70], [384, 196, 74]] },
        { parts: [[740, 330, 84], [806, 270, 92], [866, 342, 74], [716, 420, 88], [812, 424, 100], [888, 446, 62], [790, 192, 62]] }
      ];
      BLOCKS = [[66, 172, 712], [172, 268, 668], [268, 382, 726], [382, 476, 648], [476, 600, 700], [600, 704, 656], [704, 820, 714], [820, 934, 676]];
      TANKS = [[226, 668, 0.9], [430, 648, 0.8], [648, 656, 1], [880, 676, 0.85]];
      CROWN = [[182, 600, 136, 72], [104, 646, 84, 56], [262, 640, 100, 62], [196, 682, 120, 48], [150, 560, 70, 40]];
      GLX = 330;
      CHX = 690;
      outlines3 = [
        { inside: ["still"], against: ["view", "city", "tree", "cloud"] },
        { inside: ["city"], against: ["sky", "cloud"] },
        { inside: ["crown"], against: ["sky", "cloud", "city"] }
      ];
      KITES = [
        { x: 566, y: 236, size: 44, ph: 0, c1: C2("#d4337a"), c2: C2("#f2c230"), strX: 930, strY: 700 },
        { x: 470, y: 520, size: 34, ph: 2.1, c1: C2("#f08a2c"), c2: C2("#3f8f5a"), strX: 560, strY: 700 }
      ];
      bengaluru_default = {
        key: "blr",
        place: "Bengaluru",
        light: light3,
        regions: regions3,
        outlines: outlines3,
        liveKind: liveKind3,
        frameState: frameState3,
        liveColour: liveColour3,
        isStar: () => false,
        edgeOf: (r, ux, uy) => r.live === "cloud" && CLOUDS[+r.name.slice(5)].parts.some(([cx, cy, rr]) => {
          const d = Math.hypot(ux - cx, uy - cy);
          return d > rr - 22 && d < rr + 4 && ux - cx > -rr * 0.2 && uy - cy < rr * 0.3;
        }) && !CLOUDS[+r.name.slice(5)].parts.some(([cx, cy, rr]) => Math.hypot(ux - cx, uy - cy) < rr - 24),
        alt: () => "The window onto Bengaluru on a monsoon afternoon: towering clouds lit from the west, flat roofs with black water tanks, a gulmohar in flower and two kites; on the sill a glass of chai and a packaged chip on a small walnut stand."
      };
    }
  });

  // js/places/surathkal.js
  function light4() {
    return { pal: P3, moon: { at: [474, 246], r: 56 }, caption: "Surathkal \xB7 a night by the sea", label: "a night by the sea", night: 1, stars: 1 };
  }
  function regions4(L) {
    const out = regionList(), R = out.R, [mx, my] = L.moon.at, mr = L.moon.r;
    R("sky", "view", (c) => c.rect(IN_X0 - 4, 60, IN_X1 - IN_X0 + 8, HORIZON2 + 4 - 60), (x, y) => {
      const t = clamp((y - 70) / (HORIZON2 - 70));
      const c = t < 0.55 ? mix(P3.skyTop, P3.skyMid, t / 0.55) : mix(P3.skyMid, P3.skyHor, (t - 0.55) / 0.45);
      return mix(c, P3.halo, 0.55 * (1 - smooth(mr, mr + 150, Math.hypot(x - mx, y - my))));
    }, { live: "sky" });
    R("moon", "view", disc(mx, my, mr), (x, y) => mix(P3.moon, P3.moonDim, smooth(0.45, 0.75, vnoise(x / 22, y / 22, 13)) * 0.8), { fine: 0.82 });
    R("sea", "view", below(() => HORIZON2), (x, y) => {
      let c = mix(P3.seaFar, P3.sea, smooth(HORIZON2, HORIZON2 + 140, y));
      c = mix(c, P3.horizonGlow, 0.6 * (1 - smooth(0, 14, y - HORIZON2)));
      const w = 14 + (y - HORIZON2) * 0.32;
      return mix(c, P3.path, 0.55 * (1 - smooth(w * 0.4, w, Math.abs(x - MOON_X - (y - HORIZON2) * 0.05))));
    }, { src: "courses", live: "sea" });
    R(
      "head",
      "view",
      (c) => {
        c.moveTo(560, SILL + 1);
        for (let x = 560; x <= IN_X1 + 4; x += 5) c.lineTo(x, headY(x));
        c.lineTo(IN_X1 + 4, SILL + 1);
        c.closePath();
      },
      (x, y) => mix(P3.headLit, P3.head, smooth(0, 26, y - headY(x))),
      { src: ["sky", "sea"] }
    );
    R("sand", "view", below(SHORE, IN_X0 - 4, 640), (x, y) => {
      const d = y - SHORE(x);
      return d < 9 ? P3.foam : mix(P3.sandWet, P3.sand, smooth(9, 50, d));
    }, { src: ["sea"], live: "foam" });
    R("tower", "lh", poly([[LH.x - 36, LH.base + 6], [LH.x - 24, LH.top], [LH.x + 24, LH.top], [LH.x + 36, LH.base + 6]]), (x, y) => {
      const band = y > 520 && y < 556 || y > 604 && y < 640;
      const shade2 = x > LH.x + 4;
      return band ? shade2 ? P3.redShade : P3.red : shade2 ? P3.towerShade : P3.tower;
    }, { fine: 0.66, src: "courses" });
    R("gallery", "lh", (c) => c.rect(LH.x - 34, LH.top - 12, 68, 14), () => P3.iron, { fine: 0.56 });
    R("lantern", "lh", (c) => c.rect(LH.x - 20, LH.top - 50, 40, 38), (x) => Math.abs(x - LH.x) % 13 < 3 ? mix(P3.lamp, P3.iron, 0.6) : P3.lamp, { fine: 0.52, live: "lamp" });
    R("cap", "lh", (c) => {
      c.moveTo(LH.x + 25, LH.top - 50);
      c.arc(LH.x, LH.top - 50, 25, 0, Math.PI, true);
      c.closePath();
    }, () => P3.cap, { fine: 0.56 });
    for (const [n, pm] of PALMS.entries()) {
      R("palmTrunk" + n, "palm", blade(...pm.root, ...pm.mid, ...pm.crown, 26, 16), (x, y) => mix(P3.palmLit, P3.palm, 0.55 + 0.45 * smooth(-6, 8, x - pm.mid[0])), { fine: 0.62 });
      const [cx, cy] = pm.crown;
      R(
        "fronds" + n,
        "palm",
        union(...pm.fronds.map(([dx, dy, lift]) => blade(cx, cy, cx + dx * 0.5 * pm.s, cy + (dy * 0.5 - lift) * pm.s, cx + dx * pm.s, cy + dy * pm.s, 30 * pm.s + 6, 2)), disc(cx, cy + 10, 20 * pm.s + 4)),
        (x, y) => mix(P3.palm, P3.palmLit, 0.5 * smooth(0, -120, x - cx + (y - cy) * 0.8)),
        { fine: 0.62 }
      );
    }
    const navy = C3("#1f2f63"), navyDeep = C3("#17244e"), gold = C3("#e2b552"), paper = C3("#eadfc4"), paperShade = C3("#b9ab8c");
    R("chartFace", "still", (c) => c.rect(CH.x0, CH.y0, CH.x1 - CH.x0, CH.y1 - CH.y0), (x, y) => {
      for (const [sx, sy] of DIPPER) if (Math.hypot(x - sx, y - sy) < 8.5) return C3("#fff1c2");
      for (const [sx, sy] of EXTRA) if (Math.hypot(x - sx, y - sy) < 5) return gold;
      for (const [a, b] of SEGS) if (segDist(x, y, ...DIPPER[a], ...DIPPER[b]) < 3.6) return gold;
      return mix(navy, navyDeep, smooth(CH.y0, CH.y1, y) * 0.6);
    }, { fine: 0.56 });
    const roll = (x, y, cy) => mix(paper, paperShade, smooth(-6, 14, y - cy));
    R("chartTop", "still", bar(CH.x0 - 8, CH.y0 - 2, CH.x1 + 8, CH.y0 - 2, 26), (x, y) => roll(x, y, CH.y0 - 2), { fine: 0.56 });
    R("chartBot", "still", bar(CH.x0 - 10, CH.y1 + 16, CH.x1 + 10, CH.y1 + 16, 30), (x, y) => roll(x, y, CH.y1 + 16), { fine: 0.56 });
    const body = C3("#4f5e6e"), bodyLit = C3("#6f8090"), screen = C3("#0d2a22"), grid = C3("#1d4a3a"), knob = C3("#20262c");
    R("scope", "still", (c) => {
      c.rect(SC.x0, SC.y0, SC.x1 - SC.x0, SILL + 1 - SC.y0);
    }, (x, y) => mix(bodyLit, body, smooth(SC.y0, SC.y0 + 30, y) * 0.7 + smooth(SC.x0, SC.x1, x) * 0.3), { fine: 0.6, src: "courses" });
    R("screen", "still", (c) => c.rect(SC.sx0, SC.sy0, SC.sx1 - SC.sx0, SC.sy1 - SC.sy0), (x, y) => (x - SC.sx0) % 25 < 2 || (y - SC.sy0) % 21 < 2 ? grid : screen, { fine: 0.5, live: "screen" });
    R("knobs", "still", union(disc(770, 914, 11), disc(770, 946, 11)), () => knob, { fine: 0.5 });
    const shell = C3("#f1dcc4"), shellStripe = C3("#e4a98c"), lip = C3("#e8a2a0");
    R("conch", "still", union(ell(CONCH.x, CONCH.y, 52, 26, -0.18), poly([[CONCH.x + 30, CONCH.y - 22], [CONCH.x + 84, CONCH.y - 6], [CONCH.x + 38, CONCH.y + 14]])), (x, y) => {
      if (Math.hypot((x - CONCH.x + 18) / 26, (y - CONCH.y - 2) / 14) < 1) return lip;
      return Math.floor((x - CONCH.x + y * 0.5) / 14) % 2 === 0 ? shell : mix(shell, shellStripe, 0.8);
    }, { fine: 0.56 });
    return out;
  }
  function liveKind4(t, r, L) {
    return r.live === "sky" ? "sky" : r.live === "sea" ? "sea" : r.live === "screen" ? "screen" : r.live === "lamp" ? "lamp" : r.live === "foam" && t.uy - SHORE(t.ux) < 12 ? "foam" : null;
  }
  function frameState4(time) {
    const ph = time * 0.55, cx = Math.cos(ph);
    return { time, beam: { side: Math.sign(cx) || 1, len: 640 * Math.pow(Math.abs(cx), 0.6), b: Math.pow(Math.abs(cx), 0.5) }, flare: Math.max(0, Math.sin(ph)) ** 8 };
  }
  function liveColour4(s, F, L) {
    if (s.kind === "sky" || s.kind === "sea") {
      let col = null;
      const dx = s.ux - LAMP[0], dy = s.uy - LAMP[1];
      if (Math.sign(dx) === F.beam.side && Math.abs(dx) < F.beam.len) {
        const ang = Math.abs(Math.atan2(-dy - Math.abs(dx) * 0.02, Math.abs(dx))), spread = 0.07 + Math.abs(dx) * 12e-5;
        const b = Math.exp(-((ang / spread) ** 2)) * (1 - Math.abs(dx) / F.beam.len) * F.beam.b;
        if (b > 0.03) col = mix(s.col, [255, 236, 184], b * 0.55);
      }
      if (s.star) {
        const tw = 0.5 + 0.5 * Math.sin(F.time * (1.2 + s.h2 * 2.4) + s.h * 50);
        col = mix(col || s.col, [255, 246, 214], 0.35 + 0.55 * tw);
      }
      if (s.kind === "sea") {
        const w = 14 + (s.uy - HORIZON2) * 0.32, inPath = 1 - smooth(w * 0.4, w * 1.1, Math.abs(s.ux - MOON_X - (s.uy - HORIZON2) * 0.05));
        const g = Math.max(0, Math.sin(F.time * 2.8 + s.h * 70)) ** 18 * inPath;
        if (g > 0.05) col = mix(col || s.col, [255, 250, 230], g * 0.8);
      }
      return col;
    }
    if (s.kind === "screen") {
      const x = s.ux - SC.sx0 + F.time * 22, hi = Math.floor(x / 34) % 2 === 0, yL = hi ? 914 : 946;
      const onLevel = Math.abs(s.uy - yL) < 4.5, onEdge = (x % 34 < 4.5 || x % 34 > 29.5) && s.uy > 910 && s.uy < 950;
      return onLevel || onEdge ? C3("#8dffa8") : null;
    }
    if (s.kind === "lamp") return F.flare > 0.05 ? mix(s.col, [255, 252, 236], F.flare * 0.7) : null;
    if (s.kind === "foam") {
      const f = Math.sin(F.time * 0.9 - s.ux * 0.03);
      return f > 0.4 ? mix(s.col, [236, 242, 250], (f - 0.4) * 0.9) : mix(s.col, P3.sandWet, (0.4 - f) * 0.5);
    }
    return null;
  }
  var C3, P3, HORIZON2, headY, SHORE, LH, PALMS, MOON_X, CH, DIPPER, SEGS, EXTRA, SC, CONCH, outlines4, LAMP, surathkal_default;
  var init_surathkal = __esm({
    "js/places/surathkal.js"() {
      init_core();
      init_geom();
      C3 = (s) => rgb(s);
      P3 = {
        skyTop: C3("#0e1a3c"),
        skyMid: C3("#1c3466"),
        skyHor: C3("#2c4677"),
        moon: C3("#f3ecd2"),
        moonDim: C3("#dcd3b6"),
        halo: C3("#3b5486"),
        sea: C3("#0b1834"),
        seaFar: C3("#13264a"),
        path: C3("#8aa0c4"),
        foam: C3("#b9c6da"),
        horizonGlow: C3("#3e5a8c"),
        head: C3("#141b2a"),
        headLit: C3("#34405c"),
        sand: C3("#8a8778"),
        sandWet: C3("#5f6273"),
        tower: C3("#e6e2d6"),
        towerShade: C3("#a9afc0"),
        red: C3("#b8402e"),
        redShade: C3("#8a2f24"),
        iron: C3("#22262e"),
        lamp: C3("#f7d27a"),
        cap: C3("#7a2a20"),
        palm: C3("#0c1424"),
        palmLit: C3("#26365a"),
        outline: C3("#2b2925")
      };
      HORIZON2 = 640;
      headY = (x) => 736 - 64 * smooth(560, 700, x) + 10 * Math.sin(x / 33) - 18 * smooth(860, 930, x) * 0;
      SHORE = (x) => 856 + 10 * Math.sin(x / 60 + 1);
      LH = { x: 772, base: 690, top: 470 };
      PALMS = [
        { root: [146, 912], mid: [166, 760], crown: [216, 560], s: 1, fronds: [[-214, 74, 70], [-190, -26, 64], [-118, -104, 50], [-12, -132, 40], [104, -96, 50], [196, -16, 62], [212, 86, 70], [-90, 120, 40], [80, 126, 40]] },
        { root: [316, 912], mid: [306, 800], crown: [282, 664], s: 0.74, fronds: [[-200, 60, 64], [-150, -60, 56], [-40, -128, 40], [90, -110, 50], [190, -20, 60], [180, 90, 64]] }
      ];
      MOON_X = 474;
      CH = { x0: 118, x1: 346, y0: 796, y1: 968 };
      DIPPER = [[150, 842], [190, 832], [228, 850], [262, 862], [300, 896], [318, 940], [270, 934]];
      SEGS = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]];
      EXTRA = [[136, 918], [208, 900], [330, 816], [232, 948], [176, 806], [312, 862]];
      SC = { x0: 628, x1: 792, y0: 884, sx0: 642, sx1: 744, sy0: 898, sy1: 962 };
      CONCH = { x: 872, y: 972 };
      outlines4 = [
        { inside: ["still"], against: ["view", "lh", "palm"] },
        { inside: ["lh"], against: ["sky", "sea", "head"] }
      ];
      LAMP = [LH.x, LH.top - 31];
      surathkal_default = {
        key: "nitk",
        place: "Surathkal",
        light: light4,
        regions: regions4,
        outlines: outlines4,
        liveKind: liveKind4,
        frameState: frameState4,
        liveColour: liveColour4,
        isStar: (r, L, t, uy) => r.name === "sky" && t.h > 0.962 && uy < HORIZON2 - 30 && Math.hypot(t.ux - L.moon.at[0], t.uy - L.moon.at[1]) > L.moon.r + 60,
        alt: () => "The window onto Surathkal at night: the Arabian Sea under a full moon, the red-and-white lighthouse on its headland, coconut palms over the beach and a sky full of stars; on the sill an unrolled star chart showing the Plough, a pocket oscilloscope with a square wave and a conch."
      };
    }
  });

  // js/stage.js
  var stage_exports = {};
  __export(stage_exports, {
    PLACES: () => PLACES,
    WIDE_QUERY: () => WIDE_QUERY,
    createStage: () => createStage
  });
  function placePanel(mode, stageEl, laneEl, header) {
    const r = stageEl.getBoundingClientRect(), w = r.width, h = r.height, CAP = 30;
    let area;
    if (mode === "wide") {
      const laneRight = laneEl.getBoundingClientRect().right - r.left;
      const top = Math.max(16, header ? header.getBoundingClientRect().bottom - r.top + 4 : 16);
      area = { x: laneRight + 40, y: top, w: w - laneRight - 40 - 30, h: h - top - 14 - CAP };
    } else area = { x: 14, y: 8, w: w - 28, h: h - 8 - CAP - 4 };
    const k = Math.min(area.w / FIT.w, area.h / FIT.h);
    const ox = area.x + (area.w - FIT.w * k) / 2 - FIT.x0 * k, oy = area.y + (area.h - FIT.h * k) / 2 - FIT.y0 * k;
    return { k, ox, oy, stageW: w, stageH: h };
  }
  function shade(col, h, h2, amt = 0.085) {
    const f = 1 + (h - 0.5) * amt, tilt = (h2 - 0.5) * 7;
    return [clamp(col[0] * f + tilt, 0, 255), clamp(col[1] * f, 0, 255), clamp(col[2] * f - tilt, 0, 255)];
  }
  function paintStone(c, t, col, k, ox, oy, glint = 0, flat = false, squash = 1) {
    if (squash < 1) {
      const tt = { ...t, w: t.w * Math.max(0.04, squash), j: t.j };
      corners(tt, q8);
    } else corners(t, q8);
    c.beginPath();
    c.moveTo(q8[0] * k + ox, q8[1] * k + oy);
    for (let i = 1; i < 4; i++) c.lineTo(q8[i * 2] * k + ox, q8[i * 2 + 1] * k + oy);
    c.closePath();
    c.fillStyle = `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`;
    c.fill();
    if (flat) return;
    const lw = Math.max(0.7, k * 0.5), dark = col[0] + col[1] + col[2] < 200;
    c.lineWidth = lw;
    c.strokeStyle = dark ? "rgba(255,250,236,.2)" : "rgba(255,253,244,.32)";
    c.beginPath();
    c.moveTo(q8[6] * k + ox, q8[7] * k + oy);
    c.lineTo(q8[0] * k + ox, q8[1] * k + oy);
    c.lineTo(q8[2] * k + ox, q8[3] * k + oy);
    c.stroke();
    c.strokeStyle = "rgba(40,30,18,.16)";
    c.beginPath();
    c.moveTo(q8[2] * k + ox, q8[3] * k + oy);
    c.lineTo(q8[4] * k + ox, q8[5] * k + oy);
    c.lineTo(q8[6] * k + ox, q8[7] * k + oy);
    c.stroke();
    if (glint > 0.02) {
      c.strokeStyle = `rgba(255,255,250,${Math.min(0.85, glint)})`;
      c.lineWidth = Math.max(0.9, k * 0.7);
      const mx = (q8[0] + q8[2]) / 2, my = (q8[1] + q8[3]) / 2, nx = (q8[6] + q8[0]) / 2, ny = (q8[7] + q8[1]) / 2;
      c.beginPath();
      c.moveTo((nx * 0.55 + mx * 0.45) * k + ox, (ny * 0.55 + my * 0.45) * k + oy);
      c.lineTo((mx * 0.75 + nx * 0.25) * k + ox, (my * 0.75 + ny * 0.25) * k + oy);
      c.stroke();
    }
  }
  function halfPlane(pts, a, keepBelow) {
    const f = ([x, y]) => (waveAt(x, y) - a) * (keepBelow ? 1 : -1), out = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], qq = pts[(i + 1) % pts.length], fp = f(p), fq = f(qq);
      if (fp <= 0) out.push(p);
      if (fp <= 0 !== fq <= 0) {
        const t = fp / (fp - fq);
        out.push([p[0] + (qq[0] - p[0]) * t, p[1] + (qq[1] - p[1]) * t]);
      }
    }
    return out;
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
  async function createStage({ canvas, stageEl, laneEl, sections, header, captionEl, hooks = {}, still = false, onChange, onReady }) {
    let disposed = false, raf = 0, building = 0, resizeTimer = 0, visible = true, lastT = -1, lastPos = -1, lastKey = "";
    const st = { canvas, ctx: canvas.getContext("2d"), eras: [], pos: 0 };
    const t0 = performance.now(), wideMq = matchMedia(WIDE_QUERY);
    const scrollPos = () => {
      if (hooks.pos != null) return hooks.pos;
      const tall = !wideMq.matches, vh = innerHeight;
      const ref = scrollY + vh * (tall ? 0.78 : 0.52), span = vh * (tall ? 0.3 : 0.42);
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
    async function buildEra(i, G, alive) {
      if (st.eras[i] || st.eras[i] === "pending") return;
      st.eras[i] = "pending";
      const place = PLACES[i], L = place.light(hooks.hour), regions5 = place.regions(L);
      const res = await runSliced(laySteps(regions5, place.outlines, { W: G.W, H: G.H, q: G.q, s: SHEET_STONE, seed: 23 + i * 17 }), alive);
      if (!res) {
        st.eras[i] = void 0;
        return;
      }
      const stones = res.stones, P4 = L.pal, live = [];
      for (const t of stones) {
        t.ux = t.x / G.q + PANEL.x0;
        t.uy = t.y / G.q + PANEL.y0;
        t.w8 = clamp(waveAt(t.ux, t.uy) + (hash2(t.x * 7 | 0, t.y * 7 | 0, 5) - 0.5) * 2 * WAVE_J, -WAVE_J, 1 + WAVE_J);
        if (t.k === 0) {
          t.col = shade(P4.outline || FRAME_PAL.outline, t.h, t.h2, 0.12);
          continue;
        }
        const r = regions5[t.reg];
        t.col = shade(r.fill(t.ux, t.uy), t.h, t.h2, r.group === "still" ? 0.06 : 0.085);
        t.kind = place.liveKind(t, r, L);
        t.star = place.isStar(r, L, t, t.uy);
        if (place.edgeOf) t.edge = place.edgeOf(r, t.ux, t.uy);
        t.glass = t.kind === "sun" && t.h2 > 0.62 || r.name === "sky" && !L.night && t.h2 > 0.975 && t.uy < 520;
        if (t.kind || t.glass || t.star) live.push(t);
      }
      const cv = document.createElement("canvas");
      cv.width = G.winW;
      cv.height = G.winH;
      const c = cv.getContext("2d"), gr = FRAME_PAL.grout;
      c.save();
      c.setTransform(G.k * G.dpr, 0, 0, G.k * G.dpr, G.unitX - G.winX, G.unitY - G.winY);
      c.beginPath();
      innerPath(c);
      c.restore();
      c.save();
      c.clip();
      c.fillStyle = `rgb(${mix(gr, P4.skyMid || gr, 0.25).map((v) => v | 0).join(",")})`;
      c.fillRect(0, 0, cv.width, cv.height);
      const ox = G.offX - G.winX, oy = G.offY - G.winY;
      for (const t of stones) paintStone(c, grouted(t), mix(gr, t.col, 0.42), G.kk, ox, oy, 0, true);
      for (const t of stones) paintStone(c, t, t.col, G.kk, ox, oy, t.glass ? 0.22 : 0);
      c.restore();
      const sorted = stones.slice().sort((a, b) => a.w8 - b.w8);
      if (!alive()) {
        st.eras[i] = void 0;
        return;
      }
      st.eras[i] = { cv, stones: sorted, live, L, place, bed: mix(gr, P4.skyMid || gr, 0.25), ox, oy };
    }
    const build = async () => {
      const id = ++building, alive = () => !disposed && id === building;
      const mode = wideMq.matches ? "wide" : "tall", dpr = Math.min(2, devicePixelRatio || 1);
      const Pp = placePanel(mode, stageEl, laneEl, header);
      if (Pp.k * 1e3 < 60) return;
      st.ready = false;
      st.eras = [];
      canvas.width = Math.round(Pp.stageW * dpr);
      canvas.height = Math.round(Pp.stageH * dpr);
      const across = clamp(Math.round(Pp.k * 1e3 / 6.1), 72, 126), q = across * SHEET_STONE / 1e3, su = SHEET_STONE / q;
      const G = {
        k: Pp.k,
        dpr,
        q,
        su,
        W: Math.ceil(PANEL.w * q),
        H: Math.ceil(PANEL.h * q),
        kk: Pp.k * dpr / q,
        unitX: Pp.ox * dpr,
        unitY: Pp.oy * dpr,
        offX: (Pp.ox + PANEL.x0 * Pp.k) * dpr,
        offY: (Pp.oy + PANEL.y0 * Pp.k) * dpr
      };
      G.winX = Math.floor(G.unitX + WIN.x0 * Pp.k * dpr);
      G.winY = Math.floor(G.unitY + WIN.y0 * Pp.k * dpr);
      G.winW = Math.ceil((WIN.x1 - WIN.x0) * Pp.k * dpr) + 2;
      G.winH = Math.ceil((WIN.y1 - WIN.y0) * Pp.k * dpr) + 2;
      st.G = G;
      st.P = Pp;
      const toPx = (ux, uy) => [G.unitX + ux * G.k * dpr, G.unitY + uy * G.k * dpr];
      const fr = frameRegions(), rnd = mulberry32(5);
      const fres = await runSliced(laySteps(fr, FRAME_OUTLINES, { W: G.W, H: G.H, q, s: SHEET_STONE, seed: 11 }), alive);
      if (!fres) return;
      const kept = finishFrame(fres.stones, fr, q, su, rnd), loose = looseStones(q, su, rnd, kept.slice());
      const fc = document.createElement("canvas");
      fc.width = canvas.width;
      fc.height = canvas.height;
      const c = fc.getContext("2d");
      c.save();
      c.filter = `blur(${Math.max(1, 3 * dpr * G.k)}px)`;
      bedPath(c, toPx);
      c.fillStyle = `rgba(${FRAME_PAL.bed.join(",")},.6)`;
      c.fill();
      c.restore();
      c.save();
      bedPath(c, toPx);
      c.clip();
      c.strokeStyle = "rgba(150,138,116,.08)";
      c.lineWidth = Math.max(1, 1.1 * dpr);
      for (let i = 0; i < 8; i++) {
        const r0 = 512 + rnd() * 40, a0 = Math.PI * 1.08 + rnd() * Math.PI * 0.84, a1 = a0 + 0.08 + rnd() * 0.14;
        c.beginPath();
        for (let a = a0; a < a1; a += 0.01) {
          const [px, py] = toPx(500 + r0 * Math.cos(a), 500 + r0 * Math.sin(a));
          a === a0 ? c.moveTo(px, py) : c.lineTo(px, py);
        }
        c.stroke();
      }
      c.restore();
      c.save();
      const [sx0, sy0] = toPx(-30, SILL_B), [sx1, sy1] = toPx(1030, SILL_B + 18);
      const g = c.createLinearGradient(0, sy0, 0, sy1);
      g.addColorStop(0, "rgba(70,52,30,.2)");
      g.addColorStop(1, "rgba(70,52,30,0)");
      c.fillStyle = g;
      c.fillRect(sx0, sy0, sx1 - sx0, sy1 - sy0);
      c.restore();
      c.fillStyle = `rgb(${FRAME_PAL.grout.join(",")})`;
      groutPath(c, toPx, su);
      c.fill();
      c.save();
      c.setTransform(G.k * dpr, 0, 0, G.k * dpr, G.unitX, G.unitY);
      c.beginPath();
      sillPath(c);
      c.fill();
      c.restore();
      for (const t of [...kept, ...loose]) paintStone(c, grouted(t), mix(FRAME_PAL.grout, t.col, t.loose ? 0.25 : 0.42), G.kk, G.offX, G.offY, 0, true);
      for (const t of [...kept, ...loose]) paintStone(c, t, shade(t.col, t.h, t.h2, t.gold ? 0.14 : 0.07), G.kk, G.offX, G.offY, t.gold ? 0.25 : 0);
      st.frame = fc;
      st.gold = [...kept, ...loose].filter((t) => t.gold);
      for (const t of st.gold) t.col = shade(t.col, t.h, t.h2, 0.14);
      if (!alive()) return;
      const first = Math.min(3, Math.round(hooks.era != null ? hooks.era : scrollPos()));
      const need = hooks.all ? [0, 1, 2, 3] : hooks.pos != null ? [Math.floor(hooks.pos), Math.min(3, Math.ceil(hooks.pos))] : [first];
      for (const i of need) {
        await buildEra(i, G, alive);
        if (!alive()) return;
      }
      st.ready = true;
      lastPos = -1;
      lastKey = "";
      render(hooks.t != null ? hooks.t : 0, true);
      onReady?.(PLACES[0].light(hooks.hour));
      if (hooks.t == null) {
        for (const i of [first + 1, first - 1, first + 2, first - 2, first + 3, first - 3]) if (i >= 0 && i < 4) {
          await buildEra(i, G, alive);
          if (!alive()) return;
        }
        lastPos = -1;
        kick();
      }
    };
    function caption(E2, P4) {
      const key = E2.place.key + E2.L.caption;
      if (key !== lastKey) {
        lastKey = key;
        onChange?.({ place: E2.place.place, caption: E2.L.caption, alt: E2.place.alt(E2.L), L: E2.L, key: E2.place.key });
        if (captionEl) {
          captionEl.textContent = E2.L.caption;
          const yb = P4.oy + (SILL_B + 12) * P4.k;
          captionEl.style.left = P4.ox - 40 * P4.k + "px";
          captionEl.style.top = yb + "px";
          captionEl.style.width = 1080 * P4.k + "px";
        }
      }
    }
    function drawLive(E2, time) {
      const c = st.ctx, G = st.G, F = E2.place.frameState(time, E2.L);
      for (const s of E2.live) {
        let col = E2.place.liveColour(s, F, E2.L), g = 0;
        if (s.glass) g = 0.18 + 0.6 * Math.max(0, Math.sin(time * 0.5 + s.h * 23)) ** 14;
        if (col || g) paintStone(c, s, col || s.col, G.kk, G.offX, G.offY, g);
      }
    }
    function drawGold(time) {
      const c = st.ctx, G = st.G;
      for (const s of st.gold) {
        const g = Math.max(0, Math.sin(time * 0.4 - (s.ux + s.uy) * 6e-3 + s.h * 1.5)) ** 18;
        if (g > 0.06) paintStone(c, s, mix(s.col, [255, 244, 200], g * 0.35), G.kk, G.offX, G.offY, g * 0.9);
      }
    }
    function render(time, force) {
      const c = st.ctx, G = st.G;
      if (!st.frame || !G) return;
      const pos = clamp(st.pos = scrollPos(), 0, 3);
      let i = Math.min(2, Math.floor(pos)), tau = pos >= 3 ? 1 : pos - i;
      if (still) {
        i = Math.min(3, Math.round(pos));
        tau = 0;
      }
      const A = st.eras[i], B = st.eras[Math.min(3, i + 1)];
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, canvas.width, canvas.height);
      c.drawImage(st.frame, 0, 0);
      const okA = A && A !== "pending", okB = B && B !== "pending";
      const settled = tau < 1e-3 || tau > 0.999 || !okA || !okB;
      if (settled) {
        const E2 = tau > 0.999 && okB ? B : okA ? A : okB ? B : null;
        if (E2) {
          c.drawImage(E2.cv, G.winX, G.winY);
          caption(E2, st.P);
          if (!(still && hooks.t == null)) drawLive(E2, time);
        }
      } else {
        const fw = -WAVE_J + tau * (1 + 2 * WAVE_J + WAVE_W);
        c.drawImage(A.cv, G.winX, G.winY);
        const toDev = ([ux, uy]) => [G.unitX + ux * G.k * G.dpr, G.unitY + uy * G.k * G.dpr];
        const poly2 = (pts) => {
          if (pts.length < 3) return false;
          c.beginPath();
          pts.map(toDev).forEach(([x, y], k) => k ? c.lineTo(x, y) : c.moveTo(x, y));
          c.closePath();
          return true;
        };
        c.save();
        if (poly2(halfPlane(WIN_PTS, fw - WAVE_W - WAVE_J - 0.012, true))) {
          c.clip();
          c.drawImage(B.cv, G.winX, G.winY);
        }
        c.restore();
        const lo = fw - WAVE_W - WAVE_J - 0.03, hi = fw + WAVE_J + 0.03;
        const band = halfPlane(halfPlane(WIN_PTS, hi, true), lo, false);
        c.save();
        if (poly2(band)) {
          c.clip();
          c.save();
          c.setTransform(G.k * G.dpr, 0, 0, G.k * G.dpr, G.unitX, G.unitY);
          c.beginPath();
          innerPath(c);
          c.restore();
          c.fillStyle = `rgb(${B.bed.map((v) => v | 0).join(",")})`;
          c.fill();
          for (const E2 of [A, B]) {
            const isA = E2 === A, S = E2.stones;
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
              paintStone(c, t, mix(t.col, [30, 26, 22], (1 - sq) * 0.3), G.kk, G.offX, G.offY, 0, sq < 0.98, sq);
            }
          }
        }
        c.restore();
        caption(tau < 0.5 ? A : B, st.P);
      }
      if (!(still && hooks.t == null)) drawGold(time);
    }
    const frame = (now) => {
      raf = 0;
      if (disposed || document.hidden || !st.ready || !visible) return;
      const t = (now - t0) / 1e3, pos = scrollPos();
      if (pos !== lastPos || t - lastT > 1 / 14) {
        render(t);
        lastT = t;
        lastPos = pos;
      }
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
        }
      } else kick();
    };
    const onVis = () => {
      if (!document.hidden) kick();
    };
    document.addEventListener("visibilitychange", onVis);
    addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver((es) => {
      visible = es[0].isIntersecting;
      kick();
    });
    io.observe(stageEl);
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 220);
    };
    addEventListener("resize", onResize);
    wideMq.addEventListener?.("change", onResize);
    await build();
    if (hooks.t != null) window.__renderAt = (t, pos) => {
      if (pos != null) hooks.pos = pos;
      const a = performance.now();
      render(t);
      return performance.now() - a;
    };
    return { destroy() {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener("resize", onResize);
      removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
    } };
  }
  var PLACES, WIDE_QUERY, SHEET_STONE, WIN, q8, grouted, WAVE_D, waveAt, WAVE_W, WAVE_J, WIN_PTS;
  var init_stage = __esm({
    "js/stage.js"() {
      init_core();
      init_geom();
      init_lay();
      init_frame();
      init_sanjose();
      init_sandiego();
      init_bengaluru();
      init_surathkal();
      PLACES = [sanjose_default, sandiego_default, bengaluru_default, surathkal_default];
      WIDE_QUERY = "(min-aspect-ratio: 29/20) and (min-width: 1000px)";
      SHEET_STONE = 6;
      WIN = { x0: IN_X0 - 4, y0: 64, x1: IN_X1 + 4, y1: SILL + 2 };
      q8 = new Float32Array(8);
      grouted = (t, gr) => ({ ...t, l: t.l + t.s * 0.2, w: t.w + t.s * 0.2 });
      WAVE_D = IN_X1 - IN_X0 + 930 * 0.55;
      waveAt = (ux, uy) => (IN_X1 - ux + (uy - 70) * 0.55) / WAVE_D;
      WAVE_W = 0.16;
      WAVE_J = 0.05;
      WIN_PTS = [[WIN.x0, WIN.y0], [WIN.x1, WIN.y0], [WIN.x1, WIN.y1], [WIN.x0, WIN.y1]];
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
  function lane(still) {
    return ERA_LIST.map((era, index) => `<section class="ff-frame" data-frame="${era.key}" aria-labelledby="place-${era.key}">
    ${index === 0 ? `<div class="ff-intro">
      <h1>Hi, I\u2019m San.</h1>
      <p class="ff-lede">I work on language models at eBay. Before that: computer science at UC San Diego, chip design at Texas Instruments, and electrical engineering at NIT Karnataka. Along the way I co-founded <a href="${SITE}/notes/startr-postmortem">a startup that didn\u2019t make it</a>. I also write, make things, and sometimes turn an idea into a film.</p>
      <p class="ff-more"><a href="${SITE}/about">More about me</a><span class="ff-mail">san@sankala.me</span>${still ? '<a href="?">Living version</a>' : '<a href="?plain=1">Still version</a>'}</p>
      <p class="ff-cue">The window is laid in stones, in code. In San Jose it keeps the real time; scroll, and it is re-laid for each place I\u2019ve lived and worked.<span class="ff-clock"></span></p>
      <h2 class="ff-path" id="history">My path so far</h2>
    </div>` : ""}
    <header class="ff-place"><span class="ff-years">${esc(era.years)}</span><h2 id="place-${era.key}">${esc(era.place)}</h2><span class="ff-role">${esc(era.role)}</span></header>
    <ol class="ff-entries">${era.milestones.map((m) => `<li id="history-${m.id}" class="${m.images.length ? "has-print" : ""}">
      <div class="ff-entry-text"><time datetime="${m.date}">${esc(monthYear(m))}</time><h3>${esc(m.title)}</h3><p>${withLinks(m.description)}</p>
      ${m.links.length ? `<p class="ff-links">${m.links.map(([h, l]) => `<a href="${esc(href(h))}">${esc(l)}</a>`).join("")}</p>` : ""}</div>
      ${m.images.map((im) => `<a class="ff-print" href="${esc(localImage(im.src))}" data-caption="${esc(im.caption)}" aria-label="Enlarge photograph: ${esc(im.caption)}"><img src="${esc(localImage(im.src))}" alt="${esc(im.alt)}" loading="lazy" decoding="async"></a>`).join("")}
    </li>`).join("")}</ol>
  </section>`).join("");
  }
  async function start() {
    const params = new URLSearchParams(location.search);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const still = params.get("plain") === "1" || reduce;
    const root = document.querySelector(".four-frames");
    const laneEl = root.querySelector(".ff-lane");
    laneEl.innerHTML = lane(still);
    const dlg = root.querySelector(".ff-lightbox");
    laneEl.addEventListener("click", (e) => {
      const a = e.target.closest(".ff-print");
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      dlg.querySelector("figure").innerHTML = `<img src="${a.getAttribute("href")}" alt="${esc(a.querySelector("img").alt)}"><figcaption>${esc(a.dataset.caption)}</figcaption>`;
      dlg.showModal();
    });
    dlg.addEventListener("click", (e) => {
      if (e.target === dlg || e.target.closest(".ff-lightbox-close")) dlg.close();
    });
    const { createStage: createStage2 } = await Promise.resolve().then(() => (init_stage(), stage_exports));
    const ERA_KEYS = ["now", "sd", "blr", "nitk"];
    const hooks = { t: num(params, "t"), hour: num(params, "hour"), pos: num(params, "pos"), era: ERA_KEYS.includes(params.get("era")) ? ERA_KEYS.indexOf(params.get("era")) : void 0 };
    if (hooks.era != null && hooks.pos == null) hooks.pos = hooks.era;
    hooks.all = params.get("all") === "1";
    const clock = root.querySelector(".ff-clock");
    await createStage2({
      canvas: root.querySelector(".ff-canvas"),
      stageEl: root.querySelector(".ff-stage"),
      laneEl,
      sections: [...laneEl.querySelectorAll(".ff-frame")],
      onChange: (info) => {
        root.querySelector(".ff-canvas").setAttribute("aria-label", info.alt);
      },
      header: document.querySelector(".site-header"),
      captionEl: root.querySelector(".ff-caption"),
      hooks,
      still,
      onReady: (light5) => {
        clock.textContent = `It\u2019s ${light5.label} in San Jose now.`;
        root.classList.add("is-live");
        setTimeout(() => {
          window.__ready = true;
        }, hooks.t != null ? 60 : 0);
      }
    });
  }
  start();
})();
