/* The apse in mosaic: material light.
   Gold smalti are little mirrors, and a mosaicist sets each one at a slightly different angle, so a
   gold ground never shines evenly: as you move, a soft glow drifts across it and single stones
   flare and go dark. This layer does that. Every gold, silver and glass stone is uploaded once,
   with its own tilt (a random angle plus a slow, patchy drift across the wall, as hands set them;
   the conch is also concave, so its stones lean toward its middle). Each frame a WebGL pass lights
   them from one point (the pointer, a tilted phone, or a slow drift) and lays the light over the
   painted mosaic: a broad sheen, a sharp glint, and a little darkening for stones turned away.
   Glass (the lapis, the gems, the screen) only takes a small, sharp, white glint; matte stone none.
   Stones never move; only their light changes. Stones are uploaded once, in apse units, and placed on
   the canvas by a uniform, so a resize never re-uploads them; stones left of `minX` (the words'
   column) are never lit. */

const VS = `
attribute vec2 aPos; attribute vec2 aCen; attribute vec2 aN; attribute vec2 aB; attribute vec3 aCol; attribute vec2 aMat;
uniform vec2 uRes; uniform int uMode; uniform float uLo; uniform float uHi; uniform vec3 uXf; uniform float uMinX;
varying vec2 vCen; varying vec2 vN; varying vec2 vB; varying vec3 vCol; varying float vMat; varying vec2 vPos;
void main() {
  // stones arrive in apse units; uXf = (device px per unit, origin x, origin y)
  vec2 pos = aPos * uXf.x + uXf.yz, cen = aCen * uXf.x + uXf.yz;
  bool hide = (uMode == 1 && aMat.y <= uHi) || (uMode == 2 && aMat.y >= uLo) || cen.x < uMinX;
  vec2 p = hide ? vec2(-9.0) : (pos / uRes * 2.0 - 1.0) * vec2(1.0, -1.0);
  vCen = cen; vN = aN; vB = aB; vCol = aCol; vMat = aMat.x; vPos = cen + (pos - cen) * (0.72 / max(uXf.x, 0.2));
  gl_Position = vec4(p, 0.0, 1.0);
}`;
const FS = `
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

export function createGlint(canvas) {
  let gl = null;
  try { gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false, preserveDrawingBuffer: false }); } catch (e) { gl = null; }
  if (!gl) return null;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const prog = gl.createProgram();
  try { gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog); } catch (e) { return null; }
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const A = n => gl.getAttribLocation(prog, n), U = n => gl.getUniformLocation(prog, n);
  const at = { pos: A('aPos'), cen: A('aCen'), n: A('aN'), b: A('aB'), col: A('aCol'), mat: A('aMat') };
  const un = { res: U('uRes'), mode: U('uMode'), lo: U('uLo'), hi: U('uHi'), light: U('uLight'), view: U('uView'), gain: U('uGain'), xf: U('uXf'), minX: U('uMinX') };
  const bufs = new Map();
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  const STRIDE = 13;

  return {
    /** pack: { data: Float32Array of GLINT_STRIDE (build.js) per stone, count } */
    upload(key, pack) {
      const old = bufs.get(key); if (old) gl.deleteBuffer(old.buf);
      const src = pack.data, n = pack.count, data = new Float32Array(n * 6 * STRIDE);
      let o = 0;
      for (let i = 0; i < n; i++) {
        const b = i * 19;
        for (const k of [0, 1, 2, 0, 2, 3]) {
          data[o++] = src[b + k * 2]; data[o++] = src[b + k * 2 + 1];
          for (let j = 8; j < 19; j++) data[o++] = src[b + j];
        }
      }
      const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      bufs.set(key, { buf, n: n * 6 });
    },
    has: key => bufs.has(key),
    drop(key) { const b = bufs.get(key); if (b) { gl.deleteBuffer(b.buf); bufs.delete(key); } },
    clearAll() { for (const k of [...bufs.keys()]) this.drop(k); },
    clear() { gl.viewport(0, 0, canvas.width, canvas.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); },
    /** light, view: [x, y, z] device px; xf: [px per unit, origin x, origin y]; draws: [{ key, mode, lo, hi }] */
    draw(light, view, xf, minX, draws, gain = 1) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(un.res, canvas.width, canvas.height);
      gl.uniform3f(un.light, light[0], light[1], light[2]); gl.uniform3f(un.view, view[0], view[1], view[2]); gl.uniform1f(un.gain, gain);
      gl.uniform3f(un.xf, xf[0], xf[1], xf[2]); gl.uniform1f(un.minX, minX);
      for (const d of draws) {
        const b = bufs.get(d.key); if (!b) continue;
        gl.bindBuffer(gl.ARRAY_BUFFER, b.buf);
        const F = 4 * STRIDE;
        gl.enableVertexAttribArray(at.pos); gl.vertexAttribPointer(at.pos, 2, gl.FLOAT, false, F, 0);
        gl.enableVertexAttribArray(at.cen); gl.vertexAttribPointer(at.cen, 2, gl.FLOAT, false, F, 8);
        gl.enableVertexAttribArray(at.n); gl.vertexAttribPointer(at.n, 2, gl.FLOAT, false, F, 16);
        gl.enableVertexAttribArray(at.b); gl.vertexAttribPointer(at.b, 2, gl.FLOAT, false, F, 24);
        gl.enableVertexAttribArray(at.col); gl.vertexAttribPointer(at.col, 3, gl.FLOAT, false, F, 32);
        gl.enableVertexAttribArray(at.mat); gl.vertexAttribPointer(at.mat, 2, gl.FLOAT, false, F, 44);
        gl.uniform1i(un.mode, d.mode || 0); gl.uniform1f(un.lo, d.lo ?? 0); gl.uniform1f(un.hi, d.hi ?? 0);
        gl.drawArrays(gl.TRIANGLES, 0, b.n);
      }
    },
    lost: () => gl.isContextLost(),
  };
}
