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

  // js/constants.js
  var WIDE_QUERY, LANE_PX;
  var init_constants = __esm({
    "js/constants.js"() {
      WIDE_QUERY = "(min-aspect-ratio: 29/20) and (min-width: 1000px)";
      LANE_PX = 520;
    }
  });

  // js/layout.js
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
  function layoutFor(mode, w, h, bounds) {
    if (mode === "wide") {
      const art = Math.min(h, w - LANE_PX), u2 = Math.max(art, 200) / 1e3;
      return { ...wideBase(), u: u2, xMin: 1e3 - w / u2, xMax: 1e3, yMin: 1e3 - h / u2, yMax: 1e3, ...bounds };
    }
    const u = Math.min(w / 700, h / 790);
    return { ...tallBase(), u, xMin: 350 - w / u / 2, xMax: 350 + w / u / 2, yMin: 742 - h / u, yMax: 742, ...bounds };
  }
  var ERAS, PLACE_NAMES;
  var init_layout = __esm({
    "js/layout.js"() {
      init_constants();
      ERAS = ["now", "sd", "blr", "nitk"];
      PLACE_NAMES = { now: "San Jose", sd: "San Diego", blr: "Bengaluru", nitk: "Surathkal" };
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
  function drawCloudSpec(P, s, dx = 0) {
    const keep = CLOUDS.capture;
    CLOUDS.capture = false;
    if (s.kind === "big") bigCloud(P, s.cx + dx, s.cy, s.w, s.h, s.seed);
    else cloud(P, s.cx + dx, s.cy, s.w, s.h, s.seed, s.lw);
    CLOUDS.capture = keep;
  }
  function cloud(P, cx, cy, w, h, seed, lw = LW_IN) {
    if (CLOUDS.capture) {
      CLOUDS.list.push({ kind: "cum", cx, cy, w, h, seed, lw });
      return;
    }
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
  function bigCloud(P, cx, cy, w, h, seed) {
    if (CLOUDS.capture) {
      CLOUDS.list.push({ kind: "big", cx, cy, w, h, seed });
      return;
    }
    const f = SCALLOP(bumpRing(cx, cy, w / 2, h / 2, 14, seed, 0.22, true), 0.45);
    P.paint("#fffaf0", f);
    P.within(f, (p) => {
      p.fill("#b3bccd", BLOB([[cx - w * 0.7, cy + h * 0.22], [cx - w * 0.35, cy + h * 0.1], [cx, cy + h * 0.2], [cx + w * 0.35, cy + h * 0.08], [cx + w * 0.7, cy + h * 0.18], [cx + w * 0.7, cy + h], [cx - w * 0.7, cy + h]]));
      p.fill("#98a3b9", R(cx - w, cy + h * 0.4, w * 2, h));
      p.fill("#ffe2b8", BLOB([[cx - w * 0.55, cy - h * 0.2], [cx - w * 0.3, cy - h * 0.5], [cx - w * 0.05, cy - h * 0.55], [cx - w * 0.2, cy - h * 0.25]]));
    });
    P.ink(f, LW_IN, inkL());
  }
  function viewBengaluru(P, H, sky) {
    drawSky(P, H, sky, { horizon: 0.56, top: "#4f78ad", mid: "#93b6d8", low: "#f3c78e", topGold: "#4a72a8", midGold: "#98b6d2", lowGold: "#f4c487" });
    bigCloud(P, 300, H * 0.2, 460, 230, 41);
    bigCloud(P, 790, H * 0.14, 360, 170, 42);
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
  var LW_FAR, LIGHT, inkL, CLOUDS, VIEWS;
  var init_views = __esm({
    "js/views.js"() {
      init_core();
      init_ink();
      LW_FAR = 0.65;
      LIGHT = { day: 1, golden: 0, night: 0, twilight: 0 };
      inkL = (a = 1) => lc(`rgba(40,34,30,${a})`, `rgba(40,34,30,${a})`, `rgba(14,16,34,${a})`);
      CLOUDS = { capture: false, list: [] };
      VIEWS = { now: viewSanJose, sd: viewSanDiego, blr: viewBengaluru, nitk: viewSurathkal };
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
      { id: "p-award", exit: "board", enter: "board", draw: P0("neurips-award", 0.34, 0.33, 0.5, -0.05, { pin: "#d6453a", ratio: 0.75 }) },
      { id: "p-ebay", exit: "board", enter: "board", draw: P0("ebay-headquarters", 0.77, 0.46, 0.28, 0.06, { tape: true, ratio: 1.331 }) },
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
      { id: "p-library", exit: "board", enter: "board", draw: P0("ucsd-library", 0.34, 0.2, 0.56, -0.03, { pin: "#2f55b8", ratio: 0.471 }) },
      { id: "p-group", exit: "board", enter: "board", draw: P0("research-group", 0.36, 0.6, 0.6, 0.035, { tape: true, ratio: 0.468 }) },
      { id: "p-uist", exit: "board", enter: "board", draw: P0("uist-award", 0.82, 0.3, 0.22, -0.06, { pin: "#d6453a", ratio: 1.334 }) },
      { id: "p-intern", exit: "board", enter: "board", draw: P0("ebay-intern", 0.8, 0.72, 0.22, 0.05, { pin: "#e0b53a", ratio: 1.331 }) },
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
      { id: "p-ti", exit: "board", enter: "board", draw: P0("ti-bengaluru", 0.32, 0.38, 0.44, -0.04, { pin: "#2f55b8", ratio: 0.932 }) },
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
      { id: "p-lab", exit: "board", enter: "board", draw: P0("nitk-lab", 0.36, 0.32, 0.54, -0.04, { pin: "#d6453a", ratio: 0.749 }) },
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

  // js/paths.js
  function contours(F, W, H, level, mask) {
    const segs = [], key = (x, y, vert) => (vert ? W * H : 0) + y * W + x;
    const P = /* @__PURE__ */ new Map();
    const pt = (x, y, vert) => {
      const k = key(x, y, vert);
      let p = P.get(k);
      if (!p) {
        if (!vert) {
          const a = F[y * W + x], b = F[y * W + x + 1], t = (level - a) / (b - a);
          p = [x + t, y];
        } else {
          const a = F[y * W + x], b = F[(y + 1) * W + x], t = (level - a) / (b - a);
          p = [x, y + t];
        }
        P.set(k, p);
      }
      return k;
    };
    for (let y = 0; y < H - 1; y++) for (let x = 0; x < W - 1; x++) {
      if (mask && !mask[y * W + x]) continue;
      const i = y * W + x, a = F[i] > level, b = F[i + 1] > level, c = F[i + W + 1] > level, d = F[i + W] > level;
      const cs = (a ? 8 : 0) | (b ? 4 : 0) | (c ? 2 : 0) | (d ? 1 : 0);
      if (cs === 0 || cs === 15) continue;
      const T = () => pt(x, y, false), R2 = () => pt(x + 1, y, true), Bm = () => pt(x, y + 1, false), Lf = () => pt(x, y, true);
      switch (cs) {
        case 1:
        case 14:
          segs.push([Lf(), Bm()]);
          break;
        case 2:
        case 13:
          segs.push([Bm(), R2()]);
          break;
        case 3:
        case 12:
          segs.push([Lf(), R2()]);
          break;
        case 4:
        case 11:
          segs.push([T(), R2()]);
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
            segs.push([Bm(), R2()]);
          } else {
            segs.push([Lf(), Bm()]);
            segs.push([T(), R2()]);
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
      lines.push(chain.map((k) => P.get(k)));
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
  var Flatten;
  var init_paths = __esm({
    "js/paths.js"() {
      Flatten = class {
        constructor(M, tol = 0.9) {
          this.M = M;
          this.out = [];
          this.cur = null;
          this.x = 0;
          this.y = 0;
          this.sx = 0;
          this.sy = 0;
          this.tol = tol;
        }
        map(x, y) {
          const M = this.M;
          return [M.a * x + M.c * y + M.e, M.b * x + M.d * y + M.f];
        }
        start(x, y) {
          this.end();
          this.cur = [this.map(x, y)];
          this.x = this.sx = x;
          this.y = this.sy = y;
        }
        to(x, y) {
          if (!this.cur) this.start(this.x, this.y);
          this.cur.push(this.map(x, y));
          this.x = x;
          this.y = y;
        }
        end() {
          if (this.cur && this.cur.length > 1) this.out.push(this.cur);
          this.cur = null;
        }
        steps(len) {
          const sc = Math.hypot(this.M.a, this.M.b);
          return Math.max(4, Math.min(64, Math.ceil(len * sc / 3)));
        }
        moveTo(x, y) {
          this.start(x, y);
        }
        lineTo(x, y) {
          this.to(x, y);
        }
        closePath() {
          if (this.cur) {
            this.to(this.sx, this.sy);
            this.end();
          }
          this.x = this.sx;
          this.y = this.sy;
        }
        bezierCurveTo(a, b, c, d, x, y) {
          const x0 = this.x, y0 = this.y, n = this.steps(Math.hypot(a - x0, b - y0) + Math.hypot(c - a, d - b) + Math.hypot(x - c, y - d));
          for (let i = 1; i <= n; i++) {
            const t = i / n, u = 1 - t;
            this.to(u * u * u * x0 + 3 * u * u * t * a + 3 * u * t * t * c + t * t * t * x, u * u * u * y0 + 3 * u * u * t * b + 3 * u * t * t * d + t * t * t * y);
          }
        }
        quadraticCurveTo(a, b, x, y) {
          const x0 = this.x, y0 = this.y, n = this.steps(Math.hypot(a - x0, b - y0) + Math.hypot(x - a, y - b));
          for (let i = 1; i <= n; i++) {
            const t = i / n, u = 1 - t;
            this.to(u * u * x0 + 2 * u * t * a + t * t * x, u * u * y0 + 2 * u * t * b + t * t * y);
          }
        }
        ellipse(cx, cy, rx, ry, rot, a0, a1, ccw) {
          let span = a1 - a0;
          if (ccw) {
            if (span > 0) span -= Math.PI * 2;
          } else if (span < 0) span += Math.PI * 2;
          span = Math.max(-Math.PI * 2, Math.min(Math.PI * 2, span));
          const n = this.steps(Math.abs(span) * Math.max(rx, ry)), cr = Math.cos(rot || 0), sr = Math.sin(rot || 0);
          for (let i = 0; i <= n; i++) {
            const a = a0 + span * i / n, ex = Math.cos(a) * rx, ey = Math.sin(a) * ry, x = cx + ex * cr - ey * sr, y = cy + ex * sr + ey * cr;
            if (i === 0) {
              if (this.cur) this.to(x, y);
              else this.start(x, y);
            } else this.to(x, y);
          }
          if (Math.abs(span) >= Math.PI * 2 - 1e-3) this.end();
        }
        arc(cx, cy, r, a0, a1, ccw) {
          this.ellipse(cx, cy, r, r, 0, a0, a1, ccw);
        }
        arcTo(x1, y1) {
          this.to(x1, y1);
        }
        rect(x, y, w, h) {
          this.start(x, y);
          this.to(x + w, y);
          this.to(x + w, y + h);
          this.to(x, y + h);
          this.to(x, y);
          this.end();
        }
        roundRect(x, y, w, h) {
          this.rect(x, y, w, h);
        }
      };
    }
  });

  // js/mosaicpen.js
  function parseColor(col) {
    if (typeof col !== "string") return null;
    if (col[0] === "#") {
      const h = col.length === 4 ? col.slice(1).split("").map((x) => x + x).join("") : col.slice(1, 7);
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1];
    }
    const m = col.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const v = m[1].split(",").map(Number);
    return [v[0], v[1], v[2], v[3] ?? 1];
  }
  function makeProxy(pen) {
    const all = pen.all;
    const px = {};
    for (const op of PATH_OPS) px[op] = (...a) => {
      for (const c of all) c[op](...a);
    };
    for (const op of XFORM_OPS) px[op] = (...a) => {
      for (const c of all) c[op](...a);
    };
    px.beginPath = () => {
      for (const c of all) c.beginPath();
    };
    px.clip = (...a) => {
      for (const c of all) c.clip(...a);
    };
    px.fill = (...a) => pen.C.fill(...a);
    px.stroke = () => pen.C.stroke();
    px.fillRect = (...a) => pen.C.fillRect(...a);
    px.drawImage = (...a) => pen.C.drawImage(...a);
    px.createLinearGradient = (...a) => pen.C.createLinearGradient(...a);
    px.createRadialGradient = (...a) => pen.C.createRadialGradient(...a);
    for (const prop of ["fillStyle", "strokeStyle", "lineWidth", "lineCap", "lineJoin", "globalAlpha", "globalCompositeOperation", "filter", "font", "textAlign", "textBaseline"]) {
      Object.defineProperty(px, prop, { get: () => pen.C[prop], set: (v) => {
        pen.C[prop] = v;
      } });
    }
    px.fillText = (...a) => pen.C.fillText(...a);
    return px;
  }
  var lum, PATH_OPS, XFORM_OPS, CartoonPen, FootprintPen;
  var init_mosaicpen = __esm({
    "js/mosaicpen.js"() {
      init_ink();
      init_paths();
      lum = (c) => (c[0] * 0.299 + c[1] * 0.587 + c[2] * 0.114) / 255;
      PATH_OPS = ["moveTo", "lineTo", "bezierCurveTo", "quadraticCurveTo", "arc", "arcTo", "ellipse", "rect", "closePath", "roundRect"];
      XFORM_OPS = ["save", "restore", "translate", "rotate", "scale", "setTransform", "transform", "resetTransform"];
      CartoonPen = class {
        /** ctxs: { base, col, line } 2D contexts sharing one transform; px: sheet pixels per art unit */
        constructor(ctxs, px) {
          this.B = ctxs.base;
          this.C = ctxs.col;
          this.L = ctxs.line;
          this.px = px;
          this.pool = 0;
          this.all = [.../* @__PURE__ */ new Set([this.B, this.C, this.L])];
          this.c = makeProxy(this);
          this.lines = [];
          this.L.strokeStyle = "#fff";
          this.L.lineCap = "round";
          this.L.lineJoin = "round";
        }
        begin(fn) {
          for (const x of this.all) x.beginPath();
          fn(this.c);
          return this.c;
        }
        opaque(col) {
          if (this.C.globalAlpha < 0.85) return false;
          if (typeof col === "string") {
            const c = parseColor(col);
            return !!c && c[3] >= 0.85;
          }
          return !!(col && col.__opaque);
        }
        faint(col) {
          const ga = this.C.globalAlpha;
          if (typeof col === "string") {
            const c = parseColor(col);
            return !c || c[3] * ga < 0.12;
          }
          return !!(col && col.__faint) || ga < 0.12;
        }
        fill(col, fn, rule) {
          if (this.faint(col)) return this;
          this.begin(fn);
          this.C.fillStyle = col;
          this.C.fill(rule || "nonzero");
          if (this.opaque(col)) {
            this.B.fillStyle = col;
            this.B.fill(rule || "nonzero");
          }
          return this;
        }
        paint(col, fn, rule) {
          return this.fill(col, fn, rule);
        }
        ink(fn, w = 2.3, col = "#28221e") {
          const c = parseColor(col), a = (c ? c[3] : 1) * this.C.globalAlpha;
          if (!c) return this;
          if (lum(c) < 0.32 && a > 0.45 && w >= LW_IN * 0.95) {
            this.begin(fn);
            this.L.lineWidth = 1.25 / this.px;
            this.L.stroke();
            const f = new Flatten(this.L.getTransform());
            fn(f);
            f.end();
            for (const l of f.out) this.lines.push(l);
          } else if (lum(c) >= 0.32 && a > 0.6 && w >= 2) {
            this.begin(fn);
            for (const x of [this.C, this.B]) {
              x.lineWidth = w;
              x.strokeStyle = col;
              x.lineCap = "round";
              x.lineJoin = "round";
              x.stroke();
            }
          }
          return this;
        }
        shape(fn, col, w = 2.3, rule) {
          this.fill(col, fn, rule);
          if (w) this.ink(fn, w);
          return this;
        }
        within(clipFn, draw) {
          for (const x of this.all) x.save();
          this.begin(clipFn);
          for (const x of this.all) x.clip();
          draw(this);
          for (const x of this.all) x.restore();
          return this;
        }
        alpha(a, draw) {
          const g = this.C.globalAlpha;
          this.C.globalAlpha = g * a;
          draw(this);
          this.C.globalAlpha = g;
          return this;
        }
        at(x, y, rot, sc, draw) {
          for (const c of this.all) {
            c.save();
            c.translate(x, y);
            if (rot) c.rotate(rot);
            if (sc && sc !== 1) c.scale(sc, sc);
          }
          draw(this);
          for (const c of this.all) c.restore();
          return this;
        }
        grad(x0, y0, x1, y1, stops) {
          const g = this.C.createLinearGradient(x0, y0, x1, y1);
          let op = true;
          let mx = 0;
          stops.forEach(([t, col]) => {
            g.addColorStop(t, col);
            const c = parseColor(col);
            if (!c || c[3] < 0.85) op = false;
            if (c) mx = Math.max(mx, c[3]);
          });
          g.__opaque = op;
          g.__faint = mx < 0.2;
          return g;
        }
        rgrad(x, y, r0, r1, stops) {
          const g = this.C.createRadialGradient(x, y, r0, x, y, r1);
          let op = true;
          let mx = 0;
          stops.forEach(([t, col]) => {
            g.addColorStop(t, col);
            const c = parseColor(col);
            if (!c || c[3] < 0.85) op = false;
            if (c) mx = Math.max(mx, c[3]);
          });
          g.__opaque = op;
          g.__faint = mx < 0.2;
          return g;
        }
      };
      FootprintPen = class extends CartoonPen {
        // a footprint never copies the photograph itself (that would also taint the sheet for reading)
        constructor(ctxs, px) {
          super(ctxs, px);
          this.c.drawImage = () => {
          };
        }
        fill(col, fn, rule) {
          this.begin(fn);
          this.C.fillStyle = "#fff";
          this.C.fill(rule || "nonzero");
          return this;
        }
        ink() {
          return this;
        }
      };
    }
  });

  // js/palette.js
  function srgbToLin(c) {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
  function toLab(r, g, b) {
    const R2 = srgbToLin(r), G = srgbToLin(g), B = srgbToLin(b);
    let x = (R2 * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047, y = R2 * 0.2126 + G * 0.7152 + B * 0.0722, z = (R2 * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
    const f = (t) => t > 8856e-6 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
    x = f(x);
    y = f(y);
    z = f(z);
    return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
  }
  function labDist(i, j) {
    const a = PAL_LAB[i], b = PAL_LAB[j];
    return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  }
  function stoneRGB(idx, h) {
    const c = PAL_RGB[idx], v = 1 + (h - 0.5) * 0.1, j = (h * 7.31 % 1 - 0.5) * 8;
    return [Math.max(0, Math.min(255, c[0] * v + j)), Math.max(0, Math.min(255, c[1] * v + j * 0.6)), Math.max(0, Math.min(255, c[2] * v - j * 0.4))];
  }
  function viewTone(r, g, b, night) {
    if (night > 0.3) {
      const k2 = 1 + 0.9 * Math.min(1, night), m = [34, 42, 84];
      return [m[0] + (r - m[0]) * k2, m[1] + (g - m[1]) * k2, m[2] + (b - m[2]) * k2].map((v) => Math.max(0, Math.min(255, v)));
    }
    if (b < r || b < g * 0.9) return [r, g, b];
    const k = Math.min(1, (b - Math.max(r, g * 0.9)) / 60) * 0.85;
    return [r * (1 - 0.12 * k), g + (b - g) * 0.55 * k + 6 * k, b - (b - g) * 0.25 * k];
  }
  var HEX, PAL_RGB, INK_STONE, GOLD_STONE, PAL_LAB, LUT, stoneOf, VIOLET, LUT_DAY, stoneOfDay, GLASSY;
  var init_palette = __esm({
    "js/palette.js"() {
      HEX = [
        // creams, limestone, marble
        "#f8f4ea",
        "#efe5cc",
        "#e4d5b2",
        "#d6c398",
        "#c4ab7c",
        // greys
        "#d2cec4",
        "#aaa59a",
        "#7e7a72",
        "#54514c",
        "#34322f",
        // outline stone
        "#1f1c18",
        // teal
        "#dff0ea",
        "#b6e0d8",
        "#86c9c0",
        "#52aba5",
        "#2b8a88",
        "#1b6566",
        "#12474b",
        // lapis
        "#4f78c2",
        "#2f55b8",
        "#22408f",
        "#1b2c5e",
        "#141d3d",
        // green
        "#dfe4c4",
        "#bccb94",
        "#8ea866",
        "#5f8445",
        "#3c6236",
        "#26432a",
        // ochre and gold
        "#f8eab8",
        "#f1d27a",
        "#e3b14a",
        "#c98f2e",
        "#9e6a22",
        // orange
        "#f6c393",
        "#ef9a5a",
        "#e0702f",
        "#b8521f",
        // red
        "#e9806e",
        "#d6453a",
        "#a8322a",
        "#74231e",
        // wood
        "#e2b67c",
        "#cc935a",
        "#a66b3a",
        "#7c4a27",
        "#543019",
        // dusk violet
        "#a789a8",
        "#6e5a86",
        "#433a63"
      ];
      PAL_RGB = HEX.map((h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
      INK_STONE = HEX.indexOf("#1f1c18");
      GOLD_STONE = HEX.indexOf("#e3b14a");
      PAL_LAB = PAL_RGB.map((c) => toLab(c[0], c[1], c[2]));
      LUT = new Uint8Array(32 * 32 * 32);
      (function build() {
        for (let r = 0; r < 32; r++) for (let g = 0; g < 32; g++) for (let b = 0; b < 32; b++) {
          const [L, A, B] = toLab(r * 8.2258, g * 8.2258, b * 8.2258);
          let best = 0, bd = 1e9;
          for (let i = 0; i < PAL_LAB.length; i++) {
            const p = PAL_LAB[i], dl = (L - p[0]) * 0.85, da = A - p[1], db = B - p[2], d = dl * dl + da * da + db * db;
            if (d < bd) {
              bd = d;
              best = i;
            }
          }
          LUT[r << 10 | g << 5 | b] = best;
        }
      })();
      stoneOf = (r, g, b) => LUT[r >> 3 << 10 | g >> 3 << 5 | b >> 3];
      VIOLET = new Set(["#a789a8", "#6e5a86", "#433a63", "#d2cec4", "#aaa59a"].map((h) => HEX.indexOf(h)));
      LUT_DAY = new Uint8Array(32 * 32 * 32);
      for (let i = 0; i < LUT.length; i++) {
        if (!VIOLET.has(LUT[i])) {
          LUT_DAY[i] = LUT[i];
          continue;
        }
        const r = (i >> 10) * 8.2258, g = (i >> 5 & 31) * 8.2258, b = (i & 31) * 8.2258, [L, A, B] = toLab(r, g, b);
        let best = 0, bd = 1e9;
        for (let k = 0; k < PAL_LAB.length; k++) {
          if (VIOLET.has(k)) continue;
          const p = PAL_LAB[k], dl = (L - p[0]) * 0.85, da = A - p[1], db = B - p[2], d = dl * dl + da * da + db * db;
          if (d < bd) {
            bd = d;
            best = k;
          }
        }
        LUT_DAY[i] = best;
      }
      stoneOfDay = (r, g, b) => LUT_DAY[r >> 3 << 10 | g >> 3 << 5 | b >> 3];
      GLASSY = new Set(["#52aba5", "#2b8a88", "#4f78c2", "#2f55b8", "#e0702f", "#d6453a", "#f1d27a", "#e3b14a", "#ef9a5a", "#86c9c0"].map((h) => HEX.indexOf(h)));
    }
  });

  // js/tessera.js
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
  function boxBlur(src, W, H, r) {
    const tmp = new Float32Array(W * H), out = new Float32Array(W * H), n = 2 * r + 1;
    for (let y = 0; y < H; y++) {
      let acc = 0;
      const o = y * W;
      for (let x = -r; x <= r; x++) acc += src[o + Math.min(W - 1, Math.max(0, x))];
      for (let x = 0; x < W; x++) {
        tmp[o + x] = acc / n;
        acc += src[o + Math.min(W - 1, x + r + 1)] - src[o + Math.max(0, x - r)];
      }
    }
    for (let x = 0; x < W; x++) {
      let acc = 0;
      for (let y = -r; y <= r; y++) acc += tmp[Math.min(H - 1, Math.max(0, y)) * W + x];
      for (let y = 0; y < H; y++) {
        out[y * W + x] = acc / n;
        acc += tmp[Math.min(H - 1, y + r + 1) * W + x] - tmp[Math.max(0, y - r) * W + x];
      }
    }
    return out;
  }
  function regions(ink, edge, W, H) {
    const N = W * H, lab = new Int32Array(N).fill(-1), area = [], q = new Int32Array(N);
    let nl = 0;
    for (let i0 = 0; i0 < N; i0++) {
      if (lab[i0] >= 0 || ink[i0] || edge[i0]) continue;
      let qh = 0, qt = 0;
      q[qt++] = i0;
      lab[i0] = nl;
      let n = 0;
      while (qh < qt) {
        const i = q[qh++];
        n++;
        const x = i % W;
        if (x > 0 && lab[i - 1] < 0 && !ink[i - 1] && !edge[i - 1]) {
          lab[i - 1] = nl;
          q[qt++] = i - 1;
        }
        if (x < W - 1 && lab[i + 1] < 0 && !ink[i + 1] && !edge[i + 1]) {
          lab[i + 1] = nl;
          q[qt++] = i + 1;
        }
        if (i >= W && lab[i - W] < 0 && !ink[i - W] && !edge[i - W]) {
          lab[i - W] = nl;
          q[qt++] = i - W;
        }
        if (i < N - W && lab[i + W] < 0 && !ink[i + W] && !edge[i + W]) {
          lab[i + W] = nl;
          q[qt++] = i + W;
        }
      }
      area.push(n);
      nl++;
    }
    return { lab, area, nl };
  }
  function* layStonesSteps(sheets, s, opts = {}) {
    const { W, H, base, line, hole } = sheets, N = W * H, fine = opts.fine ?? 0.74;
    const rnd = mulberry32(opts.seed || 7);
    const fieldStone = new Int16Array(N).fill(-1);
    for (let i = 0; i < N; i++) {
      const p = i * 4;
      if (base[p + 3] > 128) fieldStone[i] = stoneOf(base[p], base[p + 1], base[p + 2]);
    }
    const ink = new Uint8Array(N), edge = new Uint8Array(N);
    for (let i = 0; i < N; i++) if (line[i * 4 + 3] > 90) ink[i] = 1;
    const distCache = /* @__PURE__ */ new Map(), far = (a, b) => {
      if (a === b) return false;
      if (a < 0 || b < 0) return a !== b;
      const k = a < b ? a * 64 + b : b * 64 + a;
      let v = distCache.get(k);
      if (v === void 0) {
        v = labDist(a, b) > 17;
        distCache.set(k, v);
      }
      return v;
    };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, a = fieldStone[i];
      if (x + 1 < W && far(a, fieldStone[i + 1])) edge[i] = 1;
      if (y + 1 < H && far(a, fieldStone[i + W])) edge[i] = 1;
    }
    const holeAt = (i) => hole && hole[i * 4 + 3] > 100;
    const inHole = (x, y) => {
      if (!hole) return false;
      const xi = Math.min(W - 1, Math.max(0, x | 0)), yi = Math.min(H - 1, Math.max(0, y | 0));
      return holeAt(yi * W + xi);
    };
    if (hole) {
      for (let i = 0; i < N; i++) if (holeAt(i)) {
        const x = i % W, y = i / W | 0;
        const out = (xx, yy) => xx >= 0 && yy >= 0 && xx < W && yy < H && !holeAt(yy * W + xx);
        if (out(x - 1, y) || out(x + 1, y) || out(x, y - 1) || out(x, y + 1)) ink[i] = 1;
      }
    }
    yield;
    let { lab, area, nl } = regions(ink, edge, W, H);
    const tiny = (s * 1.25) ** 2;
    {
      const keep = new Uint8Array(N);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (!edge[i]) continue;
        let a1 = -1, two = false;
        for (let dy = -1; dy <= 1 && !two; dy++) for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx, yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
          const l = lab[yy * W + xx];
          if (l < 0 || area[l] < tiny) continue;
          if (a1 < 0) a1 = l;
          else if (l !== a1) {
            two = true;
            break;
          }
        }
        if (two) keep[i] = 1;
      }
      for (let i = 0; i < N; i++) edge[i] = keep[i];
      ({ lab, area, nl } = regions(ink, edge, W, H));
    }
    yield;
    const bigArea = (s * (opts.bigStones || 13)) ** 2;
    const bigLab = new Uint8Array(nl);
    for (let l = 0; l < nl; l++) bigLab[l] = area[l] > bigArea ? 1 : 0;
    const big = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      const l = lab[i];
      big[i] = l >= 0 && bigLab[l] ? 1 : 0;
    }
    const sz0 = new Float32Array(N);
    for (let i = 0; i < N; i++) sz0[i] = big[i] ? s : s * fine;
    const sz = boxBlur(sz0, W, H, Math.max(1, Math.round(s * 0.6)));
    for (let i = 0; i < N; i++) sz[i] = Math.min(sz[i], big[i] ? s : s * fine);
    const sAt = (x, y) => sz[Math.min(H - 1, Math.max(0, y | 0)) * W + Math.min(W - 1, Math.max(0, x | 0))];
    yield;
    const dInk = distanceField(ink, W, H), dCol = distanceField(edge, W, H);
    const phi = new Float32Array(N);
    for (let i = 0; i < N; i++) phi[i] = Math.min(dInk[i] / sz[i], dCol[i] / sz[i] + 0.5);
    yield;
    const jxx = new Float32Array(N), jxy = new Float32Array(N), jyy = new Float32Array(N);
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = y * W + x, gx = (phi[i + 1] - phi[i - 1]) * 0.5, gy = (phi[i + W] - phi[i - W]) * 0.5;
      jxx[i] = gx * gx;
      jxy[i] = gx * gy;
      jyy[i] = gy * gy;
    }
    const r = Math.max(2, Math.round(s * 0.4));
    const bxx = boxBlur(boxBlur(jxx, W, H, r), W, H, r), bxy = boxBlur(boxBlur(jxy, W, H, r), W, H, r), byy = boxBlur(boxBlur(jyy, W, H, r), W, H, r);
    const ang = (i) => {
      const tr = bxx[i] + byy[i], coh = tr > 1e-6 ? Math.hypot(bxx[i] - byy[i], 2 * bxy[i]) / tr : 0;
      return coh < 0.35 ? 0 : 0.5 * Math.atan2(2 * bxy[i], bxx[i] - byy[i]) + Math.PI / 2;
    };
    yield;
    const tiles = [], B = new Buckets(W, H, s);
    const jit = (amt) => {
      const j = new Float32Array(8);
      for (let k = 0; k < 8; k++) j[k] = (rnd() - 0.5) * amt;
      return j;
    };
    const add = (x, y, a, l, w, k, row, ls) => {
      const id = tiles.length;
      tiles.push({ x, y, a, l, w, k, row, s: ls, j: jit(ls * (k === 3 ? 0.14 : 0.085)), h: rnd() });
      B.add(x, y, id);
      return id;
    };
    const free = (x, y, r2) => !B.near(x, y, r2);
    const inkNear = (x, y) => {
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        const xx = (x | 0) + dx, yy = (y | 0) + dy;
        if (xx >= 0 && yy >= 0 && xx < W && yy < H && ink[yy * W + xx]) return true;
      }
      return false;
    };
    const outlineLines = (sheets.lines || []).slice();
    if (hole) {
      const hf = new Float32Array(N);
      for (let i = 0; i < N; i++) hf[i] = hole[i * 4 + 3] / 255;
      for (const l of contours(hf, W, H, 0.5)) outlineLines.push(l);
    }
    outlineLines.sort((p, q) => q.length - p.length);
    for (const ln of outlineLines) walk(ln, sAt, 0.78, (x, y, a, ls) => {
      if (x < 0 || y < 0 || x >= W || y >= H || !inkNear(x, y)) return;
      if (!free(x, y, ls * 0.6)) return;
      add(x, y, a, ls * 0.7, ls * 0.6, 0, 0, ls);
    });
    yield;
    const small = new Uint8Array(N);
    for (let i = 0; i < N; i++) small[i] = big[i] ? 0 : 1;
    let maxPhi = 0;
    for (let i = 0; i < N; i++) if (small[i] && phi[i] > maxPhi && !ink[i] && !holeAt(i)) maxPhi = phi[i];
    for (let k = 1; k <= Math.max(3, Math.floor(maxPhi)); k++) {
      const lines = contours(phi, W, H, k, k > 3 ? small : null);
      lines.sort((p, q) => q.length - p.length);
      for (const ln of lines) walk(ln, sAt, 0.98, (x, y, a, ls) => {
        if (x < 0 || y < 0 || x >= W || y >= H) return;
        if (inHole(x, y) || !free(x, y, ls * 0.8)) return;
        add(x, y, a, ls * (0.82 + rnd() * 0.06), ls * 0.78, 1, k, ls);
      });
    }
    yield;
    const rowH = s * 0.9;
    for (let row = 0, yc = rowH / 2; yc < H; row++, yc += rowH) {
      let xc = -(row * 7.3 % 1) * s * 1.1 - s;
      while (xc < W + s) {
        const len = s * (1.12 + rnd() * 0.2);
        const cx = xc + len / 2, i = Math.min(H - 1, yc | 0) * W + Math.min(W - 1, Math.max(0, cx | 0));
        if (cx >= 0 && cx < W && big[i] && phi[i] > 3.42 && !inHole(cx, yc) && free(cx, yc, s * 0.74)) add(cx, yc, (rnd() - 0.5) * 0.025, len * 0.9, rowH * 0.86, 2, 99, s);
        xc += len;
      }
    }
    yield;
    const cover = opts.cover;
    if (cover) {
      for (const [size, gap] of [[0.7, 0.6], [0.52, 0.44]]) {
        yield;
        const cov = cover(tiles, 1.06);
        for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
          const i = y * W + x;
          if (cov[i * 4 + 3] > 60 || holeAt(i)) continue;
          if (big[i] && phi[i] > 3.3) continue;
          const ls = sz[i];
          if (!free(x + 0.5, y + 0.5, ls * gap)) continue;
          add(x + 0.5, y + 0.5, ang(i), ls * size, ls * size * 0.9, 3, 100, ls);
        }
      }
    }
    yield;
    const kept = yield* relax(tiles, { W, H, lab, ink, dInk, sz, holeAt }, s, opts.grout ?? 0.13);
    return { tiles: kept, W, H, phi, sz };
  }
  function* relax(tiles, F, s, grout) {
    const { W, H, lab, dInk, sz, holeAt } = F, up = 2, W2 = W * up, H2 = H * up;
    const labAt = (x, y) => lab[Math.min(H - 1, Math.max(0, y | 0)) * W + Math.min(W - 1, Math.max(0, x | 0))];
    for (const t of tiles) {
      t.lab = -1;
      if (t.k === 0) {
        t.lab = -2;
        continue;
      }
      for (let r = 0; r <= 2 && t.lab < 0; r++) for (let dy = -r; dy <= r && t.lab < 0; dy++) for (let dx = -r; dx <= r; dx++) {
        const l = labAt(t.x + dx, t.y + dy);
        if (l >= 0) {
          t.lab = l;
          break;
        }
      }
    }
    const n = tiles.length, sx = new Float64Array(n), sy = new Float64Array(n), cnt = new Int32Array(n);
    const mnU = new Float32Array(n), mxU = new Float32Array(n), mnV = new Float32Array(n), mxV = new Float32Array(n);
    const cosA = new Float32Array(n), sinA = new Float32Array(n), hl = new Float32Array(n), hw = new Float32Array(n);
    for (let pass = 0; pass < 3; pass++) {
      const final = pass === 2;
      const B = new Buckets(W, H, s);
      tiles.forEach((t, i) => {
        B.add(t.x, t.y, i);
        cosA[i] = Math.cos(t.a);
        sinA[i] = Math.sin(t.a);
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
      const cw = B.cw, cell = B.cell;
      for (let y2 = 0; y2 < H2; y2++) {
        const py = (y2 + 0.5) / up, yi = Math.min(H - 1, py | 0), gy = Math.floor(py / cell);
        for (let x2 = 0; x2 < W2; x2++) {
          const px = (x2 + 0.5) / up, xi = Math.min(W - 1, px | 0), i = yi * W + xi;
          if (holeAt(i)) continue;
          const inkZone = dInk[i] < sz[i] * 0.3, cls = inkZone ? -2 : lab[i];
          const gx = Math.floor(px / cell);
          let best = -1, bd = 1.75;
          for (let by = gy - 1; by <= gy + 1; by++) {
            if (by < 0 || by >= B.ch) continue;
            for (let bx = gx - 1; bx <= gx + 1; bx++) {
              if (bx < 0 || bx >= cw) continue;
              const l = B.b[by * cw + bx];
              if (!l) continue;
              for (const id of l) {
                const t = tiles[id];
                if (cls === -2 ? t.k !== 0 : t.k === 0 || cls >= 0 && t.lab >= 0 && t.lab !== cls) continue;
                const dx = px - t.x, dy = py - t.y;
                const u = (dx * cosA[id] + dy * sinA[id]) / hl[id], v = (-dx * sinA[id] + dy * cosA[id]) / hw[id];
                let d = Math.max(Math.abs(u), Math.abs(v));
                if (t.k === 2) d = d <= 1.06 ? d * 0.2 : d + 0.15;
                if (d < bd) {
                  bd = d;
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
            const t = tiles[best], dx = px - t.x, dy = py - t.y, u = dx * cosA[best] + dy * sinA[best], v = -dx * sinA[best] + dy * cosA[best];
            if (u < mnU[best]) mnU[best] = u;
            if (u > mxU[best]) mxU[best] = u;
            if (v < mnV[best]) mnV[best] = v;
            if (v > mxV[best]) mxV[best] = v;
          }
        }
      }
      if (!final) {
        for (let i = 0; i < n; i++) if (cnt[i] > 0 && tiles[i].k !== 2) {
          const t = tiles[i], nx = sx[i] / cnt[i], ny = sy[i] / cnt[i], m = Math.hypot(nx - t.x, ny - t.y), lim = (t.s || s) * 0.35;
          const f = m > lim ? lim / m : 1;
          t.x += (nx - t.x) * f;
          t.y += (ny - t.y) * f;
        }
        yield;
      }
    }
    const out = [];
    for (let i = 0; i < n; i++) {
      if (cnt[i] < 2) continue;
      const t = tiles[i], ls = t.s || s, g = ls * grout, px = 1 / up;
      if (t.k === 2) {
        out.push(t);
        continue;
      }
      const L = Math.min(mxU[i] - mnU[i] + px - g, ls * (t.k === 0 ? 0.78 : t.k === 3 ? 0.95 : 1.25)), Wd = Math.min(mxV[i] - mnV[i] + px - g, ls * (t.k === 0 ? 0.62 : t.k === 3 ? 0.85 : 1.05));
      if (L < ls * 0.22 || Wd < ls * 0.18) continue;
      const cu = (mxU[i] + mnU[i]) / 2, cv = (mxV[i] + mnV[i]) / 2;
      t.x += cu * cosA[i] - cv * sinA[i];
      t.y += cu * sinA[i] + cv * cosA[i];
      t.l = L;
      t.w = Wd;
      for (let k = 0; k < 8; k++) t.j[k] *= 0.6;
      out.push(t);
    }
    return out;
  }
  function corners(t, out = new Float32Array(8)) {
    const c = Math.cos(t.a), s = Math.sin(t.a), hl = t.l / 2, hw = t.w / 2, j = t.j;
    const P = [[-hl, -hw], [hl, -hw], [hl, hw], [-hl, hw]];
    for (let k = 0; k < 4; k++) {
      const lx = P[k][0] + j[k * 2], ly = P[k][1] + j[k * 2 + 1];
      out[k * 2] = t.x + c * lx - s * ly;
      out[k * 2 + 1] = t.y + s * lx + c * ly;
    }
    return out;
  }
  var Buckets;
  var init_tessera = __esm({
    "js/tessera.js"() {
      init_palette();
      init_core();
      init_paths();
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

  // js/mosaic.js
  function stoneRoom() {
    Object.assign(PAL, ROOM_STONE);
  }
  function eraLight(era, L, hour) {
    const o = openingOf(L), H = 1e3 * o.h / o.w;
    if (era === "now") {
      const date = sceneDate(hour), st = skyState(date);
      const ax = (az) => (az - 55) / 70 * 1e3, ey = (el) => H * 0.44 - el / 30 * H * 0.44;
      const sunUp = st.sun.el > -1 && st.sun.az > 50 && st.sun.az < 130;
      const moonUp = st.moon.el > 0 && st.moon.az > 45 && st.moon.az < 135 && st.night > 0.2;
      const patch = st.sun.el > 1 && st.sun.az > 40 && st.sun.az < 160 ? clamp(st.sun.el / 12) * (1 - smooth(48, 70, st.sun.el)) : 0;
      return {
        key: "now",
        label: clockLabel(date),
        sky: { ...st, sunUp, sunX: ax(st.sun.az), sunY: ey(st.sun.el), moonUp, moonX: ax(st.moon.az), moonY: ey(st.moon.el) },
        tint: mix(mix(mix("#ffffff", "#fbeedd", st.golden), "#ece4e6", st.twilight * 0.8), NIGHT_ROOM, st.night),
        lamp: st.lamp,
        patch,
        patchShift: clamp((st.sun.az - 90) / 60, -1, 1),
        patchWarm: st.golden
      };
    }
    if (era === "sd") return { key: "sd", label: "a clear morning", sky: { day: 1, golden: 0, night: 0, twilight: 0, stars: 0 }, tint: rgb("#ffffff"), lamp: 0, patch: 0.9, patchShift: -0.35, patchWarm: 0 };
    if (era === "blr") return { key: "blr", label: "late afternoon, before the rain", sky: { day: 0.7, golden: 0.55, night: 0, twilight: 0, stars: 0 }, tint: rgb("#f8efe1"), lamp: 0, patch: 0.75, patchShift: 0.55, patchWarm: 0.8 };
    return { key: "nitk", label: "after dark, by the sea", sky: { day: 0, golden: 0, night: 0.78, twilight: 0.35, stars: 0.9, moonUp: true, moon: { phase: 0.3 }, moonX: 760, moonY: H * 0.16 }, tint: rgb(NIGHT_ROOM), lamp: 1, patch: 0, patchShift: 0, patchWarm: 0 };
  }
  function viewSheetOf(era, L, light, bs) {
    const o = openingOf(L), H = 1e3 * o.h / o.w, sc = o.w * bs / 1e3;
    const w = Math.ceil(o.w * bs), h = Math.ceil(o.h * bs);
    const cv = { base: mk(w, h), col: mk(w, h), line: mk(w, h) };
    const ctx = { base: cv.base.getContext("2d"), col: cv.col.getContext("2d"), line: cv.line.getContext("2d") };
    for (const c of Object.values(ctx)) c.setTransform(sc, 0, 0, sc, 0, 0);
    setViewLight(light.sky);
    CLOUDS.capture = true;
    CLOUDS.list = [];
    VIEWS[era](new CartoonPen(ctx, sc), H, light.sky);
    CLOUDS.capture = false;
    return { ...cv, clouds: CLOUDS.list.slice(), H, sc, w, h };
  }
  function cartoonOf(era, L, light, photos, bs) {
    const W = Math.ceil((L.xMax - L.xMin) * bs), H = Math.ceil((L.yMax - L.yMin) * bs);
    const sh = { base: mk(W, H), col: mk(W, H), line: mk(W, H), hole: mk(W, H) };
    const ctx = {};
    for (const k in sh) {
      ctx[k] = sh[k].getContext("2d", { willReadFrequently: true });
      ctx[k].setTransform(bs, 0, 0, bs, -L.xMin * bs, -L.yMin * bs);
    }
    const o = openingOf(L);
    const view = viewSheetOf(era, L, light, bs);
    for (const k of ["base", "col", "line"]) {
      const c = ctx[k];
      c.save();
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.drawImage(view[k], (o.x - L.xMin) * bs, (o.y - L.yMin) * bs);
      c.restore();
    }
    const pen = new CartoonPen({ base: ctx.base, col: ctx.col, line: ctx.line }, bs);
    drawRoom(pen, L);
    const objs = eraObjects(era, L, photos), prints = [];
    for (const ob of objs) {
      if (/^p-/.test(ob.id)) {
        prints.push(ob);
        continue;
      }
      ob.draw(pen);
    }
    const fp = new FootprintPen({ base: ctx.hole, col: ctx.hole, line: ctx.hole }, bs);
    for (const ob of prints) ob.draw(fp);
    const front = mk(W, H), fx = front.getContext("2d", { willReadFrequently: true });
    fx.setTransform(bs, 0, 0, bs, -L.xMin * bs, -L.yMin * bs);
    const mp = new FootprintPen({ base: fx, col: fx, line: fx }, bs);
    drawRoom(mp, L);
    for (const ob of objs) if (!/^p-/.test(ob.id)) ob.draw(mp);
    return { ...sh, front, W, H, bs, view, prints, objs, lines: pen.lines };
  }
  function* laySteps(cart, L, s, seed = 11, fine = 0.74) {
    const { W, H } = cart;
    const g = (k) => cart[k].getContext("2d", { willReadFrequently: true }).getImageData(0, 0, W, H).data;
    const sheets = { W, H, base: g("base"), col: g("col"), line: g("line"), hole: g("hole"), lines: cart.lines };
    const front = g("front");
    yield;
    const cov = mk(W, H), cc = cov.getContext("2d", { willReadFrequently: true });
    const cover = (tiles, scale) => {
      cc.setTransform(1, 0, 0, 1, 0, 0);
      cc.clearRect(0, 0, W, H);
      cc.fillStyle = "#fff";
      const q = new Float32Array(8);
      for (const t of tiles) {
        corners({ ...t, l: t.l * scale, w: t.w * scale }, q);
        cc.beginPath();
        cc.moveTo(q[0], q[1]);
        cc.lineTo(q[2], q[3]);
        cc.lineTo(q[4], q[5]);
        cc.lineTo(q[6], q[7]);
        cc.closePath();
        cc.fill();
      }
      return cc.getImageData(0, 0, W, H).data;
    };
    const o = openingOf(L), bs = cart.bs;
    const ox0 = (o.x - L.xMin) * bs, oy0 = (o.y - L.yMin) * bs, ox1 = ox0 + o.w * bs, oy1 = oy0 + o.h * bs;
    const result = yield* layStonesSteps(sheets, s, { seed, cover, fine });
    for (const t of result.tiles) {
      const xi = Math.min(W - 1, Math.max(0, t.x | 0)), yi = Math.min(H - 1, Math.max(0, t.y | 0));
      t.view = t.x > ox0 && t.x < ox1 && t.y > oy0 && t.y < oy1 && front[(yi * W + xi) * 4 + 3] < 128 && t.k !== 0;
    }
    result.sheets = sheets;
    result.opening = { x0: ox0, y0: oy0, x1: ox1, y1: oy1 };
    result.s = s;
    return result;
  }
  function sampleAvg(d, W, H, x, y, r) {
    let R2 = 0, G = 0, B = 0, n = 0;
    for (let yy = Math.max(0, Math.round(y - r)); yy <= Math.min(H - 1, Math.round(y + r)); yy++)
      for (let xx = Math.max(0, Math.round(x - r)); xx <= Math.min(W - 1, Math.round(x + r)); xx++) {
        const p = (yy * W + xx) * 4;
        if (d[p + 3] < 20) continue;
        R2 += d[p];
        G += d[p + 1];
        B += d[p + 2];
        n++;
      }
    return n ? [R2 / n, G / n, B / n] : null;
  }
  function lightAt(L, light, ax, ay) {
    const t = light.tint, n = light.sky.night || 0, strength = 0.45 + 0.45 * n;
    let m = [lerp(1, t[0] / 255, strength), lerp(1, t[1] / 255, strength), lerp(1, t[2] / 255, strength)], add = [0, 0, 0];
    if (light.lamp > 0.02) {
      const [lx, ly] = L.lamp.aim, [hx, hy] = L.lamp.head;
      const d1 = Math.hypot(ax - lx, (ay - ly) / 0.42) / 300, d2 = Math.hypot(ax - hx, ay - hy) / 520;
      const k = light.lamp * (Math.max(0, 1 - d1) * 0.85 + Math.max(0, 1 - d2) * 0.45);
      add = [255 * 0.55 * k, 205 * 0.5 * k, 140 * 0.42 * k];
    }
    if (light.patch > 0) {
      const d = L.desk, o = openingOf(L), shift = light.patchShift * 120, depth = (d.frontY - d.backY) * 1.05;
      if (ay > d.backY && ay < d.frontY) {
        const v = (ay - d.backY) / depth, x0 = o.x + shift * v - 30 * v, x1 = o.x + o.w + shift * v + 30 * v;
        if (ax > x0 && ax < x1) {
          const edge = Math.min(ax - x0, x1 - ax) / 30, k = light.patch * clamp(edge) * 0.22;
          add = [add[0] + 255 * k, add[1] + (light.patchWarm ? 214 : 246) * k, add[2] + (light.patchWarm ? 150 : 222) * k];
        }
      }
    }
    return { m, add };
  }
  function colour(layout, cart, L, light, opts = {}) {
    const { W, H } = cart, d = layout.sheets.col, fb = layout.sheets.base, bs = cart.bs;
    const wallLum = (PAL_RGB[stoneOf(...rgb(PAL.wall).map((v, i) => v * light.tint[i] / 255))] || [255, 255, 255]).reduce((a, v, i) => a + v * [0.299, 0.587, 0.114][i], 0) / 255;
    const protect = opts.laneX != null && wallLum < 0.78 ? clamp((0.78 - wallLum) / 0.3) : 0;
    const rnd = mulberry32(5);
    const night = light.sky.night || 0;
    const lit = (c, t) => {
      if (t.view) return viewTone(c[0], c[1], c[2], night);
      const ax = t.x / bs + L.xMin, ay = t.y / bs + L.yMin, lt = lightAt(L, light, ax, ay);
      if (protect) {
        const k = protect * clamp((opts.laneX + opts.feather - t.x) / opts.feather);
        if (k > 0) lt.m = lt.m.map((v) => lerp(v, 1, k));
      }
      return [Math.min(255, c[0] * lt.m[0] + lt.add[0]), Math.min(255, c[1] * lt.m[1] + lt.add[1]), Math.min(255, c[2] * lt.m[2] + lt.add[2])];
    };
    for (const t of layout.tiles) {
      if (t.k === 0 && !(opts.laneX != null && !t.view && t.x < opts.laneX)) {
        t.stone = INK_STONE;
        t.rgb = stoneRGB(INK_STONE, t.h);
        t.glass = false;
        continue;
      }
      const c = lit(sampleAvg(d, W, H, t.x, t.y, Math.max(1, t.l * 0.22)) || [200, 190, 170], t);
      const f = sampleAvg(fb, W, H, t.x, t.y, 1);
      const pick = t.view && (light.sky.night || 0) < 0.3 ? stoneOfDay : stoneOf;
      let stone = pick(c[0] | 0, c[1] | 0, c[2] | 0);
      if (f) {
        const fl = lit(f, t), fs = pick(fl[0] | 0, fl[1] | 0, fl[2] | 0), cl = toLab(c[0], c[1], c[2]), fp = PAL_LAB[fs];
        if (Math.hypot(cl[0] - fp[0], cl[1] - fp[1], cl[2] - fp[2]) < 11) stone = fs;
      }
      t.lane = opts.laneX != null && !t.view && t.x < opts.laneX + opts.feather * 0.5 && t.k >= 2;
      if (t.lane && f) {
        const fl = lit(f, t), base = stoneOf(...f.map((v) => v | 0));
        stone = labDistLite(fl, base) < 16 ? base : pick(fl[0] | 0, fl[1] | 0, fl[2] | 0);
      }
      if (opts.laneX != null && !t.view && t.k === 0 && t.x < opts.laneX) {
        t.stone = SOFT_INK;
        t.rgb = stoneRGB(SOFT_INK, t.h);
        t.glass = false;
        continue;
      }
      t.stone = stone;
      t.rgb = stoneRGB(stone, t.lane ? 0.5 + (t.h - 0.5) * 0.35 : t.h);
      t.glass = !t.lane && GLASSY.has(stone) && rnd() < 0.3;
    }
  }
  function stonePath(c, t, k, ox, oy, scale = 1) {
    const tt = scale === 1 ? t : { ...t, l: t.l * scale, w: t.w * scale };
    corners(tt, q8);
    c.beginPath();
    c.moveTo(q8[0] * k + ox, q8[1] * k + oy);
    for (let i = 1; i < 4; i++) c.lineTo(q8[i * 2] * k + ox, q8[i * 2 + 1] * k + oy);
    c.closePath();
  }
  function paintStone(c, t, col, k, ox = 0, oy = 0, glint = 0) {
    stonePath(c, t, k, ox, oy);
    c.fillStyle = `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`;
    c.fill();
    const lw = Math.max(0.6, k * 0.55), dark = col[0] + col[1] + col[2] < 170;
    c.lineWidth = lw;
    c.strokeStyle = dark ? "rgba(255,248,230,.3)" : "rgba(255,250,235,.22)";
    c.beginPath();
    c.moveTo(q8[6] * k + ox, q8[7] * k + oy);
    c.lineTo(q8[0] * k + ox, q8[1] * k + oy);
    c.lineTo(q8[2] * k + ox, q8[3] * k + oy);
    c.stroke();
    c.strokeStyle = "rgba(20,14,8,.22)";
    c.beginPath();
    c.moveTo(q8[2] * k + ox, q8[3] * k + oy);
    c.lineTo(q8[4] * k + ox, q8[5] * k + oy);
    c.lineTo(q8[6] * k + ox, q8[7] * k + oy);
    c.stroke();
    if (t.glass || glint) {
      const a = 0.18 + glint * 0.55;
      c.strokeStyle = `rgba(255,255,248,${a})`;
      c.lineWidth = Math.max(0.8, k * 0.8);
      const mx = (q8[0] + q8[2]) / 2, my = (q8[1] + q8[3]) / 2, nx = (q8[6] + q8[0]) / 2, ny = (q8[7] + q8[1]) / 2;
      c.beginPath();
      c.moveTo((nx * 0.6 + mx * 0.4) * k + ox, (ny * 0.6 + my * 0.4) * k + oy);
      c.lineTo((mx * 0.7 + nx * 0.3) * k + ox, (my * 0.7 + ny * 0.3) * k + oy);
      c.stroke();
    }
  }
  var ROOM_STONE, mk, NIGHT_ROOM, SOFT_INK, labDistLite, GROUT, GROUT_LIGHT, BED, q8;
  var init_mosaic = __esm({
    "js/mosaic.js"() {
      init_core();
      init_ink();
      init_room();
      init_views();
      init_objects();
      init_mosaicpen();
      init_tessera();
      init_palette();
      ROOM_STONE = {
        wall: "#ece3cb",
        wallShade: "#dccfae",
        wallDeep: "#cdbd98",
        base: "#f5f1e6",
        baseShade: "#ddd6c4",
        floor: "#c4703f",
        floorShade: "#9c552c",
        frame: "#f8f5ec",
        frameShade: "#ddd8c9"
      };
      mk = (w, h) => {
        const c = document.createElement("canvas");
        c.width = Math.max(1, w);
        c.height = Math.max(1, h);
        return c;
      };
      NIGHT_ROOM = "#c7b6a5";
      SOFT_INK = stoneOf(170, 165, 154);
      labDistLite = (c, i) => {
        const a = toLab(c[0], c[1], c[2]), b = PAL_LAB[i];
        return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
      };
      GROUT = "#3d362d";
      GROUT_LIGHT = "#d9cfb8";
      BED = "#a39479";
      q8 = new Float32Array(8);
    }
  });

  // js/living.js
  function drawBird(c, x, y, w, flap, col) {
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(x - w, y - w * 0.25 * flap);
    c.quadraticCurveTo(x - w * 0.4, y - w * 0.45 * flap, x, y);
    c.quadraticCurveTo(x + w * 0.4, y - w * 0.45 * flap, x + w, y - w * 0.25 * flap);
    c.lineTo(x + w * 0.55, y - w * 0.02);
    c.quadraticCurveTo(x, y + w * 0.32, x - w * 0.55, y - w * 0.02);
    c.closePath();
    c.fill();
  }
  function makeLiveView(era, view, sky) {
    const cv = document.createElement("canvas");
    cv.width = view.w;
    cv.height = view.h;
    const c = cv.getContext("2d", { willReadFrequently: true });
    const clouds = view.clouds.map((s, i) => ({ ...s, v: 9 + i * 3.7 % 7, w0: s.w }));
    return {
      cv,
      c,
      paint(t) {
        c.setTransform(1, 0, 0, 1, 0, 0);
        c.clearRect(0, 0, cv.width, cv.height);
        c.drawImage(view.col, 0, 0);
        c.setTransform(view.sc, 0, 0, view.sc, 0, 0);
        setViewLight(sky);
        const P = new FillPen(c, view.sc);
        P.pool = 0;
        for (const s of clouds) {
          const span = 1e3 + s.w0 * 1.4, x = wrap(s.cx + s.v * t, -s.w0 * 0.7, 1e3 + s.w0 * 0.7);
          drawCloudSpec(P, s, x - s.cx);
        }
        LIVE[era]?.(c, view.H, t, sky);
        return c.getImageData(0, 0, cv.width, cv.height).data;
      }
    };
  }
  function assignSparkle(era, tiles, layout, view, sky) {
    const rnd = mulberry32(era.length * 97 + 13), o = layout.opening, Hs = o.y1 - o.y0;
    for (const t of tiles) {
      if (!t.view) continue;
      const vy = (t.y - o.y0) / Hs;
      const L = lumOf(t.stone);
      t.spark = 0;
      if ((sky.night || 0) > 0.4) {
        if (vy < 0.42 && L < 0.4 && rnd() < 0.04) {
          t.spark = 1;
          t.ph = rnd() * TAU;
          t.rate = 0.4 + rnd() * 0.9;
        } else if (era === "now" && vy > 0.52 && vy < 0.9 && L < 0.45 && rnd() < 0.07) {
          t.spark = 2;
          t.ph = rnd() * TAU;
          t.rate = 0.2 + rnd() * 0.5;
        }
      }
      if (era === "nitk" && vy > 0.62 && vy < 0.86) {
        t.spark = 3;
        t.ph = rnd() * TAU;
      }
    }
  }
  function liveViewStone(t, tile, r, g, b, night, now) {
    const pick = night < 0.3 ? stoneOfDay : stoneOf;
    [r, g, b] = viewTone(r, g, b, night);
    let s = pick(r | 0, g | 0, b | 0);
    if (tile.spark === 1) {
      if (Math.sin(now * tile.rate + tile.ph) > 0.55) s = STAR;
    } else if (tile.spark === 2) {
      const v = Math.sin(now * tile.rate + tile.ph);
      if (v > -0.2) s = v > 0.85 ? LAMP : WARM;
    } else if (tile.spark === 3) {
      const ph = tile.x * 0.21 - now * 1.6 + Math.sin(tile.y * 0.7 + now * 0.4) * 1.4 + tile.ph * 0.3;
      if (Math.sin(ph) > 0.955) s = pick(Math.min(255, r * 1.5 + 60), Math.min(255, g * 1.5 + 60), Math.min(255, b * 1.4 + 50));
    }
    return s;
  }
  function tokensFor(tiles, rect, toSheet) {
    const [x0, y0] = toSheet(rect.x + 8, rect.y + 8), [x1, y1] = toSheet(rect.x + rect.w - 8, rect.y + rect.h - 8);
    const list = tiles.filter((t) => !t.view && t.k !== 0 && t.x > x0 && t.x < x1 && t.y > y0 && t.y < y1);
    list.sort((a, b) => a.y - b.y || a.x - b.x);
    const rows = [];
    for (const t of list) {
      const r = rows.find((rr) => Math.abs(rr.y - t.y) < t.w * 0.6);
      if (r) r.tiles.push(t);
      else rows.push({ y: t.y, tiles: [t] });
    }
    rows.sort((a, b) => a.y - b.y);
    rows.forEach((r, i) => {
      r.tiles.sort((a, b) => a.x - b.x);
      r.len = Math.max(1, Math.round(r.tiles.length * (0.4 + i * 37 % 50 / 100)));
    });
    return rows;
  }
  function tokensAt(rows, t) {
    const out = /* @__PURE__ */ new Map();
    if (!rows.length) return out;
    const total = rows.reduce((n2, r) => n2 + r.len, 0), cyc = t % 11 / 11, shown = Math.floor(cyc * total * 1.15);
    let n = 0;
    rows.forEach((r, i) => {
      for (let k = 0; k < r.len; k++, n++) {
        if (n < shown) out.set(r.tiles[k], CODE[(i + 1) % CODE.length]);
        else if (n === shown && t * 2.4 % 1 < 0.55) out.set(r.tiles[k], CURSOR);
      }
    });
    return out;
  }
  function eyesFor(tiles, eyes, toSheet, s) {
    const out = [];
    for (const [ex, ey, er] of eyes) {
      const [x, y] = toSheet(ex, ey);
      for (const t of tiles) if (Math.hypot(t.x - x, t.y - y) < Math.max(s * 0.8, er * 1.05 * s / 16)) out.push(t);
    }
    return out;
  }
  function traceFor(tiles, rect, toSheet) {
    const [x0, y0] = toSheet(rect.x, rect.y), [x1, y1] = toSheet(rect.x + rect.w, rect.y + rect.h);
    return { x0, y0, x1, y1, tiles: tiles.filter((t) => !t.view && t.k !== 0 && t.x > x0 && t.x < x1 && t.y > y0 && t.y < y1) };
  }
  function traceAt(tr, t, s) {
    const out = /* @__PURE__ */ new Map();
    if (!tr.tiles.length) return out;
    const w = tr.x1 - tr.x0, h = tr.y1 - tr.y0, hi = tr.y0 + h * 0.3, lo = tr.y0 + h * 0.7;
    const lvl = (u) => (u * 4 + 0.05) % 1 < 0.5 ? hi : lo;
    for (let i = 0; i < 4; i++) {
      const u = t * 0.9 % 1 - i * 0.03;
      if (u < 0) break;
      const px = tr.x0 + w * u, py = lvl(u);
      let best = null, bd = 1e9;
      for (const tt of tr.tiles) {
        const d = Math.hypot(tt.x - px, tt.y - py);
        if (d < bd) {
          bd = d;
          best = tt;
        }
      }
      if (best && bd < s && !out.has(best)) out.set(best, i === 0 ? PHOS : PHOS2);
    }
    return out;
  }
  function glintAt(t, x, y, W, H) {
    const band = t / 14 % 1 * 1.6 - 0.3, u = x / W * 0.8 + y / H * 0.4;
    const d = Math.abs(u - band);
    return d < 0.06 ? 1 - d / 0.06 : 0;
  }
  var FillPen, wrap, LIVE, lumOf, STAR, LAMP, WARM, CODE, CURSOR, COBALT, blinkOn, COBALT_STONE, PHOS, PHOS2;
  var init_living = __esm({
    "js/living.js"() {
      init_core();
      init_ink();
      init_views();
      init_palette();
      FillPen = class extends Pen {
        ink() {
          return this;
        }
      };
      wrap = (v, a, b) => a + ((v - a) % (b - a) + (b - a)) % (b - a);
      LIVE = {
        now(c, H, t, sky) {
          if (sky.night > 0.5) {
            const x2 = wrap(t * 22, -200, 1200), on = t * 1.3 % 1 < 0.35;
            if (on) {
              c.fillStyle = "#ff5a3c";
              c.beginPath();
              c.arc(x2, H * 0.14 + Math.sin(t * 0.1) * 6, 13, 0, TAU);
              c.fill();
            }
            return;
          }
          const a = t * 0.22, x = 330 + Math.cos(a) * 90, y = H * 0.18 + Math.sin(a) * 22;
          drawBird(c, x, y, 64, 0.7 + 0.3 * Math.sin(t * 2.1), "rgba(52,44,38,.95)");
          const fl = wrap(t * 30, -300, 1700);
          for (let i = 0; i < 3; i++) drawBird(c, fl - i * 120, H * 0.3 + i * 26 + Math.sin(t * 0.8 + i) * 8, 46, 0.6 + 0.4 * Math.sin(t * 5 + i * 1.7), "rgba(60,52,46,.9)");
        },
        sd(c, H, t) {
          for (let i = 0; i < 3; i++) {
            const x = wrap(t * (34 + i * 7) + i * 420, -200, 1200), y = H * (0.16 + i * 0.07) + Math.sin(t * 0.9 + i * 2) * 14;
            drawBird(c, x, y, 58 - i * 6, 0.55 + 0.45 * Math.sin(t * 4.2 + i), "rgba(252,250,242,.98)");
          }
        },
        blr(c, H, t) {
          for (const [x0, y0, col, ph] of [[300, H * 0.3, "#e2553a", 0], [560, H * 0.22, "#2f55b8", 1.7]]) {
            const x = x0 + Math.sin(t * 0.7 + ph) * 34, y = y0 + Math.sin(t * 1.1 + ph) * 20, r = Math.sin(t * 0.9 + ph) * 0.2;
            c.save();
            c.translate(x, y);
            c.rotate(r);
            c.beginPath();
            c.moveTo(0, -46);
            c.lineTo(34, 0);
            c.lineTo(0, 54);
            c.lineTo(-34, 0);
            c.closePath();
            c.fillStyle = col;
            c.fill();
            c.fillStyle = "rgba(255,240,220,.9)";
            c.beginPath();
            c.moveTo(0, -46);
            c.lineTo(34, 0);
            c.lineTo(0, 0);
            c.closePath();
            c.fill();
            for (let k = 1; k <= 4; k++) {
              c.fillStyle = k % 2 ? col : "#f1d27a";
              c.beginPath();
              c.arc(Math.sin(t * 3 + k + ph) * 12, 54 + k * 26, 9, 0, TAU);
              c.fill();
            }
            c.restore();
          }
        },
        nitk(c, H, t) {
          const hx = 250, hy = H * 0.6 - 44 - 134 * 1.25, a = t * 0.35 % 1 * TAU, face = Math.cos(a);
          const dir = Math.sin(a) > 0 ? 1 : -1, len = 900 * Math.abs(Math.sin(a)) + 80, spread = 0.07 + (1 - Math.abs(Math.sin(a))) * 0.4;
          c.save();
          c.globalCompositeOperation = "screen";
          const g = c.createLinearGradient(hx, hy, hx + dir * len, hy);
          g.addColorStop(0, `rgba(255,236,170,${0.7 + face * 0.25})`);
          g.addColorStop(1, "rgba(255,236,170,0)");
          c.fillStyle = g;
          c.beginPath();
          c.moveTo(hx, hy);
          c.lineTo(hx + dir * len, hy - len * spread);
          c.lineTo(hx + dir * len, hy + len * spread * 0.6);
          c.closePath();
          c.fill();
          c.globalAlpha = 0.7 + Math.max(0, face) * 0.3;
          c.fillStyle = "#fff3c4";
          c.beginPath();
          c.arc(hx, hy, 16 + Math.max(0, face) * 14, 0, TAU);
          c.fill();
          c.restore();
        }
      };
      lumOf = (i) => {
        const p = PAL_LAB[i];
        return p[0] / 100;
      };
      STAR = stoneOf(248, 234, 184);
      LAMP = stoneOf(241, 210, 122);
      WARM = stoneOf(239, 154, 90);
      CODE = ["#9bc4e2", "#e8c46a", "#a9d39a", "#d8dde3", "#e59a8a"].map((h) => stoneOf(parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)));
      CURSOR = stoneOf(242, 242, 242);
      COBALT = stoneOf(47, 85, 184);
      blinkOn = (t) => {
        const cyc = (t + 1.3) % 4.6;
        return cyc <= 0.18;
      };
      COBALT_STONE = COBALT;
      PHOS = stoneOf(200, 255, 220);
      PHOS2 = stoneOf(120, 230, 150);
    }
  });

  // js/stage.js
  var stage_exports = {};
  __export(stage_exports, {
    ERAS: () => ERAS,
    PLACE_NAMES: () => PLACE_NAMES,
    createStage: () => createStage,
    lerp: () => lerp,
    paintStill: () => paintStill,
    rgb: () => rgb,
    smooth: () => smooth,
    stonePath: () => stonePath
  });
  function groutPaint(c, st, W, H) {
    if (st.laneDev != null) {
      const g = c.createLinearGradient(st.laneDev - 10 * st.dpr, 0, st.laneDev + 90 * st.dpr, 0);
      g.addColorStop(0, GROUT_LIGHT);
      g.addColorStop(1, GROUT);
      c.fillStyle = g;
    } else c.fillStyle = GROUT;
    c.fillRect(0, 0, W, H);
  }
  function* eraSteps(st, era, out) {
    const { L } = st;
    const light = eraLight(era, L, st.hour);
    const bs = STONE_SHEET / STONE_ART;
    const cart = cartoonOf(era, L, light, st.photos, bs);
    yield;
    const layout = yield* laySteps(cart, L, STONE_SHEET, 11 + ERAS.indexOf(era) * 7, FINE);
    const laneX = st.laneCss != null ? st.laneCss / st.cssW * cart.W : null;
    colour(layout, cart, L, light, { laneX, feather: 30 });
    yield;
    const W = st.canvas.width, H = st.canvas.height, k = W / cart.W;
    const cv = mk2(W, H), c = cv.getContext("2d");
    groutPaint(c, st, W, H);
    for (const t of layout.tiles) paintStone(c, t, t.rgb, k);
    yield;
    const prints = mk2(W, H), pc = prints.getContext("2d");
    const px = L.u * st.dpr;
    pc.setTransform(px, 0, 0, px, -L.xMin * px, -L.yMin * px);
    const P = new Pen(pc, px);
    for (const ob of cart.prints) ob.draw(P);
    c.drawImage(prints, 0, 0);
    const toSheet = (x, y) => [(x - L.xMin) * bs, (y - L.yMin) * bs];
    const view = layout.tiles.filter((t) => t.view);
    assignSparkle(era, layout.tiles, layout, cart.view, light.sky);
    const live = [];
    for (const ob of cart.objs) {
      if (ob.live === "tokens") live.push({ kind: "tokens", rows: tokensFor(layout.tiles, ob.screen, toSheet) });
      else if (ob.live === "blink") live.push({ kind: "blink", tiles: eyesFor(layout.tiles.filter((t) => !t.view && t.k !== 0), ob.eyes, toSheet, STONE_SHEET) });
      else if (ob.live === "trace") live.push({ kind: "trace", tr: traceFor(layout.tiles, ob.screen, toSheet) });
    }
    const glass = layout.tiles.filter((t) => t.glass && !t.view);
    const byX = layout.tiles.slice().sort((a, b) => a.x - b.x);
    out[era] = {
      light,
      cart,
      layout,
      cv,
      k,
      view,
      live,
      glass,
      byX,
      prints,
      liveView: makeLiveView(era, cart.view, light.sky)
    };
  }
  async function buildEraSliced(st, era, alive, budget = 40) {
    const out = {};
    let t = performance.now();
    for (const step of eraSteps(st, era, out)) {
      if (performance.now() - t > budget) {
        await nextTask();
        if (!alive()) return;
        t = performance.now();
      }
    }
    if (alive()) st.eras[era] = out[era];
  }
  function buildEra(st, era) {
    for (const step of eraSteps(st, era, st.eras)) ;
  }
  function drawLiving(st, E, t) {
    const c = st.ctx, k = E.k, cart = E.cart, o = E.layout.opening;
    const data = E.liveView.paint(t), vw = cart.view.w, vh = cart.view.h, night = E.light.sky.night || 0;
    for (const tile of E.view) {
      const lx = tile.x - o.x0, ly = tile.y - o.y0;
      let r = 0, g = 0, b = 0, n = 0;
      for (const [dx, dy] of [[-0.25, -0.2], [0.25, -0.2], [-0.25, 0.2], [0.25, 0.2]]) {
        const xi = Math.min(vw - 1, Math.max(0, lx + dx * tile.l | 0)), yi = Math.min(vh - 1, Math.max(0, ly + dy * tile.w | 0)), p = (yi * vw + xi) * 4;
        if (data[p + 3] < 20) continue;
        r += data[p];
        g += data[p + 1];
        b += data[p + 2];
        n++;
      }
      if (!n) continue;
      const s = liveViewStone(t, tile, r / n, g / n, b / n, night, t);
      if (s !== tile.stone) paintStone(c, tile, stoneRGB(s, tile.h), k);
    }
    for (const lv of E.live) {
      if (lv.kind === "tokens") for (const [tile, s] of tokensAt(lv.rows, t)) paintStone(c, tile, stoneRGB(s, tile.h), k);
      else if (lv.kind === "blink" && blinkOn(t)) for (const tile of lv.tiles) paintStone(c, tile, stoneRGB(COBALT_STONE, tile.h), k);
      else if (lv.kind === "trace") for (const [tile, s] of traceAt(lv.tr, t, STONE_SHEET)) paintStone(c, tile, stoneRGB(s, tile.h), k);
    }
    for (const tile of E.glass) {
      const g = glintAt(t, tile.x, tile.y, cart.W, cart.H);
      if (g > 0.02) paintStone(c, tile, tile.rgb, k, 0, 0, g);
    }
    c.drawImage(E.prints, 0, 0);
  }
  function relay(st, EA, EB, tau) {
    const c = st.ctx, W = st.canvas.width, H = st.canvas.height, k = EA.k;
    const cw = EA.cart.W;
    const x0 = st.laneCss != null ? st.laneCss / st.cssW * cw + 4 : 0, x0d = x0 * k;
    const startOf = (x) => (1 - (x - x0) / (cw - x0)) * SPAN;
    const TOTAL = LIFT + 0.04 + SET * 0.95 + 0.06;
    const pend = x0 + (cw - x0) * (1 - tau / SPAN), done = x0 + (cw - x0) * (1 - (tau - TOTAL) / SPAN);
    const pd = clamp(pend * k, x0d, W), dd = clamp(done * k, x0d, W);
    if (x0d > 0) {
      c.save();
      c.beginPath();
      c.rect(0, 0, x0d, H);
      c.clip();
      c.drawImage(EA.cv, 0, 0);
      c.globalAlpha = smooth(0.25, 0.75, tau);
      c.drawImage(EB.cv, 0, 0);
      c.restore();
    }
    if (pd > x0d) {
      c.save();
      c.beginPath();
      c.rect(x0d, 0, pd - x0d, H);
      c.clip();
      c.drawImage(EA.cv, 0, 0);
      c.restore();
    }
    if (dd < W) {
      c.save();
      c.beginPath();
      c.rect(dd, 0, W - dd, H);
      c.clip();
      c.drawImage(EB.cv, 0, 0);
      c.restore();
    }
    if (dd > pd) {
      c.save();
      c.beginPath();
      c.rect(pd, 0, dd - pd, H);
      c.clip();
      c.fillStyle = BED;
      c.fillRect(pd, 0, dd - pd, H);
      const lo = pend - 2 * STONE_SHEET, hi = done + 2 * STONE_SHEET;
      for (const t of EA.byX) {
        if (t.x < lo) continue;
        if (t.x > hi) break;
        const s0 = startOf(t.x) + (1 - stageOf(t)) * 0.04, kk = clamp((tau - s0) / LIFT);
        if (kk >= 1) continue;
        const sc = 1 - easeIO(kk);
        paintStone(c, sc === 1 ? t : { ...t, l: t.l * sc, w: t.w * sc, j: t.j.map((v) => v * sc) }, t.rgb, k);
      }
      for (const t of EB.byX) {
        if (t.x < lo) continue;
        if (t.x > hi) break;
        const s0 = startOf(t.x) + LIFT + 0.04 + stageOf(t) * SET, kk = clamp((tau - s0) / 0.06);
        if (kk <= 0) continue;
        const sc = easeIO(kk), lift = (1 - sc) * 6 * st.dpr;
        paintStone(c, sc === 1 ? t : { ...t, l: t.l * (0.4 + 0.6 * sc), w: t.w * (0.4 + 0.6 * sc), j: t.j.map((v) => v * sc) }, t.rgb, k, 0, -lift);
      }
      c.restore();
    }
    const fade = (E, a) => {
      if (a <= 0) return;
      c.save();
      c.globalAlpha = a;
      c.drawImage(E.prints, 0, 0);
      c.restore();
    };
    const ps = startOf(cw * 0.82);
    fade(EA, 1 - clamp((tau - ps) / 0.08));
    fade(EB, clamp((tau - ps - TOTAL) / 0.1));
  }
  function frameMask(st) {
    const c = st.ctx, p = st.panel;
    if (!c || !p) return;
    const W = st.canvas.width, H = st.canvas.height, d = st.dpr;
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = st.wallCss;
    c.beginPath();
    c.rect(0, 0, W, H);
    c.rect(p.x, p.y, p.w, p.h);
    c.fill("evenodd");
    const sh = c.createLinearGradient(0, p.y, 0, p.y + 10 * d);
    sh.addColorStop(0, "rgba(40,32,20,.22)");
    sh.addColorStop(1, "rgba(40,32,20,0)");
    c.fillStyle = sh;
    c.fillRect(p.x, p.y, p.w, 10 * d);
    const sv = c.createLinearGradient(p.x, 0, p.x + 8 * d, 0);
    sv.addColorStop(0, "rgba(40,32,20,.16)");
    sv.addColorStop(1, "rgba(40,32,20,0)");
    c.fillStyle = sv;
    c.fillRect(p.x, p.y, 8 * d, p.h);
    c.strokeStyle = "rgba(48,40,28,.45)";
    c.lineWidth = Math.max(1, d);
    c.strokeRect(p.x + 0.5 * d, p.y + 0.5 * d, p.w - d, p.h - d);
    c.restore();
  }
  function render(st, t) {
    renderInner(st, t);
    frameMask(st);
  }
  function renderInner(st, t) {
    const c = st.ctx;
    if (!c) return;
    const pos = clamp(st.pos, 0, 3), i = Math.min(2, Math.floor(pos)), tau = pos >= 3 ? 1 : pos - i;
    const A = ERAS[pos >= 3 ? 3 : i], B = ERAS[Math.min(3, i + 1)];
    const EA = st.eras[A], EB = st.eras[B];
    c.setTransform(1, 0, 0, 1, 0, 0);
    if (!EA) {
      c.fillStyle = PAL.wall;
      c.fillRect(0, 0, st.canvas.width, st.canvas.height);
      return;
    }
    const inT = tau > 1e-3 && tau < 0.999 && pos < 3 && !!EB;
    if (inT) {
      relay(st, EA, EB, tau);
      return;
    }
    const E = tau >= 0.999 && EB ? EB : EA;
    c.drawImage(E.cv, 0, 0);
    if (!st.still) drawLiving(st, E, t);
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
    return Promise.all(Object.entries(urls).map(([key, src]) => new Promise((res) => {
      const im = new Image();
      im.decoding = "async";
      im.onload = im.onerror = () => res();
      im.src = src;
      out[key] = im;
    }))).then(() => out);
  }
  function prepare(st, mode, w, h, dpr, bounds) {
    st.L = layoutFor(mode, w, h, bounds);
    st.dpr = dpr;
    st.cssW = w;
    st.cssH = h;
    st.canvas.width = Math.round(w * dpr);
    st.canvas.height = Math.round(h * dpr);
    st.ctx = st.canvas.getContext("2d");
    st.eras = {};
  }
  async function createStage({ canvas, stageEl, sections, laneEl, photos, hooks = {}, onChange, onReady }) {
    const st = { canvas, sections, eras: {}, pos: 0, hour: hooks.hour, photos: {} };
    let disposed = false, raf = 0, visible = true, lastT = -1, lastPos = -1, building = 0, resizeTimer = 0, lastCaption = "";
    const t0 = performance.now();
    const wideMq = window.matchMedia(WIDE_QUERY);
    st.photos = await loadPhotos(photos);
    if (disposed) return { destroy() {
    } };
    const caption = () => {
      const key = ERAS[Math.min(3, Math.round(st.pos))], E = st.eras[key];
      if (!E) return;
      const txt = key === "now" ? `${PLACE_NAMES[key]} \xB7 ${E.light.label}` : PLACE_NAMES[key];
      if (txt !== lastCaption) {
        lastCaption = txt;
        onChange?.({ place: PLACE_NAMES[key], label: E.light.label, text: txt, pos: st.pos });
      }
    };
    const frame = (now) => {
      raf = 0;
      if (disposed || document.hidden || !st.ready) return;
      const t = hooks.t != null ? hooks.t : (now - t0) / 1e3;
      st.pos = hooks.pos != null ? hooks.pos : scrollPos(st);
      if (st.pos !== lastPos || t - lastT > 0.05 || hooks.t != null) {
        render(st, t);
        lastT = t;
        lastPos = st.pos;
        caption();
      }
      if (hooks.t == null && visible) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf && st.ready && !disposed && !document.hidden && visible) raf = requestAnimationFrame(frame);
    };
    const build2 = async () => {
      const id = ++building;
      const r = stageEl.getBoundingClientRect(), mode = wideMq.matches ? "wide" : "tall";
      const w = Math.round(r.width), h = Math.round(r.height), dpr = Math.min(2, window.devicePixelRatio || 1);
      if (!w || !h) return;
      const alive = () => !disposed && id === building;
      st.ready = false;
      if (mode === "wide" && laneEl) {
        const lr = laneEl.getBoundingClientRect();
        st.laneCss = lr.right - r.left;
        st.laneDev = st.laneCss * dpr;
      } else {
        st.laneCss = null;
        st.laneDev = null;
      }
      st.wallCss = getComputedStyle(stageEl).backgroundColor || "#ece3cb";
      const hd = document.querySelector(".site-header");
      let pc, bounds;
      if (mode === "wide") {
        const top = Math.max(18, hd ? hd.getBoundingClientRect().bottom - r.top + 10 : 18), m = 28;
        pc = { x: (st.laneCss ?? 0) + 36, y: top };
        pc.w = w - pc.x - m;
        pc.h = h - pc.y - m;
        const u = Math.max(Math.min(pc.h, pc.w), 200) / 1e3;
        const xMin = 1e3 - (pc.x + pc.w) / u, yMin = 1e3 - (pc.y + pc.h) / u;
        bounds = { u, xMin, xMax: xMin + w / u, yMin, yMax: yMin + h / u };
      } else {
        const m = 12;
        pc = { x: m, y: m, w: w - 2 * m, h: h - 2 * m };
        const u = Math.min(pc.w / 700, pc.h / 790);
        const xMin = 350 - (pc.x + pc.w / 2) / u, yMin = 742 - (pc.y + pc.h) / u;
        bounds = { u, xMin, xMax: xMin + w / u, yMin, yMax: yMin + h / u };
      }
      prepare(st, mode, w, h, dpr, bounds);
      st.panel = { x: Math.round(pc.x * dpr), y: Math.round(pc.y * dpr), w: Math.round(pc.w * dpr), h: Math.round(pc.h * dpr) };
      await nextTask();
      if (!alive()) return;
      const first = hooks.era && ERAS.includes(hooks.era) ? hooks.era : hooks.pos != null ? ERAS[Math.min(3, Math.floor(hooks.pos))] : ERAS[Math.min(3, Math.round(scrollPos(st)))];
      await buildEraSliced(st, first, alive);
      if (!alive()) return;
      if (hooks.pos != null && hooks.pos % 1 > 0) {
        await buildEraSliced(st, ERAS[Math.min(3, Math.floor(hooks.pos) + 1)], alive);
        if (!alive()) return;
      }
      st.ready = true;
      lastPos = -1;
      frame(performance.now());
      if (hooks.t != null) window.__renderAt = (t, pos) => {
        if (pos != null) st.pos = pos;
        const t0r = performance.now();
        render(st, t);
        return performance.now() - t0r;
      };
      onReady?.();
      const idle = () => new Promise((res) => window.requestIdleCallback ? window.requestIdleCallback(() => res(), { timeout: 700 }) : setTimeout(res, 60));
      for (const e of ERAS) {
        if (st.eras[e]) continue;
        if (hooks.t == null) await idle();
        if (!alive()) return;
        await buildEraSliced(st, e, alive);
      }
      if (hooks.t != null) {
        lastPos = -1;
        frame(performance.now());
      }
      kick();
    };
    const onScroll = () => kick();
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!disposed) build2();
      }, 240);
    };
    const onVisibility = () => {
      if (!document.hidden) kick();
    };
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) kick();
    });
    io.observe(stageEl);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    wideMq.addEventListener?.("change", onResize);
    await build2();
    return {
      destroy() {
        disposed = true;
        cancelAnimationFrame(raf);
        clearTimeout(resizeTimer);
        io.disconnect();
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        document.removeEventListener("visibilitychange", onVisibility);
        wideMq.removeEventListener?.("change", onResize);
        st.eras = {};
      }
    };
  }
  async function paintStill({ canvas, width, height, dpr = 1, era = "now", hour, photos }) {
    const st = { canvas, sections: [], eras: {}, pos: ERAS.indexOf(era), hour, photos: await loadPhotos(photos), still: true, laneCss: null, laneDev: null };
    prepare(st, "tall", width, height, dpr);
    buildEra(st, era);
    render(st, 0);
    return { label: st.eras[era].light.label };
  }
  var STONE_ART, STONE_SHEET, FINE, nextTask, mk2, easeIO, SPAN, LIFT, SET, stageOf;
  var init_stage = __esm({
    "js/stage.js"() {
      init_core();
      init_ink();
      init_layout();
      init_mosaic();
      init_living();
      init_palette();
      init_constants();
      stoneRoom();
      STONE_ART = 19;
      STONE_SHEET = 5.2;
      FINE = 0.58;
      nextTask = () => new Promise((res) => setTimeout(res, 0));
      mk2 = (w, h) => {
        const c = document.createElement("canvas");
        c.width = Math.max(1, w);
        c.height = Math.max(1, h);
        return c;
      };
      easeIO = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      SPAN = 0.66;
      LIFT = 0.08;
      SET = 0.1;
      stageOf = (t) => t.k === 0 ? 0 : t.k === 1 ? Math.min(4, t.row || 1) * 0.17 : t.k === 2 ? 0.85 : 0.95;
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
    {
      key: "now",
      place: "San Jose",
      years: "2024 \u2013 now",
      role: "AI research at eBay",
      ids: ["eai-challenge", "ebay-research"],
      alt: "San\u2019s desk in San Jose, laid in mosaic: a window onto the valley and Mt Hamilton with the Lick Observatory domes, a laptop, a small paper robot and a telescope on the desk, books on the shelf, and two photographs on the pinboard."
    },
    {
      key: "sd",
      place: "San Diego",
      years: "2022 \u2013 2024",
      role: "MS in computer science, UC San Diego",
      ids: ["ucsd-graduation", "zinify", "startr", "ebay-internship", "ebay-ml-challenge", "ucsd-start"],
      alt: "The same mosaic desk in San Diego on a clear morning: the Geisel Library and eucalyptus through the window, papers, a zine and a laptop on the desk, four photographs on the pinboard."
    },
    {
      key: "blr",
      place: "Bengaluru",
      years: "2019 \u2013 2022",
      role: "Chip design at Texas Instruments",
      ids: ["texas-instruments"],
      alt: "The same mosaic desk in Bengaluru, late afternoon before the rain: rooftops, coconut palms and a flame tree through the window, a monitor showing a chip layout, a loupe and a packaged chip, one photograph on the pinboard."
    },
    {
      key: "nitk",
      place: "Surathkal",
      years: "2015 \u2013 2019",
      role: "Electrical engineering at NIT Karnataka",
      ids: ["nitk"],
      alt: "The same mosaic desk in Surathkal after dark: palms, the sea and the lighthouse through the window, an oscilloscope showing a square wave, a breadboard and a star chart, and the photograph from the NITK lab."
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
      <p class="ff-cue">The desk is laid in stones, in code, and keeps San Jose time. Scroll, and the mosaic is re-laid for each place I\u2019ve lived and worked.<span class="ff-clock"></span></p>
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
      laneEl,
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
