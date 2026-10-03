/* Plates — shared kit: seeded randomness, noise, float buffers, paper, and one shared
   WebGL2 context that plates borrow for their per-pixel passes. */
(function () {
  'use strict';

  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hash2(x, y, s) {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1442695041)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }

  function vnoise(x, y, s) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash2(xi, yi, s), b = hash2(xi + 1, yi, s), c = hash2(xi, yi + 1, s), d = hash2(xi + 1, yi + 1, s);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }

  function fbm(x, y, s, oct) {
    let f = 0, amp = 0.5, fr = 1, n = 0;
    for (let i = 0; i < (oct || 4); i++) { f += amp * vnoise(x * fr, y * fr, s + i * 131); n += amp; amp *= 0.5; fr *= 2.03; }
    return f / n;
  }

  function canvas(w, h) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
    return c;
  }

  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(e0, e1, x) { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); }

  function hex(c) {
    const n = parseInt(c.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgb(a, alpha) {
    return alpha === undefined ? `rgb(${a[0] | 0},${a[1] | 0},${a[2] | 0})` : `rgba(${a[0] | 0},${a[1] | 0},${a[2] | 0},${alpha})`;
  }
  function mix3(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }

  /* Separable box blur on a Float32 buffer; three passes approximate a gaussian. */
  function blurF32(src, w, h, r, passes) {
    r = Math.max(0, Math.round(r));
    if (r === 0) return src.slice();
    let a = src.slice(), b = new Float32Array(src.length);
    const inv = 1 / (2 * r + 1);
    for (let p = 0; p < (passes || 3); p++) {
      for (let y = 0; y < h; y++) {
        const o = y * w;
        let acc = 0;
        for (let i = -r; i <= r; i++) acc += a[o + clamp(i, 0, w - 1)];
        for (let x = 0; x < w; x++) {
          b[o + x] = acc * inv;
          acc += a[o + Math.min(w - 1, x + r + 1)] - a[o + Math.max(0, x - r)];
        }
      }
      for (let x = 0; x < w; x++) {
        let acc = 0;
        for (let i = -r; i <= r; i++) acc += b[clamp(i, 0, h - 1) * w + x];
        for (let y = 0; y < h; y++) {
          a[y * w + x] = acc * inv;
          acc += b[Math.min(h - 1, y + r + 1) * w + x] - b[Math.max(0, y - r) * w + x];
        }
      }
    }
    return a;
  }

  /* The composition lives in a 4:5 "safe" sheet centred in any w×h; the ground fills the rest.
     u runs 0..1 across, v runs 0..1.25 down, both scaled by the sheet width. */
  function sheet(w, h) {
    const sw = Math.min(w, h * 0.8), sh = sw * 1.25;
    const x = (w - sw) / 2, y = (h - sh) / 2;
    return { x, y, w: sw, h: sh, s: sw, X: (u) => x + u * sw, Y: (v) => y + v * sw, L: (d) => d * sw };
  }

  /* One shared WebGL2 context. Plates render into it and copy the result out immediately. */
  const GL = (function () {
    let cv = null, gl = null, vao = null;
    const progs = {};
    const VS = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;
    function init() {
      if (gl) return gl;
      cv = document.createElement('canvas');
      gl = cv.getContext('webgl2', { preserveDrawingBuffer: true, premultipliedAlpha: false, antialias: false });
      if (!gl) return null;
      vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      return gl;
    }
    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    }
    function program(key, fs) {
      if (!init()) return null;
      if (progs[key]) return progs[key];
      const p = gl.createProgram();
      gl.attachShader(p, compile(gl.VERTEX_SHADER, VS));
      gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
      gl.bindAttribLocation(p, 0, 'p');
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      progs[key] = { p, loc: {} };
      return progs[key];
    }
    function texture(source, opts) {
      init();
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      const wrap = opts && opts.repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
      const filt = opts && opts.nearest ? gl.NEAREST : gl.LINEAR;
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filt);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filt);
      update(t, source);
      return t;
    }
    function update(t, source) {
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      if (source.data && source.width && !(source instanceof ImageData) && source.data instanceof Uint8Array) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, source.width, source.height, 0, gl.RED, gl.UNSIGNED_BYTE, source.data);
      } else {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      }
    }
    function run(key, fs, w, h, uniforms, textures) {
      const pr = program(key, fs);
      if (!pr) return null;
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      gl.viewport(0, 0, w, h);
      gl.useProgram(pr.p);
      gl.bindVertexArray(vao);
      let unit = 0;
      for (const name in (textures || {})) {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, textures[name]);
        const l = pr.loc[name] !== undefined ? pr.loc[name] : (pr.loc[name] = gl.getUniformLocation(pr.p, name));
        gl.uniform1i(l, unit++);
      }
      for (const name in (uniforms || {})) {
        const [type, ...vals] = uniforms[name];
        const l = pr.loc[name] !== undefined ? pr.loc[name] : (pr.loc[name] = gl.getUniformLocation(pr.p, name));
        if (l === null) continue;
        if (type === '1f') gl.uniform1f(l, vals[0]);
        else if (type === '2f') gl.uniform2f(l, vals[0], vals[1]);
        else if (type === '3f') gl.uniform3f(l, vals[0], vals[1], vals[2]);
        else if (type === '1i') gl.uniform1i(l, vals[0]);
        else if (type === '4fv') gl.uniform4fv(l, vals[0]);
        else if (type === '3fv') gl.uniform3fv(l, vals[0]);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      return cv;
    }
    return { init, program, texture, update, run, get canvas() { return cv; }, get gl() { return gl; } };
  })();

  /* Paper: a warm sheet with long fibres, mottling and a few inclusions. Returned as a canvas. */
  function paper(w, h, opts) {
    const o = Object.assign({ base: '#f1ece1', mottle: 0.035, fibres: 1, flecks: 0.6, seed: 7, scale: 1 }, opts || {});
    const c = canvas(w, h), x = c.getContext('2d');
    const base = hex(o.base);
    const img = x.createImageData(c.width, c.height), d = img.data;
    const sc = 1 / (420 * o.scale);
    // the slow mottling is computed on a coarse grid and interpolated; fibre and grain stay per pixel
    const step = 8, gw = Math.ceil(c.width / step) + 2, gh = Math.ceil(c.height / step) + 2, G = new Float32Array(gw * gh);
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) G[j * gw + i] = (fbm(i * step * sc, j * step * sc, o.seed, 4) - 0.5) * 2;
    for (let j = 0; j < c.height; j++) {
      const fy = j / step, yi = fy | 0, ty = fy - yi;
      for (let i = 0; i < c.width; i++) {
        const fx = i / step, xi = fx | 0, tx = fx - xi, q = yi * gw + xi;
        const m = (G[q] * (1 - tx) + G[q + 1] * tx) * (1 - ty) + (G[q + gw] * (1 - tx) + G[q + gw + 1] * tx) * ty;
        const f = (vnoise(i * 0.9 / o.scale, j * 0.07 / o.scale, o.seed + 9) - 0.5) * 0.5 + (hash2(i, j, o.seed) - 0.5) * 0.35;
        const k = 1 + m * o.mottle + f * 0.018;
        const p = (j * c.width + i) * 4;
        d[p] = base[0] * k; d[p + 1] = base[1] * k; d[p + 2] = base[2] * k; d[p + 3] = 255;
      }
    }
    x.putImageData(img, 0, 0);
    const r = rng(o.seed * 31 + 5);
    const nF = Math.round(c.width * c.height / 1400 * o.fibres);
    x.lineCap = 'round';
    for (let i = 0; i < nF; i++) {
      const px = r() * c.width, py = r() * c.height, len = (6 + r() * 30) * o.scale, a = r() * Math.PI * 2, bend = (r() - 0.5) * 0.8;
      x.strokeStyle = r() < 0.5 ? rgb(base.map((v) => v * 0.86), 0.12 + r() * 0.1) : rgb(base.map((v) => Math.min(255, v * 1.06)), 0.25);
      x.lineWidth = (0.35 + r() * 0.6) * o.scale;
      x.beginPath(); x.moveTo(px, py);
      x.quadraticCurveTo(px + Math.cos(a + bend) * len * 0.5, py + Math.sin(a + bend) * len * 0.5, px + Math.cos(a) * len, py + Math.sin(a) * len);
      x.stroke();
    }
    const nK = Math.round(c.width * c.height / 9000 * o.flecks);
    for (let i = 0; i < nK; i++) {
      x.fillStyle = rgb(base.map((v) => v * (0.7 + r() * 0.2)), 0.25 + r() * 0.3);
      const s = (0.4 + r() * 1.1) * o.scale;
      x.fillRect(r() * c.width, r() * c.height, s, s * (0.6 + r()));
    }
    return c;
  }

  window.PK = { rng, hash2, vnoise, fbm, canvas, clamp, lerp, smooth, hex, rgb, mix3, blurF32, sheet, GL, paper };
})();
