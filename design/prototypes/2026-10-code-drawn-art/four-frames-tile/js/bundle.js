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
  function css(c, a = 1) {
    const C = typeof c === "string" ? rgb(c) : c;
    return `rgba(${C[0] | 0},${C[1] | 0},${C[2] | 0},${(C[3] ?? 1) * a})`;
  }
  function makeCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(w));
    c.height = Math.max(1, Math.round(h));
    return c;
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

  // js/ink.js
  function bumpRing(cx, cy, rx, ry, n, seed, amp = 0.22, flatBottom = false) {
    const rnd = mulberry32(seed), pts = [];
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU + rnd() * 0.2;
      const r = 1 + (rnd() - 0.4) * amp;
      let y = cy + Math.sin(a) * ry * r;
      if (flatBottom && Math.sin(a) > 0.25) y = cy + ry * 0.55 + (rnd() - 0.5) * ry * 0.06;
      pts.push([cx + Math.cos(a) * rx * r, y]);
    }
    return pts;
  }
  function poolOf(col) {
    if (typeof col !== "string") return null;
    if (poolCache.has(col)) return poolCache.get(col);
    let c = null, a = 1;
    if (col[0] === "#") c = rgb(col);
    else {
      const m = col.match(/rgba?\(([^)]+)\)/);
      if (m) {
        const v = m[1].split(",").map(Number);
        c = v.slice(0, 3);
        a = v[3] ?? 1;
      }
    }
    const out = c && a > 0.6 ? `rgba(${c[0] * 0.62 | 0},${c[1] * 0.6 | 0},${c[2] * 0.58 | 0},` : null;
    poolCache.set(col, out);
    return out;
  }
  var INK, LW_SIL, LW, LW_IN, LW_FINE, R, RR, PL, LN, EL, BLOB, CURVE, SCALLOP, poolCache, Pen, PAL;
  var init_ink = __esm({
    "js/ink.js"() {
      init_core();
      INK = "#28221e";
      LW_SIL = 2.8;
      LW = 2.3;
      LW_IN = 1.35;
      LW_FINE = 0.9;
      R = (x, y, w, h) => (c) => c.rect(x, y, w, h);
      RR = (x, y, w, h, r) => (c) => {
        r = Math.min(r, w / 2, h / 2);
        c.moveTo(x + r, y);
        c.arcTo(x + w, y, x + w, y + h, r);
        c.arcTo(x + w, y + h, x, y + h, r);
        c.arcTo(x, y + h, x, y, r);
        c.arcTo(x, y, x + w, y, r);
        c.closePath();
      };
      PL = (pts) => (c) => {
        c.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
        c.closePath();
      };
      LN = (pts) => (c) => {
        c.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
      };
      EL = (cx, cy, rx, ry, rot = 0) => (c) => c.ellipse(cx, cy, Math.abs(rx), Math.abs(ry), rot, 0, TAU);
      BLOB = (pts, tension = 0.5) => (c) => {
        const n = pts.length;
        c.moveTo(pts[0][0], pts[0][1]);
        for (let i = 0; i < n; i++) {
          const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
          c.bezierCurveTo(
            p1[0] + (p2[0] - p0[0]) * tension / 3,
            p1[1] + (p2[1] - p0[1]) * tension / 3,
            p2[0] - (p3[0] - p1[0]) * tension / 3,
            p2[1] - (p3[1] - p1[1]) * tension / 3,
            p2[0],
            p2[1]
          );
        }
        c.closePath();
      };
      CURVE = (pts, tension = 0.5) => (c) => {
        const n = pts.length;
        c.moveTo(pts[0][0], pts[0][1]);
        for (let i = 0; i < n - 1; i++) {
          const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
          c.bezierCurveTo(
            p1[0] + (p2[0] - p0[0]) * tension / 3,
            p1[1] + (p2[1] - p0[1]) * tension / 3,
            p2[0] - (p3[0] - p1[0]) * tension / 3,
            p2[1] - (p3[1] - p1[1]) * tension / 3,
            p2[0],
            p2[1]
          );
        }
      };
      SCALLOP = (pts, bulge = 0.55) => (c) => {
        const n = pts.length;
        c.moveTo(pts[0][0], pts[0][1]);
        for (let i = 0; i < n; i++) {
          const a = pts[i], b = pts[(i + 1) % n];
          const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
          c.quadraticCurveTo(mx + dy * bulge, my - dx * bulge, b[0], b[1]);
        }
        c.closePath();
      };
      poolCache = /* @__PURE__ */ new Map();
      Pen = class {
        constructor(c, px) {
          this.c = c;
          this.px = px;
          this.pool = 1;
        }
        // px = device pixels per art unit
        begin(fn) {
          const c = this.c;
          c.beginPath();
          fn(c);
          return c;
        }
        fill(col, fn, rule) {
          const c = this.begin(fn);
          c.fillStyle = col;
          c.fill(rule || "nonzero");
          return this;
        }
        ink(fn, w = LW, col = INK) {
          const c = this.begin(fn);
          c.lineWidth = Math.max(w, 0.8 / this.px);
          c.strokeStyle = col;
          c.lineJoin = "round";
          c.lineCap = "round";
          c.stroke();
          return this;
        }
        /** a gouache fill: flat colour with a little pigment pooled along the inside of its edge */
        paint(col, fn, rule, amt = this.pool) {
          this.fill(col, fn, rule);
          const pc = amt > 0 ? poolOf(col) : null;
          if (pc) {
            const c = this.c;
            c.save();
            this.begin(fn);
            c.clip(rule || "nonzero");
            c.lineJoin = "round";
            for (const [w, a] of [[9, 0.045], [5, 0.05], [2.2, 0.07]]) {
              c.lineWidth = w;
              c.strokeStyle = pc + a * amt + ")";
              c.stroke();
            }
            c.restore();
          }
          return this;
        }
        shape(fn, col, w = LW, rule) {
          this.paint(col, fn, rule);
          if (w) this.ink(fn, w);
          return this;
        }
        within(clipFn, draw) {
          const c = this.c;
          c.save();
          this.begin(clipFn);
          c.clip();
          draw(this);
          c.restore();
          return this;
        }
        alpha(a, draw) {
          const c = this.c, g = c.globalAlpha;
          c.globalAlpha = g * a;
          draw(this);
          c.globalAlpha = g;
          return this;
        }
        at(x, y, rot, sc, draw) {
          const c = this.c;
          c.save();
          c.translate(x, y);
          if (rot) c.rotate(rot);
          if (sc && sc !== 1) c.scale(sc, sc);
          draw(this);
          c.restore();
          return this;
        }
        grad(x0, y0, x1, y1, stops) {
          const g = this.c.createLinearGradient(x0, y0, x1, y1);
          stops.forEach(([t, col]) => g.addColorStop(t, col));
          return g;
        }
        rgrad(x, y, r0, r1, stops) {
          const g = this.c.createRadialGradient(x, y, r0, x, y, r1);
          stops.forEach(([t, col]) => g.addColorStop(t, col));
          return g;
        }
      };
      PAL = {
        wall: "#dfe3d0",
        wallShade: "#c7cdb6",
        wallDeep: "#b3baa2",
        base: "#f1efe5",
        baseShade: "#d8d6c9",
        floor: "#b07c50",
        floorShade: "#93623a",
        frame: "#f4f2ea",
        frameShade: "#d9d7cb",
        oak: "#cf9459",
        oakTop: "#dca86c",
        oakShade: "#ad733f",
        oakDeep: "#8f5a31",
        cork: "#c99c66",
        corkShade: "#b0844f",
        pinframe: "#8f6039",
        pinframeShade: "#74492a",
        lamp: "#c4523b",
        lampShade: "#9b3a28",
        cobalt: "#2f55b8",
        cobaltShade: "#22408f",
        vermilion: "#e0553a",
        cloud: "#fbfaf3",
        cloudShade: "#dfe7ea"
      };
    }
  });

  // js/room.js
  function openingOf(L) {
    const w = L.win;
    return { x: w.x + w.f, y: w.y + w.f, w: w.w - 2 * w.f, h: w.h - 2 * w.f };
  }
  function drawRoom(P, L) {
    const o = openingOf(L), w = L.win, d = L.desk;
    const X0 = L.xMin - 4, X1 = L.xMax + 4, Y0 = L.yMin - 4, Y1 = L.yMax + 4;
    const wallArea = (cc) => {
      cc.rect(X0, Y0, X1 - X0, L.base.y - Y0);
      cc.rect(o.x + o.w, o.y, -o.w, o.h);
    };
    P.fill(PAL.wall, wallArea, "evenodd");
    P.within(wallArea, (p) => {
      p.fill(p.grad(0, Math.min(Y0, -60), 0, 520, [[0, "rgba(120,128,104,.12)"], [1, "rgba(120,128,104,0)"]]), R(X0, Y0, X1 - X0, 520 - Y0));
      const cx = w.x + w.w / 2, cy = w.y + w.h * 0.55;
      p.fill(p.rgrad(cx, cy, 60, 900, [[0, "rgba(255,252,236,.34)"], [0.55, "rgba(255,252,236,.1)"], [1, "rgba(255,252,236,0)"]]), R(X0, Y0, X1 - X0, Y1 - Y0));
      p.fill(p.grad(X0, 0, X0 + 600, 0, [[0, "rgba(110,118,96,.1)"], [1, "rgba(110,118,96,0)"]]), R(X0, Y0, 600, Y1 - Y0));
      p.fill(PAL.wallShade, R(d.leftBack - 2, d.backY, X1 - d.leftBack + 4, L.base.y - d.backY));
      p.fill(p.grad(0, d.frontY + d.faceH, 0, L.base.y, [[0, "rgba(70,74,58,.26)"], [1, "rgba(70,74,58,.06)"]]), R(d.leftBack - 2, d.frontY, X1 - d.leftBack + 4, L.base.y - d.frontY));
      const rnd = mulberry32(12);
      for (let i = 0; i < 14; i++) {
        const x = lerp(X0, X1, rnd()), y = lerp(Y0, L.base.y, rnd()), r = 120 + rnd() * 260;
        p.fill(p.rgrad(x, y, 0, r, [[0, `rgba(${rnd() < 0.5 ? "255,255,246" : "120,126,100"},${0.022 + rnd() * 0.025})`], [1, "rgba(0,0,0,0)"]]), R(x - r, y - r, 2 * r, 2 * r));
      }
    });
    P.fill(PAL.base, R(X0, L.base.y, X1 - X0, L.base.h));
    P.fill(PAL.baseShade, R(X0, L.base.y + L.base.h - 5, X1 - X0, 5));
    P.ink(LN([[X0, L.base.y], [X1, L.base.y]]), LW_IN);
    const fy = L.base.y + L.base.h;
    P.fill(PAL.floor, R(X0, fy, X1 - X0, Y1 - fy));
    P.within(R(X0, fy, X1 - X0, Y1 - fy), (p) => {
      p.fill(p.grad(0, fy, 0, fy + 60, [[0, "rgba(60,30,10,.3)"], [1, "rgba(60,30,10,0)"]]), R(X0, fy, X1 - X0, 60));
      for (let x = X0 - 40; x < X1; x += 118) p.ink(LN([[x, fy], [x - 70, Y1]]), LW_FINE, "rgba(60,34,16,.5)");
    });
    P.ink(LN([[X0, fy], [X1, fy]]), LW);
    P.alpha(0.18, (p) => p.fill("#4b5240", R(w.x + 7, w.y + 8, w.w, w.h)));
    P.shape((cc) => {
      cc.rect(w.x, w.y, w.w, w.h);
      cc.rect(o.x + o.w, o.y, -o.w, o.h);
    }, PAL.frame, LW_SIL, "evenodd");
    P.fill(PAL.frameShade, PL([[o.x, o.y], [o.x + o.w, o.y], [o.x + o.w - 7, o.y + 8], [o.x + 7, o.y + 8]]));
    P.fill(PAL.frameShade, PL([[o.x, o.y], [o.x + 7, o.y + 8], [o.x + 7, o.y + o.h], [o.x, o.y + o.h]]));
    P.ink((cc) => cc.rect(o.x, o.y, o.w, o.h), LW);
    const s = L.sill;
    P.shape(PL([[w.x - s.over, s.y], [w.x + w.w + s.over, s.y], [w.x + w.w + s.over + 5, s.y + 8], [w.x - s.over - 5, s.y + 8]]), "#fbfaf4", LW_IN);
    P.shape(R(w.x - s.over - 5, s.y + 8, w.w + 2 * s.over + 10, s.h - 8), PAL.frameShade, LW_IN);
    P.alpha(0.22, (p) => p.fill("#4b5240", R(w.x - s.over, s.y + s.h, w.w + 2 * s.over + 4, 9)));
    const tY = o.y + o.h * w.transom, mX = o.x + o.w / 2, bar = w.bar;
    P.shape(R(o.x, tY - bar / 2, o.w, bar), PAL.frame, LW_IN);
    P.shape(R(mX - bar / 2, o.y, bar, o.h), PAL.frame, LW_IN);
    P.fill(PAL.frameShade, R(o.x + 1, tY + bar / 2 - 3, o.w - 2, 3));
    P.fill(PAL.frameShade, R(mX + bar / 2 - 3, tY + bar / 2, 3, o.h - (tY - o.y) - bar / 2));
    P.shape(RR(mX - 4, tY + 34, 8, 30, 3), "#c99a3e", LW_IN);
    P.alpha(0.5, (p) => {
      for (const [px0, py0] of [[o.x + 26, tY + 40], [mX + 24, tY + 40]]) {
        p.ink(LN([[px0, py0 + 46], [px0 + 40, py0]]), 2.2, "rgba(255,255,255,.9)");
        p.ink(LN([[px0 + 12, py0 + 70], [px0 + 66, py0 + 10]]), 1.2, "rgba(255,255,255,.75)");
      }
    });
    const sh = L.shelf;
    for (const bx of [sh.x + 26, sh.x + sh.w - 34]) P.shape(PL([[bx, sh.y + 12], [bx + 8, sh.y + 12], [bx + 8, sh.y + 52], [bx, sh.y + 52]]), PAL.oakShade, LW_IN);
    P.alpha(0.2, (p) => p.fill("#4b5240", R(sh.x + 6, sh.y + 12, sh.w, 10)));
    P.shape(R(sh.x, sh.y, sh.w, 12), PAL.oak, LW);
    P.fill(PAL.oakTop, R(sh.x + 1, sh.y + 1, sh.w - 2, 3));
    const pb = L.pin, f = 11;
    P.alpha(0.2, (p) => p.fill("#4b5240", R(pb.x + 7, pb.y + 9, pb.w, pb.h)));
    P.shape(R(pb.x, pb.y, pb.w, pb.h), PAL.pinframe, LW_SIL);
    P.shape(R(pb.x + f, pb.y + f, pb.w - 2 * f, pb.h - 2 * f), PAL.cork, LW_IN);
    P.within(R(pb.x + f, pb.y + f, pb.w - 2 * f, pb.h - 2 * f), (p) => {
      p.fill(PAL.corkShade, R(pb.x + f, pb.y + f, pb.w - 2 * f, 7));
      p.fill(PAL.corkShade, R(pb.x + f, pb.y + f, 6, pb.h - 2 * f));
      const rnd = mulberry32(31);
      p.c.fillStyle = "rgba(122,84,44,.42)";
      for (let i = 0; i < 80; i++) {
        p.c.beginPath();
        p.c.arc(pb.x + f + rnd() * (pb.w - 2 * f), pb.y + f + rnd() * (pb.h - 2 * f), 0.9 + rnd() * 1.3, 0, TAU);
        p.c.fill();
      }
    });
    P.fill(PAL.pinframeShade, R(pb.x + 1, pb.y + pb.h - 5, pb.w - 2, 4));
    drawDesk(P, L);
    const [lbx, lby] = L.lamp.base;
    const cord = CURVE([[lbx + 30, lby - 2], [lbx + 70, lby - 14], [lbx + 40, d.backY + 4], [lbx + 6, d.backY + 2], [lbx - 30, d.backY + 10]]);
    P.ink(cord, 3.2);
    P.ink(cord, 1.3, "#4a4440");
    drawLamp(P, L);
  }
  function drawDesk(P, L) {
    const d = L.desk, X1 = L.xMax + 6;
    const top = [[d.leftBack, d.backY], [X1, d.backY], [X1, d.frontY], [d.leftFront, d.frontY]];
    const legX = d.leftFront + 14;
    P.shape(R(legX, d.frontY + d.faceH - 2, d.legW, L.base.y + L.base.h - d.frontY - d.faceH + 10), PAL.oakShade, LW);
    P.fill(PAL.oakDeep, R(legX + d.legW - 7, d.frontY + d.faceH, 7, L.base.y + L.base.h - d.frontY - d.faceH + 8));
    P.shape(R(d.leftBack + 6, d.backY + 20, d.legW * 0.8, L.base.y - d.backY - 10), PAL.oakDeep, LW_IN);
    P.shape(PL(top), PAL.oakTop, LW_SIL);
    P.within(PL(top), (p) => {
      p.fill(p.grad(0, d.backY, 0, d.frontY, [[0, "rgba(150,96,46,.32)"], [0.35, "rgba(150,96,46,.08)"], [1, "rgba(255,240,210,.12)"]]), PL(top));
      const rnd = mulberry32(5);
      for (let i = 0; i < 7; i++) {
        const y = d.backY + (d.frontY - d.backY) * (0.12 + i * 0.13) + (rnd() - 0.5) * 6;
        const pts = [];
        for (let x = d.leftFront - 20; x <= X1 + 20; x += 60) pts.push([x, y + Math.sin(x * 0.012 + i * 1.7) * 3 + (rnd() - 0.5) * 2]);
        p.ink(CURVE(pts), LW_FINE, "rgba(120,72,34,.4)");
      }
      for (const [kx, ky] of [[d.leftFront + 330, d.backY + (d.frontY - d.backY) * 0.55], [X1 - 140, d.backY + (d.frontY - d.backY) * 0.3]]) {
        p.ink(EL(kx, ky, 16, 3.4), LW_FINE, "rgba(120,72,34,.45)");
        p.ink(EL(kx, ky, 7, 1.6), LW_FINE, "rgba(120,72,34,.45)");
      }
    });
    P.shape(PL([[d.leftFront, d.frontY], [X1, d.frontY], [X1, d.frontY + d.faceH], [d.leftFront, d.frontY + d.faceH]]), PAL.oak, LW_SIL);
    P.fill(PAL.oakShade, R(d.leftFront + 1, d.frontY + d.faceH - 7, X1 - d.leftFront, 6));
    P.shape(PL([[d.leftBack, d.backY], [d.leftFront, d.frontY], [d.leftFront, d.frontY + d.faceH], [d.leftBack, d.backY + d.faceH * 0.7]]), PAL.oakShade, LW);
    const dx = d.leftFront + 120, dw = 230;
    P.ink(RR(dx, d.frontY + 6, dw, d.faceH - 12, 2), LW_IN);
    P.shape(RR(dx + dw / 2 - 16, d.frontY + d.faceH / 2 - 3, 32, 6, 3), "#7a5232", LW_IN);
  }
  function drawLamp(P, L) {
    const lp = L.lamp, [bx, by] = lp.base, [ex, ey] = lp.elbow, [hx, hy] = lp.head, [ax, ay] = lp.aim;
    P.alpha(0.25, (p) => p.fill("#2a1a10", EL(bx + 6, by + 8, 52, 12)));
    P.shape(PL([[bx - 46, by + 4], [bx + 46, by + 4], [bx + 40, by - 8], [bx - 40, by - 8]]), PAL.lamp, LW_SIL);
    P.shape(EL(bx, by - 8, 40, 8), "#d4664c", LW);
    P.shape(RR(bx - 9, by - 30, 18, 24, 4), PAL.lampShade, LW_IN);
    const arm = (x0, y0, x1, y1) => {
      const nx = -(y1 - y0), ny = x1 - x0, l = Math.hypot(nx, ny), ox = nx / l * 4, oy = ny / l * 4;
      P.ink(LN([[x0 - ox, y0 - oy], [x1 - ox, y1 - oy]]), 5.2, INK);
      P.ink(LN([[x0 - ox, y0 - oy], [x1 - ox, y1 - oy]]), 2.6, PAL.lamp);
      P.ink(LN([[x0 + ox, y0 + oy], [x1 + ox, y1 + oy]]), 3.6, INK);
      P.ink(LN([[x0 + ox, y0 + oy], [x1 + ox, y1 + oy]]), 1.4, PAL.lampShade);
    };
    arm(bx, by - 26, ex, ey);
    arm(ex, ey, hx, hy);
    const spring = (x0, y0, x1, y1, n) => {
      const pts = [];
      for (let i = 0; i <= n * 6; i++) {
        const t = i / (n * 6), a = t * n * TAU, nx = -(y1 - y0), ny = x1 - x0, l = Math.hypot(nx, ny);
        pts.push([lerp(x0, x1, t) + nx / l * Math.sin(a) * 4, lerp(y0, y1, t) + ny / l * Math.sin(a) * 4]);
      }
      P.ink(LN(pts), 0.9);
    };
    spring(lerp(bx, ex, 0.2) + 9, lerp(by - 26, ey, 0.2), lerp(bx, ex, 0.48) + 9, lerp(by - 26, ey, 0.48), 6);
    spring(lerp(ex, hx, 0.25), lerp(ey, hy, 0.25) + 9, lerp(ex, hx, 0.55), lerp(ey, hy, 0.55) + 9, 5);
    P.shape(EL(ex, ey, 8, 8), PAL.lampShade, LW_IN);
    const ang = Math.atan2(ay - hy, ax - hx);
    P.at(hx, hy, ang, 1, (p) => {
      p.shape(PL([[-6, -14], [16, -16], [64, -40], [72, 38], [16, 16], [-6, 14]]), PAL.lamp, LW_SIL);
      p.fill(PAL.lampShade, PL([[16, 6], [70, 24], [72, 38], [16, 16]]));
      p.ink(LN([[16, -16], [16, 16]]), LW_IN);
      p.shape(EL(69, -1, 7, 39), "#f6e9c8", LW);
      p.shape(EL(-4, 0, 9, 9), PAL.lampShade, LW_IN);
    });
  }
  var init_room = __esm({
    "js/room.js"() {
      init_core();
      init_ink();
    }
  });

  // js/views.js
  function setViewLight(l) {
    LIGHT = { day: l.day ?? 1, golden: l.golden || 0, night: l.night || 0, twilight: l.twilight || 0 };
  }
  function lcRGB(day, gold, night) {
    const g = clamp(LIGHT.golden + LIGHT.twilight * 0.6), n = clamp(LIGHT.night);
    return mix(mix(day, gold || day, g), night || day, n);
  }
  function lc(day, gold, night) {
    return css(lcRGB(day, gold, night));
  }
  function drawSky(P, H, sky, o = {}) {
    const top = lcRGB(o.top || "#8fc0dd", o.topGold || "#7f9fc4", "#141c38");
    const mid = lcRGB(o.mid || "#b4d8ea", o.midGold || "#e9b98c", "#24305a");
    const low = lcRGB(o.low || "#d9ecf0", o.lowGold || "#f6d39a", "#3a4370");
    P.fill(P.grad(0, 0, 0, H * (o.horizon || 0.6), [[0, css(top)], [0.55, css(mid)], [1, css(low)]]), R(-5, -5, 1010, H + 10));
    if (sky.stars > 0.02) drawStars(P, H * (o.horizon || 0.6), sky.stars, o.starSeed || 3);
    if (sky.moonUp) drawMoon(P, sky);
    if (sky.sunUp && o.sunVisible !== false) drawSun(P, sky);
  }
  function drawStars(P, H, amt, seed) {
    const rnd = mulberry32(seed), c = P.c;
    for (let i = 0; i < 90; i++) {
      const x = rnd() * 1e3, y = rnd() * H * 0.95, r = 0.9 + rnd() * 1.8, a = amt * (0.35 + rnd() * 0.65);
      c.fillStyle = `rgba(255,248,224,${a})`;
      if (r > 2.2) {
        c.save();
        c.translate(x, y);
        c.beginPath();
        for (let k = 0; k < 4; k++) {
          c.rotate(PI / 2);
          c.moveTo(0, 0);
          c.quadraticCurveTo(1, -1, 0, -r * 2.6);
          c.quadraticCurveTo(-1, -1, 0, 0);
        }
        c.fill();
        c.restore();
      } else {
        c.beginPath();
        c.arc(x, y, r, 0, TAU);
        c.fill();
      }
    }
  }
  function drawMoon(P, sky) {
    const x = sky.moonX, y = sky.moonY, r = 26, ph = sky.moon.phase;
    P.alpha(0.25 * Math.max(0.4, LIGHT.night), (p) => p.fill(p.rgrad(x, y, r, r * 3.4, [[0, "rgba(255,246,214,.6)"], [1, "rgba(255,246,214,0)"]]), EL(x, y, r * 3.4, r * 3.4)));
    const k = Math.cos(ph * TAU);
    P.within(EL(x, y, r, r), (p) => {
      p.fill("#f7efcf", EL(x, y, r, r));
      p.alpha(0.9, (q) => q.fill(css(lcRGB("#9fbfd6", "#8a94b4", "#1d2748")), (c) => c.ellipse(x + (ph < 0.5 ? -1 : 1) * r * (1 - Math.abs(k)), y, r * Math.max(0.05, Math.abs(k)), r, 0, 0, TAU)));
    });
    P.ink(EL(x, y, r, r), LW_IN, "rgba(40,34,30,.6)");
  }
  function drawSun(P, sky) {
    const x = sky.sunX, y = sky.sunY, r = 30;
    P.alpha(0.45, (p) => p.fill(p.rgrad(x, y, r * 0.8, r * 4, [[0, "rgba(255,236,170,.75)"], [1, "rgba(255,236,170,0)"]]), EL(x, y, r * 4, r * 4)));
    P.shape(EL(x, y, r, r), lc("#fff6d6", "#ffd98a", "#fff6d6"), LW_IN);
  }
  function cloud(P, cx, cy, w, h, seed, lw = LW_IN) {
    const pts = bumpRing(cx, cy, w / 2, h / 2, 11, seed, 0.18, true), shapeFn = SCALLOP(pts, 0.42);
    P.paint(lc(PAL.cloud, "#ffe7c8", "#4a5480"), shapeFn);
    P.within(shapeFn, (p) => p.fill(lc(PAL.cloudShade, "#efc7a4", "#363f69"), BLOB([[cx - w * 0.6, cy + h * 0.26], [cx - w * 0.1, cy + h * 0.18], [cx + w * 0.3, cy + h * 0.24], [cx + w * 0.6, cy + h * 0.2], [cx + w * 0.6, cy + h], [cx - w * 0.6, cy + h]])));
    P.ink(shapeFn, lw, inkL(0.95));
  }
  function crown(P, cx, cy, r, seed, col, shade, lw = LW_IN, n = 9) {
    const f = SCALLOP(bumpRing(cx, cy, r, r * 0.86, n, seed, 0.2), 0.38);
    P.paint(col, f);
    P.within(f, (p) => p.fill(shade, BLOB([[cx + r * 0.1, cy - r], [cx + r * 1.2, cy - r * 0.2], [cx + r * 1.1, cy + r], [cx - r * 0.6, cy + r * 1.1], [cx - r * 0.2, cy + r * 0.2]])));
    P.ink(f, lw, inkL());
  }
  function frond(P, x, y, ang, len, droop, leaf, col, shade, lw, seed) {
    const rnd = mulberry32(seed);
    const cx = x + Math.cos(ang) * len * 0.5, cy = y + Math.sin(ang) * len * 0.5 - len * 0.22;
    const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len + droop * len;
    const at = (t) => {
      const u = 1 - t;
      return [u * u * x + 2 * u * t * cx + t * t * ex, u * u * y + 2 * u * t * cy + t * t * ey];
    };
    const tan = (t) => {
      const u = 1 - t;
      const dx = 2 * u * (cx - x) + 2 * t * (ex - cx), dy = 2 * u * (cy - y) + 2 * t * (ey - cy), l = Math.hypot(dx, dy) || 1;
      return [dx / l, dy / l];
    };
    const n = 15, sides = { 1: [], [-1]: [] };
    for (let i = 1; i <= n; i++) {
      const t = 0.06 + 0.94 * i / n, tm = 0.06 + 0.94 * (i - 0.5) / n, [px0, py0] = at(t), [tx, ty] = tan(t), [qx, qy] = at(tm);
      const L = leaf * Math.pow(Math.sin(PI * Math.min(1, t * 1.02)), 0.55) * (1 - t * 0.25) * (0.86 + rnd() * 0.26);
      for (const side of [1, -1]) {
        const nx = -ty * side, ny = tx * side;
        let dx = nx * 0.7 + tx * 0.5, dy = ny * 0.7 + ty * 0.5 + 0.5;
        const dl = Math.hypot(dx, dy);
        dx /= dl;
        dy /= dl;
        const tip = [px0 + dx * L, py0 + dy * L + L * 0.22];
        const notch = [qx + dx * L * 0.18, qy + dy * L * 0.18];
        sides[side].push({ notch, tip, base: [px0, py0] });
      }
    }
    const outline = (c) => {
      c.moveTo(x, y);
      for (const l of sides[1]) {
        c.lineTo(l.notch[0], l.notch[1]);
        c.lineTo(l.tip[0], l.tip[1]);
      }
      c.lineTo(ex, ey);
      for (let i = sides[-1].length - 1; i >= 0; i--) {
        const l = sides[-1][i];
        c.lineTo(l.tip[0], l.tip[1]);
        c.lineTo(l.notch[0], l.notch[1]);
      }
      c.closePath();
    };
    const lower = Math.sin(ang) < -0.2 ? -1 : 1;
    P.paint(col, outline);
    P.within(outline, (p) => {
      p.fill(shade, (c) => {
        c.moveTo(x, y);
        for (const l of sides[lower]) {
          c.lineTo(l.notch[0], l.notch[1]);
          c.lineTo(l.tip[0], l.tip[1]);
        }
        c.lineTo(ex, ey);
        for (let i = n; i >= 0; i--) {
          const [ax, ay] = at(i / n);
          c.lineTo(ax, ay);
        }
        c.closePath();
      });
      if (lw > 0.8) for (const side of [1, -1]) for (const l of sides[side]) p.ink(LN([l.base, l.tip]), lw * 0.45, inkL(0.42));
    });
    P.ink(outline, lw * 0.8, inkL(lw > 0.8 ? 0.95 : 0.55));
    P.ink(CURVE([[x, y], at(0.25), at(0.5), at(0.75), [ex, ey]]), lw * 1.05, inkL());
  }
  function coconutPalm(P, x, baseY, topY, s = 1, o = {}) {
    const bend = (o.bend || 0) * s, tx = x + bend, trunkW = (o.trunk || 9) * s;
    const tr = (c) => {
      c.moveTo(x - trunkW, baseY);
      c.quadraticCurveTo(x - trunkW * 0.75 + bend * 0.25, (baseY + topY) / 2, tx - trunkW * 0.55, topY);
      c.lineTo(tx + trunkW * 0.55, topY);
      c.quadraticCurveTo(x + trunkW * 0.75 + bend * 0.25, (baseY + topY) / 2, x + trunkW, baseY);
      c.closePath();
    };
    const trunkC = o.trunkCol || lc("#9b7b58", "#a87a50", "#1c2139"), trunkS = o.trunkShade || lc("#7d6045", "#875f3c", "#141830");
    P.paint(trunkC, tr);
    P.within(tr, (p) => {
      p.fill(trunkS, (c) => {
        c.moveTo(x + trunkW * 0.25, baseY);
        c.quadraticCurveTo(x + trunkW * 0.5 + bend * 0.25, (baseY + topY) / 2, tx + trunkW * 0.2, topY);
        c.lineTo(tx + 60, topY);
        c.lineTo(x + 60, baseY);
        c.closePath();
      });
      for (let y = baseY - 10 * s; y > topY + 8; y -= (o.ring || 11) * s) {
        const t = (baseY - y) / (baseY - topY), xc = x + bend * t * t;
        p.ink(LN([[xc - trunkW * 1.1, y + 2.5 * s], [xc + trunkW * 1.1, y - 0.5 * s]]), LW_FINE * 0.9, o.ringCol || lc("rgba(70,50,32,.8)", "rgba(70,50,32,.8)", "rgba(10,12,28,.9)"));
      }
    });
    P.ink(tr, o.lw || LW_IN, inkL());
    const col = o.leaf || lc("#6f9a4c", "#7e9142", "#1a2440"), shade = o.leafShade || lc("#4f7638", "#5c6a33", "#111930");
    const L = (o.len || 120) * s, leaf = (o.leafLen || 34) * s, lw = o.lw || LW_IN;
    const angs = o.fronds || [-2.95, -2.55, -2.15, -1.75, -1.35, -0.95, -0.55, -0.18, 0.2, 2.75, 0.55];
    angs.forEach((a, i) => {
      const droop = 0.26 + Math.abs(Math.cos(a)) * 0.22 + (Math.sin(a) > 0 ? 0.25 : 0);
      frond(P, tx, topY, a, L * (0.86 + i % 3 * 0.07), droop, leaf, col, shade, lw, 40 + i * 7);
    });
    if (o.nuts) for (const [dx, dy] of [[-9, 7], [6, 9], [-2, 14], [11, 3]]) P.shape(EL(tx + dx * s, topY + dy * s, 6 * s, 6.6 * s), lc("#8b9a3a", "#8b8a36", "#1a2036"), LW_FINE);
    P.shape(EL(tx, topY, 9 * s, 7 * s), trunkC, LW_FINE);
  }
  function cypress(P, x, baseY, h, w, seed) {
    const pts = [], n = 16, rnd = mulberry32(seed);
    for (let i = 0; i <= n; i++) {
      const t = i / n, ww = w * Math.sin(Math.min(1, t * 1.15) * PI) * (1 - t * 0.25);
      pts.push([x + ww * 0.5 + (rnd() - 0.5) * 3, baseY - h * t]);
    }
    for (let i = n; i >= 0; i--) {
      const t = i / n, ww = w * Math.sin(Math.min(1, t * 1.15) * PI) * (1 - t * 0.25);
      pts.push([x - ww * 0.5 + (rnd() - 0.5) * 3, baseY - h * t]);
    }
    P.paint(lc("#4f6b3e", "#596334", "#11182c"), BLOB(pts, 0.4));
    P.within(BLOB(pts, 0.4), (p) => {
      p.fill(lc("#3f5732", "#48502a", "#0d1324"), R(x + w * 0.08, baseY - h, w, h));
      for (let k = 0; k < 7; k++) {
        const yy = baseY - h * (0.15 + k * 0.11);
        p.ink(CURVE([[x - w * 0.3, yy], [x, yy - 6], [x + w * 0.3, yy - 2]]), LW_FINE * 0.8, lc("rgba(30,46,24,.6)", "rgba(30,46,24,.6)", "rgba(5,8,18,.6)"));
      }
    });
    P.ink(BLOB(pts, 0.4), LW_IN, inkL());
  }
  function tileHouse(P, x, baseY, w, h, roofH, o = {}) {
    const wallC = o.wall || lc("#f1ebdc", "#f6d4b0", "#2d3150"), wallS = o.wallS || lc("#d9d0bd", "#e2b590", "#22263f");
    const roofC = o.roof || lc("#c8693f", "#d8743c", "#3b2a3e"), roofS = lc("#a9532f", "#b65a2d", "#2a1d2c");
    P.shape(R(x, baseY - h, w, h), wallC, LW_IN);
    P.fill(wallS, R(x + w * 0.72, baseY - h, w * 0.28, h));
    const nw = Math.max(1, Math.floor(w / 46));
    for (let i = 0; i < nw; i++) {
      const wx = x + (i + 0.5) * w / nw - 9, wy = baseY - h * 0.72;
      P.shape(R(wx, wy, 18, h * 0.38), LIGHT.night > 0.3 ? "#f6cf7a" : lc("#3c4a58", "#4a4250", "#f0c66e"), LW_FINE);
      P.ink(LN([[wx + 9, wy], [wx + 9, wy + h * 0.38]]), 0.6, inkL(0.6));
    }
    if (o.door) P.shape(R(x + w * 0.12, baseY - h * 0.62, 22, h * 0.62), lc("#7a5a3e", "#8a5a36", "#1c1a2c"), LW_FINE);
    const ov = 8, rf = PL([[x - ov, baseY - h], [x + w + ov, baseY - h], [x + w - w * 0.16, baseY - h - roofH], [x + w * 0.16, baseY - h - roofH]]);
    P.shape(rf, roofC, LW_IN);
    P.within(rf, (p) => {
      p.fill(roofS, PL([[x + w * 0.55, baseY - h], [x + w + ov, baseY - h], [x + w - w * 0.16, baseY - h - roofH], [x + w * 0.45, baseY - h - roofH]]));
      for (let k = 1; k < 4; k++) {
        const yy = baseY - h - roofH * k / 4;
        p.ink(LN([[x - ov, yy], [x + w + ov, yy]]), 0.6, lc("#7f3a1e", "#7f3a1e", "#140c18"));
      }
    });
    P.alpha(0.22, (p) => p.fill(lc("#3a2a1a", "#3a2a1a", "#000"), R(x, baseY - h, w, 6)));
  }
  function viewSanJose(P, H, sky) {
    const haze = (col, k) => css(mix(lcRGB(...col), lcRGB("#c9dde6", "#f2c8a0", "#28315c"), k));
    drawSky(P, H, sky, { horizon: 0.5, top: "#6eaedd", mid: "#9dcbea", low: "#d8ecf1", topGold: "#7f9dcb", midGold: "#c6b3c9", lowGold: "#f2c3b4" });
    if (sky.night < 0.75) {
      cloud(P, 180, H * 0.09, 280, 80, 11, LW_IN);
      cloud(P, 860, H * 0.05, 190, 52, 12, LW_FINE);
    }
    const y0 = H * 0.52;
    const range = [[-5, y0 - 70], [80, y0 - 96], [170, y0 - 86], [260, y0 - 130], [340, y0 - 150], [420, y0 - 196], [500, y0 - 240], [560, y0 - 288], [610, y0 - 318], [660, y0 - 322], [700, y0 - 306], [760, y0 - 262], [840, y0 - 236], [920, y0 - 250], [1005, y0 - 214], [1005, y0 + 60], [-5, y0 + 60]];
    P.fill(haze(["#d5b47e", "#e8a46f", "#252c52"], 0.22), PL(range));
    P.within(PL(range), (p) => {
      p.fill(haze(["#c09c6c", "#cc895c", "#1f264a"], 0.22), PL([[610, y0 - 318], [660, y0 - 322], [700, y0 - 306], [760, y0 - 262], [840, y0 - 236], [920, y0 - 250], [1005, y0 - 214], [1005, y0 + 60], [640, y0 + 60]]));
      const rnd = mulberry32(17);
      for (const [fx, k] of [[180, 0.45], [300, 0.6], [420, 0.72], [510, 0.86], [590, 0.96], [720, 0.9], [830, 0.78], [950, 0.72]]) {
        const top = y0 - 300 * k + 50;
        p.alpha(0.16, (q) => q.fill(haze(["#8a7a50", "#8a6440", "#141a36"], 0.2), BLOB([[fx - 40, y0 + 40], [fx - 10, top + 40], [fx + 14, top + 30], [fx + 48, y0 + 40]])));
        for (let j = 0; j < 9; j++) {
          const t = Math.pow(rnd(), 0.7), x = fx + (rnd() - 0.5) * 70 * (0.4 + t) + t * 16, y = lerp(top + 10, y0 + 20, t);
          p.fill(haze(["#8c8a56", "#977a50", "#181e3e"], 0.22), EL(x, y, 5 + rnd() * 6, 3.5 + rnd() * 3.5));
        }
      }
    });
    P.ink(LN(range.slice(0, -2)), LW_FAR, inkL(0.9));
    const domeC = lc("#f8f6ef", "#ffdfba", "#8e98bd"), domeS = lc("#d3d3ca", "#e9b38b", "#5a638c");
    const dome = (x, y, r) => {
      P.shape(R(x - r * 1.04, y - r * 0.34, r * 2.08, r * 0.7), domeS, LW_FAR);
      const top = (c) => {
        c.moveTo(x - r, y - r * 0.34);
        c.arc(x, y - r * 0.34, r, PI, 0);
        c.closePath();
      };
      P.fill(domeC, top);
      P.within(top, (p) => p.fill(domeS, EL(x + r * 0.95, y - r * 0.55, r * 0.78, r * 1.25)));
      P.ink(top, LW_FAR, inkL());
      P.ink(LN([[x - r * 0.2, y - r * 1.32], [x - r * 0.2, y - r * 0.36]]), 0.6, inkL());
    };
    const sx = 646, sy = y0 - 322;
    P.shape(R(sx - 44, sy - 2, 88, 16), domeS, LW_FAR);
    P.fill(domeC, R(sx - 43, sy - 1, 60, 6));
    dome(sx - 40, sy, 18);
    dome(sx + 40, sy, 13);
    dome(560, y0 - 284, 22);
    const y1 = H * 0.64;
    const hills = [[-5, y1 - 96], [80, y1 - 120], [190, y1 - 100], [290, y1 - 132], [380, y1 - 110], [470, y1 - 140], [580, y1 - 116], [690, y1 - 136], [800, y1 - 112], [900, y1 - 130], [1005, y1 - 108], [1005, y1 + 40], [-5, y1 + 40]];
    P.fill(lc("#dcb46c", "#eaa15c", "#232a4c"), PL(hills));
    P.within(PL(hills), (p) => {
      const rnd = mulberry32(31);
      for (let i = 0; i < 8; i++) {
        const x = 40 + i * 130 + rnd() * 40;
        p.fill(lc("#c99d58", "#d48a50", "#1d2342"), BLOB([[x - 40, y1 + 30], [x - 4, y1 - 120 + rnd() * 20], [x + 46, y1 + 30]]));
      }
    });
    P.ink(LN(hills.slice(0, -2)), LW_FINE, inkL());
    const r2 = mulberry32(21);
    for (let i = 0; i < 26; i++) {
      const x = r2() * 1e3, yy = y1 - 104 + r2() * 70, r = 8 + r2() * 8;
      crown(P, x, yy, r, 100 + i, lc("#6d7e44", "#787240", "#1b2140"), lc("#56653a", "#5e5832", "#141a32"), LW_FAR, 7);
    }
    const vy = H * 0.66;
    P.fill(lc("#c4cbaa", "#d9b78f", "#1d2344"), R(-5, y1 - 30, 1010, vy - y1 + 60));
    const towers = [[70, 92, 30], [106, 124, 34], [146, 104, 26], [178, 74, 28], [212, 58, 24]];
    for (const [x, h, w] of towers) {
      P.shape(R(x, vy - h, w, h), haze(["#e9e7de", "#f3d1ac", "#2f3762"], 0.2), LW_FAR);
      P.fill(haze(["#c5cac4", "#dcab86", "#262d54"], 0.2), R(x + w * 0.62, vy - h, w * 0.38, h));
      for (let wy = vy - h + 7; wy < vy - 4; wy += 8) P.ink(LN([[x + 4, wy], [x + w * 0.54, wy]]), 0.5, lc("rgba(60,60,60,.35)", "rgba(60,60,60,.35)", "rgba(255,220,150,0)"));
    }
    const rr = mulberry32(5);
    for (let x = 250; x < 1010; ) {
      const w = 24 + rr() * 30, h = 10 + rr() * 8;
      P.shape(R(x, vy - h, w, h), lc(["#ebe4d4", "#d79267", "#f3eee3"][Math.floor(rr() * 3)], "#efc6a2", "#2a3157"), LW_FAR);
      if (rr() < 0.4) crown(P, x + w + 7, vy - 6, 9, 600 + (x | 0), lc("#7f9455", "#8a8448", "#1c223c"), lc("#667a44", "#6e683a", "#151a30"), LW_FAR, 6);
      x += w + 6 + rr() * 10;
    }
    const gy = H * 0.74;
    P.fill(lc("#8fae6a", "#a4a35c", "#18213a"), R(-5, gy - 20, 1010, H - gy + 30));
    crown(P, 60, gy - 6, 62, 70, lc("#6c8a4c", "#7a8644", "#18203a"), lc("#56723c", "#626a36", "#121830"), LW_IN, 10);
    tileHouse(P, 90, gy + 54, 210, 74, 42, { door: true });
    crown(P, 340, gy + 6, 50, 71, lc("#78964f", "#869246", "#18203a"), lc("#5f7a40", "#6b6e38", "#121830"), LW_IN, 10);
    cypress(P, 420, gy + 90, 250, 46, 9);
    cypress(P, 466, gy + 90, 210, 40, 10);
    tileHouse(P, 520, gy + 70, 260, 84, 46, { wall: lc("#f4e6cf", "#f8d0a8", "#2f3252") });
    crown(P, 900, gy + 30, 110, 55, lc("#6c8a4c", "#7a8644", "#18203a"), lc("#56723c", "#626a36", "#121830"), LW, 12);
    coconutPalm(P, 790, H + 30, H * 0.3, 1.3, { bend: 22, trunk: 11, len: 128, leafLen: 34, leaf: lc("#7a9d4e", "#86924a", "#1a2440"), fronds: [-2.95, -2.6, -2.2, -1.8, -1.4, -1, -0.6, -0.2, 0.25, 0.6] });
    P.shape(R(-5, H * 0.93, 1010, H * 0.1), lc("#e9e1cf", "#f2cba5", "#2b2e4c"), LW_IN);
    P.fill(lc("#d2c8b2", "#ddb08a", "#22253f"), R(-5, H * 0.93, 1010, 8));
    if (sky.night > 0.05) {
      const r3 = mulberry32(8), c = P.c;
      for (let i = 0; i < 240; i++) {
        const x = r3() * 1e3, y = y1 - 20 + r3() * (vy - y1 + 14), a = sky.night * (0.35 + r3() * 0.65);
        c.fillStyle = `rgba(255,${200 + (r3() * 40 | 0)},120,${a})`;
        c.fillRect(x, y, 2.6, 2.6);
      }
      for (const [x, h, w] of towers) for (let wy = vy - h + 6; wy < vy - 4; wy += 8) if (r3() < 0.6) {
        c.fillStyle = `rgba(255,224,150,${sky.night * 0.85})`;
        c.fillRect(x + 4, wy, w * 0.45, 2.6);
      }
      c.fillStyle = `rgba(255,236,190,${sky.night * 0.9})`;
      c.fillRect(sx - 34, sy + 4, 3, 3);
      c.fillRect(sx + 18, sy + 4, 3, 3);
    }
  }
  function eucalyptus(P, x, baseY, h, s = 1, seed = 1, lean = 0) {
    const rnd = mulberry32(seed);
    const bark = lc("#e4dccb", "#efd2b2", "#2a2f4e"), barkS = lc("#b9b09c", "#cfa684", "#1e2340"), peel = lc("#c9a88c", "#d99e7c", "#252a48");
    const leaf = lc("#86a08b", "#93a07c", "#1a2340"), leafLight = lc("#a3b9a4", "#b4b88c", "#243058"), leafS = lc("#617d6c", "#6f8060", "#121a30"), leafBack = lc("#6f8b78", "#7c8a66", "#141c34");
    const limbs = [];
    const grow = (x0, y0, ang, len, w0, depth) => {
      const x1 = x0 + Math.cos(ang) * len, y1 = y0 + Math.sin(ang) * len;
      limbs.push({ x0, y0, x1, y1, cx: (x0 + x1) / 2 + (rnd() - 0.5) * len * 0.18, cy: (y0 + y1) / 2, w0, w1: w0 * 0.66, depth });
      if (depth < 2) {
        const n = depth === 0 ? 3 : 2;
        for (let k = 0; k < n; k++) {
          const spread = (k - (n - 1) / 2) * (depth === 0 ? 0.42 : 0.5) + (rnd() - 0.5) * 0.16;
          grow(x1, y1, ang + spread, len * (0.56 + rnd() * 0.16), w0 * (0.6 - k * 0.04), depth + 1);
        }
      }
    };
    grow(x, baseY, -PI / 2 + lean / h, h * 0.42, 15 * s, 0);
    const masses = [];
    for (const l of limbs) {
      if (l.depth === 0) continue;
      const steps = l.depth === 1 ? 3 : 3;
      for (let k = 0; k < steps; k++) {
        const t = (l.depth === 1 ? 0.3 : 0.2) + 0.78 * (k + rnd() * 0.5) / steps, px0 = lerp(l.x0, l.x1, t), py0 = lerp(l.y0, l.y1, t);
        masses.push({ x: px0 + (rnd() - 0.5) * 46 * s, y: py0 + (rnd() - 0.3) * 18 * s, w: (58 + rnd() * 50) * s, hh: (34 + rnd() * 24) * s, back: rnd() < 0.45 });
      }
    }
    const mass = (m, col, shade, light) => {
      const top = [], k = 5;
      for (let i = 0; i <= k; i++) {
        const t = i / k;
        top.push([m.x - m.w / 2 + m.w * t, m.y - Math.sin(PI * t) * m.hh * (0.42 + rnd() * 0.18)]);
      }
      const drips = [], d = Math.round(m.w / (6.5 * s)) + 4;
      for (let i = 0; i <= d; i++) {
        const t = 1 - i / d, edge = 1 - Math.pow(Math.abs(t - 0.5) * 2, 2) * 0.65, len = m.hh * (0.55 + rnd() * 0.5) * edge;
        drips.push([m.x - m.w / 2 + m.w * t, m.y + len], [m.x - m.w / 2 + m.w * (t - 0.5 / d), m.y + len * (0.45 + rnd() * 0.2)]);
      }
      const fn = (c) => {
        c.moveTo(top[0][0], top[0][1]);
        for (let i = 1; i < top.length; i++) {
          const a = top[i - 1], b = top[i];
          c.quadraticCurveTo((a[0] + b[0]) / 2 + (rnd() - 0.5) * 6, Math.min(a[1], b[1]) - 5 * s, b[0], b[1]);
        }
        for (const [dx, dy] of drips) c.lineTo(dx, dy);
        c.closePath();
      };
      P.paint(col, fn);
      P.within(fn, (p) => {
        p.fill(shade, R(m.x - m.w, m.y + m.hh * 0.05, m.w * 2, m.hh * 2));
        if (light) p.fill(light, BLOB([[m.x - m.w * 0.38, m.y - m.hh * 0.32], [m.x - m.w * 0.05, m.y - m.hh * 0.5], [m.x + m.w * 0.2, m.y - m.hh * 0.28], [m.x - m.w * 0.1, m.y - m.hh * 0.12]]));
        for (let i = 0; i < 6; i++) {
          const lx = m.x - m.w * 0.4 + rnd() * m.w * 0.8, ly = m.y - m.hh * 0.2 + rnd() * m.hh * 0.5;
          p.ink(LN([[lx, ly], [lx + (rnd() - 0.5) * 3, ly + 8 * s]]), 0.5, inkL(0.35));
        }
      });
      P.ink(fn, LW_FINE * 0.9, inkL(0.85));
    };
    for (const m of masses) if (m.back) mass(m, leafBack, leafS, null);
    for (const l of limbs) {
      const nx = -(l.y1 - l.y0), ny = l.x1 - l.x0, ln = Math.hypot(nx, ny) || 1, ux = nx / ln, uy = ny / ln;
      const fn = (c) => {
        c.moveTo(l.x0 - ux * l.w0, l.y0 - uy * l.w0);
        c.quadraticCurveTo(l.cx - ux * (l.w0 + l.w1) / 2, l.cy - uy * (l.w0 + l.w1) / 2, l.x1 - ux * l.w1, l.y1 - uy * l.w1);
        c.lineTo(l.x1 + ux * l.w1, l.y1 + uy * l.w1);
        c.quadraticCurveTo(l.cx + ux * (l.w0 + l.w1) / 2, l.cy + uy * (l.w0 + l.w1) / 2, l.x0 + ux * l.w0, l.y0 + uy * l.w0);
        c.closePath();
      };
      P.paint(bark, fn);
      P.within(fn, (p) => {
        p.fill(barkS, (c) => {
          c.moveTo(l.x0 + ux * l.w0 * 0.15, l.y0 + uy * l.w0 * 0.15);
          c.lineTo(l.x1 + ux * l.w1 * 0.15, l.y1 + uy * l.w1 * 0.15);
          c.lineTo(l.x1 + ux * l.w1 * 2, l.y1 + uy * l.w1 * 2);
          c.lineTo(l.x0 + ux * l.w0 * 2, l.y0 + uy * l.w0 * 2);
          c.closePath();
        });
        for (let k = 0; k < (l.depth ? 2 : 5); k++) {
          const t = 0.1 + rnd() * 0.8, px0 = lerp(l.x0, l.x1, t) + (rnd() - 0.5) * l.w0 * 0.8, py0 = lerp(l.y0, l.y1, t);
          p.fill(peel, BLOB([[px0 - 3 * s, py0 - 10 * s], [px0 + 4 * s, py0 - 5 * s], [px0 + 3 * s, py0 + 12 * s], [px0 - 4 * s, py0 + 7 * s]]));
        }
      });
      P.ink(fn, l.depth ? LW_FINE : LW_IN, inkL());
    }
    for (const m of masses) if (!m.back) mass(m, leaf, leafS, leafLight);
  }
  function geisel(P, gx, gy, s, H) {
    const conc = lc("#e3ddd0", "#f2cfa8", "#3a4068"), concS = lc("#bfb7a7", "#d9a983", "#2a3058"), concD = lc("#a39b8b", "#c4936c", "#22284c");
    const glass = lc("#47667c", "#6e6672", "#1a2242"), glassL = lc("#8fb3c9", "#c99a86", "#28335c"), glassD = lc("#2f4859", "#4f4554", "#121a34");
    const lwB = LW_FINE * 1.05;
    const X = (v) => gx + v * s, Y = (v) => gy - v * s;
    P.alpha(0.28, (p) => p.fill(lc("#2c2a20", "#3a2a1a", "#000"), EL(gx, gy + 2, 300 * s, 10 * s)));
    const floor = (cx, y0, w, h, zig, k = 0) => {
      const left = cx - w / 2, rnd = mulberry32(900 + k);
      P.shape(R(X(left), Y(y0 + h), w * s, h * s), glass, lwB);
      P.within(R(X(left), Y(y0 + h), w * s, h * s), (p) => {
        p.fill(glassD, R(X(left), Y(y0 + h * 0.35), w * s, h * 0.35 * s));
        for (let i = 0; i < 5; i++) {
          const a = left + w * (0.08 + i * 0.21) + rnd() * 10;
          p.alpha(0.55, (q) => q.fill(glassL, PL([[X(a), Y(y0 + h)], [X(a + 16), Y(y0 + h)], [X(a + 6), Y(y0)], [X(a - 10), Y(y0)]])));
        }
        for (let m = left + 10; m < left + w; m += 12) p.ink(LN([[X(m), Y(y0 + h - 2)], [X(m), Y(y0 + 2)]]), 0.45, lc("rgba(20,30,40,.55)", "rgba(20,30,40,.55)", "rgba(255,220,150,.35)"));
      });
      const e = 7, top = y0 + h;
      const edge = zig ? [[left - 6, top], [cx - w * 0.3, top], [cx - w * 0.2, top - 5], [cx - w * 0.1, top + 2], [cx, top - 5], [cx + w * 0.1, top + 2], [cx + w * 0.2, top - 5], [cx + w * 0.3, top], [left + w + 6, top]] : [[left - 6, top], [left + w + 6, top]];
      const band = (c) => {
        c.moveTo(X(edge[0][0]), Y(edge[0][1]));
        for (const [ex, ey] of edge) c.lineTo(X(ex), Y(ey));
        for (let i = edge.length - 1; i >= 0; i--) c.lineTo(X(edge[i][0]), Y(edge[i][1] + e));
        c.closePath();
      };
      P.shape(band, conc, lwB);
    };
    const branchY = 70, wideY = 196;
    const piers = [[-150, -330, 20], [-92, -250, 19], [-36, -160, 18], [36, 160, 18], [92, 250, 19], [150, 330, 20]];
    P.shape(R(X(-118), Y(branchY + 6), 236 * s, 20 * s), concS, lwB);
    floor(0, branchY + 26, 250, 34, true, 1);
    floor(0, branchY + 72, 380, 34, true, 2);
    P.fill(concD, R(X(-192), Y(branchY + 112), 384 * s, 8 * s));
    for (const [bx, tx, w] of piers) {
      const outer = Math.sign(bx), sh = bx > 0 ? concS : conc;
      P.shape(R(X(bx - w / 2), Y(branchY + 10), w * s, (branchY + 10) * s), sh, lwB);
      const strut = PL([[X(bx - w / 2), Y(branchY)], [X(bx + w / 2), Y(branchY)], [X(tx + outer * 10), Y(wideY - 4)], [X(tx - outer * 14), Y(wideY - 4)]]);
      P.shape(strut, sh, lwB);
      P.within(strut, (p) => p.fill(concD, PL([[X(bx + outer * w * 0.2), Y(branchY)], [X(bx + outer * w / 2), Y(branchY)], [X(tx + outer * 10), Y(wideY - 4)], [X(tx + outer * 2), Y(wideY - 4)]])));
      P.ink((c) => {
        c.moveTo(X(bx - outer * w / 2), Y(branchY - 14));
        c.quadraticCurveTo(X(bx - outer * w / 2), Y(branchY + 2), X(bx - outer * w / 2 + outer * 8), Y(branchY + 10));
      }, LW_FINE * 0.8, inkL(0.7));
    }
    const ww = 720;
    const under = (c) => {
      c.moveTo(X(-ww / 2 - 8), Y(wideY));
      for (let i = 0; i <= 12; i++) {
        const t = i / 12, xx = -ww / 2 + ww * t;
        c.lineTo(X(xx), Y(wideY - (i % 2 ? 9 : 2)));
      }
      c.lineTo(X(ww / 2 + 8), Y(wideY));
      c.lineTo(X(ww / 2 + 8), Y(wideY + 12));
      c.lineTo(X(-ww / 2 - 8), Y(wideY + 12));
      c.closePath();
    };
    P.shape(under, concS, lwB);
    floor(0, wideY + 12, ww, 40, false, 3);
    floor(0, wideY + 52 + 7, 600, 36, true, 4);
    floor(0, wideY + 102, 470, 34, true, 5);
    floor(0, wideY + 143, 330, 30, true, 6);
    P.shape(R(X(-150), Y(wideY + 188), 300 * s, 9 * s), conc, lwB);
  }
  function viewSanDiego(P, H, sky) {
    drawSky(P, H, sky, { horizon: 0.62, top: "#5fa6dc", mid: "#94c8ea", low: "#d6ecf2" });
    cloud(P, 210, H * 0.1, 160, 42, 21, LW_FINE);
    cloud(P, 840, H * 0.17, 110, 30, 22, LW_FINE);
    P.fill(lc("#7fb2cf", "#e7b98d", "#24305a"), R(-5, H * 0.6, 330, 20));
    P.ink(LN([[-5, H * 0.6], [325, H * 0.6]]), LW_FAR, inkL());
    for (let i = 0; i < 6; i++) P.ink(LN([[20 + i * 52, H * 0.61 + i % 2 * 6], [44 + i * 52, H * 0.61 + i % 2 * 6]]), 1, "rgba(255,255,255,.8)");
    P.fill(lc("#a9b98c", "#c9a87a", "#1e2444"), PL([[-5, H * 0.62], [180, H * 0.6], [330, H * 0.61], [520, H * 0.58], [760, H * 0.6], [1005, H * 0.58], [1005, H], [-5, H]]));
    const rf = mulberry32(44);
    for (let i = 0; i < 14; i++) {
      const x = rf() * 1e3, r = 14 + rf() * 16;
      crown(P, x, H * 0.6 - r * 0.3, r, 200 + i, lc("#93ab95", "#9aa47e", "#1a2240"), lc("#7a9483", "#828c68", "#141c34"), LW_FAR, 8);
    }
    geisel(P, 500, H * 0.87, 0.9, H);
    P.fill(lc("#8fbf63", "#a7b65a", "#18233c"), PL([[-5, H * 0.87], [1005, H * 0.855], [1005, H + 5], [-5, H + 5]]));
    P.ink(LN([[-5, H * 0.87], [1005, H * 0.855]]), LW_FINE, inkL());
    P.shape(PL([[440, H + 5], [478, H * 0.865], [522, H * 0.865], [580, H + 5]]), lc("#ece4cf", "#f3cfa6", "#2c3050"), LW_FINE);
    eucalyptus(P, 70, H * 1.02, H * 0.86, 1.15, 3, 60);
    eucalyptus(P, 948, H * 1.04, H * 0.9, 1.25, 7, -70);
    for (const [x, r] of [[220, 30], [760, 34]]) crown(P, x, H * 0.93, r, 300 + x, lc("#6f9a50", "#7f9246", "#18203a"), lc("#57803e", "#667538", "#121830"), LW_FINE, 9);
  }
  function roofBlock(P, x, baseY, w, h, wall, wallS, o = {}) {
    const lw = o.lw || LW_IN;
    P.shape(R(x, baseY - h, w, h + 10), wall, lw);
    P.fill(wallS, R(x + w * 0.74, baseY - h, w * 0.26, h + 10));
    P.shape(R(x - 3, baseY - h - 8, w + 6, 9), lc("#efe9da", "#f6d2a8", "#30344f"), LW_FINE);
    const cols = Math.max(1, Math.floor(w / 38)), rows = Math.max(1, Math.floor(h / 46));
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
      const wx = x + (k + 0.5) * w / cols - 8, wy = baseY - h + 14 + r * 46;
      P.shape(R(wx, wy, 16, 22), lc("#3e4d5c", "#4c4858", "#f1c66c"), LW_FINE);
      P.fill(wallS, R(wx - 3, wy - 4, 22, 4));
      if (o.grille) for (let g = 1; g < 3; g++) P.ink(LN([[wx + g * 5.3, wy], [wx + g * 5.3, wy + 22]]), 0.5, inkL(0.6));
    }
    if (o.tank != null) {
      const tx = x + w * o.tank, ty = baseY - h - 8;
      P.shape(R(tx - 3, ty - 6, 30, 6), lc("#8a8a86", "#9a8a7a", "#1d2034"), LW_FINE);
      P.shape((c) => {
        c.moveTo(tx, ty - 6);
        c.lineTo(tx, ty - 34);
        c.quadraticCurveTo(tx + 12, ty - 42, tx + 24, ty - 34);
        c.lineTo(tx + 24, ty - 6);
        c.closePath();
      }, lc("#2f3337", "#3a3436", "#0f1222"), LW_FINE);
      for (let k = 0; k < 3; k++) P.ink(LN([[tx, ty - 14 - k * 7], [tx + 24, ty - 14 - k * 7]]), 0.7, "rgba(255,255,255,.25)");
    }
    if (o.clothes) {
      const cy = baseY - h - 30;
      P.ink(LN([[x + 8, cy], [x + w - 10, cy - 4]]), 0.6, inkL(0.8));
      const cols2 = ["#d2453a", "#2f6fb0", "#f2c94c", "#f1efe6"];
      for (let k = 0; k < 4; k++) {
        const cx0 = x + 18 + k * (w - 36) / 4;
        P.shape(R(cx0, cy - k * 0.9 + 1, 12, 16), cols2[k], 0.5);
      }
    }
  }
  function gopuram(P, x, baseY, w, h) {
    const tiers = 6, c1 = lc("#d8cdb5", "#e8c49c", "#2c3152"), c2 = lc("#c3b79c", "#d6ad84", "#232846");
    for (let i = 0; i < tiers; i++) {
      const t0 = i / tiers, t1 = (i + 1) / tiers, w0 = w * (1 - t0 * 0.55), w1 = w * (1 - t1 * 0.55), y0 = baseY - h * 0.8 * t0, y1 = baseY - h * 0.8 * t1;
      P.shape(PL([[x - w0 / 2, y0], [x + w0 / 2, y0], [x + w1 / 2, y1], [x - w1 / 2, y1]]), i % 2 ? c2 : c1, LW_FAR);
    }
    const wt = w * 0.45, yt = baseY - h * 0.8;
    P.shape((c) => {
      c.moveTo(x - wt / 2, yt);
      c.quadraticCurveTo(x - wt / 2, yt - h * 0.16, x, yt - h * 0.17);
      c.quadraticCurveTo(x + wt / 2, yt - h * 0.16, x + wt / 2, yt);
      c.closePath();
    }, c1, LW_FAR);
    P.shape(EL(x, yt - h * 0.2, 2.2, 3.4), lc("#d8a83a", "#e8a83a", "#3a3040"), 0.5);
  }
  function crane(P, x, baseY, h, jib) {
    const col = lc("#e3b33c", "#eaa23a", "#3a3446");
    P.ink(LN([[x - 4, baseY], [x - 4, baseY - h]]), 2.4, col);
    P.ink(LN([[x + 4, baseY], [x + 4, baseY - h]]), 2.4, col);
    for (let y = baseY; y > baseY - h; y -= 10) P.ink(LN([[x - 4, y], [x + 4, y - 10]]), 0.6, col);
    P.ink(LN([[x - jib * 0.3, baseY - h], [x + jib, baseY - h]]), 2.2, col);
    P.ink(LN([[x, baseY - h - 16], [x + jib * 0.8, baseY - h], [x, baseY - h - 16], [x - jib * 0.3, baseY - h]]), 0.6, col);
    P.ink(LN([[x + jib * 0.6, baseY - h], [x + jib * 0.6, baseY - h + 30]]), 0.5, inkL(0.7));
  }
  function viewBengaluru(P, H, sky) {
    drawSky(P, H, sky, { horizon: 0.56, top: "#4f78ad", mid: "#93b6d8", low: "#f3c78e", topGold: "#4a72a8", midGold: "#98b6d2", lowGold: "#f4c487" });
    const bigCloud = (cx, cy, w, h, seed) => {
      const f = SCALLOP(bumpRing(cx, cy, w / 2, h / 2, 14, seed, 0.22, true), 0.45);
      P.paint("#fffaf0", f);
      P.within(f, (p) => {
        p.fill("#b3bccd", BLOB([[cx - w * 0.7, cy + h * 0.22], [cx - w * 0.35, cy + h * 0.1], [cx, cy + h * 0.2], [cx + w * 0.35, cy + h * 0.08], [cx + w * 0.7, cy + h * 0.18], [cx + w * 0.7, cy + h], [cx - w * 0.7, cy + h]]));
        p.fill("#98a3b9", R(cx - w, cy + h * 0.4, w * 2, h));
        p.fill("#ffe2b8", BLOB([[cx - w * 0.55, cy - h * 0.2], [cx - w * 0.3, cy - h * 0.5], [cx - w * 0.05, cy - h * 0.55], [cx - w * 0.2, cy - h * 0.25]]));
      });
      P.ink(f, LW_IN, inkL());
    };
    bigCloud(300, H * 0.2, 460, 230, 41);
    bigCloud(790, H * 0.14, 360, 170, 42);
    const hz = H * 0.58;
    const far = (k, col) => css(mix(lcRGB(col, col, "#2a3050"), lcRGB("#c9d3dc", "#e9cfb0", "#323a60"), k));
    const rft = mulberry32(73);
    for (let x = -5; x < 1005; ) {
      const w = 26 + rft() * 40, h = 30 + rft() * 70 + (rft() < 0.15 ? 70 : 0);
      P.shape(R(x, hz - h, w, h + 10), far(0.62, ["#d5dbe0", "#cdd3d9", "#dde1e4"][Math.floor(rft() * 3)]), LW_FAR * 0.8);
      x += w + 4 + rft() * 10;
    }
    crane(P, 160, hz - 40, 120, 90);
    crane(P, 690, hz - 30, 96, 70);
    gopuram(P, 540, hz + 4, 46, 96);
    const rmid = mulberry32(74);
    for (let x = -10; x < 1010; ) {
      const w = 30 + rmid() * 34, h = 22 + rmid() * 30;
      P.shape(R(x, hz + 22 - h, w, h + 20), far(0.3, ["#e9cfc7", "#f1e2b0", "#d7e3d2", "#f0d2b4", "#e6e2d6"][Math.floor(rmid() * 5)]), LW_FAR);
      if (rmid() < 0.45) P.fill(far(0.3, "#2f3337"), R(x + w * (0.2 + rmid() * 0.5), hz + 22 - h - 10, 9, 10));
      x += w + 2;
    }
    P.fill(lc("#7fa25a", "#86964f", "#18233c"), R(-5, hz + 26, 1010, H * 0.5));
    for (let i = 0; i < 16; i++) crown(P, i * 66 + 10, hz + 34 + i % 3 * 8, 24 + i * 7 % 12, 700 + i, lc("#6c9450", "#76874a", "#18203a"), lc("#557a3e", "#5f6a38", "#121830"), LW_FAR, 8);
    for (const [x, top, s, b] of [[90, hz - 40, 0.55, 10], [420, hz - 20, 0.5, -8], [905, hz - 46, 0.58, -12]]) coconutPalm(P, x, hz + 60, top, s, { bend: b, trunk: 7, len: 110, leafLen: 30, lw: LW_FAR, dense: 0.7 });
    const blocks = [
      [-10, H * 0.9, 190, 210, "#e8c7c0", "#d2aba3", { tank: 0.55, grille: true }],
      [170, H * 0.95, 160, 170, "#f0dca2", "#dcc386", { tank: 0.2, clothes: true }],
      [320, H * 0.92, 200, 250, "#cfe0cf", "#b4c9b4", { tank: 0.64, grille: true }],
      [510, H * 0.96, 150, 150, "#f2ede0", "#dad3c2", {}],
      [650, H * 0.93, 180, 230, "#f2c9a2", "#ddb08a", { tank: 0.3, grille: true }]
    ];
    for (const [x, by, w, h, a, b, o] of blocks) roofBlock(P, x, by, w, h, lc(a, a, "#2c3150"), lc(b, b, "#22263f"), o);
    for (const [x, y, r] of [[120, H * 0.97, 70], [470, H * 1, 64], [700, H * 0.99, 58]]) crown(P, x, y, r, 900 + x, lc("#5f8a46", "#6b7f40", "#18203a"), lc("#4a7238", "#556634", "#121830"), LW_IN, 11);
    coconutPalm(P, 590, H + 30, H * 0.5, 1.05, { bend: -20, trunk: 9, len: 124, leafLen: 34, nuts: true });
    P.ink(CURVE([[-5, H * 0.52], [300, H * 0.58], [600, H * 0.55], [1005, H * 0.6]]), 0.9, inkL());
    P.ink(CURVE([[-5, H * 0.55], [320, H * 0.61], [640, H * 0.58], [1005, H * 0.63]]), 0.9, inkL());
    const gx = 800, gy = H * 0.48;
    const trunk = (pts, w) => {
      P.ink(LN(pts), w + 3.6, INK);
      P.ink(LN(pts), w, lc("#7a5b42", "#86603e", "#1a1d33"));
    };
    trunk([[gx - 10, H + 5], [gx - 6, gy + 60], [gx - 80, gy + 10]], 5.4);
    trunk([[gx - 6, gy + 60], [gx + 60, gy + 8]], 3.6);
    trunk([[gx - 40, gy + 34], [gx - 150, gy + 4]], 2.6);
    const can = SCALLOP(bumpRing(gx - 10, gy - 10, 250, 96, 18, 51, 0.16), 0.35);
    P.paint(lc("#6e8f4a", "#7a8644", "#1a2240"), can);
    P.within(can, (p) => {
      p.fill(lc("#56763a", "#636c36", "#121a32"), R(gx - 260, gy + 20, 520, 120));
      const rnd = mulberry32(52);
      for (let i = 0; i < 70; i++) {
        const a = rnd() * TAU, r = Math.sqrt(rnd()), x = gx - 10 + Math.cos(a) * 240 * r, y = gy - 10 + Math.sin(a) * 90 * r;
        p.ink(CURVE([[x - 10, y], [x, y - 3], [x + 10, y]]), 0.6, lc("rgba(60,90,40,.6)", "rgba(60,90,40,.6)", "rgba(8,12,24,.6)"));
      }
      for (let i = 0; i < 170; i++) {
        const a = rnd() * TAU, r = Math.sqrt(rnd()), x = gx - 10 + Math.cos(a) * 250 * r, y = gy - 10 + Math.sin(a) * 96 * r - 8;
        p.fill(i % 5 ? lc("#e2552f", "#ee5a2a", "#3a2232") : lc("#f19a3a", "#f8a03a", "#3c2a30"), EL(x, y, 7 + rnd() * 6, 5 + rnd() * 4, rnd()));
      }
    });
    P.ink(can, LW_IN, inkL());
  }
  function viewSurathkal(P, H, sky) {
    drawSky(P, H, sky, { horizon: 0.62, top: "#1b2a55", mid: "#33437a", low: "#6a6f9c" });
    const hz = H * 0.6;
    P.fill("#2c4c7a", R(-5, hz, 1010, H * 0.25));
    P.ink(LN([[-5, hz], [1005, hz]]), LW_FINE, "rgba(10,14,30,.9)");
    const mx = sky.moonX || 760;
    for (let i = 0; i < 18; i++) {
      const y = hz + 6 + i * 9, w = 10 + i * 3;
      P.fill(`rgba(255,240,200,${0.55 - i * 0.025})`, R(mx - w / 2 + Math.sin(i * 2.3) * 8, y, w, 2));
    }
    for (let i = 0; i < 9; i++) P.ink(LN([[i * 120 - 30, hz + 40 + i % 3 * 16], [i * 120 + 30, hz + 40 + i % 3 * 16]]), 0.8, "rgba(200,220,255,.35)");
    const hx = 250, LS = 1.25;
    P.shape(PL([[60, hz + 6], [150, hz - 34], [240, hz - 46], [330, hz - 40], [420, hz + 8]]), "#1a2440", LW_IN);
    P.at(hx, hz - 44, 0, LS, (p) => {
      p.shape(PL([[-16, 0], [16, 0], [11, -126], [-11, -126]]), "#e9e4d6", LW_IN);
      for (let k = 0; k < 3; k++) p.fill("#b5452f", PL([[-15 + k * 1.2, -26 - k * 36], [15 - k * 1.2, -26 - k * 36], [14.4 - k * 1.2, -44 - k * 36], [-14.4 + k * 1.2, -44 - k * 36]]));
      p.fill("rgba(30,36,70,.35)", PL([[4, 0], [16, 0], [11, -126], [3, -126]]));
      p.ink(PL([[-16, 0], [16, 0], [11, -126], [-11, -126]]), LW_IN);
      p.shape(R(-15, -142, 30, 16), "#ffe9a8", LW_IN);
      p.shape((c) => {
        c.moveTo(-17, -142);
        c.lineTo(0, -160);
        c.lineTo(17, -142);
        c.closePath();
      }, "#2a2f3e", LW_IN);
      p.shape(R(-22, -128, 44, 5), "#2a2f3e", LW_FINE);
    });
    P.fill("#3a3b52", PL([[-5, H * 0.84], [1005, H * 0.8], [1005, H + 5], [-5, H + 5]]));
    P.ink(CURVE([[-5, H * 0.84], [300, H * 0.825], [700, H * 0.81], [1005, H * 0.8]]), 1.6, "rgba(240,244,255,.75)");
    const palm = (x, top, bend, s) => coconutPalm(P, x, H + 20, top, s, { bend, trunk: 9, len: 124, leafLen: 34, trunkCol: "#151b30", trunkShade: "#0f1426", ringCol: "rgba(5,7,16,.9)", leaf: "#18223c", leafShade: "#0f1629" });
    palm(640, H * 0.34, 40, 1.15);
    palm(830, H * 0.22, -30, 1.3);
    palm(80, H * 0.4, 30, 1);
  }
  var LW_FAR, LIGHT, inkL, VIEWS, VIEW_LIVE;
  var init_views = __esm({
    "js/views.js"() {
      init_core();
      init_ink();
      LW_FAR = 0.65;
      LIGHT = { day: 1, golden: 0, night: 0, twilight: 0 };
      inkL = (a = 1) => lc(`rgba(40,34,30,${a})`, `rgba(40,34,30,${a})`, `rgba(14,16,34,${a})`);
      VIEWS = { now: viewSanJose, sd: viewSanDiego, blr: viewBengaluru, nitk: viewSurathkal };
      VIEW_LIVE = {
        nitk(c, H, t) {
          const hx = 250, hy = H * 0.6 - 44 - 134 * 1.25, a = t * 0.35 % 1 * TAU, face = Math.cos(a);
          const dir = Math.sin(a) > 0 ? 1 : -1, len = 900 * Math.abs(Math.sin(a)) + 80, spread = 0.06 + (1 - Math.abs(Math.sin(a))) * 0.4;
          c.save();
          c.globalCompositeOperation = "screen";
          const g = c.createLinearGradient(hx, hy, hx + dir * len, hy);
          g.addColorStop(0, `rgba(255,240,190,${0.55 + face * 0.25})`);
          g.addColorStop(1, "rgba(255,240,190,0)");
          c.fillStyle = g;
          c.beginPath();
          c.moveTo(hx, hy);
          c.lineTo(hx + dir * len, hy - len * spread);
          c.lineTo(hx + dir * len, hy + len * spread * 0.6);
          c.closePath();
          c.fill();
          c.globalAlpha = 0.6 + Math.max(0, face) * 0.4;
          c.fillStyle = "#fff3c4";
          c.beginPath();
          c.arc(hx, hy, 9 + Math.max(0, face) * 8, 0, TAU);
          c.fill();
          c.restore();
        },
        blr(c, H, t) {
          for (const [x0, y0, col, ph] of [[300, H * 0.3, "#e2553a", 0], [560, H * 0.22, "#2f55b8", 1.7]]) {
            const x = x0 + Math.sin(t * 0.7 + ph) * 14, y = y0 + Math.sin(t * 1.1 + ph) * 8, r = Math.sin(t * 0.9 + ph) * 0.18;
            c.save();
            c.translate(x, y);
            c.rotate(r);
            c.beginPath();
            c.moveTo(0, -18);
            c.lineTo(13, 0);
            c.lineTo(0, 22);
            c.lineTo(-13, 0);
            c.closePath();
            c.fillStyle = col;
            c.fill();
            c.lineWidth = LW_IN;
            c.strokeStyle = INK;
            c.stroke();
            c.beginPath();
            c.moveTo(0, -18);
            c.lineTo(0, 22);
            c.moveTo(-13, 0);
            c.lineTo(13, 0);
            c.lineWidth = 0.7;
            c.stroke();
            c.beginPath();
            c.moveTo(0, 22);
            for (let k = 1; k <= 6; k++) c.lineTo(Math.sin(t * 3 + k + ph) * 6, 22 + k * 7);
            c.lineWidth = 1;
            c.stroke();
            c.restore();
            c.beginPath();
            c.moveTo(x, y + 4);
            c.quadraticCurveTo(x + 60, y + 160, x + 140 + ph * 30, H * 0.62);
            c.lineWidth = 0.6;
            c.strokeStyle = "rgba(40,34,30,.55)";
            c.stroke();
          }
        },
        now(c, H, t, sky) {
          if (!sky || sky.night > 0.4) return;
          const a = t * 0.22, x = 330 + Math.cos(a) * 70, y = H * 0.2 + Math.sin(a) * 18, w = 9 + Math.sin(t * 2.1) * 1.5;
          c.save();
          c.strokeStyle = "rgba(40,34,30,.75)";
          c.lineWidth = 1.4;
          c.lineCap = "round";
          c.beginPath();
          c.moveTo(x - w, y - 2);
          c.quadraticCurveTo(x - w * 0.4, y - 5, x, y);
          c.quadraticCurveTo(x + w * 0.4, y - 5, x + w, y - 2);
          c.stroke();
          c.restore();
        }
      };
    }
  });

  // js/objects.js
  function contact(P, x, y, w, a = 0.28) {
    P.alpha(a, (p) => p.fill("#3a2312", EL(x, y, w / 2, Math.max(4, w * 0.07))));
  }
  function drawLaptopBase(P, x, y, s = 1, col = "#c9ccce") {
    const w = 240 * s, d = 52 * s, t = 9 * s;
    contact(P, x + 6, y + 4, w * 1.08, 0.3);
    const top = [[x - w / 2 + 14 * s, y - d], [x + w / 2 - 14 * s, y - d], [x + w / 2, y], [x - w / 2, y]];
    P.shape(PL([[x - w / 2, y], [x + w / 2, y], [x + w / 2, y + t], [x - w / 2, y + t]]), "#9da2a6", LW_SIL);
    P.shape(PL(top), col, LW_SIL);
    P.within(PL(top), (p) => {
      for (let r = 0; r < 4; r++) {
        const v0 = 0.14 + r * 0.16, v1 = v0 + 0.12, yA = lerp(y - d, y, v0), yB = lerp(y - d, y, v1);
        const xa0 = lerp(x - w / 2 + 14 * s, x - w / 2, v0) + 26 * s, xa1 = lerp(x + w / 2 - 14 * s, x + w / 2, v0) - 26 * s;
        const xb0 = lerp(x - w / 2 + 14 * s, x - w / 2, v1) + 26 * s, xb1 = lerp(x + w / 2 - 14 * s, x + w / 2, v1) - 26 * s;
        for (let k = 0; k < 12; k++) {
          const t0 = k / 12 + 6e-3, t1 = (k + 1) / 12 - 6e-3;
          p.fill("#43484d", PL([[lerp(xa0, xa1, t0), yA], [lerp(xa0, xa1, t1), yA], [lerp(xb0, xb1, t1), yB], [lerp(xb0, xb1, t0), yB]]));
        }
      }
      p.fill("#b5b9bc", PL([[x - 34 * s, y - d * 0.12], [x + 34 * s, y - d * 0.12], [x + 36 * s, y - 2 * s], [x - 36 * s, y - 2 * s]]));
    });
  }
  function drawLaptopLid(P, x, y, s = 1, col = "#c9ccce") {
    const w = 240 * s, d = 52 * s;
    P.shape(PL([[x - w / 2 + 12 * s, y - d - 2 * s], [x + w / 2 - 12 * s, y - d - 2 * s], [x + w / 2 + 2 * s, y - 4 * s], [x - w / 2 - 2 * s, y - 4 * s]]), col, LW_SIL);
    P.fill("#e3e5e6", PL([[x - w / 2 + 30 * s, y - d + 6 * s], [x - 10 * s, y - d + 6 * s], [x - 34 * s, y - 10 * s], [x - w / 2 + 14 * s, y - 10 * s]]));
  }
  function laptopScreenRect(x, y, s = 1) {
    const w = 214 * s, h = 146 * s;
    return { x: x - w / 2, y: y - 52 * s - h - 4 * s, w, h };
  }
  function drawLaptopScreen(P, x, y, s = 1, col = "#c9ccce", content = "code") {
    const r = laptopScreenRect(x, y, s), b = 9 * s;
    P.shape(RR(r.x - b, r.y - b, r.w + 2 * b, r.h + 2 * b, 7 * s), col, LW_SIL);
    P.shape(R(r.x, r.y, r.w, r.h), "#273240", LW_IN);
    P.within(R(r.x, r.y, r.w, r.h), (p) => {
      if (content === "code") {
        const cols = ["#9bc4e2", "#e8c46a", "#a9d39a", "#d8dde3"];
        for (let i = 0; i < 6; i++) p.fill(cols[i % 4], R(r.x + 14 * s + (i % 3 === 2 ? 16 * s : 0), r.y + 16 * s + i * 13 * s, (50 + i * 37 % 70) * s, 4 * s));
      } else if (content === "paper") {
        p.fill("#f4f2ea", R(r.x + 18 * s, r.y + 10 * s, r.w - 36 * s, r.h - 10 * s));
        for (let i = 0; i < 9; i++) p.fill("#9aa1a8", R(r.x + 30 * s, r.y + 22 * s + i * 12 * s, (r.w - 70 * s) * (i % 4 === 3 ? 0.6 : 1), 3.4 * s));
        p.fill("#e9a3b8", R(r.x + 30 * s, r.y + 22 * s + 4 * 12 * s - 3 * s, 70 * s, 9 * s));
      }
      p.alpha(0.18, (q) => q.fill("#ffffff", PL([[r.x + r.w * 0.55, r.y], [r.x + r.w * 0.78, r.y], [r.x + r.w * 0.4, r.y + r.h], [r.x + r.w * 0.17, r.y + r.h]])));
    });
    P.fill("#9da2a6", R(r.x - b + 6 * s, r.y + r.h + b - 1, r.w + 2 * b - 12 * s, 5 * s));
  }
  function robotMeta(x, y, s = 1) {
    const hw = 54 * s, hh = 48 * s, hx = x - hw / 2, hy = y - 108 * s;
    return { hx, hy, hw, hh, eyes: [[hx + hw * 0.3, hy + hh * 0.5, 9 * s], [hx + hw * 0.64, hy + hh * 0.5, 9 * s]] };
  }
  function drawRobot(P, x, y, s = 1) {
    const m = robotMeta(x, y, s), { hx, hy, hw, hh } = m, dk = 10 * s;
    contact(P, x + 4, y + 2, 64 * s, 0.3);
    P.shape(R(x - 17 * s, y - 26 * s, 13 * s, 26 * s), PAL.cobalt, LW_IN);
    P.shape(R(x + 4 * s, y - 26 * s, 13 * s, 26 * s), PAL.cobaltShade, LW_IN);
    P.shape(R(x - 24 * s, y - 60 * s, 48 * s, 36 * s), PAL.cobalt, LW);
    P.fill(PAL.cobaltShade, R(x + 10 * s, y - 59 * s, 13 * s, 34 * s));
    P.shape(R(x - 34 * s, y - 56 * s, 11 * s, 26 * s), PAL.cobaltShade, LW_IN);
    P.shape(R(x + 23 * s, y - 56 * s, 11 * s, 26 * s), PAL.cobaltShade, LW_IN);
    P.shape(R(x - 8 * s, y - 64 * s, 16 * s, 6 * s), PAL.cobaltShade, LW_IN);
    P.shape(PL([[hx + hw, hy], [hx + hw + dk, hy - dk * 0.7], [hx + hw + dk, hy + hh - dk * 0.7], [hx + hw, hy + hh]]), PAL.cobaltShade, LW);
    P.shape(PL([[hx, hy], [hx + dk, hy - dk * 0.7], [hx + hw + dk, hy - dk * 0.7], [hx + hw, hy]]), "#4a6fcf", LW);
    P.shape(R(hx, hy, hw, hh), PAL.cobalt, LW_SIL);
    P.shape(PL([[hx + hw * 0.62, hy], [hx + hw, hy], [hx + hw, hy + hh * 0.42]]), "#f6f3ea", LW_IN);
    P.fill("#dcd7c9", PL([[hx + hw * 0.62, hy], [hx + hw, hy + hh * 0.42], [hx + hw * 0.8, hy + hh * 0.1]]));
    P.ink(LN([[hx + hw * 0.62, hy], [hx + hw, hy + hh * 0.42]]), LW_IN);
    for (const [ex, ey, er] of m.eyes) {
      P.shape(EL(ex, ey, er, er), "#fbf9f1", LW_IN);
      P.fill(INK, EL(ex + er * 0.18, ey + er * 0.1, er * 0.46, er * 0.46));
      P.fill("#ffffff", EL(ex + er * 0.02, ey - er * 0.18, er * 0.14, er * 0.14));
    }
    P.shape(EL(hx + hw + dk * 0.55, hy + hh * 0.52, 6.5 * s, 11 * s), PAL.vermilion, LW_IN);
    return m;
  }
  function drawTelescope(P, x, y, s = 1, ang = -0.5) {
    contact(P, x, y + 2, 90 * s, 0.22);
    const top = [x, y - 74 * s];
    for (const fx of [-34, 0, 30]) {
      P.ink(LN([[x + fx * s, y], top]), 3.4, INK);
      P.ink(LN([[x + fx * s, y], top]), 1.4, "#6b7075");
    }
    P.shape(RR(top[0] - 7 * s, top[1] - 10 * s, 14 * s, 14 * s, 3 * s), "#585d62", LW_IN);
    P.at(top[0], top[1] - 6 * s, ang, 1, (p) => {
      p.shape(RR(-70 * s, -10 * s, 150 * s, 20 * s, 4 * s), "#efece2", LW_SIL);
      p.fill("#d6d2c4", R(-68 * s, 3 * s, 146 * s, 6 * s));
      p.shape(RR(64 * s, -13 * s, 30 * s, 26 * s, 4 * s), "#3d4247", LW);
      p.shape(RR(-84 * s, -6 * s, 16 * s, 12 * s, 2 * s), "#3d4247", LW_IN);
      p.shape(RR(-20 * s, -18 * s, 34 * s, 8 * s, 3 * s), "#3d4247", LW_IN);
    });
  }
  function drawMug(P, x, y, s = 1, col = "#3f8f87", shade = "#2f6f69") {
    contact(P, x + 3, y + 2, 46 * s, 0.25);
    const w = 34 * s, h = 40 * s;
    P.ink((c) => {
      c.ellipse(x + w / 2 + 4 * s, y - h * 0.52, 9 * s, 11 * s, 0, -PI / 2, PI / 2);
    }, 5.4);
    P.ink((c) => {
      c.ellipse(x + w / 2 + 4 * s, y - h * 0.52, 9 * s, 11 * s, 0, -PI / 2, PI / 2);
    }, 2.4, col);
    P.shape((c) => {
      c.moveTo(x - w / 2, y - h);
      c.lineTo(x + w / 2, y - h);
      c.lineTo(x + w / 2, y - 4 * s);
      c.quadraticCurveTo(x + w / 2, y, x + w / 2 - 6 * s, y);
      c.lineTo(x - w / 2 + 6 * s, y);
      c.quadraticCurveTo(x - w / 2, y, x - w / 2, y - 4 * s);
      c.closePath();
    }, col, LW_SIL);
    P.fill(shade, R(x + w * 0.18, y - h + 1, w * 0.3, h - 2));
    P.shape(EL(x, y - h, w / 2, 5 * s), shade, LW_IN);
    P.fill("#5a3a22", EL(x, y - h + 1, w / 2 - 3 * s, 3.2 * s));
  }
  function drawPlant(P, x, y, s = 1) {
    P.shape(PL([[x - 22 * s, y - 34 * s], [x + 22 * s, y - 34 * s], [x + 16 * s, y], [x - 16 * s, y]]), "#c66d43", LW);
    P.fill("#a95a35", PL([[x + 6 * s, y - 34 * s], [x + 22 * s, y - 34 * s], [x + 16 * s, y], [x + 4 * s, y]]));
    P.shape(R(x - 25 * s, y - 40 * s, 50 * s, 8 * s), "#d27b50", LW_IN);
    const lv = (a, l, w) => P.at(x, y - 40 * s, a, 1, (p) => p.shape((c) => {
      c.moveTo(0, 0);
      c.quadraticCurveTo(w * s, -l * s * 0.5, 0, -l * s);
      c.quadraticCurveTo(-w * s, -l * s * 0.5, 0, 0);
    }, "#7da35e", LW_IN));
    for (const [a, l, w] of [[-1.2, 34, 10], [1.15, 32, 10], [-0.6, 44, 11], [0.55, 42, 11], [0, 50, 12]]) lv(a, l, w);
  }
  function drawSpines(P, x, y, spines, lean = 0) {
    let cx = x;
    spines.forEach((b, i) => {
      const draw = (p) => {
        p.shape(R(0, -b.h, b.w, b.h), b.c, LW_IN);
        p.fill(b.band, R(0, -b.h + 12, b.w, 7));
        p.fill(b.band, R(0, -18, b.w, 4));
        p.alpha(0.18, (q) => q.fill("#000", R(b.w * 0.7, -b.h, b.w * 0.3, b.h)));
      };
      if (i === spines.length - 1 && lean) P.at(cx + 2, y, lean, 1, draw);
      else P.at(cx, y, 0, 1, draw);
      cx += b.w + 1;
    });
    return cx;
  }
  function drawPrint(P, img, cx, cy, w, rot, o = {}) {
    const ratio = o.ratio || (img && img.naturalWidth ? img.naturalHeight / img.naturalWidth : 0.75);
    const b = o.border ?? 6, iw = w, ih = w * ratio, W = iw + 2 * b, H = ih + 2 * b;
    P.at(cx, cy, rot, 1, (p) => {
      p.alpha(0.3, (q) => q.fill("#2c2015", R(-W / 2 + 4, -H / 2 + 6, W, H)));
      p.shape(R(-W / 2, -H / 2, W, H), "#fbfaf5", LW_IN);
      if (img && img.complete && img.naturalWidth) {
        p.c.save();
        p.c.beginPath();
        p.c.rect(-W / 2 + b, -H / 2 + b, iw, ih);
        p.c.clip();
        p.c.drawImage(img, -W / 2 + b, -H / 2 + b, iw, ih);
        p.c.restore();
      } else p.fill("#9aa6a6", R(-W / 2 + b, -H / 2 + b, iw, ih));
      p.ink(R(-W / 2 + b, -H / 2 + b, iw, ih), 0.8, "rgba(40,34,30,.5)");
      if (o.tape) {
        p.alpha(0.82, (q) => q.shape(R(-16, -H / 2 - 9, 32, 16), "#efe6c4", 0.8));
      } else {
        const pc = o.pin || "#d6453a";
        p.alpha(0.35, (q) => q.fill("#000", EL(3, -H / 2 + b * 0.5 + 4, 5, 3)));
        p.shape(EL(0, -H / 2 + b * 0.5, 5.5, 5.5), pc, LW_IN);
        p.fill("rgba(255,255,255,.7)", EL(-1.6, -H / 2 + b * 0.5 - 1.8, 1.6, 1.6));
      }
    });
  }
  function drawNote(P, cx, cy, w, h, rot, col = "#fbf6dc", lines = 4, pin = "#2f55b8") {
    P.at(cx, cy, rot, 1, (p) => {
      p.alpha(0.25, (q) => q.fill("#2c2015", R(-w / 2 + 3, -h / 2 + 5, w, h)));
      p.shape(R(-w / 2, -h / 2, w, h), col, LW_IN);
      for (let i = 0; i < lines; i++) p.ink(LN([[-w / 2 + 8, -h / 2 + 16 + i * 10], [w / 2 - 8 - i % 2 * 14, -h / 2 + 16 + i * 10]]), 0.8, "rgba(60,60,80,.6)");
      p.shape(EL(0, -h / 2 + 5, 4.5, 4.5), pin, LW_IN);
    });
  }
  function casters(P, cx, fy, spread, col) {
    for (const [dx, dy] of [[-spread, 2], [spread, 2], [-spread * 0.45, 10], [spread * 0.45, 10], [0, -2]]) {
      P.ink(LN([[cx, fy - 22], [cx + dx, fy - 6 + dy]]), 6.4, INK);
      P.ink(LN([[cx, fy - 22], [cx + dx, fy - 6 + dy]]), 3.6, col);
      P.shape(EL(cx + dx, fy - 2 + dy, 7, 5), "#2a2c30", LW_IN);
    }
  }
  function drawOfficeChair(P, cx, topY, fy, o = {}) {
    const back = o.back || "#3a3f46", backS = o.backS || "#2c3036", frame = o.frame || "#55595f";
    contact(P, cx, fy + 4, 190, 0.3);
    P.shape(R(cx - 7, topY + 150, 14, fy - topY - 170), frame, LW);
    casters(P, cx, fy, 82, frame);
    P.shape(RR(cx - 92, topY + 132, 184, 26, 10), o.seat || backS, LW_SIL);
    for (const sx of [-1, 1]) {
      P.shape(R(cx + sx * 86 - 6, topY + 74, 12, 64), frame, LW);
      P.shape(RR(cx + sx * 86 - 18, topY + 66, 36, 13, 6), "#2a2c30", LW);
    }
    const br = RR(cx - 74, topY, 148, 136, 30);
    P.shape(br, back, LW_SIL);
    P.within(br, (p) => {
      p.fill(backS, R(cx + 30, topY, 50, 140));
      if (o.mesh) {
        for (let k = -64; k < 74; k += 9) p.ink(LN([[cx + k, topY + 4], [cx + k + 6, topY + 132]]), 0.5, "rgba(255,255,255,.14)");
        for (let k = 12; k < 132; k += 10) p.ink(LN([[cx - 72, topY + k], [cx + 72, topY + k + 2]]), 0.5, "rgba(255,255,255,.1)");
      } else p.ink(RR(cx - 62, topY + 12, 124, 110, 22), LW_FINE, "rgba(255,255,255,.18)");
      p.fill("rgba(255,255,255,.12)", RR(cx - 60, topY + 8, 40, 12, 6));
    });
  }
  function drawMonoblocChair(P, cx, topY, fy) {
    const white = "#f3f0e6", shade = "#d7d2c4";
    contact(P, cx, fy + 4, 170, 0.28);
    for (const [x0, x1] of [[-58, -84], [58, 84], [-36, -44], [36, 44]]) {
      P.shape(PL([[cx + x0 - 8, topY + 128], [cx + x0 + 8, topY + 128], [cx + x1 + 7, fy], [cx + x1 - 7, fy]]), x0 > 0 ? shade : white, LW);
    }
    P.shape(RR(cx - 82, topY + 118, 164, 22, 8), shade, LW_SIL);
    const back = (c) => {
      c.moveTo(cx - 70, topY + 124);
      c.quadraticCurveTo(cx - 80, topY + 10, cx, topY);
      c.quadraticCurveTo(cx + 80, topY + 10, cx + 70, topY + 124);
      c.closePath();
    };
    P.shape(back, white, LW_SIL);
    P.within(back, (p) => {
      p.fill(shade, R(cx + 34, topY, 50, 130));
      for (let k = 0; k < 4; k++) p.shape(RR(cx - 44 + k * 2, topY + 30 + k * 18, 88 - k * 4, 8, 4), "#c9c3b2", LW_FINE);
    });
  }
  function drawSocket(P, x, y, kind, top = 60) {
    if (kind === "us") {
      P.shape(RR(x - 16, y - 28, 32, 56, 4), "#f4f2ea", LW_IN);
      for (const oy of [-12, 12]) {
        P.fill("#3a3a3a", R(x - 7, oy + y - 5, 2.4, 8));
        P.fill("#3a3a3a", R(x + 4.6, oy + y - 5, 2.4, 9));
        P.fill("#3a3a3a", EL(x, oy + y + 6, 2.4, 2));
      }
      const cord = CURVE([[x - 2, y - 14], [x - 18, y - 34], [x - 30, y - 52], [x - 36, y - top]]);
      P.ink(cord, 3.2);
      P.ink(cord, 1.4, "#e8e6de");
      P.shape(RR(x - 7, y - 20, 14, 14, 2), "#ece9df", LW_FINE);
    } else {
      P.shape(RR(x - 40, y - 22, 80, 44, 3), "#f4f2ea", LW_IN);
      P.shape(RR(x - 34, y - 14, 18, 28, 2), "#e8e4d8", LW_FINE);
      P.fill("#c9473a", R(x - 31, y - 10, 12, 9));
      P.shape(EL(x + 12, y, 15, 15), "#ece9df", LW_FINE);
      P.fill("#3a3a3a", EL(x + 12, y - 7, 2.6, 2.6));
      P.fill("#3a3a3a", EL(x + 6, y + 4, 2.2, 2.2));
      P.fill("#3a3a3a", EL(x + 18, y + 4, 2.2, 2.2));
    }
  }
  function drawBackpack(P, x, y, s = 1) {
    contact(P, x, y + 2, 120 * s, 0.3);
    const body = RR(x - 46 * s, y - 118 * s, 92 * s, 118 * s, 26 * s);
    P.shape(body, "#5c7a8c", LW_SIL);
    P.within(body, (p) => p.fill("#4a6676", R(x + 18 * s, y - 120 * s, 40 * s, 124 * s)));
    P.shape(RR(x - 34 * s, y - 62 * s, 68 * s, 50 * s, 12 * s), "#6d8b9c", LW_IN);
    P.ink(LN([[x - 30 * s, y - 50 * s], [x + 30 * s, y - 50 * s]]), LW_IN);
    P.shape(RR(x - 16 * s, y - 132 * s, 32 * s, 18 * s, 8 * s), "#4a6676", LW_IN);
    P.shape(R(x - 4 * s, y - 52 * s, 8 * s, 12 * s), "#d9b44a", LW_FINE);
  }
  function drawBookPile(P, x, y, s = 1) {
    contact(P, x, y + 2, 150 * s, 0.3);
    let yy = y;
    [["#8a3b2e", 120, 22], ["#2f4f6b", 132, 26], ["#d1b45b", 112, 18], ["#3e6b4c", 126, 24]].forEach(([c, w, h], i) => {
      const off = (i % 2 ? 6 : -5) * s;
      P.shape(R(x - w / 2 * s + off, yy - h * s, w * s, h * s), c, LW_IN);
      P.fill("#f4efe2", R(x + w / 2 * s + off - 7 * s, yy - h * s + 3 * s, 5 * s, h * s - 6 * s));
      P.ink(LN([[x + w / 2 * s + off - 7 * s, yy - h * s + 3 * s], [x + w / 2 * s + off - 7 * s, yy - 3 * s]]), LW_FINE);
      yy -= h * s;
    });
  }
  function drawBox(P, x, y, s = 1) {
    contact(P, x, y + 2, 150 * s, 0.3);
    P.shape(R(x - 64 * s, y - 84 * s, 128 * s, 84 * s), "#c9a06a", LW_SIL);
    P.fill("#b18850", R(x + 30 * s, y - 84 * s, 34 * s, 84 * s));
    P.shape(PL([[x - 64 * s, y - 84 * s], [x - 40 * s, y - 104 * s], [x + 6 * s, y - 92 * s], [x - 14 * s, y - 84 * s]]), "#d8b07a", LW_IN);
    P.shape(PL([[x + 64 * s, y - 84 * s], [x + 40 * s, y - 102 * s], [x - 4 * s, y - 92 * s], [x + 14 * s, y - 84 * s]]), "#b8925c", LW_IN);
    P.fill("#e8dfc4", R(x - 40 * s, y - 50 * s, 46 * s, 22 * s));
    P.ink(R(x - 40 * s, y - 50 * s, 46 * s, 22 * s), LW_FINE);
  }
  function drawToolbox(P, x, y, s = 1) {
    contact(P, x, y + 2, 140 * s, 0.3);
    P.shape(R(x - 62 * s, y - 56 * s, 124 * s, 56 * s), "#b8402f", LW_SIL);
    P.fill("#963223", R(x + 30 * s, y - 56 * s, 32 * s, 56 * s));
    P.shape(R(x - 64 * s, y - 64 * s, 128 * s, 12 * s), "#c9503c", LW_IN);
    const handle = (c) => {
      c.moveTo(x - 24 * s, y - 64 * s);
      c.lineTo(x - 24 * s, y - 80 * s);
      c.lineTo(x + 24 * s, y - 80 * s);
      c.lineTo(x + 24 * s, y - 64 * s);
    };
    P.ink(handle, 4.4 * s);
    P.ink(handle, 2 * s, "#9aa0a3");
    P.shape(R(x - 6 * s, y - 50 * s, 12 * s, 9 * s), "#c9c9c0", LW_FINE);
  }
  function drawPapers(P, x, y, s = 1) {
    contact(P, x, y + 2, 130 * s, 0.22);
    for (let i = 0; i < 4; i++) {
      const r = (i - 1.5) * 0.05, dx = (i - 1.5) * 4 * s;
      P.at(x + dx, y - 4 - i * 2.4 * s, r, 1, (p) => {
        p.shape(PL([[-58 * s, 0], [58 * s, 0], [48 * s, -38 * s], [-48 * s, -38 * s]]), i === 3 ? "#fbfaf3" : "#f0ede2", LW_IN);
        if (i === 3) for (let k = 0; k < 6; k++) p.ink(LN([[-40 * s + k * 1.6 * s, -32 * s + k * 5.4 * s], [(30 - k % 3 * 8) * s, -32 * s + k * 5.4 * s]]), 0.8, "rgba(60,64,80,.55)");
      });
    }
    P.at(x + 10 * s, y - 20 * s, -0.35, 1, (p) => {
      p.shape(RR(-44 * s, -3 * s, 88 * s, 6 * s, 3 * s), "#2f55b8", LW_IN);
      p.fill("#e9e6dc", R(36 * s, -3 * s, 8 * s, 6 * s));
    });
  }
  function drawZine(P, x, y, s = 1) {
    contact(P, x, y + 2, 120 * s, 0.2);
    const L0 = [[x - 60 * s, y], [x, y + 2 * s], [x - 4 * s, y - 34 * s], [x - 54 * s, y - 36 * s]];
    const R0 = [[x, y + 2 * s], [x + 60 * s, y], [x + 54 * s, y - 36 * s], [x - 4 * s, y - 34 * s]];
    P.shape(PL(L0), "#fff1f5", LW_IN);
    P.shape(PL(R0), "#fffbe8", LW_IN);
    P.within(PL(L0), (p) => {
      p.fill("#ff6fa8", EL(x - 30 * s, y - 18 * s, 18 * s, 12 * s));
      p.fill("#ffd23f", R(x - 50 * s, y - 8 * s, 34 * s, 4 * s));
    });
    P.within(PL(R0), (p) => {
      for (let k = 0; k < 4; k++) p.fill("#2f55b8", R(x + 8 * s, y - 28 * s + k * 7 * s, (36 - k * 5) * s, 2.6 * s));
      p.fill("#ff6fa8", R(x + 30 * s, y - 10 * s, 16 * s, 6 * s));
    });
    P.ink(LN([[x, y + 2 * s], [x - 4 * s, y - 34 * s]]), LW_IN);
  }
  function drawPaperCup(P, x, y, s = 1) {
    contact(P, x + 2, y + 2, 44 * s, 0.25);
    P.shape(PL([[x - 18 * s, y - 56 * s], [x + 18 * s, y - 56 * s], [x + 13 * s, y], [x - 13 * s, y]]), "#f4efe4", LW_SIL);
    P.fill("#ddd6c6", PL([[x + 4 * s, y - 56 * s], [x + 18 * s, y - 56 * s], [x + 13 * s, y], [x + 3 * s, y]]));
    P.shape(PL([[x - 16.5 * s, y - 40 * s], [x + 16.5 * s, y - 40 * s], [x + 14.5 * s, y - 18 * s], [x - 14.5 * s, y - 18 * s]]), "#a9794e", LW_IN);
    P.shape(RR(x - 21 * s, y - 64 * s, 42 * s, 9 * s, 3 * s), "#3d4247", LW_IN);
  }
  function drawCactus(P, x, y, s = 1) {
    P.shape(PL([[x - 18 * s, y - 28 * s], [x + 18 * s, y - 28 * s], [x + 14 * s, y], [x - 14 * s, y]]), "#e8e2d4", LW);
    P.shape(RR(x - 9 * s, y - 70 * s, 18 * s, 44 * s, 9 * s), "#6f9a58", LW_IN);
    P.shape(RR(x + 6 * s, y - 56 * s, 14 * s, 9 * s, 4 * s), "#6f9a58", LW_IN);
    P.shape(RR(x + 13 * s, y - 72 * s, 9 * s, 22 * s, 4 * s), "#6f9a58", LW_IN);
    P.ink(LN([[x, y - 66 * s], [x, y - 30 * s]]), LW_FINE, "rgba(30,50,20,.6)");
  }
  function drawLyingBooks(P, x, y, s, books) {
    let yy = y;
    books.forEach(([c, w, h], i) => {
      const off = (i % 2 ? 5 : -4) * s;
      P.shape(R(x + off, yy - h * s, w * s, h * s), c, LW_IN);
      P.fill("#f4efe2", R(x + off + w * s - 6 * s, yy - h * s + 2 * s, 4 * s, h * s - 4 * s));
      yy -= h * s;
    });
    return yy;
  }
  function monitorRect(x, y, s = 1) {
    const w = 250 * s, h = 150 * s;
    return { x: x - w / 2, y: y - 74 * s - h, w, h };
  }
  function drawMonitor(P, x, y, s = 1) {
    const r = monitorRect(x, y, s), b = 10 * s;
    contact(P, x + 4, y + 4, 300 * s, 0.26);
    const kb = PL([[x - 120 * s, y + 14 * s], [x + 110 * s, y + 14 * s], [x + 100 * s, y - 14 * s], [x - 110 * s, y - 14 * s]]);
    P.shape(kb, "#d9d8d2", LW_SIL);
    P.within(kb, (p) => {
      for (let r2 = 0; r2 < 3; r2++) for (let k = 0; k < 16; k++) p.fill("#8b8d90", R(x - 104 * s + k * 13 * s + r2 * 2 * s, y - 10 * s + r2 * 8 * s, 10 * s, 5 * s));
    });
    P.shape(PL([[x - 46 * s, y - 20 * s], [x + 46 * s, y - 20 * s], [x + 36 * s, y - 30 * s], [x - 36 * s, y - 30 * s]]), "#45494e", LW_IN);
    P.shape(R(x - 10 * s, y - 76 * s, 20 * s, 48 * s), "#55595e", LW_IN);
    P.shape(RR(r.x - b, r.y - b, r.w + 2 * b, r.h + 2 * b, 5 * s), "#2b2e33", LW_SIL);
    P.shape(R(r.x, r.y, r.w, r.h), "#10161d", LW_FINE);
    P.within(R(r.x, r.y, r.w, r.h), (p) => {
      const rnd = mulberry32(19);
      for (let row = 0; row < 9; row++) {
        const yy = r.y + 8 * s + row * 14 * s;
        for (let xx = r.x + 6 * s; xx < r.x + r.w - 70 * s; ) {
          const w = (6 + rnd() * 16) * s;
          p.fill(["#3b6fd1", "#c9473a", "#4fae6c", "#d8b23f"][Math.floor(rnd() * 4)], R(xx, yy, w, 8 * s));
          xx += w + 2 * s;
        }
      }
      for (let k = 0; k < 5; k++) p.fill("rgba(120,200,255,.75)", R(r.x + 6 * s, r.y + 15 * s + k * 28 * s, r.w - 80 * s, 2 * s));
      for (let k = 0; k < 4; k++) p.fill("rgba(255,120,200,.7)", R(r.x + 30 * s + k * 42 * s, r.y + 4 * s, 2 * s, r.h - 8 * s));
      p.fill("#6b4fa8", R(r.x + r.w - 62 * s, r.y + 10 * s, 52 * s, 62 * s));
      for (let k = 0; k < 6; k++) p.ink(LN([[r.x + r.w - 62 * s, r.y + 18 * s + k * 9 * s], [r.x + r.w - 10 * s, r.y + 18 * s + k * 9 * s]]), 0.6, "rgba(255,255,255,.4)");
      p.alpha(0.16, (q) => q.fill("#ffffff", PL([[r.x + r.w * 0.6, r.y], [r.x + r.w * 0.8, r.y], [r.x + r.w * 0.45, r.y + r.h], [r.x + r.w * 0.25, r.y + r.h]])));
    });
  }
  function drawLoupe(P, x, y, s = 1) {
    contact(P, x, y + 2, 140 * s, 0.18);
    const sheet = PL([[x - 66 * s, y], [x + 66 * s, y], [x + 56 * s, y - 42 * s], [x - 56 * s, y - 42 * s]]);
    P.shape(sheet, "#fbfaf3", LW_IN);
    P.within(sheet, (p) => {
      p.ink(R(x - 40 * s, y - 34 * s, 26 * s, 14 * s), 0.8, "#3a4a6a");
      p.ink(R(x - 4 * s, y - 34 * s, 30 * s, 14 * s), 0.8, "#3a4a6a");
      p.ink(LN([[x - 14 * s, y - 27 * s], [x - 4 * s, y - 27 * s]]), 0.8, "#3a4a6a");
      for (let k = 0; k < 3; k++) p.ink(LN([[x - 44 * s, y - 14 * s + k * 5 * s], [x + 40 * s, y - 14 * s + k * 5 * s]]), 0.7, "rgba(60,64,80,.5)");
    });
    P.shape(EL(x + 18 * s, y - 16 * s, 24 * s, 12 * s), "rgba(220,236,240,.55)", LW);
    P.ink(EL(x + 18 * s, y - 16 * s, 19 * s, 9 * s), LW_FINE, "rgba(255,255,255,.8)");
    P.at(x + 40 * s, y - 10 * s, 0.25, 1, (p) => p.shape(RR(0, -5 * s, 40 * s, 10 * s, 4 * s), "#3d4247", LW_IN));
  }
  function drawChip(P, x, y, s = 1) {
    contact(P, x, y + 2, 90 * s, 0.2);
    P.shape(PL([[x - 44 * s, y], [x + 44 * s, y], [x + 36 * s, y - 26 * s], [x - 36 * s, y - 26 * s]]), "#e9a0b4", LW_IN);
    P.fill("#d98aa0", PL([[x - 44 * s, y], [x + 44 * s, y], [x + 44 * s, y + 6 * s], [x - 44 * s, y + 6 * s]]));
    P.ink(PL([[x - 44 * s, y], [x + 44 * s, y], [x + 44 * s, y + 6 * s], [x - 44 * s, y + 6 * s]]), LW_FINE);
    for (let k = 0; k < 7; k++) {
      const t = (k + 0.5) / 7;
      P.ink(LN([[lerp(x - 22 * s, x + 22 * s, t), y - 6 * s], [lerp(x - 22 * s, x + 22 * s, t), y - 1 * s]]), 1.6, "#c9ccce");
    }
    P.shape(PL([[x - 22 * s, y - 6 * s], [x + 22 * s, y - 6 * s], [x + 18 * s, y - 22 * s], [x - 18 * s, y - 22 * s]]), "#24272b", LW_IN);
    P.fill("#3a3e44", PL([[x - 22 * s, y - 6 * s], [x + 22 * s, y - 6 * s], [x + 22 * s, y - 2 * s], [x - 22 * s, y - 2 * s]]));
    P.fill("#e8e6dc", EL(x - 12 * s, y - 17 * s, 2 * s, 1.2 * s));
  }
  function drawTumbler(P, x, y, s = 1) {
    contact(P, x + 2, y + 2, 64 * s, 0.25);
    const steel = "#c6cacc", steelS = "#9da2a5";
    P.shape(PL([[x - 30 * s, y - 14 * s], [x + 30 * s, y - 14 * s], [x + 24 * s, y], [x - 24 * s, y]]), steel, LW_IN);
    P.shape(EL(x, y - 14 * s, 30 * s, 6 * s), steelS, LW_IN);
    P.shape(PL([[x - 15 * s, y - 52 * s], [x + 15 * s, y - 52 * s], [x + 12 * s, y - 14 * s], [x - 12 * s, y - 14 * s]]), steel, LW_SIL);
    P.fill(steelS, PL([[x + 3 * s, y - 52 * s], [x + 15 * s, y - 52 * s], [x + 12 * s, y - 14 * s], [x + 3 * s, y - 14 * s]]));
    P.shape(EL(x, y - 52 * s, 15 * s, 4 * s), "#8a5a35", LW_IN);
  }
  function drawBinders(P, x, y, s = 1) {
    const cols = [["#f1efe6", "#2f55b8"], ["#2f55b8", "#f1efe6"], ["#f1efe6", "#c9473a"], ["#3e6b4c", "#f1efe6"], ["#f1efe6", "#2f55b8"]];
    let cx = x;
    cols.forEach(([c, lab]) => {
      const w = 26 * s, h = 96 * s;
      P.shape(R(cx, y - h, w, h), c, LW_IN);
      P.shape(R(cx + 5 * s, y - h + 18 * s, w - 10 * s, 26 * s), lab, LW_FINE);
      P.shape(EL(cx + w / 2, y - 20 * s, 5 * s, 5 * s), "#2b2e33", LW_FINE);
      cx += w + 1;
    });
    return cx;
  }
  function drawBottlePlant(P, x, y, s = 1) {
    P.shape((c) => {
      c.moveTo(x - 16 * s, y);
      c.lineTo(x - 16 * s, y - 44 * s);
      c.quadraticCurveTo(x - 16 * s, y - 54 * s, x - 6 * s, y - 58 * s);
      c.lineTo(x - 6 * s, y - 70 * s);
      c.lineTo(x + 6 * s, y - 70 * s);
      c.lineTo(x + 6 * s, y - 58 * s);
      c.quadraticCurveTo(x + 16 * s, y - 54 * s, x + 16 * s, y - 44 * s);
      c.lineTo(x + 16 * s, y);
      c.closePath();
    }, "rgba(180,215,200,.6)", LW_IN);
    P.fill("rgba(140,190,200,.5)", R(x - 15 * s, y - 26 * s, 30 * s, 25 * s));
    const leaf = (lx, ly, a, sz) => P.at(lx, ly, a, 1, (p) => p.shape((c) => {
      c.moveTo(0, 0);
      c.quadraticCurveTo(sz * s, -sz * 0.5 * s, 0, -sz * 1.3 * s);
      c.quadraticCurveTo(-sz * s, -sz * 0.5 * s, 0, 0);
    }, "#7bab52", LW_FINE));
    P.ink(CURVE([[x, y - 66 * s], [x - 20 * s, y - 84 * s], [x - 40 * s, y - 70 * s], [x - 52 * s, y - 40 * s]]), 1.2, "#4f7a34");
    P.ink(CURVE([[x, y - 66 * s], [x + 18 * s, y - 88 * s], [x + 34 * s, y - 82 * s]]), 1.2, "#4f7a34");
    for (const [lx, ly, a, sz] of [[x - 18, y - 84, -0.8, 11], [x - 38, y - 72, -1.6, 10], [x - 50, y - 46, -2.6, 10], [x + 16, y - 88, 0.4, 11], [x + 34, y - 82, 1.2, 10], [x + 2, y - 74, -0.2, 12]]) leaf(lx, ly, a, sz);
  }
  function scopeRect(x, y, s = 1) {
    const w = 120 * s, h = 80 * s;
    return { x: x - 150 * s / 2 + 12 * s, y: y - 118 * s + 14 * s, w, h };
  }
  function drawScope(P, x, y, s = 1) {
    const W = 230 * s, Hh = 118 * s, x0 = x - W / 2 + 40 * s;
    contact(P, x + 10, y + 4, W * 1.05, 0.28);
    const r = scopeRect(x, y, s);
    P.shape(PL([[x0 + W - 70 * s, y - Hh], [x0 + W - 40 * s, y - Hh - 22 * s], [x0 + W - 40 * s, y - 22 * s], [x0 + W - 70 * s, y]]), "#bdb39c", LW_SIL);
    P.shape(PL([[x0 - 40 * s, y - Hh], [x0 - 10 * s, y - Hh - 22 * s], [x0 + W - 40 * s, y - Hh - 22 * s], [x0 + W - 70 * s, y - Hh]]), "#e2dac6", LW_SIL);
    P.shape(R(x0 - 40 * s, y - Hh, W - 30 * s, Hh), "#d6cdb5", LW_SIL);
    P.fill("#c4bba2", R(x0 - 40 * s, y - 12 * s, W - 30 * s, 12 * s));
    P.shape(RR(r.x - 6 * s, r.y - 6 * s, r.w + 12 * s, r.h + 12 * s, 6 * s), "#3a3f38", LW_IN);
    P.shape(R(r.x, r.y, r.w, r.h), "#123224", LW_FINE);
    P.within(R(r.x, r.y, r.w, r.h), (p) => {
      for (let k = 1; k < 8; k++) p.ink(LN([[r.x + r.w * k / 8, r.y], [r.x + r.w * k / 8, r.y + r.h]]), 0.5, "rgba(120,220,160,.25)");
      for (let k = 1; k < 6; k++) p.ink(LN([[r.x, r.y + r.h * k / 6], [r.x + r.w, r.y + r.h * k / 6]]), 0.5, "rgba(120,220,160,.25)");
      const sq = [], hi = r.y + r.h * 0.3, lo = r.y + r.h * 0.7;
      for (let k = 0; k <= 4; k++) {
        const xa = r.x + r.w * (k / 4) - r.w * 0.05, xb = xa + r.w / 8;
        sq.push([xa, lo], [xa, hi], [xb, hi], [xb, lo]);
      }
      p.ink(LN(sq), 2.6, "rgba(140,255,170,.35)");
      p.ink(LN(sq), 1.2, "#b8ffd0");
    });
    const kx = r.x + r.w + 20 * s;
    for (let k = 0; k < 3; k++) for (let j = 0; j < 2; j++) {
      P.shape(EL(kx + j * 26 * s, r.y + 10 * s + k * 26 * s, 9 * s, 9 * s), "#3a3f38", LW_IN);
      P.ink(LN([[kx + j * 26 * s, r.y + 10 * s + k * 26 * s], [kx + j * 26 * s + 5 * s, r.y + 4 * s + k * 26 * s]]), 1, "#e9e2cc");
    }
    P.shape(R(r.x, y - 26 * s, 26 * s, 9 * s), "#3a3f38", LW_FINE);
    P.shape(R(r.x + 34 * s, y - 26 * s, 26 * s, 9 * s), "#3a3f38", LW_FINE);
    P.shape(EL(kx + 2 * s, y - 20 * s, 6 * s, 6 * s), "#c9473a", LW_FINE);
    P.shape(EL(kx + 26 * s, y - 20 * s, 6 * s, 6 * s), "#d8b23f", LW_FINE);
    const lead = CURVE([[kx + 2 * s, y - 20 * s], [kx - 40 * s, y + 10 * s], [x - 170 * s, y + 6 * s], [x - 230 * s, y - 10 * s]]);
    P.ink(lead, 3.4);
    P.ink(lead, 1.4, "#c9473a");
  }
  function drawBreadboard(P, x, y, s = 1) {
    contact(P, x, y + 2, 140 * s, 0.18);
    const bb = PL([[x - 64 * s, y], [x + 64 * s, y], [x + 56 * s, y - 40 * s], [x - 56 * s, y - 40 * s]]);
    P.shape(bb, "#f2efe6", LW_IN);
    P.within(bb, (p) => {
      for (let row = 0; row < 7; row++) for (let k = 0; k < 18; k++) {
        const t = row / 7, yy = lerp(y - 36 * s, y - 4 * s, t), xa = lerp(x - 52 * s, x - 60 * s, t), xb = lerp(x + 52 * s, x + 60 * s, t);
        p.fill("#b9b5aa", R(lerp(xa, xb, k / 17) - 1, yy, 2.2 * s, 2.2 * s));
      }
      p.fill("#c9473a", R(x - 56 * s, y - 38 * s, 112 * s, 1.6 * s));
      p.fill("#2f55b8", R(x - 60 * s, y - 4 * s, 120 * s, 1.6 * s));
    });
    for (const [x0, x1, c] of [[-40, -10, "#c9473a"], [-20, 24, "#2f8f5a"], [8, 44, "#d8b23f"], [-48, 30, "#2f55b8"]]) P.ink((c2) => {
      c2.moveTo(x + x0 * s, y - 24 * s);
      c2.quadraticCurveTo(x + (x0 + x1) / 2 * s, y - 46 * s, x + x1 * s, y - 16 * s);
    }, 2.2, c);
    P.shape(RR(x - 30 * s, y - 30 * s, 16 * s, 6 * s, 3 * s), "#d9b98a", LW_FINE);
    P.shape(EL(x + 20 * s, y - 34 * s, 4 * s, 6 * s), "#e2553a", LW_FINE);
    P.shape(R(x - 6 * s, y - 22 * s, 22 * s, 10 * s), "#24272b", LW_FINE);
  }
  function drawPlanisphere(P, x, y, s = 1) {
    contact(P, x, y + 2, 130 * s, 0.2);
    P.shape(EL(x, y - 18 * s, 62 * s, 22 * s), "#e6dcc2", LW_SIL);
    P.shape(EL(x, y - 20 * s, 52 * s, 18 * s), "#1e2b52", LW_IN);
    P.within(EL(x, y - 20 * s, 52 * s, 18 * s), (p) => {
      const rnd = mulberry32(61);
      for (let i = 0; i < 40; i++) {
        const a = rnd() * TAU, r = Math.sqrt(rnd());
        p.fill("#f6efcf", EL(x + Math.cos(a) * 50 * s * r, y - 20 * s + Math.sin(a) * 17 * s * r, 1.2 * s, 0.8 * s));
      }
      p.ink(LN([[x - 22 * s, y - 26 * s], [x - 8 * s, y - 22 * s], [x + 6 * s, y - 28 * s], [x + 20 * s, y - 20 * s]]), 0.8, "rgba(246,239,207,.7)");
      p.ink(EL(x, y - 20 * s, 30 * s, 10 * s), 0.6, "rgba(246,239,207,.4)");
    });
  }
  function drawMultimeter(P, x, y, s = 1) {
    contact(P, x, y + 2, 70 * s, 0.24);
    P.shape(RR(x - 28 * s, y - 92 * s, 56 * s, 92 * s, 10 * s), "#e2b23a", LW_SIL);
    P.shape(RR(x - 22 * s, y - 86 * s, 44 * s, 80 * s, 6 * s), "#3a3f38", LW_IN);
    P.shape(R(x - 17 * s, y - 80 * s, 34 * s, 18 * s), "#b9c8a4", LW_FINE);
    for (const dx of [-12, -3, 6]) P.fill("#2a3324", R(x + dx * s, y - 75 * s, 6 * s, 8 * s));
    P.shape(EL(x, y - 40 * s, 13 * s, 13 * s), "#55595e", LW_IN);
    P.ink(LN([[x, y - 40 * s], [x + 8 * s, y - 48 * s]]), 1.4, "#e9e2cc");
  }
  function drawBinoculars(P, x, y, s = 1) {
    for (const dx of [-16, 16]) {
      P.shape(RR(x + dx * s - 12 * s, y - 52 * s, 24 * s, 52 * s, 8 * s), "#2b2e33", LW_IN);
      P.shape(EL(x + dx * s, y - 52 * s, 11 * s, 5 * s), "#6b7a8a", LW_FINE);
    }
    P.shape(R(x - 6 * s, y - 40 * s, 12 * s, 14 * s), "#3d4247", LW_FINE);
  }
  function drawLayoutSheet(P, cx, cy, w, rot) {
    const h = w * 1.25;
    P.at(cx, cy, rot, 1, (p) => {
      p.alpha(0.25, (q) => q.fill("#2c2015", R(-w / 2 + 3, -h / 2 + 5, w, h)));
      p.shape(R(-w / 2, -h / 2, w, h), "#fbfaf3", LW_IN);
      const rnd = mulberry32(23);
      for (let r = 0; r < 9; r++) for (let x = -w / 2 + 6; x < w / 2 - 6; ) {
        const ww = 3 + rnd() * 9;
        p.fill(["#3b6fd1", "#c9473a", "#4fae6c", "#d8b23f"][Math.floor(rnd() * 4)], R(x, -h / 2 + 8 + r * (h - 16) / 9, ww, (h - 16) / 9 - 3));
        x += ww + 1.5;
      }
      p.shape(R(-6, -h / 2 - 6, 12, 10), "rgba(239,230,196,.85)", 0.7);
    });
  }
  function drawStarSheet(P, cx, cy, w, rot) {
    const h = w * 1.2;
    P.at(cx, cy, rot, 1, (p) => {
      p.alpha(0.25, (q) => q.fill("#2c2015", R(-w / 2 + 3, -h / 2 + 5, w, h)));
      p.shape(R(-w / 2, -h / 2, w, h), "#1f2c54", LW_IN);
      const rnd = mulberry32(88);
      for (let i = 0; i < 28; i++) p.fill("#f6efcf", EL(-w / 2 + 6 + rnd() * (w - 12), -h / 2 + 6 + rnd() * (h - 12), 0.9 + rnd() * 1.2, 0.9 + rnd() * 1.2));
      const o = [[-8, -18], [10, -16], [-2, 0], [2, 1], [6, 2], [-10, 18], [12, 16]].map(([a, b]) => [a * w / 50, b * h / 60]);
      p.ink(LN([o[0], o[2], o[5]]), 0.7, "rgba(246,239,207,.6)");
      p.ink(LN([o[1], o[4], o[6]]), 0.7, "rgba(246,239,207,.6)");
      o.forEach(([a, b]) => p.fill("#fff6d6", EL(a, b, 1.8, 1.8)));
      p.shape(EL(0, -h / 2 + 5, 4.5, 4.5), "#d8b23f", LW_IN);
    });
  }
  function drawSchematic(P, cx, cy, w, h, rot) {
    P.at(cx, cy, rot, 1, (p) => {
      p.alpha(0.25, (q) => q.fill("#2c2015", R(-w / 2 + 3, -h / 2 + 5, w, h)));
      p.shape(R(-w / 2, -h / 2, w, h), "#fbf6dc", LW_IN);
      const zig = [];
      for (let i = 0; i <= 8; i++) zig.push([-w / 2 + 14 + i * 4, (i % 2 ? -4 : 4) * (i > 0 && i < 8 ? 1 : 0)]);
      p.ink(LN([[-w / 2 + 6, 0], ...zig, [-w / 2 + 52, 0], [w / 2 - 20, 0]]), 0.9, "#2f3e6b");
      p.ink(LN([[w / 2 - 20, -10], [w / 2 - 20, 10]]), 0.9, "#2f3e6b");
      p.ink(LN([[w / 2 - 15, -6], [w / 2 - 15, 6]]), 0.9, "#2f3e6b");
      p.ink(LN([[-w / 2 + 6, 0], [-w / 2 + 6, h / 2 - 8], [w / 2 - 15, h / 2 - 8], [w / 2 - 15, 0]]), 0.9, "#2f3e6b");
      p.shape(EL(0, -h / 2 + 5, 4.5, 4.5), "#2f55b8", LW_IN);
    });
  }
  function eraObjects(era, L, PH) {
    const S = L.slots, s = L.objScale, pb = L.pin, sh = L.shelf, fl = L.floor, ch = L.chair, so = L.socket;
    const [lx, ly] = S.center, [rx, ry] = S.right, [tx, ty] = S.far, [mx, my] = S.left;
    const P0 = (n, fx, fy, w, rot, o) => (P) => drawPrint(P, PH[n], pb.x + pb.w * fx, pb.y + pb.h * fy, pb.w * w, rot, o);
    const floorObj = (id, fn) => fl ? [{ id, exit: "right", enter: "right", draw: (P) => fn(P, fl[0], fl[1], s) }] : [];
    const chair = (id, fn) => ch ? [{ id, exit: "roll", enter: "roll", draw: (P) => fn(P, ch.x, ch.top, ch.floor) }] : [];
    const socket = (kind) => so ? [{ id: "socket-" + kind, exit: "fade", enter: "fade", draw: (P) => drawSocket(P, so[0], so[1], kind, so[1] - L.desk.frontY - L.desk.faceH + 2) }] : [];
    if (era === "now") return [
      ...socket("us"),
      { id: "shelf", exit: "up", enter: "drop", draw: (P) => {
        const end = drawSpines(P, sh.x + 30, sh.y, SPINES_NOW, -0.12);
        drawPlant(P, end + 44, sh.y, 0.9);
      } },
      { id: "mug", exit: "right", enter: "right", draw: (P) => drawMug(P, mx, my, s) },
      { id: "laptop-base", exit: "right", enter: "right", draw: (P) => drawLaptopBase(P, lx, ly, s) },
      { id: "laptop-screen", exit: "lid", enter: "lid", hinge: [lx, ly - 52 * s], follow: "laptop-base", draw: (P) => drawLaptopScreen(P, lx, ly, s), lid: (P) => drawLaptopLid(P, lx, ly, s), live: "tokens", screen: laptopScreenRect(lx, ly, s), glow: "rgba(150,190,255,.55)" },
      { id: "robot", exit: "right", enter: "right", draw: (P) => drawRobot(P, rx, ry, s * 1.18), live: "blink", eyes: robotMeta(rx, ry, s * 1.18).eyes },
      { id: "telescope", exit: "up", enter: "drop", draw: (P) => drawTelescope(P, tx, ty, s, -2.72) },
      { id: "p-award", exit: "board", enter: "board", photo: true, draw: P0("neurips-award", 0.34, 0.33, 0.5, -0.05, { pin: "#d6453a", ratio: 0.75 }) },
      { id: "p-ebay", exit: "board", enter: "board", photo: true, draw: P0("ebay-headquarters", 0.77, 0.46, 0.28, 0.06, { tape: true, ratio: 1.331 }) },
      { id: "note", exit: "board", enter: "board", draw: (P) => drawNote(P, pb.x + pb.w * 0.28, pb.y + pb.h * 0.8, pb.w * 0.32, pb.h * 0.24, 0.04) },
      ...chair("chair-now", (P, x, t, f) => drawOfficeChair(P, x, t, f, { mesh: true })),
      ...floorObj("backpack", drawBackpack)
    ];
    if (era === "sd") return [
      ...socket("us"),
      { id: "shelf", exit: "up", enter: "drop", draw: (P) => {
        drawLyingBooks(P, sh.x + 26, sh.y, 1, [["#2f4f6b", 120, 20], ["#8a3b2e", 112, 18], ["#d1b45b", 104, 16]]);
        drawSpines(P, sh.x + 160, sh.y, [{ c: "#3e6b4c", band: "#e8dcb8", w: 24, h: 88 }, { c: "#e8e2d2", band: "#2f4f6b", w: 20, h: 80 }, { c: "#6b4f8a", band: "#e8dcb8", w: 22, h: 92 }]);
        drawCactus(P, sh.x + 252, sh.y, 0.9);
      } },
      { id: "papers", exit: "right", enter: "right", draw: (P) => drawPapers(P, mx + 6, my + 8, s) },
      { id: "laptop-base", exit: "right", enter: "right", draw: (P) => drawLaptopBase(P, lx - 10, ly, s, "#bfc4c8") },
      { id: "laptop-screen", exit: "lid", enter: "lid", hinge: [lx - 10, ly - 52 * s], follow: "laptop-base", draw: (P) => drawLaptopScreen(P, lx - 10, ly, s, "#bfc4c8", "paper"), lid: (P) => drawLaptopLid(P, lx - 10, ly, s, "#bfc4c8"), screen: laptopScreenRect(lx - 10, ly, s), glow: false },
      { id: "zine", exit: "right", enter: "right", draw: (P) => drawZine(P, rx - 6, ry + 12, s) },
      { id: "cup", exit: "right", enter: "right", draw: (P) => drawPaperCup(P, tx - 30, ty + 6, s) },
      { id: "p-library", exit: "board", enter: "board", photo: true, draw: P0("ucsd-library", 0.34, 0.2, 0.56, -0.03, { pin: "#2f55b8", ratio: 0.471 }) },
      { id: "p-group", exit: "board", enter: "board", photo: true, draw: P0("research-group", 0.36, 0.6, 0.6, 0.035, { tape: true, ratio: 0.468 }) },
      { id: "p-uist", exit: "board", enter: "board", photo: true, draw: P0("uist-award", 0.82, 0.3, 0.22, -0.06, { pin: "#d6453a", ratio: 1.334 }) },
      { id: "p-intern", exit: "board", enter: "board", photo: true, draw: P0("ebay-intern", 0.8, 0.72, 0.22, 0.05, { pin: "#e0b53a", ratio: 1.331 }) },
      ...chair("chair-sd", (P, x, t, f) => drawOfficeChair(P, x, t, f, { back: "#3f5f86", backS: "#30496a", seat: "#30496a", frame: "#6a6e74" })),
      ...floorObj("books", drawBookPile)
    ];
    if (era === "blr") return [
      ...socket("in"),
      { id: "shelf", exit: "up", enter: "drop", draw: (P) => {
        const end = drawBinders(P, sh.x + 30, sh.y, 1);
        drawBottlePlant(P, end + 60, sh.y, 1);
      } },
      { id: "tumbler", exit: "right", enter: "right", draw: (P) => drawTumbler(P, mx, my, s) },
      { id: "monitor", exit: "right", enter: "right", draw: (P) => drawMonitor(P, lx + 10, ly - 6, s), screen: monitorRect(lx + 10, ly - 6, s), glow: false },
      { id: "loupe", exit: "right", enter: "right", draw: (P) => drawLoupe(P, rx + 20, ry + 14, s) },
      { id: "chip", exit: "right", enter: "right", draw: (P) => drawChip(P, tx - 10, ty + 10, s) },
      { id: "p-ti", exit: "board", enter: "board", photo: true, draw: P0("ti-bengaluru", 0.32, 0.38, 0.44, -0.04, { pin: "#2f55b8", ratio: 0.932 }) },
      { id: "layout", exit: "board", enter: "board", draw: (P) => drawLayoutSheet(P, pb.x + pb.w * 0.74, pb.y + pb.h * 0.44, pb.w * 0.34, 0.05) },
      { id: "note", exit: "board", enter: "board", draw: (P) => drawNote(P, pb.x + pb.w * 0.34, pb.y + pb.h * 0.82, pb.w * 0.3, pb.h * 0.22, -0.03, "#e9f1fb", 3, "#d6453a") },
      ...chair("chair-blr", (P, x, t, f) => drawOfficeChair(P, x, t, f, { back: "#4a4d52", backS: "#383b40", seat: "#383b40" })),
      ...floorObj("box", drawBox)
    ];
    return [
      // Surathkal
      ...socket("in"),
      { id: "shelf", exit: "up", enter: "drop", draw: (P) => {
        drawSpines(P, sh.x + 30, sh.y, [{ c: "#8a3b2e", band: "#e8dcb8", w: 30, h: 100 }, { c: "#2f4f6b", band: "#e8dcb8", w: 28, h: 96 }, { c: "#e8e2d2", band: "#8a3b2e", w: 24, h: 90 }, { c: "#3e6b4c", band: "#e8dcb8", w: 26, h: 94 }, { c: "#d1b45b", band: "#2b2b2b", w: 22, h: 86 }]);
        drawBinoculars(P, sh.x + 220, sh.y, 1);
      } },
      { id: "breadboard", exit: "right", enter: "right", draw: (P) => drawBreadboard(P, mx + 4, my + 10, s) },
      { id: "scope", exit: "right", enter: "right", draw: (P) => drawScope(P, lx + 20, ly, s), live: "trace", screen: scopeRect(lx + 20, ly, s), glow: "rgba(120,255,170,.5)" },
      { id: "planisphere", exit: "right", enter: "right", draw: (P) => drawPlanisphere(P, rx + 10, ry + 12, s) },
      { id: "meter", exit: "right", enter: "right", draw: (P) => drawMultimeter(P, tx - 10, ty + 6, s) },
      { id: "p-lab", exit: "board", enter: "board", photo: true, draw: P0("nitk-lab", 0.36, 0.32, 0.54, -0.04, { pin: "#d6453a", ratio: 0.749 }) },
      { id: "starmap", exit: "board", enter: "board", draw: (P) => drawStarSheet(P, pb.x + pb.w * 0.76, pb.y + pb.h * 0.58, pb.w * 0.34, 0.06) },
      { id: "schematic", exit: "board", enter: "board", draw: (P) => drawSchematic(P, pb.x + pb.w * 0.3, pb.y + pb.h * 0.76, pb.w * 0.36, pb.h * 0.28, 0.03) },
      ...chair("chair-nitk", drawMonoblocChair),
      ...floorObj("toolbox", drawToolbox)
    ];
  }
  var SPINES_NOW;
  var init_objects = __esm({
    "js/objects.js"() {
      init_core();
      init_ink();
      SPINES_NOW = [
        { c: "#e9b62e", band: "#141414", w: 22, h: 92 },
        // Winning by Overfitting
        { c: "#2e4fa8", band: "#e7b04a", w: 26, h: 100 },
        // GPT-7 Will Have Arms
        { c: "#3b1e16", band: "#d64b2c", w: 20, h: 86 },
        // How to Please a Capricious God
        { c: "#f1eee6", band: "#ff5fa2", w: 18, h: 80 },
        // ZINify
        { c: "#e7dcc1", band: "#b8402f", w: 24, h: 94 },
        // StartR post-mortem
        { c: "#1f2b52", band: "#f08a3a", w: 21, h: 88 }
        // Dyson Swarm
      ];
    }
  });

  // js/glaze.js
  function parse(col) {
    if (typeof col !== "string") return null;
    let v = parseCache.get(col);
    if (v) return v;
    const s = col.trim();
    if (s[0] === "#") {
      const c = hexRGB(s);
      v = [c[0], c[1], c[2], 1];
    } else {
      const m = s.match(/rgba?\(([^)]+)\)/);
      if (m) {
        const p = m[1].split(",").map(Number);
        v = [p[0], p[1], p[2], p[3] ?? 1];
      } else {
        probe = probe || makeCanvas(1, 1).getContext("2d");
        probe.fillStyle = "#000";
        probe.fillStyle = s;
        const r = probe.fillStyle;
        v = r[0] === "#" ? [...hexRGB(r), 1] : parse(r) || [0, 0, 0, 1];
      }
    }
    parseCache.set(col, v);
    return v;
  }
  function glazeOf(col, accents = true, cuts = CUTS) {
    const p = parse(col);
    if (!p) return null;
    const [r, g, b, a] = p, V = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), s = mx ? (mx - mn) / mx : 0;
    let h = 0;
    if (mx !== mn) {
      const d = mx - mn;
      h = mx === r ? (g - b) / d % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h = (h * 60 + 360) % 360;
    }
    let fam = "cobalt";
    if (accents && s > 0.62 && V > 0.22 && (h < 21 || h > 340 || h > 37 && h < 56)) fam = "ochre";
    else if (accents && s > 0.3 && h > 72 && h < 168) fam = "green";
    const tone = V > cuts[0] ? 0 : V > cuts[1] ? 1 : V > cuts[2] ? 2 : V > cuts[3] ? 3 : 4;
    return { fam, tone, a, V, h, s };
  }
  function textures() {
    if (TEX) return TEX;
    const N = 320, b = makeCanvas(N, N), bx = b.getContext("2d");
    bx.fillStyle = "rgb(128,128,128)";
    bx.fillRect(0, 0, N, N);
    const rnd = mulberry32(41);
    for (let i = 0; i < 420; i++) {
      const x = rnd() * N, y = rnd() * N, len = 14 + rnd() * 40, w = 3 + rnd() * 9, ang = -0.7 + (rnd() - 0.5) * 1.6;
      const dark = rnd() < 0.55;
      for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) {
        bx.strokeStyle = dark ? `rgba(0,0,0,${0.05 + rnd() * 0.07})` : `rgba(255,255,255,${0.05 + rnd() * 0.07})`;
        bx.lineWidth = w;
        bx.lineCap = "round";
        bx.beginPath();
        bx.moveTo(x + ox, y + oy);
        bx.quadraticCurveTo(x + ox + Math.cos(ang) * len * 0.5 + (rnd() - 0.5) * 8, y + oy + Math.sin(ang) * len * 0.5 + (rnd() - 0.5) * 8, x + ox + Math.cos(ang) * len, y + oy + Math.sin(ang) * len);
        bx.stroke();
      }
    }
    const s = makeCanvas(N / 2, N / 2);
    s.getContext("2d").drawImage(b, 0, 0, N / 2, N / 2);
    const g = makeCanvas(N, N), gx = g.getContext("2d");
    gx.imageSmoothingQuality = "high";
    gx.drawImage(s, 0, 0, N, N);
    const brush = new Float32Array(N * N), d = gx.getImageData(0, 0, N, N).data;
    for (let k = 0; k < N * N; k++) brush[k] = d[k * 4] / 255 - 0.5;
    TEX = { N, brush };
    return TEX;
  }
  async function finishPainting(wash, line, dpr, alive = () => true) {
    let tq = performance.now();
    const breathe = async () => {
      if (performance.now() - tq > 30) {
        await new Promise((r) => setTimeout(r, 0));
        tq = performance.now();
      }
      return alive();
    };
    const W = wash.width, H = wash.height, tex = textures(), N = tex.N;
    const src = makeCanvas(W, H), sx = src.getContext("2d", { willReadFrequently: true });
    sx.fillStyle = "#fff";
    sx.fillRect(0, 0, W, H);
    sx.filter = `blur(${0.35 * dpr}px)`;
    sx.drawImage(wash, 0, 0);
    sx.filter = "none";
    const S = sx.getImageData(0, 0, W, H).data;
    const B = blurInto(wash, 2.2 * dpr).getContext("2d").getImageData(0, 0, W, H).data;
    const flat = makeCanvas(W, H), fx = flat.getContext("2d", { willReadFrequently: true });
    const O = fx.createImageData(W, H), o = O.data;
    const inv = 1 / dpr, amp = 1.9 * dpr, k8 = 1 / 17;
    const LV = [0, 0.2, 0.44, 0.7, 0.88];
    for (let y = 0; y < H; y++) {
      if (!(y & 15) && !await breathe()) return null;
      const yy = y * inv, ty = (yy * 1.6 | 0) % N;
      for (let x = 0; x < W; x++) {
        const xx = x * inv, i = (y * W + x) * 4;
        const wx = (vnoise(xx * k8, yy * k8, 21) - 0.5) * 2 * amp, wy = (vnoise(xx * k8, yy * k8, 22) - 0.5) * 2 * amp;
        let px = x + wx | 0, py = y + wy | 0;
        if (px < 0) px = 0;
        else if (px >= W) px = W - 1;
        if (py < 0) py = 0;
        else if (py >= H) py = H - 1;
        const j = (py * W + px) * 4;
        const r = S[j], g = S[j + 1], b = S[j + 2];
        if (r > 250 && g > 250 && b > 250) {
          o[i] = o[i + 1] = o[i + 2] = o[i + 3] = 255;
          continue;
        }
        const dA = 1 - (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        if (dA < 0.085) {
          o[i] = o[i + 1] = o[i + 2] = o[i + 3] = 255;
          continue;
        }
        const grain = ((vnoise(xx / 9, yy / 9, 6) - 0.5) * 0.1 + (vnoise(xx / 2.2, yy / 2.2, 8) - 0.5) * 0.03) * smooth(0.08, 0.22, dA) * (1 - 0.8 * smooth(0.52, 0.72, dA));
        const dq = dA + grain;
        let q = 0, best = 9;
        for (let k = 0; k < 5; k++) {
          const e = Math.abs(dq - LV[k]);
          if (e < best) {
            best = e;
            q = k;
          }
        }
        if (q === 0) {
          o[i] = o[i + 1] = o[i + 2] = o[i + 3] = 255;
          continue;
        }
        const dB = 1 - (0.2126 * B[j] + 0.7152 * B[j + 1] + 0.0722 * B[j + 2]) / 255;
        const rim = dA - dB > 0 ? dA - dB : 0;
        const n = tex.brush[ty * N + (xx * 1.6 | 0) % N];
        const mot = (vnoise(xx / 11, yy / 11, 24) - 0.5) * 0.22;
        const target = LV[q] * clamp(1 + n * (0.42 - 0.22 * smooth(0.6, 0.85, LV[q])) + rim * 1.7 + mot, 0.6, 1.5);
        const sc = target / Math.max(0.04, dA);
        o[i] = 255 - (255 - r) * sc;
        o[i + 1] = 255 - (255 - g) * sc;
        o[i + 2] = 255 - (255 - b) * sc;
        o[i + 3] = 255;
      }
    }
    fx.putImageData(O, 0, 0);
    const L = makeCanvas(W, H), lx = L.getContext("2d", { willReadFrequently: true });
    lx.filter = `blur(${0.6 * dpr}px)`;
    lx.drawImage(line, 0, 0);
    lx.filter = "none";
    const LD = lx.getImageData(0, 0, W, H), ld = LD.data;
    for (let y = 0; y < H; y++) {
      if (!(y & 31) && !await breathe()) return null;
      const yy = y * inv;
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4 + 3, a0 = ld[i];
        if (!a0) continue;
        const xx = x * inv, a = a0 / 255;
        const th = 0.08 + 0.3 * vnoise(xx / 13, yy / 13, 9) + 0.06 * (vnoise(xx / 3, yy / 3, 10) - 0.5);
        const cut = Math.max(smooth(th - 0.1, th + 0.1, a), a * 0.55);
        const load = 0.7 + 0.45 * vnoise(xx / 6, yy / 6, 7);
        ld[i] = Math.min(255, 255 * cut * clamp(load, 0.45, 1.1));
      }
    }
    lx.putImageData(LD, 0, 0);
    fx.globalCompositeOperation = "multiply";
    fx.drawImage(L, 0, 0);
    fx.globalCompositeOperation = "source-over";
    return flat;
  }
  function makeTiles(W, H, T, seed = 5, quiet = null) {
    const cols = Math.ceil(W / T) + 1, rows = Math.ceil(H / T) + 1, ox = W - cols * T, oy = H - rows * T;
    const tiles = [], grout = Math.max(1.4, T * 0.028), rnd = mulberry32(seed);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = ox + c * T, y = oy + r * T;
      tiles.push({
        r,
        c,
        x,
        y,
        cx: x + T / 2,
        cy: y + T / 2,
        fx: x + grout / 2,
        fy: y + grout / 2,
        fw: T - grout,
        fh: T - grout,
        dx: (rnd() - 0.5) * T * 0.026,
        dy: (rnd() - 0.5) * T * 0.026,
        rot: (rnd() - 0.5) * 9e-3,
        warm: rnd() - 0.5,
        bright: rnd() - 0.5,
        tiltX: rnd() - 0.5,
        tiltY: rnd() - 0.5,
        gloss: 0.55 + rnd() * 0.45,
        crackle: rnd() < 0.13,
        chip: rnd() < 0.025 ? Math.floor(rnd() * 4) : -1,
        seed: rnd() * 1e6 | 0
      });
    }
    if (quiet) {
      for (const t of tiles) if (quiet(t)) t.chip = -1;
    }
    return { tiles, T, grout, W, H, cols, rows };
  }
  function facePath(c, t, g) {
    const r = faceRadius(g), x = -t.fw / 2, y = -t.fh / 2, w = t.fw, h = t.fh;
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
  function paintSurface(g, dpr) {
    const { W, H, T } = g;
    const shade = makeCanvas(W, H), sx = shade.getContext("2d");
    const gloss = makeCanvas(W, H), gx = gloss.getContext("2d");
    const chips = makeCanvas(W, H), cx = chips.getContext("2d");
    sx.fillStyle = "#fff";
    sx.fillRect(0, 0, W, H);
    for (const t of g.tiles) {
      if (t.x > W || t.y > H || t.x + T < 0 || t.y + T < 0) continue;
      const rnd = mulberry32(t.seed);
      for (const [c, kind] of [[sx, "shade"], [gx, "gloss"], [cx, "chip"]]) {
        c.save();
        c.translate(t.cx + t.dx, t.cy + t.dy);
        c.rotate(t.rot);
        if (kind === "shade") {
          facePath(c, t, g);
          c.save();
          c.clip();
          c.lineJoin = "round";
          for (const [w, a] of [[T * 0.08, 0.01], [T * 0.04, 0.016], [T * 0.016, 0.03]]) {
            c.lineWidth = w;
            c.strokeStyle = `rgba(150,124,92,${a})`;
            facePath(c, t, g);
            c.stroke();
          }
          let gr = c.createLinearGradient(-t.fw / 2, -t.fh / 2, t.fw / 2, t.fh / 2);
          gr.addColorStop(0, "rgba(255,255,255,0)");
          gr.addColorStop(0.7, "rgba(255,255,255,0)");
          gr.addColorStop(1, "rgba(140,116,90,.04)");
          c.fillStyle = gr;
          c.fillRect(-t.fw / 2, -t.fh / 2, t.fw, t.fh);
          if (t.crackle) {
            c.strokeStyle = `rgba(120,104,86,${0.035 + rnd() * 0.035})`;
            c.lineWidth = Math.max(0.5, 0.45 * dpr);
            const n = 5 + (rnd() * 6 | 0);
            for (let k = 0; k < n; k++) {
              let x = (rnd() - 0.5) * t.fw, y = (rnd() - 0.5) * t.fh, a = rnd() * TAU;
              c.beginPath();
              c.moveTo(x, y);
              for (let s = 0; s < 6; s++) {
                a += (rnd() - 0.5) * 1.3;
                x += Math.cos(a) * T * 0.09;
                y += Math.sin(a) * T * 0.09;
                c.lineTo(x, y);
              }
              c.stroke();
            }
          }
          for (let k = 0; k < 1 + (rnd() * 3 | 0); k++) {
            c.fillStyle = `rgba(120,104,86,${0.08 + rnd() * 0.1})`;
            c.beginPath();
            c.arc((rnd() - 0.5) * t.fw * 0.9, (rnd() - 0.5) * t.fh * 0.9, (0.35 + rnd() * 0.55) * dpr, 0, TAU);
            c.fill();
          }
          c.restore();
        } else if (kind === "gloss") {
          facePath(c, t, g);
          c.save();
          c.clip();
          const gr = c.createRadialGradient(-t.fw * 0.12, -t.fh * 0.16, 0, 0, 0, t.fw * 0.8);
          gr.addColorStop(0, `rgba(255,252,240,${0.06 * t.gloss})`);
          gr.addColorStop(1, "rgba(255,252,240,0)");
          c.fillStyle = gr;
          c.fillRect(-t.fw / 2, -t.fh / 2, t.fw, t.fh);
          c.restore();
          c.strokeStyle = "rgba(255,255,250,.22)";
          c.lineWidth = Math.max(1, T * 0.012);
          c.beginPath();
          c.moveTo(-t.fw / 2 + faceRadius(g), -t.fh / 2 + c.lineWidth);
          c.lineTo(t.fw / 2 - faceRadius(g) * 2, -t.fh / 2 + c.lineWidth);
          c.stroke();
          c.beginPath();
          c.moveTo(-t.fw / 2 + c.lineWidth, -t.fh / 2 + faceRadius(g));
          c.lineTo(-t.fw / 2 + c.lineWidth, t.fh / 2 - faceRadius(g) * 2);
          c.stroke();
        } else if (t.chip >= 0) {
          const k = t.chip, sxg = k % 2 ? 1 : -1, syg = k > 1 ? 1 : -1, ccx = sxg * t.fw / 2, ccy = syg * t.fh / 2, rr = T * (0.05 + rnd() * 0.05);
          c.beginPath();
          c.moveTo(ccx, ccy);
          for (let s = 0; s <= 7; s++) {
            const a = s / 7 * Math.PI / 2, rad = rr * (0.7 + rnd() * 0.5);
            c.lineTo(ccx - sxg * Math.cos(a) * rad, ccy - syg * Math.sin(a) * rad);
          }
          c.closePath();
          c.fillStyle = "#c98f6a";
          c.fill();
          c.strokeStyle = "rgba(120,80,50,.5)";
          c.lineWidth = Math.max(0.7, 0.6 * dpr);
          c.stroke();
        }
        c.restore();
      }
    }
    return { shade, gloss, chips };
  }
  function prepareWall(g, dpr) {
    const surf = paintSurface(g, dpr);
    return { g, ...surf };
  }
  function fire(wall, painting) {
    const g = wall.g, { W, H, T } = g;
    const out = makeCanvas(W, H), c = out.getContext("2d");
    c.fillStyle = "#e3dccd";
    c.fillRect(0, 0, W, H);
    for (const t of g.tiles) {
      if (t.x > W || t.y > H || t.x + T < 0 || t.y + T < 0) continue;
      c.save();
      c.translate(t.cx + t.dx, t.cy + t.dy);
      c.rotate(t.rot);
      c.fillStyle = "rgba(90,76,60,.12)";
      c.fillRect(-t.fw / 2 + T * 6e-3, -t.fh / 2 + T * 0.01, t.fw, t.fh);
      facePath(c, t, g);
      c.clip();
      c.fillStyle = glazeColor(t);
      c.fillRect(-t.fw / 2, -t.fh / 2, t.fw, t.fh);
      c.globalCompositeOperation = "multiply";
      c.drawImage(painting, t.cx - t.fw / 2 - 1, t.cy - t.fh / 2 - 1, t.fw + 2, t.fh + 2, -t.fw / 2 - 1, -t.fh / 2 - 1, t.fw + 2, t.fh + 2);
      c.restore();
    }
    c.globalCompositeOperation = "multiply";
    c.drawImage(wall.shade, 0, 0);
    c.globalCompositeOperation = "source-over";
    c.drawImage(wall.chips, 0, 0);
    c.globalCompositeOperation = "screen";
    c.drawImage(wall.gloss, 0, 0);
    c.globalCompositeOperation = "source-over";
    return out;
  }
  function sheenSprite(T) {
    if (SHEEN && SHEEN.T === T) return SHEEN.cv;
    const w = Math.ceil(T * 0.46), h = Math.ceil(T * 0.34), cv = makeCanvas(w, h), c = cv.getContext("2d");
    const b = Math.max(1, T * 0.028);
    c.filter = `blur(${b}px)`;
    const pane = (x, y, pw, ph, a) => {
      c.fillStyle = `rgba(255,255,250,${a})`;
      c.beginPath();
      c.roundRect(x, y, pw, ph, ph * 0.2);
      c.fill();
    };
    pane(w * 0.14, h * 0.2, w * 0.34, h * 0.56, 0.8);
    pane(w * 0.54, h * 0.2, w * 0.28, h * 0.56, 0.42);
    c.filter = "none";
    const g = c.createRadialGradient(w * 0.3, h * 0.42, 0, w * 0.3, h * 0.42, w * 0.2);
    g.addColorStop(0, "rgba(255,255,255,.55)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    SHEEN = { T, cv };
    return cv;
  }
  function drawSheen(c, g, px, py, strength, skip) {
    const sp = sheenSprite(g.T), { T } = g, sw = sp.width, sh = sp.height;
    c.save();
    c.globalCompositeOperation = "screen";
    for (const t of g.tiles) {
      if (t.x > g.W || t.y > g.H || t.x + T < 0 || t.y + T < 0) continue;
      if (skip && skip(t)) continue;
      const ox = clamp(t.tiltX * 0.7 + px, -0.5, 0.5) * (t.fw - sw), oy = clamp(t.tiltY * 0.7 + py, -0.5, 0.5) * (t.fh - sh);
      c.globalAlpha = strength * t.gloss * (0.55 + 0.45 * (1 - Math.abs(t.tiltX + px)));
      c.drawImage(sp, t.cx + t.dx + ox - sw / 2, t.cy + t.dy + oy - sh / 2);
    }
    c.restore();
  }
  function drawFlip(c, g, t, A, B, p) {
    const ang = p * Math.PI, cosA = Math.cos(ang), src = p < 0.5 ? A : B, sx = Math.abs(cosA), T = g.T;
    const x = t.cx + t.dx, y = t.cy + t.dy;
    c.save();
    c.fillStyle = "#d3cab8";
    c.fillRect(t.x + g.grout * 0.2, t.y + g.grout * 0.2, T - g.grout * 0.4, T - g.grout * 0.4);
    c.fillStyle = "rgba(120,104,84,.2)";
    for (let k = 0; k < 5; k++) c.fillRect(t.x + T * 0.12, t.y + T * (0.16 + k * 0.16), T * 0.76, T * 0.045);
    c.translate(x, y);
    c.rotate(t.rot);
    const lift = Math.sin(ang);
    c.fillStyle = `rgba(60,48,36,${0.12 * lift})`;
    c.fillRect(-t.fw / 2 + T * 0.03 * lift, -t.fh / 2 + T * 0.05 * lift, t.fw, t.fh);
    c.scale(Math.max(2e-3, sx) * (1 + lift * 0.06), 1 + lift * 0.06);
    c.drawImage(src, t.cx + t.dx - t.fw / 2, t.cy + t.dy - t.fh / 2, t.fw, t.fh, -t.fw / 2, -t.fh / 2, t.fw, t.fh);
    c.fillStyle = `rgba(40,40,70,${0.22 * (1 - sx)})`;
    c.fillRect(-t.fw / 2, -t.fh / 2, t.fw, t.fh);
    c.restore();
    if (sx < 0.35) {
      c.save();
      c.translate(x, y);
      c.rotate(t.rot);
      const e = (1 - sx / 0.35) * T * 0.09, side = cosA > 0 ? -1 : 1;
      c.fillStyle = "#c4916d";
      c.fillRect(side * t.fw / 2 * sx * 1.06 - (side < 0 ? e : 0), -t.fh / 2 * 1.06, e, t.fh * 1.06);
      c.restore();
    }
  }
  var TONES, OUTLINE, hexRGB, TONE_RGB, probe, parseCache, CUTS, VIEW_CUTS, toneCss, FakeGrad, FWD_PATH, FWD_STATE, GlazeCtx, TEX, blurInto, glazeColor, faceRadius, SHEEN;
  var init_glaze = __esm({
    "js/glaze.js"() {
      init_core();
      TONES = {
        cobalt: ["#cbd8f0", "#7f9ad6", "#3657ad", "#1a2f7a"],
        ochre: ["#f4dfa8", "#e8b65a", "#cf8a2c", "#94561c"],
        green: ["#d3e3bd", "#a2c47f", "#6a9a50", "#3e6a36"]
      };
      OUTLINE = { cobalt: "#13235f", ochre: "#7a4314", green: "#2f5530" };
      hexRGB = (h) => {
        h = h.replace("#", "");
        const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16);
        return [n >> 16 & 255, n >> 8 & 255, n & 255];
      };
      TONE_RGB = Object.fromEntries(Object.entries(TONES).map(([k, v]) => [k, v.map(hexRGB)]));
      probe = null;
      parseCache = /* @__PURE__ */ new Map();
      CUTS = [0.76, 0.58, 0.42, 0.27];
      VIEW_CUTS = [0.8, 0.69, 0.55, 0.36];
      toneCss = (fam, tone, a) => {
        const c = TONE_RGB[fam][tone - 1];
        return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
      };
      FakeGrad = class {
        constructor(kind, args) {
          this.kind = kind;
          this.args = args;
          this.stops = [];
        }
        addColorStop(t, c) {
          this.stops.push([t, c]);
        }
      };
      FWD_PATH = ["beginPath", "closePath", "moveTo", "lineTo", "bezierCurveTo", "quadraticCurveTo", "arc", "arcTo", "ellipse", "rect", "roundRect"];
      FWD_STATE = ["translate", "rotate", "scale", "transform", "setTransform", "resetTransform"];
      GlazeCtx = class {
        constructor(wash, line, { accents = true, lineScale = 1.18, cuts = CUTS } = {}) {
          this.w = wash;
          this.l = line;
          this.accents = accents;
          this.lineScale = lineScale;
          this.cuts = cuts;
          this.skyStrokes = false;
          this._fill = "#000";
          this._stroke = "#000";
          this._gco = "source-over";
          this._lw = 1;
          this._stack = [];
          for (const m of FWD_PATH) this[m] = (...a) => {
            this.w[m](...a);
            this.l[m](...a);
          };
          for (const m of FWD_STATE) this[m] = (...a) => {
            this.w[m](...a);
            this.l[m](...a);
          };
        }
        get canvas() {
          return this.w.canvas;
        }
        save() {
          this.w.save();
          this.l.save();
          this._stack.push([this._fill, this._stroke, this._gco, this._lw]);
        }
        restore() {
          this.w.restore();
          this.l.restore();
          const s = this._stack.pop();
          if (s) [this._fill, this._stroke, this._gco, this._lw] = s;
        }
        clip(rule) {
          this.w.clip(rule || "nonzero");
          this.l.clip(rule || "nonzero");
        }
        getTransform() {
          return this.w.getTransform();
        }
        measureText(t) {
          return this.w.measureText(t);
        }
        createLinearGradient(...a) {
          return new FakeGrad("lin", a);
        }
        createRadialGradient(...a) {
          return new FakeGrad("rad", a);
        }
        createPattern() {
          return null;
        }
        drawImage() {
        }
        set fillStyle(v) {
          this._fill = v;
        }
        get fillStyle() {
          return this._fill;
        }
        set strokeStyle(v) {
          this._stroke = v;
        }
        get strokeStyle() {
          return this._stroke;
        }
        set globalCompositeOperation(v) {
          this._gco = v;
        }
        get globalCompositeOperation() {
          return this._gco;
        }
        set globalAlpha(v) {
          this.w.globalAlpha = v;
          this.l.globalAlpha = v;
        }
        get globalAlpha() {
          return this.w.globalAlpha;
        }
        set lineWidth(v) {
          this._lw = v;
        }
        get lineWidth() {
          return this._lw;
        }
        set lineCap(v) {
          this.w.lineCap = v;
          this.l.lineCap = v;
        }
        get lineCap() {
          return this.w.lineCap;
        }
        set lineJoin(v) {
          this.w.lineJoin = v;
          this.l.lineJoin = v;
        }
        get lineJoin() {
          return this.w.lineJoin;
        }
        set miterLimit(v) {
          this.w.miterLimit = v;
          this.l.miterLimit = v;
        }
        set font(v) {
          this.w.font = v;
        }
        set textAlign(v) {
          this.w.textAlign = v;
        }
        set textBaseline(v) {
          this.w.textBaseline = v;
        }
        set filter(v) {
        }
        set shadowBlur(v) {
        }
        set shadowColor(v) {
        }
        set shadowOffsetX(v) {
        }
        set shadowOffsetY(v) {
        }
        set imageSmoothingEnabled(v) {
        }
        set imageSmoothingQuality(v) {
        }
        _light() {
          return this._gco === "screen" || this._gco === "lighter" || this._gco === "soft-light" || this._gco === "overlay";
        }
        /* a solid colour or a gradient, as {mode, style} for the wash or the line */
        _resolve(raw, target) {
          const ctx = target === "line" ? this.l : this.w;
          if (raw instanceof FakeGrad) {
            const infos = raw.stops.map(([t, c]) => [t, glazeOf(c, this.accents, this.cuts)]);
            const light = this._light();
            const reserveAll = infos.every(([, i2]) => !i2 || i2.tone === 0);
            const g = raw.kind === "lin" ? ctx.createLinearGradient(...raw.args) : ctx.createRadialGradient(...raw.args);
            if (!light && !reserveAll && Math.max(...infos.map(([, i2]) => i2 ? i2.a : 0)) * this.w.globalAlpha < 0.2) return { mode: "skip" };
            if (light || reserveAll) {
              for (const [t, i2] of infos) g.addColorStop(t, `rgba(0,0,0,${i2 ? i2.a * (light ? i2.V : 1) : 0})`);
              return { mode: "erase", style: g };
            }
            let last = infos.find(([, i2]) => i2 && i2.tone > 0)[1];
            for (const [t, i2] of infos) {
              if (i2 && i2.tone > 0) {
                last = i2;
                g.addColorStop(t, toneCss(i2.fam, i2.tone, i2.a));
              } else g.addColorStop(t, toneCss(last.fam, last.tone, 0));
            }
            return { mode: "paint", style: g, opaque: false };
          }
          const i = glazeOf(raw, this.accents, this.cuts);
          if (!i) return { mode: "skip" };
          if (this._light()) return { mode: "erase", style: `rgba(0,0,0,${i.a * i.V})` };
          if (i.tone === 0) return { mode: "erase", style: `rgba(0,0,0,${i.a})`, opaque: i.a * this.w.globalAlpha > 0.94 };
          if (target === "wash" && i.a * this.w.globalAlpha < 0.2) return { mode: "skip" };
          if (target === "line") return { mode: "paint", style: i.V < 0.36 ? OUTLINE[i.fam] : toneCss(i.fam, i.tone, 1), alpha: i.a };
          return { mode: "paint", style: toneCss(i.fam, i.tone, i.a), opaque: i.a * this.w.globalAlpha > 0.94 };
        }
        _apply(ctx, gco, style, op) {
          const o = ctx.globalCompositeOperation;
          ctx.globalCompositeOperation = gco;
          op(ctx, style);
          ctx.globalCompositeOperation = o;
        }
        /* a daylight sky is not washed: the glaze is left white and the sky laid in with horizontal
           strokes of pale cobalt, closer together toward the top, as tile painters do */
        _isSky(raw) {
          if (!this.skyStrokes || !(raw instanceof FakeGrad) || raw.kind !== "lin" || this._light()) return false;
          const [x0, y0, x1, y1] = raw.args;
          if (Math.abs(x1 - x0) > 1 || y1 - y0 < 60) return false;
          const infos = raw.stops.map(([, c]) => glazeOf(c, false, this.cuts)).filter(Boolean);
          if (!infos.length || infos[0].h < 170 || infos[0].h > 250) return false;
          return Math.min(...infos.map((i) => i.V)) > 0.42 ? "day" : "night";
        }
        /* a night sky is one even, deep wash, lighter toward the horizon, so the dark shapes of the
           land, the palms and the lighthouse can still be painted against it in the darkest blue */
        _nightSky(raw, rule) {
          const [x0, y0, x1, y1] = raw.args, c = this.w, g = c.createLinearGradient(x0, y0, x1, y1);
          g.addColorStop(0, toneCss("cobalt", 3, 1));
          g.addColorStop(0.55, toneCss("cobalt", 3, 0.86));
          g.addColorStop(1, toneCss("cobalt", 2, 0.9));
          c.save();
          c.fillStyle = g;
          c.fill(rule);
          c.restore();
        }
        _sky(raw, rule) {
          const [, y0, , y1] = raw.args, c = this.w, rnd = mulberry32((y0 * 13 + y1 | 0) + 7);
          c.save();
          c.fillStyle = "#000";
          c.globalCompositeOperation = "destination-out";
          c.fill(rule);
          c.restore();
          c.save();
          c.clip(rule);
          c.lineCap = "round";
          c.strokeStyle = toneCss("cobalt", 1, 1);
          const top = Math.min(y0, -5), span = y1 - top;
          for (let y = top + 8; y < y1 - 6; y += 12 + rnd() * 9) {
            const k = 1 - (y - top) / span, density = 0.1 + 0.62 * k * k;
            for (let x = -40 + rnd() * 60; x < 1040; ) {
              const len = 50 + rnd() * 170;
              if (rnd() < density) {
                c.globalAlpha = 0.6 + rnd() * 0.4;
                c.lineWidth = 1.8 + rnd() * 2.4 * (0.5 + k);
                const dy = (rnd() - 0.5) * 3;
                c.beginPath();
                c.moveTo(x, y);
                c.quadraticCurveTo(x + len / 2, y + dy - 1.5, x + len, y + dy);
                c.stroke();
              }
              x += len + 30 + rnd() * 110;
            }
          }
          c.restore();
        }
        fill(rule) {
          rule = rule || "nonzero";
          const sky = this._isSky(this._fill);
          if (sky === "day") {
            this._sky(this._fill, rule);
            return;
          }
          if (sky === "night") {
            this._nightSky(this._fill, rule);
            return;
          }
          const r = this._resolve(this._fill, "wash");
          if (r.mode === "skip") return;
          const doFill = (c, s) => {
            c.fillStyle = s;
            c.fill(rule);
          };
          if (r.mode === "erase") {
            this._apply(this.w, "destination-out", r.style, doFill);
            if (r.opaque) this._apply(this.l, "destination-out", "#000", doFill);
            return;
          }
          this._apply(this.w, "source-over", r.style, doFill);
          if (r.opaque) this._apply(this.l, "destination-out", "#000", doFill);
        }
        stroke() {
          const r = this._resolve(this._stroke, "line");
          if (r.mode === "skip") return;
          const lw = this._lw;
          if (r.mode === "erase") {
            const doS = (c, s) => {
              c.lineWidth = lw;
              c.strokeStyle = s;
              c.stroke();
            };
            this._apply(this.w, "destination-out", r.style, doS);
            this._apply(this.l, "destination-out", r.style, doS);
            return;
          }
          const a = r.alpha ?? 1, ga = this.l.globalAlpha;
          this.l.globalAlpha = ga * a;
          this._apply(this.l, "source-over", r.style, (c, s) => {
            c.strokeStyle = s;
            c.lineWidth = lw * this.lineScale;
            c.stroke();
            const g2 = c.globalAlpha;
            c.globalAlpha = g2 * 0.22;
            c.lineWidth = lw * this.lineScale * 1.45;
            c.stroke();
            c.globalAlpha = g2;
          });
          this.l.globalAlpha = ga;
        }
        fillRect(x, y, w, h) {
          const r = this._resolve(this._fill, "wash");
          if (r.mode === "skip") return;
          const doR = (c, s) => {
            c.fillStyle = s;
            c.fillRect(x, y, w, h);
          };
          if (r.mode === "erase") {
            this._apply(this.w, "destination-out", r.style, doR);
            if (r.opaque) this._apply(this.l, "destination-out", "#000", doR);
            return;
          }
          this._apply(this.w, "source-over", r.style, doR);
          if (r.opaque) this._apply(this.l, "destination-out", "#000", doR);
        }
        strokeRect(x, y, w, h) {
          this.beginPath();
          this.rect(x, y, w, h);
          this.stroke();
        }
        clearRect(x, y, w, h) {
          this.w.clearRect(x, y, w, h);
          this.l.clearRect(x, y, w, h);
        }
        fillText() {
        }
        strokeText() {
        }
      };
      TEX = null;
      blurInto = (src, r) => {
        const c = makeCanvas(src.width, src.height), x = c.getContext("2d");
        x.fillStyle = "#fff";
        x.fillRect(0, 0, c.width, c.height);
        x.filter = `blur(${r}px)`;
        x.drawImage(src, 0, 0);
        x.filter = "none";
        return c;
      };
      glazeColor = (t) => {
        const base = [244, 240, 229], w = t.warm * 6, br = t.bright * 6;
        return `rgb(${base[0] + br + w | 0},${base[1] + br + w * 0.35 | 0},${base[2] + br - w * 0.8 | 0})`;
      };
      faceRadius = (g) => g.T * 0.055;
      SHEEN = null;
    }
  });

  // js/frieze.js
  function drawFrieze(g, P, L, era, pitch = 96) {
    if (L.mode !== "wide") return;
    const y0 = L.base.y - 4, y1 = L.yMax + 8, x0 = L.desk.leftFront - 46, X1 = L.xMax + 8;
    P.fill(WHITE, R(L.xMin - 8, L.base.y - 1, x0 - L.xMin + 8, y1 - L.base.y + 2));
    P.fill(WHITE, R(x0, y0, X1 - x0, y1 - y0));
    const h = 1e3 - y0, ruleA = y0 + 7, ruleB = y0 + h - 9, midY = (ruleA + ruleB) / 2, amp = (ruleB - ruleA) * 0.26;
    P.fill(PALE, R(x0, y0, X1 - x0, 5));
    P.ink(LN([[x0, ruleA], [X1, ruleA]]), 2.4, DARK);
    P.ink(LN([[x0, ruleA + 4], [X1, ruleA + 4]]), 0.9, DARK);
    P.ink(LN([[x0, ruleB], [X1, ruleB]]), 2.4, DARK);
    P.ink(LN([[x0, ruleB - 4], [X1, ruleB - 4]]), 0.9, DARK);
    const first = L.xMax - Math.ceil((L.xMax - x0) / pitch) * pitch;
    for (let tx = first; tx < X1; tx += pitch) {
      if (tx + pitch < x0) continue;
      const pts = [];
      for (let k = 0; k <= 12; k++) {
        const u = k / 12;
        pts.push([tx + u * pitch, midY + Math.sin(u * TAU) * amp]);
      }
      P.ink(CURVE(pts), 2, DARK);
      for (const [u, side] of [[0.12, -1], [0.38, 1], [0.62, -1], [0.88, 1]]) {
        const x = tx + u * pitch, y = midY + Math.sin(u * TAU) * amp, a = side * 0.9 + (u > 0.5 ? 0.3 : -0.3);
        P.at(x, y, a, 1, (p) => {
          const leaf = (c) => {
            c.moveTo(0, 0);
            c.quadraticCurveTo(8, -side * 9, 20, -side * 2);
            c.quadraticCurveTo(9, side * 4, 0, 0);
          };
          p.paint(u < 0.5 ? MID : PALE, leaf);
          p.ink(leaf, 1.3, DARK);
          p.ink(LN([[2, 0], [15, -side * 2.5]]), 0.8, DEEP);
        });
      }
      const cx = tx + pitch / 2, cy = midY;
      for (let k = 0; k < 6; k++) {
        const a = k / 6 * TAU;
        P.at(cx, cy, a, 1, (p) => {
          const pet = (c) => {
            c.moveTo(0, 0);
            c.quadraticCurveTo(4, -3.6, 9.5, 0);
            c.quadraticCurveTo(4, 3.6, 0, 0);
          };
          p.paint(DEEP, pet);
          p.ink(pet, 0.9, DARK);
        });
      }
      P.paint(OCHRE, EL(cx, cy, 3.6, 3.6));
      P.ink(EL(cx, cy, 3.6, 3.6), 1, DARK);
      P.fill(OCHRE_PALE, EL(cx - 0.8, cy - 0.8, 1.4, 1.4));
      P.fill(DEEP, EL(tx, ruleA + 9, 2.2, 2.2));
      P.fill(DEEP, EL(tx, ruleB - 9, 2.2, 2.2));
    }
    const d = L.desk, legX = d.leftFront + 14;
    P.within(R(L.xMin, y0, L.xMax - L.xMin + 10, y1 - y0), (p) => {
      p.shape(R(legX, d.frontY + d.faceH - 2, d.legW, L.base.y + L.base.h - d.frontY - d.faceH + 10), PAL.oakShade, LW);
      p.fill(PAL.oakDeep, R(legX + d.legW - 7, d.frontY + d.faceH, 7, L.base.y + L.base.h - d.frontY - d.faceH + 8));
    });
  }
  var PALE, MID, DEEP, DARK, OCHRE, OCHRE_PALE, WHITE;
  var init_frieze = __esm({
    "js/frieze.js"() {
      init_core();
      init_ink();
      PALE = "#a9a9a9";
      MID = "#7b7b7b";
      DEEP = "#565656";
      DARK = "#1f1f1f";
      OCHRE = "#b47c06";
      OCHRE_PALE = "#e2a52a";
      WHITE = "#ffffff";
    }
  });

  // js/constants.js
  var WIDE_QUERY, LANE_PX;
  var init_constants = __esm({
    "js/constants.js"() {
      WIDE_QUERY = "(min-aspect-ratio: 29/20) and (min-width: 1000px)";
      LANE_PX = 520;
    }
  });

  // js/stage.js
  var stage_exports = {};
  __export(stage_exports, {
    ERAS: () => ERAS,
    PLACE_NAMES: () => PLACE_NAMES,
    createStage: () => createStage,
    layoutFor: () => layoutFor,
    paintStill: () => paintStill
  });
  function wideBase() {
    return {
      mode: "wide",
      objScale: 1,
      win: { x: 170, y: 118, w: 470, h: 482, f: 20, transom: 0.36, bar: 12 },
      sill: { y: 600, h: 20, over: 24 },
      shelf: { x: 690, y: 172, w: 290 },
      pin: { x: 700, y: 214, w: 278, h: 246 },
      desk: { backY: 668, frontY: 806, faceH: 34, leftBack: 34, leftFront: 4, legW: 26 },
      base: { y: 952, h: 20 },
      lamp: { base: [92, 712], elbow: [42, 470], head: [196, 432], aim: [262, 736] },
      slots: { left: [238, 748], center: [440, 772], right: [652, 758], far: [858, 742] },
      floor: [872, 970],
      chair: { x: 214, top: 772, floor: 986 },
      socket: [640, 900]
    };
  }
  function tallBase() {
    return {
      mode: "tall",
      objScale: 1,
      win: { x: 252, y: 36, w: 428, h: 418, f: 18, transom: 0.36, bar: 11 },
      sill: { y: 454, h: 18, over: 16 },
      shelf: { x: 18, y: 66, w: 206 },
      pin: { x: 22, y: 106, w: 202, h: 236 },
      desk: { backY: 526, frontY: 652, faceH: 30, leftBack: -40, leftFront: -60, legW: 22 },
      base: { y: 806, h: 18 },
      lamp: { base: [74, 566], elbow: [30, 372], head: [142, 338], aim: [196, 606] },
      slots: { left: [150, 606], center: [338, 628], right: [488, 616], far: [646, 604] },
      floor: null,
      chair: null,
      socket: null
    };
  }
  function layoutFor(mode, w, h) {
    if (mode === "wide") {
      const art = Math.min(h, w - LANE_PX), u2 = Math.max(art, 200) / 1e3;
      return { ...wideBase(), u: u2, xMin: 1e3 - w / u2, xMax: 1e3, yMin: 1e3 - h / u2, yMax: 1e3 };
    }
    const u = Math.min(w / 700, h / 790);
    return { ...tallBase(), u, xMin: 350 - w / u / 2, xMax: 350 + w / u / 2, yMin: 742 - h / u, yMax: 742 };
  }
  function eraLight(era, L, hour) {
    const o = openingOf(L), H = 1e3 * o.h / o.w;
    if (era === "now") {
      const date = sceneDate(hour), st = skyState(date);
      const ax = (az) => (az - 55) / 70 * 1e3, ey = (el) => H * 0.44 - el / 30 * H * 0.44;
      const sunUp = st.sun.el > -1 && st.sun.az > 50 && st.sun.az < 130;
      const moonUp = st.moon.el > 0 && st.moon.az > 45 && st.moon.az < 135 && st.night > 0.2;
      return {
        key: "now",
        label: clockLabel(date),
        sky: { ...st, sunUp, sunX: ax(st.sun.az), sunY: ey(st.sun.el), moonUp, moonX: ax(st.moon.az), moonY: ey(st.moon.el) },
        night: st.night,
        lamp: st.lamp,
        warm: st.golden
      };
    }
    if (era === "sd") return { key: "sd", label: "a clear morning", sky: { day: 1, golden: 0, night: 0, twilight: 0, stars: 0 }, night: 0, lamp: 0, warm: 0 };
    if (era === "blr") return { key: "blr", label: "late afternoon, before the rain", sky: { day: 0.7, golden: 0.55, night: 0, twilight: 0, stars: 0 }, night: 0, lamp: 0, warm: 0.5 };
    return { key: "nitk", label: "after dark, by the sea", sky: { day: 0, golden: 0, night: 0.78, twilight: 0.35, stars: 0.9, moonUp: true, moon: { phase: 0.3 }, moonX: 760, moonY: H * 0.16 }, night: 0.8, lamp: 1, warm: 0 };
  }
  async function paintEra(st, era, alive) {
    const t0 = performance.now();
    const { L, px, W, H, dpr } = st, o = openingOf(L), light = eraLight(era, L, st.hour), VH = 1e3 * o.h / o.w;
    const wash = makeCanvas(W, H), line = makeCanvas(W, H);
    const g = new GlazeCtx(wash.getContext("2d"), line.getContext("2d"), { accents: false, cuts: VIEW_CUTS });
    g.skyStrokes = true;
    g.setTransform(px, 0, 0, px, -L.xMin * px, -L.yMin * px);
    g.save();
    g.beginPath();
    g.rect(o.x, o.y, o.w, o.h);
    g.clip();
    g.translate(o.x, o.y);
    g.scale(o.w / 1e3, o.w / 1e3);
    setViewLight(light.sky);
    const vp = new Pen(g, px * o.w / 1e3);
    vp.pool = 0;
    VIEWS[era](vp, VH, light.sky);
    if (VIEW_LIVE[era]) VIEW_LIVE[era](g, VH, era === "nitk" ? 1.05 : 2.2, light.sky);
    g.restore();
    if (!alive()) return null;
    await tick();
    g.accents = true;
    g.cuts = CUTS;
    g.skyStrokes = false;
    const pen = new Pen(g, px);
    pen.pool = 0;
    drawRoom(pen, L);
    drawFrieze(g, pen, L, era);
    if (!alive()) return null;
    await tick();
    const objs = eraObjects(era, L, {});
    const prints = [];
    let n = 0;
    for (const ob of objs) {
      if (++n % 4 === 0) {
        await tick();
        if (!alive()) return null;
      }
      if (ob.photo) {
        prints.push(ob.id);
        continue;
      }
      g.accents = !PLAIN_BLUE.has(ob.id);
      ob.draw(pen);
    }
    g.accents = true;
    if (!alive()) return null;
    await tick();
    const painted = await finishPainting(wash, line, dpr, alive);
    if (!painted || !alive()) return null;
    await tick();
    await tick();
    if (!alive()) return null;
    const fired = fire(st.wall, painted);
    const photoLayer = makeCanvas(W, H), pc = photoLayer.getContext("2d");
    pc.setTransform(px, 0, 0, px, -L.xMin * px, -L.yMin * px);
    const realPen = new Pen(pc, px);
    for (const ob of eraObjects(era, L, st.photos)) if (ob.photo) ob.draw(realPen);
    const fp = fingerprint(st, painted);
    (window.__tileTimings = window.__tileTimings || {})[era] = Math.round(performance.now() - t0);
    return { light, fired, photoLayer, fp };
  }
  function fingerprint(st, painted) {
    const g = st.grid, s = 4, cw = g.cols * s, ch = g.rows * s;
    const c = makeCanvas(cw, ch), x = c.getContext("2d", { willReadFrequently: true });
    const ox = g.tiles[0].x, oy = g.tiles[0].y;
    x.drawImage(painted, ox, oy, g.cols * g.T, g.rows * g.T, 0, 0, cw, ch);
    return { data: x.getImageData(0, 0, cw, ch).data, cw, s };
  }
  function changedTiles(st, A, B) {
    const key = A + ">" + B;
    if (st.changed[key]) return st.changed[key];
    const EA = st.eras[A], EB = st.eras[B], g = st.grid, out = /* @__PURE__ */ new Map();
    if (!EA || !EB) return null;
    const { s, cw } = EA.fp, a = EA.fp.data, b = EB.fp.data;
    const list = [];
    for (const t of g.tiles) {
      let d = 0;
      for (let yy = 0; yy < s; yy++) for (let xx = 0; xx < s; xx++) {
        const i = ((t.r * s + yy) * cw + t.c * s + xx) * 4;
        d += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]);
      }
      if (d / (s * s) > 9) list.push(t);
    }
    const rnd = mulberry32(17);
    const ws = list.map((t) => (1 - t.cx / g.W) * 0.78 + t.cy / g.H * 0.22);
    const lo = Math.min(...ws), hi = Math.max(...ws);
    list.forEach((t, k) => out.set(t, 0.05 + 0.7 * ((ws[k] - lo) / Math.max(1e-6, hi - lo)) + (rnd() - 0.5) * 0.05));
    st.changed[key] = out;
    return out;
  }
  function render(st) {
    const c = st.ctx;
    if (!c) return;
    const pos = clamp(st.pos, 0, 3), i = Math.min(2, Math.floor(pos)), tau = pos >= 3 ? 1 : pos - i;
    const A = ERAS[pos >= 3 ? 3 : i], B = ERAS[Math.min(3, i + 1)];
    const EA = st.eras[A], EB = st.eras[B];
    const inT = tau > 0 && tau < 1 && pos < 3 && !!EB;
    c.setTransform(1, 0, 0, 1, 0, 0);
    if (!EA) {
      c.fillStyle = "#f4f0e5";
      c.fillRect(0, 0, st.W, st.H);
      return;
    }
    c.drawImage(EA.fired, 0, 0);
    let turning = null;
    if (inT) {
      const map = changedTiles(st, A, B);
      turning = /* @__PURE__ */ new Set();
      if (map) for (const [t, d] of map) {
        const p = clamp((tau - d) / FLIP);
        if (p <= 0) continue;
        turning.add(t);
        drawFlip(c, st.grid, t, EA.fired, EB.fired, easeIO(p));
      }
    }
    const lt = inT ? easeIO(tau) : 0, la = EA.light, lb = inT ? EB.light : null;
    const night = lb ? lerp(la.night, lb.night, lt) : la.night, lamp = lb ? lerp(la.lamp, lb.lamp, lt) : la.lamp;
    if (!inT) c.drawImage(EA.photoLayer, 0, 0);
    else {
      const aOut = 1 - clamp(tau / 0.2), aIn = clamp((tau - 0.8) / 0.2);
      if (aOut > 0) {
        c.save();
        c.globalAlpha = aOut;
        c.drawImage(EA.photoLayer, 0, -(1 - aOut) * 18 * st.dpr);
        c.restore();
      }
      if (aIn > 0) {
        c.save();
        c.globalAlpha = aIn;
        c.drawImage(EB.photoLayer, 0, -(1 - aIn) * 18 * st.dpr);
        c.restore();
      }
    }
    drawSheen(c, st.grid, st.sheen[0], st.sheen[1], 0.34 * (1 - 0.85 * night), turning ? (t) => turning.has(t) : null);
    if (night > 0.02) {
      c.save();
      c.globalCompositeOperation = "multiply";
      const dim = css(mix("#ffffff", "#b6bacd", night)), lane2 = css(mix("#ffffff", "#e4e2dc", night));
      if (st.L.mode === "wide") {
        const lr = Math.min(st.W * 0.42, 600 * st.dpr), gr = c.createLinearGradient(lr * 0.9, 0, lr * 1.35, 0);
        gr.addColorStop(0, lane2);
        gr.addColorStop(1, dim);
        c.fillStyle = gr;
      } else c.fillStyle = dim;
      c.fillRect(0, 0, st.W, st.H);
      c.restore();
    }
    if (lamp > 0.02) {
      const L = st.L, px = st.px, [ax, ay] = L.lamp.aim, [hx, hy] = L.lamp.head;
      const X = (v) => (v - L.xMin) * px, Y = (v) => (v - L.yMin) * px;
      c.save();
      c.globalCompositeOperation = "multiply";
      c.globalAlpha = lamp * 0.75;
      c.save();
      c.translate(X(ax), Y(ay));
      c.scale(1, 0.5);
      let wg = c.createRadialGradient(0, 0, 4 * px, 0, 0, 340 * px);
      wg.addColorStop(0, "#ffd59a");
      wg.addColorStop(0.45, "#ffe6c4");
      wg.addColorStop(1, "#ffffff");
      c.fillStyle = wg;
      c.fillRect(-350 * px, -350 * px, 700 * px, 700 * px);
      c.restore();
      wg = c.createRadialGradient(X(hx), Y(hy), 4 * px, X(hx), Y(hy), 380 * px);
      wg.addColorStop(0, "#ffdcae");
      wg.addColorStop(1, "#ffffff");
      c.fillStyle = wg;
      c.fillRect(X(hx - 390), Y(hy - 390), 780 * px, 780 * px);
      c.restore();
      c.save();
      c.globalCompositeOperation = "screen";
      c.globalAlpha = lamp * 0.7;
      c.save();
      c.translate(X(ax), Y(ay));
      c.scale(1, 0.45);
      let gr = c.createRadialGradient(0, 0, 6 * px, 0, 0, 300 * px);
      gr.addColorStop(0, "rgba(255,200,130,.62)");
      gr.addColorStop(0.4, "rgba(255,186,116,.26)");
      gr.addColorStop(1, "rgba(255,186,116,0)");
      c.fillStyle = gr;
      c.fillRect(-310 * px, -310 * px, 620 * px, 620 * px);
      c.restore();
      gr = c.createRadialGradient(X(hx), Y(hy), 4 * px, X(hx), Y(hy), 470 * px);
      gr.addColorStop(0, "rgba(255,212,150,.42)");
      gr.addColorStop(0.35, "rgba(255,190,130,.12)");
      gr.addColorStop(1, "rgba(255,190,130,0)");
      c.fillStyle = gr;
      c.fillRect(X(hx - 480), Y(hy - 480), 960 * px, 960 * px);
      c.restore();
    }
  }
  function scrollPos(st) {
    const tall = st.L && st.L.mode === "tall", vh = window.innerHeight;
    const ref = window.scrollY + vh * (tall ? 0.78 : 0.52), span = vh * (tall ? 0.3 : 0.42);
    const tops = st.sections.map((s) => s.getBoundingClientRect().top + window.scrollY);
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
  }
  function loadPhotos(urls) {
    const out = {};
    return Promise.all(Object.entries(urls).map(([k, src]) => new Promise((res) => {
      const im = new Image();
      im.decoding = "async";
      im.onload = im.onerror = () => res();
      im.src = src;
      out[k] = im;
    }))).then(() => out);
  }
  function prepare(st, mode, w, h, dpr) {
    st.L = layoutFor(mode, w, h);
    st.dpr = dpr;
    st.px = st.L.u * dpr;
    st.W = Math.round(w * dpr);
    st.H = Math.round(h * dpr);
    st.canvas.width = st.W;
    st.canvas.height = st.H;
    st.ctx = st.canvas.getContext("2d");
    const laneRight = mode === "wide" ? Math.min(w, 600) * dpr : 0;
    st.grid = makeTiles(st.W, st.H, 96 * st.px, 5, (t) => t.cx < laneRight);
    st.wall = prepareWall(st.grid, dpr);
    st.eras = {};
    st.changed = {};
  }
  async function createStage({ canvas, stageEl, sections, photos, hooks = {}, onChange, onReady }) {
    const st = { canvas, sections, eras: {}, changed: {}, pos: 0, hour: hooks.hour, photos: {}, sheen: [0, 0] };
    let disposed = false, raf = 0, visible = true, building = 0, resizeTimer = 0, lastCaption = "", lastKey = "";
    const pointer = [0, 0];
    const wideMq = window.matchMedia(WIDE_QUERY);
    st.photos = await loadPhotos(photos);
    const caption = () => {
      const k = ERAS[Math.min(3, Math.round(st.pos))], E = st.eras[k];
      if (!E) return;
      const txt = k === "now" ? `${PLACE_NAMES[k]} \xB7 ${E.light.label}` : PLACE_NAMES[k];
      if (txt !== lastCaption) {
        lastCaption = txt;
        onChange?.({ place: PLACE_NAMES[k], label: E.light.label, text: txt, pos: st.pos });
      }
    };
    const frame = () => {
      raf = 0;
      if (disposed || document.hidden || !st.ready) return;
      st.pos = hooks.pos != null ? hooks.pos : scrollPos(st);
      const s = window.scrollY / Math.max(1, window.innerHeight);
      st.sheen = [Math.sin(s * 1.1) * 0.32 + pointer[0] * 0.35, Math.cos(s * 0.8) * 0.14 + pointer[1] * 0.2];
      if (hooks.t != null) st.sheen = [Math.sin(hooks.t * 0.7) * 0.3, 0.05];
      const key = st.pos.toFixed(4) + "|" + st.sheen[0].toFixed(3) + "|" + st.sheen[1].toFixed(3) + "|" + Object.keys(st.eras).length;
      if (key !== lastKey) {
        render(st);
        lastKey = key;
        caption();
      }
    };
    const kick = () => {
      if (!raf && st.ready && !disposed && !document.hidden && visible) raf = requestAnimationFrame(frame);
    };
    const build = async () => {
      const id = ++building;
      const r = stageEl.getBoundingClientRect(), mode = wideMq.matches ? "wide" : "tall";
      const w = Math.round(r.width), h = Math.round(r.height), dpr = Math.min(2, window.devicePixelRatio || 1);
      if (!w || !h) return;
      const alive = () => !disposed && id === building;
      st.ready = false;
      prepare(st, mode, w, h, dpr);
      await tick();
      if (!alive()) return;
      const first = hooks.era && ERAS.includes(hooks.era) ? hooks.era : hooks.pos != null ? ERAS[Math.min(3, Math.floor(hooks.pos))] : ERAS[Math.min(3, Math.round(scrollPos(st)))];
      const order = [first, ...ERAS.filter((e) => e !== first)];
      if (hooks.pos != null && hooks.pos % 1 > 0) {
        const nx = ERAS[Math.min(3, Math.floor(hooks.pos) + 1)];
        order.splice(order.indexOf(nx), 1);
        order.splice(1, 0, nx);
      }
      const E0 = await paintEra(st, order[0], alive);
      if (!alive() || !E0) return;
      st.eras[order[0]] = E0;
      if (hooks.pos != null && hooks.pos % 1 > 0) {
        const E1 = await paintEra(st, order[1], alive);
        if (!alive() || !E1) return;
        st.eras[order[1]] = E1;
      }
      st.ready = true;
      lastKey = "";
      frame();
      onReady?.();
      const idle = () => new Promise((res) => window.requestIdleCallback ? window.requestIdleCallback(() => res(), { timeout: 700 }) : setTimeout(res, 60));
      for (const e of order) {
        if (st.eras[e]) continue;
        if (hooks.t == null) await idle();
        if (!alive()) return;
        const E = await paintEra(st, e, alive);
        if (!alive() || !E) return;
        st.eras[e] = E;
        lastKey = "";
        kick();
      }
      if (hooks.t != null) {
        lastKey = "";
        frame();
      }
    };
    const onScroll = () => kick();
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!disposed) build();
      }, 220);
    };
    const onVisibility = () => {
      if (!document.hidden) kick();
    };
    const onPointer = (e) => {
      if (e.pointerType !== "mouse") return;
      pointer[0] = e.clientX / window.innerWidth - 0.5;
      pointer[1] = e.clientY / window.innerHeight - 0.5;
      kick();
    };
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) kick();
    });
    io.observe(stageEl);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    wideMq.addEventListener?.("change", onResize);
    await build();
    return {
      destroy() {
        disposed = true;
        cancelAnimationFrame(raf);
        clearTimeout(resizeTimer);
        io.disconnect();
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("pointermove", onPointer);
        document.removeEventListener("visibilitychange", onVisibility);
        wideMq.removeEventListener?.("change", onResize);
        st.eras = {};
      }
    };
  }
  async function paintStill({ canvas, width, height, dpr = 1, era = "now", hour, photos }) {
    const st = { canvas, sections: [], eras: {}, changed: {}, pos: ERAS.indexOf(era), hour, photos: await loadPhotos(photos), sheen: [0.1, 0.05] };
    prepare(st, "tall", width, height, dpr);
    const E = await paintEra(st, era, () => true);
    st.eras[era] = E;
    st.ready = true;
    render(st);
  }
  var ERAS, PLACE_NAMES, tick, PLAIN_BLUE, easeIO, FLIP;
  var init_stage = __esm({
    "js/stage.js"() {
      init_core();
      init_ink();
      init_room();
      init_views();
      init_objects();
      init_glaze();
      init_frieze();
      init_constants();
      ERAS = ["now", "sd", "blr", "nitk"];
      PLACE_NAMES = { now: "San Jose", sd: "San Diego", blr: "Bengaluru", nitk: "Surathkal" };
      tick = () => new Promise((res) => setTimeout(res, 0));
      PLAIN_BLUE = /* @__PURE__ */ new Set(["monitor", "layout", "laptop-screen", "zine", "chip", "note", "papers", "starmap", "schematic", "planisphere", "breadboard"]);
      easeIO = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      FLIP = 0.17;
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
          "alt": "San and his collaborator receiving a research award.",
          "caption": "Receiving the research award"
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
      "description": "Joined eBay\u2019s Knowledge Extraction team in April 2024. Researching and building language-model systems for information extraction. Promoted in October 2025.",
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
      "description": "Completed an MS in computer science at UC San Diego. Worked with Julian McAuley\u2019s group on AI music and language models, and TA\u2019d recommender systems and data mining.",
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
      "description": "ZINify received an Honorable Mention at the UIST Student Innovation Contest. Experiments with language models and visual storytelling.",
      "id": "zinify",
      "month": "October",
      "location": "San Francisco, CA",
      "category": "Research",
      "images": [
        {
          "src": "/images/history/uist-award.webp",
          "alt": "San and his collaborator holding the UIST 2023 award.",
          "caption": "ZINify at UIST 2023"
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
      "description": "I co-founded Glyp, a writing assistant for novelists, and took it through UCSD\u2019s StartR Rady accelerator. It did not make it to market; I wrote about what went wrong.",
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
      "description": "Summer research with eBay\u2019s Knowledge Extraction team, working on information extraction at scale.",
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
      "description": "Won the eBay University Machine Learning Challenge by extracting named entities from product titles using DeBERTa V3 and K-fold ensembling. The result, announced in January 2023, led to the summer research internship.",
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
      "description": "Started the MS at UC San Diego after three years in chip design.",
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
      "description": "ASIC digital design at Texas Instruments, 2019\u20132022: physical design, RTL, and getting actual chips out of the door.",
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
      "description": "Graduated in electrical and electronics engineering. I got into deep learning through Kaggle, earning silver and bronze medals. My thesis on power-quality classification won a best-paper award at IEEE DISCOVER; the Amateur Astronomy Club gave me a place to explore space and astronomy.",
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
    {
      key: "now",
      place: "San Jose",
      years: "2024 \u2013 now",
      role: "AI research at eBay",
      ids: ["eai-challenge", "ebay-research"],
      alt: "San\u2019s desk in San Jose, painted in cobalt on glazed tiles: a window onto the valley and Mt Hamilton with the Lick Observatory domes, a laptop, a small paper robot and a telescope on the desk, books on the shelf, and two photographs on the pinboard."
    },
    {
      key: "sd",
      place: "San Diego",
      years: "2022 \u2013 2024",
      role: "MS in computer science, UC San Diego",
      ids: ["ucsd-graduation", "zinify", "startr", "ebay-internship", "ebay-ml-challenge", "ucsd-start"],
      alt: "The same tiled desk in San Diego on a clear morning: the Geisel Library and eucalyptus through the window, papers, a zine and a laptop on the desk, four photographs on the pinboard."
    },
    {
      key: "blr",
      place: "Bengaluru",
      years: "2019 \u2013 2022",
      role: "Chip design at Texas Instruments",
      ids: ["texas-instruments"],
      alt: "The same tiled desk in Bengaluru, late afternoon before the rain: rooftops, coconut palms and a flame tree through the window, a monitor showing a chip layout, a loupe and a packaged chip, one photograph on the pinboard."
    },
    {
      key: "nitk",
      place: "Surathkal",
      years: "2015 \u2013 2019",
      role: "Electrical engineering at NIT Karnataka",
      ids: ["nitk"],
      alt: "The same tiled desk in Surathkal after dark: palms, the sea and the lighthouse through the window, an oscilloscope showing a square wave, a breadboard and a star chart, and the photograph from the NITK lab."
    }
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
  function lane(plain) {
    return ERA_LIST.map((era, index) => `<section class="ff-frame" data-frame="${era.key}" aria-labelledby="place-${era.key}">
    ${index === 0 ? `<div class="ff-intro">
      <h1>Hi, I\u2019m San.</h1>
      <p class="ff-lede">I work on language models at eBay. Before that: computer science at UC San Diego, chip design at Texas Instruments, and electrical engineering at NIT Karnataka. Along the way I co-founded <a href="${SITE}/notes/startr-postmortem">a startup that didn\u2019t make it</a>. I also write, make things, and sometimes turn an idea into a film.</p>
      <p class="ff-more"><a href="${SITE}/about">More about me</a><span class="ff-mail">san@sankala.me</span>${plain ? '<a href="?">Living version</a>' : '<a href="?plain=1">Plain version</a>'}</p>
      <p class="ff-cue">The desk is painted in code on glazed tiles and keeps San Jose time. Scroll, and the tiles turn over to the places I\u2019ve lived and worked.<span class="ff-clock"></span></p>
      <h2 class="ff-path" id="history">My path so far</h2>
    </div>` : ""}
    <div class="ff-plain-still" data-still="${era.key}" role="img" aria-label="${esc(era.alt)}"></div>
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
    const plain = params.get("plain") === "1" || reduce;
    const root = document.querySelector(".four-frames");
    root.classList.toggle("is-plain", plain);
    const laneEl = root.querySelector(".ff-lane");
    laneEl.innerHTML = lane(plain);
    const sections = [...laneEl.querySelectorAll(".ff-frame")];
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
    const { createStage: createStage2, paintStill: paintStill2 } = await Promise.resolve().then(() => (init_stage(), stage_exports));
    if (plain) {
      for (const el of root.querySelectorAll(".ff-plain-still")) {
        const cv = document.createElement("canvas");
        el.appendChild(cv);
        const w = Math.min(760, el.getBoundingClientRect().width || 700), h = Math.round(w * 790 / 700);
        cv.style.width = w + "px";
        cv.style.height = h + "px";
        await paintStill2({ canvas: cv, width: w, height: h, dpr: Math.min(2, devicePixelRatio || 1), era: el.dataset.still, hour: num(params, "hour"), photos: PHOTOS });
      }
      window.__ready = true;
      return;
    }
    const hooks = { t: num(params, "t"), hour: num(params, "hour"), pos: num(params, "pos"), era: params.get("era") || void 0 };
    const cap = root.querySelector(".ff-caption"), clock = root.querySelector(".ff-clock");
    await createStage2({
      canvas: root.querySelector(".ff-canvas"),
      stageEl: root.querySelector(".ff-stage"),
      sections,
      photos: PHOTOS,
      hooks,
      onChange: (n) => {
        cap.textContent = n.text;
        if (n.place === "San Jose") clock.textContent = `It\u2019s ${n.label} in San Jose now.`;
      },
      onReady: () => {
        root.classList.add("is-live");
        if (hooks.era) {
          const i = ERA_LIST.findIndex((e) => e.key === hooks.era);
          if (i > 0) scrollTo(0, sections[i].getBoundingClientRect().top + scrollY - innerHeight * 0.2);
        }
        setTimeout(() => {
          window.__ready = true;
        }, hooks.t != null ? 60 : 0);
      }
    });
  }
  start();
})();
