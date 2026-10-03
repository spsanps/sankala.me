// Typefaces drawn into the essay figures' canvases. Self-hosted Latin subsets in
// public/fonts/essays/ (see provenance.json); each essay loads only its own faces, on demand.
const FACES = {
  'ibm-plex-mono-500': ['IBM Plex Mono', '500'], 'ibm-plex-mono-600': ['IBM Plex Mono', '600'], 'ibm-plex-mono-700': ['IBM Plex Mono', '700'],
  'caveat-600': ['Caveat', '600'],
  'alfa-slab-one-400': ['Alfa Slab One', '400'], 'bowlby-one-sc-400': ['Bowlby One SC', '400'],
  'special-elite-400': ['Special Elite', '400'], 'unifrakturcook-700': ['UnifrakturCook', '700'],
  'rubik-mono-one-400': ['Rubik Mono One', '400'], 'playfair-display-sc-900': ['Playfair Display SC', '900'],
  'stardos-stencil-700': ['Stardos Stencil', '700'], 'permanent-marker-400': ['Permanent Marker', '400'],
  'shrikhand-400': ['Shrikhand', '400'], 'barlow-condensed-500': ['Barlow Condensed', '500'], 'barlow-condensed-700': ['Barlow Condensed', '700'],
  'rokkitt-500-700': ['Rokkitt', '500 700'],
};
const loading = new Map();

function loadFace(key) {
  if (!loading.has(key)) {
    const [family, weight] = FACES[key];
    const face = new FontFace(family, `url(/fonts/essays/${key}.woff2) format("woff2")`, { weight, style: 'normal' });
    loading.set(key, face.load().then(loaded => { document.fonts.add(loaded); }).catch(() => {}));
  }
  return loading.get(key);
}

// Resolves once the faces are ready, or after a few seconds so a slow font never blocks a figure.
export function loadEssayFonts(keys = []) {
  if (typeof document === 'undefined' || typeof FontFace === 'undefined' || !document.fonts) return Promise.resolve();
  return Promise.race([Promise.all(keys.map(loadFace)), new Promise(resolve => setTimeout(resolve, 5000))]);
}

// Review hooks for frozen frames use a fig- prefix (?fig-t=3&fig-page=2), so ordinary links can't trigger them.
export function figParams() {
  const out = new URLSearchParams();
  if (typeof location === 'undefined') return out;
  for (const [key, value] of new URLSearchParams(location.search)) if (key.startsWith('fig-')) out.set(key.slice(4), value);
  return out;
}
