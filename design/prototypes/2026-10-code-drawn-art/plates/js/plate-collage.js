/* Plates — October 2026, paper-cut collage. The current plate.
   This month: working out what my taste is, and whether art drawn by hand in code belongs on
   my sites. The references he gathered lie cut from coloured paper around a blank sheet: a
   book from a reading list, stacked bowls, a watercolour tin, a strip of film, light through
   leaves, a small paper robot already placed. The scissors are still out.
   Process: cut edges are clean; torn edges show the paper's white core and loose fibres. Each
   piece sits at its own height, so it casts its own soft shadow, and the shadows turn slowly
   as the afternoon light moves across the table. */
(function () {
  'use strict';
  const { rng, vnoise, hash2, canvas, clamp, sheet, hex, smooth } = window.PK;

  function cloud(w, h, sc, seed) {
    const step = Math.max(2, Math.round(4 * sc)), gw = Math.ceil(w / step) + 2, gh = Math.ceil(h / step) + 2;
    const g = new Float32Array(gw * gh);
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
      const x = i * step / sc, y = j * step / sc;
      g[j * gw + i] = vnoise(x / 14, y / 14, seed) * 0.5 + vnoise(x / 4, y / 4, seed + 3) * 0.3 + vnoise(x / 40, y / 40, seed + 6) * 0.2;
    }
    return (i, j) => {
      i = clamp(i, 0, w - 1); j = clamp(j, 0, h - 1);
      const fx = i / step, fy = j / step, xi = fx | 0, yi = fy | 0, tx = fx - xi, ty = fy - yi, k = yi * gw + xi;
      return (g[k] * (1 - tx) + g[k + 1] * tx) * (1 - ty) + (g[k + gw] * (1 - tx) + g[k + gw + 1] * tx) * ty;
    };
  }

  function area(p) { let a = 0; for (let i = 0; i < p.length; i++) { const q = p[(i + 1) % p.length]; a += p[i][0] * q[1] - q[0] * p[i][1]; } return a / 2; }

  /* Midpoint displacement along every edge: the line a tear follows. */
  function tear(poly, amp, r, iters) {
    let pts = poly.map((p) => p.slice());
    let a = amp;
    for (let it = 0; it < (iters || 5); it++) {
      const out = [];
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i], q = pts[(i + 1) % pts.length], dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy);
        out.push(p);
        if (l > 1.5) out.push([(p[0] + q[0]) / 2 - dy / l * (r() - 0.5) * a, (p[1] + q[1]) / 2 + dx / l * (r() - 0.5) * a]);
      }
      pts = out; a *= 0.52;
    }
    return pts;
  }
  /* Move each vertex inward by a slowly varying amount: how far the colour sits from the torn edge. */
  function inset(pts, dmin, dmax, seed) {
    const s = Math.sign(area(pts)) || 1, n = pts.length;
    return pts.map((p, i) => {
      const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      const d = dmin + (dmax - dmin) * vnoise(i * 0.08, 0.5, seed);
      return [p[0] - dy / l * d * s, p[1] + dx / l * d * s];
    });
  }
  function pathOf(x, pts) { x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]))); x.closePath(); }

  /* Build one paper piece as a sprite: colour, paper body, a torn white core, fibres. */
  function piece(spec, sc, cl, seed) {
    const r = rng(seed);
    const all = spec.shapes.flatMap((s) => s.pts);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    all.forEach(([px, py]) => { x0 = Math.min(x0, px); y0 = Math.min(y0, py); x1 = Math.max(x1, px); y1 = Math.max(y1, py); });
    const m = 8 * sc + 4;
    x0 = Math.floor(x0 - m); y0 = Math.floor(y0 - m); x1 = Math.ceil(x1 + m); y1 = Math.ceil(y1 + m);
    const c = canvas(x1 - x0, y1 - y0), x = c.getContext('2d');
    x.translate(-x0, -y0);
    spec.shapes.forEach((sh, si) => {
      const torn = sh.torn;
      let outer = torn ? tear(sh.pts, (sh.amp || 7) * sc, r, 6) : (sh.jag ? tear(sh.pts, 0.9 * sc, r, 3) : sh.pts);
      if (sh.hole) { x.save(); }
      if (torn) {
        // white core and loose fibres first
        x.fillStyle = sh.core || '#f7f2e6';
        pathOf(x, outer); x.fill();
        x.strokeStyle = 'rgba(250,246,236,0.75)'; x.lineWidth = 0.6 * sc; x.lineCap = 'round';
        for (let i = 0; i < outer.length; i += 2) {
          if (r() < 0.55) continue;
          const p = outer[i], q = outer[(i + 1) % outer.length], dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1;
          const s = Math.sign(area(outer)) || 1, len = (0.8 + r() * 2.6) * sc;
          x.beginPath(); x.moveTo(p[0], p[1]); x.lineTo(p[0] + dy / l * len * s + (r() - 0.5) * sc, p[1] - dx / l * len * s + (r() - 0.5) * sc); x.stroke();
        }
        outer = inset(outer, 0.6 * sc, (sh.core ? 2.2 : 3.4) * sc, seed + si);
      }
      x.fillStyle = sh.color;
      pathOf(x, outer); x.fill(sh.rule || 'nonzero');
      if (sh.holes) {
        x.globalCompositeOperation = 'destination-out';
        sh.holes.forEach((hp) => { pathOf(x, hp); x.fill(); });
        x.globalCompositeOperation = 'source-over';
      }
    });
    // paper body: fibre cloud, flecks, and a hint of light across the sheet
    const img = x.getImageData(0, 0, c.width, c.height), d = img.data;
    const fl = spec.flecks === undefined ? 1 : spec.flecks;
    for (let j = 0; j < c.height; j++) for (let i = 0; i < c.width; i++) {
      const k = (j * c.width + i) * 4;
      if (d[k + 3] === 0) continue;
      const gx = x0 + i, gy = y0 + j;
      const mo = cl(gx + seed * 13, gy);
      const fib = vnoise(gx * 0.7 / sc, gy * 0.09 / sc, seed) - 0.5;
      let f = 1 + (mo - 0.5) * 0.12 + fib * 0.035 + (hash2(gx, gy, seed) - 0.5) * 0.03;
      f *= 1.03 - 0.06 * ((i / c.width) * 0.6 + (j / c.height) * 0.4);
      if (fl && hash2(gx >> 1, gy >> 1, seed + 9) > 1 - 0.0025 * fl) f *= 0.72 + hash2(gx, gy, 3) * 0.5;
      d[k] = clamp(d[k] * f, 0, 255); d[k + 1] = clamp(d[k + 1] * f, 0, 255); d[k + 2] = clamp(d[k + 2] * f, 0, 255);
    }
    x.putImageData(img, 0, 0);
    // soft shadow mask: blur by shrinking and growing the silhouette
    const k = Math.max(2, Math.round((spec.h || 4) * sc * 0.9));
    const sm = canvas(c.width / k + 2, c.height / k + 2), smx = sm.getContext('2d');
    smx.imageSmoothingEnabled = true; smx.drawImage(c, 1, 1, c.width / k, c.height / k);
    smx.globalCompositeOperation = 'source-in'; smx.fillStyle = '#1b130c'; smx.fillRect(0, 0, sm.width, sm.height);
    const sh = canvas(c.width, c.height), shx = sh.getContext('2d');
    shx.imageSmoothingEnabled = true; shx.imageSmoothingQuality = 'high'; shx.drawImage(sm, -k, -k, c.width + 2 * k, c.height + 2 * k);
    return { c, sh, x: x0, y: y0, h: spec.h || 4, rock: spec.rock || 0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
  }

  /* Geometry helpers in sheet units. */
  function rect(S, u, v, w, h, rot) {
    const cx = S.X(u), cy = S.Y(v), c = Math.cos(rot || 0), s = Math.sin(rot || 0);
    return [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(([a, b]) => [cx + S.L(a * c - b * s), cy + S.L(a * s + b * c)]);
  }
  function ellipsePts(S, u, v, rx, ry, rot, a0, a1, n) {
    const cx = S.X(u), cy = S.Y(v), c = Math.cos(rot || 0), s = Math.sin(rot || 0), out = [];
    for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n, px = Math.cos(a) * rx, py = Math.sin(a) * ry; out.push([cx + S.L(px * c - py * s), cy + S.L(px * s + py * c)]); }
    return out;
  }
  function xf(S, u, v, rot, pts) {
    const cx = S.X(u), cy = S.Y(v), c = Math.cos(rot), s = Math.sin(rot);
    return pts.map(([a, b]) => [cx + S.L(a * c - b * s), cy + S.L(a * s + b * c)]);
  }

  const PAL = { field: '#d4862e', sheet: '#f1e8d4', red: '#a83228', cream: '#efe2c2', ink: '#1e1b20', teal: '#2c7470', brown: '#5a3a26', gray: '#9a9790', steel: '#c9c6bd', cobalt: '#2f50cb', ver: '#d24a2c', yellow: '#f2cf55', olive: '#56632e', pink: '#e79aa6', green: '#4f8a5a', sky: '#8fb4d6', white: '#faf6ec' };

  function compose(w, h, S, cl) {
    const sc = S.s / 600, P = [];
    let seed = 1000;
    const add = (spec) => P.push(piece(spec, sc, cl, seed++));

    // the blank sheet everything is being arranged on, pencil marks to come
    add({ h: 2.5, flecks: 0.3, shapes: [{ pts: rect(S, 0.5, 0.64, 0.5, 0.6, 0.025), color: PAL.sheet, jag: true }] });

    // offcuts under things
    const r = rng(42);
    for (let i = 0; i < 9; i++) {
      const u = [0.1, 0.9, 0.18, 0.84, 0.06, 0.94, 0.3, 0.72, 0.5][i], v = [0.5, 0.46, 1.16, 1.02, 0.86, 0.74, 0.08, 0.12, 1.2][i];
      const col = [PAL.pink, PAL.sky, PAL.olive, PAL.cream, PAL.ver, PAL.teal, PAL.yellow, PAL.white, PAL.green][i];
      const a = r() * Math.PI, l = 0.03 + r() * 0.05, wd = 0.006 + r() * 0.012;
      add({ h: 1.5, shapes: [{ pts: [[S.X(u), S.Y(v)], [S.X(u + Math.cos(a) * l), S.Y(v + Math.sin(a) * l)], [S.X(u + Math.cos(a) * l - Math.sin(a) * wd), S.Y(v + Math.sin(a) * l + Math.cos(a) * wd)], [S.X(u - Math.sin(a) * wd * 0.4), S.Y(v + Math.cos(a) * wd * 0.4)]], color: col, torn: r() < 0.4, amp: 2 }] });
    }

    // on the sheet, half made: a strip of sky, a torn sun, a hill, the small robot standing on it
    add({ h: 1.8, shapes: [{ pts: rect(S, 0.5, 0.49, 0.38, 0.14, 0.02), color: PAL.sky, torn: true, amp: 6 }] });
    add({ h: 2.4, shapes: [{ pts: ellipsePts(S, 0.6, 0.465, 0.062, 0.058, 0, 0, Math.PI * 2, 28), color: PAL.yellow, torn: true, amp: 8 }] });
    const hill = [];
    for (let i = 0; i <= 24; i++) { const t = i / 24; hill.push([S.X(0.31 + t * 0.385), S.Y(0.585 - 0.03 * Math.sin(t * Math.PI * 1.15 + 0.3) - 0.012 * Math.sin(t * 9))]); }
    hill.push([S.X(0.695), S.Y(0.64)], [S.X(0.31), S.Y(0.645)]);
    add({ h: 2.2, shapes: [{ pts: hill, color: PAL.green, torn: true, amp: 4 }] });
    // the paper robot: cobalt head with a folded white corner, round eyes, a vermilion ear
    const rb = { u: 0.42, v: 0.585, rot: -0.04 };
    add({ h: 3.2, shapes: [
      { pts: xf(S, rb.u, rb.v, rb.rot, [[-0.026, 0.03], [0.026, 0.03], [0.026, 0.085], [-0.026, 0.085]]), color: PAL.cobalt },
      { pts: xf(S, rb.u, rb.v, rb.rot, [[-0.02, 0.085], [-0.006, 0.085], [-0.006, 0.112], [-0.02, 0.112]]), color: PAL.cobalt },
      { pts: xf(S, rb.u, rb.v, rb.rot, [[0.006, 0.085], [0.02, 0.085], [0.02, 0.112], [0.006, 0.112]]), color: PAL.cobalt },
      { pts: xf(S, rb.u, rb.v, rb.rot, [[-0.042, -0.05], [0.042, -0.05], [0.042, 0.03], [-0.042, 0.03]]), color: PAL.cobalt },
      { pts: xf(S, rb.u, rb.v, rb.rot, [[0.042, -0.05], [0.017, -0.05], [0.042, -0.025]]), color: PAL.white },
    ] });
    add({ h: 3.6, shapes: [
      { pts: ellipsePts(S, rb.u - 0.016, rb.v - 0.012, 0.0115, 0.0115, 0, 0, Math.PI * 2, 18), color: PAL.white },
      { pts: ellipsePts(S, rb.u + 0.015, rb.v - 0.014, 0.0115, 0.0115, 0, 0, Math.PI * 2, 18), color: PAL.white },
      { pts: ellipsePts(S, rb.u + 0.048, rb.v - 0.006, 0.009, 0.012, 0, 0, Math.PI * 2, 18), color: PAL.ver },
    ] });
    add({ h: 3.9, flecks: 0, shapes: [
      { pts: ellipsePts(S, rb.u - 0.013, rb.v - 0.01, 0.0048, 0.0048, 0, 0, Math.PI * 2, 12), color: PAL.ink },
      { pts: ellipsePts(S, rb.u + 0.018, rb.v - 0.012, 0.0048, 0.0048, 0, 0, Math.PI * 2, 12), color: PAL.ink },
    ] });

    // around the sheet: the references
    // a book from a reading list
    add({ h: 5, shapes: [
      { pts: rect(S, 0.16, 0.2, 0.2, 0.28, -0.16), color: PAL.red },
      { pts: xf(S, 0.16, 0.2, -0.16, [[-0.085, -0.03], [0.085, -0.03], [0.085, 0.03], [-0.085, 0.03]]), color: PAL.cream },
      { pts: xf(S, 0.16, 0.2, -0.16, [[-0.06, -0.012], [0.05, -0.012], [0.05, -0.002], [-0.06, -0.002]]), color: PAL.ink },
      { pts: xf(S, 0.16, 0.2, -0.16, [[-0.06, 0.006], [0.02, 0.006], [0.02, 0.014], [-0.06, 0.014]]), color: PAL.ink },
      { pts: xf(S, 0.16, 0.2, -0.16, [[-0.08, 0.1], [0.08, 0.1], [0.08, 0.106], [-0.08, 0.106]]), color: PAL.yellow },
    ] });
    // stacked bowls, seen from the side
    const bowl = (u, v, rw, rh, col, rim) => [{ pts: ellipsePts(S, u, v, rw, rh, 0, 0, Math.PI, 26).concat([[S.X(u - rw), S.Y(v)]]), color: col }, { pts: rect(S, u, v - 0.004, rw * 2 + 0.006, 0.012, 0), color: rim }];
    add({ h: 4.6, shapes: [].concat(bowl(0.84, 0.25, 0.115, 0.075, PAL.teal, '#3e8a85'), bowl(0.84, 0.205, 0.09, 0.055, PAL.cream, '#f7efdc'), bowl(0.84, 0.17, 0.065, 0.04, PAL.brown, '#6e4a33')) });
    // a watercolour tin and its pans
    const tinSh = [{ pts: rect(S, 0.15, 1.02, 0.22, 0.13, 0.12), color: PAL.steel, jag: true }];
    const pans = ['#d9442e', '#e9a23b', '#f2d54a', '#5f9c4b', '#2d6f8f', '#2b3f8f', '#8a3d7a', '#e58da0', '#7b4a2f', '#2e2b2c', '#b6c95a', '#5fb4b0'];
    pans.forEach((col, i) => { const cu = -0.075 + (i % 6) * 0.03, cv = -0.022 + Math.floor(i / 6) * 0.044; tinSh.push({ pts: xf(S, 0.15, 1.02, 0.12, [[cu - 0.011, cv - 0.016], [cu + 0.011, cv - 0.016], [cu + 0.011, cv + 0.016], [cu - 0.011, cv + 0.016]]), color: col }); });
    add({ h: 4.2, shapes: tinSh });
    // a strip of film
    const film = { u: 0.86, v: 1.06, rot: -0.42 };
    const holes = [];
    for (let i = 0; i < 9; i++) { const fu = -0.13 + i * 0.032; holes.push(xf(S, film.u, film.v, film.rot, [[fu - 0.006, -0.038], [fu + 0.006, -0.038], [fu + 0.006, -0.03], [fu - 0.006, -0.03]])); holes.push(xf(S, film.u, film.v, film.rot, [[fu - 0.006, 0.03], [fu + 0.006, 0.03], [fu + 0.006, 0.038], [fu - 0.006, 0.038]])); }
    add({ h: 4, shapes: [
      { pts: xf(S, film.u, film.v, film.rot, [[-0.15, -0.046], [0.15, -0.046], [0.15, 0.046], [-0.15, 0.046]]), color: PAL.ink, holes },
      { pts: xf(S, film.u, film.v, film.rot, [[-0.13, -0.022], [-0.05, -0.022], [-0.05, 0.022], [-0.13, 0.022]]), color: '#e8c35a' },
      { pts: xf(S, film.u, film.v, film.rot, [[-0.04, -0.022], [0.04, -0.022], [0.04, 0.022], [-0.04, 0.022]]), color: '#d76b4b' },
      { pts: xf(S, film.u, film.v, film.rot, [[0.05, -0.022], [0.13, -0.022], [0.13, 0.022], [0.05, 0.022]]), color: '#4b6fb0' },
    ] });
    // scissors, still open
    const sci = { u: 0.74, v: 0.86, rot: 0.55 };
    add({ h: 6.5, flecks: 0, shapes: [
      { pts: xf(S, sci.u, sci.v, sci.rot - 0.16, [[0, -0.008], [0.2, -0.003], [0.205, 0.004], [0, 0.012]]), color: PAL.steel },
      { pts: xf(S, sci.u, sci.v, sci.rot + 0.16, [[0, -0.012], [0.2, -0.004], [0.205, 0.003], [0, 0.008]]), color: '#b4b1a8' },
      { pts: ellipsePts(S, sci.u - Math.cos(sci.rot - 0.5) * 0.05, sci.v - Math.sin(sci.rot - 0.5) * 0.05, 0.03, 0.022, sci.rot - 0.5, 0, Math.PI * 2, 22), color: PAL.ink, holes: [ellipsePts(S, sci.u - Math.cos(sci.rot - 0.5) * 0.05, sci.v - Math.sin(sci.rot - 0.5) * 0.05, 0.018, 0.011, sci.rot - 0.5, 0, Math.PI * 2, 22)] },
      { pts: ellipsePts(S, sci.u - Math.cos(sci.rot + 0.5) * 0.05, sci.v - Math.sin(sci.rot + 0.5) * 0.05, 0.03, 0.022, sci.rot + 0.5, 0, Math.PI * 2, 22), color: PAL.ink, holes: [ellipsePts(S, sci.u - Math.cos(sci.rot + 0.5) * 0.05, sci.v - Math.sin(sci.rot + 0.5) * 0.05, 0.018, 0.011, sci.rot + 0.5, 0, Math.PI * 2, 22)] },
      { pts: ellipsePts(S, sci.u, sci.v, 0.007, 0.007, 0, 0, Math.PI * 2, 10), color: '#77746c' },
    ] });
    // a curled offcut that rocks a little when the air moves
    add({ h: 5, rock: 1, shapes: [{ pts: [[S.X(0.6), S.Y(0.24)], [S.X(0.72), S.Y(0.205)], [S.X(0.725), S.Y(0.222)], [S.X(0.61), S.Y(0.258)]], color: PAL.pink, torn: true, amp: 2.5 }] });
    return P;
  }

  function fieldCanvas(w, h, S, cl) {
    const c = canvas(w, h), x = c.getContext('2d'), base = hex(PAL.field);
    const img = x.createImageData(w, h), d = img.data, sc = S.s / 600;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const k = (j * w + i) * 4, mo = cl(i, j), fib = vnoise(i * 0.6 / sc, j * 0.08 / sc, 5) - 0.5;
      let f = 1 + (mo - 0.5) * 0.14 + fib * 0.04 + (hash2(i, j, 8) - 0.5) * 0.035;
      if (hash2(i >> 1, j >> 1, 31) > 0.9975) f *= 0.75;
      d[k] = base[0] * f; d[k + 1] = base[1] * f; d[k + 2] = base[2] * f; d[k + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    return c;
  }

  function pencil(x, S) {
    // registration crosses and a light guide box on the blank sheet
    const r = rng(1010), sc = S.s / 600;
    x.save(); x.translate(S.X(0.5), S.Y(0.64)); x.rotate(0.025); x.translate(-S.X(0.5), -S.Y(0.64));
    const line = (ax, ay, bx, by) => {
      const n = Math.ceil(Math.hypot(bx - ax, by - ay) / (0.8 * sc));
      for (let i = 0; i <= n; i++) { const t = i / n; x.fillStyle = `rgba(60,58,62,${0.12 + r() * 0.25})`; x.fillRect(ax + (bx - ax) * t + (r() - 0.5) * sc * 0.6, ay + (by - ay) * t + (r() - 0.5) * sc * 0.6, 0.9 * sc, 0.9 * sc); }
    };
    [[0.29, 0.38], [0.71, 0.38], [0.29, 0.9], [0.71, 0.9]].forEach(([u, v]) => { line(S.X(u - 0.02), S.Y(v), S.X(u + 0.02), S.Y(v)); line(S.X(u), S.Y(v - 0.02), S.X(u), S.Y(v + 0.02)); });
    line(S.X(0.3), S.Y(0.86), S.X(0.7), S.Y(0.86)); line(S.X(0.3), S.Y(0.875), S.X(0.56), S.Y(0.875));
    x.restore();
  }

  const def = {
    words: 'Working out what my taste is',
    process: 'paper-cut collage',
    alt: 'cut and torn paper references — a red book, stacked bowls, a watercolour tin, a film strip, a torn sun behind leaves, a small cobalt robot head — arranged around a blank sheet, with open scissors.',
    fps: 24,
    still: 6,
    build(w, h) {
      const S = sheet(w, h), sc = S.s / 600, cl = cloud(w, h, sc, 1026);
      const field = fieldCanvas(w, h, S, cl);
      const P = compose(w, h, S, cl);
      // pencil marks go onto the sheet sprite itself
      const sh0 = P[0], px = sh0.c.getContext('2d');
      px.save(); px.translate(-sh0.x, -sh0.y); px.globalCompositeOperation = 'source-atop'; pencil(px, S); px.restore();
      // offcuts scattered into the margins when the canvas is wider than the sheet
      return { w, h, S, sc, field, P };
    },
    draw(ctx, st, t) {
      const { S, P, sc } = st;
      ctx.drawImage(st.field, 0, 0);
      // the afternoon light swings across the table: shadows turn and stretch
      const ph = t / 16 * Math.PI * 2;
      const phi = 0.95 + 0.62 * Math.sin(ph), len = 1.1 + 0.45 * Math.sin(ph + 1.1);
      const ox = Math.cos(phi) * len, oy = Math.sin(phi) * len;
      for (const p of P) {
        const rock = p.rock ? Math.sin(t / 16 * Math.PI * 2 * 3) * 0.09 : 0;
        const lift = p.rock ? (0.6 + 0.4 * Math.sin(t / 16 * Math.PI * 2 * 3 + 1.2)) : 1;
        const d = p.h * sc * 1.55 * lift;
        ctx.save();
        if (rock) { ctx.translate(p.cx, p.cy); ctx.rotate(rock); ctx.translate(-p.cx, -p.cy); }
        ctx.globalAlpha = clamp(0.32 + p.h * 0.045, 0, 0.62);
        ctx.drawImage(p.sh, p.x + ox * d, p.y + oy * d);
        ctx.globalAlpha = 1;
        ctx.drawImage(p.c, p.x, p.y);
        ctx.restore();
      }
    },
    label(ctx, st, name) {
      const S = st.S, sc = st.sc, fs = Math.round(S.L(0.07));
      const text = name.toUpperCase();
      ctx.save();
      ctx.font = `${fs}px "Archivo Black", Impact, sans-serif`;
      let x = Math.max(S.L(0.05), S.X(0.05)); const y = st.h - Math.max(fs * 0.55, S.L(0.04));
      const r = rng(77);
      for (const ch of text) {
        const wch = ctx.measureText(ch).width;
        if (ch !== ' ') {
          ctx.save(); ctx.translate(x + wch / 2, y - fs * 0.35); ctx.rotate((r() - 0.5) * 0.12);
          ctx.fillStyle = 'rgba(27,19,12,0.3)'; ctx.fillText(ch, -wch / 2 + 2.5 * sc, fs * 0.35 + 3 * sc);
          ctx.fillStyle = '#faf6ec'; ctx.fillText(ch, -wch / 2, fs * 0.35);
          ctx.restore();
        }
        x += wch * 1.02;
      }
      ctx.restore();
    },
  };
  (window.PLATE_DEFS = window.PLATE_DEFS || {})['2026-10'] = def;
})();
