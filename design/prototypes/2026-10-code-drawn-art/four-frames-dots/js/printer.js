/* Four frames in print: the press. Takes the separated artwork (a colour layer and a key layer)
   and prints it on warm paper, plate by plate: each ink through its own dot screen at its own
   angle, solid where the artwork is solid, the line work in solid key, each plate a hair out of
   register. Between two places the next sheet is printed ink by ink: a roller carries each plate
   across from the right, lightest ink first, registering into place as it settles. */
import { PAPER_RGB, INK_RGB, INKS, buildLUT } from './plates.js';

const VS = `#version 300 es
in vec2 aPos; void main() { gl_Position = vec4(aPos, 0., 1.); }`;

const FS = `#version 300 es
precision highp float;
precision highp sampler3D;
uniform sampler2D uColA, uKeyA, uColB, uKeyB;
uniform sampler3D uLut, uLutK;
uniform sampler2D uNoise;   // tileable value noise, four octaves in RGBA
uniform vec2 uRes;          // output, device px
uniform float uCell;        // dot pitch, device px
uniform float uTau;         // 0 … 1 through the change to the next place (0 = none)
uniform float uLutN;
uniform vec3 uPaper;
uniform vec3 uInk[5];
uniform vec2 uOff[5];       // misregistration, device px
uniform float uAng[5];
uniform float uSeed;
out vec4 frag;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
/* value noise from the texture: one lookup instead of four hashes (channel r: 1 cell = 1 unit) */
float vnoise(vec2 p) { return texture(uNoise, p / 64.).r; }
vec4 lutC(vec3 c) { vec3 t = (c * (uLutN - 1.) + .5) / uLutN; return texture(uLut, t); }
float lutK(vec3 c) { vec3 t = (c * (uLutN - 1.) + .5) / uLutN; return texture(uLutK, t).r; }

/* one ink through its screen: coverage c → a dot (round at low coverage, joined in a checker at
   half, holes in solid at high), crisp at the edge */
float screen(vec2 q, float ang, float c, float seed) {
  if (c < .045) return 0.;
  if (c > .86) return 1.;
  float s = sin(ang), co = cos(ang);
  vec2 r = mat2(co, -s, s, co) * q / uCell;
  vec2 f = fract(r) - .5;
  float T = .5 - .25 * (cos(6.2831853 * f.x) + cos(6.2831853 * f.y));
  T += (vnoise(q * .45 + seed) - .5) * .06;          // a little ink spread at the dot's edge
  float w = 1.1 / uCell;
  return smoothstep(T - w, T + w, c);
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 res = uRes;
  float xn = p.x / res.x;
  // paper: warm, with the faintest tooth
  float tooth = .992 + .008 * vnoise(p * .9 + 7.) - .006 * smoothstep(.72, 1., vnoise(p * .08 + 3.));
  vec3 col = uPaper * tooth;
  // the change to the next place: a fresh sheet slides in from the right over the last print,
  // then the next place is printed onto it ink by ink, each plate rolled across right to left
  float sheetEdge = 1. - clamp(uTau / .24, 0., 1.) * 1.08;
  bool covered = uTau > 0. && xn > sheetEdge;
  for (int k = 0; k < 5; k++) {
    float start = .1 + float(k) * .135, pk = clamp((uTau - start) / .28, 0., 1.);
    float edge = 1. - pk * 1.1 + (vnoise(vec2(p.y * .012, float(k) * 3.1)) - .5) * .04;
    bool useB = covered;
    if (covered && xn < edge) continue;                // this plate has not reached here yet
    float settle = useB ? 1. + 3.5 * sin(3.14159 * pk) * (1. - pk) : 1.;
    vec2 q = p + uOff[k] * settle;
    vec2 uv = q / res;
    vec3 sc = useB ? texture(uColB, uv).rgb : texture(uColA, uv).rgb;
    float c;
    if (k < 4) { vec4 cv = lutC(sc); c = k == 0 ? cv.r : k == 1 ? cv.g : k == 2 ? cv.b : cv.a; }
    else c = lutK(sc);
    float m = screen(q, uAng[k], c, uSeed + float(k) * 17.);
    if (k == 4) {
      float line = useB ? texture(uKeyB, uv).a : texture(uKeyA, uv).a;
      m = max(m, smoothstep(.26, .5, line));
    }
    // ink lies a touch uneven across the sheet; fresh ink is a little heavier behind the roller
    float dens = .93 + .09 * vnoise(q / 140. + float(k) * 5.3);
    if (useB && pk < 1.) dens += .12 * exp(-pow((xn - edge) / .02, 2.));
    col *= mix(vec3(1.), uInk[k] / uPaper, clamp(m * dens, 0., 1.));
  }
  // the new sheet's edge casts a small shadow onto the old print
  if (uTau > 0. && !covered && sheetEdge > -.02) col *= 1. - .16 * exp(-pow((sheetEdge - xn) * res.x / (18. * uCell / 7.), 2.));
  if (covered) col *= 1. + .012 * smoothstep(0., .02, xn - sheetEdge);
  frag = vec4(col / 255., 1.);
}`;

let LUT = null;
export function getLUT() { if (!LUT) LUT = buildLUT(26); return LUT; }

export class Printer {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2', { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: !!opts.preserve });
    if (!gl) throw new Error('WebGL2 is needed for the print');
    this.gl = gl;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
    this.pr = pr; gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'aPos'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    this.u = n => gl.getUniformLocation(pr, n);
    // the separation table, as two 3D textures
    const lut = getLUT();
    const tex3 = (unit, data, fmt, ifmt) => {
      const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_3D, t);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texImage3D(gl.TEXTURE_3D, 0, ifmt, lut.n, lut.n, lut.n, 0, fmt, gl.UNSIGNED_BYTE, data);
      for (const p of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_3D, p, gl.NEAREST);
      for (const p of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T, gl.TEXTURE_WRAP_R]) gl.texParameteri(gl.TEXTURE_3D, p, gl.CLAMP_TO_EDGE);
      return t;
    };
    tex3(4, lut.colour, gl.RGBA, gl.RGBA8); tex3(5, lut.key, gl.RED, gl.R8);
    gl.uniform1i(this.u('uLut'), 4); gl.uniform1i(this.u('uLutK'), 5); gl.uniform1f(this.u('uLutN'), lut.n);
    // the four artwork layers
    this.tex = [0, 1, 2, 3].map(unit => {
      const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
      for (const p of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D, p, gl.LINEAR);
      for (const p of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D, p, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([242, 236, 223, 255]));
      return t;
    });
    ['uColA', 'uKeyA', 'uColB', 'uKeyB'].forEach((n, i) => gl.uniform1i(this.u(n), i));
    // a 64 × 64 tileable value-noise texture (one lattice cell per texel, smooth between them)
    { const N = 64, d = new Uint8Array(N * N * 4), h = (x, y) => { let n = (x % N) * 374761393 + (y % N) * 668265263; n = (n ^ (n >>> 13)) * 1274126177; return ((n ^ (n >>> 16)) >>> 0) / 4294967295; };
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const v = h(x, y) * 255; d.set([v, v, v, 255], (y * N + x) * 4); }
      const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE6); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, N, N, 0, gl.RGBA, gl.UNSIGNED_BYTE, d);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.uniform1i(this.u('uNoise'), 6); }
    gl.uniform3fv(this.u('uPaper'), PAPER_RGB);
    gl.uniform3fv(this.u('uInk'), INK_RGB.flat());
    gl.uniform1fv(this.u('uAng'), INKS.map(i => i.angle * Math.PI / 180));
    gl.uniform1f(this.u('uSeed'), 3.7);
  }
  /** Upload a layer (0 colour A, 1 key A, 2 colour B, 3 key B) from a canvas. */
  layer(i, canvas, rect) {
    const gl = this.gl; gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, this.tex[i]);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    const size = this.sizes || (this.sizes = []);
    if (!rect || !size[i] || size[i][0] !== canvas.width || size[i][1] !== canvas.height) {
      gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, 0); gl.pixelStorei(gl.UNPACK_SKIP_ROWS, 0); gl.pixelStorei(gl.UNPACK_ROW_LENGTH, 0);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
      size[i] = [canvas.width, canvas.height];
      return;
    }
    // only the part that changed
    const [x, y, w, h] = rect;
    gl.pixelStorei(gl.UNPACK_ROW_LENGTH, canvas.width); gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, x); gl.pixelStorei(gl.UNPACK_SKIP_ROWS, y);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, w, h, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.pixelStorei(gl.UNPACK_ROW_LENGTH, 0); gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, 0); gl.pixelStorei(gl.UNPACK_SKIP_ROWS, 0);
  }
  /** Print at the canvas size. cssCell: dot pitch in CSS px; misreg: plate offsets in CSS px. */
  print({ tau = 0, dpr = 1, cssCell = 7, misreg = 1 }) {
    const gl = this.gl, w = this.canvas.width, h = this.canvas.height;
    gl.viewport(0, 0, w, h);
    gl.useProgram(this.pr);
    gl.uniform2f(this.u('uRes'), w, h);
    gl.uniform1f(this.u('uCell'), cssCell * dpr);
    gl.uniform1f(this.u('uTau'), tau);
    const off = [[.75, -.35], [-.55, .5], [.45, .65], [-.3, -.55], [0, 0]].map(([x, y]) => [x * misreg * dpr, y * misreg * dpr]);
    gl.uniform2fv(this.u('uOff'), off.flat());
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
