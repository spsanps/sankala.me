// Typefaces used by the covers' lettering. They are self-hosted, subset to Latin
// (public/fonts/covers/, see provenance.json) and only loaded when a cover is printed live.
const FACES = {
  'archivo-400': ['Archivo', 400], 'archivo-600': ['Archivo', 600], 'archivo-800': ['Archivo', 800],
  'anton-400': ['Anton', 400],
  'abril-fatface-400': ['Abril Fatface', 400],
  'old-standard-tt-400': ['Old Standard TT', 400], 'old-standard-tt-700': ['Old Standard TT', 700],
  'jost-500': ['Jost', 500], 'jost-700': ['Jost', 700],
  'josefin-sans-600': ['Josefin Sans', 600], 'josefin-sans-700': ['Josefin Sans', 700],
  'michroma-400': ['Michroma', 400],
  'courier-prime-400': ['Courier Prime', 400], 'courier-prime-700': ['Courier Prime', 700],
  'shippori-mincho-800': ['Shippori Mincho', 800],
  'zen-maru-gothic-500': ['Zen Maru Gothic', 500], 'zen-maru-gothic-700': ['Zen Maru Gothic', 700],
};
const loading = new Map();

function loadFace(key) {
  if (!loading.has(key)) {
    const [family, weight] = FACES[key];
    const face = new FontFace(family, `url(/fonts/covers/${key}.woff2) format("woff2")`, { weight: String(weight), style: 'normal' });
    loading.set(key, face.load().then(loaded => { document.fonts.add(loaded); }).catch(() => {}));
  }
  return loading.get(key);
}

// Resolves once the faces are ready, or after a few seconds so a slow font never blocks a cover.
export function loadCoverFonts(keys = []) {
  if (typeof document === 'undefined' || typeof FontFace === 'undefined' || !document.fonts) return Promise.resolve();
  return Promise.race([Promise.all(keys.map(loadFace)), new Promise(resolve => setTimeout(resolve, 6000))]);
}
