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

  // js/scene.js
  function blend(a, b, t) {
    const o = {};
    for (const k of Object.keys(a)) o[k] = k === "robotTint" ? a[k].map((v, i) => lerp(v, b[k][i], t)) : mix(a[k], b[k] || a[k], t);
    return o;
  }
  function arcPos(az) {
    const th = Math.PI + Math.PI * clamp((az - 95) / 170);
    return [CX + ARC_R * Math.cos(th), CY + ARC_R * Math.sin(th)];
  }
  function lightFor(hour) {
    const date = sceneDate(hour), sky = skyState(date);
    const e = sky.sun.el, D = asRGB(DAY), G = asRGB(GOLDEN), T = asRGB(TWILIGHT), Nt = asRGB(NIGHT);
    const p = e >= 24 ? D : e >= 6 ? blend(G, D, smooth(6, 24, e)) : e >= -1 ? G : e >= -7 ? blend(G, T, smooth(-1, -7, e)) : e >= -13 ? blend(T, Nt, smooth(-7, -13, e)) : Nt;
    const sunUp = sky.sun.el > -1.5, moonUp = sky.moon.el > 0 && sky.night + sky.twilight > 0.35;
    return {
      pal: p,
      sky,
      date,
      label: clockLabel(date),
      sun: sunUp ? arcPos(sky.sun.az) : null,
      moon: !sunUp && moonUp ? { at: arcPos(sky.moon.az), phase: sky.moon.phase } : null,
      stars: sky.stars,
      night: sky.night,
      lamp: sky.lamp
    };
  }
  function regionsFor(L) {
    const P = L.pal, out = [];
    const R = (name, group, draw, fill, o = {}) => out.push({ name, group, draw, fill, clip: group === "view" || group === "robot", fine: 1, src: "self", ...o });
    R("frame", "frame", outerPath, (x, y) => {
      const d = Math.hypot(x - CX, Math.min(y, CY) - CY), t = clamp((d - R_IN) / (R_OUT - R_IN));
      return mix(P.marble, P.marbleShade, 0.25 + 0.5 * Math.abs(t - 0.5) * 2);
    }, { clip: false, src: ["view", "robot"] });
    R("sill", "sill", (c) => c.rect(-26, SILL, 1052, SILL_B - SILL), (x, y) => y < SILL + 34 ? P.sill : P.sillFront, { clip: false, src: ["view", "frame", "robot"], fine: 1.05 });
    R("sky", "view", innerPath, (x, y) => {
      const t = clamp((y - 70) / (ridgeY(x) - 70));
      let c = t < 0.45 ? mix(P.skyTop, P.skyMid, t / 0.45) : t < 0.78 ? mix(P.skyMid, P.skyLow, (t - 0.45) / 0.33) : mix(P.skyLow, P.skyHor, (t - 0.78) / 0.22);
      if (L.sun) {
        const d = Math.hypot(x - L.sun[0], y - L.sun[1]);
        c = mix(c, P.sunIn, 0.38 * (1 - smooth(60, 230, d)) * (1 - L.night));
      }
      return c;
    }, { live: "sky" });
    if (L.sun) {
      const [sx, sy] = L.sun;
      R("sun", "view", disc(sx, sy, 66), (x, y) => mix(P.sunIn, P.sunOut, smooth(8, 64, Math.hypot(x - sx, y - sy))), { live: "sun", fine: 0.9 });
    }
    if (L.moon) {
      const [mx, my] = L.moon.at, ph = L.moon.phase, r = 52, c2 = Math.cos(ph * Math.PI * 2);
      R("moon", "view", disc(mx, my, r), (x, y) => {
        const dx = x - mx, w = Math.sqrt(Math.max(0, r * r - (y - my) ** 2));
        const litSide = ph < 0.5 ? dx > c2 * w : -dx > c2 * w;
        return litSide ? rgb("#f1ead2") : mix(P.skyMid, P.skyTop, 0.55);
      }, { live: "moon", fine: 0.9 });
    }
    R(
      "ridge",
      "view",
      (c) => {
        c.moveTo(IN_X0 - 2, SILL + 1);
        for (let x = IN_X0 - 2; x <= IN_X1 + 2; x += 6) c.lineTo(x, ridgeTop(x));
        c.lineTo(IN_X1 + 2, SILL + 1);
        c.closePath();
      },
      (x, y) => mix(P.ridgeRim, P.ridge, smooth(0, 70, y - ridgeTop(x))),
      { src: ["sky", "sun", "moon"] }
    );
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
      const d = DOMES.reduce((a, b) => Math.abs(b.x - x) < Math.abs(a.x - x) ? b : a), base = ridgeY(d.x) + 10;
      if (y > base - d.drum) return mix(P.drum, P.domeShade, smooth(-0.2, 0.9, (x - d.x) / d.r) * 0.7);
      const nx = (x - d.x) / d.r, ny = (y - (base - d.drum)) / d.r;
      if (d.slit && Math.abs(nx + 0.12) < 0.1 && ny < -0.12) return mix(P.domeShade, P.outline, 0.55);
      return mix(P.domeLit, P.domeShade, smooth(-0.15, 0.65, nx * 0.9 - ny * 0.25));
    }, { fine: 0.78, src: "self" });
    R(
      "foothills",
      "view",
      (c) => {
        c.moveTo(IN_X0 - 2, SILL + 1);
        for (let x = IN_X0 - 2; x <= IN_X1 + 2; x += 6) c.lineTo(x, footY(x));
        c.lineTo(IN_X1 + 2, SILL + 1);
        c.closePath();
      },
      (x, y) => mix(P.footLit, P.foot, smooth(0, 60, y - footY(x))),
      { src: ["ridge", "domes"] }
    );
    R("cypress", "view", (c) => {
      for (const t of CYPRESS) {
        const b = SILL + 1;
        c.moveTo(t.x, b - t.h);
        c.bezierCurveTo(t.x + t.w * 0.7, b - t.h * 0.62, t.x + t.w * 0.62, b - t.h * 0.12, t.x + t.w * 0.4, b);
        c.lineTo(t.x - t.w * 0.4, b);
        c.bezierCurveTo(t.x - t.w * 0.62, b - t.h * 0.12, t.x - t.w * 0.7, b - t.h * 0.62, t.x, b - t.h);
        c.closePath();
      }
    }, (x) => {
      const t = CYPRESS.reduce((a, b) => Math.abs(b.x - x) < Math.abs(a.x - x) ? b : a);
      return mix(P.footLit, P.cypress, 0.62 + 0.38 * smooth(-0.5, 0.5, (x - t.x) / t.w));
    }, { fine: 0.8 });
    R("walls", "view", (c) => {
      for (const h of HOUSES) c.rect(h.x - h.w / 2, SILL - h.h, h.w, h.h + 1);
    }, (x) => {
      const h = HOUSES.reduce((a, b) => Math.abs(b.x - x) < Math.abs(a.x - x) ? b : a);
      return mix(P.wall, P.marbleShade, x > h.x + h.w * 0.18 ? 0.28 : 0);
    }, { fine: 0.8 });
    R("windows", "view", (c) => {
      for (const h of HOUSES) for (const f of [-0.25, 0.22]) c.rect(h.x + f * h.w - 9, SILL - h.h * 0.62, 18, 16);
    }, () => P.window, { fine: 0.7, live: "window" });
    R(
      "roofs",
      "view",
      (c) => {
        for (const h of HOUSES) {
          const y = SILL - h.h;
          c.moveTo(h.x - h.w * 0.62, y + 2);
          c.lineTo(h.x - h.w * 0.3, y - 34);
          c.lineTo(h.x + h.w * 0.3, y - 34);
          c.lineTo(h.x + h.w * 0.62, y + 2);
          c.closePath();
        }
      },
      (x) => {
        const h = HOUSES.reduce((a, b) => Math.abs(b.x - x) < Math.abs(a.x - x) ? b : a);
        return x > h.x + h.w * 0.05 ? P.roofDark : P.roof;
      },
      { fine: 0.8 }
    );
    const tint = (c) => [c[0] * P.robotTint[0], c[1] * P.robotTint[1], c[2] * P.robotTint[2]].map((v) => Math.min(255, v));
    const lit = (base, x) => tint(mix(base, [255, 236, 200], L.sun && L.sun[0] > RB.x ? 0.1 * smooth(0, 190, (x - RB.x) / RS) : 0));
    R("body", "robot", poly([rob(16, 358), rob(16, 232), rob(34, 206), rob(158, 206), rob(176, 232), rob(176, 358)]), (x, y) => lit(mix(rgb("#3a62c4"), rgb("#22408f"), smooth(220, 360, (y - RB.y) / RS) * 0.6 + smooth(80, 180, (x - RB.x) / RS) * 0.25), x), { fine: 0.74, src: "courses" });
    R("neck", "robot", poly([rob(68, 210), rob(68, 176), rob(124, 176), rob(124, 210)]), () => tint(rgb("#1d3478")), { fine: 0.7 });
    R("headTop", "robot", poly([rob(4, 28), rob(32, 0), rob(194, 0), rob(166, 28)]), (x) => lit(rgb("#5b82cc"), x), { fine: 0.7 });
    R("headSide", "robot", poly([rob(166, 28), rob(194, 0), rob(194, 150), rob(166, 178)]), () => tint(rgb("#21418f")), { fine: 0.7 });
    R("headFront", "robot", poly([rob(4, 28), rob(122, 28), rob(166, 72), rob(166, 178), rob(4, 178)]), (x, y) => lit(mix(rgb("#3460c2"), rgb("#2a4ea8"), smooth(40, 170, (y - RB.y) / RS)), x), { fine: 0.7 });
    R("fold", "robot", poly([rob(122, 28), rob(166, 28), rob(166, 72)]), (x, y) => tint(mix(rgb("#f6eedb"), rgb("#d8ccb2"), smooth(0, 40, (x - RB.x) / RS - 122 - ((y - RB.y) / RS - 28)))), { fine: 0.62 });
    R("earRim", "robot", disc(...rob(184, 102), 33 * RS), () => tint(rgb("#f2e6cc")), { fine: 0.66 });
    R("ear", "robot", disc(...rob(184, 102), 25 * RS), (x, y) => tint(mix(rgb("#e8573a"), rgb("#c23a25"), smooth(-20, 25, (x - RB.x) / RS - 184 + ((y - RB.y) / RS - 102) * 0.6))), { fine: 0.66 });
    for (const [k, ex] of [["L", 44], ["R", 116]]) {
      R("eye" + k, "robot", disc(...rob(ex, 104), 29 * RS), () => tint(rgb("#f8f3e6")), { fine: 0.62 });
      R("pupil" + k, "robot", disc(...rob(ex + 10, 106), 12 * RS), () => rgb("#1f1c1a"), { fine: 0.6 });
    }
    return out;
  }
  function birdsAt(t) {
    const out = [];
    for (const [i, period, y0, size] of [[0, 26, 240, 74], [1, 34, 335, 58]]) {
      const ph = (t + i * 13) % period / period, x = lerp(IN_X0 - 120, IN_X1 + 120, ph), y = y0 + 22 * Math.sin(ph * 6.28 + i);
      const flap = 0.5 + 0.5 * Math.sin(t * (1.6 + i * 0.3) + i);
      out.push({ x, y, size, flap });
    }
    return out;
  }
  function inBird(b, x, y) {
    const dx = x - b.x, dy = y - b.y, s = b.size;
    if (Math.abs(dx) > s * 1.1 || Math.abs(dy) > s * 0.6) return false;
    const u = Math.abs(dx) / s, lift = 0.18 + 0.2 * b.flap;
    const wingY = -lift * Math.sin(Math.min(1, u) * Math.PI) * s * 0.9 + u * u * s * 0.22 * (1 - b.flap * 0.5);
    const half = s * (0.16 - 0.09 * u);
    return u <= 1 && Math.abs(dy - wingY) < Math.max(s * 0.07, half);
  }
  var PANEL, CX, CY, R_IN, R_OUT, IN_X0, IN_X1, SILL, SILL_B, ARC_R, outerPath, panelShape, innerPath, DAY, GOLDEN, TWILIGHT, NIGHT, asRGB, ridgeY, ridgeTop, footY, DOMES, HOUSES, CYPRESS, RS, RB, rob, poly, disc, OUTLINES;
  var init_scene = __esm({
    "js/scene.js"() {
      init_core();
      PANEL = { x0: -40, y0: -14, w: 1080, h: 1114 };
      CX = 500;
      CY = 500;
      R_IN = 430;
      R_OUT = 500;
      IN_X0 = 70;
      IN_X1 = 930;
      SILL = 1e3;
      SILL_B = 1086;
      ARC_R = 296;
      outerPath = (c) => {
        c.moveTo(0, SILL + 1);
        c.lineTo(0, CY);
        c.arc(CX, CY, R_OUT, Math.PI, 0);
        c.lineTo(1e3, SILL + 1);
        c.closePath();
      };
      panelShape = (c) => {
        outerPath(c);
        c.rect(-26, SILL, 1052, SILL_B - SILL);
      };
      innerPath = (c) => {
        c.moveTo(IN_X0, SILL + 1);
        c.lineTo(IN_X0, CY);
        c.arc(CX, CY, R_IN, Math.PI, 0);
        c.lineTo(IN_X1, SILL + 1);
        c.closePath();
      };
      DAY = {
        skyTop: "#2c8fa0",
        skyMid: "#6fbcc4",
        skyLow: "#b5dfdc",
        skyHor: "#e9f0d8",
        ridge: "#3f7480",
        ridgeRim: "#6a9aa0",
        foot: "#7f9a54",
        footLit: "#a9b867",
        wall: "#f2ead6",
        roof: "#c96b42",
        roofDark: "#a8522f",
        cypress: "#2f4b31",
        window: "#5a6f78",
        marble: "#efe7d2",
        marbleShade: "#ddd0b3",
        sill: "#ebe2cb",
        sillFront: "#cfc2a3",
        sunOut: "#f2b44e",
        sunIn: "#fbefc4",
        domeLit: "#f6f1e4",
        domeShade: "#c9cdd2",
        drum: "#e9e3d4",
        robotTint: [1, 1, 1],
        outline: "#2b2925",
        grout: "#ddd6c6",
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
        wall: "#f3e2c0",
        roof: "#c8643a",
        roofDark: "#a14b2b",
        cypress: "#2c462d",
        window: "#57606a",
        marble: "#f1e4c9",
        marbleShade: "#dcc8a3",
        sill: "#eedfc1",
        sillFront: "#cdb894",
        sunOut: "#e2702f",
        sunIn: "#fae6a0",
        domeLit: "#fbecd0",
        domeShade: "#b9b4bf",
        drum: "#efdcbc",
        robotTint: [1.05, 0.99, 0.93],
        outline: "#2c2723",
        grout: "#ddd3bf",
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
        foot2: "#4a5640",
        footLit: "#6a6a4a",
        wall: "#cbbca6",
        roof: "#8d4c3a",
        roofDark: "#6f3a2c",
        cypress: "#22332a",
        window: "#f2c66a",
        marble: "#d9cdb8",
        marbleShade: "#c2b498",
        sill: "#d6c9b0",
        sillFront: "#b5a88c",
        sunOut: "#e4683a",
        sunIn: "#f6c58c",
        domeLit: "#d9d2d6",
        domeShade: "#8f8ca3",
        drum: "#cbc3c4",
        robotTint: [0.74, 0.76, 0.9],
        outline: "#26232a",
        grout: "#d5ccbb",
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
        wall: "#5c5a62",
        roof: "#3f2c2c",
        roofDark: "#33232a",
        cypress: "#142019",
        window: "#f5c35a",
        marble: "#c9c3b6",
        marbleShade: "#b3ab9a",
        sill: "#c6bead",
        sillFront: "#a79f8c",
        sunOut: "#e4683a",
        sunIn: "#f6c58c",
        domeLit: "#b9c0cf",
        domeShade: "#6c7590",
        drum: "#9aa1b2",
        robotTint: [0.44, 0.5, 0.74],
        outline: "#24222a",
        grout: "#d2cab9",
        bird: "#0e1220"
      };
      asRGB = (p) => {
        const o = {};
        for (const k of Object.keys(p)) o[k] = typeof p[k] === "string" ? rgb(p[k]) : p[k];
        return o;
      };
      ridgeY = (x) => 782 - 142 * Math.exp(-(((x - 692) / 236) ** 2)) - 38 * Math.exp(-(((x - 210) / 118) ** 2)) + 5 * Math.sin(x / 41);
      ridgeTop = ridgeY;
      footY = (x) => 846 + 18 * Math.sin(x / 95 + 0.8) + 10 * Math.sin(x / 41 + 2);
      DOMES = [{ x: 572, r: 46, drum: 26 }, { x: 692, r: 60, drum: 34, slit: true }, { x: 814, r: 46, drum: 26 }];
      HOUSES = [{ x: 132, w: 100, h: 44 }, { x: 650, w: 108, h: 46 }, { x: 850, w: 100, h: 42 }];
      CYPRESS = [{ x: 212, w: 42, h: 152 }, { x: 566, w: 40, h: 142 }, { x: 752, w: 36, h: 122 }];
      RS = 1.12;
      RB = { x: 262, y: SILL - 358 * RS };
      rob = (dx, dy) => [RB.x + dx * RS, RB.y + dy * RS];
      poly = (pts) => (c) => {
        c.moveTo(...pts[0]);
        for (let i = 1; i < pts.length; i++) c.lineTo(...pts[i]);
        c.closePath();
      };
      disc = (x, y, r) => (c) => {
        c.moveTo(x + r, y);
        c.arc(x, y, r, 0, Math.PI * 2);
        c.closePath();
      };
      OUTLINES = [
        { inside: ["frame", "sill"], against: ["outside"] },
        { inside: ["frame"], against: ["view", "robot"] },
        { inside: ["sill"], against: ["view", "frame", "robot"] },
        { inside: ["robot"], against: ["view", "frame", "sill", "outside"] },
        { inside: ["domes"], against: ["sky", "sun", "moon"] }
      ];
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
  function* laySteps(regions, outlines, { W, H, q, s, seed = 7, grout = 0.17 }) {
    const N = W * H, nR = regions.length, rnd = mulberry32(seed);
    const lab = new Int16Array(N).fill(-1);
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    const c = cv.getContext("2d", { willReadFrequently: true });
    for (let i = 0; i < nR; i++) {
      const r = regions[i];
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
    const box = regions.map(() => [W, H, -1, -1]), area = new Int32Array(nR);
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
        regions.forEach((r, i) => {
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
      regions.forEach((r, i) => {
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
    for (const o of outlines) {
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
      const r = regions[i];
      if (!area[i]) continue;
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
        if (l < 0 || cov[p]) continue;
        if (zone[p]) {
          if (zoneD[p] < so * 0.6 && free(x + 0.5, y + 0.5, so * 0.74) && B.near(x + 0.5, y + 0.5, so * 1.7)) add(x + 0.5, y + 0.5, nearAngle(x, y, -2), so * 0.8, so * 0.66, 0, -2, so);
          continue;
        }
        const sR = s * (regions[l].fine || 1);
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
    const P = [-hl, -hw, hl, -hw, hl, hw, -hl, hw];
    for (let k = 0; k < 4; k++) {
      const lx = P[k * 2] + j[k * 2], ly = P[k * 2 + 1] + j[k * 2 + 1];
      out[k * 2] = t.x + c * lx - s * ly;
      out[k * 2 + 1] = t.y + s * lx + c * ly;
    }
    return out;
  }
  var init_lay = __esm({
    "js/lay.js"() {
      init_field();
      init_core();
      init_scene();
    }
  });

  // js/stage.js
  var stage_exports = {};
  __export(stage_exports, {
    WIDE_QUERY: () => WIDE_QUERY,
    createStage: () => createStage
  });
  function placePanel(mode, stageEl, laneEl, header) {
    const r = stageEl.getBoundingClientRect(), w = r.width, h = r.height, CAP = 30;
    let area;
    if (mode === "wide") {
      const laneRight = laneEl.getBoundingClientRect().right - r.left;
      const top = Math.max(24, header ? header.getBoundingClientRect().bottom - r.top + 18 : 24);
      area = { x: laneRight + 56, y: top, w: w - laneRight - 56 - 44, h: h - top - 28 - CAP };
    } else {
      area = { x: 16, y: 14, w: w - 32, h: h - 14 - CAP - 6 };
    }
    const k = Math.min(area.w / PANEL.w, area.h / PANEL.h);
    const pw = PANEL.w * k, ph = PANEL.h * k;
    return { k, x: area.x + (area.w - pw) / 2, y: area.y + (area.h - ph) / 2, w: pw, h: ph, stageW: w, stageH: h };
  }
  function shade(col, h, h2, amt = 0.085) {
    const f = 1 + (h - 0.5) * amt, tilt = (h2 - 0.5) * 7;
    return [clamp(col[0] * f + tilt, 0, 255), clamp(col[1] * f, 0, 255), clamp(col[2] * f - tilt, 0, 255)];
  }
  function paintStone(c, t, col, k, ox, oy, glint = 0, flat = false) {
    corners(t, q8);
    c.beginPath();
    c.moveTo(q8[0] * k + ox, q8[1] * k + oy);
    for (let i = 1; i < 4; i++) c.lineTo(q8[i * 2] * k + ox, q8[i * 2 + 1] * k + oy);
    c.closePath();
    c.fillStyle = `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`;
    c.fill();
    if (flat) return;
    const lw = Math.max(0.7, k * 0.5), dark = col[0] + col[1] + col[2] < 200;
    c.lineWidth = lw;
    c.strokeStyle = dark ? "rgba(255,250,236,.22)" : "rgba(255,253,244,.32)";
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
  async function createStage({ canvas, stageEl, laneEl, header, captionEl, hooks = {}, still = false, onReady }) {
    let disposed = false, raf = 0, building = 0, resizeTimer = 0, visible = true, lastT = -1;
    const st = { canvas, ctx: canvas.getContext("2d") };
    const t0 = performance.now();
    const wideMq = matchMedia(WIDE_QUERY);
    const build = async () => {
      const id = ++building, alive = () => !disposed && id === building;
      const mode = wideMq.matches ? "wide" : "tall", dpr = Math.min(2, devicePixelRatio || 1);
      const P = placePanel(mode, stageEl, laneEl, header);
      if (P.w < 40) return;
      canvas.width = Math.round(P.stageW * dpr);
      canvas.height = Math.round(P.stageH * dpr);
      const across = clamp(Math.round(P.w * 1e3 / PANEL.w / 6.1), 72, 126);
      const q = across * SHEET_STONE / 1e3, W = Math.ceil(PANEL.w * q), H = Math.ceil(PANEL.h * q);
      const light = lightFor(hooks.hour), regions = regionsFor(light);
      const gen = laySteps(regions, OUTLINES, { W, H, q, s: SHEET_STONE, seed: 11 });
      let res = gen.next(), sliceStart = performance.now();
      while (!res.done) {
        if (performance.now() - sliceStart > 14) {
          await new Promise((r) => setTimeout(r, 0));
          if (!alive()) return;
          sliceStart = performance.now();
        }
        res = gen.next();
      }
      if (!alive()) return;
      const { stones } = res.value;
      const Pl = light.pal;
      for (const t of stones) {
        const ux = t.x / q + PANEL.x0, uy = t.y / q + PANEL.y0;
        t.ux = ux;
        t.uy = uy;
        if (t.k === 0) {
          t.col = shade(Pl.outline, t.h, t.h2, 0.12);
          continue;
        }
        const r = regions[t.reg];
        t.live = r.live || null;
        t.col = shade(r.fill(ux, uy), t.h, t.h2, r.group === "robot" ? 0.06 : 0.085);
        t.glass = r.live === "sun" && t.h2 > 0.62 || r.name === "sky" && t.h2 > 0.965 && uy < 520;
        t.star = r.name === "sky" && light.stars > 0.05 && t.h > 0.988 && t.h2 > 0.3 && uy < 560;
      }
      const kk = P.k * dpr / q, ox = P.x * dpr, oy = P.y * dpr;
      const sc = document.createElement("canvas");
      sc.width = canvas.width;
      sc.height = canvas.height;
      const c = sc.getContext("2d");
      const panelPath = (cc) => {
        cc.beginPath();
        cc.setTransform(P.k * dpr, 0, 0, P.k * dpr, P.x * dpr - PANEL.x0 * P.k * dpr, P.y * dpr - PANEL.y0 * P.k * dpr);
        panelShape(cc);
        cc.setTransform(1, 0, 0, 1, 0, 0);
      };
      c.save();
      panelPath(c);
      c.shadowColor = "rgba(70,52,30,.2)";
      c.shadowBlur = 22 * dpr;
      c.shadowOffsetY = 8 * dpr;
      c.fillStyle = `rgb(${Pl.grout.map((v) => v | 0).join(",")})`;
      c.fill("nonzero");
      c.restore();
      const gr = Pl.grout;
      for (const t of stones) {
        const tint = mix(gr, t.col, 0.42);
        paintStone(c, { ...t, l: t.l + t.s * 0.2, w: t.w + t.s * 0.2 }, tint, kk, ox, oy, 0, true);
      }
      for (const t of stones) paintStone(c, t, t.col, kk, ox, oy, t.glass ? 0.22 : 0);
      st.static = sc;
      st.stones = stones;
      st.light = light;
      st.kk = kk;
      st.ox = ox;
      st.oy = oy;
      st.q = q;
      st.liveStones = stones.filter((t) => t.live === "sky" || t.live === "sun" || t.glass || t.star);
      if (captionEl) {
        captionEl.textContent = `San Jose \xB7 ${light.label} \xB7 a style frame for the first place`;
        captionEl.style.left = P.x + "px";
        captionEl.style.top = P.y + P.h + 10 + "px";
        captionEl.style.width = P.w + "px";
      }
      st.ready = true;
      lastT = -1;
      render(hooks.t != null ? hooks.t : 0);
      onReady?.(light);
      if (!still && hooks.t == null) kick();
    };
    const render = (t) => {
      const c = st.ctx;
      if (!st.static) return;
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, canvas.width, canvas.height);
      c.drawImage(st.static, 0, 0);
      if (still && hooks.t == null) return;
      const L = st.light, birds = birdsAt(t), band = t * 38 % 1500 - 250, sun = L.sun;
      for (const s of st.liveStones) {
        let col = s.col, g = 0, changed = false;
        if (s.live === "sky") {
          const b = Math.exp(-(((s.ux - band + (s.uy - 300) * 0.35) / 90) ** 2)) * (1 - L.night * 0.7);
          if (b > 0.03) {
            col = mix(col, [255, 252, 238], b * 0.14);
            changed = true;
          }
          if (L.night < 0.5) {
            for (const bd of birds) if (inBird(bd, s.ux, s.uy)) {
              col = mix(s.col, L.pal.bird, 0.88);
              changed = true;
              break;
            }
          }
          if (s.star) {
            const tw = 0.55 + 0.45 * Math.sin(t * (1.3 + s.h2 * 2) + s.h * 40);
            col = mix(col, [255, 246, 214], L.stars * tw);
            changed = true;
          }
        } else if (s.live === "sun" && sun) {
          const a = Math.atan2(s.uy - sun[1], s.ux - sun[0]), ring = s.row;
          const gl = Math.max(0, Math.cos(a - t * 0.45 - ring * 0.6)) ** 12;
          if (gl > 0.02) {
            col = mix(col, [255, 250, 230], gl * 0.35);
            changed = true;
          }
        }
        if (s.glass) {
          g = 0.18 + 0.6 * Math.max(0, Math.sin(t * 0.5 + s.h * 23)) ** 14;
          changed = true;
        }
        if (changed) paintStone(c, s, col, st.kk, st.ox, st.oy, g);
      }
    };
    const frame = (now) => {
      raf = 0;
      if (disposed || document.hidden || !st.ready || !visible) return;
      const t = (now - t0) / 1e3;
      if (t - lastT > 1 / 14) {
        render(t);
        lastT = t;
      }
      raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf && st.ready && !disposed && !document.hidden && visible && !still && hooks.t == null) raf = requestAnimationFrame(frame);
    };
    const onVis = () => {
      if (!document.hidden) kick();
    };
    document.addEventListener("visibilitychange", onVis);
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
    if (hooks.t != null) window.__renderAt = (t) => {
      const a = performance.now();
      render(t);
      return performance.now() - a;
    };
    return { destroy() {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    } };
  }
  var WIDE_QUERY, SHEET_STONE, q8;
  var init_stage = __esm({
    "js/stage.js"() {
      init_core();
      init_scene();
      init_lay();
      WIDE_QUERY = "(min-aspect-ratio: 29/20) and (min-width: 1000px)";
      SHEET_STONE = 6;
      q8 = new Float32Array(8);
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
  function lane(still) {
    return ERA_LIST.map((era, index) => `<section class="ff-frame" data-frame="${era.key}" aria-labelledby="place-${era.key}">
    ${index === 0 ? `<div class="ff-intro">
      <h1>Hi, I\u2019m San.</h1>
      <p class="ff-lede">I work on language models at eBay. Before that: computer science at UC San Diego, chip design at Texas Instruments, and electrical engineering at NIT Karnataka. Along the way I co-founded <a href="${SITE}/notes/startr-postmortem">a startup that didn\u2019t make it</a>. I also write, make things, and sometimes turn an idea into a film.</p>
      <p class="ff-more"><a href="${SITE}/about">More about me</a><span class="ff-mail">san@sankala.me</span>${still ? '<a href="?">Living version</a>' : '<a href="?plain=1">Still version</a>'}</p>
      <p class="ff-cue">The window is laid in stones, in code, and keeps San Jose time.<span class="ff-clock"></span></p>
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
    const hooks = { t: num(params, "t"), hour: num(params, "hour") };
    const clock = root.querySelector(".ff-clock");
    await createStage2({
      canvas: root.querySelector(".ff-canvas"),
      stageEl: root.querySelector(".ff-stage"),
      laneEl,
      header: document.querySelector(".site-header"),
      captionEl: root.querySelector(".ff-caption"),
      hooks,
      still,
      onReady: (light) => {
        clock.textContent = `It\u2019s ${light.label} in San Jose now.`;
        root.classList.add("is-live");
        setTimeout(() => {
          window.__ready = true;
        }, hooks.t != null ? 60 : 0);
      }
    });
  }
  start();
})();
