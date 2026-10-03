import { buildCover, composite, frameKey, releaseFields } from './kit.js';
import { loadCoverFonts } from './fonts.js';
import { coverLoaders } from './registry.js';

export async function loadCoverSpec(slug) {
  const spec = (await coverLoaders[slug]()).default;
  await loadCoverFonts(spec.fonts);
  return spec;
}

// Print a cover at width×height pixels. Returns a renderer for LivingCanvas:
// draw(t, full) repaints the living detail at time t; key(t) says when that is needed.
// Covers printed at the same size share their noise fields; they are freed shortly after the last build.
let releaseTimer = 0;
export async function printCover(slug, canvas, width, height) {
  const spec = await loadCoverSpec(slug);
  clearTimeout(releaseTimer);
  const printing = buildCover(spec, width, height);
  releaseTimer = setTimeout(releaseFields, 4000);
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  return {
    still: spec.still ?? 0,
    key: t => frameKey(spec, t),
    draw: (t, full) => composite(ctx, printing, t, full),
  };
}

